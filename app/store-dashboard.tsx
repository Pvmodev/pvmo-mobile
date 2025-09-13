import CollectionItem from '@/components/collections/CollectionItem';
import { useAuth } from '@/contexts/AuthContext';
import { storeService } from '@/services/storeService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Interface para os dados da coleção vindos do serviço
interface Collection {
    key: string;
    displayName: string;
    icon: string;
    description?: string;
    isActive: boolean;
    productCount?: number;
    // Adicione outras propriedades conforme necessário
}

// Interface esperada pelo componente CollectionItem
interface CollectionInfo {
    key: string;
    name: string;
    displayName: string;
    icon: string;
    category: string;
    description?: string;
    isActive: boolean;
    productCount?: number;
}

export default function StoreDashboardScreen() {
    const { user, token, storeData, refreshStoreData } = useAuth();
    const router = useRouter();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [storeStats, setStoreStats] = useState<any>(null);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (!user || !token) {
            router.replace('/login');
            return;
        }

        if (storeData) {
            loadStoreStats();
        } else {
            // Tentar carregar dados da loja
            refreshStoreData();
        }

        // Animação de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [user, token, storeData]);

    const loadStoreStats = () => {
        if (!storeData) return;

        const stats = storeService.getStoreStats(storeData);
        setStoreStats(stats);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshStoreData();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar os dados da loja');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleToggleCollection = async (collectionKey: string, currentStatus: boolean) => {
        if (!token || !storeData || !storeData.id) {
            Alert.alert('Erro', 'Dados da loja não disponíveis');
            return;
        }

        try {
            console.log('Toggle collection:', {
                collectionKey,
                currentStatus,
                newStatus: !currentStatus,
                storeId: storeData.id
            });

            await storeService.toggleCollection(collectionKey, !currentStatus, token, storeData.id);
            await refreshStoreData();

            Alert.alert(
                'Sucesso',
                `Coleção ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
            );
        } catch (error: any) {
            console.error('Erro ao alterar coleção:', error);
            Alert.alert('Erro', error.message || 'Não foi possível alterar o status da coleção');
        }
    };

    const handleAddProduct = (collectionKey: string) => {
        if (!storeData) return;

        const collection = storeService.getCollectionInfo(storeData, collectionKey);
        if (!collection || !collection.isActive) {
            Alert.alert('Aviso', 'Esta coleção não está ativa. Ative-a primeiro para adicionar produtos.');
            return;
        }

        router.push(`/add-product?collectionKey=${collectionKey}`);
    };

    // Função para mapear Collection para CollectionInfo
    const mapCollectionToCollectionInfo = (collection: Collection): CollectionInfo => {
        // Mapeamento de ícones para categorias
        const getCategoryFromIcon = (icon: string): string => {
            const categoryMap: { [key: string]: string } = {
                'bikini': 'Moda Praia',
                'swimwear': 'Moda Praia',
                'swimsuit': 'Moda Praia',
                'beachwear': 'Moda Praia',
                'accessories': 'Acessórios',
                'watch': 'Acessórios',
                'bags': 'Acessórios',
                'clothing': 'Vestuário',
                'shirt': 'Vestuário',
                'tshirts': 'Vestuário',
                'shirts': 'Vestuário',
                'blouses': 'Vestuário',
                'pants': 'Vestuário',
                'jeans': 'Vestuário',
                'shorts': 'Vestuário',
                'fitness': 'Fitness',
                'shoes': 'Calçados',
                'sneakers': 'Calçados',
                'underwear': 'Íntimos',
                'lingerie': 'Íntimos',
                'kids': 'Infantil',
                'men': 'Masculino',
                'default': 'Geral'
            };

            return categoryMap[icon] || categoryMap['default'];
        };

        return {
            key: collection.key,
            name: collection.displayName, // Usar displayName como name
            displayName: collection.displayName,
            icon: collection.icon,
            category: getCategoryFromIcon(collection.icon),
            description: collection.description,
            isActive: collection.isActive,
            productCount: collection.productCount,
        };
    };

    if (!storeData) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Carregando dados da loja...</Text>
                </View>
            </View>
        );
    }

    const collections = storeService.getCollectionsInfo(storeData);
    // Mapear as coleções para o formato esperado pelo componente
    const mappedCollections = collections.map(mapCollectionToCollectionInfo);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Background circles */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Minha Loja</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Store Info */}
                <View style={styles.storeInfo}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                        style={styles.storeInfoGradient}
                    >
                        <View style={styles.storeHeader}>
                            <View style={styles.storeIconContainer}>
                                <Ionicons name="storefront" size={28} color="#667eea" />
                            </View>
                            <View style={styles.storeDetails}>
                                <Text style={styles.storeName}>{storeData.name}</Text>
                                <Text style={styles.storeEmail}>{storeData.clientEmail}</Text>
                                <View style={styles.storeStatus}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: storeData.isActive ? '#4CAF50' : '#FF3B30' }
                                    ]} />
                                    <Text style={styles.storeStatusText}>
                                        {storeData.isActive ? 'Loja Ativa' : 'Loja Inativa'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {storeStats && (
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{storeStats.activeCollections}</Text>
                                    <Text style={styles.statLabel}>Coleções Ativas</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{storeStats.totalUsers}</Text>
                                    <Text style={styles.statLabel}>Usuários</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{storeStats.storeAge}</Text>
                                    <Text style={styles.statLabel}>Idade</Text>
                                </View>
                            </View>
                        )}
                    </LinearGradient>
                </View>

                {/* Collections List */}
                <View style={styles.collectionsSection}>
                    <Text style={styles.sectionTitle}>Coleções Disponíveis</Text>
                    <FlatList
                        data={mappedCollections}
                        renderItem={({ item }) => (
                            <CollectionItem
                                item={item}
                                onToggle={handleToggleCollection}
                                onAddProduct={handleAddProduct}
                            />
                        )}
                        keyExtractor={(item) => item.key}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor="#667eea"
                            />
                        }
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },

    // Background
    backgroundCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        top: -50,
        right: -50,
    },
    backgroundCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        bottom: 100,
        left: -30,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },

    // Store Info
    storeInfo: {
        marginBottom: 30,
        borderRadius: 16,
        overflow: 'hidden',
    },
    storeInfoGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 20,
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    storeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    storeDetails: {
        flex: 1,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    storeEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
    },
    storeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    storeStatusText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },

    // Collections
    collectionsSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    separator: {
        height: 12,
    },
});