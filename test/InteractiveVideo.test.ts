import { mount } from '@vue/test-utils';
import InteractiveVideo from '../src/index';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IVLabsPlayer } from '@interactive-video-labs/core';

// Mock the IVLabsPlayer
vi.mock('@interactive-video-labs/core', () => {
  const mockPlayer = {
    on: vi.fn(),
    loadCues: vi.fn(),
    loadTranslations: vi.fn(),
    destroy: vi.fn(),
    emit: vi.fn(), // Mock the emit method
  };
  return {
    IVLabsPlayer: vi.fn(() => mockPlayer),
  };
});

describe('InteractiveVideo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the video container', () => {
    const wrapper = mount(InteractiveVideo, {
      props: {
        videoUrl: 'https://example.com/video.mp4',
      },
    });
    expect(wrapper.find('[data-testid="interactive-video-container"]').exists()).toBe(true);
  });

  it('initializes the player on mount', async () => {
    const wrapper = mount(InteractiveVideo, {
      props: {
        videoUrl: 'https://example.com/video.mp4',
      },
      attachTo: document.body, // Attach to the DOM
    });

    // Fast-forward timers to trigger the player initialization
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(IVLabsPlayer).toHaveBeenCalledTimes(1);
    expect(wrapper.find('div').attributes('id')).toContain('ivlabs-player');
  });

  it('initializes the player with a custom targetElementId', async () => {
    const customId = 'my-custom-player-id';
    const customElement = document.createElement('div');
    customElement.id = customId;
    document.body.appendChild(customElement);

    const wrapper = mount(InteractiveVideo, {
      props: {
        videoUrl: 'https://example.com/video.mp4',
        targetElementId: customId,
      },
      attachTo: document.body,
    });

    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(IVLabsPlayer).toHaveBeenCalledTimes(1);
    expect(wrapper.find('div').exists()).toBe(false);

    document.body.removeChild(customElement);
  });

  it('calls onAnalyticsEvent when an event is fired', async () => {
    const onAnalyticsEvent = vi.fn();
    const wrapper = mount(InteractiveVideo, {
      props: {
        videoUrl: 'https://example.com/video.mp4',
        onAnalyticsEvent,
      },
      attachTo: document.body, // Attach to the DOM
    });

    // Fast-forward timers to trigger the player initialization
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    // Get the mocked player instance
    const mockPlayerInstance = (IVLabsPlayer as any).mock.results[0].value;

    // Simulate an event being fired by the player
    const eventCallback = (mockPlayerInstance.on as any).mock.calls.find(
      (call) => call[0] === 'PLAYER_LOADED',
    )[1];
    eventCallback({ some: 'payload' });

    expect(onAnalyticsEvent).toHaveBeenCalledWith('PLAYER_LOADED', { some: 'payload' });
  });
});
