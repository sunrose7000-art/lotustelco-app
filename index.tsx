import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  Alert, SafeAreaView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSIP } from '../src/hooks/useSIP'
import emcdService from '../src/services/EMCDService'
import CallScreen from '../src/screens/CallScreen'

const COLORS = {
  bg: '#040e1a',
  cyan: '#00e5ff',
  red: '#FF3B30',
  green: '#34C759',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.45)',
}

const Tab = createBottomTabNavigator()

// ── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ sipStatus, balance, currency, onRefreshBalance }: any) {
  const statusColor = sipStatus === 'registered' ? COLORS.green
    : sipStatus === 'connecting' ? COLORS.cyan : COLORS.red

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Account Balance</Text>
        <Text style={styles.balanceAmount}>{currency} {balance}</Text>
        <TouchableOpacity onPress={onRefreshBalance} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.statusText}>SIP: {sipStatus.toUpperCase()}</Text>
      </View>
    </SafeAreaView>
  )
}

// ── DIALER SCREEN ────────────────────────────────────────────────────────────
function DialerScreen({ onCall }: { onCall: (n: string) => void }) {
  const [number, setNumber] = useState('')

  const press = (k: string) => setNumber(p => p + k)
  const del = () => setNumber(p => p.slice(0, -1))

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.dialDisplay}>{number || ' '}</Text>
      <View style={styles.keypad}>
        {[['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']].map((row, i) => (
          <View key={i} style={styles.keyRow}>
            {row.map(k => (
              <TouchableOpacity key={k} onPress={() => press(k)} style={styles.key}>
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.callRow}>
        <TouchableOpacity onPress={del} style={styles.delBtn}>
          <Ionicons name="backspace-outline" size={24} color={COLORS.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => number && onCall(number)}
          style={styles.callBtn}
        >
          <Ionicons name="call" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: 56 }} />
      </View>
    </SafeAreaView>
  )
}

// ── SETTINGS SCREEN ──────────────────────────────────────────────────────────
function SettingsScreen({ username, sipStatus, onLogout }: any) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Account</Text>
        <Text style={styles.settingsRow}>Username: {username}</Text>
        <Text style={styles.settingsRow}>SIP Status: {sipStatus}</Text>
      </View>
      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

// ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password')
      return
    }
    setLoading(true)
    onLogin(username.trim(), password.trim())
    setLoading(false)
  }

  return (
    <SafeAreaView style={[styles.screen, styles.loginScreen]}>
      <Text style={styles.loginTitle}>LotusTelco</Text>
      <Text style={styles.loginSubtitle}>VoIP Dialer</Text>

      <TextInput
        style={styles.input}
        placeholder="SIP Username"
        placeholderTextColor={COLORS.muted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} style={styles.loginBtn} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.loginBtnText}>Sign In</Text>
        }
      </TouchableOpacity>
    </SafeAreaView>
  )
}

// ── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [balance, setBalance] = useState('0.00')
  const [currency, setCurrency] = useState('USD')
  const [activeCall, setActiveCall] = useState(false)

  const { state, register, makeCall, hangUp, answerCall, toggleMute, toggleHold, unregister } = useSIP()

  // Check for saved session on startup — FIX for Issue #1
  useEffect(() => {
    (async () => {
      const restored = await emcdService.restoreSession()
      if (restored) {
        const u = emcdService.getUsername()
        const p = emcdService.getPassword()
        register(u, p)
        setLoggedIn(true)
        refreshBalance()
      }
      setChecking(false)
    })()
  }, [])

  // Show call screen when a call is active — FIX for Issue #2
  useEffect(() => {
    if (['calling', 'ringing', 'connected', 'ended'].includes(state.callStatus)) {
      setActiveCall(true)
    } else {
      setActiveCall(false)
    }
  }, [state.callStatus])

  const refreshBalance = useCallback(async () => {
    // FIX for Issue #3 — pull real balance
    const result = await emcdService.getBalance()
    setBalance(result.balance)
    setCurrency(result.currency)
  }, [])

  const handleLogin = async (username: string, password: string) => {
    // Try EMCD auth first, fall back to direct SIP
    const success = await emcdService.login(username, password)
    if (success) {
      refreshBalance()
    }
    // Always register SIP regardless of EMCD result
    register(username, password)
    setLoggedIn(true)
  }

  const handleLogout = async () => {
    hangUp()
    unregister()
    await emcdService.logout()
    setLoggedIn(false)
  }

  const handleCall = (number: string) => {
    makeCall(number)
  }

  if (checking) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={COLORS.cyan} size="large" />
      </View>
    )
  }

  if (!loggedIn) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <LoginScreen onLogin={handleLogin} />
      </>
    )
  }

  // Active call overlay — FIX for Issue #2 (call screen)
  if (activeCall) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <CallScreen
          number={state.remoteNumber}
          type="outgoing"
          callStatus={state.callStatus}
          callDuration={state.callDuration}
          muted={state.muted}
          onHold={state.onHold}
          onEnd={hangUp}
          onAnswer={answerCall}
          onToggleMute={toggleMute}
          onToggleHold={toggleHold}
        />
      </>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#061224',
              borderTopColor: COLORS.border,
              paddingBottom: 4,
            },
            tabBarActiveTintColor: COLORS.cyan,
            tabBarInactiveTintColor: COLORS.muted,
            tabBarIcon: ({ color, size }) => {
              const icons: any = {
                Home: 'home-outline',
                Dialer: 'keypad-outline',
                Settings: 'settings-outline',
              }
              return <Ionicons name={icons[route.name]} size={size} color={color} />
            },
          })}
        >
          <Tab.Screen name="Home">
            {() => (
              <HomeScreen
                sipStatus={state.sipStatus}
                balance={balance}
                currency={currency}
                onRefreshBalance={refreshBalance}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Dialer">
            {() => <DialerScreen onCall={handleCall} />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
            {() => (
              <SettingsScreen
                username={emcdService.getUsername()}
                sipStatus={state.sipStatus}
                onLogout={handleLogout}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  loginScreen: { justifyContent: 'center', padding: 24 },
  loginTitle: { fontSize: 32, fontWeight: '700', color: COLORS.cyan, textAlign: 'center', marginBottom: 4 },
  loginSubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
    color: COLORS.text, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border
  },
  loginBtn: {
    backgroundColor: COLORS.cyan, borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8
  },
  loginBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },

  balanceCard: {
    margin: 20, padding: 24, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'
  },
  balanceLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  balanceAmount: { color: COLORS.cyan, fontSize: 36, fontWeight: '700' },
  refreshBtn: { marginTop: 12, padding: 8 },
  refreshText: { color: COLORS.cyan, fontSize: 13 },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: COLORS.muted, fontSize: 12 },

  dialDisplay: {
    fontSize: 36, color: COLORS.cyan, textAlign: 'center',
    paddingVertical: 24, letterSpacing: 3, fontWeight: '300'
  },
  keypad: { flex: 1, paddingHorizontal: 24 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  key: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border
  },
  keyText: { fontSize: 26, color: COLORS.text, fontWeight: '300' },
  callRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  callBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center'
  },
  delBtn: { width: 56, alignItems: 'center' },

  settingsCard: {
    margin: 20, padding: 20, borderRadius: 16,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border
  },
  settingsTitle: { color: COLORS.cyan, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  settingsRow: { color: COLORS.text, fontSize: 14, paddingVertical: 6 },
  logoutBtn: {
    margin: 20, padding: 16, borderRadius: 12,
    backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)', alignItems: 'center'
  },
  logoutText: { color: COLORS.red, fontSize: 16, fontWeight: '600' },
})
