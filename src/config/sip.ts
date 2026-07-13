export const SIP_CONFIG = {
  domain: 'lotustelco.net',
  server: '65.21.41.12',
  wsUri: 'wss://voice.lotustelco.net:8989/ws',
  port: 5060,
  apiBase: 'https://voice.lotustelco.net',
}

// Convert username formats:
// skumar@lotustelco.net -> skumar_lotustelco.net
// skumar_lotustelco.net -> stays same
export function formatSipUser(input: string): string {
  if (input.includes('@')) return input.replace('@', '_')
  return input
}

// Get display name from SIP username
export function getDisplayName(sipUser: string): string {
  return sipUser.split('_')[0] || sipUser
}
