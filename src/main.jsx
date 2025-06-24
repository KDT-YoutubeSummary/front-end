import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// [추가] 이 두 줄이 문제를 해결할 것입니다.
import axios from 'axios';
axios.defaults.baseURL = '/';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
