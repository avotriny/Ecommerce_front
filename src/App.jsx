import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Loading from './Loading';
import Notification from './Notification';
import axios from 'axios'; 
import Navbar from './Navbar/Navbar'
import PageTransition from './utils/PageTransition';
import Accueil from './components/Accueil/accueil'
import Categorie from './Dashboard/Categorie/Categorie';


axios.defaults.baseURL = 'http://localhost:8000/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;
axios.interceptors.request.use(function(config) {  
    const token = localStorage.getItem('auth_token'); 
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    return config;
});

const App = () => {
  return (
<Router>
      <Navbar/>
      
      <Loading />
      <Notification />
      <PageTransition>
      <Routes>
      <Route path="/" element={<Accueil/>} />
        <Route path="/categorie" element={<Categorie />} />
        
        {/* <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Page404 />} />
        <Route element={<AdminPrivateRoutes />} >
        <Route path="/dashboard/*" element={<Dashboard />} /> */}
        {/* </Route> */}

      </Routes>
      </PageTransition>
      </Router>
      

  );
};

export default App;
