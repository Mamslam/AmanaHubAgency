export const CONCURRENCY_LIMITS = {
  pagespeed: 5,
  cheerio: 5,
  hunter: 3,
  claude: 10,
}

export const FREE_EMAIL_PROVIDERS = [
  'gmail', 'hotmail', 'yahoo', 'outlook', 'web.de',
  'gmx', 'laposte', 'orange', 'wanadoo', 'free.fr',
  'sfr.fr', 'live', 'msn', 'icloud', 'me.com',
]

export const GENERIC_EMAIL_PREFIXES = [
  'info', 'contact', 'admin', 'hello', 'bonjour',
  'support', 'noreply', 'no-reply', 'mail', 'post',
  'office', 'web', 'service', 'help', 'enquiry',
  'enquiries', 'sales', 'marketing',
]

export const CONTACT_PAGE_PATHS = [
  '/contact', '/kontakt', '/contact-us', '/contactez-nous',
  '/uber-uns', '/equipe', '/team', '/a-propos', '/about',
  '/about-us', '/ueber-uns', '/nous-contacter', '/coordonnees',
]

export const CHATBOT_SIGNATURES = [
  'tidio', 'intercom', 'crisp', 'tawk', 'hubspot',
  'zendesk', 'freshchat', 'drift', 'livechat',
]

export const ANALYTICS_SIGNATURES = [
  'gtag(', '_gaq', 'fbq(', '_paq', 'plausible',
  'hotjar', 'clarity.ms',
]
