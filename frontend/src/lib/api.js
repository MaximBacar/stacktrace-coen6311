import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

// Separate instance for refresh calls (no interceptors — avoids infinite loops)
const authApi = axios.create({ baseURL: 'http://localhost:8000' })

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// On 401 → try to refresh, then retry the original request once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            try {
                const refresh = localStorage.getItem('refresh_token')
                const { data } = await authApi.post('/api/users/token/refresh/', { refresh })
                localStorage.setItem('access_token', data.access)
                original.headers.Authorization = `Bearer ${data.access}`
                return api(original)
            } catch {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api

export const registerUser = (data) => authApi.post('/api/users/register/', data)
export const loginUser    = (data) => authApi.post('/api/users/login/', data)
export const fetchCoaches = () => authApi.get('/api/users/coaches/')
