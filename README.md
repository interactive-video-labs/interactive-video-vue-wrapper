# @interactive-video-labs/vue

<p align="center">
  <img src="https://raw.githubusercontent.com/interactive-video-labs/docs/main/logo.svg" width="200px" alt="Interactive Video Labs Logo" />
</p>
<p align="center">
  <img src="https://img.shields.io/npm/v/@interactive-video-labs/vue" alt="NPM Version" />
  <img src="https://img.shields.io/npm/l/@interactive-video-labs/vue" alt="NPM License" />
  <img src="https://img.shields.io/npm/d18m/@interactive-video-labs/vue?style=flat-square" alt="NPM Downloads" />
  <a href="https://github.com/interactive-video-labs/interactive-video-vue-wrapper/actions">
    <img src="https://github.com/interactive-video-labs/interactive-video-vue-wrapper/actions/workflows/release.yml/badge.svg" alt="Build Status" />
  </a>
</p>

Welcome to `@interactive-video-labs/vue` — a lightweight Vue 3 wrapper around the `@interactive-video-labs/core` engine for cue-driven interactive video experiences.

This wrapper enables seamless integration of interactive video players into Vue applications using idiomatic Vue components and bindings, while staying close to the underlying core engine API.

---

## Features

- **Declarative Props**: Control the player via reactive Vue props.
- **Event Handling**: Listen to player events using a simple `onAnalyticsEvent` callback.
- **Dynamic Content**: Update cue points and translations on the fly.
- **Direct Player Access**: Get direct access to the underlying `@interactive-video-labs/core` player instance.
- **TypeScript Support**: Fully typed for a better development experience.

## Installation

Install the package and its peer dependencies using your favorite package manager:

```bash
# With pnpm
pnpm add @interactive-video-labs/vue @interactive-video-labs/core vue

# With npm
npm install @interactive-video-labs/vue @interactive-video-labs/core vue

# With yarn
yarn add @interactive-video-labs/vue @interactive-video-labs/core vue
```

## Basic Usage

Here's a simple example of how to use the `InteractiveVideo` component in your Vue 3 application.

```vue
<script setup>
import { ref } from 'vue';
import InteractiveVideo from '@interactive-video-labs/vue';
import '@interactive-video-labs/core/dist/style.css'; // Don't forget to import the styles

const videoUrl = ref('https://example.com/my-video.mp4');
const cues = ref([
  {
    time: 10,
    payload: { type: 'text', content: 'This is a timed message!' },
  },
  {
    time: 25,
    payload: { type: 'quiz', question: 'What is Vue?' },
  },
]);

function handleAnalyticsEvent(event, payload) {
  console.log('Analytics Event:', event, payload);
}
</script>

<template>
  <InteractiveVideo
    :video-url="videoUrl"
    :cues="cues"
    :on-analytics-event="handleAnalyticsEvent"
    autoplay
    loop
  />
</template>
```

## API Reference

### Props

The component accepts the following props:

| Prop               | Type                                                          | Required | Default | Description                                                                |
| ------------------ | ------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------- |
| `videoUrl`         | `string`                                                      | `true`   | -       | The URL of the video to be loaded.                                         |
| `cues`             | `CuePoint[]`                                                  | `false`  | `[]`    | An array of cue points for interactive events. Can be updated dynamically. |
| `translations`     | `Translations`                                                | `false`  | `{}`    | An object containing translations for the player UI.                       |
| `onAnalyticsEvent` | `(event: AnalyticsEvent, payload?: AnalyticsPayload) => void` | `false`  | -       | Callback function for analytics events emitted by the player.              |
| `autoplay`         | `boolean`                                                     | `false`  | `false` | Whether the video should start playing automatically.                      |
| `loop`             | `boolean`                                                     | `false`  | `false` | Whether the video should loop.                                             |
| `locale`           | `string`                                                      | `false`  | `'en'`  | The locale to be used for the player (e.g., 'en', 'es').                   |

Any additional attributes passed to the component will be forwarded to the underlying `@interactive-video-labs/core` player configuration.

### Events

Player events are emitted through the `onAnalyticsEvent` prop.

**Available Events:**

- `PLAYER_LOADED`
- `VIDEO_STARTED`
- `VIDEO_PAUSED`
- `VIDEO_ENDED`
- `CUE_TRIGGERED`
- `INTERACTION_COMPLETED`
- `ERROR`

**Example:**

```js
function handleAnalyticsEvent(event, payload) {
  switch (event) {
    case 'CUE_TRIGGERED':
      console.log('A cue was triggered at:', payload.cue.time);
      break;
    case 'ERROR':
      console.error('Player error:', payload.error);
      break;
  }
}
```

### Exposing the Player Instance

If you need to call methods on the player instance directly, you can get a reference to it using a `ref` on the component.

```vue
<script setup>
import { ref, onMounted } from 'vue';
import InteractiveVideo from '@interactive-video-labs/vue';
import '@interactive-video-labs/core/dist/style.css';

const videoPlayer = ref(null);

onMounted(() => {
  // The player instance is available on videoPlayer.value.playerRef
  if (videoPlayer.value) {
    const corePlayer = videoPlayer.value.playerRef;
    corePlayer.play();
  }
});
</script>

<template>
  <InteractiveVideo ref="videoPlayer" video-url="https://example.com/my-video.mp4" />
</template>
```

---

## 🧑‍💻 For Developers

For detailed development setup, project structure, testing, build, and publishing instructions, please refer to our [Developer Guide](DEVELOPER.md).

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
