<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { extractInformationFromImage } from './services/openai';
import { convertPdfPageToImage, getPdfPageCount } from './utils/pdfUtils';
import { generatePdfThumbnail, base64ToBlob } from './utils/thumbnailUtils';
import { initDatabase, saveToHistory, updateExtractionState, getHistoryEntry, updateExtractionData } from './services/database';

// Components
import AppHeader from './components/AppHeader.vue';
import ProcessStepper from './components/ProcessStepper.vue';
import Step1Upload from './components/Step1Upload.vue';
import Step2Review from './components/Step2Review.vue';
import Step3Results from './components/Step3Results.vue';
import HistoryView from './components/HistoryView.vue';
import HomeView from './components/HomeView.vue';

// Current view (home, process or history)
const currentView = ref('home');

// Current step in the process
const currentStep = ref(1);

// State for file upload and processing
const pdfFile = ref(null);
const pdfUrl = ref('');
const isProcessing = ref(false);
const pdfPages = ref([]);
const currentPage = ref(0);
const currentExtractionId = ref(null);
const viewingFromHistory = ref(false);

// Success dialog
const successDialog = ref(false);

// Default extraction fields
const defaultFields = [
  { id: 1, name: '物件種目', value: '', required: true },
  { id: 2, name: 'マンション名', value: '', required: true },
  { id: 3, name: '最寄駅', value: '', required: true },
  { id: 4, name: '間取り/タイプ', value: '', required: true },
  { id: 5, name: '価格', value: '', required: true },
  { id: 6, name: '物件', value: '', required: true },
  { id: 7, name: '所在地', value: '', required: true },
];

// Suggested fields
const suggestedFields = [
  { id: 8, name: '構造・規模', value: '' },
  { id: 9, name: '専有居住', value: '' },
  { id: 10, name: '築年月', value: '' },
  { id: 11, name: '管理会社', value: '' },
];

// Active fields to extract
const activeFields = ref([...defaultFields]);

// Change the current view
const changeView = (view) => {
  currentView.value = view;
  
  // If changing to process view, reset to step 1
  if (view === 'process') {
    // Only reset if we're not in the middle of an extraction
    // or if we're in a completed extraction
    if (!currentExtractionId.value) {
      startNew();
    } else {
      // Check if the extraction is still in progress
      getHistoryEntry(currentExtractionId.value).then(item => {
        if (!item || item.state === 'Done') {
          startNew();
        }
      }).catch(() => {
        // If there's an error, just start new
        startNew();
      });
    }
  }
};

// Start process from home view
const startProcess = () => {
  changeView('process');
};

// Initialize the database
onMounted(async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
});

// Handle file upload
const handleFileUpload = async (file) => {
  if (file && file.type === 'application/pdf') {
    pdfFile.value = file;
    pdfUrl.value = URL.createObjectURL(file);
    await loadPdfPreview();
    
    // Create a new extraction entry in the database
    await createExtractionEntry();
  }
};

// Load PDF preview
const loadPdfPreview = async () => {
  if (!pdfFile.value) return;
  
  try {
    const pageCount = await getPdfPageCount(pdfFile.value);
    pdfPages.value = Array.from({ length: pageCount }, (_, i) => i + 1);
    currentPage.value = 1;
  } catch (error) {
    console.error('Error loading PDF preview:', error);
  }
};

// Create a new extraction entry
const createExtractionEntry = async () => {
  try {
    if (!pdfFile.value) return;
    
    // Generate thumbnail
    const thumbnail = await generatePdfThumbnail(pdfFile.value, 1);
    console.log("Generated thumbnail");
    
    // Convert PDF to base64 for storage
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const pdfData = e.target.result;
      console.log("PDF converted to base64, length:", pdfData.length);
      
      // Save to database with 'Processing' state
      const id = await saveToHistory({
        filename: pdfFile.value.name,
        pdfData: pdfData,
        thumbnail: thumbnail,
        state: 'Processing',
        fieldsData: activeFields.value
      });
      
      console.log("Saved extraction to database with ID:", id);
      currentExtractionId.value = id;
    };
    
    reader.readAsDataURL(pdfFile.value);
  } catch (error) {
    console.error('Error creating extraction entry:', error);
  }
};

// Process the PDF for OCR
const processPdf = async () => {
  if (!pdfFile.value) return;
  
  isProcessing.value = true;
  
  try {
    // Convert the current PDF page to an image
    const base64Image = await convertPdfPageToImage(pdfFile.value, currentPage.value);
    
    // Call OpenAI API to extract information
    const extractedData = await extractInformationFromImage(base64Image, activeFields.value);
    
    // Update field values with extracted data
    activeFields.value.forEach(field => {
      if (extractedData[field.name]) {
        field.value = extractedData[field.name];
      }
    });
    
    // Update extraction entry in database
    if (currentExtractionId.value) {
      await updateExtractionData(currentExtractionId.value, {
        state: 'Processing',
        fieldsData: activeFields.value
      });
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Save to history (mark as Done) and show success dialog
const saveToHistoryComplete = async () => {
  try {
    if (currentExtractionId.value) {
      // Update the database with current field values and mark as Done
      await updateExtractionData(currentExtractionId.value, {
        state: 'Done',
        fieldsData: activeFields.value
      });
      
      // Show success dialog
      successDialog.value = true;
      
      // Reset after a short delay
      setTimeout(() => {
        startNew();
        successDialog.value = false;
      }, 2000);
    }
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

// Step navigation functions
const goToStep = (step) => {
  currentStep.value = step;
};

const goToNextStep = () => {
  currentStep.value++;
};

const goToPreviousStep = () => {
  currentStep.value--;
};

// Function to go back to history view
const goToHistoryView = () => {
  currentView.value = 'history';
  viewingFromHistory.value = false;
};

// View extraction from history
const viewExtraction = async (item) => {
  try {
    console.log("Viewing extraction with ID:", item.id);
    
    // Get the full extraction data to ensure we have all PDF data
    const extractionData = await getHistoryEntry(item.id);
    
    if (!extractionData) {
      console.error('Extraction data not found');
      return;
    }
    
    console.log("Retrieved extraction data:", {
      id: extractionData.id,
      filename: extractionData.filename,
      hasPdfData: !!extractionData.pdfData || !!extractionData.pdf_data,
      fieldsData: extractionData.fieldsData
    });
    
    // Load the extraction fields data
    activeFields.value = extractionData.fieldsData;
    
    // Create object URL from base64 data if available
    const pdfData = extractionData.pdfData || extractionData.pdf_data;
    if (pdfData) {
      console.log("PDF data found, creating blob");
      const blob = base64ToBlob(pdfData);
      pdfUrl.value = URL.createObjectURL(blob);
      
      // Create a File object from the blob to maintain filename
      pdfFile.value = new File([blob], extractionData.filename, { type: 'application/pdf' });
      
      // Load page count info
      await loadPdfPreview();
      console.log("PDF preview loaded with pages:", pdfPages.value.length);
    } else {
      console.error("No PDF data found in the extraction");
    }
    
    // Set current extraction ID
    currentExtractionId.value = extractionData.id;
    
    // Set viewing from history flag
    viewingFromHistory.value = true;
    
    // Switch to process view, results step
    currentView.value = 'process';
    currentStep.value = 3;
  } catch (error) {
    console.error('Error viewing extraction:', error);
  }
};

// Continue extraction process
const continueExtraction = async (item) => {
  try {
    // Load the extraction data
    const extractionData = await getHistoryEntry(item.id);
    
    if (extractionData) {
      // Set current extraction data
      activeFields.value = extractionData.fieldsData;
      
      // Create object URL from base64 data if available
      if (extractionData.pdf_data) {
        const blob = base64ToBlob(extractionData.pdf_data);
        pdfUrl.value = URL.createObjectURL(blob);
        pdfFile.value = new File([blob], extractionData.filename, { type: 'application/pdf' });
        await loadPdfPreview();
      }
      
      // Set current extraction ID
      currentExtractionId.value = item.id;
      
      // Switch to process view, appropriate step based on progress
      currentView.value = 'process';
      
      // Determine which step to show based on data state
      const hasValues = extractionData.fieldsData.some(field => field.value);
      currentStep.value = hasValues ? 3 : 2;
    }
  } catch (error) {
    console.error('Error continuing extraction:', error);
  }
};

// Start a new extraction
const startNew = () => {
  // Reset state
  pdfFile.value = null;
  pdfUrl.value = '';
  pdfPages.value = [];
  currentPage.value = 0;
  activeFields.value = [...defaultFields];
  currentStep.value = 1;
  currentExtractionId.value = null;
};
</script>

<template>
  <v-app class="app-container">
    <!-- Header -->
    <AppHeader @change-view="changeView" />

    <v-main style="width: 100%; padding: 0;">
      <v-container class="pa-0" fluid style="max-width: none; padding-top: 64px !important;">
        <!-- Home View -->
        <HomeView 
          v-if="currentView === 'home'"
          @start-process="startProcess"
        />
        
        <!-- Process View -->
        <div v-else-if="currentView === 'process'">
          <!-- Process Stepper -->
          <ProcessStepper :current-step="currentStep" @step-change="goToStep" />

          <!-- Step 1: Upload -->
          <Step1Upload 
            v-if="currentStep === 1"
            :default-fields="defaultFields"
            :suggested-fields="suggestedFields"
            :active-fields="activeFields"
            @update:active-fields="activeFields = $event"
            @file-upload="handleFileUpload"
            @next-step="goToNextStep"
          />

          <!-- Step 2: Review -->
          <Step2Review 
            v-if="currentStep === 2"
            :pdf-file="pdfFile"
            :pdf-url="pdfUrl"
            :pdf-pages="pdfPages"
            :current-page="currentPage"
            :active-fields="activeFields"
            :is-processing="isProcessing"
            @update:current-page="currentPage = $event"
            @update:active-fields="activeFields = $event"
            @process-pdf="processPdf"
            @back-step="goToPreviousStep"
            @next-step="goToNextStep"
          />

          <!-- Step 3: Results -->
          <Step3Results 
            v-if="currentStep === 3"
            :active-fields="activeFields"
            :pdf-file="pdfFile"
            :pdf-url="pdfUrl"
            :pdf-pages="pdfPages"
            :current-page="currentPage"
            :is-from-history="viewingFromHistory"
            @update:current-page="currentPage = $event"
            @back-step="goToPreviousStep"
            @save-to-history="saveToHistoryComplete"
            @close-viewer="goToHistoryView"
          />
        </div>
        
        <!-- History View -->
        <HistoryView 
          v-else
          :active="currentView === 'history'"
          @view-extraction="viewExtraction"
          @continue-extraction="continueExtraction"
        />
      </v-container>
    </v-main>

    <!-- Processing Dialog -->
    <v-dialog v-model="isProcessing" persistent width="300">
      <v-card>
        <v-card-text class="text-center pa-6">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <div class="mt-4 text-subtitle-1">処理中です。お待ちください...</div>
        </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" persistent width="400">
      <v-card class="text-center">
        <v-card-text class="pa-6">
          <v-icon icon="mdi-check-circle" color="success" size="x-large" class="my-4" style="font-size: 80px;"></v-icon>
          <h3 class="text-h5 my-3">保存が完了しました</h3>
          <p class="text-body-1 mb-2">
            抽出したデータは正常に保存されました。履歴からいつでも確認できます。
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style>
.app-container {
  width: 100vw !important;
  min-height: 100vh;
  display: flex;
}

.v-application__wrap {
  width: 100% !important;
  background-color: #f5f5f5;
}

.v-main {
  width: 100% !important;
}

.v-container {
  width: 100% !important;
  max-width: none !important;
}

.full-width {
  width: 100% !important;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
