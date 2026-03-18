import { createContext, useContext, useState } from 'react'


const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )
const updateUser = (updatedUser) => {
  setUser(updatedUser)
  localStorage.setItem('user', JSON.stringify(updatedUser))
}
  // FIXED: token comes first, user second
  const login = (tokenData, userData) => {
    setUser(userData)
    setToken(tokenData)

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)