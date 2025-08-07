import { defineComponent, onUnmounted, onMounted, ref, watch, h, PropType, nextTick } from 'vue';
import { IVLabsPlayer, PlayerConfig, CuePoint, Translations, AnalyticsEvent, AnalyticsPayload } from '@interactive-video-labs/core';

/**
 * Props for the InteractiveVideo component.
 */
export interface InteractiveVideoProps extends Omit<PlayerConfig, 'videoUrl' | 'cues' | 'translations' | 'targetElementId'> {
  /**
   * The URL of the video to be loaded.
   */
  videoUrl: string;
  /**
   * Callback function for analytics events.
   * @param event The name of the event.
   * @param payload The data associated with the event.
   */
  onAnalyticsEvent?: (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;
  /**
   * An array of cue points for interactive events.
   */
  cues?: CuePoint[];
  /**
   * An object containing translations for the player.
   */
  translations?: Translations;
}


/**
 * A Vue component that wraps the IVLabsPlayer to provide interactive video capabilities.
 * It handles the lifecycle of the player, including initialization, updates, and destruction.
 */
export default defineComponent({
  name: 'InteractiveVideo',
  props: {
    /**
     * The URL of the video to be loaded.
     */
    videoUrl: { type: String, required: true },
    /**
     * Callback function for analytics events.
     */
    onAnalyticsEvent: { type: Function as PropType<(event: AnalyticsEvent, payload?: AnalyticsPayload) => void> },
    /**
     * An array of cue points for interactive events.
     */
    cues: { type: Array as PropType<CuePoint[]> },
    /**
     * An object containing translations for the player.
     */
    translations: { type: Object as PropType<Translations> },
    /**
     * Whether the video should start playing automatically.
     */
    autoplay: { type: Boolean, default: false },
    /**
     * Whether the video should loop.
     */
    loop: { type: Boolean, default: false },
    /**
     * The locale to be used for the player.
     */
    locale: { type: String, default: 'en' },
    /**
     * The ID of the target HTML element where the player will be mounted.
     */
    targetElementId: { type: String },
  },
  /**
   * The setup function for the component.
   * @param props The component's props.
   * @param attrs The component's attributes.
   * @param expose Function to expose properties to the parent component.
   * @returns A render function that creates the component's DOM structure.
   */
  setup(props, { attrs, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const playerRef = ref<IVLabsPlayer | null>(null);

    // Determine the ID to be used by the IVLabsPlayer.
    // If targetElementId is provided, use it directly.
    // Otherwise, generate a unique ID for the div rendered by this component.
    const playerTargetId = props.targetElementId || `ivlabs-player-${Math.random().toString(36).substr(2, 9)}`;

    const initializePlayer = () => {
      if (playerRef.value) {
        return; // Player already initialized
      }

      // Ensure the target element exists in the DOM before proceeding.
      const targetElement = document.getElementById(playerTargetId);
      if (!targetElement) {
        console.error(`IVLabsPlayer target element with ID '${playerTargetId}' not found.`);
        return;
      }

      const playerConfig: PlayerConfig = {
        ...attrs,
        videoUrl: props.videoUrl,
        autoplay: props.autoplay,
        loop: props.loop,
        locale: props.locale,
      };

      try {
        // Pass the ID of the target element, not the element itself.
        const player = new IVLabsPlayer(playerTargetId, playerConfig);
        playerRef.value = player;

        if (props.onAnalyticsEvent) {
          const analyticsHandler = props.onAnalyticsEvent;
          const eventsToRegister: AnalyticsEvent[] = [
            'PLAYER_LOADED',
            'VIDEO_STARTED',
            'VIDEO_PAUSED',
            'VIDEO_ENDED',
            'CUE_TRIGGERED',
            'INTERACTION_COMPLETED',
            'ERROR',
          ];

          eventsToRegister.forEach((event) => {
            player.on(event, (payload?: AnalyticsPayload) => {
              analyticsHandler(event, payload);
            });
          });
        }

        if (props.cues) {
          player.loadCues(props.cues);
        }

        if (props.translations) {
          player.loadTranslations(props.locale, props.translations);
        }
      } catch (error) {
        console.error('Error initializing IVLabsPlayer:', error);
      }
    };

    onMounted(() => {
      // Delay initialization to ensure the DOM is ready
      nextTick(() => {
        initializePlayer();
      });
    });

    onUnmounted(() => {
      if (playerRef.value) {
        playerRef.value.destroy();
        playerRef.value = null;
      }
    });

    /**
     * Watches for changes in the cues prop and reloads them in the player.
     */
    watch(() => props.cues, (newCues) => {
      if (playerRef.value && newCues) {
        playerRef.value.loadCues(newCues);
      }
    }, { deep: true });

    /**
     * Watches for changes in the translations prop and reloads them in the player.
     */
    watch(() => props.translations, (newTranslations) => {
      if (playerRef.value && newTranslations) {
        playerRef.value.loadTranslations(props.locale, newTranslations);
      }
    }, { deep: true });

    // Expose the player instance to the parent component.
    expose({ playerRef });

    /**
     * The render function for the component.
     * @returns A VNode representing the container div for the player.
     */
    return () => {
      if (props.targetElementId) {
        // If targetElementId is provided, this component does not render a div.
        // It expects the user to provide the div with that ID.
        return null;
      } else {
        // If no targetElementId is provided, this component renders its own div.
        return h('div', {
          ref: containerRef,
          id: playerTargetId, // Use the generated ID for this div
          style: { width: '100%', height: 'auto' },
          'data-testid': 'interactive-video-container',
        });
      }
    };
  },
});
