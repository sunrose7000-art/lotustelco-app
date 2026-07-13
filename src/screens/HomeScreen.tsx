import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, RefreshControl
} from 'react-native'

const logo = require('../assets/logo.jpg')

const COLORS = {
  background: '#040e1a',
  card: '#071525',
  cyan: '#00e5ff',
  green: '#00ff9d',
  red: '#ff3b30',
  foreground: '#e8f4ff',
  muted: 'rgba(184,210,240,0.5)',
  amber: '#ffb347',
}

type CallLog = {
  id: string
  name: string
  number: string
  type: 'outgoing' | 'incoming' | 'missed'
  time: string
  duration?: string
}

type Props = {
  onCall: (number: string) => void
  onNavigate: (screen: string) => void
  username: string
  sipStatus: string
  balance?: string
  callLogs?: CallLog[]
}

export default function HomeScreen({
  onCall, onNavigate, username, sipStatus, balance = '—', callLogs = []
}: Props) {
  const [refreshing, setRefreshing] = useState(false)

  const statusColor = sipStatus === 'registered' ? COLORS.green
    : sipStatus === 'connecting' ? COLORS.amber
    : 'rgba(255,59,48,0.8)'

  const statusLabel = sipStatus === 'registered' ? 'REGISTERED'
    : sipStatus === 'connecting' ? 'CONNECTING'
    : 'OFFLINE'

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'User'

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.username}>{displayName} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('settings')}>
          <View style={styles.logoWrap}>
            <Image source={logo} style={styles.logo} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardLabel}>Available Balance</Text>
          <View style={[styles.sipBadge, { borderColor: `${statusColor}33` }]}>
            <View style={[styles.sipDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.sipText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.balance}>{balance !== '—' ? `$${balance}` : '—'}</Text>
        <Text style={styles.cardSub}>LotusTelco Account</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { icon: '📞', label: 'Dialer', action: () => onNavigate('dialer') },
          { icon: '👥', label: 'Contacts', action: () => onNavigate('contacts') },
          { icon: '💬', label: 'Messages', action: () => onNavigate('messages') },
          { icon: '📊', label: 'History', action: () => onNavigate('history') },
        ].map(a => (
          <TouchableOpacity key={a.label} onPress={a.action} style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Text style={{ fontSize: 22 }}>{a.icon}</Text>
            </View>
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Calls */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Calls</Text>
        <TouchableOpacity onPress={() => onNavigate('history')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {callLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No recent calls</Text>
          <Text style={styles.emptySub}>Your call history will appear here</Text>
        </View>
      ) : (
        <View style={styles.callList}>
          {callLogs.slice(0, 5).map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => onCall(c.number)}
              style={styles.callRow}
            >
              <View style={styles.callAvatar}>
                <Text style={styles.callAvatarText}>
                  {c.name ? c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : c.number.slice(-2)}
                </Text>
              </View>
              <View style={styles.callInfo}>
                <Text style={styles.callName}>{c.name || c.number}</Text>
                <Text style={styles.callNumber}>{c.number}</Text>
              </View>
              <View style={styles.callMeta}>
                <Text style={{ fontSize: 16 }}>
                  {c.type === 'missed' ? '📵' : c.type === 'outgoing' ? '📤' : '📥'}
                </Text>
                <Text style={styles.callTime}>{c.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040e1a', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 20,
  },
  greeting: { fontSize: 13, color: COLORS.muted },
  username: { fontSize: 20, fontWeight: '700', color: COLORS.foreground },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    padding: 3,
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  logo: { width: '100%', height: '100%', borderRadius: 10 },
  card: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#071525',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    marginBottom: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 13, color: COLORS.muted },
  sipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,157,0.06)',
    borderWidth: 1,
  },
  sipDot: { width: 6, height: 6, borderRadius: 3 },
  sipText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  balance: { fontSize: 38, fontWeight: '800', color: COLORS.cyan, marginBottom: 4 },
  cardSub: { fontSize: 12, color: COLORS.muted },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  quickAction: { alignItems: 'center', gap: 8 },
  quickActionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(0,229,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  seeAll: { fontSize: 12, color: COLORS.cyan, fontWeight: '600' },
  callList: { gap: 8 },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#071525',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.07)',
  },
  callAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,229,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callAvatarText: { fontSize: 14, fontWeight: '700', color: COLORS.cyan },
  callInfo: { flex: 1 },
  callName: { fontSize: 13, fontWeight: '600', color: COLORS.foreground },
  callNumber: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  callMeta: { alignItems: 'flex-end', gap: 4 },
  callTime: { fontSize: 10, color: COLORS.muted },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  emptySub: { fontSize: 12, color: 'rgba(184,210,240,0.3)', textAlign: 'center' },
})
