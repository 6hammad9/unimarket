import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  // baseURL: 'https://unimarket-055x.onrender.com/api'
})

export default api
