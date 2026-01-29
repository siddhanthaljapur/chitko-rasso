import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import MenuItemModel from '@/models/MenuItem';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://chitkorasso.com';

    // Static routes
    const routes = [
        '',
        '/menu',
        '/about',
        '/terms',
        '/privacy',
        '/faq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes (Categories)
    await dbConnect();
    const menuItems = await MenuItemModel.find({}).select('category');
    const categories = Array.from(new Set(menuItems.map(item => item.category))).map(category => ({
        url: `${baseUrl}/menu?category=${category.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...categories];
}
