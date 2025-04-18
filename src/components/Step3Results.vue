<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue';

const props = defineProps({
  activeFields: {
    type: Array,
    required: true
  },
  pdfFile: {
    type: Object,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  pdfPages: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  isFromHistory: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['back-step', 'save-to-history', 'update:current-page']);

// Local current page
const localCurrentPage = ref(props.currentPage || 1);

// Watch for prop changes
watch(() => props.currentPage, (newPage) => {
  localCurrentPage.value = newPage;
});

// Handle page change
const changePage = (page) => {
  localCurrentPage.value = page;
  emit('update:current-page', page);
};

// Computed PDF src with page
const pdfSrc = computed(() => {
  if (!props.pdfUrl) return '';
  return `${props.pdfUrl}#page=${localCurrentPage.value}`;
});

// Format the results for CSV download
const formatCSV = () => {
  const headers = props.activeFields.map(field => field.name).join(',');
  const values = props.activeFields.map(field => `"${field.value || ''}"`).join(',');
  return `${headers}\n${values}`;
};

// Download as CSV
const downloadCSV = () => {
  const csvContent = formatCSV();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `extraction_results_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Save to history only
const saveToHistory = () => {
  emit('save-to-history');
};

// Go back to previous step
const goToPreviousStep = () => {
  emit('back-step');
};

// Close viewer and go back to history
const closeViewer = () => {
  emit('close-viewer');
};
</script>

<template>
  <v-container class="pa-0 d-flex flex-column align-center" fluid>
    <v-card 
      elevation="1" 
      class="mx-4 mb-4 rounded-lg"
      max-width="1000"
      style="width: 100%;"
    >
      <v-card-item class="pa-0">
        <v-card-title class="panel-header pa-4 text-white d-flex align-center">
          <span>抽出結果</span>
          <v-spacer></v-spacer>
          
          <!-- Page navigation if multiple pages -->
          <v-pagination
            v-if="pdfPages && pdfPages.length > 1"
            v-model="localCurrentPage"
            :length="pdfPages.length"
            density="compact"
            color="white"
            @update:model-value="changePage"
            class="my-0 py-0"
          ></v-pagination>
        </v-card-title>
      </v-card-item>
      <v-card-text class="px-6 py-5">
        <div class="d-flex full-width" style="gap: 24px;">
          <!-- PDF Preview -->
          <div class="flex-grow-1" style="width: 40%;">
            <div class="text-h6 mb-3">PDF ファイル</div>
            <div class="pdf-preview mb-4" style="height: 400px;">
              <iframe :src="pdfSrc" width="100%" height="100%"></iframe>
            </div>
            <div class="text-caption">
              ファイル名: {{ pdfFile?.name || 'No file' }}
            </div>
          </div>

          <!-- Extracted Data -->
          <div class="flex-grow-1" style="width: 60%;">
            <div class="text-h6 mb-3">抽出データ</div>
            <v-table class="elevation-1 rounded">
              <thead>
                <tr>
                  <th>フィールド</th>
                  <th>値</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="field in activeFields" :key="field.id">
                  <td>{{ field.name }}</td>
                  <td>{{ field.value }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>

        <v-divider class="my-6"></v-divider>

        <div class="d-flex">
          <template v-if="isFromHistory">
            <v-btn
              color="grey-lighten-1"
              variant="outlined"
              size="large"
              min-height="56"
              @click="closeViewer"
              class="mt-4 me-2"
            >
              <v-icon left class="mr-2">mdi-arrow-left</v-icon>
              履歴に戻る
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              color="grey-lighten-1"
              variant="outlined"
              size="large"
              min-height="56"
              @click="goToPreviousStep"
              class="mt-4 me-2"
            >
              <v-icon left class="mr-2">mdi-arrow-left</v-icon>
              編集に戻る
            </v-btn>
          </template>
          
          <v-spacer></v-spacer>

          <v-btn
            color="info"
            variant="outlined"
            size="large"
            min-height="56"
            @click="downloadCSV"
            class="mt-4 ms-2"
          >
            <v-icon left class="mr-2">mdi-download</v-icon>
            CSVでダウンロード
          </v-btn>

          <v-btn
            v-if="!isFromHistory"
            color="success"
            size="large"
            min-height="56"
            @click="saveToHistory"
            class="mt-4 ms-2"
          >
            <v-icon left class="mr-2">mdi-content-save</v-icon>
            保存
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.pdf-preview {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  background: linear-gradient(to right, #1976D2, #0288D1);
  border-radius: 8px 8px 0 0;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style> 