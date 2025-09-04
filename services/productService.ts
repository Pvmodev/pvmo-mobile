import { apiService } from './api';

export interface ProductData {
    collectionKey: string;
    name: string;
    type: string;
    description: string;
    imageList: string[];
    videoUrl: string[];
    tag: string[];
    storageP: number;
    storageM: number;
    storageG: number;
    storageU: number;
    storageChild?: number;
    storagePP?: number;
    storageGG?: number;
    storageEXG?: number;
    storageLocation: string;
    price: number;
    discount: number;
    featured: boolean;
    isActive: boolean;
    sponsor: string;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    correlated: string[];
    marketAffiliateIds: string[];
    analytics: {
        views: number;
        sales: number;
        addCart: number;
        review: number;
    };
}

export interface Product extends ProductData {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

class ProductService {
    async createProduct(storeId: string, productData: ProductData, token: string): Promise<Product> {
        console.log('🛍️ [Product Service] Criando produto para loja:', storeId);

        try {
            const endpoint = `/stores/${storeId}/collections/items`;
            const response = await apiService.post<Product>(endpoint, productData, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao criar produto');
            }

            console.log('✅ [Product Service] Produto criado com sucesso:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('❌ [Product Service] Erro ao criar produto:', error);
            throw error;
        }
    }

    async getProducts(storeId: string, collectionKey?: string, token?: string): Promise<Product[]> {
        console.log('📋 [Product Service] Buscando produtos para loja:', storeId);

        try {
            let endpoint = `/stores/${storeId}/collections/items`;
            if (collectionKey) {
                endpoint += `?collection=${collectionKey}`;
            }

            const response = await apiService.get<Product[]>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar produtos');
            }

            console.log('✅ [Product Service] Produtos encontrados:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ [Product Service] Erro ao buscar produtos:', error);
            throw error;
        }
    }

    async getProduct(storeId: string, productId: string, token?: string): Promise<Product> {
        console.log('🔍 [Product Service] Buscando produto:', productId);

        try {
            const endpoint = `/stores/${storeId}/collections/items/${productId}`;
            const response = await apiService.get<Product>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Produto não encontrado');
            }

            console.log('✅ [Product Service] Produto encontrado:', response.data.name);
            return response.data;
        } catch (error) {
            console.error('❌ [Product Service] Erro ao buscar produto:', error);
            throw error;
        }
    }

    async updateProduct(
        storeId: string,
        productId: string,
        productData: Partial<ProductData>,
        token: string
    ): Promise<Product> {
        console.log('📝 [Product Service] Atualizando produto:', productId);

        try {
            const endpoint = `/stores/${storeId}/collections/items/${productId}`;
            const response = await apiService.put<Product>(endpoint, productData, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao atualizar produto');
            }

            console.log('✅ [Product Service] Produto atualizado com sucesso');
            return response.data;
        } catch (error) {
            console.error('❌ [Product Service] Erro ao atualizar produto:', error);
            throw error;
        }
    }

    async deleteProduct(storeId: string, productId: string, token: string): Promise<void> {
        console.log('🗑️ [Product Service] Deletando produto:', productId);

        try {
            const endpoint = `/stores/${storeId}/collections/items/${productId}`;
            const response = await apiService.delete(endpoint, token);

            if (!response.success) {
                throw new Error(response.message || 'Erro ao deletar produto');
            }

            console.log('✅ [Product Service] Produto deletado com sucesso');
        } catch (error) {
            console.error('❌ [Product Service] Erro ao deletar produto:', error);
            throw error;
        }
    }

    async toggleProductStatus(
        storeId: string,
        productId: string,
        isActive: boolean,
        token: string
    ): Promise<Product> {
        console.log('🔄 [Product Service] Alterando status do produto:', productId, isActive);

        try {
            return await this.updateProduct(storeId, productId, { isActive }, token);
        } catch (error) {
            console.error('❌ [Product Service] Erro ao alterar status:', error);
            throw error;
        }
    }

    async toggleFeaturedStatus(
        storeId: string,
        productId: string,
        featured: boolean,
        token: string
    ): Promise<Product> {
        console.log('⭐ [Product Service] Alterando destaque do produto:', productId, featured);

        try {
            return await this.updateProduct(storeId, productId, { featured }, token);
        } catch (error) {
            console.error('❌ [Product Service] Erro ao alterar destaque:', error);
            throw error;
        }
    }

    async updateProductStock(
        storeId: string,
        productId: string,
        stockData: {
            storageP?: number;
            storageM?: number;
            storageG?: number;
            storageU?: number;
            storageChild?: number;
            storagePP?: number;
            storageGG?: number;
            storageEXG?: number;
        },
        token: string
    ): Promise<Product> {
        console.log('📦 [Product Service] Atualizando estoque do produto:', productId);

        try {
            return await this.updateProduct(storeId, productId, stockData, token);
        } catch (error) {
            console.error('❌ [Product Service] Erro ao atualizar estoque:', error);
            throw error;
        }
    }

    async searchProducts(
        storeId: string,
        searchTerm: string,
        filters?: {
            collectionKey?: string;
            isActive?: boolean;
            featured?: boolean;
            minPrice?: number;
            maxPrice?: number;
            tags?: string[];
        },
        token?: string
    ): Promise<Product[]> {
        console.log('🔎 [Product Service] Pesquisando produtos:', searchTerm);

        try {
            let endpoint = `/stores/${storeId}/collections/items/search?q=${encodeURIComponent(searchTerm)}`;

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (Array.isArray(value)) {
                            endpoint += `&${key}=${value.join(',')}`;
                        } else {
                            endpoint += `&${key}=${value}`;
                        }
                    }
                });
            }

            const response = await apiService.get<Product[]>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro na pesquisa');
            }

            console.log('✅ [Product Service] Produtos encontrados na pesquisa:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ [Product Service] Erro na pesquisa:', error);
            throw error;
        }
    }

    // Utilitários para formatação
    formatPrice(price: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    calculateDiscountedPrice(price: number, discount: number): number {
        return price - (price * discount / 100);
    }

    formatDiscountedPrice(price: number, discount: number): string {
        const discountedPrice = this.calculateDiscountedPrice(price, discount);
        return this.formatPrice(discountedPrice);
    }

    getTotalStock(product: Product): number {
        return (product.storageP || 0) +
            (product.storageM || 0) +
            (product.storageG || 0) +
            (product.storageU || 0) +
            (product.storageChild || 0) +
            (product.storagePP || 0) +
            (product.storageGG || 0) +
            (product.storageEXG || 0);
    }

    getStockBySize(product: Product): { [size: string]: number } {
        return {
            'PP': product.storagePP || 0,
            'P': product.storageP || 0,
            'M': product.storageM || 0,
            'G': product.storageG || 0,
            'GG': product.storageGG || 0,
            'EXG': product.storageEXG || 0,
            'U': product.storageU || 0,
            'Infantil': product.storageChild || 0,
        };
    }

    isLowStock(product: Product, threshold: number = 5): boolean {
        return this.getTotalStock(product) <= threshold;
    }

    isOutOfStock(product: Product): boolean {
        return this.getTotalStock(product) === 0;
    }
}

export const productService = new ProductService();