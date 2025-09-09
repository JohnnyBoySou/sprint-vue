<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTasksStore, type TaskStatus } from '@/stores/tasks'
import { useBoardsStore } from '@/stores/boards'
import { useQuasar } from 'quasar'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'taskAdded'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()
const $q = useQuasar()

const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('backlog')
const priority = ref('medium')
const dueDate = ref('')
const isAdding = ref(false)

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const statusOptions = [
  {
    label: 'Backlog',
    value: 'backlog',
    icon: 'inbox',
    color: 'grey-6',
    description: 'Tarefas não iniciadas',
  },
  {
    label: 'Sprint',
    value: 'sprint',
    icon: 'schedule',
    color: 'orange',
    description: 'Tarefas no sprint',
  },
  {
    label: 'Em Progresso',
    value: 'inprogress',
    icon: 'play_arrow',
    color: 'blue',
    description: 'Tarefas em andamento',
  },
  {
    label: 'Testando',
    value: 'testing',
    icon: 'bug_report',
    color: 'purple',
    description: 'Tarefas em teste',
  },
  {
    label: 'Concluída',
    value: 'done',
    icon: 'check_circle',
    color: 'green',
    description: 'Tarefas finalizadas',
  },
]

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

function resetForm() {
  title.value = ''
  description.value = ''
  status.value = 'backlog'
  priority.value = 'medium'
  dueDate.value = ''
}

function addTask() {
  if (!title.value.trim() || !status.value) return

  isAdding.value = true

  try {
    tasksStore.addTask(
      title.value.trim(),
      description.value.trim(),
      status.value,
      boardsStore.selectedBoard?.id,
    )

    $q.notify({
      type: 'positive',
      message: 'Tarefa adicionada com sucesso!',
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000,
    })

    resetForm()
    emit('taskAdded')

    setTimeout(() => {
      showModal.value = false
    }, 100)
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao adicionar tarefa. Tente novamente.',
      icon: 'error',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    isAdding.value = false
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  },
)
</script>

<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          <q-icon name="add_task" class="q-mr-sm" color="primary" />
          Nova Tarefa
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="addTask" class="q-gutter-md">
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

          <q-input v-model="dueDate" label="Data de Vencimento" outlined type="date">
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="negative" v-close-popup icon="cancel" class="q-mr-sm" />
        <q-btn
          label="Adicionar Tarefa"
          color="primary"
          @click="addTask"
          :disable="!title.trim() || !status"
          :loading="isAdding"
          icon="add_task"
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
}
</style>
