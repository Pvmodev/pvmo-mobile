import { apiService } from './api';

export interface StoreData {
    id: string;
    name: string;
    clientEmail: string;
    isActive: boolean;
    collections: { [key: string]: boolean };
    createdAt: string;
    updatedAt: string;
    users: string[];
}

export interface Collection {
    key: string;
    isActive: boolean;
    displayName: string;
    description: string;
    icon: string;
}

class StoreService {
    async getMyStore(token: string): Promise<StoreData> {
        console.log('🏪 [Store Service] Buscando informações da minha loja...');

        try {
            const response = await apiService.get<StoreData>('/stores/my-store', token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar informações da loja');
            }

            console.log('✅ [Store Service] Loja encontrada:', response.data.name);
            console.log('📋 [Store Service] Coleções disponíveis:', Object.keys(response.data.collections).length);

            return response.data;
        } catch (error) {
            console.error('❌ [Store Service] Erro ao buscar loja:', error);
            throw error;
        }
    }

    async updateStoreCollections(collections: { [key: string]: boolean }, token: string): Promise<StoreData> {
        console.log('🔄 [Store Service] Atualizando coleções da loja...');

        try {
            const response = await apiService.patch<StoreData>(
                '/stores/my-store',
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
            const storeData = await this.getMyStore(token);
            const updatedCollections = {
                ...storeData.collections,
                [collectionKey]: isActive
            };

            return await this.updateStoreCollections(updatedCollections, token);
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
            'item-collection-acessorios': {
                displayName: 'Acessórios',
                description: 'Acessórios de praia e verão',
                icon: 'bag-outline'
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
            'item-collection-roupas': {
                displayName: 'Roupas',
                description: 'Roupas casuais e de verão',
                icon: 'library-outline'
            },
            'item-collection-bolsas': {
                displayName: 'Bolsas',
                description: 'Bolsas de praia e casuais',
                icon: 'bag-handle-outline'
            }
        };

        return Object.entries(storeData.collections).map(([key, isActive]) => ({
            key,
            isActive,
            displayName: collectionsMap[key]?.displayName || key,
            description: collectionsMap[key]?.description || 'Coleção de produtos',
            icon: collectionsMap[key]?.icon || 'cube-outline'
        }));
    }

    // Filtrar apenas coleções ativas
    getActiveCollections(storeData: StoreData): Collection[] {
        return this.getCollectionsInfo(storeData).filter(collection => collection.isActive);
    }

    // Verificar se uma coleção específica está ativa
    isCollectionActive(storeData: StoreData, collectionKey: string): boolean {
        return storeData.collections[collectionKey] === true;
    }

    // Obter informações de uma coleção específica
    getCollectionInfo(storeData: StoreData, collectionKey: string): Collection | null {
        const collections = this.getCollectionsInfo(storeData);
        return collections.find(collection => collection.key === collectionKey) || null;
    }

    // Estatísticas da loja
    getStoreStats(storeData: StoreData) {
        const totalCollections = Object.keys(storeData.collections).length;
        const activeCollections = Object.values(storeData.collections).filter(Boolean).length;
        const totalUsers = storeData.users.length;

        return {
            totalCollections,
            activeCollections,
            inactiveCollections: totalCollections - activeCollections,
            totalUsers,
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
        return storeData.clientEmail === userEmail || storeData.users.includes(userEmail);
    }

    isStoreOwner(userEmail: string, storeData: StoreData): boolean {
        return storeData.clientEmail === userEmail;
    }
}

export const storeService = new StoreService();