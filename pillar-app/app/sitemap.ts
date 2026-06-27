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

    // Blog
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/blog/reduce-guest-messages-rental-host`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/best-tools-vacation-rental-managers-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/digital-property-guide-what-to-include`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/best-vacation-rental-guest-portals-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/airbnb-welcome-guide-template`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/stop-guests-calling-you-airbnb`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/vacation-rental-damage-claim-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/airbnb-maintenance-requests-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/late-checkout-vacation-rental-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/vacation-rental-house-rules-template`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE_URL}/blog/ai-concierge-for-airbnb-hosts`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
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
