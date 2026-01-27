<template>
  <div class="canvas-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      :style="{ cursor: getCursor }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel.prevent="handleWheel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

// Props
const props = defineProps({
  tool: String,
  color: String,
  lineWidth: Number
})

// Emits
const emit = defineEmits(['update:canUndo', 'update:canRedo', 'update:selectedShape'])

// Refs
const canvasRef = ref(null)
const containerRef = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)

// 图形对象列表
const shapes = ref([])
const selectedShapeId = ref(null)

// 绘制状态
const isDrawing = ref(false)
const isDragging = ref(false)
const startPoint = ref({ x: 0, y: 0 })
const currentPoint = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })

// 变换状态
const transform = ref({ x: 0, y: 0, scale: 1 })
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })

// 历史记录（存储图形列表快照）
const history = ref([])
const historyStep = ref(-1)

// Canvas上下文
let ctx = null
let shapeIdCounter = 0

// 计算鼠标样式
const getCursor = computed(() => {
  if (isPanning.value) return 'grabbing'
  if (props.tool === 'pan') return 'grab'
  if (props.tool === 'select') return selectedShapeId.value ? 'move' : 'default'
  return 'crosshair'
})

// 监听颜色变化，更新选中图形的颜色
watch(() => props.color, (newColor) => {
  if (selectedShapeId.value) {
    const shape = shapes.value.find(s => s.id === selectedShapeId.value)
    if (shape) {
      shape.color = newColor
      render()
      saveState()
    }
  }
})

// 监听线宽变化，更新选中图形的线宽
watch(() => props.lineWidth, (newWidth) => {
  if (selectedShapeId.value) {
    const shape = shapes.value.find(s => s.id === selectedShapeId.value)
    if (shape) {
      shape.lineWidth = newWidth
      render()
      saveState()
    }
  }
})

// 初始化
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  ctx = canvas.getContext('2d')
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  clearCanvas()
  saveState()
})

// 清空画布
const clearCanvas = () => {
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
}

// 渲染所有图形
const render = () => {
  if (!ctx) return
  clearCanvas()
  
  shapes.value.forEach(shape => {
    ctx.save()
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.lineWidth
    
    if (shape.type === 'path') {
      ctx.beginPath()
      shape.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    } else if (shape.type === 'rectangle') {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
    } else if (shape.type === 'circle') {
      ctx.beginPath()
      ctx.arc(shape.cx, shape.cy, shape.radius, 0, 2 * Math.PI)
      ctx.stroke()
    }
    
    // 绘制选中标记
    if (shape.id === selectedShapeId.value) {
      ctx.strokeStyle = '#007aff'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      const bounds = getShapeBounds(shape)
      ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10)
      ctx.setLineDash([])
    }
    
    ctx.restore()
  })
}

// 获取图形边界
const getShapeBounds = (shape) => {
  if (shape.type === 'rectangle') {
    return {
      x: Math.min(shape.x, shape.x + shape.width),
      y: Math.min(shape.y, shape.y + shape.height),
      width: Math.abs(shape.width),
      height: Math.abs(shape.height)
    }
  } else if (shape.type === 'circle') {
    return {
      x: shape.cx - shape.radius,
      y: shape.cy - shape.radius,
      width: shape.radius * 2,
      height: shape.radius * 2
    }
  } else if (shape.type === 'path') {
    const xs = shape.points.map(p => p.x)
    const ys = shape.points.map(p => p.y)
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    }
  }
  return { x: 0, y: 0, width: 0, height: 0 }
}

// 点击检测
const hitTest = (x, y) => {
  for (let i = shapes.value.length - 1; i >= 0; i--) {
    const shape = shapes.value[i]
    const bounds = getShapeBounds(shape)
    
    if (x >= bounds.x && x <= bounds.x + bounds.width &&
        y >= bounds.y && y <= bounds.y + bounds.height) {
      return shape.id
    }
  }
  return null
}

// 获取鼠标在画布上的坐标
const getCanvasPoint = (e) => {
  const mouseX = e.offsetX
  const mouseY = e.offsetY
  const x = (mouseX - transform.value.x) / transform.value.scale
  const y = (mouseY - transform.value.y) / transform.value.scale
  return { x, y }
}

// 鼠标按下
const handleMouseDown = (e) => {
  const point = getCanvasPoint(e)
  
  // 平移模式
  if (props.tool === 'pan' || e.button === 1 || e.shiftKey) {
    isPanning.value = true
    lastPanPoint.value = { x: e.clientX, y: e.clientY }
    e.preventDefault()
    return
  }
  
  // 选择工具
  if (props.tool === 'select') {
    const hitShapeId = hitTest(point.x, point.y)
    if (hitShapeId) {
      selectedShapeId.value = hitShapeId
      isDragging.value = true
      const shape = shapes.value.find(s => s.id === hitShapeId)
      const bounds = getShapeBounds(shape)
      dragOffset.value = {
        x: point.x - bounds.x,
        y: point.y - bounds.y
      }
    } else {
      selectedShapeId.value = null
    }
    render()
    return
  }
  
  // 绘制工具
  isDrawing.value = true
  startPoint.value = point
  currentPoint.value = point
  selectedShapeId.value = null
  
  if (props.tool === 'pen') {
    shapes.value.push({
      id: ++shapeIdCounter,
      type: 'path',
      points: [{ ...point }],
      color: props.color,
      lineWidth: props.lineWidth
    })
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
  
  const point = getCanvasPoint(e)
  currentPoint.value = point
  
  // 拖拽图形
  if (isDragging.value && selectedShapeId.value) {
    const shape = shapes.value.find(s => s.id === selectedShapeId.value)
    if (shape) {
      const newX = point.x - dragOffset.value.x
      const newY = point.y - dragOffset.value.y
      const bounds = getShapeBounds(shape)
      const dx = newX - bounds.x
      const dy = newY - bounds.y
      
      if (shape.type === 'rectangle') {
        shape.x += dx
        shape.y += dy
      } else if (shape.type === 'circle') {
        shape.cx += dx
        shape.cy += dy
      } else if (shape.type === 'path') {
        shape.points.forEach(p => {
          p.x += dx
          p.y += dy
        })
      }
      render()
    }
    return
  }
  
  if (!isDrawing.value) return
  
  if (props.tool === 'pen') {
    const currentShape = shapes.value[shapes.value.length - 1]
    currentShape.points.push({ ...point })
    render()
  } else if (props.tool === 'rectangle' || props.tool === 'circle') {
    render()
    drawPreview()
  }
}

// 鼠标释放
const handleMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }
  
  if (isDragging.value) {
    isDragging.value = false
    saveState()
    return
  }
  
  if (!isDrawing.value) return
  
  if (props.tool === 'rectangle') {
    shapes.value.push({
      id: ++shapeIdCounter,
      type: 'rectangle',
      x: startPoint.value.x,
      y: startPoint.value.y,
      width: currentPoint.value.x - startPoint.value.x,
      height: currentPoint.value.y - startPoint.value.y,
      color: props.color,
      lineWidth: props.lineWidth
    })
  } else if (props.tool === 'circle') {
    const radius = Math.sqrt(
      Math.pow(currentPoint.value.x - startPoint.value.x, 2) +
      Math.pow(currentPoint.value.y - startPoint.value.y, 2)
    )
    shapes.value.push({
      id: ++shapeIdCounter,
      type: 'circle',
      cx: startPoint.value.x,
      cy: startPoint.value.y,
      radius,
      color: props.color,
      lineWidth: props.lineWidth
    })
  }
  
  isDrawing.value = false
  render()
  saveState()
}

// 绘制预览
const drawPreview = () => {
  ctx.save()
  ctx.strokeStyle = props.color
  ctx.lineWidth = props.lineWidth
  
  if (props.tool === 'rectangle') {
    ctx.strokeRect(
      startPoint.value.x,
      startPoint.value.y,
      currentPoint.value.x - startPoint.value.x,
      currentPoint.value.y - startPoint.value.y
    )
  } else if (props.tool === 'circle') {
    const radius = Math.sqrt(
      Math.pow(currentPoint.value.x - startPoint.value.x, 2) +
      Math.pow(currentPoint.value.y - startPoint.value.y, 2)
    )
    ctx.beginPath()
    ctx.arc(startPoint.value.x, startPoint.value.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }
  
  ctx.restore()
}

// 鼠标滚轮缩放
const handleWheel = (e) => {
  const mouseX = e.offsetX
  const mouseY = e.offsetY
  const canvasX = (mouseX - transform.value.x) / transform.value.scale
  const canvasY = (mouseY - transform.value.y) / transform.value.scale
  
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.1, Math.min(5, transform.value.scale * delta))
  
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

// 保存状态
const saveState = () => {
  history.value = history.value.slice(0, historyStep.value + 1)
  history.value.push(JSON.parse(JSON.stringify(shapes.value)))
  historyStep.value++
  
  if (history.value.length > 50) {
    history.value.shift()
    historyStep.value--
  }
  
  emit('update:canUndo', historyStep.value > 0)
  emit('update:canRedo', historyStep.value < history.value.length - 1)
}

// 撤销
const undo = () => {
  if (historyStep.value > 0) {
    historyStep.value--
    shapes.value = JSON.parse(JSON.stringify(history.value[historyStep.value]))
    render()
    emit('update:canUndo', historyStep.value > 0)
    emit('update:canRedo', historyStep.value < history.value.length - 1)
  }
}

// 重做
const redo = () => {
  if (historyStep.value < history.value.length - 1) {
    historyStep.value++
    shapes.value = JSON.parse(JSON.stringify(history.value[historyStep.value]))
    render()
    emit('update:canUndo', historyStep.value > 0)
    emit('update:canRedo', historyStep.value < history.value.length - 1)
  }
}

// 清除画布
const clear = () => {
  shapes.value = []
  selectedShapeId.value = null
  render()
  saveState()
}

// 重置变换
const resetTransform = () => {
  transform.value.x = 0
  transform.value.y = 0
  transform.value.scale = 1
  applyTransform()
}

// 导出画布数据
const getData = () => {
  return {
    shapes: JSON.parse(JSON.stringify(shapes.value)),
    transform: { ...transform.value }
  }
}

// 加载画布数据
const loadData = (data) => {
  if (data && data.shapes) {
    shapes.value = JSON.parse(JSON.stringify(data.shapes))
    if (data.transform) {
      transform.value = { ...data.transform }
      applyTransform()
    }
    render()
    saveState()
  }
}

defineExpose({
  undo,
  redo,
  clear,
  resetTransform,
  getData,
  loadData
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
