<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasksStore, type TaskStatus } from '@/stores/tasks'
import { useBoardsStore } from '@/stores/boards'
import { useThemeStore } from '@/stores/theme'

interface Props {
  boardId?: string
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()
const themeStore = useThemeStore()

// Estados
const isLoading = ref(true)
const boardId = ref<string | null>(null)
const selectedBoard = ref<any>(null)

// Computed
const boardExists = computed(() => {
  if (!boardId.value) return false
  return boardsStore.boards.some(b => b.id === boardId.value)
})

const boardTasks = computed(() => {
  if (!boardId.value) return []
  return tasksStore.tasksByBoard(boardId.value)
})

const tasksByStatus = computed(() => {
  if (!boardId.value) return {
    backlog: 0,
    sprint: 0,
    inprogress: 0,
    testing: 0,
    done: 0
  }
  const statuses: TaskStatus[] = ['backlog', 'sprint', 'inprogress', 'testing', 'done']
  const result: Record<TaskStatus, number> = {
    backlog: 0,
    sprint: 0,
    inprogress: 0,
    testing: 0,
    done: 0
  }
  
  statuses.forEach(status => {
    result[status] = tasksStore.tasksByStatusAndBoard(boardId.value!, status).length
  })
  
  return result
})

const totalTasks = computed(() => boardTasks.value.length)

const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((tasksByStatus.value.done / totalTasks.value) * 100)
})

const progressRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round(((tasksByStatus.value.done + tasksByStatus.value.inprogress) / totalTasks.value) * 100)
})

const averageTasksPerStatus = computed(() => {
  const statuses = Object.values(tasksByStatus.value) as number[]
  return statuses.length > 0 ? Math.round(statuses.reduce((a, b) => a + b, 0) / statuses.length) : 0
})

const statusDistribution = computed(() => {
  const statuses: TaskStatus[] = ['backlog', 'sprint', 'inprogress', 'testing', 'done']
  const labels: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    sprint: 'Sprint',
    inprogress: 'Em Progresso',
    testing: 'Testando',
    done: 'Concluído'
  }
  
  return statuses.map(status => ({
    status,
    label: labels[status],
    count: tasksByStatus.value[status],
    percentage: totalTasks.value > 0 ? Math.round((tasksByStatus.value[status] / totalTasks.value) * 100) : 0
  }))
})

const productivityMetrics = computed(() => {
  const backlog = tasksByStatus.value.backlog
  const sprint = tasksByStatus.value.sprint
  const inprogress = tasksByStatus.value.inprogress
  const testing = tasksByStatus.value.testing
  const done = tasksByStatus.value.done
  
  return {
    // Eficiência: quanto mais tarefas em progresso vs backlog
    efficiency: totalTasks.value > 0 ? Math.round((inprogress / (backlog + sprint + inprogress)) * 100) : 0,
    // Velocidade: taxa de conclusão
    velocity: completionRate.value,
    // Fluxo: distribuição equilibrada
    flow: totalTasks.value > 0 ? Math.round((1 - Math.abs(inprogress - averageTasksPerStatus.value) / totalTasks.value) * 100) : 0
  }
})

// Funções
function loadBoardData() {
  const id = props.boardId || route.query.boardId
  if (!id) {
    router.push('/')
    return
  }
  
  boardId.value = id as string
  selectedBoard.value = boardsStore.boards.find(b => b.id === boardId.value)
  
  if (!selectedBoard.value) {
    router.push('/')
    return
  }
  
  isLoading.value = false
}

function goBack() {
  router.push('/')
}

function exportBoardData() {
  if (!selectedBoard.value) return
  
  const data = {
    board: selectedBoard.value,
    tasks: boardTasks.value,
    statistics: {
      totalTasks: totalTasks.value,
      tasksByStatus: tasksByStatus.value,
      completionRate: completionRate.value,
      progressRate: progressRate.value,
      productivityMetrics: productivityMetrics.value
    },
    exportedAt: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analytics-${selectedBoard.value.name}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadBoardData()
})
</script>

<template>
  <q-page padding>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-center" style="height: 50vh">
      <q-spinner-dots size="40px" color="primary" />
      <div class="q-ml-md text-grey-6">Carregando estatísticas...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="!boardExists" class="flex flex-center" style="height: 50vh">
      <q-card class="text-center" style="max-width: 400px">
        <q-card-section>
          <q-icon name="error" size="48px" color="negative" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">Board não encontrado</div>
          <div class="text-body2 q-mb-md">
            O board solicitado não existe ou foi removido.
          </div>
          <q-btn color="primary" label="Voltar ao Início" @click="goBack" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header -->
      <div class="analytics-header q-mb-lg">
        <div class="header-content">
          <div class="header-title">
            <q-btn 
              flat 
              round 
              icon="arrow_back" 
              @click="goBack"
              class="q-mr-sm"
            />
            <div>
              <h1 class="text-h4 text-weight-bold q-ma-none">
                <q-icon name="analytics" class="q-mr-sm" color="primary" />
                Analytics - {{ selectedBoard?.name }}
              </h1>
              <div class="text-caption text-grey-6 q-mt-xs">
                Estatísticas detalhadas do board
              </div>
            </div>
          </div>
          <div class="header-actions">
            <q-btn 
              color="secondary" 
              label="Exportar Dados" 
              @click="exportBoardData"
              icon="download"
              outline
            />
          </div>
        </div>
      </div>

      <!-- Métricas Principais -->
      <div class="metrics-grid q-mb-lg">
        <q-card class="metric-card">
          <q-card-section class="text-center">
            <q-icon name="task_alt" size="32px" color="primary" class="q-mb-sm" />
            <div class="text-h3 text-primary">{{ totalTasks }}</div>
            <div class="text-caption text-grey-6">Total de Tarefas</div>
          </q-card-section>
        </q-card>

        <q-card class="metric-card">
          <q-card-section class="text-center">
            <q-icon name="check_circle" size="32px" color="green" class="q-mb-sm" />
            <div class="text-h3 text-green">{{ completionRate }}%</div>
            <div class="text-caption text-grey-6">Taxa de Conclusão</div>
          </q-card-section>
        </q-card>

        <q-card class="metric-card">
          <q-card-section class="text-center">
            <q-icon name="trending_up" size="32px" color="blue" class="q-mb-sm" />
            <div class="text-h3 text-blue">{{ progressRate }}%</div>
            <div class="text-caption text-grey-6">Em Progresso</div>
          </q-card-section>
        </q-card>

        <q-card class="metric-card">
          <q-card-section class="text-center">
            <q-icon name="speed" size="32px" color="orange" class="q-mb-sm" />
            <div class="text-h3 text-orange">{{ productivityMetrics.efficiency }}%</div>
            <div class="text-caption text-grey-6">Eficiência</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Distribuição por Status -->
      <div class="row q-gutter-lg q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="pie_chart" class="q-mr-sm" color="primary" />
                Distribuição por Status
              </div>
              
              <div class="status-distribution">
                <div 
                  v-for="item in statusDistribution" 
                  :key="item.status"
                  class="status-item q-mb-md"
                >
                  <div class="status-header">
                    <div class="status-label">{{ item.label }}</div>
                    <div class="status-count">{{ item.count }} ({{ item.percentage }}%)</div>
                  </div>
                  <q-linear-progress 
                    :value="item.percentage / 100" 
                    :color="item.status === 'done' ? 'green' : item.status === 'inprogress' ? 'blue' : item.status === 'sprint' ? 'orange' : item.status === 'testing' ? 'purple' : 'grey'"
                    size="8px"
                    rounded
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="insights" class="q-mr-sm" color="primary" />
                Métricas de Produtividade
              </div>
              
              <div class="productivity-metrics">
                <div class="metric-item q-mb-md">
                  <div class="metric-label">
                    <q-icon name="efficiency" class="q-mr-sm" color="blue" />
                    Eficiência
                  </div>
                  <div class="metric-value">{{ productivityMetrics.efficiency }}%</div>
                  <q-linear-progress 
                    :value="productivityMetrics.efficiency / 100" 
                    color="blue"
                    size="6px"
                    rounded
                  />
                </div>

                <div class="metric-item q-mb-md">
                  <div class="metric-label">
                    <q-icon name="speed" class="q-mr-sm" color="green" />
                    Velocidade
                  </div>
                  <div class="metric-value">{{ productivityMetrics.velocity }}%</div>
                  <q-linear-progress 
                    :value="productivityMetrics.velocity / 100" 
                    color="green"
                    size="6px"
                    rounded
                  />
                </div>

                <div class="metric-item q-mb-md">
                  <div class="metric-label">
                    <q-icon name="flow" class="q-mr-sm" color="orange" />
                    Fluxo
                  </div>
                  <div class="metric-value">{{ productivityMetrics.flow }}%</div>
                  <q-linear-progress 
                    :value="productivityMetrics.flow / 100" 
                    color="orange"
                    size="6px"
                    rounded
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Lista de Tarefas por Status -->
      <div class="tasks-breakdown">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="list" class="q-mr-sm" color="primary" />
              Tarefas por Status
            </div>
            
            <div class="row q-gutter-md">
              <div 
                v-for="item in statusDistribution" 
                :key="item.status"
                class="col-12 col-sm-6 col-md-3"
              >
                <q-card 
                  flat 
                  bordered 
                  :class="`status-card status-${item.status}`"
                >
                  <q-card-section class="text-center">
                    <q-icon 
                      :name="item.status === 'done' ? 'check_circle' : item.status === 'inprogress' ? 'play_circle' : item.status === 'sprint' ? 'schedule' : item.status === 'testing' ? 'bug_report' : 'inbox'"
                      :color="item.status === 'done' ? 'green' : item.status === 'inprogress' ? 'blue' : item.status === 'sprint' ? 'orange' : item.status === 'testing' ? 'purple' : 'grey'"
                      size="24px"
                      class="q-mb-sm"
                    />
                    <div class="text-h5" :class="`text-${item.status === 'done' ? 'green' : item.status === 'inprogress' ? 'blue' : item.status === 'sprint' ? 'orange' : item.status === 'testing' ? 'purple' : 'grey'}`">
                      {{ item.count }}
                    </div>
                    <div class="text-caption text-grey-6">{{ item.label }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.analytics-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Grid de Métricas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Distribuição de Status */
.status-distribution {
  padding: 8px 0;
}

.status-item {
  padding: 8px 0;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-label {
  font-weight: 500;
  color: var(--color-text);
}

.status-count {
  font-size: 0.9em;
  color: var(--color-text);
  opacity: 0.7;
}

/* Métricas de Produtividade */
.productivity-metrics {
  padding: 8px 0;
}

.metric-item {
  padding: 8px 0;
}

.metric-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 8px;
}

/* Cards de Status */
.status-card {
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-backlog {
  border-left: 4px solid #9e9e9e;
}

.status-sprint {
  border-left: 4px solid #ff9800;
}

.status-inprogress {
  border-left: 4px solid #2196f3;
}

.status-testing {
  border-left: 4px solid #9c27b0;
}

.status-done {
  border-left: 4px solid #4caf50;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .status-distribution .row {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .header-title h1 {
    font-size: 1.5rem;
  }
}
</style>
