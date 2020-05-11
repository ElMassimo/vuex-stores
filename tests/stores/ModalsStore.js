import { createStore } from '@helpers/StoreHelper'

let newModalIds = 0

// The namespace used to register this module in the Vuex store.
export const namespace = 'modals'

export const state = {
  // Modals that are currently being displayed.
  modals: []
}

export const getters = {
  // Checks if a modal with the specified id is currently open.
  isModalOpen (state) {
    return id => state.modals.some(modal => modal.id === id)
  }
}

export const mutations = {
  ADD_MODAL (state, modal) {
    state.modals.push(modal)
  },
  REMOVE_MODAL (state, { id }) {
    const index = state.modals.findIndex(modal => modal.id === id)
    if (index !== -1) state.modals.splice(index, 1)
  },
  CLOSE_ALL_MODALS (state) {
    state.modals = []
  }
}

export const actions = {
  // Adds a modal to the current window.
  //
  // NOTE: It's not possible to open several modals with the same id.
  // An unique id is auto-generated unless one is provided.
  addModal ({ commit, getters }, { component, attrs, listeners, id = `modal-${newModalIds++}` }) {
    if (!getters.isModalOpen(id)) {
      commit('ADD_MODAL', { component, attrs, listeners, id })
    }
    return id
  },
  // Removes a modal from the current window.
  removeModal ({ commit, getters }, { id }) {
    if (getters.isModalOpen(id)) commit('REMOVE_MODAL', { id })
  },
  // Closes all modals.
  closeAllModals ({ commit, state }) {
    if (state.modals.length > 0) commit('CLOSE_ALL_MODALS')
  }
}

export default createStore({ namespace, state, getters, mutations, actions })
