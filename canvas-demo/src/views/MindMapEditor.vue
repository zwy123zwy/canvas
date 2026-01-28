<template>
  <div class="mind-map-editor">
    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="goHome">
          ← 返回主页
        </button>
        <div class="header-main">
          <h1>🔗 思维导图</h1>
          <p>可视化思维整理，支持节点创建、连接、样式设置</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="addNode">
          ➕ 添加节点
        </button>
        <button class="action-btn" @click="saveMindMap">
          💾 保存
        </button>
        <button class="action-btn" @click="exportAsPNG">
          📤 导出PNG
        </button>
        <button class="action-btn" @click="resetView">
          🔄 重置视图
        </button>
      </div>
    </header>
    
    <div class="editor-content">
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>节点工具</h3>
          <div class="tool-group">
            <button class="tool-btn" @click="addRootNode" title="添加根节点">
              🌟 根节点
            </button>
            <button class="tool-btn" @click="addBranchNode" title="添加分支节点">
              🌿 分支
            </button>
            <button class="tool-btn" @click="deleteSelectedNode" title="删除节点">
              🗑️ 删除
            </button>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>样式设置</h3>
          <div class="style-group">
            <label>节点颜色</label>
            <input type="color" v-model="nodeColor" @change="updateNodeStyle" />
          </div>
          <div class="style-group">
            <label>字体大小</label>
            <input type="range" v-model="fontSize" min="10" max="24" @change="updateNodeStyle" />
            <span>{{ fontSize }}px</span>
          </div>
          <div class="style-group">
            <label>连接线样式</label>
            <select v-model="lineStyle" @change="updateLineStyle">
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
            </select>
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
        <svg ref="svg" class="mind-map-svg" @wheel="handleWheel" @mousedown="startPan">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#666" />
            </marker>
          </defs>
          
          <!-- 连接线 -->
          <g class="connections">
            <line 
              v-for="connection in connections" 
              :key="connection.id"
              :x1="connection.x1" 
              :y1="connection.y1" 
              :x2="connection.x2" 
              :y2="connection.y2"
              :stroke="lineColor"
              :stroke-width="lineWidth"
              :stroke-dasharray="lineStyle === 'dashed' ? '5,5' : lineStyle === 'dotted' ? '2,4' : 'none'"
              marker-end="url(#arrow)"
            />
          </g>
          
          <!-- 节点 -->
          <g class="nodes">
            <g 
              v-for="node in nodes" 
              :key="node.id"
              :class="{ 'selected': node.selected }"
              :transform="`translate(${node.x}, ${node.y})`"
              @mousedown="selectNode(node)"
            >
              <!-- 节点背景 -->
              <rect 
                :width="node.width" 
                :height="node.height" 
                :rx="node.radius" 
                :ry="node.radius"
                :fill="node.color" 
                :stroke="node.selected ? '#3498db' : '#ddd'"
                :stroke-width="node.selected ? 2 : 1"
              />
              
              <!-- 节点文字 -->
              <text 
                :x="node.width / 2" 
                :y="node.height / 2" 
                :font-size="node.fontSize"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#333"
              >
                {{ node.text }}
              </text>
              
              <!-- 选择框 -->
              <rect 
                v-if="node.selected"
                :x="-2" 
                :y="-2" 
                :width="node.width + 4" 
                :height="node.height + 4"
                :rx="node.radius" 
                :ry="node.radius"
                fill="none"
                stroke="#3498db"
                stroke-width="2"
                stroke-dasharray="4"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

// 画布状态
const canvasArea = ref(null)
const svg = ref(null)
const nodes = ref([])
const connections = ref([])
const selectedNode = ref(null)
const nextNodeId = ref(1)

// 视图变换
const transform = reactive({
  x: 400,
  y: 300,
  scale: 1
})

// 样式设置
const nodeColor = ref('#e3f2fd')
const fontSize = ref(14)
const lineStyle = ref('solid')
const lineColor = ref('#666')
const lineWidth = ref(2)

// 初始化思维导图
const initMindMap = () => {
  // 创建中心根节点
  const rootNode = {
    id: nextNodeId.value++,
    text: '思维导图',
    x: 400,
    y: 300,
    width: 120,
    height: 40,
    radius: 8,
    color: nodeColor.value,
    fontSize: parseInt(fontSize.value),
    selected: false
  }
  
  nodes.value = [rootNode]
  connections.value = []
  
  // 添加几个示例分支
  addBranchNode(rootNode)
  addBranchNode(rootNode)
  addBranchNode(rootNode)
}

// 节点操作
const addNode = () => {
  const node = {
    id: nextNodeId.value++,
    text: `节点 ${nextNodeId.value}`,
    x: transform.x + 100,
    y: transform.y + 100,
    width: 100,
    height: 30,
    radius: 6,
    color: nodeColor.value,
    fontSize: parseInt(fontSize.value),
    selected: false
  }
  nodes.value.push(node)
}

const addRootNode = () => {
  const node = {
    id: nextNodeId.value++,
    text: '新根节点',
    x: 200 + Math.random() * 400,
    y: 100 + Math.random() * 400,
    width: 120,
    height: 40,
    radius: 8,
    color: nodeColor.value,
    fontSize: parseInt(fontSize.value),
    selected: false
  }
  nodes.value.push(node)
}

const addBranchNode = (parent) => {
  const node = {
    id: nextNodeId.value++,
    text: `分支 ${nextNodeId.value}`,
    x: parent.x + 150,
    y: parent.y - 50 + (Math.random() - 0.5) * 200,
    width: 100,
    height: 30,
    radius: 6,
    color: nodeColor.value,
    fontSize: parseInt(fontSize.value),
    selected: false
  }
  nodes.value.push(node)
  
  // 创建连接
  const connection = {
    id: `conn_${parent.id}_${node.id}`,
    from: parent.id,
    to: node.id,
    x1: parent.x + parent.width,
    y1: parent.y + parent.height / 2,
    x2: node.x,
    y2: node.y + node.height / 2
  }
  connections.value.push(connection)
}

const deleteSelectedNode = () => {
  if (!selectedNode.value) return
  
  const nodeId = selectedNode.value.id
  
  // 删除节点
  nodes.value = nodes.value.filter(n => n.id !== nodeId)
  
  // 删除相关连接
  connections.value = connections.value.filter(c => 
    c.from !== nodeId && c.to !== nodeId
  )
  
  selectedNode.value = null
}

const selectNode = (node) => {
  // 清除之前的选中状态
  nodes.value.forEach(n => n.selected = false)
  
  // 选中当前节点
  node.selected = true
  selectedNode.value = node
}

// 样式更新
const updateNodeStyle = () => {
  nodes.value.forEach(node => {
    node.color = nodeColor.value
    node.fontSize = parseInt(fontSize.value)
  })
}

const updateLineStyle = () => {
  // 样式已通过响应式更新
}

// 视图操作
const startPan = (e) => {
  if (e.button !== 0) return // 只响应左键
  
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
  
  // 计算鼠标相对于画布的位置
  const rect = svg.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  // 更新缩放和位置
  const scaleDiff = newScale - transform.scale
  transform.x -= mouseX * scaleDiff
  transform.y -= mouseY * scaleDiff
  transform.scale = newScale
}

const zoomIn = () => {
  transform.scale = Math.min(3, transform.scale * 1.2)
}

const zoomOut = () => {
  transform.scale = Math.max(0.1, transform.scale * 0.8)
}

const fitToScreen = () => {
  // 简单的适应屏幕逻辑
  transform.scale = 1
  transform.x = 400
  transform.y = 300
}

const selectAll = () => {
  nodes.value.forEach(node => node.selected = true)
}

// 数据持久化
const saveMindMap = () => {
  const data = {
    nodes: nodes.value,
    connections: connections.value,
    transform: transform,
    nextNodeId: nextNodeId.value,
    styles: {
      nodeColor: nodeColor.value,
      fontSize: fontSize.value,
      lineStyle: lineStyle.value,
      lineColor: lineColor.value,
      lineWidth: lineWidth.value
    }
  }
  localStorage.setItem('mind-map-data', JSON.stringify(data))
  alert('思维导图已保存！')
}

// 导出功能
const exportAsPNG = () => {
  alert('PNG导出功能正在开发中...')
}

// 生命周期
onMounted(() => {
  const savedData = localStorage.getItem('mind-map-data')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      nodes.value = data.nodes || []
      connections.value = data.connections || []
      Object.assign(transform, data.transform || transform)
      nextNodeId.value = data.nextNodeId || nextNodeId.value
      
      // 恢复样式
      if (data.styles) {
        nodeColor.value = data.styles.nodeColor
        fontSize.value = data.styles.fontSize
        lineStyle.value = data.styles.lineStyle
        lineColor.value = data.styles.lineColor
        lineWidth.value = data.styles.lineWidth
      }
    } catch (error) {
      console.error('Failed to load saved mind map data:', error)
      initMindMap()
    }
  } else {
    initMindMap()
  }
})

onUnmounted(() => {
  saveMindMap()
})

// 监听数据变化
watch([nodes, connections], () => {
  // 更新连接线位置
  connections.value.forEach(conn => {
    const fromNode = nodes.value.find(n => n.id === conn.from)
    const toNode = nodes.value.find(n => n.id === conn.to)
    
    if (fromNode && toNode) {
      conn.x1 = fromNode.x + fromNode.width
      conn.y1 = fromNode.y + fromNode.height / 2
      conn.x2 = toNode.x
      conn.y2 = toNode.y + toNode.height / 2
    }
  })
}, { deep: true })
</script>

<style scoped>
.mind-map-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.editor-header {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
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

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: left;
}

.tool-btn:hover {
  background: #e9ecef;
  border-color: #3498db;
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

.mind-map-svg {
  width: 100%;
  height: 100%;
  background: white;
  display: block;
}

.nodes g.selected {
  filter: drop-shadow(0 0 4px rgba(52, 152, 219, 0.5));
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
}
</style>
