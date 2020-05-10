import { createNamespacedHelpers } from 'vuex'

function isString (value) {
  return typeof value === 'string'
}

// Internal: For the actions, state, and getter methods.
// Allows passing Strings, an Array of Strings, or an Object as the argument.
const enhanced = map => (...args) => isString(args[0]) ? map(args) : map(args[0])

// Internal: Allow to watch store changes using a String with the name of a
// store property (state or getter), or a Function that returns the watched value.
function enhancedWatch (vuexStore) {
  return function (propOrFunction, callback, options) {
    const fn = isString(propOrFunction) ? () => this[propOrFunction] : propOrFunction
    return vuexStore.watch(fn, callback, options) // https://vuex.vuejs.org/api/#watch
  }
}

// Public: Returns a set of namespaced helpers, registering a module if
// necessary.
export function getNamespacedHelpers (moduleNamespace) {
  const { mapState, mapGetters, mapActions } = createNamespacedHelpers(moduleNamespace)
  return {
    // Picks a set of properties from the store state.
    //
    // Used in Vue components as computed properties:
    //   computed: {
    //     ...WindowStore.mapState('isFullscreen', 'windowHeight', 'windowWidth'),
    //   },
    mapState: enhanced(mapState),

    // Picks a set of getters from the store.
    //
    // Used in Vue components as methods or computed properties:
    //   computed: {
    //     ...WindowStore.mapGetters('windowSize'),
    //   },
    mapGetters: enhanced(mapGetters),

    // Picks a set of actions from the store.
    //
    // Used in Vue components as methods:
    //   methods: {
    //     ...WindowStore.mapActions('setFullscreen', 'updateWindowSize'),
    //   },
    mapActions: enhanced(mapActions)
  }
}

// Public: Registers the module in the Vuex store, and returns a set of helpers.
export function registerAndGetStore (vuexStore, moduleNamespace, moduleConfig) {
  vuexStore.registerModule(moduleNamespace, { namespaced: true, ...moduleConfig })
  return getStoreHandler(vuexStore, moduleNamespace, moduleConfig)
}

// Internal: Returns an object that can delegate properties and methods to Vuex,
// allowing to directly access actions, getters, and state as properties.
//
// NOTE: If names overlap, actions have priority, then getters, then state.
function getStoreHandler (vuexStore, moduleNamespace, moduleConfig) {
  // mapState, mapGetters, and mapActions are available in the store object.
  const storeObject = getNamespacedHelpers(moduleNamespace)

  // Add a property each state key allowing to get the current value.
  const stateObject = typeof moduleConfig.state === 'function' ? moduleConfig.state() : moduleConfig.state
  Object.keys(stateObject).forEach(stateName => {
    Object.defineProperty(storeObject, stateName, {
      enumerable: true,
      get () {
        return vuexStore.state[moduleNamespace][stateName]
      }
    })
  })

  // Allow to access every getter in the store.
  Object.keys(moduleConfig.getters).forEach(getterName => {
    const namespacedGetterName = `${moduleNamespace}/${getterName}`
    Object.defineProperty(storeObject, getterName, {
      enumerable: true,
      get () {
        return vuexStore.getters[namespacedGetterName]
      }
    })
  })

  // Add a method for each action which expects the payload as parameters.
  Object.keys(moduleConfig.actions).forEach(actionName => {
    const namespacedActionName = `${moduleNamespace}/${actionName}`
    storeObject[actionName] = (...args) => vuexStore.dispatch(namespacedActionName, ...args)
  })

  // Allow to watch store changes using a String syntax or a Function.
  storeObject.watch = enhancedWatch(vuexStore)

  return storeObject
}
