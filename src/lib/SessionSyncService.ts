import { Session, User } from '@supabase/supabase-js'
import { supabase, getAppUrl } from '@/lib/supabase'

interface BridgeTokenResponse {
  access_token: string
  refresh_token: string
  user_id: string
  expires_at: number
}

interface SessionState {
  sessionId: string
  userId: string
  lastSync: number
  source: 'web' | 'mac_app_bridge'
  settings: Record<string, any>
}

interface RealtimePayload {
  event_type: 'auth_state_change' | 'settings_change' | 'force_logout'
  data: any
  timestamp: number
  source: 'mac_app' | 'web'
}

export class SessionSyncService {
  private static instance: SessionSyncService | null = null
  private bridgeTokenExchangeInProgress = false
  private realtimeChannel: any = null
  private sessionStateCallbacks: Array<(state: SessionState | null) => void> = []
  
  private constructor() {}
  
  static getInstance(): SessionSyncService {
    if (!SessionSyncService.instance) {
      SessionSyncService.instance = new SessionSyncService()
    }
    return SessionSyncService.instance
  }
  
  /**
   * Exchange bridge token for valid session
   */
  async exchangeBridgeToken(bridgeToken: string): Promise<Session> {
    if (this.bridgeTokenExchangeInProgress) {
      throw new Error('Bridge token exchange already in progress')
    }
    
    this.bridgeTokenExchangeInProgress = true
    
    try {
      console.log('[SessionSyncService] Starting bridge token exchange')
      
      // Validate bridge token format
      if (!this.isValidBridgeTokenFormat(bridgeToken)) {
        throw new Error('Invalid bridge token format')
      }
      
      // Get client IP for security logging
      const clientIP = await this.getClientIP()
      
      // Call Supabase function to exchange bridge token
      const { data, error } = await supabase.rpc('exchange_bridge_token', {
        bridge_token_param: bridgeToken,
        client_ip: clientIP,
        user_agent_param: navigator.userAgent
      })
      
      if (error) {
        console.error('[SessionSyncService] Bridge token exchange error:', error)
        throw new Error(`Bridge token exchange failed: ${error.message}`)
      }
      
      if (!data) {
        throw new Error('No session data returned from bridge token exchange')
      }
      
      const tokenData = data as BridgeTokenResponse
      console.log('[SessionSyncService] Bridge token exchange successful, setting session')
      
      // Set session in Supabase client
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      })
      
      if (sessionError) {
        throw new Error(`Failed to set session: ${sessionError.message}`)
      }
      
      if (!sessionData.session) {
        throw new Error('No session returned after setting tokens')
      }
      
      // Mark session as active for Mac app integration
      sessionStorage.setItem('subtle_session_active', 'true')
      sessionStorage.setItem('subtle_session_source', 'mac_app_bridge')
      sessionStorage.setItem('subtle_bridge_token_used', bridgeToken)
      
      // Save session state
      const sessionState: SessionState = {
        sessionId: sessionData.session.access_token.substring(0, 32),
        userId: sessionData.session.user.id,
        lastSync: Date.now(),
        source: 'mac_app_bridge',
        settings: {}
      }
      SessionStateManager.saveState(sessionState)
      
      console.log('[SessionSyncService] Session established successfully')
      return sessionData.session
      
    } catch (error) {
      console.error('[SessionSyncService] Bridge token exchange failed:', error)
      throw error
    } finally {
      this.bridgeTokenExchangeInProgress = false
    }
  }
  
  /**
   * Initialize real-time session synchronization
   */
  async initializeRealtimeSync(userId: string): Promise<void> {
    try {
      console.log('[SessionSyncService] Initializing realtime sync for user:', userId)
      
      // Clean up existing channel
      if (this.realtimeChannel) {
        await this.cleanup()
      }
      
      // Create new channel for this user
      this.realtimeChannel = supabase
        .channel(`mac-sync-${userId}`)
        .on('broadcast', { event: 'auth_state_change' }, (payload) => {
          this.handleRealtimeAuthChange(payload.payload as RealtimePayload)
        })
        .on('broadcast', { event: 'settings_change' }, (payload) => {
          this.handleRealtimeSettingsChange(payload.payload as RealtimePayload)
        })
        .on('broadcast', { event: 'force_logout' }, (payload) => {
          this.handleForceLogout(payload.payload as RealtimePayload)
        })
        .on('broadcast', { event: 'session_sync' }, (payload) => {
          this.handleSessionSync(payload.payload as RealtimePayload)
        })
        .subscribe((status) => {
          console.log('[SessionSyncService] Realtime channel status:', status)
        })
      
      console.log('[SessionSyncService] Realtime sync initialized')
      
      // Send initial presence to Mac app
      await this.broadcastPresence(userId, 'web_dashboard_connected')
      
    } catch (error) {
      console.error('[SessionSyncService] Failed to initialize realtime sync:', error)
      throw error
    }
  }
  
  /**
   * Handle realtime auth state changes from Mac app
   */
  private handleRealtimeAuthChange(payload: RealtimePayload): void {
    console.log('[SessionSyncService] Received auth state change:', payload)
    
    // Skip if the change originated from web
    if (payload.source === 'web') {
      return
    }
    
    switch (payload.event_type) {
      case 'auth_state_change':
        if (payload.data.action === 'logout') {
          this.handleMacAppLogout()
        }
        break
    }
  }
  
  /**
   * Handle realtime settings changes from Mac app
   */
  private handleRealtimeSettingsChange(payload: RealtimePayload): void {
    console.log('[SessionSyncService] Received settings change:', payload)
    
    if (payload.source === 'web') {
      return
    }
    
    // Update local settings cache
    const currentState = SessionStateManager.loadState()
    if (currentState) {
      currentState.settings = { ...currentState.settings, ...payload.data }
      currentState.lastSync = Date.now()
      SessionStateManager.saveState(currentState)
      
      // Notify subscribers
      this.notifySessionStateChanged(currentState)
    }
  }
  
  /**
   * Handle force logout from Mac app
   */
  private handleForceLogout(payload: RealtimePayload): void {
    console.log('[SessionSyncService] Received force logout:', payload)
    
    if (payload.source === 'web') {
      return
    }
    
    // Perform immediate logout
    this.performForceLogout('Mac app initiated logout')
  }
  
  /**
   * Handle session sync events
   */
  private handleSessionSync(payload: RealtimePayload): void {
    console.log('[SessionSyncService] Received session sync:', payload)
    
    if (payload.source === 'web') {
      return
    }
    
    // Update session state with Mac app data
    const currentState = SessionStateManager.loadState()
    if (currentState && payload.data) {
      const updatedState: SessionState = {
        ...currentState,
        ...payload.data,
        lastSync: Date.now()
      }
      SessionStateManager.saveState(updatedState)
      this.notifySessionStateChanged(updatedState)
    }
  }
  
  /**
   * Broadcast presence to Mac app
   */
  async broadcastPresence(userId: string, event: string): Promise<void> {
    if (!this.realtimeChannel) {
      return
    }
    
    try {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'web_presence',
        payload: {
          event_type: 'presence',
          data: { event, userId },
          timestamp: Date.now(),
          source: 'web'
        }
      })
    } catch (error) {
      console.error('[SessionSyncService] Failed to broadcast presence:', error)
    }
  }
  
  /**
   * Broadcast settings change to Mac app
   */
  async broadcastSettingsChange(settings: Record<string, any>): Promise<void> {
    if (!this.realtimeChannel) {
      return
    }
    
    try {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'settings_change',
        payload: {
          event_type: 'settings_change',
          data: settings,
          timestamp: Date.now(),
          source: 'web'
        }
      })
      
      // Update local state
      const currentState = SessionStateManager.loadState()
      if (currentState) {
        currentState.settings = { ...currentState.settings, ...settings }
        currentState.lastSync = Date.now()
        SessionStateManager.saveState(currentState)
      }
    } catch (error) {
      console.error('[SessionSyncService] Failed to broadcast settings change:', error)
    }
  }
  
  /**
   * Subscribe to session state changes
   */
  onSessionStateChange(callback: (state: SessionState | null) => void): () => void {
    this.sessionStateCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.sessionStateCallbacks.indexOf(callback)
      if (index > -1) {
        this.sessionStateCallbacks.splice(index, 1)
      }
    }
  }
  
  /**
   * Notify all subscribers of session state changes
   */
  private notifySessionStateChanged(state: SessionState | null): void {
    this.sessionStateCallbacks.forEach(callback => {
      try {
        callback(state)
      } catch (error) {
        console.error('[SessionSyncService] Error in session state callback:', error)
      }
    })
  }
  
  /**
   * Handle Mac app logout
   */
  private async handleMacAppLogout(): Promise<void> {
    console.log('[SessionSyncService] Handling Mac app logout')
    await this.performForceLogout('Mac app logout')
  }
  
  /**
   * Perform force logout
   */
  private async performForceLogout(reason: string): Promise<void> {
    console.log('[SessionSyncService] Performing force logout:', reason)
    
    try {
      // Clear session state
      SessionStateManager.clearState()
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Cleanup realtime connections
      await this.cleanup()
      
      // Redirect to login page
      window.location.href = '/login?reason=session_expired'
      
    } catch (error) {
      console.error('[SessionSyncService] Error during force logout:', error)
      // Force reload as fallback
      window.location.reload()
    }
  }
  
  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    console.log('[SessionSyncService] Cleaning up resources')
    
    if (this.realtimeChannel) {
      try {
        await this.realtimeChannel.unsubscribe()
      } catch (error) {
        console.error('[SessionSyncService] Error unsubscribing from channel:', error)
      }
      this.realtimeChannel = null
    }
    
    this.sessionStateCallbacks = []
  }
  
  /**
   * Check if bridge token format is valid
   */
  private isValidBridgeTokenFormat(token: string): boolean {
    return /^[a-zA-Z0-9]{32}$/.test(token)
  }
  
  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=text')
      return await response.text()
    } catch {
      return 'unknown'
    }
  }
  
  /**
   * Get current session state
   */
  getCurrentState(): SessionState | null {
    return SessionStateManager.loadState()
  }
  
  /**
   * Check if current session is from Mac app bridge
   */
  isFromMacAppBridge(): boolean {
    return sessionStorage.getItem('subtle_session_source') === 'mac_app_bridge'
  }
}

/**
 * Session State Manager for local storage
 */
class SessionStateManager {
  private static readonly STORAGE_KEY = 'subtle_session_state'
  
  static saveState(state: SessionState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('[SessionStateManager] Failed to save state:', error)
    }
  }
  
  static loadState(): SessionState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('[SessionStateManager] Failed to load state:', error)
      return null
    }
  }
  
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      sessionStorage.clear()
    } catch (error) {
      console.error('[SessionStateManager] Failed to clear state:', error)
    }
  }
}

/**
 * Utility functions for bridge token handling
 */
export function getBridgeTokenFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('bridge_token')
}

export function removeBridgeTokenFromURL(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('bridge_token')
  window.history.replaceState({}, document.title, url.toString())
}

/**
 * Check if feature flags support bridge token sync
 */
export function isBridgeTokenSyncEnabled(): boolean {
  // This would integrate with your feature flag service
  // For now, return true as it's enabled in Phase 1.3
  return true
}

/**
 * Export singleton instance
 */
export const sessionSyncService = SessionSyncService.getInstance()