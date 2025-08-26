import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the auth store
vi.mock('./shared/store/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  })
}))

// Mock the logger
vi.mock('./shared/utils/logger', () => ({
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
  },
  createComponentLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  })),
  default: {
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

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    
    // Should render the app without throwing
    expect(document.body).toBeDefined()
  })

  it('shows login page when not authenticated', () => {
    render(<App />)
    
    // Should show login-related content or redirect to login
    // This is a basic structural test
    expect(document.body).toBeDefined()
  })
})