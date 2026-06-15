import { MetadataRoute } from 'next';

const BASE_URL = 'https://pmpillar.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const marketing: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // Platform features
    {
      url: `${BASE_URL}/platform/qr-portal`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/platform/ai-concierge`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/platform/property-guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/platform/work-orders`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/platform/late-checkout`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },

    // Solutions
    {
      url: `${BASE_URL}/solutions/vacation-rentals`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${BASE_URL}/solutions/airbnb-hosts`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${BASE_URL}/solutions/residential`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${BASE_URL}/solutions/hotels`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },

    // Legal & support
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/sms-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return marketing;
}
