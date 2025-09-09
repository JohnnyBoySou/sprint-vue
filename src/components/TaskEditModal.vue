<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          <q-icon name="edit" class="q-mr-sm" color="primary" />
          Editar Tarefa
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="updateTask" class="q-gutter-md">
          <!-- Título da Tarefa -->
          <q-input
            v-model="title"
            label="Título da Tarefa *"
            placeholder="Digite o título da tarefa"
            outlined
            autofocus
            :rules="[
              (val) => !!val || 'Título é obrigatório',
              (val) => val.length >= 3 || 'Título deve ter pelo menos 3 caracteres',
            ]"
            counter
            maxlength="100"
          >
            <template v-slot:prepend>
              <q-icon name="title" color="primary" />
            </template>
          </q-input>

          <!-- Descrição -->
          <q-input
            v-model="description"
            label="Descrição"
            placeholder="Descreva os detalhes da tarefa (opcional)"
            type="textarea"
            outlined
            autogrow
            counter
            maxlength="500"
            rows="3"
          >
            <template v-slot:prepend>
              <q-icon name="description" color="primary" />
            </template>
          </q-input>

          <!-- Status -->
          <q-select
            v-model="status"
            :options="statusOptions"
            label="Status *"
            outlined
            emit-value
            map-options
            :rules="[(val) => !!val || 'Status é obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="flag" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Prioridade -->
          <q-select
            v-model="priority"
            :options="priorityOptions"
            label="Prioridade"
            outlined
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="priority_high" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Data de Vencimento -->
          <q-input v-model="dueDate" label="Data de Vencimento" outlined type="date">
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
          </q-input>

          <!-- Board Atual (somente leitura) -->
          <q-input
            :model-value="currentBoardName"
            label="Board Atual"
            outlined
            readonly
            hint="A tarefa está vinculada a este board"
          >
            <template v-slot:prepend>
              <q-icon name="dashboard" color="primary" />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="negative" v-close-popup icon="cancel" class="q-mr-sm" />
        <q-btn
          label="Salvar Alterações"
          color="primary"
          @click="updateTask"
          :disable="!title.trim() || !status"
          :loading="isUpdating"
          icon="save"
          class="q-px-lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTasksStore, type Task, type TaskStatus } from '@/stores/tasks'
import { useBoardsStore } from '@/stores/boards'
import { useQuasar } from 'quasar'

// Props e Emits
interface Props {
  modelValue: boolean
  task: Task | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'taskUpdated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Store e Quasar
const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()
const $q = useQuasar()

// Refs
const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('backlog')
const priority = ref('medium')
const dueDate = ref('')
const isUpdating = ref(false)

// Computed
const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentBoardName = computed(() => {
  if (!props.task?.boardId) return 'Não atribuída'
  const board = boardsStore.boards.find(b => b.id === props.task?.boardId)
  return board?.name || 'Board não encontrado'
})

// Opções de status
const statusOptions = [
  {
    label: 'Backlog',
    value: 'backlog',
    icon: 'inbox',
    color: 'grey-6',
    description: 'Tarefas não iniciadas',
  },
  {
    label: 'Pendente',
    value: 'pending',
    icon: 'schedule',
    color: 'orange',
    description: 'Tarefas aguardando início',
  },
  {
    label: 'Em Progresso',
    value: 'progress',
    icon: 'play_arrow',
    color: 'blue',
    description: 'Tarefas em andamento',
  },
  {
    label: 'Concluída',
    value: 'completed',
    icon: 'check_circle',
    color: 'green',
    description: 'Tarefas finalizadas',
  },
]

// Opções de prioridade
const priorityOptions = [
  {
    label: 'Baixa',
    value: 'low',
    icon: 'keyboard_arrow_down',
    color: 'green',
  },
  {
    label: 'Média',
    value: 'medium',
    icon: 'remove',
    color: 'orange',
  },
  {
    label: 'Alta',
    value: 'high',
    icon: 'keyboard_arrow_up',
    color: 'red',
  },
]

// Funções
function loadTaskData() {
  if (props.task) {
    title.value = props.task.title
    description.value = props.task.description
    status.value = props.task.status
    // TODO: Adicionar prioridade e data de vencimento quando implementadas no modelo Task
    priority.value = 'medium'
    dueDate.value = ''
  }
}

function updateTask() {
  if (!props.task || !title.value.trim() || !status.value) return

  isUpdating.value = true

  try {
    console.log('=== TaskEditModal DEBUG ===')
    console.log('task:', props.task)
    console.log('title:', title.value.trim())
    console.log('description:', description.value.trim())
    console.log('status:', status.value)

    // Atualizar a tarefa no store
    tasksStore.editTask(
      props.task.id,
      title.value.trim(),
      description.value.trim(),
      status.value,
      props.task.boardId
    )

    console.log('Task atualizada!')
    console.log('=== FIM TaskEditModal DEBUG ===')

    // Mostrar notificação de sucesso
    $q.notify({
      type: 'positive',
      message: 'Tarefa atualizada com sucesso!',
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000,
    })

    // Emitir evento de atualização
    emit('taskUpdated')

    // Fechar modal
    setTimeout(() => {
      showModal.value = false
    }, 100)
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar tarefa. Tente novamente.',
      icon: 'error',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    isUpdating.value = false
  }
}

// Carregar dados da tarefa quando o modal abrir
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && props.task) {
      loadTaskData()
    }
  },
)

// Carregar dados quando a tarefa mudar
watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      loadTaskData()
    }
  },
  { immediate: true }
)
</script>

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

/* Animações suaves */
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

/* Responsividade */
@media (max-width: 600px) {
  .q-card {
    min-width: 90vw;
    margin: 16px;
  }
}
</style>
