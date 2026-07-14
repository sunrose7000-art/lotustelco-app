import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions
} from 'react-native'
import type { CallStatus } from '../hooks/useSIP'

const { width } = Dimensions.get('window')

const COLORS = {
  background: '#040e1a',
  cyan: '#00e5ff',
  green: '#34C759',
  red: '#FF3B30',
  foreground: '#FFFFFF',
  muted: 'rgba(255,255,255,0.5)',
  amber: '#FF9500',
  buttonBg: 'rgba(255,255,255,0.12)',
}

// Simple phone icon SVGs as text replacements
const PhoneOff = () => (
  <View style={endCallIconStyle}>
    <View style={[phoneBar, { transform: [{ rotate: '135deg' }], width: 28, top: 14 }]} />
    <View style={phoneBase} />
  </View>
)

const endCallIconStyle = {
  width: 36,
  height: 36,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}
const phoneBar = {
  position: 'absolute' as const,
  height: 4,
  width: 24,
  backgroundColor: '#fff',
  borderRadius: 2,
}
const phoneBase = {
  width: 28,
  height: 28,
  borderRadius: 14,
  borderWidth: 4,
  borderColor: '#fff',
  borderTopWidth: 0,
  borderLeftWidth: 0,
  transform: [{ rotate: '45deg' }],
}

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
  const [speaker, setSpeaker] = useState(false)
  const [showKeypad, setShowKeypad] = useState(false)
  const [dtmf, setDtmf] = useState('')

  const connected = callStatus === 'connected'
  const isIncoming = type === 'incoming' && callStatus === 'ringing'

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const initials = (number || '').replace(/\D/g, '').slice(-4, -2) || 'LT'

  const statusLabel = () => {
    switch (callStatus) {
      case 'calling': return 'Calling...'
      case 'ringing': return isIncoming ? 'Incoming Call' : 'Ringing...'
      case 'connected': return fmt(callDuration)
      case 'ended': return 'Call Ended'
      default: return ''
    }
  }

  if (showKeypad) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => setShowKeypad(false)} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.dtmfDisplay}>{dtmf || ' '}</Text>
        <View style={styles.dtmfGrid}>
          {[['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']].map((row, ri) => (
            <View key={ri} style={styles.dtmfRow}>
              {row.map(k => (
                <TouchableOpacity key={k} onPress={() => setDtmf(d => d + k)} style={styles.dtmfKey}>
                  <Text style={styles.dtmfKeyText}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.endCallCenter}>
          <TouchableOpacity onPress={onEnd} style={styles.endCallBtn} activeOpacity={0.8}>
            <View style={styles.endCallInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top - caller info */}
      <View style={styles.topSection}>
        <Text style={styles.callStatusLabel}>
          {isIncoming ? 'INCOMING CALL' : connected ? 'ACTIVE CALL' : 'CALLING'}
        </Text>

        <View style={styles.avatarOuter}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.callerNumber}>{number}</Text>
        <Text style={[styles.callTimer, connected && { color: COLORS.cyan }]}>
          {statusLabel()}
        </Text>

        {onHold && (
          <View style={styles.holdBadge}>
            <Text style={styles.holdText}>ON HOLD</Text>
          </View>
        )}
      </View>

      {/* Action buttons when connected */}
      {connected && (
        <View style={styles.actionsGrid}>
          {[
            { label: muted ? 'Unmute' : 'Mute', active: muted, fn: onToggleMute, icon: muted ? '🚫' : '🎤' },
            { label: 'Speaker', active: speaker, fn: () => setSpeaker(s => !s), icon: '🔊' },
            { label: 'Keypad', active: false, fn: () => setShowKeypad(true), icon: '⌨️' },
            { label: onHold ? 'Resume' : 'Hold', active: onHold, fn: onToggleHold, icon: '⏸' },
            { label: 'Add', active: false, fn: () => {}, icon: '➕' },
            { label: 'Transfer', active: false, fn: () => {}, icon: '↗️' },
          ].map(a => (
            <TouchableOpacity
              key={a.label}
              onPress={a.fn}
              style={[styles.actionBtn, a.active && styles.actionBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionLabel, a.active && { color: COLORS.cyan }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom - call buttons */}
      <View style={styles.bottomSection}>
        {isIncoming ? (
          <View style={styles.incomingRow}>
            <View style={styles.callBtnWrap}>
              <TouchableOpacity onPress={onEnd} style={[styles.callCircle, styles.redCircle]} activeOpacity={0.8}>
                <View style={styles.hangupIcon} />
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: COLORS.red }]}>Decline</Text>
            </View>
            <View style={styles.callBtnWrap}>
              <TouchableOpacity onPress={onAnswer} style={[styles.callCircle, styles.greenCircle]} activeOpacity={0.8}>
                <Text style={{ fontSize: 28 }}>📞</Text>
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: COLORS.green }]}>Accept</Text>
            </View>
          </View>
        ) : (
          <View style={styles.endCallCenter}>
            <TouchableOpacity onPress={onEnd} style={[styles.callCircle, styles.redCircle]} activeOpacity={0.8}>
              <View style={styles.hangupIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

// Hangup icon — horizontal bar (like a phone receiver rotated)
const HangupIcon = () => (
  <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 28,
      height: 5,
      backgroundColor: '#fff',
      borderRadius: 3,
      transform: [{ rotate: '135deg' }],
    }} />
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  callStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
    marginBottom: 32,
  },
  avatarOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(0,229,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(0,229,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: '300', color: COLORS.cyan },
  callerNumber: {
    fontSize: 26,
    fontWeight: '300',
    color: COLORS.foreground,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  callTimer: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  holdBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,149,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.3)',
  },
  holdText: { color: COLORS.amber, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  // Action grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  actionBtn: {
    width: (width - 64) / 3,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: COLORS.buttonBg,
    alignItems: 'center',
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(0,229,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
  },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },

  // Bottom buttons
  bottomSection: {
    paddingBottom: 52,
    paddingTop: 16,
    alignItems: 'center',
  },
  incomingRow: { flexDirection: 'row', gap: 72, alignItems: 'center' },
  callBtnWrap: { alignItems: 'center', gap: 10 },
  endCallCenter: { alignItems: 'center' },

  // Circle button
  callCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  redCircle: { backgroundColor: COLORS.red, shadowColor: COLORS.red },
  greenCircle: { backgroundColor: COLORS.green, shadowColor: COLORS.green },
  callBtnLabel: { fontSize: 13, fontWeight: '600' },

  // Hangup icon inside red button
  hangupIcon: {
    width: 36,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    transform: [{ rotate: '135deg' }],
  },

  // DTMF
  backRow: { padding: 20 },
  backText: { color: COLORS.cyan, fontSize: 15, fontWeight: '500' },
  dtmfDisplay: {
    fontSize: 32,
    color: COLORS.cyan,
    letterSpacing: 6,
    minHeight: 44,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  dtmfGrid: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', gap: 12 },
  dtmfRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dtmfKey: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtmfKeyText: { fontSize: 28, fontWeight: '300', color: COLORS.foreground },
  endCallBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: COLORS.red,
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  endCallInner: {
    width: 36,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    transform: [{ rotate: '135deg' }],
  },
})
