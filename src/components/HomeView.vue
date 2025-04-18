<script setup>
// Home page component
</script>

<template>
  <v-container class="pa-0 d-flex flex-column align-center justify-center" fluid style="min-height: 70vh;">
    <v-card 
      elevation="1" 
      class="mx-4 mb-4 mt-10 rounded-lg"
      max-width="1000"
      style="width: 100%;"
    >
      <v-card-item class="pa-0">
        <v-card-title class="home-header pa-4 text-white">
          Detomo OCR - 不動産書類 OCR ソリューション
        </v-card-title>
      </v-card-item>
      
      <v-card-text class="px-6 py-5">
        <div class="d-flex align-center justify-center mb-6">
          <img src="@/assets/logo.png" alt="Detomo Logo" height="120" class="my-6" />
        </div>
        
        <h2 class="text-h4 mb-6 text-center">不動産書類の効率的なデータ抽出</h2>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4 mb-4 h-100">
              <v-card-title class="text-h6 primary--text">
                <v-icon color="primary" class="mr-2">mdi-rocket-launch</v-icon>
                主な特長
              </v-card-title>
              <v-card-text>
                <ul class="feature-list">
                  <li>不動産広告チラシから重要データを自動抽出</li>
                  <li>高精度なAI OCR技術の活用</li>
                  <li>複数ページのPDF書類に対応</li>
                  <li>カスタムフィールドの追加と編集が可能</li>
                  <li>抽出データをCSVで簡単にエクスポート</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4 mb-4 h-100">
              <v-card-title class="text-h6 primary--text">
                <v-icon color="primary" class="mr-2">mdi-check-decagram</v-icon>
                メリット
              </v-card-title>
              <v-card-text>
                <ul class="feature-list">
                  <li>データ入力時間の大幅削減</li>
                  <li>人為的ミスの防止</li>
                  <li>業務プロセスの効率化</li>
                  <li>デジタルデータとしての再利用が容易</li>
                  <li>操作が簡単で直感的なインターフェース</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <div class="text-center mt-6">
          <p class="text-subtitle-1 mb-6">
            Detomo OCRは不動産業界向けに最適化された高性能OCRツールです。<br>
            物件情報、価格、場所などを含む不動産広告からデータを簡単に抽出できます。
          </p>
          
          <v-btn
            color="primary"
            size="large"
            min-height="56"
            @click="$emit('start-process')"
            width="240"
          >
            <v-icon left class="mr-2">mdi-play</v-icon>
            OCR処理を開始
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.home-header {
  background: linear-gradient(to right, #1976D2, #0288D1);
  border-radius: 8px 8px 0 0;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.feature-list {
  padding-left: 16px;
}

.feature-list li {
  margin-bottom: 12px;
  position: relative;
}
</style> 