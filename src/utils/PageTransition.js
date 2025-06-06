import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait"> {/* mode="wait" permet d'attendre la sortie complète avant d'entrer */}
            <motion.div
                key={location.pathname} 
                initial={{ opacity: 0 }}  // page commence avec opacité 0
                animate={{ opacity: 1 }}  // l'animation fait passer l'opacité à 1
                exit={{ opacity: 0 }}     // à la sortie, l'opacité revient à 0
                transition={{ duration: 0.4, ease: 'easeInOut' }} // durée et easing pour animation fluide
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
