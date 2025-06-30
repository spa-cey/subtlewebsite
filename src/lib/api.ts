import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Types for API responses
interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  subscriptionTier: 'free' | 'pro' | 'enterprise' | 'admin'
  emailVerified: boolean
  lastSignInAt: string | null
  createdAt: string
  updatedAt: string
}

interface AuthResponse {
  user: User
  tokens: AuthTokens
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private client: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any
        
        console.log('[API] Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          hasToken: !!this.getAccessToken(),
          isRetry: originalRequest._retry
        })

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          console.log('[API] Attempting token refresh...')

          try {
            const newToken = await this.refreshToken()
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            console.log('[API] Token refresh failed:', refreshError)
            // Refresh failed, redirect to login
            this.handleAuthError()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('subtle_access_token')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('subtle_refresh_token')
  }

  private setTokens(tokens: AuthTokens): void {
    console.log('[API] Setting tokens:', {
      hasAccessToken: !!tokens?.accessToken,
      hasRefreshToken: !!tokens?.refreshToken,
      expiresIn: tokens?.expiresIn
    })
    
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      console.error('[API] Invalid tokens received:', tokens)
      return
    }
    
    localStorage.setItem('subtle_access_token', tokens.accessToken)
    localStorage.setItem('subtle_refresh_token', tokens.refreshToken)
    
    // Set expiration time
    const expiresAt = Date.now() + (tokens.expiresIn * 1000)
    localStorage.setItem('subtle_token_expires_at', expiresAt.toString())
    
    console.log('[API] Tokens stored in localStorage:', {
      accessToken: localStorage.getItem('subtle_access_token')?.substring(0, 20) + '...',
      refreshToken: localStorage.getItem('subtle_refresh_token')?.substring(0, 20) + '...',
      expiresAt: localStorage.getItem('subtle_token_expires_at')
    })
  }

  private clearTokens(): void {
    console.log('[API] Clearing tokens - Stack trace:', new Error().stack)
    localStorage.removeItem('subtle_access_token')
    localStorage.removeItem('subtle_refresh_token')
    localStorage.removeItem('subtle_token_expires_at')
    sessionStorage.clear()
  }

  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    this.refreshPromise = (async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken }
        )

        const { tokens } = response.data
        this.setTokens(tokens)
        return tokens.accessToken
      } catch (error) {
        this.clearTokens()
        throw error
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private handleAuthError(): void {
    this.clearTokens()
    
    // Only redirect if not already on auth pages
    const currentPath = window.location.pathname
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      window.location.href = '/login?reason=session_expired'
    }
  }

  // Check if token is expired or about to expire
  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('subtle_token_expires_at')
    if (!expiresAt) return true
    
    const expiration = parseInt(expiresAt)
    const now = Date.now()
    
    // Consider token expired if it expires in the next 60 seconds
    return now >= (expiration - 60000)
  }

  // Public API methods

  // Authentication
  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      fullName,
    })
    
    const authData = response.data
    this.setTokens(authData.tokens)
    return authData
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    })
    
    const authData = response.data
    console.log('[API] Login response:', {
      hasUser: !!authData.user,
      hasTokens: !!authData.tokens,
      tokens: authData.tokens ? {
        hasAccessToken: !!authData.tokens.accessToken,
        hasRefreshToken: !!authData.tokens.refreshToken,
        expiresIn: authData.tokens.expiresIn
      } : null
    })
    
    this.setTokens(authData.tokens)
    
    // Set session flags for compatibility
    sessionStorage.setItem('subtle_session_active', 'true')
    
    return authData
  }

  async logout(): Promise<void> {
    console.log('[API] logout() called - Stack trace:', new Error().stack)
    const refreshToken = this.getRefreshToken()
    
    try {
      if (refreshToken) {
        await this.client.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      this.clearTokens()
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/auth/me')
    return response.data.user
  }

  // User management
  async getUserProfile(): Promise<User> {
    const response = await this.client.get('/users/profile')
    return response.data
  }

  async updateUserProfile(updates: Partial<Pick<User, 'fullName' | 'avatarUrl'>>): Promise<User> {
    const response = await this.client.put('/users/profile', updates)
    return response.data.user
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  // Admin functions
  async getUsers(params?: {
    page?: number
    pageSize?: number
    search?: string
    subscriptionTier?: string
    emailVerified?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    dateFrom?: string
    dateTo?: string
  }): Promise<{
    users: User[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
    filters: any
  }> {
    const response = await this.client.get('/admin/users', { params })
    return response.data
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await this.client.put(`/admin/users/${userId}`, updates)
    return response.data.user
  }

  async bulkAction(userIds: string[], action: any): Promise<any> {
    const response = await this.client.post('/admin/users/bulk-action', {
      userIds,
      action,
    })
    return response.data
  }

  async getUserActivity(userId: string, params?: { page?: number; pageSize?: number; actionType?: string }): Promise<any> {
    const response = await this.client.get(`/admin/users/${userId}/activity`, { params })
    return response.data
  }

  async getUserSessions(userId: string): Promise<any> {
    const response = await this.client.get(`/admin/users/${userId}/sessions`)
    return response.data
  }

  async getAdminNotes(userId: string): Promise<any> {
    const response = await this.client.get(`/admin/users/${userId}/notes`)
    return response.data
  }

  async addAdminNote(userId: string, note: string, isFlagged: boolean): Promise<any> {
    const response = await this.client.post(`/admin/users/${userId}/notes`, {
      note,
      isFlagged,
    })
    return response.data
  }

  async getUserBilling(userId: string): Promise<any> {
    const response = await this.client.get(`/admin/users/${userId}/billing`)
    return response.data
  }

  async getUserStats(): Promise<any> {
    const response = await this.client.get('/admin/stats')
    return response.data
  }

  async getAdminStats(): Promise<any> {
    const response = await this.client.get('/admin/stats')
    return response.data
  }

  async getAdminActivity(): Promise<any> {
    const response = await this.client.get('/admin/activity')
    return response.data
  }

  async getUserDetails(userId: string): Promise<any> {
    const response = await this.client.get(`/admin/users/${userId}`)
    return response.data
  }

  async getUserUsageAnalytics(userId: string, timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<any> {
    const response = await this.client.get(`/analytics/users/${userId}`, {
      params: { timeRange }
    })
    return response.data
  }

  // Admin: Azure Config methods
  async getAzureConfigs(): Promise<{
    configs: Array<{
      id: string
      name: string
      endpoint: string
      apiVersion: string
      deploymentName: string
      isActive: boolean
      isPrimary: boolean
      rateLimitRpm: number
      rateLimitTpd: number
      healthStatus: string
      lastHealthCheck: string | null
      hasApiKey: boolean
      createdAt: string
      updatedAt: string
    }>
  }> {
    const response = await this.client.get('/admin/configs')
    return response.data
  }

  async getAzureConfig(id: string): Promise<{
    config: {
      id: string
      name: string
      endpoint: string
      apiVersion: string
      deploymentName: string
      isActive: boolean
      isPrimary: boolean
      rateLimitRpm: number
      rateLimitTpd: number
      healthStatus: string
      lastHealthCheck: string | null
      hasApiKey: boolean
      createdAt: string
      updatedAt: string
    }
  }> {
    const response = await this.client.get(`/admin/configs/${id}`)
    return response.data
  }

  async createAzureConfig(data: {
    name: string
    endpoint: string
    apiKey: string
    apiVersion: string
    deploymentName: string
    isActive?: boolean
    isPrimary?: boolean
    rateLimitRpm?: number
    rateLimitTpd?: number
  }): Promise<{ config: any }> {
    const response = await this.client.post('/admin/configs', data)
    return response.data
  }

  async updateAzureConfig(id: string, data: {
    name?: string
    endpoint?: string
    apiKey?: string
    apiVersion?: string
    deploymentName?: string
    isActive?: boolean
    isPrimary?: boolean
    rateLimitRpm?: number
    rateLimitTpd?: number
  }): Promise<{ config: any }> {
    const response = await this.client.patch(`/admin/configs/${id}`, data)
    return response.data
  }

  async deleteAzureConfig(id: string): Promise<{ message: string; deletedConfig: { id: string; name: string } }> {
    const response = await this.client.delete(`/admin/configs/${id}`)
    return response.data
  }

  async testAzureConfig(id: string): Promise<{
    success: boolean
    healthStatus: string
    responseTime: number
    timestamp: string
  }> {
    const response = await this.client.post(`/admin/configs/${id}/test`)
    return response.data
  }

  // Session management
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const isExpired = this.isTokenExpired()
    
    console.log('[API] isAuthenticated check:', {
      hasToken: !!token,
      isExpired,
      token: token ? token.substring(0, 20) + '...' : null,
      expiresAt: localStorage.getItem('subtle_token_expires_at')
    })
    
    return !!token && !isExpired
  }

  // Compatibility method for session refresh
  async refreshSession(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.refreshToken()
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types for use in components
export type { User, AuthTokens, AuthResponse, ApiResponse }