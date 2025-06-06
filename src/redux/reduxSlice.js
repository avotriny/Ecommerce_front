// slices/productSlice.js
import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    produits: [],
    filteredProduits: [],
    categories: [],
    priceFilter: 2000,
  },
  reducers: {
    setProduits: (state, action) => {
      state.produits = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    filterPrice: (state, action) => {
      const prix_prod = action.payload;
      state.priceFilter = prix_prod;
      state.filteredProduits = state.produits.filter(produit => produit.prix_prod <= prix_prod);
    },
  },
});

export const { setProduits, setCategories, filterPrice } = productSlice.actions;
export default productSlice.reducer;
