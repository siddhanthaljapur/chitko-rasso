import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/profile/', '/checkout/', '/track/'],
        },
        sitemap: 'https://chitkorasso.com/sitemap.xml',
    };
}
