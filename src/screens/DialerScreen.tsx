import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Vibration, Dimensions
} from 'react-native'

const { width, height } = Dimensions.get('window')

const COLORS = {
  background: '#040e1a',
  foreground: '#FFFFFF',
  cyan: '#00e5ff',
  green: '#34C759',
  muted: 'rgba(255,255,255,0.4)',
  keyBg: 'rgba(255,255,255,0.08)',
  keyBorder: 'rgba(255,255,255,0.06)',
}

const KEYS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
  { num: '*', sub: '' },
  { num: '0', sub: '+' },
  { num: '#', sub: '' },
]

type Props = { onCall: (number: string) => void }

export default function DialerScreen({ onCall }: Props) {
  const [number, setNumber] = useState('')

  const pressKey = (k: string) => {
    Vibration.vibrate(8)
    setNumber(p => p + k)
  }

  const deleteLast = () => {
    Vibration.vibrate(8)
    setNumber(p => p.slice(0, -1))
  }

  // Key size based on screen width
  const keySize = (width - 64) / 3

  return (
    <View style={styles.container}>
      {/* Number display */}
      <View style={styles.displayArea}>
        <Text
          style={[styles.numberText, !number && styles.placeholder]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {number || 'Enter number'}
        </Text>
        {number.length > 0 && (
          <TouchableOpacity
            onPress={deleteLast}
            onLongPress={() => setNumber('')}
            style={styles.deleteBtn}
            activeOpacity={0.6}
          >
            <Text style={styles.deleteIcon}>⌫</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {[0, 1, 2, 3].map(row => (
          <View key={row} style={styles.keyRow}>
            {KEYS.slice(row * 3, row * 3 + 3).map(k => (
              <TouchableOpacity
                key={k.num}
                onPress={() => pressKey(k.num)}
                style={[styles.key, { width: keySize, height: keySize * 0.72 }]}
                activeOpacity={0.5}
              >
                <Text style={styles.keyNum}>{k.num}</Text>
                <Text style={styles.keySub}>{k.sub || ' '}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Bottom row - call button centered */}
      <View style={styles.bottomRow}>
        {/* Left spacer */}
        <View style={styles.sideSlot} />

        {/* Green call button */}
        <TouchableOpacity
          onPress={() => number && onCall(number)}
          disabled={!number}
          style={[styles.callBtn, !number && styles.callBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>

        {/* Delete button on right */}
        <View style={styles.sideSlot}>
          {number.length > 0 && (
            <TouchableOpacity
              onPress={deleteLast}
              onLongPress={() => setNumber('')}
              activeOpacity={0.6}
            >
              <Text style={styles.deleteIconBottom}>⌫</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 16,
  },

  // Number display
  displayArea: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  numberText: {
    flex: 1,
    fontSize: 44,
    fontWeight: '200',
    color: COLORS.foreground,
    textAlign: 'center',
    letterSpacing: 2,
  },
  placeholder: {
    fontSize: 18,
    color: COLORS.muted,
    letterSpacing: 0,
    fontWeight: '400',
  },
  deleteBtn: {
    position: 'absolute',
    right: 20,
    padding: 12,
  },
  deleteIcon: {
    fontSize: 24,
    color: COLORS.muted,
  },

  // Keypad
  keypad: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 4,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  key: {
    borderRadius: 100,
    backgroundColor: COLORS.keyBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.keyBorder,
  },
  keyNum: {
    fontSize: 30,
    fontWeight: '300',
    color: COLORS.foreground,
    lineHeight: 36,
  },
  keySub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 2,
    height: 13,
    marginTop: -2,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sideSlot: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.green,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  callBtnDisabled: {
    backgroundColor: 'rgba(52,199,89,0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  callIcon: { fontSize: 28 },
  deleteIconBottom: {
    fontSize: 26,
    color: COLORS.muted,
  },
})
