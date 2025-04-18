<script setup>
// Header component with logo and navigation
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['change-view']);
const currentView = ref('process');

const changeView = (view) => {
  currentView.value = view;
  emit('change-view', view);
};

const goToHome = () => {
  currentView.value = 'home';
  emit('change-view', 'home');
};
</script>

<template>
  <v-app-bar color="grey-lighten-4" elevation="4" class="modern-header">
    <v-container class="px-4 d-flex align-center" fluid style="max-width: none; height: 100%;">
      <div class="d-flex align-center cursor-pointer" @click="goToHome">
        <img src="@/assets/logo.png" alt="Detomo Logo" height="36" class="mr-3" />
        <v-app-bar-title class="text-h5 font-weight-bold">Detomo OCR</v-app-bar-title>
      </div>
      
      <div class="d-flex align-center ml-8">
        <v-tabs 
          v-model="currentView"
          color="white"
          align-tabs="center"
        >
          <v-tab value="home" @click="changeView('home')">
            <v-icon start>mdi-home</v-icon>
            ホーム
          </v-tab>
          <v-tab value="process" @click="changeView('process')">
            <v-icon start>mdi-file-document-outline</v-icon>
            処理
          </v-tab>
          <v-tab value="history" @click="changeView('history')">
            <v-icon start>mdi-history</v-icon>
            履歴
          </v-tab>
        </v-tabs>
      </div>
      
      <v-spacer></v-spacer>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.modern-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.v-tab) {
  font-weight: 500;
  color: #1976D2;
}

:deep(.v-tab--selected) {
  background-color: rgba(25, 118, 210, 0.1);
}

.cursor-pointer {
  cursor: pointer;
}
</style> 