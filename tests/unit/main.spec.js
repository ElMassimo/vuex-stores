import { expect } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'

import { registerAndGetStore } from '@/main.js'

Vue.use(Vuex)
const vuexStore = new Vuex.Store({})

describe('registerAndGetStore', () => {
  it('returns a store object', () => {
    const state = {
      // Whether the navigation bar and the footer should be hidden.
      isFullscreen: false,

      // The current height of the window.
      windowHeight: window.innerHeight,

      // The current width of the window.
      windowWidth: window.innerWidth
    }

    const getters = {
      windowSize (state) {
        return state.windowHeight * state.windowWidth
      }
    }

    const mutations = {
      SET_FULLSCREEN (state, isFullscreen) {
        state.isFullscreen = isFullscreen
      },
      SET_WINDOW_SIZE (state, { height, width }) {
        state.windowHeight = height
        state.windowWidth = width
      }
    }

    const actions = {
      // Changes to fullscreen mode.
      setFullscreen ({ commit }, isFullscreen) {
        commit('SET_FULLSCREEN', isFullscreen)
      },
      // Updates the screen size when the window is resized.
      updateWindowSize ({ commit }) {
        commit('SET_WINDOW_SIZE', { height: window.innerHeight, width: window.innerWidth })
      }
    }

    const WindowStore = registerAndGetStore(vuexStore, 'window', { state, getters, mutations, actions })
    expect(WindowStore.isFullscreen).to.eq(false)

    WindowStore.setFullscreen(true)
    expect(WindowStore.isFullscreen).to.eq(true)
  })
})
