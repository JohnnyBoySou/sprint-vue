<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useBoardsStore } from '@/stores/boards'
import KanbanBoard from '@/components/BoardView.vue'
import TaskAddModal from '@/components/TaskAddModal.vue'
import BoardAddModal from '@/components/BoardAddModal.vue'
import BoardEditModal from '@/components/BoardEditModal.vue'
import Sidebar from '@/components/Sidebar.vue'
import LoadingState from '@/components/Loading/LoadingState.vue'
import EmptyBoardsState from '@/components/Empty/EmptyBoardsState.vue'
import EmptyTasksState from '@/components/Empty/EmptyTasksState.vue'
import { useQuasar } from 'quasar'

const router = useRouter()
const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()
const $q = useQuasar()

const showTaskDialog = ref(false)
const showBoardDialog = ref(false)
const showBoardEditDialog = ref(false)
const selectedBoardForEdit = ref(null)
const isLoading = ref(true)
const leftDrawerOpen = ref(true)
const sidebarCollapsed = ref(false)

const hasBoards = computed(() => boardsStore.boards.length > 0)
const hasTasks = computed(() => tasksStore.totalTasks > 0)
const drawerWidth = computed(() => (sidebarCollapsed.value ? 90 : 242))

function openNewTaskDialog() {
  showTaskDialog.value = true
}

function openNewBoardDialog() {
  showBoardDialog.value = true
}

function handleSidebarToggle(collapsed: boolean) {
  sidebarCollapsed.value = collapsed
}

function openEditBoardDialog(board: any) {
  selectedBoardForEdit.value = board
  showBoardEditDialog.value = true
}

function openAnalytics() {
  if (boardsStore.boards.length === 1) {
    router.push(`/analytics?boardId=${boardsStore.boards[0].id}`)
    return
  }

  $q.dialog({
    title: 'Selecionar Board para Analytics',
    message: 'Escolha qual board você deseja analisar:',
    options: {
      type: 'radio',
      model: boardsStore.boards[0]?.id.toString(),
      items: boardsStore.boards.map((board) => ({
        label: board.name,
        value: board.id.toString(),
      })),
    },
    cancel: true,
    persistent: true,
  }).onOk((boardId) => {
    router.push(`/analytics?boardId=${boardId}`)
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'n':
        event.preventDefault()
        if (hasBoards.value) {
          openNewTaskDialog()
        } else {
          openNewBoardDialog()
        }
        break
      case 'b':
        event.preventDefault()
        openNewBoardDialog()
        break
    }
  }
}

onMounted(() => {
  // Simular loading inicial
  setTimeout(() => {
    isLoading.value = false
  }, 1000)

  // Adicionar listener de teclado
  document.addEventListener('keydown', handleKeydown)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="drawerWidth"
      :breakpoint="400"
    >
      <Sidebar
        @new-board="openNewBoardDialog"
        @edit-board="openEditBoardDialog"
        @toggle="handleSidebarToggle"
      />
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <LoadingState v-if="isLoading" />

        <div v-else>
          <div class="home-header">
            <div class="header-title">
              <div class="title-section">
                <div>
                  <h1 class="text-h3 text-weight-bold q-ma-none">
                    <q-icon name="dashboard" class="q-mr-sm" color="primary" />
                    Sprint Board
                  </h1>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    Gerencie suas tarefas de forma eficiente
                  </div>
                </div>
              </div>
            </div>
          </div>

          <EmptyBoardsState v-if="!hasBoards" @create-board="openNewBoardDialog" />

          <EmptyTasksState v-else-if="hasBoards && !hasTasks" @create-task="openNewTaskDialog" />

          <KanbanBoard v-if="hasBoards" />
        </div>

        <TaskAddModal v-model="showTaskDialog" />

        <BoardAddModal v-model="showBoardDialog" />

        <BoardEditModal v-model="showBoardEditDialog" :board="selectedBoardForEdit" />

        <div v-if="hasBoards" class="keyboard-shortcuts">
          <q-tooltip anchor="top left" self="top right">
            <div class="text-caption">
              <div class="shortcut-hint">Ctrl+N - Nova Tarefa</div>
              <div class="shortcut-hint">Ctrl+B - Novo Board</div>
            </div>
          </q-tooltip>
          <q-btn round color="grey-6" icon="keyboard" size="sm" flat />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid var(--q-color-border);
}

.header-title {
  flex: 1;
}

.title-section {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Atalhos de teclado - dica visual */
.keyboard-shortcuts {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.shortcut-hint {
  background: var(--q-color-background-mute);
  color: var(--q-color-text);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin: 2px 0;
  opacity: 0.9;
  transition: opacity 0.3s ease;
  border: 1px solid var(--q-color-border);
}

.shortcut-hint:hover {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .home-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .keyboard-shortcuts {
    bottom: 10px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .home-header {
    padding: 12px 0;
  }

  .header-title h1 {
    font-size: 1.5rem;
  }
}
</style>
