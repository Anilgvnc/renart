export interface Product {
    name: string;
    popularityScore: number;
    weight: number;
    images: Images;
    price?: number;
}

interface Images {
    rose: string;
    white: string;
    yellow: string;
}

import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || "https://case-study-anilgvnc-default-rtdb.europe-west1.firebasedatabase.app/";
const goldPriceApi = "https://api.metalpriceapi.com/v1/latest?api_key=b10a9179365deeaaeb6e9fb24332a246&base=USD&currencies=EUR,XAU";


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