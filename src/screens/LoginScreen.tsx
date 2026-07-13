import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, Alert
} from 'react-native'

import { COLORS } from '../config/theme'

const logo = require('../assets/logo.jpg')

type Props = { onLogin: (user: string, pass: string) => void }

export default function LoginScreen({ onLogin }: Props) {
  const [step, setStep] = useState<'welcome' | 'login'>('welcome')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your username and password')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin(username.trim(), password)
    }, 1200)
  }

  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
          </View>
          <Text style={styles.brandName}>
            <Text style={{ color: COLORS.cyan }}>LOTUS</Text>TELCO
          </Text>
          <Text style={styles.tagline}>Smart. Connected. Everywhere.</Text>
          <View style={styles.features}>
            {[
              { icon: '📞', text: 'Crystal-clear VoIP calls worldwide' },
              { icon: '💬', text: 'SMS & messaging on any device' },
              { icon: '📊', text: 'Real-time usage & billing dashboard' },
            ].map(f => (
              <View key={f.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.ctaContainer}>
          <TouchableOpacity onPress={() => setStep('login')} style={styles.signInBtn}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setStep('welcome')} style={styles.backBtn}>
            <Text style={{ color: COLORS.cyan, fontSize: 14, fontWeight: '600' }}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoSmall}>
            <Image source={logo} style={styles.logoSmallImg} />
          </View>
          <Text style={styles.loginTitle}>Welcome back</Text>
          <Text style={styles.loginSubtitle}>Sign in to your LotusTelco account</Text>

          <Text style={styles.fieldLabel}>USERNAME OR SIP ID</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="user@lotustelco.net"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, username ? styles.inputActive : null]}
          />

          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPass}
              style={[styles.input, password ? styles.inputActive : null]}
            />
            <TouchableOpacity
              onPress={() => setShowPass(p => !p)}
              style={styles.eyeBtn}
            >
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={{ color: COLORS.cyan, fontSize: 12, fontWeight: '600' }}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={!username || !password || loading}
            style={[styles.loginBtn, (!username || !password) ? styles.loginBtnDisabled : null]}
          >
            {loading
              ? <ActivityIndicator color="#020c14" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={{ color: COLORS.cyan, fontWeight: '700' }}>Sign up free</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  logoContainer: { width: 110, height: 110, borderRadius: 26, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(0,229,255,0.3)' },
  logo: { width: '100%', height: '100%' },
  brandName: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: 4 },
  tagline: { fontSize: 13, color: COLORS.muted, marginTop: -8 },
  features: { width: '100%', gap: 10, marginTop: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(0,229,255,0.05)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.1)' },
  featureIcon: { fontSize: 20 },
  featureText: { fontSize: 13, fontWeight: '500', color: COLORS.foreground },
  ctaContainer: { padding: 24, paddingBottom: 40, gap: 12 },
  signInBtn: { backgroundColor: COLORS.cyan, padding: 16, borderRadius: 16, alignItems: 'center' },
  signInBtnText: { color: '#020c14', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  createBtn: { padding: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)', backgroundColor: 'rgba(0,229,255,0.05)' },
  createBtnText: { color: COLORS.cyan, fontWeight: '600', fontSize: 14 },
  loginScroll: { flexGrow: 1, padding: 24, paddingTop: 48 },
  backBtn: { marginBottom: 28 },
  logoSmall: { width: 52, height: 52, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)', marginBottom: 20 },
  logoSmallImg: { width: '100%', height: '100%' },
  loginTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, marginBottom: 6 },
  loginSubtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 28 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: 'rgba(0,229,255,0.12)', borderRadius: 14, padding: 14, color: COLORS.foreground, fontSize: 14, backgroundColor: 'rgba(0,229,255,0.05)', marginBottom: 16 },
  inputActive: { borderColor: 'rgba(0,229,255,0.4)' },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 24 },
  loginBtn: { backgroundColor: COLORS.cyan, padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  loginBtnDisabled: { backgroundColor: 'rgba(0,229,255,0.2)' },
  loginBtnText: { color: '#020c14', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  signupText: { textAlign: 'center', fontSize: 12, color: COLORS.muted },
})
