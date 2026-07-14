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
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopTimer()
    }
  }, [])

  const safeSetState = (updater: any) => {
    if (mountedRef.current) {
      setState(updater)
    }
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      safeSetState((s: SIPState) => ({ ...s, callDuration: s.callDuration + 1 }))
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const setupSession = (session: any) => {
    sessionRef.current = session

    session.on('progress', () => {
      safeSetState((s: SIPState) => ({ ...s, callStatus: 'calling' }))
    })

    session.on('accepted', () => {
      safeSetState((s: SIPState) => ({ ...s, callStatus: 'connected' }))
      startTimer()
    })

    session.on('confirmed', () => {
      safeSetState((s: SIPState) => ({ ...s, callStatus: 'connected' }))
      startTimer()
    })

    session.on('failed', (e: any) => {
      stopTimer()
      sessionRef.current = null
      safeSetState((s: SIPState) => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
        muted: false,
        onHold: false,
        errorMessage: e?.cause || 'Call failed',
      }))
    })

    session.on('ended', () => {
      stopTimer()
      sessionRef.current = null
      safeSetState((s: SIPState) => ({
        ...s,
        callStatus: 'ended',
        muted: false,
        onHold: false,
      }))
      setTimeout(() => safeSetState((s: SIPState) => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
      })), 1000)
    })
  }

  const register = useCallback((username: string, password: string) => {
    // Stop any existing UA
    if (globalUA) {
      try { globalUA.stop() } catch (e) {}
      globalUA = null
    }

    safeSetState((s: SIPState) => ({ ...s, sipStatus: 'connecting', errorMessage: '' }))

    // Delay SIP init to let UI settle first
    const timer = setTimeout(() => {
      if (!mountedRef.current) return

      try {
        // Dynamic require to avoid load-time crashes
        let JsSIP: any
        try {
          JsSIP = require('jssip')
        } catch (e) {
          safeSetState((s: SIPState) => ({
            ...s,
            sipStatus: 'error',
            errorMessage: 'SIP library not available',
          }))
          return
        }

        // Disable debug logs
        if (JsSIP.debug && JsSIP.debug.disable) {
          JsSIP.debug.disable('JsSIP:*')
        }

        const sipUser = formatSipUser(username)
        const wsUri = SIP_CONFIG.wsUri

        let socket: any
        try {
          socket = new JsSIP.WebSocketInterface(wsUri)
        } catch (e: any) {
          safeSetState((s: SIPState) => ({
            ...s,
            sipStatus: 'error',
            errorMessage: 'WebSocket failed: ' + (e?.message || 'unknown'),
          }))
          return
        }

        const ua = new JsSIP.UA({
          sockets: [socket],
          uri: `sip:${sipUser}@${SIP_CONFIG.domain}`,
          password,
          register: true,
          register_expires: 600,
          session_timers: false,
          connection_recovery_min_interval: 2,
          connection_recovery_max_interval: 30,
        })

        globalUA = ua

        ua.on('registered', () => {
          safeSetState((s: SIPState) => ({ ...s, sipStatus: 'registered', errorMessage: '' }))
        })

        ua.on('unregistered', () => {
          safeSetState((s: SIPState) => ({ ...s, sipStatus: 'disconnected' }))
        })

        ua.on('registrationFailed', (e: any) => {
          safeSetState((s: SIPState) => ({
            ...s,
            sipStatus: 'error',
            errorMessage: `Failed: ${e?.cause || 'unknown'}`,
          }))
        })

        ua.on('disconnected', () => {
          safeSetState((s: SIPState) => (
            s.sipStatus === 'registered'
              ? { ...s, sipStatus: 'disconnected' }
              : s
          ))
        })

        ua.on('newRTCSession', (data: any) => {
          const session = data.session
          if (session.direction === 'incoming') {
            const caller = session.remote_identity?.uri?.user || 'Unknown'
            safeSetState((s: SIPState) => ({
              ...s,
              callStatus: 'ringing',
              remoteNumber: caller,
            }))
            setupSession(session)
          }
        })

        ua.start()

      } catch (error: any) {
        safeSetState((s: SIPState) => ({
          ...s,
          sipStatus: 'error',
          errorMessage: error?.message || 'SIP init failed',
        }))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const makeCall = useCallback((number: string) => {
    if (!globalUA) return

    safeSetState((s: SIPState) => ({
      ...s,
      callStatus: 'calling',
      remoteNumber: number,
      callDuration: 0,
      muted: false,
      onHold: false,
    }))

    try {
      const JsSIP = require('jssip')
      const session = globalUA.call(
        `sip:${number}@${SIP_CONFIG.domain}`,
        {
          mediaConstraints: { audio: true, video: false },
          pcConfig: {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          },
        }
      )
      if (session) setupSession(session)
    } catch (error: any) {
      safeSetState((s: SIPState) => ({
        ...s,
        callStatus: 'idle',
        remoteNumber: '',
        errorMessage: error?.message || 'Call failed',
      }))
    }
  }, [])

  const answerCall = useCallback(() => {
    if (!sessionRef.current) return
    try {
      sessionRef.current.answer({
        mediaConstraints: { audio: true, video: false },
      })
    } catch (e) {}
  }, [])

  const hangUp = useCallback(() => {
    stopTimer()
    if (sessionRef.current) {
      try { sessionRef.current.terminate() } catch (e) {}
      sessionRef.current = null
    }
    safeSetState((s: SIPState) => ({
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
      safeSetState((s: SIPState) => ({ ...s, muted: !s.muted }))
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
      safeSetState((s: SIPState) => ({ ...s, onHold: !s.onHold }))
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
    safeSetState((s: SIPState) => ({
      ...s,
      sipStatus: 'disconnected',
      callStatus: 'idle',
      remoteNumber: '',
    }))
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
