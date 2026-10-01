import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const CartContext = createContext(null);
const STORAGE_KEY = 'rumbo-serrano-carrito';

const leerCarritoGuardado = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const location = useLocation();
    const [items, setItems] = useState(leerCarritoGuardado);
    const [isLoading, setIsLoading] = useState(true);

    const refreshCart = useCallback(async () => {
        if (!localStorage.getItem('token')) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get('/carrito');
            setItems(response.data?.ItemCarritos || []);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        refreshCart().catch((error) => console.error('Error al sincronizar el carrito:', error));
    }, [location.pathname, refreshCart]);

    const removeItem = useCallback(async (itemId) => {
        await api.delete(`/carrito/items/${itemId}`);
        setItems((current) => current.filter((item) => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback(async (itemId, cantidad) => {
        setItems((current) => current.map((item) => (
            item.id === itemId ? { ...item, cantidad } : item
        )));
        try {
            await api.put(`/carrito/items/${itemId}`, { cantidad });
        } catch (error) {
            await refreshCart();
            throw error;
        }
    }, [refreshCart]);

    const clearCart = useCallback(() => setItems([]), []);
    const totalQuantity = items.reduce((total, item) => total + Number(item.cantidad || 0), 0);
    const totalPrice = items.reduce((total, item) => (
        total + Number(item.Actividad?.precio || 0) * Number(item.cantidad || 0)
    ), 0);

    const value = useMemo(() => ({
        items,
        isLoading,
        totalQuantity,
        totalPrice,
        refreshCart,
        removeItem,
        updateQuantity,
        clearCart
    }), [items, isLoading, totalQuantity, totalPrice, refreshCart, removeItem, updateQuantity, clearCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};