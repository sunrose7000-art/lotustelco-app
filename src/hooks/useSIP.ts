import { useState, useEffect, useRef, useCallback } from 'react'
import { Platform } from 'react-native'
import { SIP_CONFIG, formatSipUser } from '../config/sip'

export type SIPStatus = 'disconnected' | 'connecting' | 'registered' | 'error'
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

export interface SIPState {
  sipStatus: SIPStatus
  callStatus: CallStatus
  remoteNumber: string
  callDuration: number
  muted: boolean
  onHold: boolean
  errorMessage: string
}

// Global UA reference
let globalUA: any = null

export function useSIP() {
  const [state, setState] = useState<SIPState>({
    sipStatus: 'disconnected',
    callStatus: 'idle',
    remoteNumber: '',
    callDuration: 0,
    muted: false,
    onHold: false,
    errorMessage: '',
  })

  const sessionRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setState(s => ({ ...s, callDuration: s.callDuration + 1 }))
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setState(s => ({ ...s, callDuration: 0 }))
  }

  const setupSession = (session: any) => {
    sessionRef.current = session

    session.on('progress', (e: any) => {
      setState(s => ({ ...s, callStatus: 'calling' }))
    })

    session.on('accepted', (e: any) => {
      console.log('Call accepted')
      setState(s => ({ ...s, callStatus: 'connected' }))
      startTimer()
    })

    session.on('confirmed', (e: any) => {
      console.log('Call confirmed')
      setState(s => ({ ...s, callStatus: 'connected' }))
      startTimer()
    })

    session.on('failed', (e: any) => {
      console.log('Call failed:', JSON.stringify(e))
      stopTimer()
      setState(s => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
        muted: false,
        onHold: false,
        errorMessage: e?.cause || 'Call failed',
      }))
      sessionRef.current = null
    })

    session.on('ended', (e: any) => {
      console.log('Call ended:', JSON.stringify(e))
      stopTimer()
      setState(s => ({
        ...s,
        callStatus: 'ended',
        muted: false,
        onHold: false,
      }))
      setTimeout(() => setState(s => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
      })), 1000)
      sessionRef.current = null
    })
  }

  const register = useCallback(async (username: string, password: string) => {
    try {
      setState(s => ({ ...s, sipStatus: 'connecting', errorMessage: '' }))

      // Stop existing UA
      if (globalUA) {
        try { globalUA.stop() } catch (e) {}
        globalUA = null
        await new Promise(r => setTimeout(r, 500))
      }

      // Setup WebRTC for React Native
      let RTCPeerConnection: any
      let RTCSessionDescription: any
      let RTCIceCandidate: any
      let MediaStream: any
      let getUserMedia: any

      try {
        const webrtc = require('react-native-webrtc')
        RTCPeerConnection = webrtc.RTCPeerConnection
        RTCSessionDescription = webrtc.RTCSessionDescription
        RTCIceCandidate = webrtc.RTCIceCandidate
        MediaStream = webrtc.MediaStream
        getUserMedia = webrtc.mediaDevices.getUserMedia.bind(webrtc.mediaDevices)
        console.log('react-native-webrtc loaded')
      } catch (e) {
        console.log('react-native-webrtc not available, using basic mode')
      }

      const JsSIP = require('jssip')
      JsSIP.debug.disable('JsSIP:*')

      // If WebRTC available, register it with JsSIP
      if (RTCPeerConnection) {
        JsSIP.RTCPeerConnection = RTCPeerConnection
        JsSIP.RTCSessionDescription = RTCSessionDescription
        JsSIP.RTCIceCandidate = RTCIceCandidate
      }

      const sipUser = formatSipUser(username)
      const socket = new JsSIP.WebSocketInterface(SIP_CONFIG.wsUri)

      const ua = new JsSIP.UA({
        sockets: [socket],
        uri: `sip:${sipUser}@${SIP_CONFIG.domain}`,
        password,
        register: true,
        register_expires: 600,
        session_timers: false,
        user_agent: 'LotusTelco-App/1.1.0',
        connection_recovery_min_interval: 2,
        connection_recovery_max_interval: 30,
        hack_ip_in_contact: true,
        no_answer_timeout: 60,
      })

      globalUA = ua

      ua.on('connected', () => {
        console.log('WS connected to', SIP_CONFIG.wsUri)
      })

      ua.on('disconnected', (e: any) => {
        console.log('WS disconnected:', e?.cause)
        setState(s => ({
          ...s,
          sipStatus: s.sipStatus === 'registered' ? 'disconnected' : s.sipStatus,
        }))
      })

      ua.on('registered', (e: any) => {
        console.log('SIP registered successfully!')
        setState(s => ({ ...s, sipStatus: 'registered', errorMessage: '' }))
      })

      ua.on('unregistered', (e: any) => {
        console.log('SIP unregistered:', e?.cause)
        setState(s => ({ ...s, sipStatus: 'disconnected' }))
      })

      ua.on('registrationFailed', (e: any) => {
        console.log('SIP registration FAILED:', e?.cause, e?.response?.status_code)
        const msg = e?.cause || `Registration failed (${e?.response?.status_code || 'unknown'})`
        setState(s => ({
          ...s,
          sipStatus: 'error',
          errorMessage: msg,
        }))
      })

      ua.on('newRTCSession', (data: any) => {
        const session = data.session
        console.log('New session:', session.direction, 'from:', session.remote_identity?.uri?.user)

        if (session.direction === 'incoming') {
          const caller = session.remote_identity?.uri?.user || 'Unknown'
          setState(s => ({
            ...s,
            callStatus: 'ringing',
            remoteNumber: caller,
          }))
          setupSession(session)
        }
      })

      ua.start()

    } catch (error: any) {
      console.log('SIP register error:', error?.message)
      setState(s => ({
        ...s,
        sipStatus: 'error',
        errorMessage: error?.message || 'Failed to initialize SIP',
      }))
    }
  }, [])

  const makeCall = useCallback((number: string) => {
    if (!globalUA) {
      console.log('No UA available')
      return
    }

    console.log('Making call to:', number)
    setState(s => ({
      ...s,
      callStatus: 'calling',
      remoteNumber: number,
      callDuration: 0,
      muted: false,
      onHold: false,
    }))

    try {
      const target = `sip:${number}@${SIP_CONFIG.domain}`
      console.log('Calling SIP target:', target)

      const session = globalUA.call(target, {
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
        sessionTimersExpires: 600,
        extraHeaders: [],
        rtcOfferConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        },
      })

      if (session) setupSession(session)

    } catch (error: any) {
      console.log('makeCall error:', error?.message)
      setState(s => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
        errorMessage: error?.message || 'Call failed to initiate',
      }))
    }
  }, [])

  const answerCall = useCallback(() => {
    if (!sessionRef.current) {
      console.log('No session to answer')
      return
    }
    try {
      sessionRef.current.answer({
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        },
        rtcAnswerConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        },
      })
    } catch (e: any) {
      console.log('answer error:', e?.message)
    }
  }, [])

  const hangUp = useCallback(() => {
    console.log('Hanging up')
    stopTimer()
    if (sessionRef.current) {
      try {
        sessionRef.current.terminate()
      } catch (e) {}
      sessionRef.current = null
    }
    setState(s => ({
      ...s,
      callStatus: 'idle',
      remoteNumber: '',
      muted: false,
      onHold: false,
    }))
  }, [])

  const toggleMute = useCallback(() => {
    if (!sessionRef.current) return
    try {
      const newMuted = !state.muted
      if (newMuted) {
        sessionRef.current.mute({ audio: true })
      } else {
        sessionRef.current.unmute({ audio: true })
      }
      setState(s => ({ ...s, muted: newMuted }))
    } catch (e) {}
  }, [state.muted])

  const toggleHold = useCallback(() => {
    if (!sessionRef.current) return
    try {
      if (state.onHold) {
        sessionRef.current.unhold()
      } else {
        sessionRef.current.hold()
      }
      setState(s => ({ ...s, onHold: !s.onHold }))
    } catch (e) {}
  }, [state.onHold])

  const unregister = useCallback(() => {
    try {
      if (globalUA) {
        globalUA.stop()
        globalUA = null
      }
    } catch (e) {}
    stopTimer()
    setState(s => ({
      ...s,
      sipStatus: 'disconnected',
      callStatus: 'idle',
      remoteNumber: '',
    }))
  }, [])

  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [])

  return {
    state,
    register,
    makeCall,
    answerCall,
    hangUp,
    toggleMute,
    toggleHold,
    unregister,
  }
}
