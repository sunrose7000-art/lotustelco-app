import React, { useState } from 'react'
import { View, StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity } from 'react-native'

// Colors
const COLORS = {
  background: '#040e1a',
  card: '#071525',
  cyan: '#00e5ff',
  green: '#00ff9d',
  red: '#ff4466',
  amber: '#ffb347',
  foreground: '#e8f4ff',
  muted: 'rgba(184,210,240,0.5)',
}

import LoginScreen from '../src/screens/LoginScreen'
import HomeScreen from '../src/screens/HomeScreen'
import DialerScreen from '../src/screens/DialerScreen'
import CallScreen from '../src/screens/CallScreen'

type Screen = 'login' | 'home' | 'dialer' | 'call'

const TABS = [
  { icon: '🏠', label: 'Home', screen: 'home' as Screen },
  { icon: '📞', label: 'Dialer', screen: 'dialer' as Screen },
  { icon: '👥', label: 'Contacts', screen: 'home' as Screen },
  { icon: '💬', label: 'Messages', screen: 'home' as Screen },
  { icon: '⚙️', label: 'Settings', screen: 'home' as Screen },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [username, setUsername] = useState('')
  const [callNumber, setCallNumber] = useState('')
  const [callType, setCallType] = useState<'outgoing'|'incoming'>('outgoing')

  const handleLogin = (user: string) => {
    setUsername(user.split('@')[0])
    setScreen('home')
  }

  const handleCall = (number: string) => {
    setCallNumber(number || '+1 555 000 0000')
    setCallType('outgoing')
    setScreen('call')
  }

  const showNav = screen === 'home' || screen === 'dialer'

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'home' && <HomeScreen onCall={handleCall} username={username} />}
      {screen === 'dialer' && <DialerScreen onCall={handleCall} />}
      {screen === 'call' && <CallScreen number={callNumber} type={callType} onEnd={() => setScreen('home')} />}
      {showNav && (
        <View style={styles.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity key={t.label} onPress={() => setScreen(t.screen)} style={styles.tab}>
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabLabel, screen === t.screen && { color: COLORS.cyan }]}>{t.label}</Text>
              {screen === t.screen && <View style={styles.tabDot} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#040e1a' },
  tabBar: { flexDirection: 'row', backgroundColor: '#071525', borderTopWidth: 1, borderTopColor: 'rgba(0,229,255,0.1)', paddingBottom: 8, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(184,210,240,0.5)' },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#00e5ff' },
})
