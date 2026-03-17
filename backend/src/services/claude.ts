import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ClaudeAnalysisInput {
  domain: string
  businessName?: string
  contactName?: string
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number }
  failingAudits: string[]
  loadTime: string
  niche: string
  language: string
  aigencyIssues: string[]
  pricingConfig?: {
    basePrices?: Record<string, number>
    bundleDiscount?: number
  }
}

export async function analyzeWithClaude(input: ClaudeAnalysisInput): Promise<Record<string, unknown>> {
  const prompt = `Analyze this website and return a JSON report.

Domain: ${input.domain}
Business: ${input.businessName || 'Unknown'}
Niche: ${input.niche}
Language market: ${input.language}
Performance: ${input.scores.performance}/100
Accessibility: ${input.scores.accessibility}/100
Best Practices: ${input.scores.bestPractices}/100
SEO: ${input.scores.seo}/100
Load time: ${input.loadTime}
Failing audits: ${input.failingAudits.join(', ')}
Known issues: ${input.aigencyIssues.join(', ')}
Bundle discount: ${input.pricingConfig?.bundleDiscount || 25}%

Return ONLY valid JSON with this structure:
{
  "summary": "2 sentence summary",
  "grade": "A|B|C|D|F",
  "issues": [{"id":"1","title":"...","severity":"critical|warning|info","description":"..."}],
  "roiAnalysis": {"monthlyLoss":0,"annualLoss":0,"potentialGain":0,"grade":"D","summary":"..."},
  "dynamicPricing": {
    "services": [{"name":"...","price":0,"included":true}],
    "bundlePrice": 0,
    "bundleDiscount": 25,
    "monthlyRecurring": 0
  },
  "outreach": {
    "FR": {"subject":"...","body":"..."},
    "DE": {"subject":"...","body":"..."},
    "AR": {"subject":"...","body":"..."},
    "EN": {"subject":"...","body":"..."}
  },
  "followUp1": {
    "FR": {"subject":"...","body":"..."},
    "DE": {"subject":"...","body":"..."},
    "AR": {"subject":"...","body":"..."},
    "EN": {"subject":"...","body":"..."}
  },
  "followUp2": {
    "FR": {"subject":"...","body":"..."},
    "DE": {"subject":"...","body":"..."},
    "AR": {"subject":"...","body":"..."},
    "EN": {"subject":"...","body":"..."}
  }
}`

  let attempt = 0
  while (attempt < 2) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0,
        system: 'You are the AI engine of AmanaHub Command Center, a professional digital agency operating system. Always respond with valid JSON only.',
        messages: [{ role: 'user', content: prompt }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      return JSON.parse(jsonMatch[0])
    } catch (err: any) {
      attempt++
      if (attempt >= 2) throw new Error(`Claude analysis failed: ${err.message}`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }
  throw new Error('Claude unreachable')
}
