export function exportToPDF(domain: string): void {
  const date = new Date().toISOString().split('T')[0]
  const originalTitle = document.title
  document.title = `AmanaHub_Audit_${domain}_${date}`
  window.print()
  document.title = originalTitle
}
