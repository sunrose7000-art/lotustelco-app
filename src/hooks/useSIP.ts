import { useState, useEffect, useRef, useCallback } from 'react'
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

let UA: any = null

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
    setState(s => ({ ...s, callDuration: 0 }))
    timerRef.current = setInterval(() => {
      setState(s => ({ ...s, callDuration: s.callDuration + 1 }))
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const register = useCallback(async (username: string, password: string) => {
    try {
      setState(s => ({ ...s, sipStatus: 'connecting', errorMessage: '' }))

      const JsSIP = require('jssip')
      JsSIP.debug.disable('JsSIP:*')

      // Stop existing UA if any
      if (UA) {
        try { UA.stop() } catch (e) {}
        UA = null
      }

      const sipUser = formatSipUser(username)
      const socket = new JsSIP.WebSocketInterface(SIP_CONFIG.wsUri)

      const config = {
        sockets: [socket],
        uri: `sip:${sipUser}@${SIP_CONFIG.domain}`,
        password,
        register: true,
        register_expires: 300,
        session_timers: false,
        use_preloaded_route: false,
        hack_ip_in_contact: true,
      }

      const ua = new JsSIP.UA(config)
      UA = ua

      ua.on('connected', () => {
        console.log('WS connected')
      })

      ua.on('disconnected', () => {
        console.log('WS disconnected')
        setState(s => ({ ...s, sipStatus: 'disconnected' }))
      })

      ua.on('registered', () => {
        console.log('SIP registered!')
        setState(s => ({ ...s, sipStatus: 'registered', errorMessage: '' }))
      })

      ua.on('unregistered', () => {
        setState(s => ({ ...s, sipStatus: 'disconnected' }))
      })

      ua.on('registrationFailed', (e: any) => {
        console.log('Registration failed:', e.cause)
        setState(s => ({
          ...s,
          sipStatus: 'error',
          errorMessage: `Registration failed: ${e.cause}`
        }))
      })

      ua.on('newRTCSession', (data: any) => {
        const session = data.session
        sessionRef.current = session

        if (session.direction === 'incoming') {
          const caller = session.remote_identity?.uri?.user || 'Unknown'
          setState(s => ({
            ...s,
            callStatus: 'ringing',
            remoteNumber: caller,
          }))
        }

        session.on('accepted', () => {
          setState(s => ({ ...s, callStatus: 'connected' }))
          startTimer()
        })

        session.on('confirmed', () => {
          setState(s => ({ ...s, callStatus: 'connected' }))
          startTimer()
        })

        session.on('ended', () => {
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
          })), 1500)
        })

        session.on('failed', (e: any) => {
          stopTimer()
          console.log('Call failed:', e.cause)
          setState(s => ({
            ...s,
            callStatus: 'idle',
            remoteNumber: '',
            errorMessage: e.cause || 'Call failed',
          }))
        })

        session.on('progress', () => {
          setState(s => ({ ...s, callStatus: 'calling' }))
        })
      })

      ua.start()

    } catch (error: any) {
      console.log('SIP error:', error)
      setState(s => ({
        ...s,
        sipStatus: 'error',
        errorMessage: error.message || 'Connection failed',
      }))
    }
  }, [])

  const makeCall = useCallback((number: string) => {
    if (!UA) return

    setState(s => ({
      ...s,
      callStatus: 'calling',
      remoteNumber: number,
      callDuration: 0,
    }))

    try {
      const JsSIP = require('jssip')
      const target = `sip:${number}@${SIP_CONFIG.domain}`

      UA.call(target, {
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
        },
      })
    } catch (error: any) {
      console.log('makeCall error:', error)
      setState(s => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
        errorMessage: error.message,
      }))
    }
  }, [])

  const answerCall = useCallback(() => {
    if (!sessionRef.current) return
    try {
      sessionRef.current.answer({
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
        },
      })
    } catch (e: any) {
      console.log('answer error:', e)
    }
  }, [])

  const hangUp = useCallback(() => {
    try {
      if (sessionRef.current) {
        sessionRef.current.terminate()
        sessionRef.current = null
      }
    } catch (e) {}
    stopTimer()
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
      if (state.muted) {
        sessionRef.current.unmute({ audio: true })
      } else {
        sessionRef.current.mute({ audio: true })
      }
      setState(s => ({ ...s, muted: !s.muted }))
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
      if (UA) {
        UA.stop()
        UA = null
      }
    } catch (e) {}
    setState(s => ({ ...s, sipStatus: 'disconnected' }))
  }, [])

  useEffect(() => {
    return () => {
      unregister()
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
