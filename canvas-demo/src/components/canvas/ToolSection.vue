<template>
  <div class="tool-section">
    <div class="section-header" @click="toggleCollapse">
      <span class="collapse-arrow" :class="{ collapsed: isCollapsed }">▶</span>
      <span class="section-title">{{ title }}</span>
    </div>
    <transition name="expand">
      <div v-show="!isCollapsed" class="section-content">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  }
})

const isCollapsed = ref(props.defaultCollapsed)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.tool-section {
  margin-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.section-header:hover {
  background: #f8f9fa;
}

.collapse-arrow {
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
  margin-right: 8px;
  display: inline-block;
  width: 12px;
}

.collapse-arrow.collapsed {
  transform: rotate(0deg);
}

.collapse-arrow:not(.collapsed) {
  transform: rotate(90deg);
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.section-content {
  padding: 8px 12px 12px 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
