import React from 'react'
import {useState, useEffect} from 'react'
import axios from 'axios'
import { useValue } from '../../context/ContextProvider'; 

const Categorie=()=>{
    const [categorieInput, setCategorie] = useState({
        type_categorie:"",
    });
    const { state, dispatch } = useValue();
    const handleInput = (e)=>{
        e.preventDefault();
        setCategorie({...categorieInput, [e.target.name]: e.target.value });
    }
    const AddCategorie = (e)=>{
        e.preventDefault();
        dispatch({ type: 'START_LOADING' });
        try{
            const formData = new FormData();
            formData.append('nom_categorie',categorieInput.type_categorie);
        const response = axios.post("http://localhost:8000/api/categorie", formData)
        console.log(response)
            if(response){
                dispatch({
                type: 'UPDATE_ALERT',
                payload: {
                  open: true,
                  severity: 'success',
                  message: 'La categorie a été enregistré avec succès.',
                },
              });
                
            }else{
                console.log("Tsy mety")
            }
    }catch(error){
        dispatch({
            type: 'UPDATE_ALERT',
            payload: {
              open: true,
              severity: 'error',
              message: error.message,
            },
          });
    }finally {
        dispatch({ type: 'END_LOADING' });
      }
    }
    return (
        <main className="w-full h-screen bg-zinc-100 flex flex-col">
            <form onSubmit={AddCategorie} id="CATEGORIE_FORM">
            <div className="w-full flex flex-col gap-6 justify-start text-zinc-950 rounded-2xl shadow-lg p-9 border border-zinc-500">
                <h2 className="font-bold text-xl uppercase text-center">Nouveau categorie</h2>
                <div className='flex flex-col gap-2'>
                <h6 className='font-bold text-lg'>Nom de catègorie :</h6>
                <input type="text" onChange={handleInput} value={categorieInput.type_categorie} name="nom_categorie" className="bg-zinc-200 px-4 py-2 rounded-md shadow" required/>
                <button className="rounded-md uppercase font-bold bg-purple hover: bg-purple-600 focus:ring-2 ring-purple-300 shadow-sm px-4 py-2 text-white focus:outline-none ring-offset-2 active:bg-purple-600/90" type="submit">Enregister</button>
                </div>
            </div>
            </form>
        </main>
    )
}
export default Categorie;