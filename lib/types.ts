export interface MenuItem {
    _id?: string;
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string;
    isVeg: boolean;
    spiceLevel?: number;
    available: boolean;
    createdAt?: string;
    updatedAt?: string;
}
