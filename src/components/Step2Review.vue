<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
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
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  activeFields: {
    type: Array,
    required: true
  },
  isProcessing: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits([
  'update:currentPage', 
  'update:activeFields', 
  'process-pdf', 
  'back-step',
  'next-step'
]);

// Update the current page
const updateCurrentPage = (page) => {
  emit('update:currentPage', page);
};

// Remove a field
const removeField = (id) => {
  const updatedFields = props.activeFields.filter(field => field.id !== id);
  emit('update:activeFields', updatedFields);
};

// Process the PDF for OCR
const processPdf = () => {
  emit('process-pdf');
};

// Update field value
const updateFieldValue = (id, value) => {
  const updatedFields = props.activeFields.map(field => {
    if (field.id === id) {
      return { ...field, value };
    }
    return field;
  });
  emit('update:activeFields', updatedFields);
};

// Go back to previous step
const goToPreviousStep = () => {
  emit('back-step');
};

// Move to next step
const goToNextStep = () => {
  emit('next-step');
};
</script>

<template>
  <v-container class="pa-0" fluid>
    <div class="d-flex full-width px-4" style="gap: 16px;">
      <!-- PDF Preview Panel -->
      <v-card elevation="2" class="rounded-lg flex-grow-1" width="50%">
        <v-card-title class="panel-header d-flex align-center px-6 py-3">
          <span class="text-white">PDF プレビュー</span>
          <v-spacer></v-spacer>
          <v-pagination
            v-if="pdfPages.length > 1"
            :model-value="currentPage"
            :length="pdfPages.length"
            total-visible="5"
            density="compact"
            color="white"
            @update:model-value="updateCurrentPage"
          ></v-pagination>
        </v-card-title>
        <v-card-text class="px-6 py-6">
          <div class="pdf-preview">
            <iframe :src="pdfUrl + '#page=' + currentPage" width="100%" height="700px"></iframe>
          </div>
        </v-card-text>
      </v-card>

      <!-- Extraction Info Panel -->
      <v-card elevation="2" class="rounded-lg flex-grow-1" width="50%">
        <v-card-title class="panel-header text-white px-6 py-3">抽出情報</v-card-title>
        <v-card-text class="px-6 py-6">
          <div class="extraction-fields">
            <div 
              v-for="field in activeFields" 
              :key="field.id" 
              class="field-item mb-4"
            >
              <div class="d-flex align-center mb-2">
                <v-chip
                  size="small"
                  class="mr-2"
                  :color="field.required ? 'primary' : 'secondary'"
                >
                  {{ field.name }}
                </v-chip>

                <v-spacer></v-spacer>

                <v-btn
                  icon="mdi-close"
                  size="small"
                  @click="removeField(field.id)"
                  color="error"
                  variant="text"
                ></v-btn>
              </div>

              <v-text-field
                :model-value="field.value"
                @update:model-value="(value) => updateFieldValue(field.id, value)"
                density="comfortable"
                variant="outlined"
                hide-details
                class="w-100"
                placeholder=""
              ></v-text-field>
            </div>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex">
            <v-btn
              color="grey-lighten-1"
              variant="outlined"
              size="large"
              min-height="56"
              @click="goToPreviousStep"
              class="mt-4 me-2"
            >
              <v-icon left class="mr-2">mdi-arrow-left</v-icon>
              戻る
            </v-btn>
            
            <v-spacer></v-spacer>

            <v-btn
              v-if="!activeFields.some(field => field.value)"
              color="success"
              block
              size="large"
              min-height="56"
              @click="processPdf"
              :disabled="!pdfFile || activeFields.length === 0 || isProcessing"
              :loading="isProcessing"
              class="mt-4 ms-2"
            >
              <v-icon left class="mr-2">mdi-text-recognition</v-icon>
              OCR 処理を実行
            </v-btn>

            <v-btn
              v-else
              color="primary"
              block
              size="large"
              min-height="56"
              @click="goToNextStep"
              class="mt-4 ms-2"
            >
              <v-icon left class="mr-2">mdi-arrow-right</v-icon>
              次のステップへ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
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

.extraction-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-item {
  width: 100%;
}
</style> 