import React, { useState, useEffect } from "react";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { useValue } from "../context/ContextProvider";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { dispatch } = useValue();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Connexion");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const [dataUser, setDataUser] = useState({
    name: '',
    email: ' ',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    setTitle(isRegister ? "Inscription" : "Connexion");
  }, [isRegister]);

  const handleInput = e => {
    const { name, value } = e.target;
    setDataUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isRegister) {
        const { data } = await axios.post('http://localhost:8000/api/login', {
          login: dataUser.email,
          password: dataUser.password
        });
        if (!data.success) throw new Error(data.message);
        localStorage.setItem('auth_token', data.token);
        dispatch({ type: 'UPDATE_USER', payload: data.user });
        navigate(data.user.role === 'admin' ? '/dashboard' : '/');
      } else {
        if (dataUser.password !== dataUser.password_confirmation) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        const { data } = await axios.post('http://localhost:8000/api/register', {
          name: dataUser.name,
          email: dataUser.email,
          password: dataUser.password,
          password_confirmation: dataUser.password_confirmation
        });
        // Au lieu de login auto, rediriger vers page de confirmation
        navigate('/registration/confirm', { state: { email: dataUser.email } });
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message;
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
       open: true,
      severity: 'error', 
        message: apiMessage || error.message || 'Une erreur est survenue.'
      }
})
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="relative w-full h-screen bg-zinc-100 flex justify-center items-center">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CircularProgress />
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white flex flex-col rounded-lg shadow-lg border p-6 relative z-10">
        <div className="flex justify-center p-2">
          <img src="./images/bg_1.jpg" alt="logo" className="rounded-full w-14 h-14" />
        </div>
        <h3 className="font-bold text-lg uppercase text-center text-blue-600 mb-4">{title}</h3>

        {isRegister && (
          <input
            type="text"
            name="name"
            onChange={handleInput}
            value={dataUser.name}
            placeholder="Votre nom"
            disabled={loading}
            className="w-full h-12 rounded-md border border-blue-600 px-4 mb-3"
          />
        )}

        <input
          type="email"
          name="email"
          onChange={handleInput}
          value={dataUser.email}
          placeholder="Votre adresse email"
          disabled={loading}
          className="w-full h-12 rounded-md border border-blue-600 px-4 mb-3"
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            onChange={handleInput}
            value={dataUser.password}
            placeholder="Votre mot de passe"
            disabled={loading}
            className="w-full h-12 rounded-md border border-blue-600 px-4"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </button>
        </div>

        {isRegister && (
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password_confirmation"
              onChange={handleInput}
              value={dataUser.password_confirmation}
              placeholder="Confirmation mot de passe"
              disabled={loading}
              className="w-full h-12 rounded-md border border-blue-600 px-4"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg bg-green-600 text-white font-bold uppercase hover:bg-green-700 flex items-center justify-center"
        >
          {loading ? <CircularProgress size={24} /> : isRegister ? "S'inscrire" : "Se connecter"}
        </button>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-blue-600 hover:underline">Mot de passe oublié?</a>
        </div>

        <div className="text-center mt-6">
          {isRegister ? (
            <>
              Vous avez déjà un compte ?{' '}
              <button type="button" onClick={() => setIsRegister(false)} className="text-blue-600 hover:underline">
                Se connecter
              </button>
            </>
          ) : (
            <>
              Vous êtes nouveau ?{' '}
              <button type="button" onClick={() => setIsRegister(true)} className="text-blue-600 hover:underline">
                Inscrivez-vous
              </button>
            </>
          )}
        </div>
      </form>
    </main>
  );
};

export default Login;
