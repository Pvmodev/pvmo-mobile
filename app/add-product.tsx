import { useAuth } from '@/contexts/AuthContext';
import { ProductData, productService } from '@/services/productService';
import { storeService } from '@/services/storeService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ProductForm {
    name: string;
    description: string;
    type: string;
    price: number;
    storageP: number;
    storageM: number;
    storageG: number;
    storageU: number;
    storageChild?: number;
    storagePP?: number;
    storageGG?: number;
    storageEXG?: number;
    storageLocation: string;
    isActive: boolean;
    featured: boolean;
    discount: number;
    sponsor: string;
    tag: string[];
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'in';
    };
    correlated: string[];
    marketAffiliateIds: string[];
    videoUrl: string[];
}

interface ImageState {
    uri: string;
    uploadUrl?: string;
    isUploading: boolean;
    uploadError?: string;
}

export default function AddProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ collectionKey: string }>();
    const { user, token, storeData, refreshStoreData } = useAuth();

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        description: '',
        type: params.collectionKey || '',
        price: 0,
        storageP: 0,
        storageM: 0,
        storageG: 0,
        storageU: 0,
        storageChild: 0,
        storagePP: 0,
        storageGG: 0,
        storageEXG: 0,
        storageLocation: '',
        isActive: true,
        featured: false,
        discount: 0,
        sponsor: 'beladaareia.com.br',
        tag: [],
        weight: 0,
        dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'cm',
        },
        correlated: [],
        marketAffiliateIds: [],
        videoUrl: [],
    });

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [imageStates, setImageStates] = useState<ImageState[]>([]);
    const [isAddingImages, setIsAddingImages] = useState(false);
    const [tagsInputText, setTagsInputText] = useState('');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [collectionInfo, setCollectionInfo] = useState<any>(null);

    const availableColors = [
        { name: 'vermelho', color: '#FF0000' },
        { name: 'rosa', color: '#FFC0CB' },
        { name: 'laranja', color: '#FFA500' },
        { name: 'marrom', color: '#8B4513' },
        { name: 'azul', color: '#0000FF' },
        { name: 'verde', color: '#008000' },
        { name: 'amarelo', color: '#FFFF00' },
        { name: 'roxo', color: '#800080' },
        { name: 'preto', color: '#000000' },
        { name: 'branco', color: '#FFFFFF' },
        { name: 'cinza', color: '#808080' }
    ];

    useEffect(() => {
        if (!user || !token) {
            router.replace('/login');
            return;
        }

        if (!params.collectionKey) {
            Alert.alert('Erro', 'Coleção não especificada');
            router.back();
            return;
        }

        // Verificar dados da loja
        if (!storeData) {
            // Tentar carregar dados da loja
            refreshStoreData().catch(() => {
                Alert.alert('Erro', 'Não foi possível carregar dados da loja');
                router.back();
            });
            return;
        }

        // Verificar se a coleção está ativa
        initializeCollection();

        // Animação de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [user, token, storeData, params.collectionKey]);

    const initializeCollection = () => {
        if (!storeData || !params.collectionKey) return;

        const collection = storeService.getCollectionInfo(storeData, params.collectionKey);

        if (!collection) {
            Alert.alert(
                'Coleção não encontrada',
                'Esta coleção não existe ou não está disponível.',
                [{ text: 'Voltar', onPress: () => router.back() }]
            );
            return;
        }

        if (!collection.isActive) {
            Alert.alert(
                'Coleção Inativa',
                `A coleção "${collection.displayName}" não está ativa na sua loja.`,
                [{ text: 'Voltar', onPress: () => router.back() }]
            );
            return;
        }

        setCollectionInfo(collection);

        // Definir o tipo baseado na coleção
        setFormData(prev => ({
            ...prev,
            type: collection.displayName
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.type?.trim()) {
            newErrors.type = 'Categoria é obrigatória';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Preço deve ser maior que zero';
        }

        if (formData.discount && (formData.discount < 0 || formData.discount > 100)) {
            newErrors.discount = 'Desconto deve estar entre 0 e 100%';
        }

        if (imageStates.length === 0) {
            newErrors.images = 'Adicione pelo menos uma imagem';
        }

        const hasUploadingImages = imageStates.some(img => img.isUploading);
        if (hasUploadingImages) {
            newErrors.images = 'Aguarde o upload de todas as imagens terminar';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async () => {
        if (imageStates.length >= 5) {
            Alert.alert('Limite atingido', 'Você pode adicionar no máximo 5 imagens por produto.');
            return;
        }

        if (isAddingImages) {
            Alert.alert('Aguarde', 'Processando imagem anterior...');
            return;
        }

        setIsAddingImages(true);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria de fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const newImageState: ImageState = {
                    uri: result.assets[0].uri,
                    isUploading: false,
                };

                setImageStates(prev => [...prev, newImageState]);

                if (errors.images) {
                    setErrors(prev => ({ ...prev, images: '' }));
                }
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        } finally {
            setIsAddingImages(false);
        }
    };

    const removeImage = (index: number) => {
        Alert.alert(
            'Remover Imagem',
            'Tem certeza que deseja remover esta imagem?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => {
                        setImageStates(prev => prev.filter((_, i) => i !== index));
                    }
                }
            ]
        );
    };

    // CORRIGIDO: Método handleSave para usar storeSlug
    const handleSave = async () => {
        if (!validateForm() || !token || !storeData) {
            Alert.alert('Erro', 'Verifique os campos obrigatórios');
            return;
        }

        setIsSaving(true);

        try {
            // Simular URLs de imagem (em produção, você faria upload real)
            const imageUrls = imageStates.map((img, index) =>
                `https://example.com/products/${params.collectionKey!}/${Date.now()}_${index}.jpg`
            );

            const productData: ProductData = {
                collectionKey: params.collectionKey!,
                name: formData.name,
                type: formData.type,
                description: formData.description,
                imageList: imageUrls,
                videoUrl: formData.videoUrl,
                tag: formData.tag,
                storageP: formData.storageP,
                storageM: formData.storageM,
                storageG: formData.storageG,
                storageU: formData.storageU,
                storageChild: formData.storageChild,
                storagePP: formData.storagePP,
                storageGG: formData.storageGG,
                storageEXG: formData.storageEXG,
                storageLocation: formData.storageLocation,
                price: formData.price,
                discount: formData.discount,
                featured: formData.featured,
                isActive: formData.isActive,
                sponsor: formData.sponsor,
                weight: formData.weight,
                dimensions: formData.dimensions,
                correlated: formData.correlated,
                marketAffiliateIds: formData.marketAffiliateIds,
                analytics: {
                    views: 0,
                    sales: 0,
                    addCart: 0,
                    review: 0,
                },
            };

            // CORRIGIDO: Usar storeSlug em vez de storeId
            await productService.createProduct(storeData.slug, productData, token);

            Alert.alert(
                'Sucesso',
                `Produto "${formData.name}" criado com sucesso na coleção "${collectionInfo?.displayName}"!`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );

        } catch (error: any) {
            console.error('Erro ao salvar produto:', error);

            let errorMessage = 'Não foi possível salvar o produto.';
            if (error.statusCode === 401) {
                errorMessage = 'Você não tem permissão para criar produtos nesta loja.';
            } else if (error.statusCode === 403) {
                errorMessage = 'Esta coleção não está ativa ou você não tem acesso.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const sanitizeTag = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const updateCombinedTags = (name: string, colors: string[], manualTags: string[]) => {
        const nameTags = name.trim() ? name.split(' ').map(word => sanitizeTag(word)).filter(Boolean) : [];
        const allTags = [...nameTags, ...colors, ...manualTags];
        const uniqueTags = Array.from(new Set(allTags));

        setFormData(prev => ({ ...prev, tag: uniqueTags }));
        return uniqueTags;
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({ ...prev, name }));
        const manualTags = tagsInputText
            .split(',')
            .map(tag => sanitizeTag(tag))
            .filter(tag => tag.length > 0);

        updateCombinedTags(name, selectedColors, manualTags);
    };

    const handleColorToggle = (colorName: string) => {
        const newSelectedColors = selectedColors.includes(colorName)
            ? selectedColors.filter(c => c !== colorName)
            : [...selectedColors, colorName];

        setSelectedColors(newSelectedColors);

        const manualTags = tagsInputText
            .split(',')
            .map(tag => sanitizeTag(tag))
            .filter(tag => tag.length > 0);

        updateCombinedTags(formData.name, newSelectedColors, manualTags);
    };

    const handleManualTagsChange = (text: string) => {
        setTagsInputText(text);

        const manualTags = text
            .split(',')
            .map(tag => sanitizeTag(tag))
            .filter(tag => tag.length > 0);

        updateCombinedTags(formData.name, selectedColors, manualTags);
    };

    const renderField = (
        label: string,
        key: keyof ProductForm,
        placeholder?: string,
        keyboardType: 'default' | 'numeric' = 'default',
        multiline = false,
        customOnChange?: (text: string) => void
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    errors[key] && styles.inputError
                ]}
                value={String(formData[key] || '')}
                onChangeText={customOnChange || ((text) => setFormData({ ...formData, [key]: text }))}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
            />
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
        </View>
    );

    const renderNumberField = (label: string, key: keyof ProductForm, placeholder?: string) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.input, errors[key] && styles.inputError]}
                value={String(formData[key] || '0')}
                onChangeText={(text) => {
                    const numValue = text.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, [key]: Number(numValue) || 0 });
                }}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
            />
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
        </View>
    );

    const renderSwitchField = (label: string, key: keyof ProductForm, description?: string) => (
        <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
                <Text style={styles.fieldLabel}>{label}</Text>
                {description && <Text style={styles.switchDescription}>{description}</Text>}
            </View>
            <Switch
                value={Boolean(formData[key])}
                onValueChange={(value) => setFormData({ ...formData, [key]: value })}
                trackColor={{ false: '#767577', true: '#667eea' }}
                thumbColor={formData[key] ? '#ffffff' : '#f4f3f4'}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Novo Produto</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.saveButtonText}>Salvar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Collection Info */}
                    <View style={styles.collectionInfo}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                            style={styles.collectionGradient}
                        >
                            <View style={styles.collectionHeader}>
                                <View style={styles.collectionIconContainer}>
                                    <Ionicons
                                        name={collectionInfo?.icon as any || 'cube-outline'}
                                        size={20}
                                        color="#667eea"
                                    />
                                </View>
                                <View style={styles.collectionTextContainer}>
                                    <Text style={styles.collectionText}>
                                        {collectionInfo?.displayName || 'Coleção'}
                                    </Text>
                                    <Text style={styles.collectionDescription}>
                                        {collectionInfo?.description || 'Adicionando novo produto'}
                                    </Text>
                                </View>
                            </View>

                            {storeData && (
                                <View style={styles.storeInfo}>
                                    <Ionicons name="storefront-outline" size={14} color="rgba(255,255,255,0.6)" />
                                    <Text style={styles.storeInfoText}>
                                        Loja: {storeData.name}
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                    </View>

                    {/* Images Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Imagens do Produto *</Text>

                        <TouchableOpacity
                            style={[
                                styles.addImageButton,
                                isAddingImages && styles.addImageButtonDisabled
                            ]}
                            onPress={pickImage}
                            disabled={isAddingImages || imageStates.length >= 5}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.addImageGradient}
                            >
                                {isAddingImages ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="camera" size={24} color="white" />
                                        <Text style={styles.addImageText}>
                                            {imageStates.length === 0
                                                ? 'Adicionar Imagem'
                                                : `Adicionar Mais (${imageStates.length}/5)`
                                            }
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {imageStates.length > 0 && (
                            <View style={styles.imageGrid}>
                                {imageStates.map((imageState, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri: imageState.uri }} style={styles.productImage} />

                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                        </TouchableOpacity>

                                        {index === 0 && (
                                            <View style={styles.primaryImageBadge}>
                                                <Text style={styles.primaryImageText}>Principal</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
                    </View>

                    {/* Basic Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informações Básicas</Text>

                        {renderField('Nome do Produto *', 'name', 'Digite o nome do produto', 'default', false, handleNameChange)}
                        {renderField('Descrição', 'description', 'Descrição detalhada do produto', 'default', true)}
                        {renderField('Sponsor/Fornecedor', 'sponsor', 'Nome do fornecedor')}
                    </View>

                    {/* Color Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cores do Produto</Text>
                        <Text style={styles.colorSelectorHint}>
                            Selecione as cores do produto (aparecerão automaticamente nas tags)
                        </Text>

                        <View style={styles.colorGrid}>
                            {availableColors.map((colorItem) => {
                                const isSelected = selectedColors.includes(colorItem.name);
                                return (
                                    <TouchableOpacity
                                        key={colorItem.name}
                                        style={[
                                            styles.colorButton,
                                            isSelected && styles.colorButtonSelected
                                        ]}
                                        onPress={() => handleColorToggle(colorItem.name)}
                                    >
                                        <View
                                            style={[
                                                styles.colorCircle,
                                                { backgroundColor: colorItem.color },
                                                colorItem.name === 'branco' && styles.whiteColorBorder
                                            ]}
                                        />
                                        {isSelected && (
                                            <View style={styles.colorSelectedIndicator}>
                                                <Ionicons name="checkmark" size={16} color="#667eea" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {selectedColors.length > 0 && (
                            <View style={styles.selectedColorsContainer}>
                                <LinearGradient
                                    colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
                                    style={styles.selectedColorsGradient}
                                >
                                    <Text style={styles.selectedColorsLabel}>Cores selecionadas:</Text>
                                    <Text style={styles.selectedColorsText}>
                                        {selectedColors.join(', ')}
                                    </Text>
                                </LinearGradient>
                            </View>
                        )}
                    </View>

                    {/* Price and Discount */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preço e Promoções</Text>

                        {renderNumberField('Preço (R$) *', 'price', '0.00')}
                        {renderNumberField('Desconto (%)', 'discount', '0')}
                    </View>

                    {/* Stock */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Controle de Estoque</Text>

                        <View style={styles.stockGrid}>
                            <View style={styles.stockItem}>
                                {renderNumberField('PP', 'storagePP', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('P', 'storageP', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('M', 'storageM', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('G', 'storageG', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('GG', 'storageGG', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('EXG', 'storageEXG', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('U', 'storageU', '0')}
                            </View>
                            <View style={styles.stockItem}>
                                {renderNumberField('Infantil', 'storageChild', '0')}
                            </View>
                        </View>

                        {renderField('Localização no Estoque', 'storageLocation', 'Ex: Prateleira A1')}
                    </View>

                    {/* Physical Characteristics */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Características Físicas</Text>

                        {renderNumberField('Peso (g)', 'weight', '0.0')}

                        <Text style={styles.fieldLabel}>Dimensões (cm)</Text>
                        <View style={styles.dimensionsGrid}>
                            <View style={styles.dimensionItem}>
                                <Text style={styles.dimensionLabel}>Comprimento</Text>
                                <TextInput
                                    style={styles.input}
                                    value={String(formData.dimensions.length)}
                                    onChangeText={(text) => {
                                        const numValue = Number(text.replace(/[^0-9.]/g, '')) || 0;
                                        setFormData({
                                            ...formData,
                                            dimensions: { ...formData.dimensions, length: numValue }
                                        });
                                    }}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.dimensionItem}>
                                <Text style={styles.dimensionLabel}>Largura</Text>
                                <TextInput
                                    style={styles.input}
                                    value={String(formData.dimensions.width)}
                                    onChangeText={(text) => {
                                        const numValue = Number(text.replace(/[^0-9.]/g, '')) || 0;
                                        setFormData({
                                            ...formData,
                                            dimensions: { ...formData.dimensions, width: numValue }
                                        });
                                    }}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.dimensionItem}>
                                <Text style={styles.dimensionLabel}>Altura</Text>
                                <TextInput
                                    style={styles.input}
                                    value={String(formData.dimensions.height)}
                                    onChangeText={(text) => {
                                        const numValue = Number(text.replace(/[^0-9.]/g, '')) || 0;
                                        setFormData({
                                            ...formData,
                                            dimensions: { ...formData.dimensions, height: numValue }
                                        });
                                    }}
                                    placeholder="0"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tags</Text>

                        {formData.tag.length > 0 && (
                            <View style={styles.tagsPreviewContainer}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                                    style={styles.tagsPreviewGradient}
                                >
                                    <Text style={styles.tagsPreviewLabel}>Tags atuais:</Text>
                                    <View style={styles.tagsPreview}>
                                        {formData.tag.map((tag, index) => (
                                            <View key={index} style={styles.tagChip}>
                                                <Text style={styles.tagChipText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </LinearGradient>
                            </View>
                        )}

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Tags Adicionais (separadas por vírgula)</Text>
                            <TextInput
                                style={styles.input}
                                value={tagsInputText}
                                onChangeText={handleManualTagsChange}
                                placeholder="Ex: verão, praia, esporte"
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                multiline
                            />
                            <Text style={styles.fieldHint}>
                                Tags do nome e cores são adicionadas automaticamente
                            </Text>
                        </View>
                    </View>

                    {/* Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Configurações</Text>

                        {renderSwitchField(
                            'Produto Ativo',
                            'isActive',
                            'Define se o produto será exibido na loja'
                        )}

                        {renderSwitchField(
                            'Produto em Destaque',
                            'featured',
                            'Produtos em destaque aparecem primeiro'
                        )}
                    </View>

                    <View style={styles.bottomSpacing} />
                </ScrollView>
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
        paddingHorizontal: 20,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    saveButton: {
        backgroundColor: '#667eea',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#666',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Collection info
    collectionInfo: {
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    collectionGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 16,
    },
    collectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    collectionIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    collectionTextContainer: {
        flex: 1,
    },
    collectionText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '600',
    },
    collectionDescription: {
        fontSize: 12,
        color: 'rgba(102, 126, 234, 0.8)',
        marginTop: 2,
    },
    storeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    storeInfoText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },

    // Sections
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },

    // Images
    addImageButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    addImageButtonDisabled: {
        opacity: 0.6,
    },
    addImageGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    addImageText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    imageContainer: {
        position: 'relative',
        width: (screenWidth - 64) / 3,
        height: (screenWidth - 64) / 3,
    },
    productImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    primaryImageBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(102, 126, 234, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    primaryImageText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },

    // Form fields
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: 'white',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    multilineInput: {
        paddingTop: 12,
        paddingBottom: 12,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    fieldHint: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 4,
    },

    // Colors
    colorSelectorHint: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 12,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    colorButton: {
        alignItems: 'center',
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minWidth: 60,
        position: 'relative',
    },
    colorButtonSelected: {
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: '#667eea',
    },
    colorCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginBottom: 4,
    },
    whiteColorBorder: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    colorSelectedIndicator: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 1,
    },
    selectedColorsContainer: {
        marginTop: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    selectedColorsGradient: {
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.3)',
    },
    selectedColorsLabel: {
        fontSize: 12,
        color: '#667eea',
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedColorsText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },

    // Stock
    stockGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    stockItem: {
        flex: 1,
        minWidth: (screenWidth - 64) / 4,
    },

    // Dimensions
    dimensionsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dimensionItem: {
        flex: 1,
    },
    dimensionLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },

    // Tags
    tagsPreviewContainer: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tagsPreviewGradient: {
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tagsPreviewLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginBottom: 8,
    },
    tagsPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tagChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.3)',
    },
    tagChipText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '500',
    },

    // Switch
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    switchTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    switchDescription: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },

    bottomSpacing: {
        height: 40,
    },
});