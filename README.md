# Vuex Stores 🗄

[![Gem Version](https://badge.fury.io/js/vuex-stores.svg)](http://badge.fury.io/js/vuex-stores)
[![Build Status](https://travis-ci.org/ElMassimo/vuex-stores.svg)](https://travis-ci.org/ElMassimo/vuex-stores)
[![Code Climate](https://codeclimate.com/github/ElMassimo/vuex-stores/badges/gpa.svg)](https://codeclimate.com/github/ElMassimo/vuex-stores)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ElMassimo/vuex-stores/blob/master/LICENSE.txt)

Store objects for Vuex, a simple and more fluid API for state-management.

## Why? 🤔

Dispatching actions and injecting getters in [Vuex](https://vuex.vuejs.org/) requires using `String`
namespaces and action names, which is verbose and makes it hard to detect typos.

Injecting state, getters, and actions using the `map` helpers is sometimes
cumbersome, and is only suitable for components.

Store objects address these issues by allowing access to state and getters as
properties, and dispatching actions easily by using plain method calls.

## Installation ⚙️

```
npm install --save vuex-stores
```

or if using `yarn`:

```
yarn add vuex-stores
```

## API ⌨️

`registerAndGetStore` allows to [dynamically register](https://vuex.vuejs.org/guide/modules.html#dynamic-module-registration) a [module](https://vuex.vuejs.org/guide/modules.html) in the specified
Vuex store, returning a _Store Object_ which can be used to easily access state,
getters, and actions, abstracting away the namespace for that module.

```js
import { registerAndGetStore } from 'vuex-stores'

const WindowStore = registerAndGetStore(vuexStore, { namespace, state, getters, mutations, actions })
````

### [State](https://vuex.vuejs.org/guide/state.html) 🗃

State can be accessed as properties in the store object:

```js
const state = {
  isFullscreen: false,
  windowHeight: 768,
  windowWidth: 1024,
}

// A property is available for every property in the state:

WindowStore.isFullscreen // false
WindowStore.windowHeight // 768
WindowStore.windowWidth // 1024
```

### [Getters](https://vuex.vuejs.org/guide/getters.html) ✋

Getters can be accessed as properties in the store object:

```js
const getters = {
  windowSize (state) {
    return state.windowHeight * state.windowWidth
  },
}

// A property is available for every getter:

WindowStore.windowSize // 1024 * 768 = 786,432
```

### [Actions](https://vuex.vuejs.org/guide/actions.html) ⚡️

Actions can be dispatched by calling methods in the store object:

```js
export const actions = {
  setFullscreen ({ commit }, isFullscreen) {
    commit('SET_FULLSCREEN', isFullscreen)
  },
  updateWindowSize ({ commit }, size = { height: window.innerHeight, width: window.innerWidth }) {
    commit('SET_WINDOW_SIZE', size)
  },
}

// A method is available for every action:
WindowStore.setFullscreen(true)
WindowStore.updateWindowSize()

vuexStore.dispatch('window/updateWindowSize', { width: 1024, height: 768 })
// becomes the more natural
WindowStore.updateWindowSize({ width: 1024, height: 768 })
```

By convention, mutations should be an internal detail, so they are not exposed.

### `mapState`, `mapGetters`, `mapActions`

These usual helpers are available, allowing us to inject properties and methods
in a component, without having to [deal with the namespace](https://vuex.vuejs.org/guide/modules.html#binding-helpers-with-namespace):

```js
computed: {
  ...WindowStore.mapState('windowHeight', 'windowWidth'),
  ...WindowStore.mapGetters('windowSize'),
},
methods: {
  ...WindowStore.mapActions('setFullscreen')
},
```

These are mostly helpful when the values are used in the template. Else, we have
a better option that doesn't require all that boilerplate:

```js
methods: {
  onToggleFullscreen (event) {
    WindowStore.setFullscreen(!WindowStore.isFullscreen)
  },
},
```

An additional benefit is that references to the state and actions are more
explicit, doesn't require [manual boilerplate](https://vuex.vuejs.org/guide/mutations.html#using-constants-for-mutation-types), making the code easier to understand and refactor 😀

### [`watch`](https://vuex.vuejs.org/api/#watch) 👁

Makes it convenient to be reactive to a value in a store outside of components:

```js
WindowStore.watch('windowSize', windowSize => console.log('onWindowSizeChange', windowSize))

WindowStore.watch('isNavigating',
  isNavigating => isNavigating ? NProgress.start() : NProgress.done(),
  { sync: true }, // Any watcher options can be provided, such as `immediate`.
)
```

Other less commonly used API properties and methods include:

- `buildStoreObject`: Like `registerAndGetStore`, but doesn't call `registerModule`.
- `registerModule`: Used internally by `registerAndGetStore` to register the module in Vuex.
- `unregisterModule`: Can be used to remove the module from the Vuex store.
- `moduleNamespace`: The module name for this store object in the Vuex store, relevant if using a [factory pattern](https://github.com/ElMassimo/vuex-stores#dynamic-stores-factory-).

## Recommended Setup 🛠

The recommended setup involves exporting the `Vuex.Store`:

```js
// @app/store.js

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production'
})

export default store
```

And creating one file per store module, exporting the store object:

```js
// @stores/ModalStore.js

import store from '@app/store'
import { registerAndGetStore } from 'vuex-stores'

let newModalIds = 0

// The namespace for this store module.
const namespace = 'modals'

const state = () => ({
  // Modals that are currently being displayed.
  modals: [],
})

const getters = {
  // Checks if a modal with the specified id is currently open.
  isModalOpen (state) {
    return id => state.modals.some(modal => modal.id === id)
  },
}

const mutations = {
  ADD_MODAL (state, modal) {
    state.modals.push(modal)
  },
  REMOVE_MODAL (state, { id }) {
    removeBy(state.modals, modal => modal.id === id)
  },
  CLOSE_ALL_MODALS (state) {
    state.modals = []
  },
}

const actions = {
  // Adds a modal to the current window.
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
  },
}

export default registerAndGetStore(store, { namespace, state, getters, mutations, actions })
```

This makes it very convenient to import the store object from a component:

```vue
// @components/ModalManager.vue

<script>
import ModalsStore from '@stores/ModalsStore'

export default {
  name: 'ModalManager',
  computed: {
    modals () {
      return ModalsStore.modals
    },
  },
  beforeMount () {
    // Hide modals when visiting a different route.
    if (this.$router) this.$router.afterEach(ModalsStore.closeAllModals)
  },
  methods: {
    onModalClose (modal, event) {
      if (!event.defaultPrevented) ModalsStore.removeModal(modal)
    },
  },
}
</script>

<template>
  <span class="modal-manager">
    <component
      :is="modal.component"
      v-for="modal in modals"
      :id="modal.id"
      :key="modal.id"
      v-bind="modal.attrs"
      v-on="modal.listeners"
      @modal:close.native="onModalClose(modal, $event)"
    />
  </span>
</template>
```

The pattern described above is just one of many possibilities.

Feel free to check the [tests](https://github.com/ElMassimo/vuex-stores/blob/master/tests/components/WindowDisplay.vue)
for additional usage examples, and setup options.

### Dynamic Stores (Factory) 💠

What happens if we need more than one instance of a store? Instead of exporting
a single store object, we can export a function that dynamically registers a new
store object on each invocation.

For example:

```js
// @stores/ModalStoreFactory

import { uniqueId } from 'lodash'

export default (id = uniqueId(namespace)) =>
  registerAndGetStore(store, { namespace: id, state, getters, mutations, actions })
```

Nothing prevents you from creating a `Map` of store objects, and dynamically
unregistering them once they are no longer necessary to free up some memory.

Let me know if you come up with new or creative ways to use it 😃

## Advantages and Benefits

- The text namespace of a [store module](https://vuex.vuejs.org/guide/modules.html) becomes an implementation detail (transparent to the user).
- Typos in action names fail fast (the method does not exist, instead of being ignored).
- Dispatching actions is as simple as calling a method, which matches the store
  definition of an action, and feels very natural.
- State or getters are properties in the store object and can be easily retrieved.
- Mapping state, getters, and actions is easier than ever.
- Dispatching an action from methods in a component doesn't require injecting
  the helper with `mapActions`.

The result feels very natural, prevents all kind of mistakes, and works nicely
when used in conjunction with ES6 modules.

Because imports are strict, we get clear errors if we have a typo in the store
name, so refactoring becomes a lot easier, usually as simple as _search and replace_.
