const reducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_LOGIN':
      return { ...state, openLogin: true };
    case 'CLOSE_LOGIN':
      return { ...state, openLogin: false };
    case 'START_LOADING':
      return { ...state, loading: true };
    case 'END_LOADING':
      return { ...state, loading: false };
    case 'UPDATE_ALERT':
      return { ...state, alert: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_USER':
      return { ...state, currentUser: action.payload };
    case 'UPDATE_USERS':
      return { ...state, users: action.payload };
    case 'UPDATE_IMAGES':
      return { ...state, images: [...state.images, ...action.payload] };
    case 'RESET_IMAGES':
      return { ...state, images: [] };
    case 'DELETE_IMAGE':
      return { ...state, images: state.images.filter((image) => image !== action.payload) };
    case 'UPDATE_DETAILS':
      return { ...state, details: { ...state.details, ...action.payload } };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'UPDATE_UPDATED_PRODUITS':
      return { ...state, updatedProduits: action.payload };
    case 'RESET_PRODUIT':
      return {
        ...state,
        images: [],
        details: { nom_prod: '', desc_prod: '', prix_prod: '', stock_prod: '', poids_prod: '', origin_prod: '', cat_id: '' },
        updatedProduit: null,
        deletedImages: [],
        addedImages: [],
      };
    case 'UPDATE_PRODUITS':
      return { ...state, produits: action.payload };
    case 'SET_FILTERED_PRODUITS':
      return {
        ...state,
        filteredProduits: action.payload,
      };
    case 'FILTER_PRICE':
      return {
        ...state,
        priceFilter: action.payload,
        filteredProduits: applyFilter(state.produits, action.payload),
      };
    
    case 'CLEAR_ADDRESS':
      return { ...state, addressFilter: null, priceFilter: 100, filteredProduits: state.produits };
    case 'UPDATE_PRODUIT':
      return { ...state, produit: action.payload };
    case 'DELETE_CHANTIER':
      return { ...state, produits: state.produits.filter((produit) => produit._id !== action.payload) };
    case 'UPDATE_SECTION':
      return { ...state, section: action.payload };
    case 'UPDATE_DELETED_IMAGES':
      return { ...state, deletedImages: [...state.deletedImages, ...action.payload] };
    case 'UPDATE_ADDED_IMAGES':
      return { ...state, addedImages: [...state.addedImages, ...action.payload] };
      case 'ADD_TO_CART':
        const productInCart = state.cart.find(item => item.id === action.payload.id);
        if (productInCart) {
          return {
            ...state,
            cart: state.cart.map(item =>
              item.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            cartCount: state.cartCount + 1,
            total: state.total + action.payload.prix_prod,
          };
        }
        return {
          ...state,
          cart: [...state.cart, { ...action.payload, quantity: 1 }],
          cartCount: state.cartCount + 1,
          total: state.total + action.payload.prix_prod,
        };
  
      case 'REMOVE_FROM_CART':
        const productToRemove = state.cart.find(item => item.id === action.payload.id);
        const updatedCart = state.cart.filter(item => item.id !== action.payload.id);
        return {
          ...state,
          cart: updatedCart,
          cartCount: state.cartCount - productToRemove.quantity,
          total: state.total - productToRemove.prix_prod * productToRemove.quantity,
        };
  
      case 'UPDATE_CART':
        return {
          ...state,
          cart: action.payload,
          total: action.payload.reduce(
            (acc, item) => acc + item.prix_prod * item.quantity,
            0
          ),
        };
  
      case 'RESET_CART':
        return { ...state, cart: [], cartCount: 0, total: 0 };
    case 'UPDATE_COMMANDES':
      return {...state, commandes:action.payload}
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const applyFilter = (produits, prix_prod) => {
  let filteredProduits = produits;
  if (prix_prod < 5000) {
    filteredProduits = filteredProduits.filter((produit) => produit.prix_prod <= prix_prod);
  }
  return filteredProduits;
};

export default reducer;
