<template>
  <div class="canvas-editor">
    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="goHome">
          ← 返回主页
        </button>
        <div class="header-main">
          <h1>🎨 Canvas 画板</h1>
          <p>支持绘制、拖拽、缩放、撤销重做</p>
        </div>
      </div>
      <div class="header-tips">
        <span>💡 操作提示：</span>
        <span>🖱️ 鼠标滚轮缩放</span>
        <span>⌨️ Shift+拖拽移动</span>
        <span>⌨️ Ctrl+Z撤销</span>
        <span>⌨️ Ctrl+Y重做</span>
      </div>
    </header>
    
    <div class="editor-content">
      <Toolbar
        :currentTool="currentTool"
        :color="color"
        :lineWidth="lineWidth"
        :canUndo="canUndo"
        :canRedo="canRedo"
        @update:tool="currentTool = $event"
        @update:color="color = $event"
        @update:lineWidth="lineWidth = $event"
        @undo="handleUndo"
        @redo="handleRedo"
        @clear="handleClear"
        @resetTransform="handleResetTransform"
      />
      
      <div class="canvas-area">
        <div class="canvas-wrapper">
          <CanvasBoard
            v-for="view in views"
            v-show="view.id === currentViewId"
            :key="view.id"
            :ref="el => setCanvasBoardRef(view.id, el)"
            :tool="currentTool"
            :color="color"
            :lineWidth="lineWidth"
            @update:canUndo="canUndo = $event"
            @update:canRedo="canRedo = $event"
          />
        </div>
        <ViewTabs
          :views="views"
          :currentViewId="currentViewId"
          @switch="switchView"
          @close="closeView"
          @add="addView"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import CanvasBoard from '../components/canvas/CanvasBoard.vue'
import Toolbar from '../components/canvas/Toolbar.vue'
import ViewTabs from '../components/canvas/ViewTabs.vue'

const router = useRouter()
const STORAGE_KEY = 'canvas-demo-views'

// 视图管理
const views = ref([])
const currentViewId = ref('')
const canvasBoardRefs = ref({})

// 返回主页
const goHome = () => {
  router.push('/')
}

// 从 localStorage 加载视图数据
const loadViewsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      if (data.views && data.views.length > 0) {
        views.value = data.views
        currentViewId.value = data.currentViewId || data.views[0].id
        return
      }
    }
  } catch (error) {
    console.error('Failed to load views from storage:', error)
  }
  
  const defaultView = { id: 'view-1', name: '视图 1' }
  views.value = [defaultView]
  currentViewId.value = defaultView.id
}

// 保存视图列表到 localStorage
const saveViewsToStorage = () => {
  try {
    if (canvasBoardRefs.value[currentViewId.value]) {
      const canvasData = canvasBoardRefs.value[currentViewId.value].getData()
      const view = views.value.find(v => v.id === currentViewId.value)
      if (view) {
        view.canvasData = canvasData
      }
    }
    
    const data = {
      views: views.value,
      currentViewId: currentViewId.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save views to storage:', error)
  }
}

// 设置画布引用
const setCanvasBoardRef = (viewId, el) => {
  if (el) {
    canvasBoardRefs.value[viewId] = el
    nextTick(() => {
      const view = views.value.find(v => v.id === viewId)
      if (view && view.canvasData) {
        el.loadData(view.canvasData)
      }
    })
  }
}

// 获取当前画布引用
const getCurrentCanvasBoard = () => {
  return canvasBoardRefs.value[currentViewId.value]
}

// 状态
const currentTool = ref('pen')
const color = ref('#000000')
const lineWidth = ref(2)
const canUndo = ref(false)
const canRedo = ref(false)

// 视图操作
const switchView = (viewId) => {
  saveViewsToStorage()
  currentViewId.value = viewId
}

const addView = () => {
  const newId = `view-${Date.now()}`
  const newIndex = views.value.length + 1
  views.value.push({ id: newId, name: `视图 ${newIndex}` })
  currentViewId.value = newId
  saveViewsToStorage()
}

const closeView = (viewId) => {
  if (views.value.length <= 1) {
    alert('至少需要保留一个视图')
    return
  }
  
  if (!confirm('确定要删除这个视图吗？视图中的所有内容将被永久删除。')) {
    return
  }
  
  const index = views.value.findIndex(v => v.id === viewId)
  views.value.splice(index, 1)
  delete canvasBoardRefs.value[viewId]
  
  if (currentViewId.value === viewId) {
    currentViewId.value = views.value[Math.max(0, index - 1)].id
  }
  
  saveViewsToStorage()
}

// 操作方法
const handleUndo = () => {
  getCurrentCanvasBoard()?.undo()
  saveViewsToStorage()
}

const handleRedo = () => {
  getCurrentCanvasBoard()?.redo()
  saveViewsToStorage()
}

const handleClear = () => {
  if (confirm('确定要清空画布吗？')) {
    getCurrentCanvasBoard()?.clear()
    saveViewsToStorage()
  }
}

const handleResetTransform = () => {
  getCurrentCanvasBoard()?.resetTransform()
}

// 键盘快捷键
const handleKeyDown = (e) => {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    handleUndo()
  }
  if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
    e.preventDefault()
    handleRedo()
  }
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    saveViewsToStorage()
  }
}

// 监听视图变化，自动保存
watch(views, () => {
  saveViewsToStorage()
}, { deep: true })

// 页面卸载前保存
const handleBeforeUnload = () => {
  saveViewsToStorage()
}

onMounted(() => {
  loadViewsFromStorage()
  
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  }, { passive: false })
  
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault()
  })
  
  const autoSaveInterval = setInterval(() => {
    saveViewsToStorage()
  }, 30000)
  
  onUnmounted(() => {
    clearInterval(autoSaveInterval)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  saveViewsToStorage()
})
</script>

<style scoped>
.canvas-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  overflow-x: hidden;
}

.editor-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.header-tips {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 13px;
  opacity: 0.95;
  flex-wrap: wrap;
}

.header-tips span:first-child {
  font-weight: 600;
  margin-right: 5px;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 0;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canvas-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}
</style>
