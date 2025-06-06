
import {Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './utils/scrollToTop';
import PageTransition from './utils/PageTransition';
import Nav from './components/Nav';
import Accueil from './components/Accueil';
import Contact from './components/Contact';
import Experience from './components/Experience';
import Education from './components/Education';
import Competence from './components/Competence';
import Service from "./components/Service";
import Footer from './components/Footer';

function App() {
const location = useLocation(); 

  return (

    <ThemeProvider>
      <PageTransition>

        
        <Nav />
    
    <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Accueil />} />
             <Route path="/education" element={<Education />} />
             <Route path="/service" element={<Service />} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/competence" element={<Competence/>} /> 
            <Route path="/experience" element={<Experience />} />
           
           
          </Routes>

     <ScrollToTop />
        <Footer />
      </PageTransition>
    </ThemeProvider>
  )
}

export default App
