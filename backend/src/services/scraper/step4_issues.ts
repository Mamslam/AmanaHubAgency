import type { TechnicalAudit, PlaceResult, Issue, IssueDefinition } from './types'

const ISSUE_DEFINITIONS: Record<string, IssueDefinition> = {
  no_ssl: {
    condition: (a) => !!a && !a.hasSSL,
    severity: 'critical',
    title: () => 'No SSL certificate',
    detail: () => 'Site served over HTTP. Penalized by Google and distrusted by 85% of visitors.',
    service: 'SSL Installation',
    price: 200,
    weight: 10,
  },
  performance_critical: {
    condition: (a) => !!a && a.scores.performance < 40,
    severity: 'critical',
    title: (a) => `Performance score ${a?.scores.performance}/100`,
    detail: (a) => `Page loads in ${((a?.loadTime ?? 0) / 1000).toFixed(1)}s. Every extra second costs 7% conversion rate.`,
    service: 'Performance Optimization',
    price: 597,
    weight: 9,
  },
  performance_warning: {
    condition: (a) => !!a && a.scores.performance >= 40 && a.scores.performance < 70,
    severity: 'warning',
    title: (a) => `Performance score ${a?.scores.performance}/100`,
    detail: () => 'Below industry standard of 70+.',
    service: 'Performance Optimization',
    price: 297,
    weight: 6,
  },
  seo_critical: {
    condition: (a) => !!a && a.scores.seo < 40,
    severity: 'critical',
    title: (a) => `SEO score ${a?.scores.seo}/100`,
    detail: () => 'Site is nearly invisible to Google.',
    service: 'SEO Enhancement',
    price: 1040,
    weight: 9,
  },
  seo_warning: {
    condition: (a) => !!a && a.scores.seo >= 40 && a.scores.seo < 70,
    severity: 'warning',
    title: (a) => `SEO score ${a?.scores.seo}/100`,
    detail: () => 'Significant organic traffic being lost.',
    service: 'SEO Enhancement',
    price: 800,
    weight: 5,
  },
  ai_visibility_low: {
    condition: (a) => !!a && a.aiVisibilityScore < 30,
    severity: 'critical',
    title: (a) => `AI Visibility score ${a?.aiVisibilityScore}/100`,
    detail: () => 'ChatGPT and Google AI cannot read this site. Invisible in AI-powered search.',
    service: 'AI Optimization',
    price: 500,
    weight: 8,
  },
  unclaimed_gmb: {
    condition: (_, p) => !p.claimed,
    severity: 'critical',
    title: () => 'Google Business Profile unclaimed',
    detail: () => 'Business is invisible in local Google searches.',
    service: 'GMB Optimization',
    price: 500,
    weight: 8,
  },
  no_social: {
    condition: (a) => !!a && a.hasNoSocial,
    severity: 'warning',
    title: () => 'No social media presence',
    detail: () => 'No Facebook, Instagram, LinkedIn or YouTube found.',
    service: 'Social Media Setup',
    price: 300,
    weight: 5,
  },
  free_email: {
    condition: (a) => !!a && a.hasFreeEmail,
    severity: 'warning',
    title: () => 'No professional email',
    detail: () => 'Using Gmail or Hotmail reduces trust with clients.',
    service: 'Professional Email Setup',
    price: 200,
    weight: 4,
  },
  outdated_site: {
    condition: (a) => !!a && a.isOutdated,
    severity: 'warning',
    title: (a) => `Website last updated ${a?.copyrightYear}`,
    detail: () => 'An outdated site signals an inactive business.',
    service: 'Website Redesign',
    price: 1500,
    weight: 7,
  },
  no_click_to_call: {
    condition: (a) => !!a && !a.hasClickToCall,
    severity: 'info',
    title: () => 'No click-to-call button',
    detail: () => 'Mobile visitors cannot call with one tap.',
    service: 'Click-To-Call Installation',
    price: 200,
    weight: 3,
  },
  no_chatbot: {
    condition: (a) => !!a && !a.hasChatBot,
    severity: 'info',
    title: () => 'No chatbot or live chat',
    detail: () => 'Leads leave without a way to engage instantly.',
    service: 'AI Chatbot Integration',
    price: 1200,
    weight: 3,
  },
  wordpress_outdated: {
    condition: (a) => !!a && a.isWordpressOutdated,
    severity: 'warning',
    title: (a) => `WordPress ${a?.wordpressVersion} — outdated`,
    detail: () => 'Older WordPress versions have known vulnerabilities.',
    service: 'Best Practices Fix',
    price: 297,
    weight: 4,
  },
  low_rating: {
    condition: (_, p) => p.rating !== null && p.rating < 4.0,
    severity: 'warning',
    title: (_, p) => `Google rating ${p.rating?.toFixed(1)}/5`,
    detail: () => 'Ratings below 4.0 reduce click-through by 40%.',
    service: 'Reputation Management',
    price: 350,
    weight: 5,
  },
  missing_meta: {
    condition: (a) => !!a && !a.metaDescription,
    severity: 'info',
    title: () => 'Missing meta description',
    detail: () => 'Google shows random text in search results.',
    service: 'SEO Enhancement',
    price: 0,
    weight: 2,
  },
  no_accessibility: {
    condition: (a) => !!a && a.scores.accessibility < 70,
    severity: 'info',
    title: (a) => `Accessibility score ${a?.scores.accessibility}/100`,
    detail: () => '15% of users with disabilities face barriers.',
    service: 'Accessibility Fix',
    price: 297,
    weight: 2,
  },
  no_website: {
    condition: (a) => a === null,
    severity: 'critical',
    title: () => 'No website found',
    detail: () => 'Business has no web presence — maximum opportunity.',
    service: 'Website Creation',
    price: 1997,
    weight: 9,
  },
}

export function detectIssues(audit: TechnicalAudit | null, place: PlaceResult): Issue[] {
  const issues: Issue[] = []

  for (const [key, def] of Object.entries(ISSUE_DEFINITIONS)) {
    try {
      if (def.condition(audit, place)) {
        issues.push({
          key,
          title: def.title(audit, place),
          detail: def.detail(audit, place),
          severity: def.severity,
          service: def.service,
          price: def.price,
          weight: def.weight,
        })
      }
    } catch { /* skip broken condition */ }
  }

  return issues.sort((a, b) => b.weight - a.weight)
}
