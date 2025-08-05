import { defineComponent, onMounted, onUnmounted, ref, watch, h, PropType } from 'vue';
import { IVLabsPlayer, PlayerConfig, CuePoint, Translations, AnalyticsEvent, AnalyticsPayload } from '@interactive-video-labs/core';

// Define the props interface based on the React component's props
export interface InteractiveVideoProps extends Omit<PlayerConfig, 'videoUrl' | 'cues' | 'translations'> {
  videoUrl: string;
  onAnalyticsEvent?: (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;
  cues?: CuePoint[];
  translations?: Translations;
}

export default defineComponent({
  name: 'InteractiveVideo',
  props: {
    videoUrl: { type: String, required: true },
    onAnalyticsEvent: { type: Function as PropType<(event: AnalyticsEvent, payload?: AnalyticsPayload) => void> },
    cues: { type: Array as PropType<CuePoint[]> },
    translations: { type: Object as PropType<Translations> },
    // It's better to explicitly define the props that can be passed
    autoplay: { type: Boolean, default: false },
    loop: { type: Boolean, default: false },
    locale: { type: String, default: 'en' },
    // Add other PlayerConfig properties here as needed
  },
  setup(props, { attrs, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const playerRef = ref<IVLabsPlayer | null>(null);
    const uniqueId = `ivlabs-player-${Math.random().toString(36).substr(2, 9)}`;

    onMounted(() => {
      if (containerRef.value) {
        // Combine props and non-prop attributes to pass to the player
        const playerConfig: PlayerConfig = {
          ...attrs,
          videoUrl: props.videoUrl,
          autoplay: props.autoplay,
          loop: props.loop,
          locale: props.locale,
        };

        try {
          // Use a timeout to ensure the element is in the DOM
          setTimeout(() => {
            if (containerRef.value) {
              const player = new IVLabsPlayer(`#${uniqueId}`, playerConfig);
              playerRef.value = player;

              if (props.onAnalyticsEvent) {
                player.on('PLAYER_LOADED', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('PLAYER_LOADED', payload));
                player.on('VIDEO_STARTED', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('VIDEO_STARTED', payload));
                player.on('VIDEO_PAUSED', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('VIDEO_PAUSED', payload));
                player.on('VIDEO_ENDED', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('VIDEO_ENDED', payload));
                player.on('CUE_TRIGGERED', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('CUE_TRIGGERED', payload));
                player.on('INTERACTION_COMPLETED', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('INTERACTION_COMPLETED', payload));
                player.on('ERROR', (payload?: AnalyticsPayload) => (props.onAnalyticsEvent as Function)('ERROR', payload));
              }

              if (props.cues) {
                player.loadCues(props.cues);
              }

              if (props.translations) {
                player.loadTranslations(props.locale, props.translations);
              }
            }
          }, 0);
        } catch (error) {
          console.error('Error initializing IVLabsPlayer:', error);
        }
      }
    });

    onUnmounted(() => {
      if (playerRef.value) {
        playerRef.value.destroy();
        playerRef.value = null;
      }
    });

    watch(() => props.cues, (newCues) => {
      if (playerRef.value && newCues) {
        playerRef.value.loadCues(newCues);
      }
    }, { deep: true });

    watch(() => props.translations, (newTranslations) => {
      if (playerRef.value && newTranslations) {
        playerRef.value.loadTranslations(props.locale, newTranslations);
      }
    }, { deep: true });

    expose({ playerRef });

    // Use Vue's render function `h` to create the container div
    return () => h('div', {
      ref: containerRef,
      id: uniqueId,
      style: { width: '100%', height: 'auto' },
      'data-testid': 'interactive-video-container',
    });
  },
});