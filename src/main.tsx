import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import AppRealTime from './AppRealTime.tsx'
import { store } from './app/store.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRealTime />
    </Provider>
  </React.StrictMode>,
)
