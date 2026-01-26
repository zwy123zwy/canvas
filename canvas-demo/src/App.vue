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
import { ref, onMounted, onUnmounted } from 'vue'
import CanvasBoard from './components/CanvasBoard.vue'
import Toolbar from './components/Toolbar.vue'
import ViewTabs from './components/ViewTabs.vue'

// 视图管理
const views = ref([
  { id: 'view-1' }
])
const currentViewId = ref('view-1')
const canvasBoardRefs = ref({})

// 设置画布引用
const setCanvasBoardRef = (viewId, el) => {
  if (el) {
    canvasBoardRefs.value[viewId] = el
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
  currentViewId.value = viewId
}

const addView = () => {
  const newId = `view-${Date.now()}`
  views.value.push({ id: newId })
  currentViewId.value = newId
}

const closeView = (viewId) => {
  if (views.value.length <= 1) return
  
  const index = views.value.findIndex(v => v.id === viewId)
  views.value.splice(index, 1)
  
  // 删除引用
  delete canvasBoardRefs.value[viewId]
  
  // 如果关闭的是当前视图，切换到其他视图
  if (currentViewId.value === viewId) {
    currentViewId.value = views.value[Math.max(0, index - 1)].id
  }
}

// 操作方法
const handleUndo = () => {
  getCurrentCanvasBoard()?.undo()
}

const handleRedo = () => {
  getCurrentCanvasBoard()?.redo()
}

const handleClear = () => {
  if (confirm('确定要清空画布吗？')) {
    getCurrentCanvasBoard()?.clear()
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
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  
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
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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

