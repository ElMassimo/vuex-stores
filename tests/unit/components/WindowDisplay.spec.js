import WindowDisplay from '@components/WindowDisplay'

describe('WindowDisplay', () => {
  it('maps the state and getters', () => {
    const wrapper = mount(WindowDisplay, { store: vuexStore })

    expect(wrapper.vm.isFullscreen).to.eq(false)
    expect(wrapper.vm.windowHeight).to.eq(window.innerHeight)
    expect(wrapper.vm.windowWidth).to.eq(window.innerWidth)
    expect(wrapper.vm.windowSize).to.eq(window.innerHeight * window.innerWidth)

    expect(wrapper.text()).to.contain(`Height: ${window.innerHeight}`)
    expect(wrapper.text()).to.contain(`Width: ${window.innerWidth}`)
    expect(wrapper.text()).to.contain(`Size: ${window.innerHeight * window.innerWidth}`)
  })

  it('maps the action dispatch method', () => {
    const wrapper = mount(WindowDisplay, { store: vuexStore })
    const toggleFullscreen = wrapper.find('.toggle-fullscreen-button')

    toggleFullscreen.trigger('click')
    expect(wrapper.vm.isFullscreen).to.eq(true)

    toggleFullscreen.trigger('click')
    expect(wrapper.vm.isFullscreen).to.eq(false)
  })
})
