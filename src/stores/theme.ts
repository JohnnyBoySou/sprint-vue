import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Dark } from 'quasar'

export const useThemeStore = defineStore('theme', () => {
  // Estado reativo do tema
  const isDark = ref(false)

  // Função para alternar o tema
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Função para definir tema específico
  const setTheme = (dark: boolean) => {
    isDark.value = dark
  }

  // Carregar tema salvo do localStorage
  const loadTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else {
        // Verificar preferência do sistema
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    } catch (error) {
      console.error('Erro ao carregar tema do localStorage:', error)
      // Fallback para preferência do sistema
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // Salvar tema no localStorage e aplicar no Quasar quando mudar
  watch(isDark, (newValue) => {
    try {
      localStorage.setItem('theme', newValue ? 'dark' : 'light')
    } catch (error) {
      console.error('Erro ao salvar tema no localStorage:', error)
    }
    
    // Aplicar tema no Quasar
    Dark.set(newValue)
    // Aplicar classe no body para CSS customizado
    if (newValue) {
      document.body.classList.add('body--dark')
      document.body.classList.remove('body--light')
    } else {
      document.body.classList.add('body--light')
      document.body.classList.remove('body--dark')
    }
  }, { immediate: true })

  return {
    isDark,
    toggleTheme,
    setTheme,
    loadTheme
  }
})
