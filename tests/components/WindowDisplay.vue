<script>
import WindowStore from '@stores/WindowStore'

export default {
  name: 'WindowDisplay',
  computed: {
    ...WindowStore.mapState('isFullscreen', 'windowWidth', 'windowHeight'),
    ...WindowStore.mapGetters('windowSize')
  },
  methods: {
    ...WindowStore.mapActions('setFullscreen')
  }
}
</script>

<template>
  <div
    class="window-display"
    :class="{ 'window-fullscreen': isFullscreen }"
  >
    <div class="window-width">
      Width: {{ windowWidth }}
    </div>
    <div class="window-height">
      Height: {{ windowHeight }}
    </div>
    <div class="window-size">
      Size: {{ windowSize }}
    </div>
    <button
      class="toggle-fullscreen-button"
      @click="setFullscreen(!isFullscreen)"
    >
      Toggle Fullscreen
    </button>
  </div>
</template>
