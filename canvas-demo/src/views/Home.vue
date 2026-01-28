<template>
  <div class="home">
    <header class="home-header">
      <h1>📚 文档中心</h1>
      <p>选择一个应用开始创作</p>
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
    </footer>
  </div>
</template>

<script setup>
import AppCard from '../components/home/AppCard.vue'
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

@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .home-header h1 {
    font-size: 36px;
  }
}
</style>
