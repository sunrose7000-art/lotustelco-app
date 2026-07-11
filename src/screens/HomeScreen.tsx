import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../config/theme'

const logo = require('../assets/logo.jpg')

const recentCalls = [
  { name: 'Sarah Mitchell', number: '+1 415 555 0182', type: 'outgoing', time: '2m ago' },
  { name: 'Bob Carter', number: '+44 20 7946 0001', type: 'missed', time: '1h ago' },
  { name: 'Dana Lee', number: '+1 415 555 0199', type: 'incoming', time: '3h ago' },
  { name: 'James Okonkwo', number: '+44 20 7946 0832', type: 'outgoing', time: 'Yesterday' },
]

type Props = { onCall: (number: string) => void; username: string }

export default function HomeScreen({ onCall, username }: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.username}>{username || 'User'} 👋</Text>
        </View>
        <View style={styles.logoSmall}>
          <Image source={logo} style={styles.logoImg} />
        </View>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={['#0a2440', '#071830']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardGlow} />
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Available Balance</Text>
          <View style={styles.sipBadge}>
            <View style={styles.sipDot} />
            <Text style={styles.sipText}>REGISTERED</Text>
          </View>
        </View>
        <Text style={styles.balance}>$24.80</Text>
        <Text style={styles.cardSub}>LotusTelco Account</Text>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        {[
          { icon: '📞', label: 'Call', action: () => onCall('') },
          { icon: '💬', label: 'Messages', action: () => {} },
          { icon: '👥', label: 'Contacts', action: () => {} },
          { icon: '📊', label: 'History', action: () => {} },
        ].map(a => (
          <TouchableOpacity key={a.label} onPress={a.action} style={styles.action}>
            <View style={styles.actionIcon}>
              <Text style={{ fontSize: 22 }}>{a.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Calls */}
      <Text style={styles.sectionTitle}>Recent Calls</Text>
      <View style={styles.callList}>
        {recentCalls.map((c, i) => (
          <TouchableOpacity key={i} onPress={() => onCall(c.number)} style={styles.callRow}>
            <View style={styles.callAvatar}>
              <Text style={{ fontSize: 16, color: COLORS.cyan, fontWeight: '700' }}>
                {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <View style={styles.callInfo}>
              <Text style={styles.callName}>{c.name}</Text>
              <Text style={styles.callNumber}>{c.number}</Text>
            </View>
            <View style={styles.callMeta}>
              <Text style={{ fontSize: 18 }}>
                {c.type === 'missed' ? '📵' : c.type === 'outgoing' ? '📤' : '📥'}
              </Text>
              <Text style={styles.callTime}>{c.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
  greeting: { fontSize: 13, color: COLORS.muted },
  username: { fontSize: 20, fontWeight: '700', color: COLORS.foreground },
  logoSmall: { width: 44, height: 44, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)' },
  logoImg: { width: '100%', height: '100%' },
  card: { borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)', overflow: 'hidden' },
  cardGlow: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,229,255,0.08)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 13, color: COLORS.muted },
  sipBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(0,255,157,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,157,0.2)' },
  sipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  sipText: { fontSize: 9, fontWeight: '700', color: COLORS.green, letterSpacing: 1 },
  balance: { fontSize: 40, fontWeight: '800', color: COLORS.cyan, marginBottom: 4 },
  cardSub: { fontSize: 12, color: COLORS.muted },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  action: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(0,229,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.foreground, marginBottom: 12 },
  callList: { gap: 8, paddingBottom: 100 },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: 'rgba(7,21,37,0.8)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.08)' },
  callAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,229,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  callInfo: { flex: 1 },
  callName: { fontSize: 13, fontWeight: '600', color: COLORS.foreground },
  callNumber: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  callMeta: { alignItems: 'flex-end', gap: 4 },
  callTime: { fontSize: 10, color: COLORS.muted },
})
