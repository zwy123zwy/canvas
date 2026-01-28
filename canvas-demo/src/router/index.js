import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CanvasEditor from '../views/CanvasEditor.vue'
import RichTextEditor from '../views/RichTextEditor.vue'
import TableEditor from '../views/TableEditor.vue'
import MindMapEditor from '../views/MindMapEditor.vue'
import MarkdownEditor from '../views/MarkdownEditor.vue'
import FlowchartEditor from '../views/FlowchartEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: '文档中心'
      }
    },
    {
      path: '/canvas',
      name: 'canvas',
      component: CanvasEditor,
      meta: {
        title: 'Canvas 画板'
      }
    },
    {
      path: '/rich-text',
      name: 'rich-text',
      component: RichTextEditor,
      meta: {
        title: '富文本编辑器'
      }
    },
    {
      path: '/table',
      name: 'table',
      component: TableEditor,
      meta: {
        title: '表格编辑器'
      }
    },
    {
      path: '/mind-map',
      name: 'mind-map',
      component: MindMapEditor,
      meta: {
        title: '思维导图'
      }
    },
    {
      path: '/markdown',
      name: 'markdown',
      component: MarkdownEditor,
      meta: {
        title: 'Markdown 编辑器'
      }
    },
    {
      path: '/flowchart',
      name: 'flowchart',
      component: FlowchartEditor,
      meta: {
        title: '流程图编辑器'
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'Canvas Demo'
  
  // 添加页面过渡效果
  if (to.path !== from.path) {
    // 可以在这里添加页面过渡逻辑
    console.log(`导航: ${from.path} -> ${to.path}`)
  }
  
  next()
})

export default router
