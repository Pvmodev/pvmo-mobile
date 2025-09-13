import { useAuth } from '@/contexts/AuthContext';
import { storeService } from '@/services/storeService';
import { StoreData } from "@/types";
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

interface StoreCardProps {
    store: any;
    onPress: () => void;
    onToggleActive: () => void;
    isOwner: boolean;
}

function StoreCard({ store, onPress, onToggleActive, isOwner }: StoreCardProps) {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const getStoreIcon = () => {
        if (!store.isActive) return 'storefront-outline';
        return isOwner ? 'storefront' : 'business';
    };

    const getStoreStats = () => {
        const collections = store.collections || {};
        const activeCollections = Object.values(collections).filter(Boolean).length;
        const totalCollections = Object.keys(collections).length;

        return {
            activeCollections,
            totalCollections,
            completionRate: totalCollections > 0 ? (activeCollections / totalCollections * 100).toFixed(0) : 0
        };
    };

    const stats = getStoreStats();

    return (
        <Animated.View style={[styles.storeCard, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={[
                    store.isActive
                        ? 'rgba(102, 126, 234, 0.15)'
                        : 'rgba(255, 59, 48, 0.15)',
                    'rgba(255,255,255,0.05)'
                ]}
                style={styles.storeCardGradient}
            >
                <TouchableOpacity onPress={onPress} style={styles.storeCardContent}>
                    {/* Header */}
                    <View style={styles.storeCardHeader}>
                        <View style={styles.storeIconContainer}>
                            <Ionicons
                                name={getStoreIcon()}
                                size={24}
                                color={store.isActive ? '#667eea' : '#FF3B30'}
                            />
                        </View>
                        <View style={styles.storeCardInfo}>
                            <Text style={styles.storeCardName}>{store.name}</Text>
                            <Text style={styles.storeCardEmail}>{store.clientEmail}</Text>
                        </View>
                        <View style={styles.storeCardActions}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: store.isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 59, 48, 0.2)' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: store.isActive ? '#4CAF50' : '#FF3B30' }
                                ]}>
                                    {store.isActive ? 'Ativa' : 'Inativa'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.storeCardStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.activeCollections}</Text>
                            <Text style={styles.statLabel}>Coleções Ativas</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.totalCollections}</Text>
                            <Text style={styles.statLabel}>Total Coleções</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.completionRate}%</Text>
                            <Text style={styles.statLabel}>Configurado</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.storeCardFooter}>
                        <Text style={styles.storeRole}>
                            {isOwner ? 'Proprietário' : 'Colaborador'}
                        </Text>
                        <View style={styles.footerActions}>
                            <TouchableOpacity
                                style={styles.footerButton}
                                onPress={onPress}
                            >
                                <Ionicons name="settings" size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.footerButtonText}>Gerenciar</Text>
                            </TouchableOpacity>
                            {isOwner && (
                                <TouchableOpacity
                                    style={[styles.footerButton, styles.toggleButton]}
                                    onPress={onToggleActive}
                                >
                                    <Ionicons
                                        name={store.isActive ? "pause" : "play"}
                                        size={16}
                                        color="rgba(255,255,255,0.7)"
                                    />
                                    <Text style={styles.footerButtonText}>
                                        {store.isActive ? 'Pausar' : 'Ativar'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
    );
}

export default function StoresManagementScreen() {
    const { user, token, allStores, refreshStoreData, switchStore, ensureValidToken } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [adminStores, setAdminStores] = useState<StoreData[]>([]); // Para PVMO_ADMIN
    const displayStores = user?.role === 'PVMO_ADMIN' ? adminStores : allStores;


    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (!user || !token) {
            router.replace('/login');
            return;
        }

        loadStores();

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
    }, [user, token]);

    const loadStores = async () => {
        setIsLoading(true);
        try {
            const tokenValid = await ensureValidToken();
            if (tokenValid) {
                if (user?.role === 'PVMO_ADMIN') {
                    const response = await storeService.getAllStoresAdmin(token!);
                    setAdminStores(response.stores || []);
                } else {
                    await refreshStoreData();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar lojas:', error);
        }
    };

    // efeito que controla o fim do loading
    useEffect(() => {
        if (user?.role === 'PVMO_ADMIN') {
            if (adminStores !== null) setIsLoading(false);
        } else {
            if (allStores !== null) setIsLoading(false);
        }
    }, [adminStores, allStores, user?.role]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const tokenValid = await ensureValidToken();
            if (tokenValid) {
                await refreshStoreData();
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar os dados');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleStorePress = async (store: any) => {
        try {
            await switchStore(store.id);
            router.push('/store-dashboard');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível acessar esta loja');
        }
    };

    const handleToggleStoreActive = async (store: StoreData) => {
        if (!isStoreOwner(store)) {
            Alert.alert('Aviso', 'Apenas o proprietário pode ativar/desativar a loja');
            return;
        }

        const newStatus = !store.isActive;

        // 1. atualiza no estado local otimisticamente
        if (user?.role === 'PVMO_ADMIN') {
            setAdminStores(prev =>
                prev.map(s => s.id === store.id ? { ...s, isActive: newStatus } : s)
            );
        } else {
            // se usa allStores no contexto
            await refreshStoreData();
        }

        try {
            // 2. chama API
            await storeService.toggleStoreActive(store.id, token!);

            // 3. garante consistência depois
            await refreshStoreData();
        } catch (error: any) {
            // rollback em caso de erro
            Alert.alert('Erro', error.message || 'Não foi possível alterar o status da loja');
            // reverte mudança local
            if (user?.role === 'PVMO_ADMIN') {
                setAdminStores(prev =>
                    prev.map(s => s.id === store.id ? { ...s, isActive: store.isActive } : s)
                );
            } else {
                await refreshStoreData();
            }
        }
    };


    const handleCreateStore = () => {
        router.push('/create-storeowner');
    };

    const handleCreateClient = () => {
        router.push('/create-client');
    };

    const isStoreOwner = (store: any) => {
        if (user?.role === 'PVMO_ADMIN') return true;
        // Verificar se é proprietário baseado nas permissões
        return user?.stores?.some(userStore =>
            userStore.storeId === store.id
        ) || false;
    };

    const getStoresStats = () => {
        const activeStores = displayStores.filter(store => store.isActive).length;
        const ownedStores = displayStores.filter(store => isStoreOwner(store)).length;

        return {
            total: displayStores.length,
            active: activeStores,
            owned: ownedStores
        };
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Carregando suas lojas...</Text>
                </View>
            </View>
        );
    }


    const stats = getStoresStats();

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
                    <Text style={styles.title}>Minhas Lojas</Text>
                    <TouchableOpacity onPress={handleCreateStore} style={styles.addButton}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Summary Stats */}
                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.1)']}
                        style={styles.summaryGradient}
                    >
                        <View style={styles.summaryHeader}>
                            <Ionicons name="analytics" size={24} color="#667eea" />
                            <Text style={styles.summaryTitle}>Resumo Geral</Text>
                        </View>
                        <View style={styles.summaryStats}>
                            <View style={styles.summaryStatItem}>
                                <Text style={styles.summaryStatNumber}>{stats.total}</Text>
                                <Text style={styles.summaryStatLabel}>Total de Lojas</Text>
                            </View>
                            <View style={styles.summaryStatDivider} />
                            <View style={styles.summaryStatItem}>
                                <Text style={styles.summaryStatNumber}>{stats.active}</Text>
                                <Text style={styles.summaryStatLabel}>Lojas Ativas</Text>
                            </View>
                            <View style={styles.summaryStatDivider} />
                            <View style={styles.summaryStatItem}>
                                <Text style={styles.summaryStatNumber}>{stats.owned}</Text>
                                <Text style={styles.summaryStatLabel}>Minhas Lojas</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Stores List */}
                <View style={styles.storesSection}>
                    <Text style={styles.sectionTitle}>
                        Suas Lojas ({displayStores.length})
                    </Text>

                    {displayStores.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="storefront-outline" size={64} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyStateTitle}>Nenhuma loja encontrada</Text>
                            <Text style={styles.emptyStateText}>
                                Você ainda não possui lojas ou não tem acesso a nenhuma loja.
                            </Text>
                            <TouchableOpacity style={styles.createButton} onPress={handleCreateStore}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.createButtonGradient}
                                >
                                    <Ionicons name="add" size={20} color="white" />
                                    <Text style={styles.createButtonText}>Criar Primeira Loja</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={displayStores}
                            renderItem={({ item }) => (
                                <StoreCard
                                    store={item}
                                    onPress={() => handleStorePress(item)}
                                    onToggleActive={() => handleToggleStoreActive(item)}
                                    isOwner={isStoreOwner(item)}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefreshing}
                                    onRefresh={handleRefresh}
                                    tintColor="#667eea"
                                />
                            }
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />

                    )}
                    <View >
                        <TouchableOpacity style={styles.createButton} onPress={handleCreateClient}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.createButtonGradient}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.createButtonText}>Criar Cliente</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.createButton} onPress={handleCreateStore}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.createButtonGradient}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.createButtonText}>Criar Loja</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
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
    addButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },

    // Summary Card
    summaryCard: {
        marginBottom: 30,
        borderRadius: 16,
        overflow: 'hidden',
    },
    summaryGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 12,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryStatNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    summaryStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    summaryStatDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },

    // Stores Section
    storesSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    separator: {
        height: 16,
    },

    // Store Card
    storeCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    storeCardGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    storeCardContent: {
        padding: 20,
    },
    storeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    storeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    storeCardInfo: {
        flex: 1,
    },
    storeCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    storeCardEmail: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    storeCardActions: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },

    // Store Stats
    storeCardStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 8,
    },

    // Store Footer
    storeCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeRole: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    footerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        gap: 4,
    },
    toggleButton: {
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
    },
    footerButtonText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    createButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 8,
    },
    createButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
    },
});