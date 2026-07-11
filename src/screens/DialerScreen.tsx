import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../config/theme'

const KEYS = [
  { num: '1', sub: '' }, { num: '2', sub: 'ABC' }, { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' }, { num: '5', sub: 'JKL' }, { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' }, { num: '8', sub: 'TUV' }, { num: '9', sub: 'WXYZ' },
  { num: '*', sub: '' }, { num: '0', sub: '+' }, { num: '#', sub: '' },
]

type Props = { onCall: (number: string) => void }

export default function DialerScreen({ onCall }: Props) {
  const [number, setNumber] = useState('')

  const press = (k: string) => {
    Vibration.vibrate(10)
    setNumber(p => p + k)
  }

  const del = () => {
    Vibration.vibrate(10)
    setNumber(p => p.slice(0, -1))
  }

  return (
    <View style={styles.container}>
      {/* Number display */}
      <View style={styles.display}>
        <Text style={[styles.number, !number && styles.placeholder]}>
          {number || 'Enter number'}
        </Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map(k => (
          <TouchableOpacity
            key={k.num}
            onPress={() => press(k.num)}
            style={styles.key}
            activeOpacity={0.7}
          >
            <Text style={styles.keyNum}>{k.num}</Text>
            {k.sub ? <Text style={styles.keySub}>{k.sub}</Text> : <Text style={styles.keySubEmpty}> </Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View style={{ width: 52 }} />
        <TouchableOpacity
          onPress={() => number && onCall(number)}
          disabled={!number}
          style={[styles.callBtn, !number && styles.callBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={del} style={styles.deleteBtn} activeOpacity={0.7}>
          <Text style={{ fontSize: 20, color: COLORS.muted }}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24, paddingTop: 20 },
  display: { height: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  number: { fontSize: 36, fontWeight: '300', color: COLORS.cyan, letterSpacing: 4 },
  placeholder: { fontSize: 16, color: COLORS.muted, letterSpacing: 0 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  key: { width: '30%', aspectRatio: 1.5, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(0,229,255,0.05)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.1)' },
  keyNum: { fontSize: 24, fontWeight: '600', color: COLORS.foreground },
  keySub: { fontSize: 9, fontWeight: '700', color: COLORS.muted, letterSpacing: 2, marginTop: 2 },
  keySubEmpty: { height: 13 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 8 },
  callBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: COLORS.green, shadowRadius: 15, shadowOpacity: 0.5 },
  callBtnDisabled: { backgroundColor: 'rgba(0,255,157,0.2)', shadowOpacity: 0 },
  callIcon: { fontSize: 26 },
  deleteBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
})
