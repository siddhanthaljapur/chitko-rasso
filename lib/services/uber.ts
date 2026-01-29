// Types for Uber Direct API
interface UberConfig {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    customerId: string;
    autoAssign: boolean;
}

const UBER_CONFIG_KEY = 'chitko_uber_config';

export interface CourierInfo {
    name: string;
    phone: string;
    trackingUrl: string;
    courierId: string;
    vehicleType: 'bicycle' | 'motorcycle' | 'car';
    provider?: 'UBER';
}

class UberService {
    private config: UberConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): UberConfig {
        if (typeof window === 'undefined') return { enabled: false, clientId: '', clientSecret: '', customerId: '', autoAssign: false };

        const stored = localStorage.getItem(UBER_CONFIG_KEY);
        return stored ? JSON.parse(stored) : { enabled: false, clientId: '', clientSecret: '', customerId: '', autoAssign: false };
    }

    public saveConfig(config: UberConfig) {
        this.config = config;
        localStorage.setItem(UBER_CONFIG_KEY, JSON.stringify(config));
    }

    public getConfig(): UberConfig {
        return this.config;
    }

    public isAutoAssignEnabled(): boolean {
        return this.config.enabled && this.config.autoAssign;
    }

    public async createDelivery(order: any): Promise<CourierInfo | null> {
        if (!this.config.enabled) return null;

        console.log("Creating Uber Delivery for Order:", order.orderNumber);

        // Simulation or Real Logic
        if (this.config.clientId && this.config.clientId.startsWith('real_')) {
            // Placeholder for Real API Call
            // const token = await this.getAccessToken();
            // const delivery = await axios.post(...)
            console.log("Real API Not Implemented yet, falling back to Simulation");
        }

        // Mock Response (Simulation)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockCouriers = [
            { name: "Suresh Kumar", vehicle: "motorcycle" },
            { name: "Rahul Singh", vehicle: "motorcycle" },
            { name: "Priya Sharma", vehicle: "motorcycle" } // Changed from scooter to motorcycle
        ];
        const randomCourier = mockCouriers[Math.floor(Math.random() * mockCouriers.length)];

        return {
            name: randomCourier.name,
            phone: "+91 98765 43210",
            trackingUrl: `https://uber.com/track/order/${order.orderNumber}`,
            courierId: `ub_${Math.random().toString(36).substr(2, 9)}`,
            vehicleType: randomCourier.vehicle as any,
            provider: 'UBER'
        };
    }
}

export const uberService = new UberService();
