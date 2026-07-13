export const SIP_CONFIG = {
  domain: 'lotustelco.net',
  server: '65.21.41.12',
  wsUri: 'wss://voice.lotustelco.net:8989/ws',
  port: 5060,
  usernameFormat: (user: string) => {
    // Convert email format to SIP format if needed
    // skumar@lotustelco.net -> skumar_lotustelco.net
    if (user.includes('@')) {
      return user.replace('@', '_')
    }
    return user
  }
}
