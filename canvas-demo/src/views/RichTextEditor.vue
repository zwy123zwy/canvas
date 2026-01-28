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
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>导入/导出</h3>
          <div class="import-export-group">
            <div class="file-input-group">
              <input 
                type="file" 
                ref="fileInput" 
                accept=".docx,.doc,.txt,.html"
                @change="handleFileUpload"
                class="file-input"
              />
              <label for="fileInput" class="file-label">
                📁 选择文件
              </label>
            </div>
            <div class="file-actions">
              <button class="action-btn small" @click="importFromDocx">
                📄 导入 DOCX
              </button>
              <button class="action-btn small" @click="importFromHTML">
                🌐 导入 HTML
              </button>
              <button class="action-btn small" @click="importFromTXT">
                📝 导入 TXT
              </button>
            </div>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>导出选项</h3>
          <div class="export-options">
            <button class="export-btn" @click="exportAsPDF">
              📄 导出 PDF
            </button>
            <button class="export-btn" @click="exportAsHTML">
              🌐 导出 HTML
            </button>
            <button class="export-btn" @click="exportAsDOCX">
              📄 导出 DOCX
            </button>
            <button class="export-btn" @click="exportAsTXT">
              📝 导出 TXT
            </button>
          </div>
        </div>
      </div>
      
      <div class="main-editor">
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
    
    <!-- 导入状态提示 -->
    <div v-if="isImporting" class="import-status">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: importProgress + '%' }"></div>
      </div>
      <p>{{ importStatus }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import mammoth from 'mammoth'
import { PDFDocument, rgb } from 'pdf-lib'
import html2canvas from 'html2canvas'

const router = useRouter()
const STORAGE_KEY = 'rich-text-content'

// 导入导出相关
const fileInput = ref(null)
const editor = ref(null)
const isImporting = ref(false)
const importProgress = ref(0)
const importStatus = ref('')

// 页面状态
const content = ref('')

// 返回主页
const goHome = () => {
  try {
    console.log('返回主页')
    router.push('/')
  } catch (error) {
    console.error('返回主页失败:', error)
    // 如果路由跳转失败，尝试强制刷新
    window.location.href = '/'
  }
}

// 执行命令
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  editor.value.focus()
}

// 插入图片
const insertImage = () => {
  const imageUrl = prompt('请输入图片URL:', 'https://via.placeholder.com/300x150')
  if (imageUrl) {
    document.execCommand('insertImage', false, imageUrl)
  }
}

// 插入表格
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

// 处理输入
const handleInput = () => {
  content.value = editor.value.innerHTML
}

// 处理键盘事件
const handleKeyDown = (e) => {
  // Ctrl+S 保存
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    saveDocument()
  }
}

// 保存文档
const saveDocument = () => {
  const content = editor.value.innerHTML
  localStorage.setItem(STORAGE_KEY, content)
  alert('文档已保存！')
}

// 导入功能
const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.name.endsWith('.docx')) {
    importFromDocx(file)
  } else if (file.name.endsWith('.html')) {
    importFromHTML(file)
  } else if (file.name.endsWith('.txt')) {
    importFromTXT(file)
  } else {
    alert('不支持的文件格式')
  }
}

const importFromDocx = async (file = null) => {
  try {
    isImporting.value = true
    importStatus.value = '正在解析 DOCX 文件...'
    importProgress.value = 10
    
    let fileToProcess = file
    if (!fileToProcess) {
      fileToProcess = await selectFile('.docx,.doc')
    }
    
    if (!fileToProcess) return
    
    importStatus.value = '正在转换文档内容...'
    importProgress.value = 50
    
    const arrayBuffer = await fileToProcess.arrayBuffer()
    importStatus.value = '使用 mammoth 转换 DOCX...'
    importProgress.value = 70
    
    const result = await mammoth.convertToHtml({ arrayBuffer })
    
    console.log('DOCX 转换结果:', result)
    console.log('转换后的 HTML:', result.value)
    
    importStatus.value = '正在加载内容...'
    importProgress.value = 80
    
    // 确保转换成功
    if (result.value && result.value.trim()) {
      editor.value.innerHTML = result.value
      content.value = result.value
      
      importStatus.value = '导入完成！'
      importProgress.value = 100
      
      // 显示成功消息
      setTimeout(() => {
        alert('DOCX 文件导入成功！\n导入的内容已显示在编辑器中。')
        isImporting.value = false
        importProgress.value = 0
        importStatus.value = ''
      }, 1000)
    } else {
      throw new Error('转换后的文档内容为空')
    }
    
  } catch (error) {
    console.error('导入 DOCX 失败:', error)
    importStatus.value = '导入失败: ' + error.message
    importProgress.value = 0
    isImporting.value = false
    
    alert('导入 DOCX 文件失败: ' + error.message)
  }
}

const importFromHTML = async (file = null) => {
  try {
    let fileToProcess = file
    if (!fileToProcess) {
      fileToProcess = await selectFile('.html')
    }
    
    if (!fileToProcess) return
    
    const text = await fileToProcess.text()
    editor.value.innerHTML = text
    content.value = text
    
    alert('HTML 文件导入成功！')
  } catch (error) {
    console.error('导入 HTML 失败:', error)
    alert('导入 HTML 文件失败: ' + error.message)
  }
}

const importFromTXT = async (file = null) => {
  try {
    let fileToProcess = file
    if (!fileToProcess) {
      fileToProcess = await selectFile('.txt')
    }
    
    if (!fileToProcess) return
    
    const text = await fileToProcess.text()
    // 将纯文本转换为 HTML 格式
    const htmlContent = text
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
      .join('')
    
    editor.value.innerHTML = htmlContent
    content.value = htmlContent
    
    alert('TXT 文件导入成功！')
  } catch (error) {
    console.error('导入 TXT 失败:', error)
    alert('导入 TXT 文件失败: ' + error.message)
  }
}

const selectFile = (accept) => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = (e) => {
      resolve(e.target.files[0])
    }
    input.click()
  })
}

// 导出功能
const exportAsPDF = async () => {
  try {
    const htmlContent = editor.value.innerHTML
    
    // 创建临时容器
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = htmlContent
    tempContainer.style.padding = '40px'
    tempContainer.style.fontFamily = 'Arial, sans-serif'
    tempContainer.style.fontSize = '14px'
    tempContainer.style.lineHeight = '1.6'
    tempContainer.style.maxWidth = '800px'
    tempContainer.style.margin = '0 auto'
    
    // 添加到页面进行渲染
    document.body.appendChild(tempContainer)
    
    // 使用 html2canvas 生成图片
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    // 移除临时容器
    document.body.removeChild(tempContainer)
    
    // 创建 PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 尺寸
    
    // 添加图片到 PDF
    const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'))
    const { width, height } = pngImage.scale(0.5)
    
    page.drawImage(pngImage, {
      x: 50,
      y: 400,
      width: width,
      height: height
    })
    
    // 生成 PDF 二进制数据
    const pdfBytes = await pdfDoc.save()
    
    // 下载 PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('PDF 导出成功！')
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    alert('导出 PDF 失败: ' + error.message)
  }
}

const exportAsHTML = () => {
  const htmlContent = editor.value.innerHTML
  const htmlDocument = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>富文本文档</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1, h2, h3 { color: #333; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; }
    ul, ol { padding-left: 20px; }
    hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
  
  const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'document.html'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  alert('HTML 导出成功！')
}

const exportAsDOCX = () => {
  alert('DOCX 导出功能正在开发中...')
}

const exportAsTXT = () => {
  const htmlContent = editor.value.innerHTML
  // 简单的 HTML 到文本转换
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  const textContent = tempDiv.textContent || tempDiv.innerText || ''
  
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'document.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  alert('TXT 导出成功！')
}

// 生命周期
onMounted(() => {
  const savedContent = localStorage.getItem(STORAGE_KEY)
  if (savedContent) {
    editor.value.innerHTML = savedContent
    content.value = savedContent
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

.action-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 300px;
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

.import-export-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input {
  display: none;
}

.file-label {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  transition: all 0.2s;
}

.file-label:hover {
  background: #2980b9;
}

.file-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
}

.export-btn:hover {
  background: #e9ecef;
  border-color: #3498db;
  transform: translateX(5px);
}

.main-editor {
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

.import-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.import-status p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    overflow-y: auto;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toolbar-group {
    width: 100%;
    justify-content: flex-start;
  }
  
  .import-status {
    bottom: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}
</style>