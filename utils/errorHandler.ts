// src/utils/errorHandler.ts
export const handleApiError = (error: any): string => {
    if (error.statusCode === 401) {
        return 'Sessão expirada. Faça login novamente.';
    }
    if (error.statusCode === 403) {
        return 'Você não tem permissão para esta ação.';
    }
    if (error.statusCode === 404) {
        return 'Recurso não encontrado.';
    }
    if (error.statusCode === 422) {
        return 'Dados inválidos. Verifique as informações.';
    }
    if (error.statusCode === 0) {
        return 'Erro de conexão. Verifique sua internet.';
    }

    return error.message || 'Erro inesperado. Tente novamente.';
};