<template>
  <div class="table-editor">
    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="goHome">
          ← 返回主页
        </button>
        <div class="header-main">
          <h1>📊 表格编辑器</h1>
          <p>数据管理和分析，支持排序、筛选、计算等功能</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="addRow">
          ➕ 添加行
        </button>
        <button class="action-btn" @click="addColumn">
          ➕ 添加列
        </button>
        <button class="action-btn" @click="saveTable">
          💾 保存
        </button>
        <button class="action-btn" @click="exportToCSV">
          📤 导出CSV
        </button>
      </div>
    </header>
    
    <div class="editor-content">
      <div class="table-controls">
        <div class="control-group">
          <label>行数: {{ rows.length }}</label>
          <label>列数: {{ columns.length }}</label>
        </div>
        
        <div class="control-group">
          <input 
            type="text" 
            placeholder="搜索..." 
            v-model="searchQuery"
            class="search-input"
          />
          <select v-model="sortColumn" class="sort-select">
            <option value="">选择排序列</option>
            <option v-for="col in columns" :key="col.id" :value="col.id">
              {{ col.name }}
            </option>
          </select>
          <button @click="toggleSortOrder" class="sort-btn">
            {{ sortOrder === 'asc' ? '↑' : '↓' }} 排序
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.id" @click="sortTable(col.id)">
                {{ col.name }}
                <span v-if="sortColumn === col.id">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in filteredRows" :key="row.id">
              <td v-for="col in columns" :key="col.id">
                <input 
                  type="text" 
                  v-model="row.data[col.id]"
                  @input="updateCell(row.id, col.id, $event.target.value)"
                  class="cell-input"
                />
              </td>
              <td class="actions-cell">
                <button @click="deleteRow(row.id)" class="delete-btn">🗑️ 删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-stats">
        <div class="stat-item">
          <strong>统计信息:</strong>
        </div>
        <div class="stat-item" v-for="col in numericColumns" :key="col.id">
          {{ col.name }}: 
          <span class="stat-value">总和: {{ getColumnSum(col.id) }}</span>
          <span class="stat-value">平均值: {{ getColumnAverage(col.id) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

// 表格数据
const columns = ref([
  { id: 'name', name: '姓名' },
  { id: 'age', name: '年龄' },
  { id: 'score', name: '分数' },
  { id: 'department', name: '部门' }
])

const rows = ref([
  { id: 1, data: { name: '张三', age: '25', score: '85', department: '技术部' } },
  { id: 2, data: { name: '李四', age: '30', score: '92', department: '销售部' } },
  { id: 3, data: { name: '王五', age: '28', score: '78', department: '人事部' } }
])

const nextRowId = ref(4)
const nextColumnId = ref(5)

// 搜索和排序
const searchQuery = ref('')
const sortColumn = ref('')
const sortOrder = ref('asc')

// 计算属性
const filteredRows = computed(() => {
  let result = [...rows.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(row => {
      return Object.values(row.data).some(value => 
        String(value).toLowerCase().includes(query)
      )
    })
  }
  
  // 排序
  if (sortColumn.value) {
    result.sort((a, b) => {
      const aVal = a.data[sortColumn.value]
      const bVal = b.data[sortColumn.value]
      
      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1
      
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }
  
  return result
})

const numericColumns = computed(() => {
  return columns.value.filter(col => col.name === '年龄' || col.name === '分数')
})

// 方法
const addRow = () => {
  const newRow = {
    id: nextRowId.value++,
    data: {}
  }
  
  columns.value.forEach(col => {
    newRow.data[col.id] = ''
  })
  
  rows.value.push(newRow)
  saveTable()
}

const addColumn = () => {
  const columnName = prompt('请输入列名:', `列${columns.value.length + 1}`)
  if (columnName) {
    const newColumn = {
      id: `col_${nextColumnId.value++}`,
      name: columnName
    }
    columns.value.push(newColumn)
    
    // 为现有行添加新列数据
    rows.value.forEach(row => {
      row.data[newColumn.id] = ''
    })
    
    saveTable()
  }
}

const deleteRow = (rowId) => {
  if (rows.value.length > 1) {
    rows.value = rows.value.filter(row => row.id !== rowId)
    saveTable()
  } else {
    alert('至少需要保留一行数据')
  }
}

const updateCell = (rowId, colId, value) => {
  const row = rows.value.find(r => r.id === rowId)
  if (row) {
    row.data[colId] = value
    saveTable()
  }
}

const sortTable = (columnId) => {
  if (sortColumn.value === columnId) {
    toggleSortOrder()
  } else {
    sortColumn.value = columnId
    sortOrder.value = 'asc'
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const getColumnSum = (colId) => {
  return filteredRows.value.reduce((sum, row) => {
    const value = parseFloat(row.data[colId])
    return sum + (isNaN(value) ? 0 : value)
  }, 0)
}

const getColumnAverage = (colId) => {
  const sum = getColumnSum(colId)
  const count = filteredRows.value.length
  return count > 0 ? (sum / count).toFixed(2) : 0
}

const saveTable = () => {
  const tableData = {
    columns: columns.value,
    rows: rows.value,
    nextRowId: nextRowId.value,
    nextColumnId: nextColumnId.value
  }
  localStorage.setItem('table-editor-data', JSON.stringify(tableData))
}

const exportToCSV = () => {
  const headers = columns.value.map(col => col.name).join(',')
  const rowsData = filteredRows.value.map(row => 
    columns.value.map(col => `"${row.data[col.id]}"`).join(',')
  ).join('\n')
  
  const csvContent = headers + '\n' + rowsData
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'table_data.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 生命周期
onMounted(() => {
  const savedData = localStorage.getItem('table-editor-data')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      columns.value = data.columns || columns.value
      rows.value = data.rows || rows.value
      nextRowId.value = data.nextRowId || nextRowId.value
      nextColumnId.value = data.nextColumnId || nextColumnId.value
    } catch (error) {
      console.error('Failed to load saved table data:', error)
    }
  }
})

onUnmounted(() => {
  saveTable()
})

// 监听数据变化，自动保存
watch([columns, rows], () => {
  saveTable()
}, { deep: true })
</script>

<style scoped>
.table-editor {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow-x: hidden;
}

.editor-header {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 15px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-main h1 {
  font-size: 24px;
  margin-bottom: 5px;
}

.header-main p {
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-controls {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.control-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.control-group label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.sort-btn {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  background: white;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.data-table th, .data-table td {
  border: 1px solid #e0e0e0;
  padding: 12px;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  cursor: pointer;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th:hover {
  background: #e9ecef;
}

.cell-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.cell-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.actions-cell {
  display: flex;
  gap: 5px;
}

.delete-btn {
  padding: 4px 8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: #ff6b81;
}

.table-stats {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.stat-value {
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input {
    min-width: 150px;
  }
}
</style>
