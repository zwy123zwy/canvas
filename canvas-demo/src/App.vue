<template>
  <div class="app">
    <header class="app-header">
      <div class="header-main">
        <h1>🎨 Canvas 画板 Demo</h1>
        <p>支持绘制、拖拽、缩放、撤销重做</p>
      </div>
      <div class="header-tips">
        <span>💡 操作提示：</span>
        <span>🖱️ 鼠标滚轮缩放</span>
        <span>⌨️ Shift+拖拽移动</span>
        <span>⌨️ Ctrl+Z撤销</span>
        <span>⌨️ Ctrl+Y重做</span>
      </div>
    </header>
    
    <div class="app-content">
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
import CanvasBoard from './components/CanvasBoard.vue'
import Toolbar from './components/Toolbar.vue'
import ViewTabs from './components/ViewTabs.vue'

const STORAGE_KEY = 'canvas-demo-views'

// 视图管理
const views = ref([])
const currentViewId = ref('')
const canvasBoardRefs = ref({})

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
  
  // 如果没有存储数据，创建默认视图
  const defaultView = { id: 'view-1', name: '视图 1' }
  views.value = [defaultView]
  currentViewId.value = defaultView.id
}

// 保存视图列表到 localStorage
const saveViewsToStorage = () => {
  try {
    // 保存当前画布状态
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
    
    // 加载该视图的画布数据
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
  // 保存当前视图状态
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
  
  // 显示确认对话框
  if (!confirm('确定要删除这个视图吗？视图中的所有内容将被永久删除。')) {
    return
  }
  
  const index = views.value.findIndex(v => v.id === viewId)
  views.value.splice(index, 1)
  
  // 删除引用
  delete canvasBoardRefs.value[viewId]
  
  // 如果关闭的是当前视图，切换到其他视图
  if (currentViewId.value === viewId) {
    currentViewId.value = views.value[Math.max(0, index - 1)].id
  }
  
  // 保存到 localStorage
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
  // Ctrl+Z 撤销
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    handleUndo()
  }
  // Ctrl+Y 或 Ctrl+Shift+Z 重做
  if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
    e.preventDefault()
    handleRedo()
  }
  
  // Ctrl+S 保存
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
  // 加载视图数据
  loadViewsFromStorage()
  
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 禁止浏览器页面缩放
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  }, { passive: false })
  
  // 禁止触控板双指缩放
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault()
  })
  
  // 定期自动保存（每30秒）
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

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden; /* 防止页面左右滑动 */
  touch-action: pan-y; /* 禁止双指缩放 */
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  overflow-x: hidden; /* 防止页面左右滑动 */
}

.app-header {
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

.app-content {
  flex: 1;
  display: flex;
  overflow-x: hidden; /* 禁止左右滑动 */
  overflow-y: auto;   /* 允许上下滑动 */
  min-height: 0; /* 确保flex子项可以正确收缩 */
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

