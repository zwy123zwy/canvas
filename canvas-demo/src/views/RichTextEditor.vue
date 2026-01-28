<template>
  <div class="rich-text-editor">
    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="goHome">
          ← 返回主页
        </button>
        <div class="header-main">
          <h1>📝 富文本编辑器</h1>
          <p>强大的文档编辑功能，支持格式化、图片、表格等</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="saveDocument">
          💾 保存
        </button>
        <button class="action-btn" @click="exportAsPDF">
          📄 导出PDF
        </button>
      </div>
    </header>
    
    <div class="editor-content">
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="tool-btn" @click="execCommand('bold')" title="加粗">
            <strong>B</strong>
          </button>
          <button class="tool-btn" @click="execCommand('italic')" title="斜体">
            <em>I</em>
          </button>
          <button class="tool-btn" @click="execCommand('underline')" title="下划线">
            <u>U</u>
          </button>
        </div>
        
        <div class="toolbar-group">
          <select class="tool-select" @change="execCommand('fontSize', $event.target.value)">
            <option value="">字体大小</option>
            <option value="1">小</option>
            <option value="3">中</option>
            <option value="5">大</option>
            <option value="7">超大</option>
          </select>
          
          <select class="tool-select" @change="execCommand('fontName', $event.target.value)">
            <option value="">字体</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Microsoft YaHei">微软雅黑</option>
          </select>
        </div>
        
        <div class="toolbar-group">
          <button class="tool-btn" @click="execCommand('insertUnorderedList')" title="无序列表">
            •
          </button>
          <button class="tool-btn" @click="execCommand('insertOrderedList')" title="有序列表">
            1.
          </button>
          <button class="tool-btn" @click="execCommand('justifyLeft')" title="左对齐">
            左
          </button>
          <button class="tool-btn" @click="execCommand('justifyCenter')" title="居中对齐">
            中
          </button>
          <button class="tool-btn" @click="execCommand('justifyRight')" title="右对齐">
            右
          </button>
        </div>
        
        <div class="toolbar-group">
          <button class="tool-btn" @click="insertImage" title="插入图片">
            🖼️
          </button>
          <button class="tool-btn" @click="insertTable" title="插入表格">
            📊
          </button>
          <button class="tool-btn" @click="execCommand('insertHorizontalRule')" title="分隔线">
            —
          </button>
        </div>
      </div>
      
      <div class="editor-area">
        <div 
          class="editor-content-area"
          contenteditable="true"
          ref="editor"
          @input="handleInput"
          @keydown="handleKeyDown"
        >
          <h2>欢迎使用富文本编辑器</h2>
          <p>这是一个功能强大的文档编辑器，支持：</p>
          <ul>
            <li>文字格式化（加粗、斜体、下划线）</li>
            <li>字体大小和字体选择</li>
            <li>列表（有序和无序）</li>
            <li>对齐方式</li>
            <li>图片插入</li>
            <li>表格插入</li>
            <li>分隔线</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const editor = ref(null)
const content = ref('')

const goHome = () => {
  router.push('/')
}

const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  editor.value.focus()
}

const insertImage = () => {
  const imageUrl = prompt('请输入图片URL:', 'https://via.placeholder.com/300x150')
  if (imageUrl) {
    document.execCommand('insertImage', false, imageUrl)
  }
}

const insertTable = () => {
  const rows = parseInt(prompt('请输入行数:', '3')) || 3
  const cols = parseInt(prompt('请输入列数:', '3')) || 3
  
  let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%;">'
  for (let i = 0; i < rows; i++) {
    tableHtml += '<tr>'
    for (let j = 0; j < cols; j++) {
      tableHtml += '<td style="padding: 8px; border: 1px solid #ddd;">单元格</td>'
    }
    tableHtml += '</tr>'
  }
  tableHtml += '</table>'
  
  editor.value.focus()
  document.execCommand('insertHTML', false, tableHtml)
}

const handleInput = () => {
  content.value = editor.value.innerHTML
}

const handleKeyDown = (e) => {
  // Ctrl+S 保存
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    saveDocument()
  }
}

const saveDocument = () => {
  const content = editor.value.innerHTML
  localStorage.setItem('rich-text-content', content)
  alert('文档已保存！')
}

const exportAsPDF = () => {
  alert('PDF导出功能正在开发中...')
}

onMounted(() => {
  const savedContent = localStorage.getItem('rich-text-content')
  if (savedContent) {
    editor.value.innerHTML = savedContent
  }
})

onUnmounted(() => {
  saveDocument()
})
</script>

<style scoped>
.rich-text-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow-x: hidden;
}

.editor-header {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
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
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 5px;
  align-items: center;
}

.tool-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e9ecef;
}

.tool-select {
  background: white;
  border: 1px solid #dee2e6;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.editor-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-content-area {
  flex: 1;
  padding: 20px;
  background: white;
  outline: none;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.editor-content-area h1, .editor-content-area h2, .editor-content-area h3 {
  margin: 20px 0 10px 0;
}

.editor-content-area p {
  margin: 10px 0;
}

.editor-content-area ul, .editor-content-area ol {
  margin: 10px 0;
  padding-left: 20px;
}

.editor-content-area table {
  margin: 10px 0;
  border-collapse: collapse;
  width: 100%;
}

.editor-content-area td {
  padding: 8px;
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toolbar-group {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
