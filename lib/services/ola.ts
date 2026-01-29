// Types for Ola API
interface OlaConfig {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    autoAssign: boolean;
}

const OLA_CONFIG_KEY = 'chitko_ola_config';

export interface CourierInfo {
    name: string;
    phone: string;
    trackingUrl: string;
    courierId: string;
    vehicleType: 'bike' | 'scooter';
    provider: 'OLA';
}

class OlaService {
    private config: OlaConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): OlaConfig {
        if (typeof window === 'undefined') return { enabled: false, clientId: '', clientSecret: '', autoAssign: false };

        const stored = localStorage.getItem(OLA_CONFIG_KEY);
        // Note: We are migrating to Cloud Settings, so this LocalStorage fallback is temporary
        // In full verified state, we should fetch from API in components, 
        // but for service class instantiation which is synchronous, we might need a different pattern 
        // or just accept that this service might be initialized with defaults until components push config to it.
        return stored ? JSON.parse(stored) : { enabled: false, clientId: '', clientSecret: '', autoAssign: false };
    }

    public saveConfig(config: OlaConfig) {
        this.config = config;
        // Legacy local save for fallback
        localStorage.setItem(OLA_CONFIG_KEY, JSON.stringify(config));
    }

    public getConfig(): OlaConfig {
        return this.config;
    }

    public isEnabled(): boolean {
        return this.config.enabled;
    }

    public isAutoAssignEnabled(): boolean {
        return this.config.enabled && this.config.autoAssign;
    }

    public async createDelivery(order: any): Promise<CourierInfo | null> {
        if (!this.config.enabled) return null;

        console.log("Creating Ola Booking for Order:", order.orderNumber);

        // Simulation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockRiders = [
            { name: "Suresh Kumar", vehicle: "bike" },
            { name: "Rajesh Singh", vehicle: "scooter" },
            { name: "Amit Patel", vehicle: "bike" }
        ];
        const randomRider = mockRiders[Math.floor(Math.random() * mockRiders.length)];

        return {
            name: randomRider.name,
            phone: "+91 98765 43210",
            trackingUrl: `https://ola.fleet.com/track/${order.orderNumber}`,
            courierId: `ola_${Math.random().toString(36).substr(2, 9)}`,
            vehicleType: randomRider.vehicle as any,
            provider: 'OLA'
        };
    }
}

export const olaService = new OlaService();
