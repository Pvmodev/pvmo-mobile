// src/services/productService.ts
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import {
    ApiResponse,
    CollectionKey,
    Product,
    ProductData,
    ProductListResponse
} from '@/types';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
interface GetProductsParams {
    page?: number;
    limit?: number;
    collectionKey?: CollectionKey;
    search?: string;
    isActive?: boolean;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
}

interface ProductUpdateData extends Partial<ProductData> {
    id?: string;
}

class ProductService {
    /**
     * Buscar produtos de uma loja (rota pública)
     */
    async getProducts(
        storeSlug: string,
        params: GetProductsParams = {},
        token?: string
    ): Promise<ProductListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.collectionKey) queryParams.append('collectionKey', params.collectionKey);
            if (params.search) queryParams.append('search', params.search);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
            if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
            if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
            if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
            if (params.tags?.length) queryParams.append('tags', params.tags.join(','));

            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.ITEMS(storeSlug);
            const url = `${getApiUrl(endpoint)}?${queryParams}`;

            console.log('🔍 [ProductService] Buscando produtos:', url);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<ProductListResponse> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Produtos carregados:', data.data.total);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao buscar produtos:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Buscar todos os produtos (admin da plataforma)
     */
    async getAllProducts(
        storeSlug: string,
        params: GetProductsParams = {},
        token: string
    ): Promise<ProductListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.collectionKey) queryParams.append('collectionKey', params.collectionKey);
            if (params.search) queryParams.append('search', params.search);

            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.ADMIN_ALL(storeSlug);
            const url = `${getApiUrl(endpoint)}?${queryParams}`;

            console.log('🔍 [ProductService] Buscando todos os produtos (admin):', url);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<ProductListResponse> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Todos os produtos carregados:', data.data.total);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao buscar todos os produtos:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Buscar produto específico
     */
    async getProduct(storeSlug: string, productId: string, token?: string): Promise<Product> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.ITEM_GET(storeSlug, productId);
            const url = getApiUrl(endpoint);

            console.log('🔍 [ProductService] Buscando produto:', productId);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<Product> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Produto carregado:', data.data.name);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao buscar produto:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Criar produto (admin da plataforma)
     */
    async createProduct(storeSlug: string, productData: ProductData, token: string): Promise<Product> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.CREATE_PLATFORM(storeSlug);
            const url = getApiUrl(endpoint);

            console.log('📝 [ProductService] Criando produto:', productData.name);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(productData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<Product> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Produto criado:', data.data.id);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao criar produto:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Criar produto (dono da loja)
     */
    async createProductAsStoreAdmin(storeSlug: string, productData: ProductData, token: string): Promise<Product> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.CREATE_STORE(storeSlug);
            const url = getApiUrl(endpoint);

            console.log('📝 [ProductService] Criando produto (store admin):', productData.name);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(productData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<Product> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Produto criado (store admin):', data.data.id);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao criar produto (store admin):', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Atualizar produto (admin da plataforma)
     */
    async updateProduct(
        storeSlug: string,
        productId: string,
        productData: ProductUpdateData,
        token: string
    ): Promise<Product> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.UPDATE_PLATFORM(storeSlug, productId);
            const url = getApiUrl(endpoint);

            console.log('📝 [ProductService] Atualizando produto:', productId);

            const response = await fetchWithTimeout(url, {
                method: 'PUT',
                headers: getAuthHeaders(token),
                body: JSON.stringify(productData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<Product> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Produto atualizado:', data.data.id);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao atualizar produto:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Atualizar produto (dono da loja)
     */
    async updateProductAsStoreAdmin(
        storeSlug: string,
        productId: string,
        productData: ProductUpdateData,
        token: string
    ): Promise<Product> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.UPDATE_STORE(storeSlug, productId);
            const url = getApiUrl(endpoint);

            console.log('📝 [ProductService] Atualizando produto (store admin):', productId);

            const response = await fetchWithTimeout(url, {
                method: 'PUT',
                headers: getAuthHeaders(token),
                body: JSON.stringify(productData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            const data: ApiResponse<Product> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida da API',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [ProductService] Produto atualizado (store admin):', data.data.id);
            return data.data;

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao atualizar produto (store admin):', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Deletar produto (admin da plataforma)
     */
    async deleteProduct(storeSlug: string, productId: string, token: string): Promise<void> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.DELETE_PLATFORM(storeSlug, productId);
            const url = getApiUrl(endpoint);

            console.log('🗑️ [ProductService] Deletando produto:', productId);

            const response = await fetchWithTimeout(url, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            console.log('✅ [ProductService] Produto deletado:', productId);

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao deletar produto:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Deletar produto (dono da loja)
     */
    async deleteProductAsStoreAdmin(storeSlug: string, productId: string, token: string): Promise<void> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.COLLECTIONS.DELETE_STORE(storeSlug, productId);
            const url = getApiUrl(endpoint);

            console.log('🗑️ [ProductService] Deletando produto (store admin):', productId);

            const response = await fetchWithTimeout(url, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'API_ERROR'
                };
            }

            console.log('✅ [ProductService] Produto deletado (store admin):', productId);

        } catch (error: any) {
            console.error('❌ [ProductService] Erro ao deletar produto (store admin):', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Buscar produtos por coleção
     */
    async getProductsByCollection(
        storeSlug: string,
        collectionKey: CollectionKey,
        params: Omit<GetProductsParams, 'collectionKey'> = {},
        token?: string
    ): Promise<ProductListResponse> {
        return this.getProducts(storeSlug, { ...params, collectionKey }, token);
    }

    /**
     * Buscar produtos em destaque
     */
    async getFeaturedProducts(
        storeSlug: string,
        params: Omit<GetProductsParams, 'featured'> = {},
        token?: string
    ): Promise<ProductListResponse> {
        return this.getProducts(storeSlug, { ...params, featured: true }, token);
    }

    /**
     * Buscar produtos por tags
     */
    async getProductsByTags(
        storeSlug: string,
        tags: string[],
        params: Omit<GetProductsParams, 'tags'> = {},
        token?: string
    ): Promise<ProductListResponse> {
        return this.getProducts(storeSlug, { ...params, tags }, token);
    }

    /**
     * Validar dados do produto antes de enviar
     */
    private validateProductData(productData: ProductData | ProductUpdateData): void {
        if ('name' in productData && !productData.name?.trim()) {
            throw new Error('Nome do produto é obrigatório');
        }

        if ('price' in productData && (productData.price === undefined || productData.price <= 0)) {
            throw new Error('Preço deve ser maior que zero');
        }

        if ('discount' in productData && productData.discount && (productData.discount < 0 || productData.discount > 100)) {
            throw new Error('Desconto deve estar entre 0 e 100%');
        }

        if ('imageList' in productData && (!productData.imageList || productData.imageList.length === 0)) {
            throw new Error('Pelo menos uma imagem é obrigatória');
        }
    }

    /**
     * Helper para determinar qual endpoint usar baseado no role do usuário
     */
    getCreateMethod(userRole: string): 'platform' | 'store' {
        return userRole === 'PVMO_ADMIN' ? 'platform' : 'store';
    }

    /**
     * Método unificado para criar produto baseado no role
     */
    async createProductSmart(
        storeSlug: string,
        productData: ProductData,
        token: string,
        userRole: string
    ): Promise<Product> {
        this.validateProductData(productData);

        const method = this.getCreateMethod(userRole);

        if (method === 'platform') {
            return this.createProduct(storeSlug, productData, token);
        } else {
            return this.createProductAsStoreAdmin(storeSlug, productData, token);
        }
    }

    /**
     * Método unificado para atualizar produto baseado no role
     */
    async updateProductSmart(
        storeSlug: string,
        productId: string,
        productData: ProductUpdateData,
        token: string,
        userRole: string
    ): Promise<Product> {
        this.validateProductData(productData);

        const method = this.getCreateMethod(userRole);

        if (method === 'platform') {
            return this.updateProduct(storeSlug, productId, productData, token);
        } else {
            return this.updateProductAsStoreAdmin(storeSlug, productId, productData, token);
        }
    }

    /**
     * Método unificado para deletar produto baseado no role
     */
    async deleteProductSmart(
        storeSlug: string,
        productId: string,
        token: string,
        userRole: string
    ): Promise<void> {
        const method = this.getCreateMethod(userRole);

        if (method === 'platform') {
            return this.deleteProduct(storeSlug, productId, token);
        } else {
            return this.deleteProductAsStoreAdmin(storeSlug, productId, token);
        }
    }
}

export const productService = new ProductService();