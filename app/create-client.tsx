// ========================================
// CreateClientScreen.tsx
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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateClientForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'PVMO_ADMIN' | 'PLATFORM_USER';
}

export default function CreateClientScreen() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState<CreateClientForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PLATFORM_USER'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<CreateClientForm>>({});

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        if (!user || !token || user.role !== 'PVMO_ADMIN') {
            router.replace('/login');
            return;
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
    }, [user, token]);

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateClientForm> = {};

        if (!form.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!form.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!form.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (form.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Senhas não conferem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const userData = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                role: form.role
            };

            await authService.createPlatformUser(userData, token!);

            Alert.alert(
                'Sucesso',
                'Cliente criado com sucesso!',
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
                error.message || 'Não foi possível criar o cliente'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = [
        { value: 'PVMO_ADMIN', label: 'Admin da Plataforma', description: 'Gerenciador de Todo o siatema' },
        { value: 'PLATFORM_USER', label: 'Proprietário', description: 'Pode criar e gerenciar suas lojas e funcionários' }
    ];

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
                    <Text style={styles.title}>Criar Cliente</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                            style={styles.formGradient}
                        >
                            <View style={styles.formHeader}>
                                <Ionicons name="person-add" size={24} color="#667eea" />
                                <Text style={styles.formTitle}>Dados do Cliente</Text>
                            </View>

                            {/* Nome */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Nome Completo</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person" size={20} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.name}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                                        placeholder="Digite o nome completo"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        autoCapitalize="words"
                                    />
                                </View>
                                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail" size={20} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.email}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                                        placeholder="Digite o email"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                            </View>

                            {/* Senha */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Senha</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.password}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                                        placeholder="Digite a senha"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        secureTextEntry
                                    />
                                </View>
                                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                            </View>

                            {/* Confirmar Senha */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Confirmar Senha</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.confirmPassword}
                                        onChangeText={(text) => setForm(prev => ({ ...prev, confirmPassword: text }))}
                                        placeholder="Confirme a senha"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        secureTextEntry
                                    />
                                </View>
                                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                            </View>

                            {/* Role Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tipo de Usuário</Text>
                                {roleOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.roleOption,
                                            form.role === option.value && styles.roleOptionSelected
                                        ]}
                                        onPress={() => setForm(prev => ({ ...prev, role: option.value as any }))}
                                    >
                                        <View style={styles.roleOptionContent}>
                                            <View style={styles.roleOptionHeader}>
                                                <Text style={[
                                                    styles.roleOptionLabel,
                                                    form.role === option.value && styles.roleOptionLabelSelected
                                                ]}>
                                                    {option.label}
                                                </Text>
                                                <View style={[
                                                    styles.radioButton,
                                                    form.role === option.value && styles.radioButtonSelected
                                                ]}>
                                                    {form.role === option.value && (
                                                        <View style={styles.radioButtonInner} />
                                                    )}
                                                </View>
                                            </View>
                                            <Text style={styles.roleOptionDescription}>
                                                {option.description}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
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
                                    <Ionicons name="checkmark" size={20} color="white" />
                                    <Text style={styles.submitText}>Criar Cliente</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
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
