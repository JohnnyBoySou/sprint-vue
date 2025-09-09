<template>
  <q-banner class="bg-blue-1 text-blue-8 q-mb-lg" rounded>
    <template v-slot:avatar>
      <q-icon name="dashboard" color="blue" />
    </template>
    <div class="text-h6 q-mb-sm">Nenhum Board Encontrado</div>
    <div class="text-body2 q-mb-md">
      Crie seu primeiro board para começar a organizar suas tarefas.
    </div>
    <q-btn 
      color="blue" 
      label="Criar Primeiro Board" 
      @click="$emit('create-board')"
      icon="add"
    />
  </q-banner>
</template>

<script setup lang="ts">
defineEmits<{
  'create-board': []
}>()
</script>
