import React, { useState } from "react";
import axios from "axios";
import { useValue } from "../../context/ContextProvider";

const Categorie = () => {
  // 1. On nomme la propriété d'état "nom_categorie" pour coller au name de l'input
  const [categorieInput, setCategorie] = useState({ nom_categorie: "" });
  const { state, dispatch } = useValue();

  // 2. Gestion du champ : on met à jour l'état en fonction du name/value
  const handleInput = (e) => {
    const { name, value } = e.target;
    setCategorie((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Fonction asynchrone pour poster la nouvelle catégorie
  const AddCategorie = async (e) => {
    e.preventDefault();
    // On signale le chargement
    dispatch({ type: "START_LOADING" });

    try {
      // Préparation des données
      const formData = new FormData();
      formData.append("type_categorie", categorieInput.nom_categorie);

      // Appel HTTP
      const response = await axios.post(
        "http://localhost:8000/api/categorie",
        formData
      );

      // Si la réponse est OK (status 200 à 299), on affiche un message de succès
      if (response.status >= 200 && response.status < 300) {
        dispatch({
          type: "UPDATE_ALERT",
          payload: {
            open: true,
            severity: "success",
            message: "La catégorie a été enregistrée avec succès.",
          },
        });
        // On peut remettre le champ à vide
        setCategorie({ nom_categorie: "" });
      } else {
        // Cas improbable, mais on gère quand même
        dispatch({
          type: "UPDATE_ALERT",
          payload: {
            open: true,
            severity: "error",
            message:
              "La requête s'est terminée avec le statut " +
              response.status +
              ". Veuillez réessayer.",
          },
        });
      }
    } catch (err) {
      // Gestion d'erreur : on affiche le message retourné par l'API (si disponible)
      dispatch({
        type: "UPDATE_ALERT",
        payload: {
          open: true,
          severity: "error",
          message: err.response?.data?.message || err.message,
        },
      });
    } finally {
      // On arrête l'indicateur de chargement quelle que soit l'issue
      dispatch({ type: "END_LOADING" });
    }
  };

  return (
    <main className="w-full h-screen bg-gray-50 flex flex-col">
      <form
        onSubmit={AddCategorie}
        id="CATEGORIE_FORM"
        className="m-20 t-20"
        autoComplete="off"
      >
        <div className="max-w-30 flex flex-col gap-6 justify-start text-zinc-950 rounded-2xl shadow-lg p-9 border">
          <h2 className="font-bold text-xl uppercase text-center">
            Nouvelle catégorie
          </h2>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="nom_categorie"
              className="font-bold text-lg"
            >
              Nom de la catégorie :
            </label>
            <input
              type="text"
              id="nom_categorie"
              name="nom_categorie"
              value={categorieInput.nom_categorie}
              onChange={handleInput}
              className="bg-zinc-50 px-4 py-2 rounded-md shadow"
              placeholder="Ex. Materiel Informatique"
              required
            />
          </div>

          <button
            type="submit"
            className="
              rounded-md uppercase font-bold bg-blue-500
              bg-purple hover:bg-blue-600 focus:ring-2 ring-purple-300
              shadow-sm px-4 py-2 text-white focus:outline-none ring-offset-2
              active:bg-blue-600/90
            "
          >
            Enregistrer
          </button>
        </div>
      </form>
    </main>
  );
};

export default Categorie;
