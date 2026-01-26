# 🎨 Canvas 画板 Demo

一个基于 Vue 3 + Vite 开发的交互式画板应用，支持绘制、变换和历史管理等功能。

## ✨ 功能特性

### 🎯 核心功能
- ✏️ **多种绘制工具**
  - 画笔工具：自由绘制
  - 矩形工具：绘制矩形
  - 圆形工具：绘制圆形

- 🎨 **样式控制**
  - 自定义颜色选择
  - 线条宽度调节（1-20px）

- 🔄 **画布变换**
  - 鼠标滚轮缩放（0.1x - 5x）
  - Shift + 拖拽移动画布
  - 重置视图功能

- ⏮️ **历史管理**
  - 撤销操作（Ctrl+Z）
  - 重做操作（Ctrl+Y）
  - 最多保存50步历史记录

- 🗑️ **其他功能**
  - 清空画布
  - 实时预览（绘制形状时）

## 🚀 快速开始

### 安装依赖
```bash
cd canvas-demo
npm install
```

### 运行开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🎮 使用说明

### 基本操作
1. **选择工具**：在左侧工具栏选择画笔、矩形或圆形工具
2. **设置样式**：调整颜色和线条宽度
3. **开始绘制**：在画布上按住鼠标左键拖动即可绘制

### 画布操作
- **缩放**：使用鼠标滚轮放大或缩小画布
- **移动**：按住 Shift 键 + 鼠标拖拽移动画布
- **重置**：点击"重置视图"按钮恢复初始视图

### 快捷键
- `Ctrl + Z`：撤销
- `Ctrl + Y`：重做
- `Shift + 拖拽`：移动画布

## 🏗️ 项目结构

```
canvas-demo/
├── src/
│   ├── components/
│   │   ├── CanvasBoard.vue   # Canvas 画布核心组件
│   │   └── Toolbar.vue        # 工具栏组件
│   ├── App.vue                # 主应用组件
│   └── main.js                # 应用入口
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## 🧩 核心组件说明

### CanvasBoard.vue
Canvas 画布核心组件，负责：
- Canvas 渲染和绘制
- 鼠标事件处理
- 变换逻辑（缩放、平移）
- 历史记录管理

### Toolbar.vue
工具栏组件，提供：
- 工具选择界面
- 颜色和线宽控制
- 操作按钮（撤销、重做、清空等）
- 使用提示

## 🔧 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **样式**：Scoped CSS
- **Canvas API**：原生 HTML5 Canvas

## 📝 开发说明

### 关键技术点

1. **Canvas 变换**
   - 使用 CSS transform 实现画布缩放和平移
   - 坐标转换：将屏幕坐标转换为画布坐标

2. **历史记录**
   - 使用 ImageData 保存画布状态
   - 限制历史记录数量避免内存溢出

3. **实时预览**
   - 绘制形状时实时显示预览
   - 使用 putImageData 快速恢复画布状态

## 📄 许可证

MIT License

## 👨‍💻 作者

zhangwenye

---

**Enjoy coding! 🎉**
