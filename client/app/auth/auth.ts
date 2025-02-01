"use client"

import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// Simulated API calls
const mockApi = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate API response
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'John Doe',
        email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    }
  },
  register: async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    }
  }
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    try {
      const response = await mockApi.login(email, password)
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true
      })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      throw new Error('Login failed')
    }
  },
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await mockApi.register(name, email, password)
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true
      })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      throw new Error('Registration failed')
    }
  },
  logout: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false
    })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}))