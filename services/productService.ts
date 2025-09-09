import { API_CONFIG } from '@/config/api';
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

// Interface para resposta da API
interface ProductListResponse {
    items: Product[];
    total: number;
    page: number;
    totalPages: number;
    collectionKey?: string;
}

class ProductService {
    // CORRIGIDO: Usar storeSlug em vez de storeId
    async createProduct(storeSlug: string, productData: ProductData, token: string): Promise<Product> {
        console.log('Criando produto para loja:', storeSlug);

        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.CREATE_PLATFORM(storeSlug);
            const response = await apiService.post<Product>(endpoint, productData, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao criar produto');
            }

            console.log('Produto criado com sucesso:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw error;
        }
    }

    // CORRIGIDO: Usar nova estrutura de resposta da API
    async getProducts(
        storeSlug: string,
        options: {
            collectionKey?: string;
            page?: number;
            limit?: number;
            isActive?: boolean;
            featured?: boolean;
            search?: string;
        } = {},
        token?: string
    ): Promise<ProductListResponse> {
        console.log('Buscando produtos para loja:', storeSlug);

        try {
            const { page = 1, limit = 20, collectionKey, isActive, featured, search } = options;

            // Construir query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            if (collectionKey) queryParams.append('collectionKey', collectionKey);
            if (isActive !== undefined) queryParams.append('isActive', isActive.toString());
            if (featured !== undefined) queryParams.append('featured', featured.toString());
            if (search) queryParams.append('search', search);

            let endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.ITEMS(storeSlug);
            if (token) {
                // Se tem token, usar endpoint administrativo que mostra todos os produtos
                endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.ADMIN_ALL(storeSlug);
            }

            endpoint += `?${queryParams.toString()}`;

            const response = await apiService.get<ProductListResponse>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar produtos');
            }

            console.log('Produtos encontrados:', response.data.total);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            throw error;
        }
    }

    async getProduct(storeSlug: string, productId: string, token?: string): Promise<Product> {
        console.log('Buscando produto:', productId);

        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.COLLECTIONS.ITEMS(storeSlug)}/${productId}`;
            const response = await apiService.get<Product>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Produto não encontrado');
            }

            console.log('Produto encontrado:', response.data.name);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            throw error;
        }
    }

    async updateProduct(
        storeSlug: string,
        productId: string,
        productData: Partial<ProductData>,
        token: string
    ): Promise<Product> {
        console.log('Atualizando produto:', productId);

        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.COLLECTIONS.CREATE_PLATFORM(storeSlug)}/${productId}`;
            const response = await apiService.patch<Product>(endpoint, productData, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao atualizar produto');
            }

            console.log('Produto atualizado com sucesso');
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    async deleteProduct(storeSlug: string, productId: string, token: string): Promise<void> {
        console.log('Deletando produto:', productId);

        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.COLLECTIONS.CREATE_PLATFORM(storeSlug)}/${productId}`;
            const response = await apiService.delete(endpoint, token);

            if (!response.success) {
                throw new Error(response.message || 'Erro ao deletar produto');
            }

            console.log('Produto deletado com sucesso');
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            throw error;
        }
    }

    async toggleProductStatus(
        storeSlug: string,
        productId: string,
        isActive: boolean,
        token: string
    ): Promise<Product> {
        console.log('Alterando status do produto:', productId, isActive);

        try {
            return await this.updateProduct(storeSlug, productId, { isActive }, token);
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            throw error;
        }
    }

    async toggleFeaturedStatus(
        storeSlug: string,
        productId: string,
        featured: boolean,
        token: string
    ): Promise<Product> {
        console.log('Alterando destaque do produto:', productId, featured);

        try {
            return await this.updateProduct(storeSlug, productId, { featured }, token);
        } catch (error) {
            console.error('Erro ao alterar destaque:', error);
            throw error;
        }
    }

    async updateProductStock(
        storeSlug: string,
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
        console.log('Atualizando estoque do produto:', productId);

        try {
            return await this.updateProduct(storeSlug, productId, stockData, token);
        } catch (error) {
            console.error('Erro ao atualizar estoque:', error);
            throw error;
        }
    }

    async searchProducts(
        storeSlug: string,
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
        console.log('Pesquisando produtos:', searchTerm);

        try {
            const response = await this.getProducts(
                storeSlug,
                {
                    search: searchTerm,
                    collectionKey: filters?.collectionKey,
                    isActive: filters?.isActive,
                    featured: filters?.featured,
                },
                token
            );

            let products = response.items;

            // Aplicar filtros adicionais que a API não suporta
            if (filters?.minPrice !== undefined) {
                products = products.filter(p => p.price >= filters.minPrice!);
            }
            if (filters?.maxPrice !== undefined) {
                products = products.filter(p => p.price <= filters.maxPrice!);
            }
            if (filters?.tags && filters.tags.length > 0) {
                products = products.filter(p =>
                    filters.tags!.some(tag =>
                        p.tag.some(productTag =>
                            productTag.toLowerCase().includes(tag.toLowerCase())
                        )
                    )
                );
            }

            console.log('Produtos encontrados na pesquisa:', products.length);
            return products;
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            throw error;
        }
    }

    // Utilitários para formatação (mantidos)
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