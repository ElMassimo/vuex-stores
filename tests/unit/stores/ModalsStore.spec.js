import { namespace, state, getters, mutations, actions } from '@stores/ModalsStore'
import { buildStoreObject } from 'vuex-stores'

describe('ModalsStore', () => {
  const vuexStore = newVuexStore()
  const store = buildStoreObject(vuexStore, { namespace, state, getters, mutations, actions })
  before(() => {
    store.unregisterModule()
    store.registerModule()
  })

  it('can access namespace as property', () => {
    expect(store.moduleNamespace).to.eq('modals')
  })

  it('can access state as properties', () => {
    expect(store.modals).to.have.length(0)
  })

  it('can access getters as properties', () => {
    expect(store.isModalOpen('5')).to.eq(false)
  })

  it('can dispatch actions as methods', async () => {
    const fakeModalId = await store.addModal({ component: 'FakeModal' })
    expect(store.modals).to.have.length(1)

    // Test that `this` is not relevant when calling the methods, making it
    // easier to inject them or pass them around.
    const { addModal, removeModal, closeAllModals, isModalOpen } = store

    addModal({ component: 'FakeModal' })
    expect(store.modals).to.have.length(2)

    addModal({ component: 'ConfirmModal', id: 'confirmation-modal' })
    expect(isModalOpen('confirmation-modal')).to.eq(true)

    addModal({ component: 'ConfirmModal', id: 'confirmation-modal' })
    expect(store.modals).to.have.length(3)

    removeModal({ id: 'confirmation-modal' })
    expect(isModalOpen('confirmation-modal')).to.eq(false)

    removeModal({ id: 'confirmation-modal' })
    expect(store.modals).to.have.length(2)

    removeModal({ id: fakeModalId })
    expect(store.modals).to.have.length(1)

    closeAllModals()
    expect(store.modals).to.have.length(0)
  })
})
