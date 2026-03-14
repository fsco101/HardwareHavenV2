import { registerRootComponent } from 'expo';

import App from './App';

if (typeof global.setImmediate !== 'function') {
	global.setImmediate = (callback, ...args) => setTimeout(() => callback(...args), 0);
}

if (typeof global.clearImmediate !== 'function') {
	global.clearImmediate = (id) => clearTimeout(id);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
