import React, { useState, useEffect } from 'react'
import {
  View, StyleSheet, SafeAreaView, StatusBar,
  Text, TouchableOpacity, Alert, BackHandler, Platform
} from 'react-native'
import { useSIP } from '../src/hooks/useSIP'
import LoginScreen from '../src/screens/LoginScreen'
import HomeScreen from '../src/screens/HomeScreen'
import DialerScreen from '../src/screens/DialerScreen'
import CallScreen from '../src/screens/CallScreen'
import SettingsScreen from '../src/screens/SettingsScreen'
import { formatSipUser, getDisplayName, SIP_CONFIG } from '../src/config/sip'

type Screen = 'login' | 'home' | 'dialer' | 'call' | 'contacts' | 'messages' | 'history' | 'settings'

const TABS: { label: string; screen: Screen; activeIcon: string; inactiveIcon: string }[] = [
  { label: 'Home',     screen: 'home',     activeIcon: '⌂',  inactiveIcon: '⌂'  },
  { label: 'Dialer',   screen: 'dialer',   activeIcon: '✆',  inactiveIcon: '✆'  },
  { label: 'Contacts', screen: 'contacts', activeIcon: '✉',  inactiveIcon: '✉'  },
  { label: 'Messages', screen: 'messages', activeIcon: '✉',  inactiveIcon: '✉'  },
  { label: 'Settings', screen: 'settings', activeIcon: '⚙',  inactiveIcon: '⚙'  },
]

const TAB_SCREENS: Screen[] = ['home', 'dialer', 'contacts', 'messages', 'settings']
const BACK_SCREENS: Screen[] = ['contacts', 'messages', 'history', 'settings']
const TITLES: Partial<Record<Screen, string>> = {
  contacts: 'Contacts',
  messages: 'Messages',
  history: 'Call History',
  settings: 'Settings',
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [prevScreen, setPrevScreen] = useState<Screen>('home')
  const [username, setUsername] = useState('')
  const [callNumber, setCallNumber] = useState('')
  const [callType, setCallType] = useState<'outgoing'|'incoming'>('outgoing')
  const sip = useSIP()

  // Android hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'call') return true
      if (BACK_SCREENS.includes(screen)) {
        setScreen(prevScreen || 'home')
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [screen, prevScreen])

  // Incoming call auto-navigate
  useEffect(() => {
    if (sip.state.callStatus === 'ringing' && screen !== 'call') {
      setCallNumber(sip.state.remoteNumber)
      setCallType('incoming')
      setScreen('call')
    }
  }, [sip.state.callStatus])

  // Auto-leave call screen when call ends
  useEffect(() => {
    if (sip.state.callStatus === 'idle' && screen === 'call') {
      setTimeout(() => setScreen('home'), 800)
    }
  }, [sip.state.callStatus, screen])

  const navigate = (to: Screen) => {
    setPrevScreen(screen)
    setScreen(to)
  }

  const handleLogin = (user: string, pass: string) => {
    const fmt = formatSipUser(user)
    setUsername(getDisplayName(fmt))
    setScreen('home')
    sip.register(fmt, pass)
  }

  const handleCall = (number: string) => {
    if (!number.trim()) { navigate('dialer'); return }
    if (sip.state.sipStatus !== 'registered') {
      Alert.alert('Not Registered', 'Please wait — SIP is connecting to your server. This usually takes 10–30 seconds after login.\n\nCurrent status: ' + sip.state.sipStatus)
      return
    }
    setCallNumber(number)
    setCallType('outgoing')
    setScreen('call')
    sip.makeCall(number)
  }

  const handleEndCall = () => {
    sip.hangUp()
    setScreen('home')
  }

  const handleLogout = () => {
    sip.unregister()
    setUsername('')
    setScreen('login')
  }

  const showNav = TAB_SCREENS.includes(screen)
  const showBack = BACK_SCREENS.includes(screen)

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#040e1a" />

      {/* Back header for non-tab screens */}
      {showBack && (
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => setScreen(prevScreen || 'home')}
            style={s.backBtn}
            activeOpacity={0.7}
          >
            <Text style={s.backChevron}>‹</Text>
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{TITLES[screen] || ''}</Text>
          <View style={{ width: 80 }} />
        </View>
      )}

      {/* Screens */}
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}

      {screen === 'home' && (
        <HomeScreen
          username={username}
          sipStatus={sip.state.sipStatus}
          onCall={handleCall}
          onNavigate={navigate}
          balance="24.80"
          callLogs={[]}
        />
      )}

      {screen === 'dialer' && <DialerScreen onCall={handleCall} />}

      {screen === 'call' && (
        <CallScreen
          number={callNumber}
          type={callType}
          callStatus={sip.state.callStatus}
          callDuration={sip.state.callDuration}
          muted={sip.state.muted}
          onHold={sip.state.onHold}
          onEnd={handleEndCall}
          onAnswer={sip.answerCall}
          onToggleMute={sip.toggleMute}
          onToggleHold={sip.toggleHold}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          username={username}
          sipStatus={sip.state.sipStatus}
          sipServer={SIP_CONFIG.server}
          onLogout={handleLogout}
        />
      )}

      {/* Placeholder screens with back nav visible */}
      {(screen === 'contacts' || screen === 'messages' || screen === 'history') && (
        <View style={s.placeholder}>
          <Text style={s.phIcon}>
            {screen === 'contacts' ? '👥' : screen === 'messages' ? '💬' : '📋'}
          </Text>
          <Text style={s.phTitle}>{TITLES[screen]}</Text>
          <Text style={s.phSub}>Coming in next update</Text>
        </View>
      )}

      {/* Bottom nav - always show on tab screens */}
      {showNav && (
        <View style={s.tabBar}>
          {[
            { label: 'Home',     screen: 'home'     as Screen, icon: '🏠' },
            { label: 'Dialer',   screen: 'dialer'   as Screen, icon: '📞' },
            { label: 'Contacts', screen: 'contacts' as Screen, icon: '👤' },
            { label: 'Messages', screen: 'messages' as Screen, icon: '💬' },
            { label: 'Settings', screen: 'settings' as Screen, icon: '⚙️' },
          ].map(t => {
            const active = screen === t.screen
            return (
              <TouchableOpacity
                key={t.label}
                onPress={() => navigate(t.screen)}
                style={s.tab}
                activeOpacity={0.7}
              >
                <Text style={[s.tabIcon, active && s.tabIconActive]}>{t.icon}</Text>
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
                {active && <View style={s.tabDot} />}
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#040e1a' },

  // Header with back
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,255,0.07)',
    backgroundColor: '#040e1a',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
  },
  backChevron: {
    fontSize: 32,
    color: '#00e5ff',
    lineHeight: 34,
    marginRight: 2,
    marginTop: -2,
  },
  backText: {
    fontSize: 16,
    color: '#00e5ff',
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#e8f4ff',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#071525',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,229,255,0.08)',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.35,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(184,210,240,0.35)',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: '#00e5ff',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00e5ff',
    marginTop: 1,
  },

  // Placeholder
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#040e1a',
    gap: 12,
  },
  phIcon: { fontSize: 48 },
  phTitle: { fontSize: 20, fontWeight: '700', color: '#e8f4ff' },
  phSub: { fontSize: 13, color: 'rgba(184,210,240,0.4)' },
})
