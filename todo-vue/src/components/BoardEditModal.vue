<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { useTasksStore } from '@/stores/tasks'
import { useQuasar } from 'quasar'
import type { Board } from '@/stores/boards'

interface Props {
  modelValue: boolean
  board: Board | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'boardUpdated'): void
  (e: 'boardDeleted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const $q = useQuasar()

const name = ref('')
const isUpdating = ref(false)

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const board = computed(() => props.board)

const boardTasksCount = computed(() => {
  if (!board.value) return 0
  return tasksStore.tasksByBoard(board.value.id).length
})

function formatDate(date: Date | undefined) {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function updateBoard() {
  if (!board.value || !name.value.trim() || name.value.length < 3) return
  
  isUpdating.value = true
  
  try {
    boardsStore.editBoard(board.value.id, name.value.trim())
    
    $q.notify({
      type: 'positive',
      message: 'Board atualizado com sucesso!',
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000
    })
    
    emit('boardUpdated')
    showModal.value = false
    
  } catch (error) {
    console.error('Erro ao atualizar board:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar board. Tente novamente.',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    isUpdating.value = false
  }
}

function finishBoard() {
  if (!board.value) return
  
  $q.dialog({
    title: 'Finalizar Board',
    message: `Tem certeza que deseja finalizar o board "${board.value.name}"?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Finalizar',
      color: 'orange'
    }
  }).onOk(() => {
    boardsStore.finishBoard(board.value!.id)
    $q.notify({
      type: 'positive',
      message: 'Board finalizado com sucesso!',
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000
    })
    emit('boardUpdated')
  })
}

function reactivateBoard() {
  if (!board.value) return
  
  $q.dialog({
    title: 'Reativar Board',
    message: `Tem certeza que deseja reativar o board "${board.value.name}"?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Reativar',
      color: 'green'
    }
  }).onOk(() => {
    const boardToUpdate = boardsStore.boards.find(b => b.id === board.value!.id)
    if (boardToUpdate) {
      boardToUpdate.finishedAt = null
    }
    
    $q.notify({
      type: 'positive',
      message: 'Board reativado com sucesso!',
      icon: 'refresh',
      position: 'top-right',
      timeout: 3000
    })
    emit('boardUpdated')
  })
}

function confirmDeleteBoard() {
  if (!board.value) return
  
  const tasksCount = boardTasksCount.value
  
  try {
    tasksStore.unassignTasksFromBoard(board.value.id)
    boardsStore.deleteBoardCompletely(board.value.id)
    
    emit('boardDeleted')
    showModal.value = false
    
    $q.notify({
      type: 'positive',
      message: `Board excluído com sucesso!${tasksCount > 0 ? ` ${tasksCount} tarefa(s) movida(s) para "Não Relacionadas".` : ''}`,
      icon: 'delete',
      position: 'top-right',
      timeout: 4000
    })
    
  } catch (error) {
    console.error('Erro ao excluir board:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir board. Tente novamente.',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    })
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue && board.value) {
    name.value = board.value.name
  }
})
</script>

<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          <q-icon name="edit" class="q-mr-sm" color="primary" />
          Editar Board
        </div>
        <q-space />
        <q-btn 
          icon="close" 
          flat 
          round 
          dense 
          v-close-popup
          color="grey-7"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="updateBoard" class="q-gutter-md">
          <q-input
            v-model="name"
            label="Nome do Board *"
            placeholder="Digite o nome do board"
            outlined
            autofocus
            :rules="[
              val => !!val || 'Nome é obrigatório',
              val => val.length >= 3 || 'Nome deve ter pelo menos 3 caracteres',
              val => val.length <= 50 || 'Nome deve ter no máximo 50 caracteres'
            ]"
            counter
            maxlength="50"
          >
            <template v-slot:prepend>
              <q-icon name="title" color="primary" />
            </template>
          </q-input>

          <div class="board-info q-pa-md bg-grey-1 rounded-borders">
            <div class="text-subtitle2 q-mb-sm">Informações do Board</div>
            <div class="row q-gutter-md">
              <div class="col">
                <div class="text-caption text-grey-6">Criado em</div>
                <div class="text-body2">{{ formatDate(board?.createdAt) }}</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Total de Tarefas</div>
                <div class="text-body2">{{ boardTasksCount }}</div>
              </div>
            </div>
          </div>

          <div class="board-actions q-pa-md bg-orange-1 rounded-borders">
            <div class="text-subtitle2 q-mb-sm text-orange-8">Ações do Board</div>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="!board?.finishedAt"
                color="orange"
                label="Finalizar Board"
                icon="check_circle"
                outline
                @click.stop="finishBoard"
                type="button"
                size="sm"
              />
              <q-btn
                v-else
                color="green"
                label="Reativar Board"
                icon="refresh"
                outline
                @click.stop="reactivateBoard"
                type="button"
                size="sm"
              />
              <q-btn
                color="negative"
                label="Excluir Board"
                icon="delete"
                outline
                @click.stop="confirmDeleteBoard"
                type="button"
                size="sm"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn 
          flat 
          label="Cancelar" 
          color="grey-7" 
          v-close-popup
          icon="cancel"
          class="q-mr-sm"
        />
        <q-btn 
          label="Salvar Alterações" 
          color="primary" 
          @click="updateBoard"
          :disable="!name.trim() || name.length < 3"
          :loading="isUpdating"
          icon="save"
          class="q-px-lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.q-card-section {
  padding: 24px;
}

.q-card-actions {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.board-info {
  border: 1px solid #e0e0e0;
}

.board-actions {
  border: 1px solid #ff9800;
}

.q-dialog__inner {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 600px) {
  .q-card {
    min-width: 90vw;
    margin: 16px;
  }
  
  .q-card-section {
    padding: 16px;
  }
  
  .q-card-actions {
    padding: 12px 16px;
  }
}

.q-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>