import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
// same as cart store but wishlist implementation
const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => cartItem.id === item.id
          )

          if (existingItem) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + 1,
                    }
                  : cartItem
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: 1,
              },
            ],
          }
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useCartStore