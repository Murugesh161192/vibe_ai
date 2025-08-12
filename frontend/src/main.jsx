import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/store'
import App from './App.jsx'
import './index.css'
import cacheManager from './utils/cacheManager'

// Start periodic cache cleanup
cacheManager.startPeriodicCleanup(store);

// Optional: Clean up when the app unmounts (e.g., window closes)
window.addEventListener('beforeunload', () => {
  cacheManager.stopPeriodicCleanup();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
) 