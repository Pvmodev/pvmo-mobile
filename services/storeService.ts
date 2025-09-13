// src/services/storeService.ts - CORRIGIDO COM fetchWithTimeout

import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import {
    ApiResponse,
    CreateStoreWithOwnerData,
    StoreData,
    StoreListResponse,
    StoreStatsData,
    StoreWithOwnerResponse
} from '@/types';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

interface GetStoresParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

interface UpdateCollectionsData {
    collections: Record<string, boolean>;
}

class StoreService {
    /**
     * Criar nova loja (apenas admin)
     */
    async createStore(storeData: Omit<CreateStoreWithOwnerData, 'ownerId'>, token: string): Promise<StoreData> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.CREATE);

            console.log('🏪 [StoreService] Criando loja:', storeData.name);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(storeData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'STORE_CREATION_FAILED'
                };
            }

            const data: ApiResponse<StoreData> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Loja criada:', data.data.id);
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao criar loja:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Criar loja com proprietário vinculado
     */
    async createStoreWithOwner(storeData: CreateStoreWithOwnerData, token: string): Promise<ApiResponse<StoreWithOwnerResponse>> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.CREATE_WITH_OWNER);

            console.log('🏪 [StoreService] Criando loja com proprietário:', storeData.name);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(storeData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'STORE_CREATION_FAILED'
                };
            }

            const data: ApiResponse<StoreWithOwnerResponse> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Loja com proprietário criada:', data.data.id);
            return data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao criar loja com proprietário:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Listar todas as lojas (apenas admin) 
     */
    async getAllStoresAdmin(token: string, params: GetStoresParams = {}): Promise<StoreListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.STORES.LIST)}?${queryParams}`;

            console.log('🏪 [StoreService] Listando todas as lojas (admin)');

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
                    error: errorData.error || 'STORES_FETCH_FAILED'
                };
            }

            const data: ApiResponse<StoreListResponse> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Lojas listadas:', data.data.total);
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao listar lojas:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Obter lojas do usuário da plataforma
     */
    async getMyStores(token: string): Promise<StoreData[]> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.MY_STORES);

            console.log('🏪 [StoreService] Buscando minhas lojas');

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
                    error: errorData.error || 'MY_STORES_FETCH_FAILED'
                };
            }

            const data: ApiResponse<StoreData[]> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Minhas lojas carregadas:', data.data.length);
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao buscar minhas lojas:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Buscar loja por ID (apenas admin)
     */
    async getStoreById(storeId: string, token: string): Promise<StoreData> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.GET_BY_ID(storeId));

            console.log('🏪 [StoreService] Buscando loja por ID:', storeId);

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
                    error: errorData.error || 'STORE_FETCH_FAILED'
                };
            }

            const data: ApiResponse<StoreData> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Loja encontrada:', data.data.name);
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao buscar loja:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Atualizar loja (apenas admin)
     */
    async updateStore(storeId: string, storeData: Partial<StoreData>, token: string): Promise<StoreData> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.UPDATE(storeId));

            console.log('🔄 [StoreService] Atualizando loja:', storeId);

            const response = await fetchWithTimeout(url, {
                method: 'PATCH',
                headers: getAuthHeaders(token),
                body: JSON.stringify(storeData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'STORE_UPDATE_FAILED'
                };
            }

            const data: ApiResponse<StoreData> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Loja atualizada:', data.data.name);
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao atualizar loja:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Deletar loja (apenas admin)
     */
    async deleteStore(storeId: string, token: string): Promise<void> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.DELETE(storeId));

            console.log('🗑️ [StoreService] Deletando loja:', storeId);

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
                    error: errorData.error || 'STORE_DELETE_FAILED'
                };
            }

            console.log('✅ [StoreService] Loja deletada');

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao deletar loja:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Atualizar coleções da loja (apenas admin)
     */
    async updateCollections(storeId: string, collectionsData: Record<string, boolean>, token: string): Promise<StoreData> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.UPDATE_COLLECTIONS(storeId));

            console.log('📦 [StoreService] Atualizando coleções da loja:', storeId);
            console.log('📦 [StoreService] Dados das coleções:', collectionsData);

            const response = await fetchWithTimeout(url, {
                method: 'PATCH',
                headers: getAuthHeaders(token),
                body: JSON.stringify(collectionsData), // Enviar diretamente as coleções
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'COLLECTIONS_UPDATE_FAILED'
                };
            }

            const data: ApiResponse<StoreData> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Coleções atualizadas');
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao atualizar coleções:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Alternar status ativo da loja (apenas admin)
     */
    async toggleStoreActive(storeId: string, token: string): Promise<StoreData> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES.TOGGLE_ACTIVE(storeId));

            console.log('🔄 [StoreService] Alternando status da loja:', storeId);

            const response = await fetchWithTimeout(url, {
                method: 'PATCH',
                headers: getAuthHeaders(token),
                body: JSON.stringify({}),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'TOGGLE_ACTIVE_FAILED'
                };
            }

            const data: ApiResponse<StoreData> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [StoreService] Status da loja alternado:', data.data.isActive);
            return data.data;

        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao alternar status:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    // ========================================
    // MÉTODOS UTILITÁRIOS
    // ========================================

    /**
     * Obter informações sobre uma coleção específica
     */
    getCollectionInfo(storeData: StoreData, collectionKey: string) {
        const collections = storeData.collections as Record<string, boolean> || {};
        const isActive = collections[collectionKey] || false;

        const collectionsMap: Record<string, any> = {
            'item-collection-biquinis': {
                key: 'item-collection-biquinis',
                name: 'biquinis',
                displayName: 'Biquínis',
                icon: 'woman',
                category: 'Moda Praia',
                description: 'Biquínis e peças de banho femininas',
                isActive
            },
            'item-collection-monteseubiquini': {
                key: 'item-collection-monteseubiquini',
                name: 'monte-seu-biquini',
                displayName: 'Monte seu Biquíni',
                icon: 'construct',
                category: 'Personalizado',
                description: 'Peças avulsas para montar biquínis',
                isActive
            },
            'item-collection-acessorios': {
                key: 'item-collection-acessorios',
                name: 'acessorios',
                displayName: 'Acessórios',
                icon: 'watch',
                category: 'Acessórios',
                description: 'Acessórios em geral',
                isActive
            },
            'item-collection-vestuario': {
                key: 'item-collection-vestuario',
                name: 'vestuario',
                displayName: 'Vestuário',
                icon: 'shirt',
                category: 'Roupas',
                description: 'Roupas em geral',
                isActive
            },
            'item-collection-fitness': {
                key: 'item-collection-fitness',
                name: 'fitness',
                displayName: 'Fitness',
                icon: 'fitness',
                category: 'Esporte',
                description: 'Roupas e acessórios para exercícios',
                isActive
            },
            'item-collection-maios': {
                key: 'item-collection-maios',
                name: 'maios',
                displayName: 'Maiôs',
                icon: 'body',
                category: 'Moda Praia',
                description: 'Maiôs e peças únicas',
                isActive
            },
            'item-collection-saidas': {
                key: 'item-collection-saidas',
                name: 'saidas',
                displayName: 'Saídas de Praia',
                icon: 'sunny',
                category: 'Moda Praia',
                description: 'Saídas de praia e beach wear',
                isActive
            },
            'item-collection-calcados': {
                key: 'item-collection-calcados',
                name: 'calcados',
                displayName: 'Calçados',
                icon: 'footsteps',
                category: 'Calçados',
                description: 'Calçados em geral',
                isActive
            },
            'item-collection-bolsas': {
                key: 'item-collection-bolsas',
                name: 'bolsas',
                displayName: 'Bolsas',
                icon: 'bag',
                category: 'Acessórios',
                description: 'Bolsas e mochilas',
                isActive
            },
            'item-collection-camisetas': {
                key: 'item-collection-camisetas',
                name: 'camisetas',
                displayName: 'Camisetas',
                icon: 'shirt',
                category: 'Roupas',
                description: 'Camisetas e t-shirts',
                isActive
            },
            'item-collection-shorts': {
                key: 'item-collection-shorts',
                name: 'shorts',
                displayName: 'Shorts',
                icon: 'pants',
                category: 'Roupas',
                description: 'Shorts e bermudas',
                isActive
            },
            'item-collection-sapatos': {
                key: 'item-collection-sapatos',
                name: 'sapatos',
                displayName: 'Sapatos',
                icon: 'footsteps',
                category: 'Calçados',
                description: 'Sapatos sociais e casuais',
                isActive
            },
            'item-collection-tenis': {
                key: 'item-collection-tenis',
                name: 'tenis',
                displayName: 'Tênis',
                icon: 'fitness',
                category: 'Calçados',
                description: 'Tênis esportivos e casuais',
                isActive
            },
            'item-collection-camisas': {
                key: 'item-collection-camisas',
                name: 'camisas',
                displayName: 'Camisas',
                icon: 'business',
                category: 'Roupas',
                description: 'Camisas sociais e casuais',
                isActive
            },
            'item-collection-blusas': {
                key: 'item-collection-blusas',
                name: 'blusas',
                displayName: 'Blusas',
                icon: 'woman',
                category: 'Roupas',
                description: 'Blusas femininas',
                isActive
            },
            'item-collection-calcas': {
                key: 'item-collection-calcas',
                name: 'calcas',
                displayName: 'Calças',
                icon: 'pants',
                category: 'Roupas',
                description: 'Calças em geral',
                isActive
            },
            'item-collection-jeans': {
                key: 'item-collection-jeans',
                name: 'jeans',
                displayName: 'Jeans',
                icon: 'pants',
                category: 'Roupas',
                description: 'Calças jeans e peças jeans',
                isActive
            },
            'item-collection-underwear': {
                key: 'item-collection-underwear',
                name: 'underwear',
                displayName: 'Underwear',
                icon: 'heart',
                category: 'Íntimo',
                description: 'Roupas íntimas básicas',
                isActive
            },
            'item-collection-lingerie': {
                key: 'item-collection-lingerie',
                name: 'lingerie',
                displayName: 'Lingerie',
                icon: 'heart',
                category: 'Íntimo',
                description: 'Lingerie e roupas íntimas',
                isActive
            },
            'item-collection-infantil': {
                key: 'item-collection-infantil',
                name: 'infantil',
                displayName: 'Infantil',
                icon: 'happy',
                category: 'Infantil',
                description: 'Roupas e acessórios infantis',
                isActive
            },
            'item-collection-masculino': {
                key: 'item-collection-masculino',
                name: 'masculino',
                displayName: 'Masculino',
                icon: 'man',
                category: 'Masculino',
                description: 'Roupas e acessórios masculinos',
                isActive
            }
        };

        return collectionsMap[collectionKey] || null;
    }

    /**
     * Obter informações de todas as coleções da loja
     */
    getCollectionsInfo(storeData: StoreData) {
        const collections = storeData.collections as Record<string, boolean> || {};

        return Object.keys(collections).map(key => {
            return this.getCollectionInfo(storeData, key);
        }).filter(Boolean);
    }

    /**
     * Alternar status de uma coleção específica
     */
    async toggleCollection(collectionKey: string, isActive: boolean, token: string, storeId?: string): Promise<void> {
        if (!storeId) {
            throw new Error('ID da loja é obrigatório');
        }

        try {
            console.log('🔄 [StoreService] Alternando coleção:', { collectionKey, isActive, storeId });

            // Buscar dados atuais da loja
            const storeData = await this.getStoreById(storeId, token);

            if (!storeData || !storeData.id) {
                throw new Error('Dados da loja não encontrados');
            }

            const currentCollections = storeData.collections as Record<string, boolean> || {};
            const updatedCollections = {
                ...currentCollections,
                [collectionKey]: isActive
            };

            console.log('📦 [StoreService] Atualizando coleções:', {
                current: currentCollections,
                updated: updatedCollections
            });

            await this.updateCollections(storeData.id, updatedCollections, token);

            console.log('✅ [StoreService] Coleção atualizada com sucesso');
        } catch (error: any) {
            console.error('❌ [StoreService] Erro ao alternar coleção:', error);
            throw {
                statusCode: error.statusCode || 500,
                message: error.message || 'Erro ao alterar status da coleção',
                error: error.error || 'COLLECTION_TOGGLE_FAILED'
            };
        }
    }

    /**
     * Obter estatísticas da loja
     */
    getStoreStats(storeData: StoreData): StoreStatsData {
        const collections = storeData.collections as Record<string, boolean> || {};
        const totalCollections = Object.keys(collections).length;
        const activeCollections = Object.values(collections).filter(Boolean).length;
        const inactiveCollections = totalCollections - activeCollections;

        const createdAt = new Date(storeData.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let storeAge: string;
        if (diffDays < 30) {
            storeAge = `${diffDays} dias`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            storeAge = `${months} ${months === 1 ? 'mês' : 'meses'}`;
        } else {
            const years = Math.floor(diffDays / 365);
            storeAge = `${years} ${years === 1 ? 'ano' : 'anos'}`;
        }

        return {
            totalCollections,
            activeCollections,
            inactiveCollections,
            totalUsers: 1,
            storeAge,
            lastUpdate: new Date(storeData.updatedAt).toLocaleDateString('pt-BR')
        };
    }
}

export const storeService = new StoreService();