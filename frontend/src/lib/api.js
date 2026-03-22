import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

// Separate instance for refresh calls (no interceptors — avoids infinite loops)
const authApi = axios.create({ baseURL: 'http://localhost:8000' })

// AuthContext registers this so React state stays in sync when a silent refresh happens
let onTokenRefreshed = null
export function setTokenRefreshCallback(cb) {
    onTokenRefreshed = cb
}

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
                onTokenRefreshed?.(data.access)
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
export const fetchCoaches = () => api.get('/api/users/coaches/')
export const bookCoachingSession   = (data)               => api.post('/api/coaching/sessions/', data)
export const fetchMemberSessions   = (memberId)            => api.get(`/api/coaching/sessions/?member_id=${memberId}`)
export const cancelCoachingSession = (sessionId, memberId) => api.delete(`/api/coaching/sessions/${sessionId}/?member_id=${memberId}`)

// Workouts
export const fetchWorkoutPlans      = ()                              => api.get('/api/workouts/').then(r => r.data)
export const createWorkoutPlan      = (data)                          => api.post('/api/workouts/', data).then(r => r.data)
export const updateWorkoutPlan      = (planId, data)                  => api.patch(`/api/workouts/${planId}/`, data).then(r => r.data)
export const deleteWorkoutPlan      = (planId)                        => api.delete(`/api/workouts/${planId}/`)
export const addWorkoutDay          = (planId, data)                  => api.post(`/api/workouts/${planId}/days/`, data).then(r => r.data)
export const updateWorkoutDay       = (planId, dayId, data)           => api.patch(`/api/workouts/${planId}/days/${dayId}/`, data).then(r => r.data)
export const deleteWorkoutDay       = (planId, dayId)                 => api.delete(`/api/workouts/${planId}/days/${dayId}/`)
export const addWorkoutExercise     = (planId, dayId, data)           => api.post(`/api/workouts/${planId}/days/${dayId}/exercises/`, data).then(r => r.data)
export const updateWorkoutExercise  = (planId, dayId, exId, data)     => api.patch(`/api/workouts/${planId}/days/${dayId}/exercises/${exId}/`, data).then(r => r.data)
export const deleteWorkoutExercise  = (planId, dayId, exId)           => api.delete(`/api/workouts/${planId}/days/${dayId}/exercises/${exId}/`)
export const logWorkout             = (planId, dayId, data)           => api.post(`/api/workouts/${planId}/days/${dayId}/logs/`, data).then(r => r.data)
export const fetchWorkoutLogs       = ()                              => api.get('/api/workouts/logs/').then(r => r.data)
