<template>
  <div class="flowchart-editor">
    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="goHome">
          ← 返回主页
        </button>
        <div class="header-main">
          <h1>📈 流程图编辑器</h1>
          <p>流程设计和建模，支持多种形状和连接方式</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="addShape('process')">
          ➕ 流程框
        </button>
        <button class="action-btn" @click="addShape('decision')">
          ➕ 判断框
        </button>
        <button class="action-btn" @click="saveFlowchart">
          💾 保存
        </button>
        <button class="action-btn" @click="exportAsSVG">
          📤 导出SVG
        </button>
        <button class="action-btn" @click="clearCanvas">
          🧹 清空
        </button>
      </div>
    </header>
    
    <div class="editor-content">
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>形状工具</h3>
          <div class="shape-tools">
            <div class="shape-tool" @click="addShape('process')">
              <svg width="40" height="30" viewBox="0 0 40 30">
                <rect x="2" y="2" width="36" height="26" rx="4" ry="4" fill="#3498db" stroke="#2980b9" stroke-width="2"/>
                <text x="20" y="20" text-anchor="middle" fill="white" font-size="10">流程</text>
              </svg>
              <span>流程框</span>
            </div>
            
            <div class="shape-tool" @click="addShape('decision')">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <polygon points="20,2 38,20 20,38 2,20" fill="#e74c3c" stroke="#c0392b" stroke-width="2"/>
                <text x="20" y="24" text-anchor="middle" fill="white" font-size="10">判断</text>
              </svg>
              <span>判断框</span>
            </div>
            
            <div class="shape-tool" @click="addShape('start')">
              <svg width="40" height="25" viewBox="0 0 40 25">
                <ellipse cx="20" cy="12.5" rx="18" ry="10" fill="#27ae60" stroke="#229954" stroke-width="2"/>
                <text x="20" y="16" text-anchor="middle" fill="white" font-size="10">开始</text>
              </svg>
              <span>开始/结束</span>
            </div>
            
            <div class="shape-tool" @click="addShape('input')">
              <svg width="40" height="30" viewBox="0 0 40 30">
                <path d="M2,2 L38,8 L38,22 L2,28 Z" fill="#f39c12" stroke="#d35400" stroke-width="2"/>
                <text x="20" y="20" text-anchor="middle" fill="white" font-size="10">输入</text>
              </svg>
              <span>输入/输出</span>
            </div>
            
            <div class="shape-tool" @click="addShape('connector')">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="#95a5a6" stroke="#7f8c8d" stroke-width="2"/>
                <text x="20" y="24" text-anchor="middle" fill="white" font-size="10">连接</text>
              </svg>
              <span>连接点</span>
            </div>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>连接工具</h3>
          <div class="tool-group">
            <button class="tool-btn" @click="startConnection" :class="{ 'active': isConnecting }">
              🔗 开始连接
            </button>
            <button class="tool-btn" @click="cancelConnection">
              ❌ 取消
            </button>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>样式设置</h3>
          <div class="style-group">
            <label>连接线颜色</label>
            <input type="color" v-model="lineColor" @change="updateLineStyle" />
          </div>
          <div class="style-group">
            <label>连接线宽度</label>
            <input type="range" v-model="lineWidth" min="1" max="5" @change="updateLineStyle" />
            <span>{{ lineWidth }}px</span>
          </div>
          <div class="style-group">
            <label>字体大小</label>
            <input type="range" v-model="fontSize" min="10" max="20" @change="updateFontSize" />
            <span>{{ fontSize }}px</span>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>快捷操作</h3>
          <div class="quick-actions">
            <button class="quick-btn" @click="zoomIn">🔍 放大</button>
            <button class="quick-btn" @click="zoomOut">🔎 缩小</button>
            <button class="quick-btn" @click="fitToScreen">🔲 适应屏幕</button>
            <button class="quick-btn" @click="selectAll">✓ 全选</button>
          </div>
        </div>
      </div>
      
      <div class="canvas-area" ref="canvasArea">
        <svg ref="svg" class="flowchart-svg" @mousedown="startPan" @wheel="handleWheel">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#666" />
            </marker>
            <marker id="circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
              <circle cx="4" cy="4" r="3" fill="#666" />
            </marker>
          </defs>
          
          <!-- 连接线 -->
          <g class="connections">
            <path 
              v-for="connection in connections" 
              :key="connection.id"
              :d="getConnectionPath(connection)"
              :stroke="lineColor"
              :stroke-width="lineWidth"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
              marker-end="url(#arrow)"
              @click="selectConnection(connection)"
              :class="{ 'selected': connection.selected }"
            />
            
            <!-- 连接线标签 -->
            <text 
              v-for="connection in connections" 
              :key="connection.id"
              :x="getConnectionLabelX(connection)"
              :y="getConnectionLabelY(connection)"
              :font-size="fontSize"
              text-anchor="middle"
              fill="#333"
              @click="editConnectionLabel(connection)"
            >
              {{ connection.label || '流程' }}
            </text>
          </g>
          
          <!-- 图形 -->
          <g class="shapes">
            <g 
              v-for="shape in shapes" 
              :key="shape.id"
              :class="{ 'selected': shape.selected }"
              :transform="`translate(${shape.x}, ${shape.y})`"
              @mousedown="selectShape(shape)"
              @dblclick="editShapeText(shape)"
            >
              <!-- 不同类型的形状 -->
              <rect 
                v-if="shape.type === 'process'"
                :width="shape.width" 
                :height="shape.height" 
                :rx="4" 
                :ry="4"
                :fill="shape.color" 
                :stroke="shape.selected ? '#3498db' : '#2980b9'"
                :stroke-width="shape.selected ? 3 : 2"
              />
              
              <polygon 
                v-else-if="shape.type === 'decision'"
                :points="getDecisionPoints(shape.width, shape.height)"
                :fill="shape.color" 
                :stroke="shape.selected ? '#3498db' : '#c0392b'"
                :stroke-width="shape.selected ? 3 : 2"
              />
              
              <ellipse 
                v-else-if="shape.type === 'start'"
                :cx="shape.width / 2" 
                :cy="shape.height / 2"
                :rx="shape.width / 2" 
                :ry="shape.height / 2"
                :fill="shape.color" 
                :stroke="shape.selected ? '#3498db' : '#229954'"
                :stroke-width="shape.selected ? 3 : 2"
              />
              
              <path 
                v-else-if="shape.type === 'input'"
                :d="getInputPath(shape.width, shape.height)"
                :fill="shape.color" 
                :stroke="shape.selected ? '#3498db' : '#d35400'"
                :stroke-width="shape.selected ? 3 : 2"
              />
              
              <circle 
                v-else-if="shape.type === 'connector'"
                :cx="shape.width / 2" 
                :cy="shape.height / 2"
                :r="shape.width / 2"
                :fill="shape.color" 
                :stroke="shape.selected ? '#3498db' : '#7f8c8d'"
                :stroke-width="shape.selected ? 3 : 2"
              />
              
              <!-- 文字 -->
              <text 
                :x="shape.width / 2" 
                :y="shape.height / 2" 
                :font-size="fontSize"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#fff"
              >
                {{ shape.text }}
              </text>
              
              <!-- 选择框 -->
              <rect 
                v-if="shape.selected"
                :x="-2" 
                :y="-2" 
                :width="shape.width + 4" 
                :height="shape.height + 4"
                :rx="shape.type === 'decision' ? 0 : 6"
                fill="none"
                stroke="#3498db"
                stroke-width="2"
                stroke-dasharray="4"
              />
            </g>
          </g>
          
          <!-- 临时连接线 -->
          <path 
            v-if="tempConnection"
            :d="getTempConnectionPath()"
            :stroke="lineColor"
            :stroke-width="lineWidth"
            stroke-dasharray="5,5"
            fill="none"
            marker-end="url(#arrow)"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

// 画布状态
const canvasArea = ref(null)
const svg = ref(null)
const shapes = ref([])
const connections = ref([])
const selectedShape = ref(null)
const selectedConnection = ref(null)
const nextShapeId = ref(1)
const nextConnectionId = ref(1)

// 连接状态
const isConnecting = ref(false)
const connectingFrom = ref(null)
const tempConnection = ref(null)

// 视图变换
const transform = reactive({
  x: 100,
  y: 100,
  scale: 1
})

// 样式设置
const lineColor = ref('#666')
const lineWidth = ref(2)
const fontSize = ref(14)

// 初始化流程图
const initFlowchart = () => {
  const startShape = {
    id: nextShapeId.value++,
    type: 'start',
    text: '开始',
    x: 100,
    y: 100,
    width: 100,
    height: 60,
    color: '#27ae60',
    selected: false
  }
  
  const processShape = {
    id: nextShapeId.value++,
    type: 'process',
    text: '处理数据',
    x: 300,
    y: 80,
    width: 120,
    height: 80,
    color: '#3498db',
    selected: false
  }
  
  const decisionShape = {
    id: nextShapeId.value++,
    type: 'decision',
    text: '判断',
    x: 500,
    y: 80,
    width: 100,
    height: 100,
    color: '#e74c3c',
    selected: false
  }
  
  shapes.value = [startShape, processShape, decisionShape]
  
  // 创建连接
  addConnection(startShape, processShape, '开始处理')
  addConnection(processShape, decisionShape, '处理完成')
}

// 形状操作
const addShape = (type) => {
  const colors = {
    process: '#3498db',
    decision: '#e74c3c',
    start: '#27ae60',
    input: '#f39c12',
    connector: '#95a5a6'
  }
  
  const texts = {
    process: '流程',
    decision: '判断',
    start: '开始/结束',
    input: '输入/输出',
    connector: '连接点'
  }
  
  const shape = {
    id: nextShapeId.value++,
    type: type,
    text: texts[type],
    x: transform.x + 50,
    y: transform.y + 50,
    width: type === 'decision' ? 100 : 120,
    height: type === 'decision' ? 100 : 80,
    color: colors[type],
    selected: false
  }
  
  shapes.value.push(shape)
}

const selectShape = (shape) => {
  // 清除之前的选中状态
  shapes.value.forEach(s => s.selected = false)
  connections.value.forEach(c => c.selected = false)
  
  if (selectedShape.value === shape) {
    selectedShape.value = null
  } else {
    shape.selected = true
    selectedShape.value = shape
    selectedConnection.value = null
  }
}

const editShapeText = (shape) => {
  const newText = prompt('编辑文本:', shape.text)
  if (newText !== null) {
    shape.text = newText
  }
}

// 连接操作
const startConnection = () => {
  if (selectedShape.value) {
    isConnecting.value = true
    connectingFrom.value = selectedShape.value
  }
}

const cancelConnection = () => {
  isConnecting.value = false
  connectingFrom.value = null
  tempConnection.value = null
}

const addConnection = (from, to, label = '') => {
  const connection = {
    id: nextConnectionId.value++,
    from: from.id,
    to: to.id,
    label: label,
    selected: false
  }
  connections.value.push(connection)
}

const selectConnection = (connection) => {
  shapes.value.forEach(s => s.selected = false)
  connections.value.forEach(c => c.selected = false)
  
  if (selectedConnection.value === connection) {
    selectedConnection.value = null
  } else {
    connection.selected = true
    selectedConnection.value = connection
    selectedShape.value = null
  }
}

const editConnectionLabel = (connection) => {
  const newLabel = prompt('编辑连接标签:', connection.label || '')
  if (newLabel !== null) {
    connection.label = newLabel || '流程'
  }
}

// 计算连接线路径
const getConnectionPath = (connection) => {
  const fromShape = shapes.value.find(s => s.id === connection.from)
  const toShape = shapes.value.find(s => s.id === connection.to)
  
  if (!fromShape || !toShape) return ''
  
  const fromX = fromShape.x + fromShape.width / 2
  const fromY = fromShape.y + fromShape.height / 2
  const toX = toShape.x + toShape.width / 2
  const toY = toShape.y + toShape.height / 2
  
  // 计算贝塞尔曲线
  const dx = Math.abs(toX - fromX)
  const dy = Math.abs(toY - fromY)
  const cx1 = fromX + dx * 0.5
  const cy1 = fromY
  const cx2 = toX - dx * 0.5
  const cy2 = toY
  
  return `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`
}

const getConnectionLabelX = (connection) => {
  const fromShape = shapes.value.find(s => s.id === connection.from)
  const toShape = shapes.value.find(s => s.id === connection.to)
  
  if (!fromShape || !toShape) return 0
  
  const fromX = fromShape.x + fromShape.width / 2
  const toX = toShape.x + toShape.width / 2
  
  return (fromX + toX) / 2
}

const getConnectionLabelY = (connection) => {
  const fromShape = shapes.value.find(s => s.id === connection.from)
  const toShape = shapes.value.find(s => s.id === connection.to)
  
  if (!fromShape || !toShape) return 0
  
  const fromY = fromShape.y + fromShape.height / 2
  const toY = toShape.y + toShape.height / 2
  
  return (fromY + toY) / 2
}

const getTempConnectionPath = () => {
  if (!connectingFrom.value || !tempConnection.value) return ''
  
  const fromShape = connectingFrom.value
  const fromX = fromShape.x + fromShape.width / 2
  const fromY = fromShape.y + fromShape.height / 2
  const toX = tempConnection.value.x
  const toY = tempConnection.value.y
  
  const dx = Math.abs(toX - fromX)
  const cx1 = fromX + dx * 0.5
  const cy1 = fromY
  const cx2 = toX - dx * 0.5
  const cy2 = toY
  
  return `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`
}

const getDecisionPoints = (width, height) => {
  const cx = width / 2
  const cy = height / 2
  const rx = width / 2 - 2
  const ry = height / 2 - 2
  
  return `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`
}

const getInputPath = (width, height) => {
  const left = 2
  const right = width - 2
  const top = 2
  const bottom = height - 2
  const indent = width * 0.2
  
  return `M ${left},${top} L ${right - indent},${top} L ${right},${(top + bottom) / 2} L ${right - indent},${bottom} L ${left},${bottom} Z`
}

// 视图操作
const startPan = (e) => {
  if (e.button !== 0) return
  
  const startX = e.clientX
  const startY = e.clientY
  const startTransformX = transform.x
  const startTransformY = transform.y
  
  const handleMouseMove = (moveEvent) => {
    const dx = moveEvent.clientX - startX
    const dy = moveEvent.clientY - startY
    
    transform.x = startTransformX + dx
    transform.y = startTransformY + dy
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleWheel = (e) => {
  e.preventDefault()
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.1, Math.min(3, transform.scale * zoomFactor))
  
  transform.scale = newScale
}

const zoomIn = () => {
  transform.scale = Math.min(3, transform.scale * 1.2)
}

const zoomOut = () => {
  transform.scale = Math.max(0.1, transform.scale * 0.8)
}

const fitToScreen = () => {
  transform.scale = 1
  transform.x = 100
  transform.y = 100
}

const selectAll = () => {
  shapes.value.forEach(shape => shape.selected = true)
}

const clearCanvas = () => {
  if (confirm('确定要清空画布吗？')) {
    shapes.value = []
    connections.value = []
    selectedShape.value = null
    selectedConnection.value = null
  }
}

// 样式更新
const updateLineStyle = () => {
  // 样式已通过响应式更新
}

const updateFontSize = () => {
  // 样式已通过响应式更新
}

// 数据持久化
const saveFlowchart = () => {
  const data = {
    shapes: shapes.value,
    connections: connections.value,
    transform: transform,
    nextShapeId: nextShapeId.value,
    nextConnectionId: nextConnectionId.value,
    styles: {
      lineColor: lineColor.value,
      lineWidth: lineWidth.value,
      fontSize: fontSize.value
    }
  }
  localStorage.setItem('flowchart-data', JSON.stringify(data))
  alert('流程图已保存！')
}

const exportAsSVG = () => {
  alert('SVG导出功能正在开发中...')
}

// 生命周期
onMounted(() => {
  const savedData = localStorage.getItem('flowchart-data')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      shapes.value = data.shapes || []
      connections.value = data.connections || []
      Object.assign(transform, data.transform || transform)
      nextShapeId.value = data.nextShapeId || nextShapeId.value
      nextConnectionId.value = data.nextConnectionId || nextConnectionId.value
      
      if (data.styles) {
        lineColor.value = data.styles.lineColor
        lineWidth.value = data.styles.lineWidth
        fontSize.value = data.styles.fontSize
      }
    } catch (error) {
      console.error('Failed to load saved flowchart data:', error)
      initFlowchart()
    }
  } else {
    initFlowchart()
  }
  
  // 监听鼠标移动，更新临时连接线
  document.addEventListener('mousemove', (e) => {
    if (isConnecting.value && connectingFrom.value) {
      const rect = svg.value.getBoundingClientRect()
      tempConnection.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  })
  
  // 监听鼠标点击，完成连接
  document.addEventListener('mouseup', (e) => {
    if (isConnecting.value && connectingFrom.value && tempConnection.value) {
      // 查找点击的形状
      const targetShape = shapes.value.find(shape => {
        const rect = svg.value.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        return mouseX >= shape.x && mouseX <= shape.x + shape.width &&
               mouseY >= shape.y && mouseY <= shape.y + shape.height
      })
      
      if (targetShape && targetShape.id !== connectingFrom.value.id) {
        addConnection(connectingFrom.value, targetShape, '流程')
      }
      
      cancelConnection()
    }
  })
})

onUnmounted(() => {
  saveFlowchart()
})

// 监听数据变化
watch([shapes, connections], () => {
  // 数据变化时自动保存
}, { deep: true })
</script>

<style scoped>
.flowchart-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.editor-header {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  color: white;
  padding: 15px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-main h1 {
  font-size: 24px;
  margin-bottom: 5px;
}

.header-main p {
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 25px;
}

.sidebar-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
}

.shape-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.shape-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
}

.shape-tool:hover {
  background: #f8f9fa;
}

.shape-tool span {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.tool-group {
  display: flex;
  gap: 10px;
}

.tool-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e9ecef;
}

.tool-btn.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}

.style-group {
  margin-bottom: 15px;
}

.style-group label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.style-group input[type="color"] {
  width: 100%;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.style-group input[type="range"] {
  width: 100%;
  cursor: pointer;
}

.style-group select {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.quick-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #e9ecef;
}

.canvas-area {
  flex: 1;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
  cursor: grab;
}

.canvas-area:active {
  cursor: grabbing;
}

.flowchart-svg {
  width: 100%;
  height: 100%;
  background: white;
  display: block;
}

.shapes g.selected {
  filter: drop-shadow(0 0 4px rgba(52, 152, 219, 0.5));
}

.connections path.selected {
  stroke: #3498db;
  stroke-width: 4px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .canvas-area {
    height: calc(100vh - 200px);
  }
  
  .shape-tools {
    grid-template-columns: 1fr;
  }
}
</style>
