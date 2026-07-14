import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions
} from 'react-native'
import type { CallStatus } from '../hooks/useSIP'

const { width, height } = Dimensions.get('window')

const COLORS = {
  background: '#040e1a',
  cyan: '#00e5ff',
  green: '#34C759',
  red: '#FF3B30',
  foreground: '#FFFFFF',
  muted: 'rgba(255,255,255,0.5)',
  amber: '#FF9500',
  buttonBg: 'rgba(255,255,255,0.15)',
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
  const isOutgoing = !isIncoming

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const initials = number
    ?.replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase() || 'LT'

  const statusLabel = () => {
    switch (callStatus) {
      case 'calling': return 'Calling...'
      case 'ringing': return isIncoming ? 'Incoming Call' : 'Ringing...'
      case 'connected': return fmt(callDuration)
      case 'ended': return 'Call Ended'
      default: return ''
    }
  }

  // DTMF Keypad full screen
  if (showKeypad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.dtmfHeader}>
          <TouchableOpacity onPress={() => setShowKeypad(false)} style={styles.dtmfBack}>
            <Text style={styles.dtmfBackText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.dtmfDisplay}>{dtmf || ' '}</Text>
        </View>
        <View style={styles.dtmfKeypad}>
          {[['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']].map((row, ri) => (
            <View key={ri} style={styles.dtmfRow}>
              {row.map(k => (
                <TouchableOpacity
                  key={k}
                  onPress={() => setDtmf(d => d + k)}
                  style={styles.dtmfKey}
                  activeOpacity={0.6}
                >
                  <Text style={styles.dtmfKeyText}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.endCallCenter}>
          <TouchableOpacity onPress={onEnd} style={styles.endCallBig} activeOpacity={0.8}>
            <Text style={styles.endCallBigIcon}>📵</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top - caller info */}
      <View style={styles.topSection}>
        <Text style={styles.callStatusLabel}>{isIncoming ? 'INCOMING CALL' : connected ? 'ACTIVE CALL' : 'CALLING'}</Text>

        {/* Avatar */}
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
            <Text style={styles.holdText}>⏸ ON HOLD</Text>
          </View>
        )}
      </View>

      {/* Middle - action buttons when connected */}
      {connected && (
        <View style={styles.actionsGrid}>
          {[
            { icon: '🎤', label: muted ? 'Unmute' : 'Mute', active: muted, fn: onToggleMute },
            { icon: '🔊', label: 'Speaker', active: speaker, fn: () => setSpeaker(s => !s) },
            { icon: '⌨️', label: 'Keypad', active: false, fn: () => setShowKeypad(true) },
            { icon: '⏸', label: onHold ? 'Resume' : 'Hold', active: onHold, fn: onToggleHold },
            { icon: '➕', label: 'Add', active: false, fn: () => {} },
            { icon: '↗️', label: 'Transfer', active: false, fn: () => {} },
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
            {/* Decline */}
            <View style={styles.callBtnGroup}>
              <TouchableOpacity onPress={onEnd} style={[styles.callCircleBtn, styles.declineCircle]} activeOpacity={0.8}>
                <Text style={styles.callCircleIcon}>📵</Text>
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: COLORS.red }]}>Decline</Text>
            </View>
            {/* Accept */}
            <View style={styles.callBtnGroup}>
              <TouchableOpacity onPress={onAnswer} style={[styles.callCircleBtn, styles.acceptCircle]} activeOpacity={0.8}>
                <Text style={styles.callCircleIcon}>📞</Text>
              </TouchableOpacity>
              <Text style={[styles.callBtnLabel, { color: COLORS.green }]}>Accept</Text>
            </View>
          </View>
        ) : (
          // End call - big red circle centered
          <View style={styles.endCallCenter}>
            <TouchableOpacity onPress={onEnd} style={styles.endCallBig} activeOpacity={0.8}>
              <Text style={styles.endCallBigIcon}>📵</Text>
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

  // Top
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  callStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
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
  avatarText: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.cyan,
  },
  callerNumber: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.foreground,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  callTimer: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
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
  holdText: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  actionBtn: {
    width: (width - 48 - 24) / 3,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: COLORS.buttonBg,
    alignItems: 'center',
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(0,229,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.4)',
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },

  // Bottom
  bottomSection: {
    paddingBottom: 52,
    paddingTop: 16,
    alignItems: 'center',
  },

  // Incoming
  incomingRow: {
    flexDirection: 'row',
    gap: 72,
    alignItems: 'center',
  },
  callBtnGroup: {
    alignItems: 'center',
    gap: 10,
  },
  callCircleBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  declineCircle: {
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
  },
  acceptCircle: {
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
  },
  callCircleIcon: { fontSize: 30 },
  callBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // End call - big centered red button
  endCallCenter: {
    alignItems: 'center',
  },
  endCallBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: COLORS.red,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  endCallBigIcon: { fontSize: 32 },

  // DTMF
  dtmfHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  dtmfBack: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  dtmfBackText: {
    color: COLORS.cyan,
    fontSize: 15,
    fontWeight: '500',
  },
  dtmfDisplay: {
    fontSize: 32,
    color: COLORS.cyan,
    letterSpacing: 6,
    minHeight: 44,
    fontWeight: '300',
  },
  dtmfKeypad: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 12,
  },
  dtmfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dtmfKey: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtmfKeyText: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.foreground,
  },
})
