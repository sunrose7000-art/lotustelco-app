// EMCD API Service - extracted from original LotusTelco app
// These are the exact endpoints the old app uses

import AsyncStorage from '@react-native-async-storage/async-storage'

// Base URL from VoIPswitch - replace with your actual server URL
const BASE_URL = 'https://voice.lotustelco.net'

interface EMCDResponse {
  result?: string
  error?: string
  [key: string]: any
}

class EMCDService {
  private username: string = ''
  private password: string = ''
  private sessionToken: string = ''

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/cs.ashx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `m=login&un=${encodeURIComponent(username)}&up=${encodeURIComponent(password)}`
      })
      const data = await response.json()

      if (data.result === 'ok' || data.token) {
        this.username = username
        this.password = password
        this.sessionToken = data.token || ''
        // Persist credentials
        await AsyncStorage.setItem('sip_username', username)
        await AsyncStorage.setItem('sip_password', password)
        await AsyncStorage.setItem('session_token', this.sessionToken)
        return true
      }
      return false
    } catch (e) {
      console.log('EMCD login error:', e)
      return false
    }
  }

  async restoreSession(): Promise<boolean> {
    try {
      const username = await AsyncStorage.getItem('sip_username')
      const password = await AsyncStorage.getItem('sip_password')
      const token = await AsyncStorage.getItem('session_token')
      if (username && password) {
        this.username = username
        this.password = password
        this.sessionToken = token || ''
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  async logout() {
    this.username = ''
    this.password = ''
    this.sessionToken = ''
    await AsyncStorage.multiRemove(['sip_username', 'sip_password', 'session_token'])
  }

  async getBalance(): Promise<{ balance: string; currency: string }> {
    try {
      const response = await fetch(`${BASE_URL}/balancing.ashx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `m=getBalance&un=${encodeURIComponent(this.username)}&up=${encodeURIComponent(this.password)}`
      })
      const data = await response.json()
      return {
        balance: data.balance || data.amount || '0.00',
        currency: data.currency || 'USD'
      }
    } catch (e) {
      console.log('getBalance error:', e)
      return { balance: '0.00', currency: 'USD' }
    }
  }

  async getCallHistory(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/cs.ashx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `m=getLastActive&un=${encodeURIComponent(this.username)}&up=${encodeURIComponent(this.password)}`
      })
      const data = await response.json()
      return data.calls || data.records || []
    } catch (e) {
      return []
    }
  }

  async getRates(number: string): Promise<{ rate: string; currency: string }> {
    try {
      const response = await fetch(`${BASE_URL}/rates.ashx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `m=getRatesForNumber&un=${encodeURIComponent(this.username)}&up=${encodeURIComponent(this.password)}&pn=${encodeURIComponent(number)}`
      })
      const data = await response.json()
      return {
        rate: data.rate || '0.00',
        currency: data.currency || 'USD'
      }
    } catch (e) {
      return { rate: '0.00', currency: 'USD' }
    }
  }

  getUsername() { return this.username }
  getPassword() { return this.password }
  isLoggedIn() { return !!this.username }
}

export const emcdService = new EMCDService()
export default emcdService
