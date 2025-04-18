import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0288D1',
          secondary: '#607D8B',
          accent: '#FF5722',
          error: '#F44336',
          warning: '#FFC107',
          info: '#03A9F4',
          success: '#4CAF50',
          background: '#F5F5F5'
        }
      }
    }
  },
  defaults: {
    VContainer: {
      fluid: true,
      class: 'pa-0'
    },
    VRow: {
      class: 'ma-0',
      noGutters: true
    },
    VCol: {
      class: 'pa-2'
    },
    VCard: {
      elevation: 1,
      rounded: 'lg'
    },
    VAppBar: {
      flat: true,
      height: 64
    }
  }
})

// Create and mount the app
const app = createApp(App)
app.use(vuetify)
app.mount('#app')
