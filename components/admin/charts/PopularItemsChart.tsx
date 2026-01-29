'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useState, useEffect } from 'react';

interface PopularItemsChartProps {
    data: { name: string; quantity: number }[];
}

const COLORS = ['#ff6b35', '#ffc857', '#10b981', '#3b82f6', '#8b5cf6'];

export default function PopularItemsChart({ data }: PopularItemsChartProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div style={{ height: '400px', background: '#f9fafb', borderRadius: '16px' }} />;

    return (
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '420px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937', fontSize: '1.25rem' }}>Top 5 Popular Items 🔥</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
