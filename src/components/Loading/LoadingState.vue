<template>
  <div class="flex flex-center" style="height: 50vh">
    <q-spinner-dots size="40px" color="primary" />
    <div class="q-ml-md text-grey-6">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Carregando aplicação...'
})
</script>
