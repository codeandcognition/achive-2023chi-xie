import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from 'react-redux'
import { store, persistor } from './app/store'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import reportWebVitals from './reportWebVitals'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { fbConfig, rrfConfig } from './config'
import { PersistGate } from 'redux-persist/integration/react'

// initialize firebase with passed in config info
firebase.initializeApp(fbConfig)

// props for react-redux-firebase
const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch
}

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          <BrowserRouter>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </BrowserRouter>
        </ReactReduxFirebaseProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
