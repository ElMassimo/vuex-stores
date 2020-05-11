import { createStore } from '@helpers/StoreHelper'

// The namespace used to register this module in the Vuex store.
export const namespace = 'window'

export const state = () => ({
  // Whether the navigation bar and the footer should be hidden.
  isFullscreen: false,

  // The current height of the window.
  windowHeight: window.innerHeight,

  // The current width of the window.
  windowWidth: window.innerWidth
})

export const getters = {
  // Useful to use a single watcher to detect resize events.
  windowSize (state) {
    return state.windowHeight * state.windowWidth
  }
}

export const mutations = {
  SET_FULLSCREEN (state, isFullscreen) {
    state.isFullscreen = isFullscreen
  },
  SET_WINDOW_SIZE (state, { height, width }) {
    state.windowHeight = height
    state.windowWidth = width
  }
}

export const actions = {
  // Changes to fullscreen mode.
  setFullscreen ({ commit }, isFullscreen) {
    commit('SET_FULLSCREEN', isFullscreen)
  },
  // Updates the screen size when the window is resized.
  updateWindowSize ({ commit }, size = { height: window.innerHeight, width: window.innerWidth }) {
    commit('SET_WINDOW_SIZE', size)
  }
}

export default createStore({ namespace, state, getters, mutations, actions })
