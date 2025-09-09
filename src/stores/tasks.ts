import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export type TaskStatus = 'backlog' | 'sprint' | 'inprogress' | 'testing' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  boardId?: string
  storyPoints?: number
  assignee?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

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

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(loadTasksFromStorage())

  watch(tasks, (newTasks) => {
    try {
      localStorage.setItem('tasks', JSON.stringify(newTasks))
    } catch (error) {
      console.error('Erro ao salvar tasks no localStorage:', error)
    }
  }, { deep: true })

  function addTask(
    title: string,
    description: string = '',
    status: TaskStatus = 'backlog',
    boardId?: string,
    storyPoints?: number,
    assignee?: string,
    dueDate?: Date,
  ) {
    const now = new Date()
    tasks.value.push({
      id: uuidv4(),
      title,
      description,
      status,
      boardId,
      storyPoints,
      assignee,
      dueDate,
      createdAt: now,
      updatedAt: now,
    })
  }

  function editTask(
    id: string,
    title: string,
    description: string,
    status?: TaskStatus,
    boardId?: string,
    storyPoints?: number,
    assignee?: string,
    dueDate?: Date,
  ) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.title = title
      task.description = description
      task.updatedAt = new Date()
      if (status) task.status = status
      if (boardId !== undefined) task.boardId = boardId
      if (storyPoints !== undefined) task.storyPoints = storyPoints
      if (assignee !== undefined) task.assignee = assignee
      if (dueDate !== undefined) task.dueDate = dueDate
    }
  }

  function removeTask(id: string) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function updateTaskStatus(id: string, status: TaskStatus) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.status = status
      task.updatedAt = new Date()
    }
  }

  function assignTaskToBoard(id: string, boardId: string) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.boardId = boardId
      task.updatedAt = new Date()
    }
  }

  function unassignTask(id: string) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.boardId = undefined
      task.updatedAt = new Date()
    }
  }

  function unassignTasksFromBoard(boardId: string) {
    const now = new Date()
    tasks.value.forEach(task => {
      if (task.boardId === boardId) {
        task.boardId = undefined
        task.updatedAt = now
      }
    })
  }

  const tasksByBoard = (boardId: string) => tasks.value.filter((t) => t.boardId === boardId)

  const tasksByStatusAndBoard = (boardId: string, status: TaskStatus) => {
    return tasks.value.filter((t) => t.boardId === boardId && t.status === status)
  }

  const unassignedTasks = computed(() => tasks.value.filter((t) => t.boardId === undefined))

  const totalTasks = computed(() => tasks.value.length)

  const sprintTasks = computed(() => tasks.value.filter((t) => t.status === 'sprint'))

  const inProgressTasks = computed(() => tasks.value.filter((t) => t.status === 'inprogress'))

  const testingTasks = computed(() => tasks.value.filter((t) => t.status === 'testing'))

  const doneTasks = computed(() => tasks.value.filter((t) => t.status === 'done'))

  const totalStoryPoints = computed(() => 
    tasks.value.reduce((total, task) => total + (task.storyPoints || 0), 0)
  )

  const sprintStoryPoints = computed(() => (boardId: string) => 
    tasks.value
      .filter((t) => t.boardId === boardId)
      .reduce((total, task) => total + (task.storyPoints || 0), 0)
  )

  function moveTaskToSprint(id: string, boardId: string) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.status = 'sprint'
      task.boardId = boardId
      task.updatedAt = new Date()
    }
  }

  function completeTask(id: string) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.status = 'done'
      task.updatedAt = new Date()
    }
  }

  return {
    tasks,
    addTask,
    editTask,
    removeTask,
    updateTaskStatus,
    assignTaskToBoard,
    unassignTask,
    unassignTasksFromBoard,
    moveTaskToSprint,
    completeTask,
    tasksByBoard,
    tasksByStatusAndBoard,
    unassignedTasks,
    sprintTasks,
    inProgressTasks,
    testingTasks,
    doneTasks,
    totalTasks,
    totalStoryPoints,
    sprintStoryPoints,
  }
})
