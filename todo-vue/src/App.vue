<template>
  <div class="app-container">
    <!-- Header global -->
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-toolbar-title>
          Todo Vue
        </q-toolbar-title>
        
        <q-space />
        
        <!-- Botão de toggle de tema -->
        <q-btn
          flat
          round
          dense
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          @click="toggleTheme"
          class="q-ml-sm"
        >
          <q-tooltip>
            {{ isDark ? 'Modo Claro' : 'Modo Escuro' }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Conteúdo principal -->
    <div class="app-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const { isDark, toggleTheme, loadTheme } = themeStore

// Carregar tema ao montar o componente
onMounted(() => {
  loadTheme()
  // Aplicar classe inicial no body
  if (isDark) {
    document.body.classList.add('body--dark')
  } else {
    document.body.classList.add('body--light')
  }
})
</script>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
