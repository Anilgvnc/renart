export interface Product {
    name: string;
    popularityScore: number;
    weight: number;
    images: Images;
    price: number | null;
}

interface Images {
    rose: string;
    white: string;
    yellow: string;
}

import axios from "axios";
const apiUrl = import.meta.env.VITE_APIURL
const goldPriceApi = import.meta.env.VITE_GOLD_PRICE_API;


async function fetchGoldPrice(): Promise<number> {
    try {
        const res = await axios.get(goldPriceApi);
        const goldEntry = res.data.rates.USDXAU;
        const goldPrice = goldEntry / 31.1035;

        if (!goldPrice) {
            throw new Error("Gold price not found");
        }

        return parseFloat(goldPrice.toFixed(2));
    } catch (error) {
        console.warn("Failed to fetch gold price, using fallback price:", error);
        return 0;
    }
}

async function fetchProducts(): Promise<Product[]> {
    try {
        const [productResponse, goldPrice] = await Promise.all([
            axios.get<Product[]>(`${apiUrl}.json`),
            fetchGoldPrice()
        ]);

        const products = productResponse.data;

        if (!Array.isArray(products)) {
            throw new Error("Invalid product data format");
        }

        const updatedProducts = products.map(product => ({
            ...product,
            popularityScore: product.popularityScore * 5,
            price: (product.popularityScore + 1) * product.weight * goldPrice
        }));

        return updatedProducts;

    } catch (error) {
        console.error("Unexpected error: ", error);
        throw error;
    }
}
export { fetchProducts, fetchGoldPrice };