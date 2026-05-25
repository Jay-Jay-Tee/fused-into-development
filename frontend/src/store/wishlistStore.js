import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      name: 'wishlist-storage'
    }
  )
)

export default useCartStore