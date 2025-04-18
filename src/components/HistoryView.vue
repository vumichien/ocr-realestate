<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getHistoryEntries, deleteHistoryEntry } from '../services/database';
import { base64ToBlob } from '../utils/thumbnailUtils';

const props = defineProps({
  active: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['view-extraction', 'continue-extraction']);

const historyItems = ref([]);
const loading = ref(true);
const searchQuery = ref('');

// Load history items
const loadHistoryItems = async () => {
  loading.value = true;
  try {
    historyItems.value = await getHistoryEntries();
  } catch (error) {
    console.error('Error loading history:', error);
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// View extraction details
const viewExtraction = (item) => {
  emit('view-extraction', item);
};

// Continue extraction processing
const continueExtraction = (item) => {
  emit('continue-extraction', item);
};

// Delete history item
const deleteItem = async (id) => {
  try {
    await deleteHistoryEntry(id);
    await loadHistoryItems();
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
};

// Filter history items by search query
const filteredItems = computed(() => {
  if (!searchQuery.value) return historyItems.value;
  
  const query = searchQuery.value.toLowerCase();
  return historyItems.value.filter(item => 
    item.filename.toLowerCase().includes(query)
  );
});

// Watch for active prop changes to reload data when component becomes visible
watch(() => props.active, (isActive) => {
  if (isActive) {
    loadHistoryItems();
  }
});

// Load history on component mount
onMounted(() => {
  loadHistoryItems();
});
</script>

<template>
  <v-container class="pa-0 d-flex flex-column align-center" fluid>
    <v-card 
      elevation="1" 
      class="mx-4 mb-4 mt-8 rounded-lg"
      max-width="1200"
      style="width: 100%;"
    >
      <v-card-item class="pa-0">
        <v-card-title class="history-header pa-4 text-white d-flex align-center">
          <span>抽出履歴</span>
          <v-spacer></v-spacer>
          <v-btn 
            icon="mdi-refresh" 
            color="white" 
            size="small" 
            variant="text"
            @click="loadHistoryItems"
            :loading="loading"
          ></v-btn>
        </v-card-title>
      </v-card-item>
      <v-card-text class="px-6 py-5">
        <!-- Search and filters -->
        <div class="mb-5">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="検索"
            single-line
            hide-details
            density="comfortable"
            variant="outlined"
            class="max-width-500"
          ></v-text-field>
        </div>
        
        <!-- History table -->
        <v-card elevation="1" rounded class="history-table-card">
          <v-table class="history-table">
            <thead>
              <tr class="table-header-row">
                <th class="text-left" style="width: 100px">画像</th>
                <th class="text-left">タイトル</th>
                <th class="text-left" style="width: 120px">状態</th>
                <th class="text-left" style="width: 180px">アップロード日</th>
                <th class="text-center" style="width: 200px">アクション</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loading">
                <tr>
                  <td colspan="5" class="text-center pa-5">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-3">読み込み中...</div>
                  </td>
                </tr>
              </template>
              <template v-else-if="filteredItems.length === 0">
                <tr>
                  <td colspan="5" class="text-center pa-5">
                    <v-icon icon="mdi-history-off" size="x-large" color="grey-lighten-1" class="mb-2"></v-icon>
                    <div>履歴がありません</div>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="item in filteredItems" :key="item.id" class="table-row">
                  <!-- Thumbnail -->
                  <td class="py-3">
                    <div class="thumbnail-container">
                      <v-img
                        :src="item.thumbnail || ''"
                        :aspect-ratio="1"
                        cover
                        width="80"
                        height="80"
                        class="rounded elevation-1"
                        :alt="item.filename"
                      >
                        <template v-slot:placeholder>
                          <v-icon icon="mdi-file-pdf-box" size="40" color="grey-lighten-1"></v-icon>
                        </template>
                      </v-img>
                    </div>
                  </td>
                  
                  <!-- Filename -->
                  <td class="text-subtitle-1 filename-cell">{{ item.filename }}</td>
                  
                  <!-- Status -->
                  <td>
                    <v-chip
                      :color="item.state === 'Done' ? 'success' : 'warning'"
                      size="small"
                      class="text-white"
                    >
                      {{ item.state === 'Done' ? '完了' : '処理中' }}
                    </v-chip>
                  </td>
                  
                  <!-- Upload date -->
                  <td class="date-cell">{{ formatDate(item.upload_date) }}</td>
                  
                  <!-- Actions -->
                  <td>
                    <div class="d-flex justify-center gap-2">
                      <v-btn
                        v-if="item.state === 'Done'"
                        color="primary"
                        size="small"
                        variant="text"
                        @click="viewExtraction(item)"
                      >
                        <v-icon>mdi-eye</v-icon>
                        表示
                      </v-btn>
                      
                      <v-btn
                        v-else
                        color="warning"
                        size="small"
                        variant="text"
                        @click="continueExtraction(item)"
                      >
                        <v-icon>mdi-play</v-icon>
                        続行
                      </v-btn>
                      
                      <v-btn
                        color="error"
                        size="small"
                        variant="text"
                        @click="deleteItem(item.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                        削除
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </v-table>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.history-header {
  background: linear-gradient(to right, #1976D2, #0288D1);
  border-radius: 8px 8px 0 0;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.max-width-500 {
  max-width: 500px;
}

.history-table-card {
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.history-table {
  border-collapse: separate;
  border-spacing: 0;
}

.table-header-row {
  background-color: #f5f5f5;
}

.table-header-row th {
  padding: 14px 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.table-row {
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-row td {
  border-bottom: 1px solid #eee;
  padding: 12px 16px;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  padding: 5px;
}

.filename-cell {
  font-weight: 500;
  color: #444;
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-cell {
  color: #666;
  font-size: 0.9rem;
}
</style> 