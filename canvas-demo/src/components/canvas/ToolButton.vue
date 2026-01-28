<template>
  <button
    :class="['tool-button', { active, disabled }]"
    @click="handleClick"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    :disabled="disabled"
  >
    <span class="tool-icon">{{ icon }}</span>
    <span class="tool-tooltip" :class="{ show: isTooltipVisible }">{{ label }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const isTooltipVisible = ref(false)
let tooltipTimer = null

const showTooltip = () => {
  if (props.disabled) return
  
  isTooltipVisible.value = true
  
  // 清除之前的定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
  }
  
  // 2.5秒后自动隐藏
  tooltipTimer = setTimeout(() => {
    isTooltipVisible.value = false
  }, 2500)
}

const hideTooltip = () => {
  isTooltipVisible.value = false
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
}

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.tool-button {
  position: relative;
  width: 44px;
  height: 44px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.tool-icon {
  display: block;
  line-height: 1;
}

.tool-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tool-tooltip.show {
  opacity: 1;
}

.tool-tooltip::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid rgba(0, 0, 0, 0.85);
}

.tool-button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #b0b0b0;
}

.tool-button.active {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.tool-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #fafafa;
}
</style>
