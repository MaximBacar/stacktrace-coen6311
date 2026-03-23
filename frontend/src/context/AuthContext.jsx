import { createContext, useState, useCallback, useEffect } from 'react'
import { setTokenRefreshCallback } from '@/lib/api'

export const AuthContext = createContext(null)

function decodeUser(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return { id: Number(payload.user_id), role: payload.role }
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [tokens, setTokens] = useState(() => {
        const access  = localStorage.getItem('access_token')
        const refresh = localStorage.getItem('refresh_token')
        return access && refresh ? { access, refresh } : null
    })

    const user = tokens ? decodeUser(tokens.access) : null

    const login = useCallback((newTokens) => {
        localStorage.setItem('access_token',  newTokens.access)
        localStorage.setItem('refresh_token', newTokens.refresh)
        setTokens(newTokens)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setTokens(null)
    }, [])

    const updateAccessToken = useCallback((accessToken) => {
        localStorage.setItem('access_token', accessToken)
        setTokens((prev) => ({ ...prev, access: accessToken }))
    }, [])

    // Keep React state in sync when api.js silently refreshes the token
    useEffect(() => {
        setTokenRefreshCallback(updateAccessToken)
        return () => setTokenRefreshCallback(null)
    }, [updateAccessToken])

    return (
        <AuthContext.Provider value={{ user, tokens, login, logout, isAuthenticated: !!tokens }}>
            {children}
        </AuthContext.Provider>
    )
}