<template>
  <div class="view-tabs">
    <div class="tabs-container">
      <div
        v-for="(view, index) in views"
        :key="view.id"
        :class="['tab', { active: currentViewId === view.id }]"
        @click="$emit('switch', view.id)"
      >
        <span class="tab-label">视图 {{ index + 1 }}</span>
        <button
          v-if="views.length > 1"
          class="tab-close"
          @click.stop="$emit('close', view.id)"
          title="关闭视图"
        >
          ×
        </button>
      </div>
      <button class="tab-add" @click="$emit('add')" title="新建视图">
        +
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  views: {
    type: Array,
    required: true
  },
  currentViewId: {
    type: String,
    required: true
  }
})

defineEmits(['switch', 'close', 'add'])
</script>

<style scoped>
.view-tabs {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  padding: 0;
  display: flex;
  align-items: center;
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
}

.tabs-container::-webkit-scrollbar {
  height: 4px;
}

.tabs-container::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e9ecef;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 80px;
}

.tab:hover {
  background: #dee2e6;
}

.tab.active {
  background: white;
  border-color: #e0e0e0;
  border-bottom-color: white;
  font-weight: 500;
}

.tab-label {
  font-size: 13px;
  color: #495057;
}

.tab.active .tab-label {
  color: #212529;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  color: #6c757d;
  transition: all 0.2s;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #212529;
}

.tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #6c757d;
  transition: all 0.2s;
}

.tab-add:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}
</style>
