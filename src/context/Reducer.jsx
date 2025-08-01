const reducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true };
    case 'END_LOADING':
      return { ...state, loading: false };
    case 'UPDATE_ALERT':
      return { ...state, alert: action.payload };
      case 'UPDATE_USER':
      return { ...state, currentUser: action.payload };

      case 'LOGOUT':
      return {
        ...state,
        currentUser: null
      };
  
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default reducer;
