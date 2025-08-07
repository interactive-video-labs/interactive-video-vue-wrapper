<template>
  <div>
    <h1>Interactive Video Examples</h1>

    <h2>Scenario 1: Component Renders Its Own Container</h2>
    <p>This example does not provide a `targetElementId` prop. The `InteractiveVideo` component will generate its own unique ID and render a `div` for the player.</p>
    <InteractiveVideo
      videoUrl="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      :autoplay="false"
      :loop="false"
      :cues="exampleCues"
      @analytics-event="handleAnalyticsEvent"
      style="width: 600px; height: 337.5px; border: 1px solid blue;"
    />

    <h2>Scenario 2: External Container Provided</h2>
    <p>This example provides a `targetElementId` prop (`my-custom-player-container`). The `InteractiveVideo` component will attach to the `div` with this ID, which is rendered externally.</p>
    <div id="my-custom-player-container" style="width: 600px; height: 337.5px; border: 1px solid green;"></div>
    <InteractiveVideo
      videoUrl="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      targetElementId="my-custom-player-container"
      :autoplay="false"
      :loop="false"
      @analytics-event="handleAnalyticsEvent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InteractiveVideo from '../src'; // Adjust path as needed
import { CuePoint } from '@interactive-video-labs/core';

export default defineComponent({
  name: 'ExampleInteractiveVideo',
  components: {
    InteractiveVideo,
  },
  setup() {
    const handleAnalyticsEvent = (event: string, payload?: any) => {
      console.log(`Analytics Event: ${event}`, payload);
    };

    const exampleCues: CuePoint[] = [
                          { id: 'segmentChange', time: 10, label: 'Segment Change', payload: { interaction: { type: 'choice-video-segment-change', title: 'Choose your path', description: 'Select a video segment to jump to.', question: 'Where would you like to go?', options: [{ level: 'Segment A', video: 'https://interactive-video-labs.github.io/assets/sample-interaction-1.mp4' }, { level: 'Segment B', video: 'https://interactive-video-labs.github.io/assets/sample-interaction-2.mp4' }] } } },
                    { id: 'intro', time: 2, label: 'Introduction', payload: { message: 'Welcome!' } },
    ];

    return {
      handleAnalyticsEvent,
      exampleCues,
    };
  },
});
</script>

<style scoped>
div {
  margin-bottom: 20px;
}
</style>
