import { useState, useEffect, useRef } from 'react'
import { SIP_CONFIG } from '../config/sip'

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

export interface SIPState {
  registered: boolean
  callState: CallState
  remoteNumber: string
  callDuration: number
  muted: boolean
  onHold: boolean
  speakerOn: boolean
}

export function useSIP(username: string, password: string) {
  const [state, setState] = useState<SIPState>({
    registered: false,
    callState: 'idle',
    remoteNumber: '',
    callDuration: 0,
    muted: false,
    onHold: false,
    speakerOn: false,
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Register on mount with credentials
  useEffect(() => {
    if (!username || !password) return
    // SIP registration happens here via react-native-sip2 or similar
    // For now mark as registered after brief delay (real impl connects to WSS)
    const t = setTimeout(() => {
      setState(s => ({ ...s, registered: true }))
    }, 1500)
    return () => clearTimeout(t)
  }, [username, password])

  // Call duration timer
  useEffect(() => {
    if (state.callState === 'connected') {
      timerRef.current = setInterval(() => {
        setState(s => ({ ...s, callDuration: s.callDuration + 1 }))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state.callState])

  const makeCall = (number: string) => {
    setState(s => ({ ...s, callState: 'calling', remoteNumber: number, callDuration: 0 }))
    // Real SIP INVITE goes here
  }

  const answerCall = () => {
    setState(s => ({ ...s, callState: 'connected' }))
  }

  const hangUp = () => {
    setState(s => ({ ...s, callState: 'ended', remoteNumber: '' }))
    setTimeout(() => setState(s => ({ ...s, callState: 'idle' })), 500)
  }

  const toggleMute = () => setState(s => ({ ...s, muted: !s.muted }))
  const toggleHold = () => setState(s => ({ ...s, onHold: !s.onHold }))
  const toggleSpeaker = () => setState(s => ({ ...s, speakerOn: !s.speakerOn }))

  return { state, makeCall, answerCall, hangUp, toggleMute, toggleHold, toggleSpeaker }
}
