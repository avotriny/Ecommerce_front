import { createSlice } from "@reduxjs/toolkit";
const persistedCart = localStorage.getItem("cart");
const initialState = persistedCart
  ? JSON.parse(persistedCart)
  : {
      items: [],        // { id, nom_prod, prix_prod, quantity, images, desc_prod, category }
      totalQuantity: 0, // nombre total d'articles
      total: 0          // somme totale du panier
    };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(i => i.id === item.id);
      const prix = parseFloat(item.prix_prod) || 0;

      state.totalQuantity += 1;
      state.total += prix;

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
    },

    removeItem: (state, action) => {
      const id = action.payload;
      const existing = state.items.find(i => i.id === id);
      if (!existing) return;

      const prix = parseFloat(existing.prix_prod) || 0;
      state.totalQuantity -= 1;
      state.total -= prix;

      if (existing.quantity === 1) {
        state.items = state.items.filter(i => i.id !== id);
      } else {
        existing.quantity -= 1;
      }
    },

    updateQuantity: (state, action) => {
      const { id, delta } = action.payload;
      const existing = state.items.find(i => i.id === id);
      if (!existing) return;

      const prix = parseFloat(existing.prix_prod) || 0;
      if (delta === -1 && existing.quantity === 1) {
        state.items = state.items.filter(i => i.id !== id);
      } else {
        existing.quantity += delta;
      }
      state.totalQuantity += delta;
      state.total += prix * delta;
    },

    clearCart: state => {
      state.items = [];
      state.totalQuantity = 0;
      state.total = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
