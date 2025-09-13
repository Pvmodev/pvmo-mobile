// src/app/create-storeowner.tsx - ATUALIZADO COM SELEÇÃO DE COLEÇÕES

import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { CollectionKey } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface CreateStoreForm {
    name: string;
    clientEmail: string;
    ownerId: string;
    ownerName: string;
    collections: Record<string, boolean>;
    theme: string;
    paymentMethods: string[];
}

interface UserOption {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface CollectionOption {
    key: string;
    name: string;
    displayName: string;
    icon: string;
    category: string;
    description: string;
}

export default function CreateStoreWithOwnerScreen() {
    const { user, token, refreshAuthToken } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState<CreateStoreForm>({
        name: '',
        clientEmail: '',
        ownerId: '',
        ownerName: '',
        collections: {},
        theme: 'default',
        paymentMethods: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [errors, setErrors] = useState<Partial<CreateStoreForm>>({});
    const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
    const [showUserPicker, setShowUserPicker] = useState(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // Lista completa de coleções disponíveis
    const availableCollections: CollectionOption[] = [
        {
            key: CollectionKey.ITEM_COLLECTION_BIQUINIS,
            name: 'biquinis',
            displayName: 'Biquínis',
            icon: 'woman',
            category: 'Moda Praia',
            description: 'Biquínis e peças de banho femininas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_MONTESEUBIQUINI,
            name: 'monte-seu-biquini',
            displayName: 'Monte seu Biquíni',
            icon: 'construct',
            category: 'Personalizado',
            description: 'Peças avulsas para montar biquínis'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_ACESSORIOS,
            name: 'acessorios',
            displayName: 'Acessórios',
            icon: 'watch',
            category: 'Acessórios',
            description: 'Acessórios em geral'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_VESTUARIO,
            name: 'vestuario',
            displayName: 'Vestuário',
            icon: 'shirt',
            category: 'Roupas',
            description: 'Roupas em geral'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_FITNESS,
            name: 'fitness',
            displayName: 'Fitness',
            icon: 'fitness',
            category: 'Esporte',
            description: 'Roupas e acessórios para exercícios'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_MAIOS,
            name: 'maios',
            displayName: 'Maiôs',
            icon: 'body',
            category: 'Moda Praia',
            description: 'Maiôs e peças únicas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_SAIDAS,
            name: 'saidas',
            displayName: 'Saídas de Praia',
            icon: 'sunny',
            category: 'Moda Praia',
            description: 'Saídas de praia e beach wear'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_CALCADOS,
            name: 'calcados',
            displayName: 'Calçados',
            icon: 'footsteps',
            category: 'Calçados',
            description: 'Calçados em geral'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_BOLSAS,
            name: 'bolsas',
            displayName: 'Bolsas',
            icon: 'bag',
            category: 'Acessórios',
            description: 'Bolsas e mochilas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_CAMISETAS,
            name: 'camisetas',
            displayName: 'Camisetas',
            icon: 'shirt',
            category: 'Roupas',
            description: 'Camisetas e t-shirts'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_SHORTS,
            name: 'shorts',
            displayName: 'Shorts',
            icon: 'pants',
            category: 'Roupas',
            description: 'Shorts e bermudas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_SAPATOS,
            name: 'sapatos',
            displayName: 'Sapatos',
            icon: 'footsteps',
            category: 'Calçados',
            description: 'Sapatos sociais e casuais'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_TENIS,
            name: 'tenis',
            displayName: 'Tênis',
            icon: 'fitness',
            category: 'Calçados',
            description: 'Tênis esportivos e casuais'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_CAMISAS,
            name: 'camisas',
            displayName: 'Camisas',
            icon: 'business',
            category: 'Roupas',
            description: 'Camisas sociais e casuais'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_BLUSAS,
            name: 'blusas',
            displayName: 'Blusas',
            icon: 'woman',
            category: 'Roupas',
            description: 'Blusas femininas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_CALCAS,
            name: 'calcas',
            displayName: 'Calças',
            icon: 'pants',
            category: 'Roupas',
            description: 'Calças em geral'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_JEANS,
            name: 'jeans',
            displayName: 'Jeans',
            icon: 'pants',
            category: 'Roupas',
            description: 'Calças jeans e peças jeans'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_UNDERWEAR,
            name: 'underwear',
            displayName: 'Underwear',
            icon: 'heart',
            category: 'Íntimo',
            description: 'Roupas íntimas básicas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_LINGERIE,
            name: 'lingerie',
            displayName: 'Lingerie',
            icon: 'heart',
            category: 'Íntimo',
            description: 'Lingerie e roupas íntimas'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_INFANTIL,
            name: 'infantil',
            displayName: 'Infantil',
            icon: 'happy',
            category: 'Infantil',
            description: 'Roupas e acessórios infantis'
        },
        {
            key: CollectionKey.ITEM_COLLECTION_MASCULINO,
            name: 'masculino',
            displayName: 'Masculino',
            icon: 'man',
            category: 'Masculino',
            description: 'Roupas e acessórios masculinos'
        }
    ];

    React.useEffect(() => {
        if (!user || !token) {
            router.replace('/login');
            return;
        }

        loadUsers();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [user, token]);

    const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await authService.getPlatformUsers({}, token!);
            const users = response.data.users
                .filter(u => u.role !== 'PVMO_ADMIN' && u.isActive)
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role
                }));
            setAvailableUsers(users);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateStoreForm> = {};

        if (!form.name.trim()) {
            newErrors.name = 'Nome da loja é obrigatório';
        }

        if (!form.clientEmail.trim()) {
            newErrors.clientEmail = 'Email do cliente é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(form.clientEmail)) {
            newErrors.clientEmail = 'Email inválido';
        }

        if (!form.ownerId) {
            newErrors.ownerId = 'Selecione o proprietário';
        }

        // Verificar se pelo menos uma coleção foi selecionada
        const selectedCollections = Object.values(form.collections).filter(Boolean);
        if (selectedCollections.length === 0) {
            Alert.alert(
                'Coleções necessárias',
                'Selecione pelo menos uma coleção para a loja.'
            );
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const storeData = {
                name: form.name.trim(),
                clientEmail: form.clientEmail.trim().toLowerCase(),
                ownerId: form.ownerId,
                collections: form.collections,
                settings: {
                    theme: form.theme,
                    paymentMethods: form.paymentMethods
                }
            };

            const response = await storeService.createStoreWithOwner(storeData, token!);

            if (response.data.newToken) {
                await refreshAuthToken();
            }

            const selectedCount = Object.values(form.collections).filter(Boolean).length;

            Alert.alert(
                'Sucesso',
                `Loja "${form.name}" criada com sucesso!\n\n${selectedCount} coleções foram ativadas.`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível criar a loja'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const selectUser = (user: UserOption) => {
        setForm(prev => ({
            ...prev,
            ownerId: user.id,
            ownerName: user.name
        }));
        setShowUserPicker(false);
    };

    const toggleCollection = (collectionKey: string) => {
        setForm(prev => ({
            ...prev,
            collections: {
                ...prev.collections,
                [collectionKey]: !prev.collections[collectionKey]
            }
        }));
    };

    const toggleAllCollections = (enable: boolean) => {
        const newCollections: Record<string, boolean> = {};
        availableCollections.forEach(collection => {
            newCollections[collection.key] = enable;
        });

        setForm(prev => ({
            ...prev,
            collections: newCollections
        }));
    };

    const getSelectedCollectionsCount = () => {
        return Object.values(form.collections).filter(Boolean).length;
    };

    const paymentOptions = [
        { value: 'credit_card', label: 'Cartão de Crédito' },
        { value: 'debit_card', label: 'Cartão de Débito' },
        { value: 'pix', label: 'PIX' },
        { value: 'boleto', label: 'Boleto' }
    ];

    const togglePaymentMethod = (method: string) => {
        setForm(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.includes(method)
                ? prev.paymentMethods.filter(m => m !== method)
                : [...prev.paymentMethods, method]
        }));
    };

    const getCollectionIcon = (icon: string): any => {
        const iconMap: { [key: string]: any } = {
            'woman': 'woman-outline',
            'construct': 'construct-outline',
            'watch': 'watch-outline',
            'shirt': 'shirt-outline',
            'fitness': 'fitness-outline',
            'body': 'body-outline',
            'sunny': 'sunny-outline',
            'footsteps': 'footsteps-outline',
            'bag': 'bag-outline',
            'pants': 'pants-outline',
            'business': 'business-outline',
            'heart': 'heart-outline',
            'happy': 'happy-outline',
            'man': 'man-outline',
            'default': 'cube-outline'
        };
        return iconMap[icon] || iconMap['default'];
    };

    const renderCollectionItem = ({ item }: { item: CollectionOption }) => {
        const isSelected = form.collections[item.key] || false;

        return (
            <TouchableOpacity
                style={[
                    styles.collectionItem,
                    isSelected && styles.collectionItemSelected
                ]}
                onPress={() => toggleCollection(item.key)}
            >
                <View style={styles.collectionItemContent}>
                    <View style={[
                        styles.collectionIcon,
                        { backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.1)' }
                    ]}>
                        <Ionicons
                            name={getCollectionIcon(item.icon)}
                            size={20}
                            color={isSelected ? '#667eea' : 'rgba(255,255,255,0.6)'}
                        />
                    </View>
                    <View style={styles.collectionInfo}>
                        <Text style={[
                            styles.collectionName,
                            { color: isSelected ? '#667eea' : 'white' }
                        ]}>
                            {item.displayName}
                        </Text>
                        <Text style={styles.collectionCategory}>{item.category}</Text>
                        <Text style={styles.collectionDescription}>{item.description}</Text>
                    </View>
                    <View style={[
                        styles.collectionCheckbox,
                        isSelected && styles.collectionCheckboxSelected
                    ]}>
                        {isSelected && (
                            <Ionicons name="checkmark" size={16} color="white" />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Criar Loja</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Store Info */}
                    <View style={styles.formCard}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                            style={styles.formGradient}
                        >
                            <View style={styles.formHeader}>
                                <Ionicons name="storefront" size={24} color="#667eea" />
                                <Text style={styles.formTitle}>Informações da Loja</Text>
                            </View>

                            {/* Nome da Loja */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Nome da Loja</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="storefront" size={20} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.name}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                                        placeholder="Digite o nome da loja"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                    />
                                </View>
                                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                            </View>

                            {/* Email do Cliente */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email do Cliente</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail" size={20} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.clientEmail}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, clientEmail: text }))}
                                        placeholder="Email para contato da loja"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.clientEmail && <Text style={styles.errorText}>{errors.clientEmail}</Text>}
                            </View>

                            {/* Proprietário */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Proprietário</Text>
                                <TouchableOpacity
                                    style={styles.userPickerButton}
                                    onPress={() => setShowUserPicker(true)}
                                >
                                    <Ionicons name="person" size={20} color="rgba(255,255,255,0.6)" />
                                    <Text style={[
                                        styles.userPickerText,
                                        !form.ownerName && styles.userPickerPlaceholder
                                    ]}>
                                        {form.ownerName || 'Selecione o proprietário'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                                {errors.ownerId && <Text style={styles.errorText}>{errors.ownerId}</Text>}
                            </View>

                            {/* Payment Methods */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Métodos de Pagamento</Text>
                                <View style={styles.checkboxGroup}>
                                    {paymentOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={styles.checkboxOption}
                                            onPress={() => togglePaymentMethod(option.value)}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                form.paymentMethods.includes(option.value) && styles.checkboxSelected
                                            ]}>
                                                {form.paymentMethods.includes(option.value) && (
                                                    <Ionicons name="checkmark" size={16} color="white" />
                                                )}
                                            </View>
                                            <Text style={styles.checkboxLabel}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Collections Selection */}
                    <ScrollView style={styles.formCard}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                            style={styles.formGradient}
                        >
                            <View style={styles.formHeader}>
                                <Ionicons name="apps" size={24} color="#667eea" />
                                <View style={styles.collectionsHeaderContent}>
                                    <Text style={styles.formTitle}>Coleções da Loja</Text>
                                    <Text style={styles.collectionsSubtitle}>
                                        {getSelectedCollectionsCount()} de {availableCollections.length} selecionadas
                                    </Text>
                                </View>
                            </View>

                            {/* Bulk Actions */}
                            <View style={styles.bulkActions}>
                                <TouchableOpacity
                                    style={styles.bulkActionButton}
                                    onPress={() => toggleAllCollections(true)}
                                >
                                    <Text style={styles.bulkActionText}>Selecionar Todas</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.bulkActionButton}
                                    onPress={() => toggleAllCollections(false)}
                                >
                                    <Text style={styles.bulkActionText}>Desmarcar Todas</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Collections List */}
                            <View style={styles.collectionsContainer}>
                                <FlatList
                                    data={availableCollections}
                                    renderItem={renderCollectionItem}
                                    keyExtractor={(item) => item.key}
                                    scrollEnabled={false}
                                    ItemSeparatorComponent={() => <View style={styles.collectionSeparator} />}
                                />
                            </View>
                        </LinearGradient>
                    </ScrollView>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.submitGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Ionicons name="add" size={20} color="white" />
                                    <Text style={styles.submitText}>Criar Loja</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>

            {/* User Picker Modal */}
            {showUserPicker && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                            style={styles.modalGradient}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecionar Proprietário</Text>
                                <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            {isLoadingUsers ? (
                                <ActivityIndicator size="large" color="#667eea" style={{ marginVertical: 20 }} />
                            ) : (
                                <FlatList
                                    data={availableUsers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.userOption}
                                            onPress={() => selectUser(item)}
                                        >
                                            <View style={styles.userInfo}>
                                                <Text style={styles.userName}>{item.name}</Text>
                                                <Text style={styles.userEmail}>{item.email}</Text>
                                                <Text style={styles.userRole}>{item.role}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={styles.userSeparator} />}
                                />
                            )}
                        </LinearGradient>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
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
    scrollContent: {
        flex: 1,
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

    // Form
    formCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    formGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 20,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 12,
    },

    // Collections Header
    collectionsHeaderContent: {
        marginLeft: 12,
        flex: 1,
    },
    collectionsSubtitle: {
        fontSize: 12,
        color: 'rgba(102, 126, 234, 0.8)',
        marginTop: 2,
    },

    // Bulk Actions
    bulkActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    bulkActionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.3)',
    },
    bulkActionText: {
        fontSize: 12,
        color: '#667eea',
        fontWeight: '600',
    },

    // Collections Container
    collectionsContainer: {
        maxHeight: 400,
    },
    collectionItem: {
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    collectionItemSelected: {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderColor: 'rgba(102, 126, 234, 0.3)',
    },
    collectionItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    collectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    collectionCategory: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 2,
    },
    collectionDescription: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 14,
    },
    collectionCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    collectionCheckboxSelected: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    collectionSeparator: {
        height: 8,
    },

    // Input Groups
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    textInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        marginLeft: 12,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },

    // User Picker
    userPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    userPickerText: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        marginLeft: 12,
    },
    userPickerPlaceholder: {
        color: 'rgba(255,255,255,0.4)',
    },

    // Checkbox Group
    checkboxGroup: {
        gap: 12,
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxSelected: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    checkboxLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },

    // Submit Button
    submitButton: {
        marginTop: 20,
        marginBottom: 40,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Modal
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },

    // User Options
    userOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    userSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4,
    },
});