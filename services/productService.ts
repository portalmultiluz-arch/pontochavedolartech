import type { Product, DailyOffer, PromoContent } from '../types';
import { getAllDocuments } from './firebaseService';

export async function fetchProducts(): Promise<Product[]> {
    try {
        const data = await getAllDocuments('products');
        return data as unknown as Product[];
    } catch (error) {
        console.error('Error fetching products from Firebase:', error);
        return [];
    }
}

export async function fetchDailyOffer(): Promise<DailyOffer> {
    try {
        const data = await getAllDocuments('dailyOffers');
        if (data.length > 0) return data[0] as unknown as DailyOffer;
        
        return {
            isActive: true,
            title: "Design de Interiores no Ponto Chave",
            description: "Transforme seu lar com as melhores peças selecionadas.",
            imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000",
            buttonText: "Ver Coleção",
            buttonLink: "#products"
        };
    } catch {
        return {
            isActive: true,
            title: "Design de Interiores",
            description: "Carregando a melhor oferta para você...",
            imageUrl: "",
            buttonText: "Explorar",
            buttonLink: "#"
        };
    }
}

export async function fetchPromoContent(): Promise<PromoContent[]> {
    return [];
}
