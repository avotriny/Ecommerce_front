import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import './Accueil.css';
import { useValue } from '../../context/ContextProvider'

const words = ["BIENVENUE", "SUR", "NOTRE", "SITE"];

const slideImages = [
  '/images/bg_1.jpg',
  '/images/bg_2.jpg',
  '/images/bg_3.jpg'
];

const Accueil = () => {
  const { state: { currentUser }}= useValue();
  const [currentText, setCurrentText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      // Construit le texte avec les mots jusqu'au mot courant
      setCurrentText(prevText => {
        const nextText = `${prevText === '' ? '' : `${prevText} `}${words[wordIndex]}`;
        // Réinitialise le texte une fois tous les mots affichés
        if (wordIndex === words.length - 1) {
          setTimeout(() => setCurrentText(''), 1000);
        }
        return nextText;
      });
      setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 1000);

    const slideInterval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 2000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(slideInterval);
    };
  }, [wordIndex, slideIndex]);
  console.log(currentUser);

  return (
    <Container>
      <Box className="carousel">
        {slideImages.map((image, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === slideIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
              }}
            >
              <Typography variant="h2" component="div" sx={{ color: 'white'}} >
              BIENVENUE
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {currentText}
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Voir Détails
              </Button>
            </Box>
          </div>
        ))}
      </Box>
    </Container>
  );
};

export default Accueil;
