<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  defaultFields: {
    type: Array,
    required: true
  },
  suggestedFields: {
    type: Array,
    required: true
  },
  activeFields: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:activeFields', 'file-upload', 'next-step']);

const newFieldName = ref('');
const fileUploaded = ref(false);

// Add a custom field
const addCustomField = () => {
  if (newFieldName.value.trim()) {
    const newId = Math.max(...props.activeFields.map(f => f.id), 0) + 1;
    const newField = {
      id: newId,
      name: newFieldName.value.trim(),
      value: '',
      required: false
    };
    
    emit('update:activeFields', [...props.activeFields, newField]);
    newFieldName.value = '';
  }
};

// Remove a field - modified to allow removing any field
const removeField = (id) => {
  const updatedFields = props.activeFields.filter(field => field.id !== id);
  emit('update:activeFields', updatedFields);
};

// Add a suggested field
const addSuggestedField = (field) => {
  if (!props.activeFields.some(f => f.name === field.name)) {
    emit('update:activeFields', [...props.activeFields, { ...field }]);
  }
};

// Handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    emit('file-upload', file);
    fileUploaded.value = true;
  }
};

// Move to next step
const goToNextStep = () => {
  emit('next-step');
};
</script>

<template>
  <v-container class="pa-0 d-flex flex-column align-center" fluid style="max-width: none;">
    <!-- File Upload Card -->
    <v-card 
      elevation="1" 
      class="mx-4 mb-4 rounded-lg mt-2"
      max-width="800"
      style="width: 100%;"
    >
      <v-card-item class="pa-0">
        <v-card-title class="upload-card-header pa-4 text-white">
          不動産書類 OCR 処理
        </v-card-title>
      </v-card-item>
      <v-card-text class="px-6 pb-4 pt-5">
        <v-file-input
          accept="application/pdf"
          label="PDF ファイルをアップロード"
          @change="handleFileUpload"
          prepend-icon="mdi-file-pdf-box"
          show-size
          truncate-length="20"
          variant="outlined"
          style="margin: 0 auto;"
        ></v-file-input>
      </v-card-text>
    </v-card>

    <!-- Extraction Fields Card - only shown after file upload -->
    <v-card 
      v-if="fileUploaded"
      elevation="1" 
      class="mx-4 mb-4 rounded-lg"
      max-width="800"
      style="width: 100%;"
    >
      <v-card-item class="pa-0">
        <v-card-title class="upload-card-header pa-4 text-white">
          抽出するフィールド
        </v-card-title>
      </v-card-item>
      <v-card-text class="px-6 py-4">
        <div class="text-body-1 mb-4">抽出するフィールドを選択してください：</div>
        
        <!-- Changed to div with flexbox for multi-row display -->
        <div class="selected-fields-container">
          <v-chip
            v-for="field in activeFields"
            :key="field.id"
            :color="field.required ? 'primary' : 'secondary'"
            closable
            @click:close="removeField(field.id)"
            class="ma-1"
          >
            {{ field.name }}
          </v-chip>
        </div>

        <v-divider class="my-4"></v-divider>

        <v-row align="center" class="mb-4">
          <v-col cols="9">
            <v-text-field
              v-model="newFieldName"
              label="カスタムフィールドを追加"
              density="comfortable"
              variant="outlined"
              @keyup.enter="addCustomField"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn
              color="primary"
              block
              @click="addCustomField"
              :disabled="!newFieldName"
              min-height="56"
            >
              追加
            </v-btn>
          </v-col>
        </v-row>

        <div class="text-subtitle-1 mb-3">推奨フィールド:</div>
        <!-- Changed to div with flexbox for multi-row display -->
        <div class="suggested-fields-container">
          <v-chip
            v-for="field in suggestedFields"
            :key="field.id"
            @click="addSuggestedField(field)"
            :disabled="activeFields.some(f => f.name === field.name)"
            color="info"
            variant="outlined"
            class="ma-1"
          >
            {{ field.name }}
          </v-chip>
        </div>

        <v-divider class="my-6"></v-divider>

        <v-btn
          color="primary"
          block
          size="large"
          min-height="56"
          class="mt-4"
          @click="goToNextStep"
        >
          <v-icon left class="mr-2">mdi-arrow-right</v-icon>
          次のステップへ
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.upload-card-header {
  background: linear-gradient(to right, #1976D2, #0288D1);
  border-radius: 8px 8px 0 0;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.selected-fields-container,
.suggested-fields-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
</style> 