<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTasksStore, type Task, type TaskStatus } from '@/stores/tasks'
import { useBoardsStore } from '@/stores/boards'
import { useQuasar } from 'quasar'

// Props
interface Props {
  id: string
  boardId: string
}

const props = defineProps<Props>()

// Stores e router
const router = useRouter()
const route = useRoute()
const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()
const $q = useQuasar()

// Estados
const isLoading = ref(true)
const isEditing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editStatus = ref<TaskStatus>('backlog')
const showDeleteDialog = ref(false)

// Computed
const taskId = computed(() => props.id)
const task = computed(() => tasksStore.tasks.find((t) => t.id === taskId.value))
const boardId = computed(() => props.boardId)
const board = computed(() => {
  return boardsStore.boards.find((b) => b.id === boardId.value)
})

const statusOptions = [
  { label: 'Backlog', value: 'backlog', color: 'grey' },
  { label: 'Pendente', value: 'pending', color: 'orange' },
  { label: 'Em Progresso', value: 'progress', color: 'blue' },
  { label: 'Concluída', value: 'completed', color: 'green' }
]

const statusInfo = computed(() => {
  return statusOptions.find((opt) => opt.value === task.value?.status) || statusOptions[0]
})

// Funções
function loadTask() {
  if (!task.value) {
    $q.notify({
      type: 'negative',
      message: 'Tarefa não encontrada',
      caption: 'A tarefa solicitada não existe ou foi removida'
    })
    router.push('/')
    return
  }
  
  // Verificar se a task pertence ao board correto
  if (task.value.boardId !== boardId.value) {
    $q.notify({
      type: 'negative',
      message: 'Tarefa não pertence a este board',
      caption: 'A tarefa não está associada ao board especificado na URL'
    })
    router.push('/')
    return
  }
  
  // Preencher campos de edição
  editTitle.value = task.value.title
  editDescription.value = task.value.description
  editStatus.value = task.value.status
  
  isLoading.value = false
}

function startEdit() {
  isEditing.value = true
  editTitle.value = task.value?.title || ''
  editDescription.value = task.value?.description || ''
  editStatus.value = task.value?.status || 'backlog'
}

function cancelEdit() {
  isEditing.value = false
  editTitle.value = task.value?.title || ''
  editDescription.value = task.value?.description || ''
  editStatus.value = task.value?.status || 'backlog'
}

function saveEdit() {
  if (!task.value) return
  
  if (!editTitle.value.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Título é obrigatório'
    })
    return
  }
  
  tasksStore.editTask(
    task.value.id,
    editTitle.value.trim(),
    editDescription.value.trim(),
    editStatus.value,
    task.value.boardId
  )
  
  isEditing.value = false
  
  $q.notify({
    type: 'positive',
    message: 'Tarefa atualizada com sucesso!'
  })
}

function confirmDelete() {
  showDeleteDialog.value = true
}

function deleteTask() {
  if (!task.value) return
  
  tasksStore.removeTask(task.value.id)
  
  $q.notify({
    type: 'positive',
    message: 'Tarefa removida com sucesso!'
  })
  
  router.push('/')
}

function goBack() {
  router.back()
}

function goToBoard() {
  if (board.value) {
    router.push(`/?boardId=${board.value.id}`)
  } else {
    router.push('/')
  }
}

// Lifecycle
onMounted(() => {
  loadTask()
})
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding>
        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-center" style="height: 50vh">
          <q-spinner-dots size="40px" color="primary" />
          <div class="q-ml-md text-grey-6">Carregando tarefa...</div>
        </div>

        <!-- Task Not Found -->
        <div v-else-if="!task" class="flex flex-center" style="height: 50vh">
          <div class="text-center">
            <q-icon name="error_outline" size="64px" color="negative" class="q-mb-md" />
            <h4 class="text-h4 q-mb-sm">Tarefa não encontrada</h4>
            <p class="text-grey-6 q-mb-lg">A tarefa solicitada não existe ou foi removida.</p>
            <q-btn color="primary" label="Voltar ao início" @click="goBack" />
          </div>
        </div>

        <!-- Task Details -->
        <div v-else>
          <!-- Header -->
          <div class="task-header">
            <div class="header-left">
              <q-btn 
                flat 
                round 
                icon="arrow_back" 
                @click="goBack"
                class="q-mr-md"
              />
              <div>
                <h1 class="text-h4 text-weight-bold q-ma-none">
                  Detalhes da Tarefa
                </h1>
                <div class="text-caption text-grey-6 q-mt-xs">
                  ID: {{ task.id }}
                </div>
              </div>
            </div>
            <div class="header-actions">
              <q-btn 
                v-if="!isEditing"
                color="primary" 
                label="Editar" 
                icon="edit"
                @click="startEdit"
                class="q-mr-sm"
              />
              <q-btn 
                v-if="!isEditing"
                color="negative" 
                label="Excluir" 
                icon="delete"
                @click="confirmDelete"
                outline
              />
              <template v-else>
                <q-btn 
                  color="positive" 
                  label="Salvar" 
                  icon="save"
                  @click="saveEdit"
                  class="q-mr-sm"
                />
                <q-btn 
                  color="grey" 
                  label="Cancelar" 
                  icon="close"
                  @click="cancelEdit"
                  outline
                />
              </template>
            </div>
          </div>

          <!-- Task Content -->
          <div class="task-content">
            <div class="row q-gutter-lg">
              <!-- Main Info -->
              <div class="col-12 col-md-8">
                <q-card class="task-card">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="info" class="q-mr-sm" color="primary" />
                      Informações da Tarefa
                    </div>
                    
                    <!-- Title -->
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">Título</div>
                      <div v-if="!isEditing" class="text-h6">{{ task.title }}</div>
                      <q-input 
                        v-else
                        v-model="editTitle"
                        placeholder="Digite o título da tarefa"
                        outlined
                        dense
                      />
                    </div>

                    <!-- Description -->
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">Descrição</div>
                      <div v-if="!isEditing" class="text-body1">
                        {{ task.description || 'Nenhuma descrição fornecida' }}
                      </div>
                      <q-input 
                        v-else
                        v-model="editDescription"
                        type="textarea"
                        placeholder="Digite a descrição da tarefa"
                        outlined
                        rows="4"
                      />
                    </div>

                    <!-- Status -->
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">Status</div>
                      <div v-if="!isEditing" class="row items-center">
                        <q-chip 
                          :color="statusInfo.color" 
                          text-color="white"
                          :label="statusInfo.label"
                          icon="flag"
                        />
                      </div>
                      <q-select 
                        v-else
                        v-model="editStatus"
                        :options="statusOptions"
                        option-value="value"
                        option-label="label"
                        outlined
                        dense
                      />
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Board Info -->
                <q-card v-if="board" class="task-card q-mt-md">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="dashboard" class="q-mr-sm" color="info" />
                      Board Associado
                    </div>
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-h6">{{ board.name }}</div>
                        <div class="text-caption text-grey-6">
                          Criado em {{ board.createdAt.toLocaleDateString('pt-BR') }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn 
                          color="info" 
                          label="Ver Board" 
                          icon="open_in_new"
                          @click="goToBoard"
                          outline
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Sidebar Info -->
              <div class="col-12 col-md-4">
                <q-card class="task-card">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="more_vert" class="q-mr-sm" color="grey" />
                      Detalhes
                    </div>
                    
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">ID da Tarefa</div>
                      <div class="text-body1 font-mono">{{ task.id }}</div>
                    </div>

                    <div class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">Status Atual</div>
                      <q-chip 
                        :color="statusInfo.color" 
                        text-color="white"
                        :label="statusInfo.label"
                        icon="flag"
                        size="md"
                      />
                    </div>

                    <div v-if="board" class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">Board</div>
                      <div class="text-body1">{{ board.name }}</div>
                    </div>

                    <div v-else class="q-mb-md">
                      <div class="text-caption text-grey-6 q-mb-xs">Board</div>
                      <div class="text-body1 text-grey-6">Não associada a nenhum board</div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Quick Actions -->
                <q-card class="task-card q-mt-md">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="flash_on" class="q-mr-sm" color="orange" />
                      Ações Rápidas
                    </div>
                    
                    <div class="q-gutter-sm">
                      <q-btn 
                        v-if="!isEditing"
                        color="primary" 
                        label="Editar Tarefa" 
                        icon="edit"
                        @click="startEdit"
                        block
                        outline
                      />
                      <q-btn 
                        v-if="board"
                        color="info" 
                        label="Ver Board" 
                        icon="dashboard"
                        @click="goToBoard"
                        block
                        outline
                      />
                      <q-btn 
                        color="grey" 
                        label="Voltar" 
                        icon="arrow_back"
                        @click="goBack"
                        block
                        outline
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <q-dialog v-model="showDeleteDialog" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Confirmar Exclusão</div>
            </q-card-section>

            <q-card-section>
              <div class="text-body1">
                Tem certeza que deseja excluir a tarefa <strong>"{{ task?.title }}"</strong>?
              </div>
              <div class="text-caption text-grey-6 q-mt-sm">
                Esta ação não pode ser desfeita.
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn 
                flat 
                label="Cancelar" 
                color="grey" 
                v-close-popup 
              />
              <q-btn 
                flat 
                label="Excluir" 
                color="negative" 
                @click="deleteTask"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid var(--q-color-border);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.task-content {
  max-width: 1200px;
  margin: 0 auto;
}

.task-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.font-mono {
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .task-content .row {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .task-header {
    padding: 12px 0;
  }
  
  .task-header h1 {
    font-size: 1.5rem;
  }
}
</style>
