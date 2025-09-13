// src/components/collections/CollectionItem.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

interface CollectionItemProps {
    item: CollectionInfo;
    onToggle: (collectionKey: string, currentStatus: boolean) => void;
    onAddProduct: (collectionKey: string) => void;
}

export default function CollectionItem({ item, onToggle, onAddProduct }: CollectionItemProps) {
    const router = useRouter();

    const handleViewProducts = () => {
        router.push(`/collection-items?collectionKey=${item.key}`);
    };

    const getCollectionIcon = (icon: string): any => {
        // Map dos ícones baseado no tipo de coleção
        const iconMap: { [key: string]: any } = {
            'bikini': 'woman-outline',
            'swimwear': 'water-outline',
            'accessories': 'watch-outline',
            'clothing': 'shirt-outline',
            'fitness': 'fitness-outline',
            'swimsuit': 'body-outline',
            'beachwear': 'sunny-outline',
            'shoes': 'footsteps-outline',
            'bags': 'bag-outline',
            'tshirts': 'shirt-outline',
            'shorts': 'pants-outline',
            'sneakers': 'footsteps-outline',
            'shirts': 'business-outline',
            'blouses': 'woman-outline',
            'pants': 'pants-outline',
            'jeans': 'pants-outline',
            'underwear': 'heart-outline',
            'lingerie': 'heart-outline',
            'kids': 'happy-outline',
            'men': 'man-outline',
            'default': 'cube-outline'
        };

        return iconMap[icon] || iconMap['default'];
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? '#4CAF50' : '#FF3B30';
    };

    const getStatusBgColor = (isActive: boolean) => {
        return isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 59, 48, 0.2)';
    };

    return (
        <View style={styles.collectionCard}>
            <LinearGradient
                colors={[
                    item.isActive
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                    'rgba(255,255,255,0.02)'
                ]}
                style={styles.collectionGradient}
            >
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionIconContainer}>
                        <Ionicons
                            name={getCollectionIcon(item.icon)}
                            size={24}
                            color={item.isActive ? '#667eea' : 'rgba(255,255,255,0.5)'}
                        />
                    </View>
                    <View style={styles.collectionInfo}>
                        <Text style={styles.collectionName}>{item.displayName}</Text>
                        <Text style={styles.collectionDescription}>
                            {item.description || `Produtos de ${item.category}`}
                        </Text>
                        {item.productCount !== undefined && (
                            <Text style={styles.productCount}>
                                {item.productCount} produto{item.productCount !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </View>
                    <View style={styles.collectionActions}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusBgColor(item.isActive) }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: getStatusColor(item.isActive) }
                            ]}>
                                {item.isActive ? 'Ativa' : 'Inativa'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.collectionFooter}>
                    {/* Toggle Status Button */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            {
                                backgroundColor: item.isActive
                                    ? 'rgba(255, 59, 48, 0.2)'
                                    : 'rgba(76, 175, 80, 0.2)'
                            }
                        ]}
                        onPress={() => onToggle(item.key, item.isActive)}
                    >
                        <Ionicons
                            name={item.isActive ? "pause" : "play"}
                            size={14}
                            color={item.isActive ? '#FF3B30' : '#4CAF50'}
                        />
                        <Text style={[
                            styles.actionButtonText,
                            { color: item.isActive ? '#FF3B30' : '#4CAF50' }
                        ]}>
                            {item.isActive ? 'Desativar' : 'Ativar'}
                        </Text>
                    </TouchableOpacity>

                    {/* View Products Button */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: 'rgba(102, 126, 234, 0.2)' }
                        ]}
                        onPress={handleViewProducts}
                    >
                        <Ionicons name="eye" size={14} color="#667eea" />
                        <Text style={[styles.actionButtonText, { color: '#667eea' }]}>
                            Ver Itens
                        </Text>
                    </TouchableOpacity>

                    {/* Add Product Button */}
                    {item.isActive && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.addProductButton,
                                { backgroundColor: 'rgba(102, 126, 234, 0.3)' }
                            ]}
                            onPress={() => onAddProduct(item.key)}
                        >
                            <Ionicons name="add" size={14} color="#667eea" />
                            <Text style={[styles.actionButtonText, { color: '#667eea' }]}>
                                Adicionar
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Tag */}
                <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    collectionCard: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    collectionGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        position: 'relative',
    },
    collectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    collectionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    collectionDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
    },
    productCount: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
    },
    collectionActions: {
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
    collectionFooter: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
        minWidth: 80,
        justifyContent: 'center',
    },
    addProductButton: {
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.4)',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    categoryTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});