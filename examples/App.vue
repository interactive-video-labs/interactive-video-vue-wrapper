<template>
  <ExampleInteractiveVideo />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExampleInteractiveVideo from './ExampleInteractiveVideo.vue';

export default defineComponent({
  name: 'App',
  components: {
    ExampleInteractiveVideo,
  },
});
</script>
