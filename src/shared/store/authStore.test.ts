import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import { UserRole } from '../types'

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    success: vi.fn(),
    activity: vi.fn(),
    auth: vi.fn(),
    course: vi.fn(),
    streaming: vi.fn(),
    network: vi.fn(),
  }
}))

// Mock ApiClient
vi.mock('../../infrastructure/api/ApiClient', () => ({
  ApiClient: {
    post: vi.fn(),
    get: vi.fn(),
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
  }
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAuthStore.getState().reset?.()
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const state = useAuthStore.getState()
    
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should have required methods', () => {
    const state = useAuthStore.getState()
    
    expect(typeof state.login).toBe('function')
    expect(typeof state.logout).toBe('function')
    expect(typeof state.checkAuth).toBe('function')
    expect(typeof state.updateUser).toBe('function')
  })

  it('should handle user data correctly', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      role: UserRole.STUDENT,
      avatar: null,
      active: true,
      passwordChanged: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const mockToken = 'test-token'
    
    // Simulate setting user and token
    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false
    })
    
    const state = useAuthStore.getState()
    
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should handle logout correctly', async () => {
    // Set initial state
    useAuthStore.setState({
      user: { id: 1, name: 'Test', email: 'test@test.com' } as any,
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false
    })
    
    // Call logout (async)
    await useAuthStore.getState().logout()
    
    const state = useAuthStore.getState()
    
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})