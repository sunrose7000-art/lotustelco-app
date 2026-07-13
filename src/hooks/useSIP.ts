import { useState, useEffect, useRef } from 'react'
import { SIP_CONFIG } from '../config/sip'

export type SIPStatus = 'disconnected' | 'connecting' | 'registered' | 'error'
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

export interface SIPState {
  sipStatus: SIPStatus
  callStatus: CallStatus
  remoteNumber: string
  callDuration: number
  muted: boolean
  onHold: boolean
  speakerOn: boolean
  errorMessage: string
}

export function useSIP() {
  const [state, setState] = useState<SIPState>({
    sipStatus: 'disconnected',
    callStatus: 'idle',
    remoteNumber: '',
    callDuration: 0,
    muted: false,
    onHold: false,
    speakerOn: false,
    errorMessage: '',
  })

  const uaRef = useRef<any>(null)
  const sessionRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const register = async (username: string, password: string) => {
    try {
      setState(s => ({ ...s, sipStatus: 'connecting' }))

      // Format username for VoIPswitch
      const sipUser = username.includes('@')
        ? username.replace('@', '_')
        : username

      // Dynamic import of JsSIP to avoid issues
      const JsSIP = require('jssip')

      const socket = new JsSIP.WebSocketInterface(SIP_CONFIG.wsUri)

      const configuration = {
        sockets: [socket],
        uri: `sip:${sipUser}@${SIP_CONFIG.domain}`,
        password: password,
        register: true,
        register_expires: 300,
        connection_recovery_min_interval: 2,
        connection_recovery_max_interval: 30,
      }

      const ua = new JsSIP.UA(configuration)
      uaRef.current = ua

      ua.on('registered', () => {
        setState(s => ({ ...s, sipStatus: 'registered' }))
      })

      ua.on('unregistered', () => {
        setState(s => ({ ...s, sipStatus: 'disconnected' }))
      })

      ua.on('registrationFailed', (e: any) => {
        setState(s => ({
          ...s,
          sipStatus: 'error',
          errorMessage: e.cause || 'Registration failed'
        }))
      })

      ua.on('newRTCSession', (data: any) => {
        const session = data.session
        sessionRef.current = session

        if (session.direction === 'incoming') {
          setState(s => ({
            ...s,
            callStatus: 'ringing',
            remoteNumber: session.remote_identity.uri.user,
          }))

          session.on('ended', () => {
            setState(s => ({ ...s, callStatus: 'ended', remoteNumber: '' }))
            setTimeout(() => setState(s => ({ ...s, callStatus: 'idle' })), 1000)
          })

          session.on('failed', () => {
            setState(s => ({ ...s, callStatus: 'idle', remoteNumber: '' }))
          })
        }
      })

      ua.start()

    } catch (error: any) {
      setState(s => ({
        ...s,
        sipStatus: 'error',
        errorMessage: error.message || 'Connection failed'
      }))
    }
  }

  const makeCall = (number: string) => {
    if (!uaRef.current || state.sipStatus !== 'registered') return

    setState(s => ({ ...s, callStatus: 'calling', remoteNumber: number, callDuration: 0 }))

    const eventHandlers = {
      progress: () => setState(s => ({ ...s, callStatus: 'calling' })),
      confirmed: () => {
        setState(s => ({ ...s, callStatus: 'connected' }))
        startTimer()
      },
      ended: () => {
        stopTimer()
        setState(s => ({ ...s, callStatus: 'ended' }))
        setTimeout(() => setState(s => ({ ...s, callStatus: 'idle', remoteNumber: '' })), 1000)
      },
      failed: (e: any) => {
        stopTimer()
        setState(s => ({
          ...s,
          callStatus: 'idle',
          remoteNumber: '',
          errorMessage: e.cause || 'Call failed'
        }))
      },
    }

    const options = {
      eventHandlers,
      mediaConstraints: { audio: true, video: false },
    }

    try {
      const JsSIP = require('jssip')
      const session = uaRef.current.call(
        `sip:${number}@${SIP_CONFIG.domain}`,
        options
      )
      sessionRef.current = session
    } catch (error: any) {
      setState(s => ({ ...s, callStatus: 'idle', errorMessage: error.message }))
    }
  }

  const answerCall = () => {
    if (!sessionRef.current) return
    sessionRef.current.answer({
      mediaConstraints: { audio: true, video: false }
    })
    startTimer()
    setState(s => ({ ...s, callStatus: 'connected' }))
  }

  const hangUp = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.terminate()
      } catch (e) {}
    }
    stopTimer()
    setState(s => ({ ...s, callStatus: 'ended' }))
    setTimeout(() => setState(s => ({ ...s, callStatus: 'idle', remoteNumber: '' })), 500)
  }

  const toggleMute = () => {
    if (sessionRef.current) {
      if (state.muted) {
        sessionRef.current.unmute()
      } else {
        sessionRef.current.mute()
      }
    }
    setState(s => ({ ...s, muted: !s.muted }))
  }

  const toggleHold = () => {
    if (sessionRef.current) {
      if (state.onHold) {
        sessionRef.current.unhold()
      } else {
        sessionRef.current.hold()
      }
    }
    setState(s => ({ ...s, onHold: !s.onHold }))
  }

  const unregister = () => {
    if (uaRef.current) {
      uaRef.current.stop()
    }
    setState(s => ({ ...s, sipStatus: 'disconnected' }))
  }

  const startTimer = () => {
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
