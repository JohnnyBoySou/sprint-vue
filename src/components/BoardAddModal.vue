<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { useQuasar } from 'quasar'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'boardCreated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const store = useBoardsStore()
const $q = useQuasar()

const name = ref('')
const description = ref('')
const dueDate = ref('')
const priority = ref('medium')
const color = ref('blue')
const notifications = ref(true)
const visibility = ref('private')
const tagsInput = ref('')
const isCreating = ref(false)

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const priorityOptions = [
  {
    label: 'Baixa',
    value: 'low',
    icon: 'keyboard_arrow_down',
    color: 'green',
    description: 'Projeto de baixa prioridade'
  },
  {
    label: 'Média',
    value: 'medium',
    icon: 'remove',
    color: 'orange',
    description: 'Prioridade normal'
  },
  {
    label: 'Alta',
    value: 'high',
    icon: 'keyboard_arrow_up',
    color: 'red',
    description: 'Projeto importante'
  },
  {
    label: 'Crítica',
    value: 'critical',
    icon: 'warning',
    color: 'purple',
    description: 'Máxima prioridade'
  }
]

const colorOptions = [
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Laranja', value: 'orange' },
  { label: 'Vermelho', value: 'red' },
  { label: 'Roxo', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Cinza', value: 'grey' },
  { label: 'Índigo', value: 'indigo' }
]

function resetForm() {
  name.value = ''
  description.value = ''
  dueDate.value = ''
  priority.value = 'medium'
  color.value = 'blue'
  notifications.value = true
  visibility.value = 'private'
  tagsInput.value = ''
}

function createBoard() {
  if (!name.value.trim() || name.value.length < 3) return
  
  isCreating.value = true
  
  try {
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    store.addBoard(name.value.trim())
    
    const newBoard = store.boards[store.boards.length - 1]
    
    $q.notify({
      type: 'positive',
      message: 'Board criado com sucesso!',
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000,
      actions: [
        {
          label: 'Ver Board',
          color: 'white',
          handler: () => {
            store.setSelectedBoard(newBoard.id)
          }
        }
      ]
    })
    
    resetForm()
    emit('boardCreated')
    
    setTimeout(() => {
      showModal.value = false
    }, 100)
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao criar board. Tente novamente.',
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    isCreating.value = false
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>

<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          <q-icon name="dashboard" class="q-mr-sm" color="primary" />
          Novo Board
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
        <q-form @submit="createBoard" class="q-gutter-md">
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

          <q-input
            v-model="description"
            label="Descrição"
            placeholder="Descreva o propósito do board (opcional)"
            type="textarea"
            outlined
            autogrow
            counter
            maxlength="200"
            rows="2"
          >
            <template v-slot:prepend>
              <q-icon name="description" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="dueDate"
            label="Data de Vencimento"
            outlined
            type="date"
            :min="today"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
            <template v-slot:append>
              <q-btn 
                v-if="dueDate" 
                icon="clear" 
                flat 
                round 
                dense 
                @click="dueDate = ''"
                size="sm"
              />
            </template>
          </q-input>

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
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-model="color"
            :options="colorOptions"
            label="Cor do Board"
            outlined
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="palette" color="primary" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon 
                    name="circle" 
                    :color="scope.opt.value" 
                    size="sm"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-expansion-item
            icon="settings"
            label="Configurações Avançadas"
            class="q-mt-md"
          >
            <div class="q-pa-md">
              <q-checkbox
                v-model="notifications"
                label="Ativar notificações para este board"
                color="primary"
              />
              
              <div class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Visibilidade:</div>
                <q-option-group
                  v-model="visibility"
                  :options="[
                    { label: 'Privado (apenas você)', value: 'private' },
                    { label: 'Público (visível para todos)', value: 'public' }
                  ]"
                  color="primary"
                  type="radio"
                />
              </div>

              <q-input
                v-model="tagsInput"
                label="Tags (separadas por vírgula)"
                placeholder="ex: projeto, urgente, frontend"
                outlined
                class="q-mt-md"
                hint="Use vírgulas para separar múltiplas tags"
              >
                <template v-slot:prepend>
                  <q-icon name="local_offer" color="primary" />
                </template>
              </q-input>
            </div>
          </q-expansion-item>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn 
          flat 
          label="Cancelar" 
          color="negative" 
          v-close-popup
          icon="cancel"
          class="q-mr-sm"
        />
        <q-btn 
          label="Criar Board" 
          color="primary" 
          @click="createBoard"
          :disable="!name.trim() || name.length < 3"
          :loading="isCreating"
          icon="add"
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
.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 16px;
}

.q-expansion-item__content {
  background-color: #f8f9fa;
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

.q-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.q-input--outlined .q-field__control {
  border-radius: 8px;
}
.q-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>
