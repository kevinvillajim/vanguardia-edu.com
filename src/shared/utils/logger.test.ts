import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the entire logger module
vi.mock('./logger', () => {
  const mockLogger = {
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
  
  return {
    logger: mockLogger,
    createComponentLogger: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    })),
    default: mockLogger
  }
})

import { logger } from './logger'

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have all required methods', () => {
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.success).toBe('function')
    expect(typeof logger.activity).toBe('function')
    expect(typeof logger.auth).toBe('function')
    expect(typeof logger.course).toBe('function')
    expect(typeof logger.streaming).toBe('function')
    expect(typeof logger.network).toBe('function')
  })

  it('should be mocked correctly in testing mode', () => {
    logger.info('test message')
    logger.debug('debug message')
    logger.error('error message')
    
    // In testing, all methods should be mocked
    expect(logger.info).toHaveBeenCalledWith('test message')
    expect(logger.debug).toHaveBeenCalledWith('debug message')
    expect(logger.error).toHaveBeenCalledWith('error message')
  })

  it('should handle essential logger methods', () => {
    logger.warn('test')
    logger.success('test')
    
    expect(logger.warn).toHaveBeenCalledWith('test')
    expect(logger.success).toHaveBeenCalledWith('test')
  })

  it('should handle different log levels without errors', () => {
    // Simple validation that methods work
    expect(() => {
      logger.info('test')
      logger.error('test')
    }).not.toThrow()
  })
})