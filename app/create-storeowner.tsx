// ========================================
// CreateStoreWithOwnerScreen.tsx
// ========================================

import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
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


import { storeService } from '@/services/storeService';

interface CreateStoreForm {
    name: string;
    clientEmail: string;
    ownerId: string;
    ownerName: string; // Para display
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

export default function CreateStoreWithOwnerScreen() {
    console.log("tela crate store")
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
                // Atualizar token se necessário
                await refreshAuthToken();
            }

            Alert.alert(
                'Sucesso',
                'Loja criada com sucesso!',
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

    // Role Selection
    roleOption: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    roleOptionSelected: {
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
    },
    roleOptionContent: {
        flex: 1,
    },
    roleOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    roleOptionLabel: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    roleOptionLabelSelected: {
        color: '#667eea',
    },
    roleOptionDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 18,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: '#667eea',
    },
    radioButtonInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#667eea',
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
