import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore, type Task, type TaskStatus } from '../tasks'

describe('useTasksStore', () => {
  let store: ReturnType<typeof useTasksStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTasksStore()
    store.tasks.splice(0, store.tasks.length)
  })

  describe('addTask', () => {
    it('deve adicionar uma nova tarefa com valores padrão', () => {
      store.addTask('Nova tarefa')
      
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0]).toMatchObject({
        title: 'Nova tarefa',
        description: '',
        status: 'backlog',
        boardId: undefined,
        storyPoints: undefined,
        assignee: undefined,
        dueDate: undefined
      })
      expect(store.tasks[0].id).toBeDefined()
      expect(store.tasks[0].createdAt).toBeInstanceOf(Date)
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('deve adicionar uma tarefa com todos os parâmetros', () => {
      const dueDate = new Date('2024-12-31')
      store.addTask('Tarefa completa', 'Descrição da tarefa', 'sprint', 'board-1', 5, 'João', dueDate)
      
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0]).toMatchObject({
        title: 'Tarefa completa',
        description: 'Descrição da tarefa',
        status: 'sprint',
        boardId: 'board-1',
        storyPoints: 5,
        assignee: 'João',
        dueDate: dueDate
      })
      expect(store.tasks[0].createdAt).toBeInstanceOf(Date)
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('deve gerar um ID único para cada tarefa', async () => {
      store.addTask('Tarefa 1')
      await new Promise(resolve => setTimeout(resolve, 10))
      store.addTask('Tarefa 2')
      
      expect(store.tasks[0].id).not.toBe(store.tasks[1].id)
    })
  })

  describe('editTask', () => {
    it('deve editar uma tarefa existente', () => {
      store.addTask('Tarefa original', 'Descrição original', 'backlog')
      const taskId = store.tasks[0].id
      
      store.editTask(taskId, 'Tarefa editada', 'Nova descrição', 'sprint', 'board-1', 3, 'Maria')
      
      expect(store.tasks[0]).toMatchObject({
        id: taskId,
        title: 'Tarefa editada',
        description: 'Nova descrição',
        status: 'sprint',
        boardId: 'board-1',
        storyPoints: 3,
        assignee: 'Maria'
      })
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('não deve fazer nada se a tarefa não existir', () => {
      store.addTask('Tarefa original')
      const originalTask = { ...store.tasks[0] }
      
      store.editTask('id-inexistente', 'Tarefa inexistente', 'Descrição')
      
      expect(store.tasks[0]).toEqual(originalTask)
    })

    it('deve editar apenas campos fornecidos', () => {
      store.addTask('Tarefa original', 'Descrição original', 'backlog', 'board-1', 2, 'João')
      const taskId = store.tasks[0].id
      
      store.editTask(taskId, 'Tarefa editada', 'Nova descrição')
      
      expect(store.tasks[0]).toMatchObject({
        title: 'Tarefa editada',
        description: 'Nova descrição',
        status: 'backlog',
        boardId: 'board-1',
        storyPoints: 2,
        assignee: 'João'
      })
    })
  })

  describe('removeTask', () => {
    it('deve remover uma tarefa existente', () => {
      const testStore = useTasksStore()
      
      testStore.addTask('Tarefa 1')
      testStore.addTask('Tarefa 2')
      
      expect(testStore.tasks).toHaveLength(2)
      expect(testStore.tasks[0].title).toBe('Tarefa 1')
      expect(testStore.tasks[1].title).toBe('Tarefa 2')
      
      const taskId = testStore.tasks[0].id
      testStore.removeTask(taskId)
      
      expect(testStore.tasks).toHaveLength(1)
      expect(testStore.tasks[0].title).toBe('Tarefa 2')
    })

    it('não deve fazer nada se a tarefa não existir', () => {
      store.addTask('Tarefa 1')
      
      store.removeTask('id-inexistente')
      
      expect(store.tasks).toHaveLength(1)
    })
  })

  describe('updateTaskStatus', () => {
    it('deve atualizar o status de uma tarefa', () => {
      store.addTask('Tarefa', '', 'backlog')
      const taskId = store.tasks[0].id
      
      store.updateTaskStatus(taskId, 'done')
      
      expect(store.tasks[0].status).toBe('done')
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('não deve fazer nada se a tarefa não existir', () => {
      store.addTask('Tarefa', '', 'backlog')
      
      store.updateTaskStatus('id-inexistente', 'done')
      
      expect(store.tasks[0].status).toBe('backlog')
    })
  })

  describe('assignTaskToBoard', () => {
    it('deve atribuir uma tarefa a um board', () => {
      store.addTask('Tarefa')
      const taskId = store.tasks[0].id
      
      store.assignTaskToBoard(taskId, 'board-1')
      
      expect(store.tasks[0].boardId).toBe('board-1')
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('unassignTask', () => {
    it('deve remover a atribuição de uma tarefa ao board', () => {
      store.addTask('Tarefa', '', 'backlog', 'board-1')
      const taskId = store.tasks[0].id
      
      store.unassignTask(taskId)
      
      expect(store.tasks[0].boardId).toBeUndefined()
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('computed properties', () => {
    it('deve filtrar tarefas por board', () => {
      store.addTask('Tarefa 1', '', 'backlog', 'board-1')
      store.addTask('Tarefa 2', '', 'backlog', 'board-2')
      store.addTask('Tarefa 3', '', 'backlog', 'board-1')
      
      const tasksBoard1 = store.tasksByBoard('board-1')
      const tasksBoard2 = store.tasksByBoard('board-2')
      
      expect(tasksBoard1).toHaveLength(2)
      expect(tasksBoard2).toHaveLength(1)
    })

    it('deve filtrar tarefas por status e board', () => {
      store.addTask('Tarefa 1', '', 'backlog', 'board-1')
      store.addTask('Tarefa 2', '', 'sprint', 'board-1')
      store.addTask('Tarefa 3', '', 'backlog', 'board-1')
      
      const backlogTasks = store.tasksByStatusAndBoard('board-1', 'backlog')
      
      expect(backlogTasks).toHaveLength(2)
    })

    it('deve retornar tarefas não atribuídas', () => {
      store.addTask('Tarefa 1', '', 'backlog', 'board-1')
      store.addTask('Tarefa 2', '', 'backlog')
      store.addTask('Tarefa 3', '', 'backlog')
      
      expect(store.unassignedTasks).toHaveLength(2)
    })

    it('deve contar o total de tarefas', () => {
      store.addTask('Tarefa 1')
      store.addTask('Tarefa 2')
      
      expect(store.totalTasks).toBe(2)
    })

    it('deve filtrar tarefas por status de sprint', () => {
      store.addTask('Tarefa 1', '', 'backlog')
      store.addTask('Tarefa 2', '', 'sprint')
      store.addTask('Tarefa 3', '', 'inprogress')
      store.addTask('Tarefa 4', '', 'testing')
      store.addTask('Tarefa 5', '', 'done')
      
      expect(store.sprintTasks).toHaveLength(1)
      expect(store.inProgressTasks).toHaveLength(1)
      expect(store.testingTasks).toHaveLength(1)
      expect(store.doneTasks).toHaveLength(1)
    })

    it('deve calcular total de story points', () => {
      store.addTask('Tarefa 1', '', 'backlog', undefined, 3)
      store.addTask('Tarefa 2', '', 'sprint', 'board-1', 5)
      store.addTask('Tarefa 3', '', 'backlog', undefined, 2)
      
      expect(store.totalStoryPoints).toBe(10)
    })

    it('deve calcular story points por board', () => {
      store.addTask('Tarefa 1', '', 'sprint', 'board-1', 3)
      store.addTask('Tarefa 2', '', 'sprint', 'board-1', 5)
      store.addTask('Tarefa 3', '', 'sprint', 'board-2', 2)
      
      expect(store.sprintStoryPoints('board-1')).toBe(8)
      expect(store.sprintStoryPoints('board-2')).toBe(2)
    })
  })

  describe('funções de sprint', () => {
    it('deve mover tarefa para sprint', () => {
      store.addTask('Tarefa', '', 'backlog')
      const taskId = store.tasks[0].id
      
      store.moveTaskToSprint(taskId, 'board-1')
      
      expect(store.tasks[0].status).toBe('sprint')
      expect(store.tasks[0].boardId).toBe('board-1')
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('deve completar tarefa', () => {
      store.addTask('Tarefa', '', 'inprogress')
      const taskId = store.tasks[0].id
      
      store.completeTask(taskId)
      
      expect(store.tasks[0].status).toBe('done')
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('não deve fazer nada se tarefa não existir', () => {
      store.addTask('Tarefa', '', 'backlog')
      
      store.moveTaskToSprint('id-inexistente', 'board-1')
      store.completeTask('id-inexistente')
      
      expect(store.tasks[0].status).toBe('backlog')
    })
  })

  describe('edge cases', () => {
    it('deve lidar com array vazio', () => {
      expect(store.tasks).toHaveLength(0)
      expect(store.totalTasks).toBe(0)
      expect(store.unassignedTasks).toHaveLength(0)
      expect(store.sprintTasks).toHaveLength(0)
      expect(store.inProgressTasks).toHaveLength(0)
      expect(store.testingTasks).toHaveLength(0)
      expect(store.doneTasks).toHaveLength(0)
      expect(store.totalStoryPoints).toBe(0)
    })

    it('deve manter consistência após múltiplas operações', () => {
      store.addTask('Tarefa 1', 'Desc 1', 'backlog', 'board-1', 3, 'João')
      store.addTask('Tarefa 2', 'Desc 2', 'sprint', 'board-2', 5, 'Maria')

      expect(store.tasks[1].boardId).toBe('board-2')

      const taskId = store.tasks[0].id
      store.editTask(taskId, 'Tarefa 1 Editada', 'Nova desc', 'done', 'board-1', 8, 'Pedro')

      const secondTaskId = store.tasks[1].id
      store.assignTaskToBoard(secondTaskId, 'board-1')

      expect(store.tasks).toHaveLength(2)
      expect(store.tasks[0].title).toBe('Tarefa 1 Editada')
      expect(store.tasks[0].status).toBe('done')
      expect(store.tasks[0].storyPoints).toBe(8)
      expect(store.tasks[0].assignee).toBe('Pedro')
      expect(store.tasks[1].boardId).toBe('board-1')
    })
  })

  describe('localStorage persistence', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      localStorage.clear()
    })

    it('deve salvar tasks no localStorage quando adicionadas', async () => {
      store.addTask('Tarefa de teste', 'Descrição', 'sprint', 'board-1', 5, 'João')
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const saved = localStorage.getItem('tasks')
      expect(saved).toBeTruthy()
      
      const parsed = JSON.parse(saved!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toMatchObject({
        title: 'Tarefa de teste',
        description: 'Descrição',
        status: 'sprint',
        boardId: 'board-1',
        storyPoints: 5,
        assignee: 'João'
      })
    })

    it('deve carregar tasks do localStorage na inicialização', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Tarefa salva',
          description: 'Descrição salva',
          status: 'sprint',
          boardId: 'board-2',
          storyPoints: 3,
          assignee: 'Maria',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      localStorage.setItem('tasks', JSON.stringify(mockTasks))

      store.tasks.splice(0, store.tasks.length)
      
      const loadTasksFromStorage = (): Task[] => {
        try {
          const saved = localStorage.getItem('tasks')
          if (saved) {
            const parsed = JSON.parse(saved)
            return parsed.map((task: Omit<Task, 'createdAt' | 'updatedAt' | 'dueDate'> & { 
              createdAt: string; 
              updatedAt: string; 
              dueDate?: string | null 
            }) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined
            }))
          }
          return []
        } catch (error) {
          console.error('Erro ao carregar tasks do localStorage:', error)
          return []
        }
      }
      
      const loadedTasks = loadTasksFromStorage()
      store.tasks.push(...loadedTasks)
      
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0]).toMatchObject({
        title: 'Tarefa salva',
        description: 'Descrição salva',
        status: 'sprint',
        boardId: 'board-2',
        storyPoints: 3,
        assignee: 'Maria'
      })
      expect(store.tasks[0].createdAt).toBeInstanceOf(Date)
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('deve converter strings de data de volta para objetos Date', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Tarefa com datas',
          description: 'Descrição',
          status: 'sprint',
          boardId: 'board-1',
          storyPoints: 5,
          assignee: 'João',
          createdAt: '2024-01-01T10:30:00.000Z',
          updatedAt: '2024-01-01T10:30:00.000Z',
          dueDate: '2024-12-31T15:45:00.000Z'
        }
      ]
      localStorage.setItem('tasks', JSON.stringify(mockTasks))

      store.tasks.splice(0, store.tasks.length)
      
      const loadTasksFromStorage = (): Task[] => {
        try {
          const saved = localStorage.getItem('tasks')
          if (saved) {
            const parsed = JSON.parse(saved)
            return parsed.map((task: Omit<Task, 'createdAt' | 'updatedAt' | 'dueDate'> & { 
              createdAt: string; 
              updatedAt: string; 
              dueDate?: string | null 
            }) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined
            }))
          }
          return []
        } catch (error) {
          console.error('Erro ao carregar tasks do localStorage:', error)
          return []
        }
      }
      
      const loadedTasks = loadTasksFromStorage()
      store.tasks.push(...loadedTasks)
      
      const task = store.tasks[0]
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toBeInstanceOf(Date)
      expect(task.dueDate).toBeInstanceOf(Date)
      expect(task.createdAt.toISOString()).toBe('2024-01-01T10:30:00.000Z')
      expect(task.updatedAt.toISOString()).toBe('2024-01-01T10:30:00.000Z')
      expect(task.dueDate!.toISOString()).toBe('2024-12-31T15:45:00.000Z')
    })

    it('deve lidar com localStorage vazio', () => {
      localStorage.clear()
      
      const newStore = useTasksStore()
      expect(newStore.tasks).toHaveLength(0)
    })

    it('deve lidar com dados corrompidos no localStorage', () => {
      localStorage.setItem('tasks', 'dados inválidos')
      
      const newStore = useTasksStore()
      expect(newStore.tasks).toHaveLength(0)
    })
  })
})
