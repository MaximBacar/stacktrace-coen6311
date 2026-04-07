import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Separate instance for refresh calls (no interceptors — avoids infinite loops)
const authApi = axios.create({ baseURL: BASE_URL })

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

// Availability
export const fetchAvailability  = ()           => api.get('/api/coaching/availability/').then(r => r.data.availability)
export const saveAvailability   = (slots)      => api.put('/api/coaching/availability/', { availability: slots }).then(r => r.data)
export const fetchCoachSessions = () => api.get('/api/coaching/schedule/').then(r => r.data)

// Assistant
export const fetchConversations      = ()                        => api.get('/api/faq/conversations/').then(r => r.data)
export const createConversation      = (message)                 => api.post('/api/faq/conversations/', { message }).then(r => r.data)
export const fetchConversationDetail = (conversationId)          => api.get(`/api/faq/conversations/${conversationId}/`).then(r => r.data)
export const sendAssistantMessage    = (conversationId, message) => api.post(`/api/faq/conversations/${conversationId}/`, { message }).then(r => r.data)
export const deleteConversation      = (conversationId)          => api.delete(`/api/faq/conversations/${conversationId}/`)

// Gym & Policies
export const fetchGyms                  = ()                       => api.get('/api/gyms/').then(r => r.data)
export const fetchGymCapacity           = (gymId)                  => api.get(`/api/gyms/${gymId}/capacity/`).then(r => r.data)
export const updateGymCapacity          = (gymId, data)            => api.patch(`/api/gyms/${gymId}/capacity/`, data).then(r => r.data)
export const fetchGymEquipment          = (gymId, params = {})     => api.get(`/api/gyms/${gymId}/equipment/`, { params }).then(r => r.data)
export const reportEquipmentIssue       = (equipmentId, data)      => api.post(`/api/gyms/equipment/${equipmentId}/issues/`, data).then(r => r.data)
export const fetchPolicyCategories      = (gymId)                  => api.get(`/api/gyms/${gymId}/policy-categories/`).then(r => r.data)
export const createPolicyCategory       = (gymId, data)            => api.post(`/api/gyms/${gymId}/policy-categories/`, data).then(r => r.data)
export const updatePolicyCategory       = (gymId, catId, data)     => api.patch(`/api/gyms/${gymId}/policy-categories/${catId}/`, data).then(r => r.data)
export const deletePolicyCategory       = (gymId, catId)           => api.delete(`/api/gyms/${gymId}/policy-categories/${catId}/`)
export const fetchPolicies              = (gymId)                  => api.get(`/api/gyms/${gymId}/policies/`).then(r => r.data)
export const createPolicy               = (gymId, data)            => api.post(`/api/gyms/${gymId}/policies/`, data).then(r => r.data)
export const updatePolicy               = (gymId, policyId, data)  => api.patch(`/api/gyms/${gymId}/policies/${policyId}/`, data).then(r => r.data)
export const deletePolicy               = (gymId, policyId)        => api.delete(`/api/gyms/${gymId}/policies/${policyId}/`)
export const fetchCancellationPolicies  = (gymId)                  => api.get(`/api/gyms/${gymId}/cancellation-policies/`).then(r => r.data)
export const createCancellationPolicy   = (gymId, data)            => api.post(`/api/gyms/${gymId}/cancellation-policies/`, data).then(r => r.data)
export const updateCancellationPolicy   = (gymId, policyId, data)  => api.patch(`/api/gyms/${gymId}/cancellation-policies/${policyId}/`, data).then(r => r.data)
export const deleteCancellationPolicy   = (gymId, policyId)        => api.delete(`/api/gyms/${gymId}/cancellation-policies/${policyId}/`)

// Admin management
export const fetchAdminUsers = ()             => api.get('/api/admin/users/').then(r => r.data)
export const updateAdminUser = (userId, data) => api.patch(`/api/admin/users/${userId}/`, data).then(r => r.data)
export const updateUserRole  = (pk, data)     => api.patch(`/api/admin/users/${pk}/role/`, data).then(r => r.data)
export const approveCoach    = (pk, data)     => api.patch(`/api/admin/coaches/${pk}/approve/`, data).then(r => r.data)

// Coaching — coach-side
export const fetchAssignedClients = () => api.get('/api/coaching/clients/').then(r => r.data)

// Nutrition — active plan (Today tab)
export const fetchNutritionPlan = ()          => api.get('/api/nutrition/plan/').then(r => r.data)

// Nutrition — plans CRUD
export const fetchNutritionPlans    = ()                          => api.get('/api/nutrition/plans/').then(r => r.data)
export const createNutritionPlan    = (data)                      => api.post('/api/nutrition/plans/', data).then(r => r.data)
export const updateNutritionPlan    = (planId, data)              => api.patch(`/api/nutrition/plans/${planId}/`, data).then(r => r.data)
export const deleteNutritionPlan    = (planId)                    => api.delete(`/api/nutrition/plans/${planId}/`)
export const activateNutritionPlan  = (planId)                    => api.post(`/api/nutrition/plans/${planId}/activate/`).then(r => r.data)

// Nutrition — days
export const addNutritionDay        = (planId, data)              => api.post(`/api/nutrition/plans/${planId}/days/`, data).then(r => r.data)
export const updateNutritionDay     = (planId, dayId, data)       => api.patch(`/api/nutrition/plans/${planId}/days/${dayId}/`, data).then(r => r.data)
export const deleteNutritionDay     = (planId, dayId)             => api.delete(`/api/nutrition/plans/${planId}/days/${dayId}/`)

// Nutrition — meals
export const addNutritionMeal       = (planId, dayId, data)       => api.post(`/api/nutrition/plans/${planId}/days/${dayId}/meals/`, data).then(r => r.data)
export const updateNutritionMeal    = (planId, dayId, mealId, data) => api.patch(`/api/nutrition/plans/${planId}/days/${dayId}/meals/${mealId}/`, data).then(r => r.data)
export const deleteNutritionMeal    = (planId, dayId, mealId)     => api.delete(`/api/nutrition/plans/${planId}/days/${dayId}/meals/${mealId}/`)

// Nutrition — meal log
export const fetchMealLogs      = ()          => api.get('/api/nutrition/logs/').then(r => r.data)
export const createMealLog      = (data)      => api.post('/api/nutrition/logs/', data).then(r => r.data)
export const deleteMealLog      = (logId)     => api.delete(`/api/nutrition/logs/${logId}/`)

// Analytics
export const fetchPeakHours = (date, membershipType) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (membershipType) params.set('membership_type', membershipType)
    return api.get(`/analytics/peak-hours/?${params}`).then(r => r.data)
}

// Chat
export const fetchChats        = ()                => api.get('/api/chat/').then(r => r.data)
export const getOrCreateChat   = (userId)          => api.post('/api/chat/', { user_id: userId }).then(r => r.data)
export const fetchMessages     = (chatId, since)   => api.get(`/api/chat/${chatId}/messages/${since ? `?since=${since}` : ''}`).then(r => r.data)
export const sendMessage       = (chatId, content) => api.post(`/api/chat/${chatId}/messages/`, { content }).then(r => r.data)
