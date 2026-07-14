export const SIP_CONFIG = {
  domain: 'lotustelco.net',
  server: '65.21.41.12',
  // SIP WebSocket proxied through nginx on port 443 -> FreeSWITCH 7443
  wsUri: 'wss://voice.lotustelco.net/ws/sip',
  port: 5060,
  apiBase: 'https://voice.lotustelco.net',
}

export function formatSipUser(input: string): string {
  if (input.includes('@')) return input.replace('@', '_')
  return input
}

export function getDisplayName(sipUser: string): string {
  return sipUser.split('_')[0] || sipUser
}
