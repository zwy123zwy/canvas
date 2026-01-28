<template>
  <div class="app-card" @click="navigateTo" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="app-icon">{{ icon }}</div>
    <h3 class="app-title">{{ title }}</h3>
    <p class="app-description">{{ description }}</p>
    <div class="app-features" v-if="features && features.length > 0">
      <span v-for="feature in features" :key="feature" class="feature-tag">{{ feature }}</span>
    </div>
    <div class="coming-soon-badge" v-if="isComingSoon">即将推出</div>
    
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  icon: String,
  title: String,
  description: String,
  features: Array,
  isComingSoon: Boolean,
  path: String
})

const emit = defineEmits(['click'])
const router = useRouter()
const isLoading = ref(false)
const isHovered = ref(false)

const navigateTo = async () => {
  if (props.isComingSoon) {
    return
  }
  
  if (props.path) {
    try {
      isLoading.value = true
      
      // 添加防抖，避免快速点击
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('导航到:', props.path)
      
      // 使用 replace 而不是 push，避免历史记录问题
      await router.push(props.path)
      
      console.log('导航成功')
      
    } catch (err) {
      if (err.name !== 'NavigationDuplicated') {
        console.error('路由跳转错误:', err)
        alert('页面跳转失败，请稍后重试')
      }
    } finally {
      isLoading.value = false
    }
  }
  
  emit('click')
}
</script>

<style scoped>
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
  filter: grayscale(100%);
}

.app-card.coming-soon:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.app-icon {
  font-size: 64px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.app-card:hover .app-icon {
  transform: scale(1.1);
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  transition: color 0.3s ease;
}

.app-card:hover .app-title {
  color: #3498db;
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
  transition: all 0.3s ease;
}

.app-card:hover .feature-tag {
  background: #3498db;
  color: white;
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
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
