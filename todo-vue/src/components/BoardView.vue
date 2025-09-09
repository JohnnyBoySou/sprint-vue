<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useBoardsStore } from '@/stores/boards'
import { useTasksStore, type TaskStatus } from '@/stores/tasks'
import TaskAddModal from './TaskAddModal.vue'

const router = useRouter()

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()

const selectedBoard = computed(() => boardsStore.selectedBoard)
const showAddTaskModal = ref(false)

const statuses: TaskStatus[] = ['backlog', 'sprint', 'inprogress', 'testing', 'done']
const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  sprint: 'Sprint',
  inprogress: 'Em Progresso',
  testing: 'Testando',
  done: 'Concluído',
}

const tasksByStatus = reactive<Record<TaskStatus, typeof tasksStore.tasks>>({
  backlog: [],
  sprint: [],
  inprogress: [],
  testing: [],
  done: [],
})

function updateTasksByStatus() {
  if (!selectedBoard.value) return
  
  statuses.forEach((status) => {
    const tasks = tasksStore.tasksByStatusAndBoard(selectedBoard.value!.id, status)
    tasksByStatus[status] = [...tasks]
  })
}

const unassignedTasks = computed(() => tasksStore.unassignedTasks)

function onDragEnd(evt: any) {
  let movedTask = evt.item.__vue__?.element || evt.item.__vue__?.$props?.element || evt.item
  
  if (movedTask && movedTask.nodeType) {
    const taskId = movedTask.getAttribute('data-task-id') || movedTask.dataset?.taskId
    if (taskId) {
      movedTask = tasksStore.tasks.find(t => t.id === taskId)
    } else {
      const fromIndex = evt.oldIndex
      if (fromIndex !== undefined && fromIndex >= 0) {
        const fromStatus = evt.from.getAttribute('data-status') as TaskStatus
        if (fromStatus) {
          movedTask = tasksByStatus[fromStatus][fromIndex]
        }
      }
    }
  }
  
  const newStatus = evt.to.getAttribute('data-status') as TaskStatus || evt.to.__vue__?.$attrs['data-status'] as TaskStatus
  const oldStatus = evt.from.getAttribute('data-status') as TaskStatus || evt.from.__vue__?.$attrs['data-status'] as TaskStatus
  
  if (movedTask && movedTask.id) {
    if (!movedTask.boardId && selectedBoard.value) {
      tasksStore.assignTaskToBoard(movedTask.id, selectedBoard.value.id)
    }
    
    if (newStatus && newStatus !== oldStatus) {
      tasksStore.updateTaskStatus(movedTask.id, newStatus)
    }
  }
  
  updateTasksByStatus()
}

async function onDragEndUnassigned(evt: any) {
  let movedTask = evt.item.__vue__?.element || evt.item.__vue__?.$props?.element || evt.item
  
  if (movedTask && movedTask.nodeType) {
    const taskId = movedTask.getAttribute('data-task-id') || movedTask.dataset?.taskId
    if (taskId) {
      movedTask = tasksStore.tasks.find(t => t.id === taskId)
    } else {
      const fromIndex = evt.oldIndex
      if (fromIndex !== undefined && fromIndex >= 0) {
        movedTask = tasksStore.unassignedTasks[fromIndex]
      }
    }
  }
  
  const boardId = selectedBoard.value?.id
  const newStatus = evt.to.getAttribute('data-status') as TaskStatus || evt.to.__vue__?.$attrs['data-status'] as TaskStatus
  
  if (movedTask && movedTask.id && boardId) {
    tasksStore.assignTaskToBoard(movedTask.id, boardId)
    
    await nextTick()
    
    if (newStatus) {
      tasksStore.updateTaskStatus(movedTask.id, newStatus)
      
      await nextTick()
    }
  }
  
  updateTasksByStatus()
  
  await nextTick()
}

watch(selectedBoard, () => {
  updateTasksByStatus()
}, { immediate: true })

watch(() => tasksStore.tasks, () => {
  updateTasksByStatus()
}, { deep: true })

function goToAnalytics() {
  if (selectedBoard.value) {
    router.push(`/analytics?boardId=${selectedBoard.value.id}`)
  }
}

function onTaskAdded() {
  updateTasksByStatus()
}
</script>

<template>
  <div class="kanban-container">
      <div v-if="!selectedBoard" class="empty-state">
        <q-icon name="dashboard" size="64px" color="grey-4" />
        <h3 class="text-h5 text-grey-6 q-mt-md q-mb-sm">Nenhum Board Selecionado</h3>
        <p class="text-body2 text-grey-5">
          Selecione um board na sidebar para visualizar suas tarefas.
        </p>
      </div>
      <div v-else>
        <div class="board-header q-mb-lg">
          <div class="board-title-section">
            <h2 class="text-h4 q-ma-none">{{ selectedBoard.name }}</h2>
            <q-chip 
              :label="`${statuses.reduce((total, status) => total + tasksByStatus[status].length, 0)} tarefas`"
              color="primary"
              text-color="white"
            />
          </div>
          <div class="board-actions">
            <q-btn 
              color="primary" 
              label="Nova Tarefa" 
              icon="add_task"
              @click="showAddTaskModal = true"
              class="q-mr-sm"
            />
            <q-btn 
              color="secondary" 
              label="Ver Analytics" 
              icon="analytics"
              @click="goToAnalytics"
              outline
            />
          </div>
        </div>
        
        <div class="columns">
          <div class="kanban-column" v-for="status in statuses" :key="status">
            <div class="column-header">
              <h3 class="text-h6 q-ma-none">{{ statusLabels[status] }}</h3>
              <q-badge :label="tasksByStatus[status].length" color="grey-6" />
            </div>
            
            <draggable 
              :list="tasksByStatus[status]" 
              group="tasks" 
              @end="onDragEnd" 
              item-key="id"
              class="column-content"
              :data-status="status"
            >
              <template #item="{ element }">
                <q-card class="q-mb-sm task-card" flat bordered :data-task-id="element.id">
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 text-weight-medium">{{ element.title }}</div>
                    <div class="text-caption text-grey-6 q-mt-xs" v-if="element.description">
                      {{ element.description }}
                    </div>
                    <div class="q-mt-sm">
                      <q-btn 
                        size="sm" 
                        color="primary" 
                        label="Ver detalhes" 
                        icon="visibility"
                        @click="router.push(`/board/${selectedBoard?.id}/task/${element.id}`)"
                        flat
                        dense
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </template>
              
              <template #footer>
                <div v-if="tasksByStatus[status].length === 0" class="empty-column">
                  <q-icon name="inbox" size="32px" color="grey-4" />
                  <div class="text-caption text-grey-5 q-mt-sm">Nenhuma tarefa</div>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <q-banner v-if="unassignedTasks.length" class="bg-grey-2 q-mt-lg" rounded>
        <template v-slot:avatar>
          <q-icon name="warning" color="orange" />
        </template>
        <div class="text-h6 q-mb-sm">Tarefas Não Relacionadas</div>
        <div class="text-body2 q-mb-md">
          Arraste estas tarefas para um board para organizá-las.
        </div>
        
        <draggable :list="unassignedTasks" group="tasks" item-key="id" @end="onDragEndUnassigned" class="q-mt-md">
          <template #item="{ element }">
            <q-card class="q-mb-sm task-card" flat bordered :data-task-id="element.id">
              <q-card-section class="q-pa-sm">
                <div class="text-subtitle2 text-weight-medium">{{ element.title }}</div>
                <div class="text-caption text-grey-6 q-mt-xs" v-if="element.description">
                  {{ element.description }}
                </div>
                <div class="q-mt-sm">
                  <q-btn 
                    size="sm" 
                    color="primary" 
                    label="Ver detalhes" 
                    icon="visibility"
                    @click="$router.push(`/board/${selectedBoard?.id}/task/${element.id}`)"
                    flat
                    dense
                  />
                </div>
              </q-card-section>
            </q-card>
          </template>
        </draggable>
      </q-banner>
      </div>

      <!-- Modal para adicionar tarefa -->
      <TaskAddModal 
        v-model="showAddTaskModal" 
        @task-added="onTaskAdded"
      />
  </div>
</template>

<style scoped>
.kanban-container {
  padding: 16px;
  overflow-x: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  min-height: 400px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.board-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.columns {
  display: flex;
  gap: 16px;
  min-height: 400px;
}

.kanban-column {
  min-width: 280px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.column-content {
  min-height: 300px;
}

.task-card {
  cursor: move;
  transition: all 0.2s ease;
  border-left: 4px solid #1976d2;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .columns {
    flex-direction: column;
    gap: 12px;
  }
  
  .kanban-column {
    min-width: 100%;
  }
  
  .board-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .board-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
