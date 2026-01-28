# DOCX 导入功能说明

## 功能概述

富文本编辑器现已支持 DOCX 文件导入功能，用户可以将 Microsoft Word 文档导入到编辑器中进行查看和编辑。

## 技术实现

### 核心库

- **mammoth.js**: 用于将 DOCX 文件转换为 HTML 格式
- **pdf-lib**: 用于 PDF 导出功能
- **html2canvas**: 用于将 HTML 转换为图片

### 导入流程

1. **文件选择**: 用户通过文件选择器选择 DOCX 文件
2. **文件读取**: 将文件读取为 ArrayBuffer 格式
3. **格式转换**: 使用 mammoth.js 将 DOCX 转换为 HTML
4. **内容显示**: 将转换后的 HTML 设置到编辑器中
5. **状态更新**: 更新内容状态并保存到本地存储

### 代码实现

```javascript
const importFromDocx = async (file = null) => {
  try {
    // 1. 获取文件
    let fileToProcess = file || await selectFile('.docx,.doc')
    if (!fileToProcess) return
    
    // 2. 读取文件
    const arrayBuffer = await fileToProcess.arrayBuffer()
    
    // 3. 转换格式
    const result = await mammoth.convertToHtml({ arrayBuffer })
    
    // 4. 显示内容
    editor.value.innerHTML = result.value
    content.value = result.value
    
    // 5. 更新状态
    alert('DOCX 文件导入成功！')
    
  } catch (error) {
    console.error('导入失败:', error)
    alert('导入 DOCX 文件失败: ' + error.message)
  }
}
```

## 支持的功能

### 文本格式
- ✅ 加粗文本
- ✅ 斜体文本
- ✅ 下划线
- ✅ 字体大小
- ✅ 字体颜色
- ✅ 文本对齐

### 结构元素
- ✅ 标题（H1-H6）
- ✅ 段落
- ✅ 换行
- ✅ 列表（有序/无序）
- ✅ 表格
- ✅ 引用
- ✅ 分隔线

### 媒体元素
- ✅ 图片
- ✅ 超链接

## 使用方法

### 方法一：通过文件选择器
1. 点击侧边栏的"📁 选择文件"按钮
2. 选择 DOCX 文件
3. 系统自动导入并显示内容

### 方法二：通过导入按钮
1. 点击"📄 导入 DOCX"按钮
2. 选择 DOCX 文件
3. 系统自动导入并显示内容

## 注意事项

### 兼容性
- 支持 .docx 和 .doc 格式的 Word 文档
- 建议使用较新的 DOCX 格式以获得更好的兼容性

### 样式保留
- 大部分基础样式会被保留
- 复杂的样式可能无法完全转换
- 导入后可以继续编辑和调整格式

### 文件大小
- 建议文件大小不超过 10MB
- 过大的文件可能导致转换时间较长

### 错误处理
- 如果导入失败，会显示具体的错误信息
- 常见问题包括文件格式不支持、文件损坏等

## 测试

### 测试文档
已创建测试文档：
- `test-document.html` - HTML 格式的测试文档
- `test-document.txt` - 纯文本格式的测试文档

### 测试步骤
1. 访问富文本编辑器页面
2. 点击导入按钮
3. 选择测试文档
4. 验证内容是否正确显示

## 扩展功能

### 导出功能
编辑器还支持多种导出格式：
- PDF 格式
- HTML 格式
- DOCX 格式（开发中）
- TXT 格式

### 其他导入格式
- HTML 文件
- TXT 文件

## 技术细节

### mammoth.js 配置
```javascript
const result = await mammoth.convertToHtml({
  arrayBuffer,
  // 可选配置
  styleMap: [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh"
  ]
})
```

### 错误处理
```javascript
try {
  const result = await mammoth.convertToHtml({ arrayBuffer })
  if (result.messages.length > 0) {
    console.warn('转换警告:', result.messages)
  }
  return result.value
} catch (error) {
  throw new Error(`DOCX 转换失败: ${error.message}`)
}
```

## 故障排除

### 常见问题

1. **导入后内容为空**
   - 检查文件是否为有效的 DOCX 格式
   - 尝试重新选择文件

2. **样式丢失**
   - 复杂样式可能无法完全保留
   - 导入后可以手动调整格式

3. **图片不显示**
   - 检查 DOCX 文件中的图片是否正常
   - 尝试重新导入

4. **表格显示异常**
   - 简单表格通常能正确转换
   - 复杂表格可能需要手动调整

### 调试方法
- 打开浏览器开发者工具查看控制台输出
- 检查网络请求是否正常
- 验证文件是否正确读取

## 更新日志

### v1.0.0
- ✅ 实现基础 DOCX 导入功能
- ✅ 支持多种文件格式
- ✅ 添加导入状态提示
- ✅ 实现错误处理机制
- ✅ 添加调试日志

## 未来计划

- [ ] 支持更多 DOCX 样式
- [ ] 优化大文件处理性能
- [ ] 添加批量导入功能
- [ ] 改进错误提示信息
- [ ] 支持 DOCX 导出功能