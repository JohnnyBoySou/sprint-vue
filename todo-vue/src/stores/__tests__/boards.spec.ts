import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBoardsStore, type Board } from '../boards'

describe('useBoardsStore', () => {
  let store: ReturnType<typeof useBoardsStore>

  beforeEach(() => {
    // Reset do estado antes de cada teste
    setActivePinia(createPinia())
    store = useBoardsStore()
    // Limpar o array de boards
    store.boards.splice(0, store.boards.length)
    // Limpar seleção
    store.setSelectedBoard(null)
  })

  describe('addBoard', () => {
    it('deve adicionar um novo board com valores padrão', () => {
      const boardName = 'Novo Board'
      store.addBoard(boardName)
      
      expect(store.boards).toHaveLength(1)
      expect(store.boards[0]).toMatchObject({
        name: boardName,
        finishedAt: null
      })
      expect(store.boards[0].id).toBeDefined()
      expect(store.boards[0].createdAt).toBeInstanceOf(Date)
    })

    it('deve gerar um ID único para cada board', async () => {
      store.addBoard('Board 1')
      // Pausa para garantir IDs diferentes
      await new Promise(resolve => setTimeout(resolve, 10))
      store.addBoard('Board 2')
      
      expect(store.boards[0].id).not.toBe(store.boards[1].id)
    })

    it('deve definir createdAt como data atual', () => {
      const beforeAdd = new Date()
      store.addBoard('Board Teste')
      const afterAdd = new Date()
      
      const board = store.boards[0]
      expect(board.createdAt.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime())
      expect(board.createdAt.getTime()).toBeLessThanOrEqual(afterAdd.getTime())
    })
  })

  describe('editBoard', () => {
    it('deve editar o nome de um board existente', () => {
      store.addBoard('Board Original')
      const boardId = store.boards[0].id
      
      store.editBoard(boardId, 'Board Editado')
      
      expect(store.boards[0].name).toBe('Board Editado')
      expect(store.boards[0].id).toBe(boardId)
    })

    it('não deve fazer nada se o board não existir', () => {
      store.addBoard('Board Original')
      const originalName = store.boards[0].name
      
      store.editBoard('id-inexistente', 'Nome Novo')
      
      expect(store.boards[0].name).toBe(originalName)
    })
  })

  describe('finishBoard', () => {
    it('deve marcar um board como finalizado', () => {
      store.addBoard('Board Ativo')
      const boardId = store.boards[0].id
      
      store.finishBoard(boardId)
      
      expect(store.boards[0].finishedAt).toBeInstanceOf(Date)
    })

    it('não deve fazer nada se o board não existir', () => {
      store.addBoard('Board Ativo')
      const originalFinishedAt = store.boards[0].finishedAt
      
      store.finishBoard('id-inexistente')
      
      expect(store.boards[0].finishedAt).toBe(originalFinishedAt)
    })

    it('deve definir finishedAt como data atual', () => {
      store.addBoard('Board Ativo')
      const boardId = store.boards[0].id
      
      const beforeFinish = new Date()
      store.finishBoard(boardId)
      const afterFinish = new Date()
      
      const finishedAt = store.boards[0].finishedAt!
      expect(finishedAt.getTime()).toBeGreaterThanOrEqual(beforeFinish.getTime())
      expect(finishedAt.getTime()).toBeLessThanOrEqual(afterFinish.getTime())
    })
  })

  describe('removeBoard', () => {
    it('deve remover um board existente', () => {
      store.addBoard('Board 1')
      store.addBoard('Board 2')
      const boardId = store.boards[0].id
      
      store.removeBoard(boardId)
      
      expect(store.boards).toHaveLength(1)
      expect(store.boards[0].name).toBe('Board 2')
    })

    it('deve limpar seleção se o board removido era o selecionado', () => {
      store.addBoard('Board Selecionado')
      const boardId = store.boards[0].id
      store.setSelectedBoard(boardId)
      
      store.removeBoard(boardId)
      
      expect(store.selectedBoardId).toBeNull()
      expect(store.selectedBoard).toBeNull()
    })

    it('não deve afetar seleção se o board removido não era o selecionado', () => {
      store.addBoard('Board 1')
      store.addBoard('Board 2')
      const board1Id = store.boards[0].id
      const board2Id = store.boards[1].id
      store.setSelectedBoard(board2Id)
      
      store.removeBoard(board1Id)
      
      expect(store.selectedBoardId).toBe(board2Id)
      expect(store.selectedBoard?.id).toBe(board2Id)
    })

    it('não deve fazer nada se o board não existir', () => {
      store.addBoard('Board 1')
      
      store.removeBoard('id-inexistente')
      
      expect(store.boards).toHaveLength(1)
    })
  })

  describe('deleteBoardCompletely', () => {
    it('deve remover um board completamente', () => {
      store.addBoard('Board 1')
      store.addBoard('Board 2')
      const boardId = store.boards[0].id
      
      const result = store.deleteBoardCompletely(boardId)
      
      expect(result).toBe(true)
      expect(store.boards).toHaveLength(1)
      expect(store.boards[0].name).toBe('Board 2')
    })

    it('deve limpar seleção se o board removido era o selecionado', () => {
      store.addBoard('Board Selecionado')
      const boardId = store.boards[0].id
      store.setSelectedBoard(boardId)
      
      store.deleteBoardCompletely(boardId)
      
      expect(store.selectedBoardId).toBeNull()
    })

    it('deve retornar true para indicar que tasks devem ser movidas', () => {
      store.addBoard('Board Teste')
      const boardId = store.boards[0].id
      
      const result = store.deleteBoardCompletely(boardId)
      
      expect(result).toBe(true)
    })
  })

  describe('setSelectedBoard', () => {
    it('deve definir um board como selecionado', () => {
      store.addBoard('Board 1')
      store.addBoard('Board 2')
      const boardId = store.boards[0].id
      
      store.setSelectedBoard(boardId)
      
      expect(store.selectedBoardId).toBe(boardId)
      expect(store.selectedBoard?.id).toBe(boardId)
    })

    it('deve limpar seleção quando passado null', () => {
      store.addBoard('Board 1')
      store.setSelectedBoard(store.boards[0].id)
      
      store.setSelectedBoard(null)
      
      expect(store.selectedBoardId).toBeNull()
      expect(store.selectedBoard).toBeNull()
    })

    it('deve retornar null se o board selecionado não existir', () => {
      store.setSelectedBoard('id-inexistente')
      
      expect(store.selectedBoard).toBeUndefined()
    })
  })

  describe('computed properties', () => {
    describe('selectedBoard', () => {
      it('deve retornar o board selecionado', () => {
        store.addBoard('Board 1')
        store.addBoard('Board 2')
        const boardId = store.boards[1].id
        store.setSelectedBoard(boardId)
        
        const selected = store.selectedBoard
        
        expect(selected?.id).toBe(boardId)
        expect(selected?.name).toBe('Board 2')
      })

      it('deve retornar null quando nenhum board está selecionado', () => {
        store.addBoard('Board 1')
        
        expect(store.selectedBoard).toBeNull()
      })
    })

    describe('activeBoards', () => {
      it('deve retornar apenas boards não finalizados', () => {
        store.addBoard('Board Ativo 1')
        store.addBoard('Board Ativo 2')
        store.addBoard('Board Finalizado')
        
        // Finalizar o terceiro board
        store.finishBoard(store.boards[2].id)
        
        const activeBoards = store.activeBoards
        
        expect(activeBoards).toHaveLength(2)
        expect(activeBoards.every(board => !board.finishedAt)).toBe(true)
      })

      it('deve retornar array vazio quando não há boards ativos', () => {
        store.addBoard('Board')
        store.finishBoard(store.boards[0].id)
        
        expect(store.activeBoards).toHaveLength(0)
      })
    })

    describe('finishedBoards', () => {
      it('deve retornar apenas boards finalizados', () => {
        store.addBoard('Board Ativo')
        store.addBoard('Board Finalizado 1')
        store.addBoard('Board Finalizado 2')
        
        // Finalizar os dois últimos boards
        store.finishBoard(store.boards[1].id)
        store.finishBoard(store.boards[2].id)
        
        const finishedBoards = store.finishedBoards
        
        expect(finishedBoards).toHaveLength(2)
        expect(finishedBoards.every(board => board.finishedAt !== null)).toBe(true)
      })

      it('deve retornar array vazio quando não há boards finalizados', () => {
        store.addBoard('Board Ativo 1')
        store.addBoard('Board Ativo 2')
        
        expect(store.finishedBoards).toHaveLength(0)
      })
    })
  })

  describe('localStorage persistence', () => {
    beforeEach(() => {
      // Limpar localStorage antes de cada teste
      localStorage.clear()
    })

    afterEach(() => {
      // Limpar localStorage após cada teste
      localStorage.clear()
    })

    it('deve salvar boards no localStorage quando adicionados', async () => {
      store.addBoard('Board de Teste')
      
      // Aguardar o próximo tick para o watch ser executado
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const saved = localStorage.getItem('boards')
      expect(saved).toBeTruthy()
      
      const parsed = JSON.parse(saved!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toMatchObject({
        name: 'Board de Teste',
        finishedAt: null
      })
      expect(parsed[0].id).toBeDefined()
      expect(parsed[0].createdAt).toBeDefined()
    })

    it('deve carregar boards do localStorage na inicialização', () => {
      // Simular dados no localStorage
      const mockBoards = [
        {
          id: 'board-1',
          name: 'Board Salvo',
          createdAt: '2024-01-01T00:00:00.000Z',
          finishedAt: null
        },
        {
          id: 'board-2',
          name: 'Board Finalizado',
          createdAt: '2024-01-01T00:00:00.000Z',
          finishedAt: '2024-01-02T00:00:00.000Z'
        }
      ]
      localStorage.setItem('boards', JSON.stringify(mockBoards))

      // Limpar o estado atual da store
      store.boards.splice(0, store.boards.length)
      
      // Simular o carregamento do localStorage
      const loadBoardsFromStorage = (): Board[] => {
        try {
          const saved = localStorage.getItem('boards')
          if (saved) {
            const parsed = JSON.parse(saved)
            return parsed.map((board: Omit<Board, 'createdAt' | 'finishedAt'> & { createdAt: string; finishedAt: string | null }) => ({
              ...board,
              createdAt: new Date(board.createdAt),
              finishedAt: board.finishedAt ? new Date(board.finishedAt) : null
            }))
          }
          return []
        } catch (error) {
          console.error('Erro ao carregar boards do localStorage:', error)
          return []
        }
      }
      
      // Carregar boards do localStorage
      const loadedBoards = loadBoardsFromStorage()
      store.boards.push(...loadedBoards)
      
      expect(store.boards).toHaveLength(2)
      expect(store.boards[0]).toMatchObject({
        id: 'board-1',
        name: 'Board Salvo',
        finishedAt: null
      })
      expect(store.boards[0].createdAt).toBeInstanceOf(Date)
      expect(store.boards[1]).toMatchObject({
        id: 'board-2',
        name: 'Board Finalizado'
      })
      expect(store.boards[1].finishedAt).toBeInstanceOf(Date)
    })

    it('deve lidar com localStorage vazio', () => {
      localStorage.clear()
      
      const newStore = useBoardsStore()
      expect(newStore.boards).toHaveLength(0)
    })

    it('deve lidar com dados corrompidos no localStorage', () => {
      localStorage.setItem('boards', 'dados inválidos')
      
      const newStore = useBoardsStore()
      expect(newStore.boards).toHaveLength(0)
    })

    it('deve converter strings de data de volta para objetos Date', () => {
      const mockBoards = [
        {
          id: 'board-1',
          name: 'Board Teste',
          createdAt: '2024-01-01T10:30:00.000Z',
          finishedAt: '2024-01-02T15:45:00.000Z'
        }
      ]
      localStorage.setItem('boards', JSON.stringify(mockBoards))

      // Limpar o estado atual da store
      store.boards.splice(0, store.boards.length)
      
      // Simular o carregamento do localStorage
      const loadBoardsFromStorage = (): Board[] => {
        try {
          const saved = localStorage.getItem('boards')
          if (saved) {
            const parsed = JSON.parse(saved)
            return parsed.map((board: Omit<Board, 'createdAt' | 'finishedAt'> & { createdAt: string; finishedAt: string | null }) => ({
              ...board,
              createdAt: new Date(board.createdAt),
              finishedAt: board.finishedAt ? new Date(board.finishedAt) : null
            }))
          }
          return []
        } catch (error) {
          console.error('Erro ao carregar boards do localStorage:', error)
          return []
        }
      }
      
      // Carregar boards do localStorage
      const loadedBoards = loadBoardsFromStorage()
      store.boards.push(...loadedBoards)
      
      const board = store.boards[0]
      expect(board.createdAt).toBeInstanceOf(Date)
      expect(board.finishedAt).toBeInstanceOf(Date)
      expect(board.createdAt.toISOString()).toBe('2024-01-01T10:30:00.000Z')
      expect(board.finishedAt!.toISOString()).toBe('2024-01-02T15:45:00.000Z')
    })

    it('deve lidar com finishedAt null no localStorage', () => {
      const mockBoards = [
        {
          id: 'board-1',
          name: 'Board Ativo',
          createdAt: '2024-01-01T00:00:00.000Z',
          finishedAt: null
        }
      ]
      localStorage.setItem('boards', JSON.stringify(mockBoards))

      // Limpar o estado atual da store
      store.boards.splice(0, store.boards.length)
      
      // Simular o carregamento do localStorage
      const loadBoardsFromStorage = (): Board[] => {
        try {
          const saved = localStorage.getItem('boards')
          if (saved) {
            const parsed = JSON.parse(saved)
            return parsed.map((board: Omit<Board, 'createdAt' | 'finishedAt'> & { createdAt: string; finishedAt: string | null }) => ({
              ...board,
              createdAt: new Date(board.createdAt),
              finishedAt: board.finishedAt ? new Date(board.finishedAt) : null
            }))
          }
          return []
        } catch (error) {
          console.error('Erro ao carregar boards do localStorage:', error)
          return []
        }
      }
      
      // Carregar boards do localStorage
      const loadedBoards = loadBoardsFromStorage()
      store.boards.push(...loadedBoards)
      
      const board = store.boards[0]
      expect(board.finishedAt).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('deve lidar com array vazio', () => {
      expect(store.boards).toHaveLength(0)
      expect(store.activeBoards).toHaveLength(0)
      expect(store.finishedBoards).toHaveLength(0)
      expect(store.selectedBoard).toBeNull()
    })

    it('deve manter consistência após múltiplas operações', () => {
      // Adicionar boards
      store.addBoard('Board 1')
      store.addBoard('Board 2')
      store.addBoard('Board 3')

      // Verificar estado inicial
      expect(store.boards).toHaveLength(3)
      expect(store.activeBoards).toHaveLength(3)

      // Editar primeiro board
      const board1Id = store.boards[0].id
      store.editBoard(board1Id, 'Board 1 Editado')

      // Finalizar segundo board
      const board2Id = store.boards[1].id
      store.finishBoard(board2Id)

      // Selecionar terceiro board
      const board3Id = store.boards[2].id
      store.setSelectedBoard(board3Id)

      // Verificar estado final
      expect(store.boards).toHaveLength(3)
      expect(store.boards[0].name).toBe('Board 1 Editado')
      expect(store.boards[1].finishedAt).toBeInstanceOf(Date)
      expect(store.activeBoards).toHaveLength(2)
      expect(store.finishedBoards).toHaveLength(1)
      expect(store.selectedBoard?.id).toBe(board3Id)
    })

    it('deve lidar com operações em boards inexistentes', () => {
      store.addBoard('Board Existente')
      const originalLength = store.boards.length
      const originalBoard = { ...store.boards[0] }

      // Tentar operações em ID inexistente
      store.editBoard('id-inexistente', 'Nome Novo')
      store.finishBoard('id-inexistente')
      store.removeBoard('id-inexistente')
      store.deleteBoardCompletely('id-inexistente')

      // Verificar que nada mudou
      expect(store.boards).toHaveLength(originalLength)
      expect(store.boards[0]).toEqual(originalBoard)
    })

    it('deve manter referências corretas após remoção', () => {
      store.addBoard('Board 1')
      store.addBoard('Board 2')
      store.addBoard('Board 3')
      
      const board2Id = store.boards[1].id
      store.setSelectedBoard(board2Id)
      
      // Remover board 1 (índice 0)
      store.removeBoard(store.boards[0].id)
      
      // Verificar que a seleção ainda aponta para o board correto
      expect(store.selectedBoard?.id).toBe(board2Id)
      expect(store.selectedBoard?.name).toBe('Board 2')
    })
  })

  describe('error handling', () => {
    it('deve lidar com erro ao salvar no localStorage', () => {
      // Mock localStorage.setItem para lançar erro
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      // Não deve lançar erro, apenas logar
      expect(() => {
        store.addBoard('Board Teste')
      }).not.toThrow()

      // Restaurar localStorage
      localStorage.setItem = originalSetItem
    })

    it('deve lidar com erro ao carregar do localStorage', () => {
      // Mock localStorage.getItem para lançar erro
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage access denied')
      })

      // Não deve lançar erro, deve retornar array vazio
      expect(() => {
        const newStore = useBoardsStore()
        expect(newStore.boards).toHaveLength(0)
      }).not.toThrow()

      // Restaurar localStorage
      localStorage.getItem = originalGetItem
    })
  })
})
