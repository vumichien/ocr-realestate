<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['step-change']);

const steps = [
  { step: 1, title: "ファイルアップロード", icon: "mdi-file-upload-outline" },
  { step: 2, title: "レビュー・分析", icon: "mdi-file-document-outline" },
  { step: 3, title: "結果", icon: "mdi-text-box-check-outline" }
];

const goToStep = (step) => {
  // Only allow going back to previous steps, not forward
  if (step < props.currentStep) {
    emit('step-change', step);
  }
};
</script>

<template>
  <div class="stepper-container">
    <v-card class="my-3 mx-auto stepper-card" flat max-width="800">
      <v-card-text class="pa-2">
        <v-stepper :model-value="currentStep" class="elevation-0">
          <v-stepper-header class="bg-transparent stepper-header">
            <template v-for="(step, i) in steps" :key="i">
              <v-stepper-item
                :value="step.step"
                :complete="currentStep > step.step"
                :editable="step.step < currentStep"
                @click="goToStep(step.step)"
                class="compact-step"
              >
                <v-icon :icon="step.icon" size="small"></v-icon>
                <span class="text-caption">{{ step.title }}</span>
              </v-stepper-item>
              
              <v-divider v-if="i < steps.length - 1"></v-divider>
            </template>
          </v-stepper-header>
        </v-stepper>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.stepper-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.stepper-card {
  width: 100%;
}

.stepper-header {
  padding: 0;
}

.compact-step {
  min-height: 36px !important;
}

/* Custom styling for the stepper */
:deep(.v-stepper-header) {
  box-shadow: none;
}

:deep(.v-stepper-item--complete), 
:deep(.v-stepper-item--active) {
  color: var(--v-primary-base) !important;
}

:deep(.v-stepper-item) {
  cursor: pointer;
  font-size: 0.85rem;
  min-height: 36px !important;
  padding: 8px !important;
}

:deep(.v-stepper-item--disabled) {
  cursor: not-allowed;
}

:deep(.v-stepper-item__avatar) {
  margin-right: 4px !important;
  height: 24px !important;
  width: 24px !important;
  min-width: 24px !important;
}

:deep(.v-stepper-divider) {
  margin: 0 6px !important;
}
</style> 