import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

export default api
```

Then in Vercel environment variables make sure it's set to:
```
VITE_API_URL = https://unimarket-055x.onrender.com/api