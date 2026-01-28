<template>
  <div class="home">
    <header class="home-header">
      <div class="header-left">
        <h1>📚 文档中心</h1>
        <p>选择一个应用开始创作</p>
      </div>
      <div class="header-actions">
        <button class="help-btn" @click="showHelp">
          ❓ 使用帮助
        </button>
      </div>
    </header>

    <div class="apps-grid">
      <AppCard
        icon="🎨"
        title="Canvas 画板"
        description="自由绘制、图形编辑、多视图管理"
        :features="['✏️ 绘图', '🖱️ 选择', '📐 图形']"
        path="/canvas"
      />

      <AppCard
        icon="📝"
        title="富文本编辑器"
        description="强大的文档编辑功能"
        path="/rich-text"
      />

      <AppCard
        icon="📊"
        title="表格编辑器"
        description="数据管理和分析"
        path="/table"
      />

      <AppCard
        icon="🔗"
        title="思维导图"
        description="可视化思维整理"
        path="/mind-map"
      />

      <AppCard
        icon="📋"
        title="Markdown 编辑器"
        description="轻量级文档编写"
        path="/markdown"
      />

      <AppCard
        icon="📈"
        title="流程图编辑器"
        description="流程设计和建模"
        path="/flowchart"
      />
    </div>

    <footer class="home-footer">
      <p>© 2026 Canvas Demo | 打造你的创作工作台</p>
      <p class="footer-tip">💡 提示：点击应用卡片即可进入对应编辑器，无需刷新页面</p>
    </footer>

    <!-- 使用帮助弹窗 -->
    <div v-if="showingHelp" class="help-modal" @click="hideHelp">
      <div class="help-content" @click.stop>
        <h3>使用帮助</h3>
        <p>这是一个多应用文档中心，包含以下功能：</p>
        <ul>
          <li>🎨 Canvas 画板 - 绘图和图形编辑</li>
          <li>📝 富文本编辑器 - 文档编辑，支持 DOCX 导入</li>
          <li>📊 表格编辑器 - 数据管理和分析</li>
          <li>🔗 思维导图 - 可视化思维整理</li>
          <li>📋 Markdown 编辑器 - 轻量级文档编写</li>
          <li>📈 流程图编辑器 - 流程设计和建模</li>
        </ul>
        <button @click="hideHelp">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppCard from '../components/home/AppCard.vue'
import { ref } from 'vue'

const showingHelp = ref(false)

const showHelp = () => {
  showingHelp.value = true
}

const hideHelp = () => {
  showingHelp.value = false
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
}

.home-header {
  text-align: center;
  color: white;
  margin-bottom: 50px;
}

.home-header h1 {
  font-size: 48px;
  margin-bottom: 10px;
  font-weight: 700;
}

.home-header p {
  font-size: 20px;
  opacity: 0.9;
}

.apps-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  flex: 1;
}

.app-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.app-card:not(.coming-soon):hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.app-card.coming-soon {
  opacity: 0.7;
  cursor: not-allowed;
}

.app-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.app-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.app-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.coming-soon-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.home-footer {
  text-align: center;
  color: white;
  margin-top: 60px;
  padding: 20px;
  opacity: 0.8;
}

.home-footer .footer-tip {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.9;
}

.help-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.help-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.help-content h3 {
  margin-top: 0;
  color: #333;
}

.help-content ul {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.help-content li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  color: #666;
}

.help-content button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
}

.help-content button:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .home-header h1 {
    font-size: 36px;
  }
}
</style>
