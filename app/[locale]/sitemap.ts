import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://amanahub.com'
  return [
    { url: `${baseUrl}/en`, lastModified: new Date() },
    { url: `${baseUrl}/fr`, lastModified: new Date() },
    { url: `${baseUrl}/de`, lastModified: new Date() },
  ]
}
