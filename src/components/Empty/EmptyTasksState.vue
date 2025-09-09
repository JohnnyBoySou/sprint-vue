<template>
  <q-banner class="bg-orange-1 text-orange-8 q-mb-lg" rounded>
    <template v-slot:avatar>
      <q-icon name="task_alt" color="orange" />
    </template>
    <div class="text-h6 q-mb-sm">Nenhuma Tarefa Encontrada</div>
    <div class="text-body2 q-mb-md">
      Adicione sua primeira tarefa para começar a trabalhar.
    </div>
    <q-btn 
      color="orange" 
      label="Criar Primeira Tarefa" 
      @click="$emit('create-task')"
      icon="add_task"
    />
  </q-banner>
</template>

<script setup lang="ts">
defineEmits<{
  'create-task': []
}>()
</script>
