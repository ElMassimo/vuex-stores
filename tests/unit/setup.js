import Vue from 'vue'
import Vuex from 'vuex'
import { expect } from 'chai'

Vue.use(Vuex)

// Allow test helpers to be accessed globally.
global.expect = expect

// Make it easier to test each store independently.
global.newVuexStore = (initialStore = {}) =>
  new Vuex.Store(initialStore)

// Default store for all tests, to ensure different modules can co-exist.
global.vuexStore = newVuexStore()

// https://vue-test-utils.vuejs.org/en/api/mount.html
const vueTestUtils = require('@vue/test-utils')
global.mount = vueTestUtils.mount
global.shallowMount = vueTestUtils.shallowMount
