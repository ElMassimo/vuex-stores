import { namespace, state, getters, mutations, actions } from '@stores/WindowStore'
import { registerAndGetStore } from 'vuex-stores'

describe('WindowStore', () => {
  let store
  before(() => {
    store = registerAndGetStore(newVuexStore(), { namespace, state, getters, mutations, actions })
  })

  it('can access namespace as property', () => {
    expect(store.moduleNamespace).to.eq('window')
  })

  it('can access state as properties', () => {
    expect(store.isFullscreen).to.eq(false)
    expect(store.windowHeight).to.eq(window.innerHeight)
    expect(store.windowWidth).to.eq(window.innerWidth)
  })

  it('can access getters as properties', () => {
    expect(store.windowSize).to.eq(window.innerHeight * window.innerWidth)
  })

  it('can dispatch actions as methods', () => {
    expect(store.isFullscreen).to.eq(false)

    store.setFullscreen(true)
    expect(store.isFullscreen).to.eq(true)

    store.setFullscreen(false)
    expect(store.isFullscreen).to.eq(false)

    store.updateWindowSize({ width: 500, height: 250 })
    expect(store.windowHeight).to.eq(250)
    expect(store.windowWidth).to.eq(500)
    expect(store.windowSize).to.eq(500 * 250)

    store.updateWindowSize()
    expect(store.windowHeight).to.eq(window.innerHeight)
    expect(store.windowWidth).to.eq(window.innerWidth)
  })
})
