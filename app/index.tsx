import React, { useState, useEffect } from 'react'
import {
  View, StyleSheet, SafeAreaView, StatusBar,
  Text, TouchableOpacity, Alert
} from 'react-native'
import { useSIP } from '../src/hooks/useSIP'
import LoginScreen from '../src/screens/LoginScreen'
import HomeScreen from '../src/screens/HomeScreen'
import DialerScreen from '../src/screens/DialerScreen'
import CallScreen from '../src/screens/CallScreen'
import SettingsScreen from '../src/screens/SettingsScreen'
import { formatSipUser, getDisplayName, SIP_CONFIG } from '../src/config/sip'

const COLORS = {
  background: '#040e1a',
  tabBar: '#071525',
  cyan: '#00e5ff',
  muted: 'rgba(184,210,240,0.4)',
  border: 'rgba(0,229,255,0.1)',
}

type Screen = 'login' | 'home' | 'dialer' | 'call' | 'contacts' | 'messages' | 'history' | 'settings'

const TABS: { icon: string; label: string; screen: Screen }[] = [
  { icon: '🏠', label: 'Home', screen: 'home' },
  { icon: '📞', label: 'Dialer', screen: 'dialer' },
  { icon: '👥', label: 'Contacts', screen: 'contacts' },
  { icon: '💬', label: 'Messages', screen: 'messages' },
  { icon: '⚙️', label: 'Settings', screen: 'settings' },
]

const NAV_SCREENS: Screen[] = ['home', 'dialer', 'contacts', 'messages', 'settings']

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [username, setUsername] = useState('')
  const [sipUser, setSipUser] = useState('')
  const [callNumber, setCallNumber] = useState('')
  const [callType, setCallType] = useState<'outgoing' | 'incoming'>('outgoing')

  const sip = useSIP()

  // Auto-navigate to call screen on incoming call
  useEffect(() => {
    if (sip.state.callStatus === 'ringing' && screen !== 'call') {
      setCallNumber(sip.state.remoteNumber)
      setCallType('incoming')
      setScreen('call')
    }
  }, [sip.state.callStatus])

  // Show SIP errors as alerts
  useEffect(() => {
    if (sip.state.sipStatus === 'error' && sip.state.errorMessage) {
      Alert.alert('Connection Error', sip.state.errorMessage)
    }
  }, [sip.state.sipStatus])

  const handleLogin = async (user: string, pass: string) => {
    const formatted = formatSipUser(user)
    setSipUser(formatted)
    setUsername(getDisplayName(formatted))
    setScreen('home')
    // Register SIP
    sip.register(formatted, pass)
  }

  const handleCall = (number: string) => {
    if (!number.trim()) {
      setScreen('dialer')
      return
    }
    if (sip.state.sipStatus !== 'registered') {
      Alert.alert(
        'Not Connected',
        `SIP Status: ${sip.state.sipStatus}. Please wait for registration to complete.`
      )
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
    setSipUser('')
    setScreen('login')
  }

  const showNav = NAV_SCREENS.includes(screen)

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Screens */}
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {screen === 'home' && (
        <HomeScreen
          username={username}
          sipStatus={sip.state.sipStatus}
          onCall={handleCall}
          onNavigate={(s) => setScreen(s as Screen)}
          balance="24.80"
          callLogs={[]}
        />
      )}

      {screen === 'dialer' && (
        <DialerScreen onCall={handleCall} />
      )}

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

      {(screen === 'contacts' || screen === 'messages' || screen === 'history') && (
        <View style={styles.placeholderScreen}>
          <Text style={styles.placeholderIcon}>
            {screen === 'contacts' ? '👥' : screen === 'messages' ? '💬' : '📊'}
          </Text>
          <Text style={styles.placeholderTitle}>
            {screen === 'contacts' ? 'Contacts' : screen === 'messages' ? 'Messages' : 'Call History'}
          </Text>
          <Text style={styles.placeholderSub}>Coming soon</Text>
        </View>
      )}

      {screen === 'settings' && (
        <SettingsScreen
          username={username}
          sipStatus={sip.state.sipStatus}
          sipServer={SIP_CONFIG.server}
          onLogout={handleLogout}
        />
      )}

      {/* Bottom Navigation */}
      {showNav && (
        <View style={styles.tabBar}>
          {TABS.map(t => {
            const active = screen === t.screen
            return (
              <TouchableOpacity
                key={t.label}
                onPress={() => setScreen(t.screen)}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                  {t.icon}
                </Text>
                <Text style={[styles.tabLabel, active && { color: COLORS.cyan }]}>
                  {t.label}
                </Text>
                {active && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBar,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 9, fontWeight: '600', color: COLORS.muted },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cyan,
    marginTop: 2,
  },
  placeholderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
  },
  placeholderIcon: { fontSize: 48 },
  placeholderTitle: { fontSize: 20, fontWeight: '700', color: '#e8f4ff' },
  placeholderSub: { fontSize: 14, color: COLORS.muted },
})
