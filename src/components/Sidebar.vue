<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { useTasksStore } from '@/stores/tasks'
import { useThemeStore } from '@/stores/theme'

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const themeStore = useThemeStore()

const isCollapsed = ref(false)

const boards = computed(() => boardsStore.boards)
const hasBoards = computed(() => boards.value.length > 0)
const { isDark, toggleTheme } = themeStore

const boardStats = computed(() => {
  return boards.value.map((board) => {
    const boardTasks = tasksStore.tasks.filter((task) => task.boardId === board.id)
    const completedTasks = boardTasks.filter((task) => task.status === 'done').length
    const totalTasks = boardTasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      id: board.id,
      name: board.name,
      totalTasks,
      completedTasks,
      completionRate,
      isActive: boardsStore.selectedBoardId === board.id,
    }
  })
})

const emit = defineEmits<{
  'new-board': []
  'edit-board': [board: any]
  toggle: [collapsed: boolean]
}>()

function selectBoard(boardId: string) {
  boardsStore.setSelectedBoard(boardId)
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

function clearSelection() {
  boardsStore.setSelectedBoard(null)
}

function openNewBoardDialog() {
  emit('new-board')
}

function openEditBoardDialog(board: any) {
  emit('edit-board', board)
}
</script>

<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <div class="sidebar__header">
      <div v-if="!isCollapsed" class="sidebar__title">
        <q-icon name="dashboard" class="q-mr-sm" color="primary" v-if="!isCollapsed" />
        <span class="text-h6">Boards</span>
      </div>

      <div class="sidebar__header-actions">
        <q-btn
          v-if="!isCollapsed"
          flat
          round
          dense
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          @click="toggleTheme"
          class="sidebar__theme-toggle"
          color="grey-6"
        >
          <q-tooltip>
            {{ isDark ? 'Modo Claro' : 'Modo Escuro' }}
          </q-tooltip>
        </q-btn>

        <q-btn
          :icon="isCollapsed ? 'chevron_right' : 'chevron_left'"
          flat
          round
          dense
          @click="toggleSidebar"
          class="sidebar__toggle"
          color="grey-6"
        />
      </div>
    </div>

    <div v-if="hasBoards" class="sidebar__content">
      <div style="display: flex; flex-direction: row; gap: 8px">
        <q-btn
          flat
          class="sidebar__new-board-btn"
          @click="openNewBoardDialog"
          color="primary"
          size="sm"
          icon="add"
          :class="{ 'sidebar__new-board-btn--collapsed': isCollapsed }"
        >
          <span v-if="!isCollapsed" class="q-ml-xs">Novo Board</span>
        </q-btn>

        <q-btn
          v-if="!isCollapsed && boardsStore.selectedBoardId"
          flat
          class="sidebar__clear-btn"
          @click="clearSelection"
          color="grey-6"
          size="sm"
        >
          <span class="q-ml-xs">Mostrar Todos</span>
        </q-btn>
      </div>

      <div class="sidebar__boards">
        <div
          v-for="board in boardStats"
          :key="board.id"
          class="sidebar__board-item"
          :class="{
            'sidebar__board-item--active': board.isActive,
            'sidebar__board-item--collapsed': isCollapsed,
          }"
        >
          <div v-if="!isCollapsed" class="sidebar__board-content">
            <div class="sidebar__board-header" @click="selectBoard(board.id)">
              <q-icon name="dashboard" :color="board.isActive ? 'primary' : 'grey-6'" size="sm" />
              <span class="sidebar__board-name" :class="{ 'text-primary': board.isActive }">
                {{ board.name }}
              </span>
              <q-space />
              <div class="sidebar__board-actions">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  color="grey-6"
                  @click.stop="openEditBoardDialog(boards.find((b) => b.id === board.id))"
                  class="sidebar__action-btn"
                />
              </div>
            </div>

            <div class="sidebar__board-stats">
              <div class="sidebar__stat">
                <q-icon name="task_alt" size="xs" color="grey-6" />
                <span class="text-caption">{{ board.totalTasks }}</span>
              </div>
              <div class="sidebar__stat">
                <q-icon name="check_circle" size="xs" color="green" />
                <span class="text-caption">{{ board.completionRate }}%</span>
              </div>
            </div>

            <q-linear-progress
              :value="board.completionRate / 100"
              :color="board.completionRate === 100 ? 'green' : 'primary'"
              size="4px"
              rounded
              class="q-mt-xs"
            />
          </div>

          <div v-else class="sidebar__board-collapsed" @click="selectBoard(board.id)">
            <q-icon name="dashboard" :color="board.isActive ? 'primary' : 'grey-6'" size="md" />
            <q-badge
              v-if="board.totalTasks > 0"
              :label="board.totalTasks"
              color="primary"
              floating
              rounded
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isCollapsed" class="sidebar__empty">
      <q-icon name="dashboard" size="48px" color="grey-4" />
      <div class="text-caption text-grey-6 q-mt-sm">Nenhum board encontrado</div>
      <q-btn @click="openNewBoardDialog" color="primary" icon="add">
        <span class="q-ml-xs">Criar Primeiro Board</span>
      </q-btn>
    </div>

    <div v-if="!isCollapsed && boards.length > 0" class="sidebar__footer">
      <div class="text-caption text-grey-6">
        {{ boards.length }} board{{ boards.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <div v-if="isCollapsed" class="sidebar__footer-collapsed">
      <q-btn
        flat
        round
        dense
        :icon="isDark ? 'light_mode' : 'dark_mode'"
        @click="toggleTheme"
        class="sidebar__theme-toggle-collapsed"
        color="grey-6"
      >
        <q-tooltip>
          {{ isDark ? 'Modo Claro' : 'Modo Escuro' }}
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 242px;
  height: 99.2vh;
  background: var(--q-color-surface);
  border-right: 1px solid var(--q-color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sidebar--collapsed {
  width: 90px;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--q-color-border);
  min-height: 60px;
}

.sidebar--collapsed .sidebar__header {
  padding: 8px 6px;
  justify-content: space-between;
}

.sidebar__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar--collapsed .sidebar__header-actions {
  gap: 2px;
}

.sidebar__title {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.sidebar__title-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.sidebar__toggle {
  flex-shrink: 0;
}

.sidebar__theme-toggle {
  flex-shrink: 0;
}

.sidebar__content {
  flex: 1;
  padding: 8px;
  overflow-y: hidden;
  height: calc(100vh - 120px); /* Altura total menos header e footer */
}

.sidebar--collapsed .sidebar__content {
  padding: 4px;
}

.sidebar__new-board-btn {
  width: 100%;
  margin-bottom: 8px;
  border-radius: 8px;
  justify-content: flex-start;
  font-weight: 500;
}

.sidebar__new-board-btn--collapsed {
  justify-content: center;
  padding: 12px;
}

.sidebar__clear-btn {
  width: 100%;
  margin-bottom: 8px;
  border-radius: 8px;
  justify-content: flex-start;
}

.sidebar__boards {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__board-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}

.sidebar__board-item:hover {
  background: var(--q-color-grey-1);
  border-color: var(--q-color-grey-3);
}

.sidebar__board-item--active {
  background: var(--q-color-primary-1);
  border-color: var(--q-color-primary);
}

.sidebar__board-item--collapsed {
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.sidebar__board-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar__board-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.sidebar__board-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sidebar__board-item:hover .sidebar__board-actions {
  opacity: 1;
}

.sidebar__action-btn {
  min-height: 24px;
  min-width: 24px;
  padding: 4px;
}

.sidebar__board-name {
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__board-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sidebar__stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sidebar__board-collapsed {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.sidebar__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.sidebar__footer {
  padding: 16px;
  border-top: 1px solid var(--q-color-border);
  text-align: center;
}

.sidebar__footer-collapsed {
  padding: 8px;
  border-top: 1px solid var(--q-color-border);
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar__theme-toggle-collapsed {
  flex-shrink: 0;
}

/* Animações */
.sidebar__board-item {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scrollbar será aplicada globalmente via main.css */

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--q-color-border);
  }

  .sidebar--collapsed {
    width: 100%;
    height: 60px;
  }

  .sidebar__content {
    height: auto;
    max-height: 150px;
  }

  .sidebar__boards {
    flex-direction: row;
    overflow-x: hidden;
    padding-bottom: 8px;
  }

  .sidebar__board-item {
    min-width: 200px;
    flex-shrink: 0;
  }

  .sidebar__board-item--collapsed {
    min-width: 90px;
  }
}
</style>
