import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView
} from 'react-native'
import type { CallStatus } from '../hooks/useSIP'

const COLORS = {
  background: '#040e1a',
  cyan: '#00e5ff',
  green: '#00ff9d',
  red: '#ff3b30',
  foreground: '#e8f4ff',
  muted: 'rgba(184,210,240,0.5)',
  amber: '#ffb347',
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

  const initials = (number || 'LT')
    .replace(/[^a-zA-Z]/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0].toUpperCase())
    .join('')
    .slice(0, 2) || number?.slice(0, 2) || 'LT'

  const statusLabel = () => {
    if (callStatus === 'calling') return 'Calling...'
    if (callStatus === 'ringing') return isIncoming ? 'Incoming Call' : 'Ringing...'
    if (callStatus === 'connected') return fmt(callDuration)
    if (callStatus === 'ended') return 'Call Ended'
    return ''
  }

  // DTMF Keypad overlay
  if (showKeypad) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => setShowKeypad(false)} style={styles.backRow}>
          <Text style={styles.backText}>← Hide Keypad</Text>
        </TouchableOpacity>
        <Text style={styles.dtmfDisplay}>{dtmf || ' '}</Text>
        <View style={styles.keypad}>
          {[
            ['1','2','3'],
            ['4','5','6'],
            ['7','8','9'],
            ['*','0','#'],
          ].map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map(k => (
                <TouchableOpacity key={k} onPress={() => setDtmf(d => d + k)} style={styles.key}>
                  <Text style={styles.keyNum}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={onEnd} style={styles.endCallFull}>
          <View style={styles.endCallBtn}>
            <Text style={styles.endCallIcon}>📵</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top section - caller info */}
      <View style={styles.topSection}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.callerNumber}>{number}</Text>
        <Text style={[
          styles.callStatus,
          connected && { color: COLORS.cyan }
        ]}>
          {statusLabel()}
        </Text>
        {onHold && <Text style={styles.holdBadge}>Call on hold</Text>}
      </View>

      {/* Middle section - action buttons (only when connected) */}
      {connected && (
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            onPress={onToggleMute}
            style={[styles.actionBtn, muted && styles.actionBtnActive]}
          >
            <Text style={styles.actionBtnIcon}>🎤</Text>
            <Text style={[styles.actionBtnLabel, muted && { color: COLORS.cyan }]}>
              {muted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSpeaker(s => !s)}
            style={[styles.actionBtn, speaker && styles.actionBtnActive]}
          >
            <Text style={styles.actionBtnIcon}>🔊</Text>
            <Text style={[styles.actionBtnLabel, speaker && { color: COLORS.cyan }]}>
              Speaker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowKeypad(true)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnIcon}>⌨️</Text>
            <Text style={styles.actionBtnLabel}>Keypad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleHold}
            style={[styles.actionBtn, onHold && styles.actionBtnActive]}
          >
            <Text style={styles.actionBtnIcon}>⏸</Text>
            <Text style={[styles.actionBtnLabel, onHold && { color: COLORS.cyan }]}>
              {onHold ? 'Resume' : 'Hold'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnIcon}>👥</Text>
            <Text style={styles.actionBtnLabel}>Add Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnIcon}>↗️</Text>
            <Text style={styles.actionBtnLabel}>Transfer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom section - call control */}
      <View style={styles.bottomSection}>
        {isIncoming ? (
          // Incoming call - decline + accept
          <View style={styles.incomingButtons}>
            <View style={styles.callBtnWrap}>
              <TouchableOpacity onPress={onEnd} style={[styles.bigCallBtn, styles.declineBtn]}>
                <Text style={styles.bigCallBtnIcon}>📵</Text>
              </TouchableOpacity>
              <Text style={styles.callBtnLabel}>Decline</Text>
            </View>
            <View style={styles.callBtnWrap}>
              <TouchableOpacity onPress={onAnswer} style={[styles.bigCallBtn, styles.acceptBtn]}>
                <Text style={styles.bigCallBtnIcon}>📞</Text>
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: COLORS.green }]}>Accept</Text>
            </View>
          </View>
        ) : (
          // Outgoing/connected - single end call button centered
          <View style={styles.endCallWrap}>
            <TouchableOpacity onPress={onEnd} style={[styles.bigCallBtn, styles.declineBtn]}>
              <Text style={styles.bigCallBtnIcon}>📵</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040e1a',
  },

  // Top section
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,229,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  callerNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  callStatus: {
    fontSize: 16,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  holdBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,179,71,0.15)',
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: '600',
  },

  // Action grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    width: '30%',
    aspectRatio: 1.1,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderColor: 'rgba(0,229,255,0.25)',
  },
  actionBtnIcon: { fontSize: 24 },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  // Bottom buttons
  bottomSection: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  incomingButtons: {
    flexDirection: 'row',
    gap: 80,
    alignItems: 'center',
  },
  callBtnWrap: {
    alignItems: 'center',
    gap: 10,
  },
  endCallWrap: {
    alignItems: 'center',
  },
  bigCallBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  declineBtn: {
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
  },
  acceptBtn: {
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
  },
  bigCallBtnIcon: { fontSize: 32 },
  callBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,59,48,0.8)',
  },

  // DTMF keypad
  backRow: {
    padding: 20,
    paddingTop: 16,
  },
  backText: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: '600',
  },
  dtmfDisplay: {
    fontSize: 28,
    color: COLORS.cyan,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 24,
    minHeight: 40,
  },
  keypad: {
    paddingHorizontal: 32,
    gap: 16,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,229,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyNum: {
    fontSize: 28,
    fontWeight: '400',
    color: COLORS.foreground,
  },
  endCallFull: {
    alignItems: 'center',
    marginTop: 32,
  },
  endCallBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.red,
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  endCallIcon: { fontSize: 32 },
})
