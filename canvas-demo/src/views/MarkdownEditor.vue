<template>
  <div class="markdown-editor">
    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="goHome">
          ← 返回主页
        </button>
        <div class="header-main">
          <h1>📋 Markdown 编辑器</h1>
          <p>轻量级文档编写，支持实时预览和导出</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="togglePreview">
          👁️ {{ isPreviewMode ? '编辑模式' : '预览模式' }}
        </button>
        <button class="action-btn" @click="saveDocument">
          💾 保存
        </button>
        <button class="action-btn" @click="exportAsHTML">
          📄 导出HTML
        </button>
        <button class="action-btn" @click="clearEditor">
          🧹 清空
        </button>
      </div>
    </header>
    
    <div class="editor-content" :class="{ 'split-view': !isPreviewMode }">
      <!-- 左侧编辑区 -->
      <div v-if="!isPreviewMode" class="editor-panel">
        <div class="editor-toolbar">
          <div class="toolbar-group">
            <button class="tool-btn" @click="insertMarkdown('# ', '标题1')" title="标题1">
              H1
            </button>
            <button class="tool-btn" @click="insertMarkdown('## ', '标题2')" title="标题2">
              H2
            </button>
            <button class="tool-btn" @click="insertMarkdown('### ', '标题3')" title="标题3">
              H3
            </button>
          </div>
          
          <div class="toolbar-group">
            <button class="tool-btn" @click="insertMarkdown('**', '**')" title="加粗">
              <strong>B</strong>
            </button>
            <button class="tool-btn" @click="insertMarkdown('*', '*')" title="斜体">
              <em>I</em>
            </button>
            <button class="tool-btn" @click="insertMarkdown('~~', '~~')" title="删除线">
              <s>删除</s>
            </button>
          </div>
          
          <div class="toolbar-group">
            <button class="tool-btn" @click="insertMarkdown('`', '`')" title="行内代码">
              `代码`
            </button>
            <button class="tool-btn" @click="insertMarkdown('```', '\n\n```')" title="代码块">
              `</button>
            <button class="tool-btn" @click="insertMarkdown('> ', '引用文本')" title="引用">
              "
            </button>
          </div>
          
          <div class="toolbar-group">
            <button class="tool-btn" @click="insertMarkdown('- ', '列表项')" title="无序列表">
              •
            </button>
            <button class="tool-btn" @click="insertMarkdown('1. ', '列表项')" title="有序列表">
              1.
            </button>
            <button class="tool-btn" @click="insertMarkdown('---', '')" title="分隔线">
              —
            </button>
          </div>
          
          <div class="toolbar-group">
            <button class="tool-btn" @click="insertMarkdown('[链接文本](URL)', '')" title="链接">
              🔗
            </button>
            <button class="tool-btn" @click="insertMarkdown('![图片描述](图片URL)', '')" title="图片">
              🖼️
            </button>
          </div>
        </div>
        
        <div class="editor-area">
          <textarea 
            ref="editor"
            v-model="markdownContent"
            class="markdown-input"
            placeholder="开始编写你的 Markdown 文档..."
            @input="updatePreview"
          ></textarea>
        </div>
      </div>
      
      <!-- 右侧预览区 -->
      <div class="preview-panel">
        <div class="preview-header">
          <span class="preview-title">预览</span>
          <div class="word-count">
            字数: {{ wordCount }} | 字符数: {{ charCount }}
          </div>
        </div>
        <div class="preview-content" v-html="compiledMarkdown"></div>
      </div>
    </div>
    
    <!-- 快捷提示 -->
    <div class="quick-tips" v-if="!isPreviewMode">
      <div class="tip-item">
        <kbd>Ctrl/Cmd + Enter</kbd> 切换预览
      </div>
      <div class="tip-item">
        <kbd>Ctrl/Cmd + S</kbd> 保存文档
      </div>
      <div class="tip-item">
        <kbd>Ctrl/Cmd + K</kbd> 插入链接
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

// 编辑器状态
const markdownContent = ref('# 欢迎使用 Markdown 编辑器\n\n这是一个支持实时预览的 Markdown 编辑器。\n\n## 功能特性\n\n- ✅ 实时预览\n- ✅ 语法高亮\n- ✅ 本地保存\n- ✅ 导出功能\n\n## 快速开始\n\n在左侧编辑区输入 Markdown 语法，右侧会实时显示预览效果。\n\n```javascript\nfunction hello() {\n  console.log("Hello, Markdown!")\n}\n```\n\n> 这是一个引用示例\n\n### 常用语法\n\n- **加粗**\n- *斜体*\n- ~~删除线~~\n- `行内代码`\n\n[了解更多 Markdown 语法](https://markdown.com.cn)')
const isPreviewMode = ref(false)
const editor = ref(null)

// 计算属性
const wordCount = computed(() => {
  return markdownContent.value.trim().split(/\s+/).length
})

const charCount = computed(() => {
  return markdownContent.value.length
})

const compiledMarkdown = computed(() => {
  return convertMarkdownToHTML(markdownContent.value)
})

// Markdown 转 HTML 函数
const convertMarkdownToHTML = (markdown) => {
  let html = markdown
  
  // 处理标题
  html = html.replace(/^(#{1,6})\s+(.*$)/gm, (match, hashes, content) => {
    const level = hashes.length
    return `<h${level}>${escapeHtml(content)}</h${level}>`
  })
  
  // 处理粗体和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // 处理删除线
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>')
  
  // 处理行内代码
  html = html.replace(/`(.*?)`/g, '<code>$1</code>')
  
  // 处理代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
    return `<pre><code class="${lang || ''}">${escapeHtml(code)}</code></pre>`
  })
  
  // 处理引用
  html = html.replace(/^>\s+(.*$)/gm, '<blockquote>$1</blockquote>')
  
  // 处理无序列表
  html = html.replace(/^-\s+(.*$)/gm, '<ul><li>$1</li></ul>')
  
  // 处理有序列表
  html = html.replace(/^\d+\.\s+(.*$)/gm, '<ol><li>$1</li></ol>')
  
  // 处理分隔线
  html = html.replace(/^---$/gm, '<hr>')
  
  // 处理链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  
  // 处理图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">')
  
  // 处理段落
  html = html.replace(/\n\n/g, '</p><p>')
  
  // 包装在段落标签中
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>'
  }
  
  return html
}

const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 方法
const insertMarkdown = (before, after, placeholder = '') => {
  const textarea = editor.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = markdownContent.value.substring(start, end)
  
  let insertText = before + (selectedText || placeholder) + after
  
  // 如果没有选中文本，光标后移
  if (!selectedText) {
    insertText += ' '
  }
  
  markdownContent.value = 
    markdownContent.value.substring(0, start) + 
    insertText + 
    markdownContent.value.substring(end)
  
  // 设置新的光标位置
  const newCursorPos = start + insertText.length - (selectedText ? 0 : after.length)
  textarea.focus()
  textarea.setSelectionRange(newCursorPos, newCursorPos)
  
  updatePreview()
}

const togglePreview = () => {
  isPreviewMode.value = !isPreviewMode.value
}

const updatePreview = () => {
  // 预览会自动更新，因为使用了 computed
}

const saveDocument = () => {
  localStorage.setItem('markdown-content', markdownContent.value)
  alert('文档已保存！')
}

const exportAsHTML = () => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Markdown 文档</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1, h2, h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; }
    ul, ol { padding-left: 20px; }
    hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${compiledMarkdown.value}
</body>
</html>`
  
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'markdown_document.html')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const clearEditor = () => {
  if (confirm('确定要清空编辑器吗？')) {
    markdownContent.value = '# 新文档\n\n开始编写你的 Markdown 文档...'
    updatePreview()
  }
}

const handleKeyDown = (e) => {
  // Ctrl/Cmd + Enter 切换预览
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    togglePreview()
  }
  
  // Ctrl/Cmd + S 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveDocument()
  }
  
  // Ctrl/Cmd + K 插入链接
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    insertMarkdown('[链接文本](', ')')
  }
}

// 生命周期
onMounted(() => {
  const savedContent = localStorage.getItem('markdown-content')
  if (savedContent) {
    markdownContent.value = savedContent
  }
  
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  saveDocument()
})

// 监听内容变化
watch(markdownContent, () => {
  // 可以添加自动保存逻辑
  // saveDocument()
})
</script>

<style scoped>
.markdown-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow-x: hidden;
}

.editor-header {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
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
  transition: all 0.3s ease;
}

.editor-content.split-view {
  flex-direction: row;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e0e0e0;
}

.editor-toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 5px;
  align-items: center;
}

.tool-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e9ecef;
  border-color: #3498db;
}

.editor-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.markdown-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 20px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: white;
}

.preview-panel {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-weight: 600;
  color: #333;
}

.word-count {
  font-size: 12px;
  color: #666;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: white;
}

.preview-content h1, .preview-content h2, .preview-content h3 {
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.preview-content code {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.preview-content pre {
  background: #f4f4f4;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  margin: 10px 0;
}

.preview-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 15px;
  color: #666;
  margin: 10px 0;
}

.preview-content ul, .preview-content ol {
  padding-left: 20px;
  margin: 10px 0;
}

.preview-content hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.preview-content img {
  max-width: 100%;
  height: auto;
}

.quick-tips {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 10px 20px;
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #666;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-item kbd {
  background: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
}

@media (max-width: 768px) {
  .editor-content.split-view {
    flex-direction: column;
  }
  
  .editor-panel, .preview-panel {
    height: 50%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .quick-tips {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
