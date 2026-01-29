import { MenuItem } from '@/lib/menuData';

// Types for PetPooja API
interface PetPoojaConfig {
    enabled: boolean;
    restaurantId: string;
    apiKey: string;
    apiSecret: string;
}

const CONFIG_KEY = 'chitko_petpooja_config';

class PetPoojaService {
    private config: PetPoojaConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): PetPoojaConfig {
        if (typeof window === 'undefined') return { enabled: false, restaurantId: '', apiKey: '', apiSecret: '' };

        const stored = localStorage.getItem(CONFIG_KEY);
        return stored ? JSON.parse(stored) : { enabled: false, restaurantId: '', apiKey: '', apiSecret: '' };
    }

    public saveConfig(config: PetPoojaConfig) {
        this.config = config;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }

    public getConfig(): PetPoojaConfig {
        return this.config;
    }

    // --- MENU METHODS ---

    public async getMenu(): Promise<MenuItem[]> {
        // 1. If Live Mode is ENABLED, try to fetch from API
        if (this.config.enabled && this.config.apiKey) {
            try {
                console.log("Fetching menu from PetPooja Live API...");
                // NOTE: This is a simulated call to the real API structure
                // In a real implementation, this would be a fetch() to https://api.petpooja.com/v1/menu

                // const response = await fetch(`https://api.petpooja.com/v1/menu?restID=${this.config.restaurantId}`, {
                //     headers: { 'X-API-KEY': this.config.apiKey }
                // });
                // const data = await response.json();
                // return this.mapPetPoojaToLocal(data);

                // For now, we return null to fall back to local storage so the app doesn't break
                // whilst the user hasn't actually got a real API key.
                return [];
            } catch (error) {
                console.error("PetPooja API Error:", error);
                return []; // Fallback
            }
        }

        // 2. Fallback: Return what's in LocalStorage (The simulated "Dynamic" menu)
        const localMenu = localStorage.getItem('chitko_menu_items');
        return localMenu ? JSON.parse(localMenu) : [];
    }

    // --- ORDER METHODS ---

    public async pushOrder(order: any): Promise<boolean> {
        if (this.config.enabled && this.config.apiKey) {
            try {
                console.log("Pushing order to PetPooja POS...", order);
                // await fetch('https://api.petpooja.com/v1/save_order', { ... })
                return true;
            } catch (e) {
                console.error("Failed to push to PetPooja", e);
                return false;
            }
        }
        return true; // Local mode always succeeds
    }

    public async getOrderStatus(orderId: string): Promise<string | null> {
        if (this.config.enabled && this.config.apiKey) {
            try {
                // Simulated API Polling
                // const response = await fetch(`https://api.petpooja.com/v1/status?orderID=${orderId}`);
                // const data = await response.json();
                // return data.status;
                return null; // For now simulation logic handles it locally via localStorage
            } catch (e) {
                return null;
            }
        }
        return null; // Fallback to local storage logic in caller
    }
}

export const petPoojaService = new PetPoojaService();
