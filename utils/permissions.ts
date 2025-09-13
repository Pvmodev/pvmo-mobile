// src/utils/permissions.ts
import { User } from '../types';
export const canCreateProduct = (user: User, storeSlug: string): boolean => {
    if (user.role === 'PVMO_ADMIN') return true;

    const storeAccess = user.stores.find(s => s.storeSlug === storeSlug);
    return storeAccess?.storeRole === 'OWNER' ||
        storeAccess?.storeRole === 'MANAGER' ||
        storeAccess?.permissions.canManageProducts === true;
};