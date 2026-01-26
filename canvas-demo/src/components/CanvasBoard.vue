<template>
  <div class="canvas-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      :style="{ cursor: isPanning ? 'grabbing' : cursorStyle }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel.prevent="handleWheel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Props
const props = defineProps({
  tool: {
    type: String,
    default: 'pen'
  },
  color: {
    type: String,
    default: '#000000'
  },
  lineWidth: {
    type: Number,
    default: 2
  }
})

// Emits
const emit = defineEmits(['update:canUndo', 'update:canRedo'])

// 根据工具类型计算鼠标样式
const cursorStyle = computed(() => {
  if (props.tool === 'pan') return 'grab'
  return 'crosshair'
})

// Refs
const canvasRef = ref(null)
const containerRef = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)

// 绘制状态
const isDrawing = ref(false)
const startPoint = ref({ x: 0, y: 0 })
const currentPoint = ref({ x: 0, y: 0 })

// 变换状态
const transform = ref({
  x: 0,
  y: 0,
  scale: 1
})
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })

// 历史记录
const history = ref([])
const historyStep = ref(-1)

// Canvas上下文
let ctx = null

// 初始化
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  ctx = canvas.getContext('2d')
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // 保存初始状态
  saveState()
  
  // 设置初始背景
  clearCanvas()
})

// 清空画布
const clearCanvas = () => {
  if (!ctx) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  ctx.restore()
}

// 获取鼠标在画布上的坐标
const getCanvasPoint = (e) => {
  // 使用 offsetX/Y 获取相对于 canvas 元素的坐标（不受 CSS transform 影响）
  const mouseX = e.offsetX
  const mouseY = e.offsetY
  
  // 转换为画布内部坐标系（考虑缩放和平移）
  const x = (mouseX - transform.value.x) / transform.value.scale
  const y = (mouseY - transform.value.y) / transform.value.scale
  
  return { x, y }
}

// 鼠标按下
const handleMouseDown = (e) => {
  const point = getCanvasPoint(e)
  
  // 平移模式：使用平移工具、中键、或Shift键
  if (props.tool === 'pan' || e.button === 1 || e.shiftKey) {
    isPanning.value = true
    lastPanPoint.value = { x: e.clientX, y: e.clientY }
    e.preventDefault()
    return
  }
  
  isDrawing.value = true
  startPoint.value = point
  currentPoint.value = point
  
  if (props.tool === 'pen') {
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }
}

// 鼠标移动
const handleMouseMove = (e) => {
  if (isPanning.value) {
    const dx = e.clientX - lastPanPoint.value.x
    const dy = e.clientY - lastPanPoint.value.y
    transform.value.x += dx
    transform.value.y += dy
    lastPanPoint.value = { x: e.clientX, y: e.clientY }
    applyTransform()
    return
  }
  
  if (!isDrawing.value) return
  
  const point = getCanvasPoint(e)
  currentPoint.value = point
  
  if (props.tool === 'pen') {
    drawLine(point)
  } else if (props.tool === 'rectangle' || props.tool === 'circle') {
    redrawCanvas()
    drawShape()
  }
}

// 鼠标释放
const handleMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }
  
  if (!isDrawing.value) return
  
  if (props.tool === 'rectangle' || props.tool === 'circle') {
    drawShape()
  }
  
  isDrawing.value = false
  saveState()
}

// 鼠标滚轮缩放
const handleWheel = (e) => {
  // 使用 offsetX/Y，不受浏览器缩放影响
  const mouseX = e.offsetX
  const mouseY = e.offsetY
  
  // 鼠标在画布上的位置（画布坐标系，变换前）
  const canvasX = (mouseX - transform.value.x) / transform.value.scale
  const canvasY = (mouseY - transform.value.y) / transform.value.scale
  
  // 计算新的缩放比例
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.1, Math.min(5, transform.value.scale * delta))
  
  // 重新计算偏移，使鼠标位置对应的画布点保持不变
  const newX = mouseX - canvasX * newScale
  const newY = mouseY - canvasY * newScale
  
  transform.value.x = newX
  transform.value.y = newY
  transform.value.scale = newScale
  
  applyTransform()
}

// 应用变换
const applyTransform = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.style.transform = `translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.scale})`
}

// 绘制线条
const drawLine = (point) => {
  if (!ctx) return
  ctx.strokeStyle = props.color
  ctx.lineWidth = props.lineWidth
  ctx.lineTo(point.x, point.y)
  ctx.stroke()
}

// 绘制形状
const drawShape = () => {
  if (!ctx) return
  ctx.strokeStyle = props.color
  ctx.lineWidth = props.lineWidth
  
  const startX = startPoint.value.x
  const startY = startPoint.value.y
  const endX = currentPoint.value.x
  const endY = currentPoint.value.y
  
  if (props.tool === 'rectangle') {
    const width = endX - startX
    const height = endY - startY
    ctx.strokeRect(startX, startY, width, height)
  } else if (props.tool === 'circle') {
    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
    ctx.beginPath()
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }
}

// 重绘画布（用于实时预览）
const redrawCanvas = () => {
  if (historyStep.value >= 0) {
    const imageData = history.value[historyStep.value]
    ctx.putImageData(imageData, 0, 0)
  }
}

// 保存状态
const saveState = () => {
  if (!ctx) return
  
  // 删除当前步骤之后的历史
  history.value = history.value.slice(0, historyStep.value + 1)
  
  // 保存当前状态
  const imageData = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
  history.value.push(imageData)
  historyStep.value++
  
  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value.shift()
    historyStep.value--
  }
  
  updateUndoRedoState()
}

// 撤销
const undo = () => {
  if (historyStep.value > 0) {
    historyStep.value--
    const imageData = history.value[historyStep.value]
    ctx.putImageData(imageData, 0, 0)
    updateUndoRedoState()
  }
}

// 重做
const redo = () => {
  if (historyStep.value < history.value.length - 1) {
    historyStep.value++
    const imageData = history.value[historyStep.value]
    ctx.putImageData(imageData, 0, 0)
    updateUndoRedoState()
  }
}

// 更新撤销重做状态
const updateUndoRedoState = () => {
  emit('update:canUndo', historyStep.value > 0)
  emit('update:canRedo', historyStep.value < history.value.length - 1)
}

// 清除画布
const clear = () => {
  clearCanvas()
  saveState()
}

// 重置变换
const resetTransform = () => {
  transform.value.x = 0
  transform.value.y = 0
  transform.value.scale = 1
  applyTransform()
}

// 导出方法
defineExpose({
  undo,
  redo,
  clear,
  resetTransform
})
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
}

canvas {
  border: 1px solid #ddd;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform-origin: 0 0;
  transition: none;
}

canvas:active {
  cursor: inherit;
}
</style>
