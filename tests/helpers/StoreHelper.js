import { registerAndGetStore } from 'vuex-stores'

// Public: Registers the module in the Vuex store, and returns a set of helpers.
export function createStore (moduleConfig) {
  return registerAndGetStore(vuexStore, moduleConfig)
}
