import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../config/theme'
import type { CallStatus } from '../hooks/useSIP'

type Props = {
  number: string
  type: 'outgoing' | 'incoming'
  callStatus: CallStatus
  callDuration: number
  muted: boolean
  onHold: boolean
  onEnd: () => void
  onAnswer: () => void
  onToggleMute: () => void
  onToggleHold: () => void
}

export default function CallScreen({
  number, type, callStatus, callDuration,
  muted, onHold, onEnd, onAnswer, onToggleMute, onToggleHold
}: Props) {
  const [keypad, setKeypad] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [dtmf, setDtmf] = useState('')

  const connected = callStatus === 'connected'
  const isIncoming = type === 'incoming' && callStatus === 'ringing'

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const initials = number?.replace(/\D/g, '').slice(-4, -2) || 'LT'

  const statusText = () => {
    switch(callStatus) {
      case 'calling': return 'Calling...'
      case 'ringing': return type === 'incoming' ? '📲 Incoming Call' : 'Ringing...'
      case 'connected': return 'Connected'
      case 'ended': return 'Call Ended'
      default: return ''
    }
  }

  return (
    <View style={styles.container}>
      {/* Status */}
      <View style={styles.statusRow}>
        {connected && <View style={styles.statusDot} />}
        <Text style={styles.statusText}>{statusText()}</Text>
      </View>

      {/* Avatar with rings */}
      <View style={styles.avatarSection}>
        <View style={styles.ring3} />
        <View style={styles.ring2} />
        <View style={styles.ring1} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <Text style={styles.callerName}>{number}</Text>
      {connected
        ? <Text style={styles.timer}>{fmt(callDuration)}</Text>
        : <Text style={styles.subText}>{statusText()}</Text>
      }
      {onHold && <Text style={styles.holdText}>⏸ Call on hold</Text>}

      {/* DTMF Keypad */}
      {keypad && connected && (
        <View style={styles.dtmfContainer}>
          <Text style={styles.dtmfDisplay}>{dtmf || ' '}</Text>
          <View style={styles.dtmfGrid}>
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
              <TouchableOpacity key={k} onPress={() => setDtmf(d => d + k)} style={styles.dtmfKey}>
                <Text style={styles.dtmfKeyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Action buttons */}
      {connected && !keypad && (
        <View style={styles.actions}>
          {[
            { icon: muted ? '🚫🎤' : '🎤', label: muted ? 'Unmute' : 'Mute', active: muted, fn: onToggleMute },
            { icon: '🔊', label: 'Speaker', active: speaker, fn: () => setSpeaker(s => !s) },
            { icon: '⌨️', label: 'Keypad', active: keypad, fn: () => setKeypad(k => !k) },
            { icon: '⏸', label: onHold ? 'Resume' : 'Hold', active: onHold, fn: onToggleHold },
            { icon: '👥', label: 'Add Call', active: false, fn: () => {} },
            { icon: '↗️', label: 'Transfer', active: false, fn: () => {} },
          ].map(a => (
            <TouchableOpacity key={a.label} onPress={a.fn} style={[styles.action, a.active && styles.actionActive]}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionLabel, a.active && { color: COLORS.cyan }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Call control buttons */}
      <View style={styles.bottomButtons}>
        {isIncoming ? (
          <View style={styles.incomingRow}>
            <View style={styles.callBtnGroup}>
              <TouchableOpacity onPress={onEnd} style={[styles.callBigBtn, { backgroundColor: COLORS.red, shadowColor: COLORS.red }]}>
                <Text style={styles.callBtnIcon}>📵</Text>
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: 'rgba(255,68,102,0.8)' }]}>Decline</Text>
            </View>
            <View style={styles.callBtnGroup}>
              <TouchableOpacity onPress={onAnswer} style={[styles.callBigBtn, { backgroundColor: COLORS.green, shadowColor: COLORS.green }]}>
                <Text style={styles.callBtnIcon}>📞</Text>
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: 'rgba(0,255,157,0.8)' }]}>Accept</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={onEnd} style={[styles.callBigBtn, { backgroundColor: COLORS.red, shadowColor: COLORS.red }]}>
            <Text style={styles.callBtnIcon}>📵</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020f1e', alignItems: 'center', paddingTop: 60 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cyan },
  statusText: { fontSize: 12, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2 },
  avatarSection: { position: 'relative', width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  ring1: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)' },
  ring2: { position: 'absolute', width: 175, height: 175, borderRadius: 87.5, borderWidth: 1, borderColor: 'rgba(0,229,255,0.12)' },
  ring3: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,229,255,0.06)' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,229,255,0.1)', borderWidth: 2, borderColor: 'rgba(0,229,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.cyan },
  callerName: { fontSize: 22, fontWeight: '700', color: COLORS.foreground, marginBottom: 6 },
  timer: { fontSize: 20, fontWeight: '600', color: COLORS.cyan, letterSpacing: 4, marginBottom: 4 },
  subText: { fontSize: 14, color: COLORS.muted, marginBottom: 4 },
  holdText: { fontSize: 13, color: COLORS.amber, fontWeight: '600', marginTop: 4 },
  dtmfContainer: { width: '90%', padding: 16, borderRadius: 20, backgroundColor: 'rgba(4,14,26,0.95)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)', marginTop: 12 },
  dtmfDisplay: { fontSize: 20, color: COLORS.cyan, textAlign: 'center', marginBottom: 10, letterSpacing: 4 },
  dtmfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dtmfKey: { width: '30%', padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,229,255,0.06)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,229,255,0.12)' },
  dtmfKeyText: { fontSize: 18, fontWeight: '600', color: COLORS.foreground },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginTop: 16, width: '100%' },
  action: { width: '30%', padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', gap: 6 },
  actionActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderColor: 'rgba(0,229,255,0.3)' },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 10, fontWeight: '600', color: COLORS.muted },
  bottomButtons: { position: 'absolute', bottom: 48, alignItems: 'center' },
  incomingRow: { flexDirection: 'row', gap: 64, alignItems: 'center' },
  callBtnGroup: { alignItems: 'center', gap: 8 },
  callBigBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowOpacity: 0.6, shadowRadius: 20 },
  callBtnIcon: { fontSize: 28 },
  callBtnLabel: { fontSize: 11, fontWeight: '600' },
})
