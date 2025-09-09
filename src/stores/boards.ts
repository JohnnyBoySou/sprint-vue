import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Board {
  id: string
  name: string
  createdAt: Date
  finishedAt?: Date | null
}

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

export const useBoardsStore = defineStore('boards', () => {
  const boards = ref<Board[]>(loadBoardsFromStorage())
  const selectedBoardId = ref<string | null>(null)

  watch(boards, (newBoards) => {
    try {
      localStorage.setItem('boards', JSON.stringify(newBoards))
    } catch (error) {
      console.error('Erro ao salvar boards no localStorage:', error)
    }
  }, { deep: true })

  function addBoard(name: string) {
    boards.value.push({
      id: uuidv4(),
      name,
      createdAt: new Date(),
      finishedAt: null,
    })
  }

  function editBoard(id: string, name: string) {
    const board = boards.value.find(b => b.id === id)
    if (board) board.name = name
  }

  function finishBoard(id: string) {
    const board = boards.value.find(b => b.id === id)
    if (board) board.finishedAt = new Date()
  }

  function removeBoard(id: string) {
    boards.value = boards.value.filter(b => b.id !== id)
    if (selectedBoardId.value === id) {
      selectedBoardId.value = null
    }
  }

  function deleteBoardCompletely(id: string) {
    boards.value = boards.value.filter(b => b.id !== id)
    if (selectedBoardId.value === id) {
      selectedBoardId.value = null
    }
    return true
  }

  function setSelectedBoard(id: string | null) {
    selectedBoardId.value = id
  }

  const selectedBoard = computed(() => 
    selectedBoardId.value ? boards.value.find(b => b.id === selectedBoardId.value) : null
  )

  const activeBoards = computed(() => boards.value.filter(b => !b.finishedAt))
  const finishedBoards = computed(() => boards.value.filter(b => b.finishedAt))

  return {
    boards,
    selectedBoardId,
    selectedBoard,
    addBoard,
    editBoard,
    finishBoard,
    removeBoard,
    deleteBoardCompletely,
    setSelectedBoard,
    activeBoards,
    finishedBoards,
  }
})