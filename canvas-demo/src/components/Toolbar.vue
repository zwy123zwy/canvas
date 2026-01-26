<template>
  <div class="toolbar">
    <!-- 绘制工具 -->
    <ToolSection title="绘制工具">
      <ToolButton
        icon="✏️"
        label="画笔"
        :active="currentTool === 'pen'"
        @click="$emit('update:tool', 'pen')"
      />
      <ToolButton
        icon="▭"
        label="矩形"
        :active="currentTool === 'rectangle'"
        @click="$emit('update:tool', 'rectangle')"
      />
      <ToolButton
        icon="○"
        label="圆形"
        :active="currentTool === 'circle'"
        @click="$emit('update:tool', 'circle')"
      />
      <ToolButton
        icon="✋"
        label="平移画布"
        :active="currentTool === 'pan'"
        @click="$emit('update:tool', 'pan')"
      />
    </ToolSection>

    <!-- 样式设置 -->
    <ToolSection title="样式设置">
      <div class="color-tool">
        <input
          type="color"
          class="color-input"
          :value="color"
          @input="$emit('update:color', $event.target.value)"
        />
        <span class="color-label">颜色</span>
      </div>
      <div class="width-tool">
        <div class="width-preview" :style="{ width: lineWidth + 'px', height: lineWidth + 'px' }"></div>
        <input
          type="range"
          min="1"
          max="20"
          :value="lineWidth"
          @input="$emit('update:lineWidth', Number($event.target.value))"
          class="width-slider"
        />
      </div>
    </ToolSection>

    <!-- 操作 -->
    <ToolSection title="操作">
      <ToolButton
        icon="↶"
        label="撤销 (Ctrl+Z)"
        :disabled="!canUndo"
        @click="$emit('undo')"
      />
      <ToolButton
        icon="↷"
        label="重做 (Ctrl+Y)"
        :disabled="!canRedo"
        @click="$emit('redo')"
      />
      <ToolButton
        icon="🗑️"
        label="清空画布"
        @click="$emit('clear')"
      />
      <ToolButton
        icon="🔄"
        label="重置视图"
        @click="$emit('resetTransform')"
      />
    </ToolSection>
  </div>
</template>

<script setup>
import ToolButton from './ToolButton.vue'
import ToolSection from './ToolSection.vue'

defineProps({
  currentTool: {
    type: String,
    default: 'pen'
  },
  color: {
    type: String,
    default: '#000000'
  },
  lineWidth: {
    type: Number,
    default: 2
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:tool',
  'update:color',
  'update:lineWidth',
  'undo',
  'redo',
  'clear',
  'resetTransform'
])
</script>

<style scoped>
.toolbar {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.color-tool {
  grid-column: span 3;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
}

.color-input {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
}

.color-label {
  font-size: 12px;
  color: #666;
}

.width-tool {
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
}

.width-slider {
  width: 100%;
  cursor: pointer;
}

.width-preview {
  background: #333;
  border-radius: 50%;
  transition: all 0.2s;
}
</style>
