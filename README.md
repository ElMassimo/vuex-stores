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

Read more about the benefits in the [blog announcement](http://maximomussini.com/posts/vuex-stores).

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

// instead of

this.$store.state.window.windowWidth // ❌
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

// instead of

this.$store.getters['window/windowSize'] // ❌
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
WindowStore.updateWindowSize({ width: 1024, height: 768 })

// instead of
this.$store.dispatch('window/updateWindowSize', { width: 1024, height: 768 }) // ❌
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
a better option:

```js
methods: {
  onToggleFullscreen (event) {
    WindowStore.setFullscreen(!WindowStore.isFullscreen)
  },
},
```

An additional benefit is that references to the state and actions are more
explicit, and don't require [manual boilerplate](https://vuex.vuejs.org/guide/mutations.html#using-constants-for-mutation-types), making the code easier to understand and refactor 😀

### [`watch`](https://vuex.vuejs.org/api/#watch) 👁

Makes it convenient to watch a store value outside the component lifecycle:

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

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production'
})
```

And creating [one file](https://github.com/ElMassimo/vuex-stores/blob/master/tests/stores/ModalsStore.js) per store module, [exporting the store object](https://github.com/ElMassimo/vuex-stores/blob/master/tests/stores/WindowStore.js#L45).

```js
// @stores/ModalStore.js

import VuexStore from '@app/store'
import { registerAndGetStore } from 'vuex-stores'

const namespace = 'modals'
const state = () => ({ ... })
const getters = { ... }
const mutations = { ... }
const actions = { ... }

export default registerAndGetStore(VuexStore, { namespace, state, getters, mutations, actions })
```

This makes it very convenient to import the [store object](https://github.com/ElMassimo/vuex-stores/blob/master/tests/stores/ModalsStore.js) from a component:

```vue
// @components/ModalManager.vue

<script>
import ModalsStore from '@stores/ModalsStore'

export default {
  name: 'ModalManager',
  computed: ModalsStore.mapState('modals'),
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
      :key="modal.id"
      v-bind="modal.attrs"
      v-on="modal.listeners"
      @modal:close.native="onModalClose(modal, $event)"
    />
  </span>
</template>
```

Feel free to check the [tests](https://github.com/ElMassimo/vuex-stores/blob/master/tests/components/WindowDisplay.vue)
for additional usage examples, and setup options.

### Dynamic Stores (Factory) 💠

What happens if we need more than one instance of a store? Instead of exporting
a single store object, we can export a function that dynamically registers a new
store object on each invocation. For example:

```js
// @stores/FormStoreFactory
let formId = 0

export default (id = `form-${formId++}`) =>
  registerAndGetStore(store, { namespace: id, state, getters, mutations, actions })
```

And then import the factory:

```js
import FormStoreFactory from '@stores/FormStoreFactory'

// A new module is registered with a dynamic namespace.
const FormStore = FormStoreFactory()
```

These dynamic store objects can be passed to child components using `provide` and
`inject`, or directly as props, and provide all the advantages from Vuex, such
as a well defined data-schema for the state, and having the history of changes
available in the Vue devtools, making it very convenient for complex hierarchies.

You can call `registerModule` and `unregisterModule` on the store object to
manage the lifecycle, unregistering them once they are no longer necessary to
free up some memory.

### Farewell

The patterns described above are just a few of many possibilities.

Nothing prevents you from using a more complex strategy, like [creating a store
of stores](https://imgflip.com/i/412qhj), which has a `Map` of store objects,
and uses actions to register and unregister new store objects ♻️

Let me know if you come up with new or creative ways to use it 😃
