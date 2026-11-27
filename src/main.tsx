import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './Admin'
import App from './App'
import { ContentProvider } from './content'
import './styles.css'

const route = window.location.pathname.replace(/\/+$/, '') || '/'
const isAdmin = route === '/admin' || route === '/login'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContentProvider>{isAdmin ? <AdminApp /> : <App />}</ContentProvider>
  </React.StrictMode>,
)
