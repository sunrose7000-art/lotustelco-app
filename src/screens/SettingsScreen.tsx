import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, Switch
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
  border: 'rgba(0,229,255,0.1)',
}

type Props = {
  username: string
  sipStatus: string
  sipServer: string
  onLogout: () => void
}

export default function SettingsScreen({ username, sipStatus, sipServer, onLogout }: Props) {
  const [notifications, setNotifications] = React.useState(true)
  const [wifiOnly, setWifiOnly] = React.useState(false)

  const statusColor = sipStatus === 'registered' ? COLORS.green
    : sipStatus === 'connecting' ? '#ffb347'
    : COLORS.red

  const statusLabel = sipStatus === 'registered' ? 'Registered'
    : sipStatus === 'connecting' ? 'Connecting...'
    : sipStatus === 'error' ? 'Error'
    : 'Offline'

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image source={logo} style={styles.avatar} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{username || 'User'}</Text>
          <Text style={styles.profileSip}>{username?.toLowerCase()}@lotustelco.net</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      {/* SIP Account */}
      <Text style={styles.sectionTitle}>SIP ACCOUNT</Text>
      <View style={styles.section}>
        <Row label="Username" value={username || '—'} />
        <Divider />
        <Row label="SIP Server" value={sipServer || '65.21.41.12'} />
        <Divider />
        <Row label="Domain" value="lotustelco.net" />
        <Divider />
        <Row label="Port" value="5060" />
        <Divider />
        <Row label="Transport" value="WSS" />
        <Divider />
        <Row label="Status" value={statusLabel} valueColor={statusColor} />
      </View>

      {/* Preferences */}
      <Text style={styles.sectionTitle}>PREFERENCES</Text>
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.rowLabel}>Push Notifications</Text>
            <Text style={styles.rowSub}>Receive incoming call alerts</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(0,229,255,0.4)' }}
            thumbColor={notifications ? COLORS.cyan : '#888'}
          />
        </View>
        <Divider />
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.rowLabel}>WiFi Calls Only</Text>
            <Text style={styles.rowSub}>Don't use mobile data for calls</Text>
          </View>
          <Switch
            value={wifiOnly}
            onValueChange={setWifiOnly}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(0,229,255,0.4)' }}
            thumbColor={wifiOnly ? COLORS.cyan : '#888'}
          />
        </View>
      </View>

      {/* Support */}
      <Text style={styles.sectionTitle}>SUPPORT</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Help Center</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Contact Support</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <Divider />
        <Row label="Version" value="1.1.0" />
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: onLogout },
        ])}
        style={styles.logoutBtn}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 14, color: 'rgba(184,210,240,0.9)' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: valueColor || 'rgba(184,210,240,0.5)', fontWeight: '500', maxWidth: '55%', textAlign: 'right' }}>{value}</Text>
    </View>
  )
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(0,229,255,0.06)', marginHorizontal: 16 }} />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040e1a' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    margin: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#071525',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.1)',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    padding: 4,
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 12 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#e8f4ff' },
  profileSip: { fontSize: 11, color: 'rgba(184,210,240,0.5)' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(184,210,240,0.4)',
    letterSpacing: 1.5,
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#071525',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 14, color: 'rgba(184,210,240,0.9)' },
  rowSub: { fontSize: 11, color: 'rgba(184,210,240,0.4)', marginTop: 2 },
  arrow: { fontSize: 20, color: 'rgba(184,210,240,0.3)' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutBtn: {
    margin: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
    alignItems: 'center',
  },
  logoutText: { color: '#ff3b30', fontWeight: '700', fontSize: 15 },
})
