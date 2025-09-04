import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/services/productService';
import { storeService } from '@/services/storeService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ProductFilters {
    isActive?: boolean;
    featured?: boolean;
    search?: string;
}

interface ApiResponse {
    success: boolean;
    statusCode: number;
    data: {
        items: Product[];
        total: number;
        page: number;
        totalPages: number;
    };
}

interface ProductItemProps {
    item: Product;
    onPress: (product: Product) => void;
    index: number;
}

const ProductItem = React.memo(({ item, onPress, index }: ProductItemProps) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            delay: index * 50,
            useNativeDriver: true,
        }).start();
    }, []);

    const getTotalStock = () => {
        return (item.storageP || 0) +
            (item.storageM || 0) +
            (item.storageG || 0) +
            (item.storageU || 0) +
            (item.storageChild || 0) +
            (item.storagePP || 0) +
            (item.storageGG || 0) +
            (item.storageEXG || 0);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const getDiscountedPrice = () => {
        if (item.discount > 0) {
            return item.price - (item.price * item.discount / 100);
        }
        return item.price;
    };

    const totalStock = getTotalStock();
    const isLowStock = totalStock <= 5;
    const isOutOfStock = totalStock === 0;

    return (
        <Animated.View
            style={[
                styles.productItem,
                {
                    opacity: animatedValue,
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                onPress={() => onPress(item)}
                style={styles.productCard}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.productGradient}
                >
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        {item.imageList && item.imageList.length > 0 ? (
                            <Image
                                source={{ uri: item.imageList[0] }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
                            </View>
                        )}

                        {/* Status badges */}
                        <View style={styles.badgeContainer}>
                            {!item.isActive && (
                                <View style={[styles.badge, styles.inactiveBadge]}>
                                    <Text style={styles.badgeText}>Inativo</Text>
                                </View>
                            )}
                            {item.featured && (
                                <View style={[styles.badge, styles.featuredBadge]}>
                                    <Ionicons name="star" size={12} color="white" />
                                </View>
                            )}
                            {item.discount > 0 && (
                                <View style={[styles.badge, styles.discountBadge]}>
                                    <Text style={styles.badgeText}>-{item.discount}%</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Product Info */}
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.name}
                        </Text>

                        <Text style={styles.productType} numberOfLines={1}>
                            {item.type}
                        </Text>

                        {item.description && (
                            <Text style={styles.productDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}

                        {/* Price */}
                        <View style={styles.priceContainer}>
                            {item.discount > 0 ? (
                                <>
                                    <Text style={styles.originalPrice}>
                                        {formatPrice(item.price)}
                                    </Text>
                                    <Text style={styles.discountedPrice}>
                                        {formatPrice(getDiscountedPrice())}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.price}>
                                    {formatPrice(item.price)}
                                </Text>
                            )}
                        </View>

                        {/* Stock Info */}
                        <View style={styles.stockContainer}>
                            <View style={styles.stockInfo}>
                                <Ionicons
                                    name="cube-outline"
                                    size={14}
                                    color={isOutOfStock ? '#FF3B30' : isLowStock ? '#FF9500' : '#4CAF50'}
                                />
                                <Text style={[
                                    styles.stockText,
                                    { color: isOutOfStock ? '#FF3B30' : isLowStock ? '#FF9500' : '#4CAF50' }
                                ]}>
                                    {isOutOfStock ? 'Sem estoque' :
                                        isLowStock ? `Baixo estoque (${totalStock})` :
                                            `${totalStock} em estoque`}
                                </Text>
                            </View>

                            {item.storageLocation && (
                                <Text style={styles.location} numberOfLines={1}>
                                    📍 {item.storageLocation}
                                </Text>
                            )}
                        </View>

                        {/* Tags */}
                        {item.tag && item.tag.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {item.tag.slice(0, 3).map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                                {item.tag.length > 3 && (
                                    <Text style={styles.moreTags}>+{item.tag.length - 3}</Text>
                                )}
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
});

ProductItem.displayName = 'ProductItem';

export default function CollectionItemsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ collectionKey: string }>();
    const { user, token, storeData } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<ProductFilters>({});
    const [collectionInfo, setCollectionInfo] = useState<any>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 20;

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!user || !token || !storeData) {
            router.replace('/login');
            return;
        }

        if (!params.collectionKey) {
            Alert.alert('Erro', 'Coleção não especificada');
            router.back();
            return;
        }

        initializeCollection();
        loadProducts(true);

        // Animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [user, token, storeData, params.collectionKey]);

    const initializeCollection = () => {
        if (!storeData || !params.collectionKey) return;

        const collection = storeService.getCollectionInfo(storeData, params.collectionKey);
        if (collection) {
            setCollectionInfo(collection);
        }
    };

    const loadProducts = async (reset = false, searchTerm = searchText, currentFilters = filters) => {
        if (!storeData || !token) return;

        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
                setProducts([]);
            } else {
                setLoadingMore(true);
            }

            const page = reset ? 1 : currentPage + 1;

            // Build query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('limit', itemsPerPage.toString());
            queryParams.append('page', page.toString());

            // Add collectionKey filter
            if (params.collectionKey) {
                queryParams.append('collectionKey', params.collectionKey);
            }

            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            if (currentFilters.isActive !== undefined) {
                queryParams.append('isActive', currentFilters.isActive.toString());
            }

            if (currentFilters.featured !== undefined) {
                queryParams.append('featured', currentFilters.featured.toString());
            }

            const endpoint = `/stores/${storeData.id}/collections/items?${queryParams.toString()}`;
            const response = await fetch(`https://pvmo-api-production.up.railway.app${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data: ApiResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error('Erro ao carregar produtos');
            }

            const newProducts = data.data.items || [];

            if (reset) {
                setProducts(newProducts);
                setCurrentPage(1);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
                setCurrentPage(page);
            }

            // Update pagination info
            setTotalPages(data.data.totalPages || 1);
            setTotal(data.data.total || 0);

        } catch (error: any) {
            console.error('Erro ao carregar produtos:', error);
            Alert.alert('Erro', error.message || 'Não foi possível carregar os produtos');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = useCallback((text: string) => {
        setSearchText(text);
        const debounceTimeout = setTimeout(() => {
            loadProducts(true, text, filters);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [filters]);

    const handleFilterChange = (newFilters: ProductFilters) => {
        setFilters(newFilters);
        loadProducts(true, searchText, newFilters);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadProducts(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && currentPage < totalPages) {
            loadProducts(false);
        }
    };

    const handleProductPress = (product: Product) => {
        const totalStock = (product.storageP || 0) +
            (product.storageM || 0) +
            (product.storageG || 0) +
            (product.storageU || 0) +
            (product.storageChild || 0) +
            (product.storagePP || 0) +
            (product.storageGG || 0) +
            (product.storageEXG || 0);

        const formatPrice = (price: number) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(price);
        };

        Alert.alert(
            product.name,
            `Estoque total: ${totalStock}\nPreço: ${formatPrice(product.price)}\nStatus: ${product.isActive ? 'Ativo' : 'Inativo'}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Editar', onPress: () => console.log('Edit product:', product.id) },
            ]
        );
    };

    const renderFilterButtons = () => (
        <View style={styles.filtersContainer}>
            <TouchableOpacity
                style={[styles.filterButton, filters.isActive === true && styles.filterButtonActive]}
                onPress={() => handleFilterChange({
                    ...filters,
                    isActive: filters.isActive === true ? undefined : true
                })}
            >
                <Text style={[styles.filterButtonText, filters.isActive === true && styles.filterButtonTextActive]}>
                    Ativos
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.filterButton, filters.featured === true && styles.filterButtonActive]}
                onPress={() => handleFilterChange({
                    ...filters,
                    featured: filters.featured === true ? undefined : true
                })}
            >
                <Ionicons
                    name="star"
                    size={14}
                    color={filters.featured === true ? 'white' : 'rgba(255,255,255,0.7)'}
                />
                <Text style={[styles.filterButtonText, filters.featured === true && styles.filterButtonTextActive]}>
                    Destaque
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.filterButton, filters.isActive === false && styles.filterButtonActive]}
                onPress={() => handleFilterChange({
                    ...filters,
                    isActive: filters.isActive === false ? undefined : false
                })}
            >
                <Text style={[styles.filterButtonText, filters.isActive === false && styles.filterButtonTextActive]}>
                    Inativos
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptySubtitle}>
                {searchText ? 'Tente ajustar sua pesquisa' : 'Adicione produtos a esta coleção'}
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.footerLoaderText}>Carregando mais...</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Carregando produtos...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title} numberOfLines={1}>
                            {collectionInfo?.displayName || 'Produtos'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {total} {total === 1 ? 'produto' : 'produtos'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push(`/add-product?collectionKey=${params.collectionKey}`)}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                        style={styles.searchGradient}
                    >
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar produtos..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                </View>

                {/* Filters */}
                {renderFilterButtons()}

                {/* Products List */}
                <FlatList
                    data={products}
                    renderItem={({ item, index }) => (
                        <ProductItem
                            item={item}
                            onPress={handleProductPress}
                            index={index}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#667eea"
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    ListEmptyComponent={renderEmptyList}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={products.length === 0 ? styles.emptyListContainer : undefined}
                />
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
    },
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
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Search
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: 'white',
    },

    // Filters
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        gap: 4,
    },
    filterButtonActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    filterButtonText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: 'white',
    },

    // Products
    productItem: {
        marginHorizontal: 20,
        marginBottom: 16,
    },
    productCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    productGradient: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 12,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: 4,
        right: 4,
        gap: 2,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignItems: 'center',
        minWidth: 20,
    },
    featuredBadge: {
        backgroundColor: '#FF9500',
    },
    discountBadge: {
        backgroundColor: '#FF3B30',
    },
    inactiveBadge: {
        backgroundColor: '#666',
    },
    badgeText: {
        fontSize: 9,
        color: 'white',
        fontWeight: '600',
    },

    // Product Info
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    productType: {
        fontSize: 12,
        color: '#667eea',
        fontWeight: '500',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    originalPrice: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        textDecorationLine: 'line-through',
    },
    discountedPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    stockContainer: {
        marginBottom: 8,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '500',
    },
    location: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
    },
    tag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderRadius: 8,
    },
    tagText: {
        fontSize: 9,
        color: '#667eea',
        fontWeight: '500',
    },
    moreTags: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.5)',
    },

    // Empty state
    emptyListContainer: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },

    // Footer
    footerLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    footerLoaderText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
});