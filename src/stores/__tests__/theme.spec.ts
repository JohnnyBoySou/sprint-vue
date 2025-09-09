import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../theme'

// Mock do Quasar Dark
vi.mock('quasar', () => ({
  Dark: {
    set: vi.fn()
  }
}))

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock do window.matchMedia
const matchMediaMock = vi.fn()

describe('useThemeStore', () => {
  let store: ReturnType<typeof useThemeStore>

  beforeEach(() => {
    // Reset do estado antes de cada teste
    setActivePinia(createPinia())
    store = useThemeStore()
    
    // Reset dos mocks
    vi.clearAllMocks()
    
    // Mock do localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    // Mock do window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true
    })
    
    // Mock do document.body.classList
    Object.defineProperty(document, 'body', {
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      writable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Estado inicial', () => {
    it('deve inicializar com tema claro por padrão', () => {
      expect(store.isDark).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('deve alternar de claro para escuro', () => {
      store.isDark = false
      store.toggleTheme()
      expect(store.isDark).toBe(true)
    })

    it('deve alternar de escuro para claro', () => {
      store.isDark = true
      store.toggleTheme()
      expect(store.isDark).toBe(false)
    })

    it('deve alternar múltiplas vezes corretamente', () => {
      expect(store.isDark).toBe(false)
      
      store.toggleTheme()
      expect(store.isDark).toBe(true)
      
      store.toggleTheme()
      expect(store.isDark).toBe(false)
      
      store.toggleTheme()
      expect(store.isDark).toBe(true)
    })
  })

  describe('setTheme', () => {
    it('deve definir tema escuro quando true', () => {
      store.setTheme(true)
      expect(store.isDark).toBe(true)
    })

    it('deve definir tema claro quando false', () => {
      store.setTheme(false)
      expect(store.isDark).toBe(false)
    })

    it('deve sobrescrever tema atual', () => {
      store.isDark = true
      store.setTheme(false)
      expect(store.isDark).toBe(false)
      
      store.setTheme(true)
      expect(store.isDark).toBe(true)
    })
  })

  describe('loadTheme', () => {
    it('deve carregar tema escuro do localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      
      store.loadTheme()
      
      expect(store.isDark).toBe(true)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
    })

    it('deve carregar tema claro do localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light')
      
      store.loadTheme()
      
      expect(store.isDark).toBe(false)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
    })

    it('deve usar preferência do sistema quando localStorage está vazio', () => {
      localStorageMock.getItem.mockReturnValue(null)
      matchMediaMock.mockReturnValue({ matches: true })
      
      store.loadTheme()
      
      expect(store.isDark).toBe(true)
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('deve usar preferência do sistema quando localStorage está vazio e sistema prefere claro', () => {
      localStorageMock.getItem.mockReturnValue(null)
      matchMediaMock.mockReturnValue({ matches: false })
      
      store.loadTheme()
      
      expect(store.isDark).toBe(false)
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('deve usar preferência do sistema quando localStorage retorna valor inválido', () => {
      localStorageMock.getItem.mockReturnValue('invalid')
      matchMediaMock.mockReturnValue({ matches: true })
      
      store.loadTheme()
      
      expect(store.isDark).toBe(false)
    })

    it('deve tratar erro do localStorage e usar preferência do sistema', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      matchMediaMock.mockReturnValue({ matches: false })
      
      // Mock do console.error para verificar se foi chamado
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      store.loadTheme()
      
      expect(store.isDark).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar tema do localStorage:', expect.any(Error))
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Persistência no localStorage', () => {
    it('deve salvar tema escuro no localStorage quando isDark muda para true', async () => {
      // Limpar chamadas anteriores do watcher inicial
      vi.clearAllMocks()
      
      store.isDark = true
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('deve salvar tema claro no localStorage quando isDark muda para false', async () => {
      // Primeiro definir como true para depois mudar para false
      store.isDark = true
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Limpar chamadas anteriores
      vi.clearAllMocks()
      
      // Agora mudar para false
      store.isDark = false
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('deve tratar erro ao salvar no localStorage', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      store.isDark = true
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao salvar tema no localStorage:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Integração com Quasar', () => {
    it('deve aplicar tema escuro no Quasar quando isDark é true', async () => {
      const { Dark } = await import('quasar')
      
      // Limpar chamadas anteriores do watcher inicial
      vi.clearAllMocks()
      
      store.isDark = true
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(Dark.set).toHaveBeenCalledWith(true)
    })

    it('deve aplicar tema claro no Quasar quando isDark é false', async () => {
      const { Dark } = await import('quasar')
      
      // Primeiro definir como true para depois mudar para false
      store.isDark = true
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Limpar chamadas anteriores
      vi.clearAllMocks()
      
      // Agora mudar para false
      store.isDark = false
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(Dark.set).toHaveBeenCalledWith(false)
    })
  })

  describe('Aplicação de classes CSS', () => {
    it('deve adicionar classe body--dark e remover body--light quando tema é escuro', async () => {
      // Limpar chamadas anteriores do watcher inicial
      vi.clearAllMocks()
      
      store.isDark = true
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(document.body.classList.add).toHaveBeenCalledWith('body--dark')
      expect(document.body.classList.remove).toHaveBeenCalledWith('body--light')
    })

    it('deve adicionar classe body--light e remover body--dark quando tema é claro', async () => {
      // Primeiro definir como true para depois mudar para false
      store.isDark = true
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Limpar chamadas anteriores
      vi.clearAllMocks()
      
      // Agora mudar para false
      store.isDark = false
      
      // Aguardar o próximo tick para o watcher executar
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(document.body.classList.add).toHaveBeenCalledWith('body--light')
      expect(document.body.classList.remove).toHaveBeenCalledWith('body--dark')
    })

    it('deve aplicar classes corretamente ao alternar tema', async () => {
      // Primeiro definir como true
      store.isDark = true
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Limpar mocks
      vi.clearAllMocks()
      
      // Agora mudar para false
      store.isDark = false
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(document.body.classList.add).toHaveBeenCalledWith('body--light')
      expect(document.body.classList.remove).toHaveBeenCalledWith('body--dark')
      
      // Limpar mocks
      vi.clearAllMocks()
      
      // Alternar para escuro
      store.isDark = true
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(document.body.classList.add).toHaveBeenCalledWith('body--dark')
      expect(document.body.classList.remove).toHaveBeenCalledWith('body--light')
    })
  })

  describe('Cenários de integração', () => {
    it('deve funcionar corretamente com toggleTheme -> setTheme -> loadTheme', async () => {
      const { Dark } = await import('quasar')
      
      // Limpar chamadas do watcher inicial
      vi.clearAllMocks()
      
      // Toggle para escuro
      store.toggleTheme()
      expect(store.isDark).toBe(true)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
      
      // Limpar mocks
      vi.clearAllMocks()
      
      // Definir como claro
      store.setTheme(false)
      expect(store.isDark).toBe(false)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(Dark.set).toHaveBeenCalledWith(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
      
      // Limpar mocks
      vi.clearAllMocks()
      
      // Carregar tema do localStorage
      localStorageMock.getItem.mockReturnValue('dark')
      store.loadTheme()
      expect(store.isDark).toBe(true)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('deve manter consistência entre estado reativo e persistência', async () => {
      // Limpar chamadas do watcher inicial
      vi.clearAllMocks()
      
      // Simular mudança direta do estado
      store.isDark = true
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
      
      // Verificar se o estado permanece consistente
      expect(store.isDark).toBe(true)
    })
  })
})
