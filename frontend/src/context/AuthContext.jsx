import { createContext, useState, useCallback } from 'react'

export const AuthContext = createContext(null)

function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]))
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

    const user = tokens ? decodeToken(tokens.access) : null

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

    return (
        <AuthContext.Provider value={{ user, tokens, login, logout, updateAccessToken, isAuthenticated: !!tokens }}>
            {children}
        </AuthContext.Provider>
    )
}