import { API_CONFIG } from '@/config/api';
import { ApiResponse, CreateStoreWithOwnerData, StoreData, StoreListResponse, StoreWithOwnerResponse } from '@/types';
import { apiService } from './api';


export interface Collection {
    key: string;
    isActive: boolean;
    displayName: string;
    description: string;
    icon: string;
}

class StoreService {
    // CORRIGIDO: Agora busca múltiplas lojas do usuário da plataforma
    async getMyStores(token: string): Promise<StoreData[]> {
        console.log('🏪 [Store Service] Buscando lojas do usuário...');

        try {
            const response = await apiService.get<StoreData[]>(API_CONFIG.ENDPOINTS.STORES.MY_STORES, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar lojas');
            }

            console.log('✅ [Store Service] Lojas encontradas:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao buscar lojas:', error);
            throw error;
        }
    }

    // NOVO: Método para buscar uma loja específica por ID (para compatibilidade)
    async getStoreById(storeId: string, token: string): Promise<StoreData> {
        console.log('🏪 [Store Service] Buscando loja por ID:', storeId);

        try {
            const response = await apiService.get<StoreData>(`${API_CONFIG.ENDPOINTS.STORES.DETAILS}/${storeId}`, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar loja');
            }

            console.log('✅ [Store Service] Loja encontrada:', response.data.name);
            return response.data;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao buscar loja:', error);
            throw error;
        }
    }

    // MANTIDO para compatibilidade, mas agora retorna a primeira loja
    async getMyStore(token: string): Promise<StoreData> {
        const stores = await this.getMyStores(token);

        if (stores.length === 0) {
            throw new Error('Nenhuma loja encontrada para este usuário');
        }

        // Retorna a primeira loja ativa, ou a primeira se nenhuma estiver ativa
        return stores.find(store => store.isActive) || stores[0];
    }


    async createStoreWithOwner(
        storeData: CreateStoreWithOwnerData,
        token: string
    ): Promise<ApiResponse<StoreWithOwnerResponse>> {
        console.log('🆕 [Store Service] Criando loja com proprietário...');

        try {
            const response = await apiService.post<StoreWithOwnerResponse>(
                API_CONFIG.ENDPOINTS.STORES.CREATE_WITH_OWNER,
                storeData,
                token
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao criar loja');
            }

            console.log('✅ [Store Service] Loja criada com proprietário:', response.data.name);
            return response;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao criar loja:', error);
            throw error;
        }
    }

    async updateStoreCollections(
        storeId: string,
        collections: { [key: string]: boolean },
        token: string
    ): Promise<StoreData> {
        console.log('🔄 [Store Service] Atualizando coleções da loja...');

        try {
            const response = await apiService.patch<StoreData>(
                `${API_CONFIG.ENDPOINTS.STORES.DETAILS}/${storeId}/collections`,
                { collections },
                token
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao atualizar coleções');
            }

            console.log('✅ [Store Service] Coleções atualizadas com sucesso');
            return response.data;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao atualizar coleções:', error);
            throw error;
        }
    }

    async toggleCollection(collectionKey: string, isActive: boolean, token: string): Promise<StoreData> {
        console.log(`🔄 [Store Service] ${isActive ? 'Ativando' : 'Desativando'} coleção: ${collectionKey}`);

        try {
            // Primeiro buscar a loja atual
            const storeData = await this.getMyStore(token);

            const updatedCollections = {
                ...storeData.collections,
                [collectionKey]: isActive
            };

            return await this.updateStoreCollections(storeData.id, updatedCollections, token);
        } catch (error) {
            console.error('❌ [Store Service] Erro ao alterar status da coleção:', error);
            throw error;
        }
    }

    // Mapear coleções para formato mais amigável
    getCollectionsInfo(storeData: StoreData): Collection[] {
        const collectionsMap: { [key: string]: Omit<Collection, 'key' | 'isActive'> } = {
            'item-collection-biquinis': {
                displayName: 'Biquínis',
                description: 'Coleção de biquínis e maiôs',
                icon: 'woman-outline'
            },
            'item-collection-monteseubiquini': {
                displayName: 'Monte Seu Biquíni',
                description: 'Peças avulsas para montar biquínis',
                icon: 'construct-outline'
            },
            'item-collection-acessorios': {
                displayName: 'Acessórios',
                description: 'Acessórios de praia e verão',
                icon: 'bag-outline'
            },
            'item-collection-vestuario': {
                displayName: 'Vestuário',
                description: 'Roupas casuais e de verão',
                icon: 'shirt-outline'
            },
            'item-collection-fitness': {
                displayName: 'Fitness',
                description: 'Roupas para exercícios e esportes',
                icon: 'fitness-outline'
            },
            'item-collection-maios': {
                displayName: 'Maiôs',
                description: 'Maiôs inteiros e body',
                icon: 'woman-outline'
            },
            'item-collection-saidas': {
                displayName: 'Saídas de Praia',
                description: 'Saídas de praia e coberturas',
                icon: 'shirt-outline'
            },
            'item-collection-calcados': {
                displayName: 'Calçados',
                description: 'Sandálias, chinelos e sapatos',
                icon: 'footsteps-outline'
            },
            'item-collection-bolsas': {
                displayName: 'Bolsas',
                description: 'Bolsas de praia e casuais',
                icon: 'bag-handle-outline'
            },
            'item-collection-camisetas': {
                displayName: 'Camisetas',
                description: 'Camisetas casuais e esportivas',
                icon: 'shirt-outline'
            },
            'item-collection-shorts': {
                displayName: 'Shorts',
                description: 'Shorts casuais e esportivos',
                icon: 'shirt-outline'
            },
            'item-collection-sapatos': {
                displayName: 'Sapatos',
                description: 'Sapatos casuais e sociais',
                icon: 'footsteps-outline'
            },
            'item-collection-tenis': {
                displayName: 'Tênis',
                description: 'Tênis esportivos e casuais',
                icon: 'footsteps-outline'
            },
            'item-collection-camisas': {
                displayName: 'Camisas',
                description: 'Camisas sociais e casuais',
                icon: 'shirt-outline'
            },
            'item-collection-blusas': {
                displayName: 'Blusas',
                description: 'Blusas femininas variadas',
                icon: 'shirt-outline'
            },
            'item-collection-calcas': {
                displayName: 'Calças',
                description: 'Calças casuais e sociais',
                icon: 'shirt-outline'
            },
            'item-collection-jeans': {
                displayName: 'Jeans',
                description: 'Peças em jeans',
                icon: 'shirt-outline'
            },
            'item-collection-underwear': {
                displayName: 'Underwear',
                description: 'Roupas íntimas',
                icon: 'shirt-outline'
            },
            'item-collection-lingerie': {
                displayName: 'Lingerie',
                description: 'Lingerie feminina',
                icon: 'shirt-outline'
            },
            'item-collection-infantil': {
                displayName: 'Infantil',
                description: 'Roupas para crianças',
                icon: 'people-outline'
            },
            'item-collection-masculino': {
                displayName: 'Masculino',
                description: 'Roupas masculinas',
                icon: 'man-outline'
            }
        };

        return Object.entries(storeData.collections || {}).map(([key, isActive]) => ({
            key,
            isActive: Boolean(isActive),
            displayName: collectionsMap[key]?.displayName || key.replace('item-collection-', ''),
            description: collectionsMap[key]?.description || 'Coleção de produtos',
            icon: collectionsMap[key]?.icon || 'cube-outline'
        }));
    }

    // Adicionar no storeService:

    async getAllStoresAdmin(
        token: string,
        params: {
            page?: number;
            limit?: number;
            isActive?: boolean;
            search?: string;
        } = {}
    ): Promise<StoreListResponse> {
        console.log('🏪 [Store Service] Buscando TODAS as lojas (admin)...');

        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
            if (params.search) queryParams.append('search', params.search);

            const endpoint = `${API_CONFIG.ENDPOINTS.STORES.LIST}?${queryParams.toString()}`;

            const response = await apiService.get<StoreListResponse>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar lojas');
            }

            console.log('✅ [Store Service] Todas as lojas encontradas:', response.data.total);
            return response.data;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao buscar todas as lojas:', error);
            throw error;
        }
    }

    async toggleStoreActive(storeId: string, token: string): Promise<StoreData> {
        console.log('🔄 [Store Service] Alternando status ativo da loja:', storeId);

        try {
            const response = await apiService.patch<StoreData>(
                `${API_CONFIG.ENDPOINTS.STORES.DETAILS}/${storeId}/toggle-active`,
                {},
                token
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao alterar status da loja');
            }

            console.log('✅ [Store Service] Status da loja alterado com sucesso');
            return response.data;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao alterar status da loja:', error);
            throw error;
        }
    }

    // Filtrar apenas coleções ativas
    getActiveCollections(storeData: StoreData): Collection[] {
        return this.getCollectionsInfo(storeData).filter(collection => collection.isActive);
    }

    // Verificar se uma coleção específica está ativa
    isCollectionActive(storeData: StoreData, collectionKey: string): boolean {
        return Boolean(storeData.collections?.[collectionKey]);
    }

    // Obter informações de uma coleção específica
    getCollectionInfo(storeData: StoreData, collectionKey: string): Collection | null {
        const collections = this.getCollectionsInfo(storeData);
        return collections.find(collection => collection.key === collectionKey) || null;
    }

    // Estatísticas da loja
    getStoreStats(storeData: StoreData) {
        const collections = storeData.collections || {};
        const totalCollections = Object.keys(collections).length;
        const activeCollections = Object.values(collections).filter(Boolean).length;

        return {
            totalCollections,
            activeCollections,
            inactiveCollections: totalCollections - activeCollections,
            totalUsers: 0, // Removido pois API não retorna users
            storeAge: this.calculateStoreAge(storeData.createdAt),
            lastUpdate: this.formatDate(storeData.updatedAt)
        };
    }

    private calculateStoreAge(createdAt: string): string {
        const created = new Date(createdAt);
        const now = new Date();
        const diffInMs = now.getTime() - created.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays < 30) {
            return `${diffInDays} dias`;
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `${months} ${months === 1 ? 'mês' : 'meses'}`;
        } else {
            const years = Math.floor(diffInDays / 365);
            return `${years} ${years === 1 ? 'ano' : 'anos'}`;
        }
    }

    private formatDate(dateString: string): string {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }

    // Validações
    canManageStore(userEmail: string, storeData: StoreData): boolean {
        // Simplificado - agora só verifica se é o cliente da loja
        return storeData.clientEmail === userEmail;
    }

    isStoreOwner(userEmail: string, storeData: StoreData): boolean {
        return storeData.clientEmail === userEmail;
    }
}

export const storeService = new StoreService();