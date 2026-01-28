<template>
  <div class="app-card" @click="navigateTo">
    <div class="app-icon">{{ icon }}</div>
    <h3 class="app-title">{{ title }}</h3>
    <p class="app-description">{{ description }}</p>
    <div class="app-features" v-if="features && features.length > 0">
      <span v-for="feature in features" :key="feature" class="feature-tag">{{ feature }}</span>
    </div>
    <div class="coming-soon-badge" v-if="isComingSoon">即将推出</div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
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

const navigateTo = () => {
  if (props.isComingSoon) {
    return
  }
  
  if (props.path) {
    router.push(props.path)
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
</style>
