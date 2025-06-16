import React, { useState, useEffect } from "react";
import axios from "axios";
import { useValue } from "../../context/ContextProvider";

const SubCategorie = () => {
  // 1. État pour gérer le champ "nom_categorie" (sous-catégorie) et "cat_id"
  const [categorieInput, setCategorie] = useState({
    nom_categorie: "",
    cat_id: "",
  });

  const { state, dispatch } = useValue();

  // 2. État local pour stocker la liste des catégories récupérées depuis l'API
  const [category, setCategory] = useState([]);

  // 3. État pour indiquer si on attend la réponse API pour remplir le <select>
  const [loadingListe, setLoadingListe] = useState(true);

  // 4. handleInput : met à jour l'état en fonction du name/value du champ
  const handleInput = (e) => {
    const { name, value } = e.target;
    setCategorie((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 5. Au montage, on récupère la liste des catégories
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/categorie")
      .then((res) => {
        if (res.data.status === 200) {
          setCategory(res.data.categorie);
        }
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des catégories :", err);
        // Vous pouvez aussi dispatcher une alerte d'erreur ici si besoin
      })
      .finally(() => {
        setLoadingListe(false);
      });
  }, []);

  // 6. Construction des <option> une fois que "category" est chargé
  let listProduit = null;
  if (loadingListe) {
    // Tant que l'API n'a pas répondu, on peut afficher un placeholder vide ou un spinner
    listProduit = <option>Chargement…</option>;
  } else {
    listProduit = category.map((item) => (
      <option value={item.id} key={item.id}>
        {item.type_categorie}
      </option>
    ));
  }

  // 7. Fonction asynchrone pour poster la nouvelle sous-catégorie (api/subcategorie)
  const AddCategorie = async (e) => {
    e.preventDefault();
    dispatch({ type: "START_LOADING" });

    try {
      const formData = new FormData();
      formData.append("name_categorie", categorieInput.nom_categorie);
      formData.append("cat_id", categorieInput.cat_id);

      const response = await axios.post(
        "http://localhost:8000/api/subcategorie",
        formData
      );

      if (response.status >= 200 && response.status < 300) {
        dispatch({
          type: "UPDATE_ALERT",
          payload: {
            open: true,
            severity: "success",
            message: "La sous-catégorie a été enregistrée avec succès.",
          },
        });
        // On réinitialise l'état pour vider les champs
        setCategorie({ nom_categorie: "", cat_id: "" });
      } else {
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
      dispatch({
        type: "UPDATE_ALERT",
        payload: {
          open: true,
          severity: "error",
          message: err.response?.data?.message || err.message,
        },
      });
    } finally {
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
            Nouvelle sous-catégorie
          </h2>

          {/* Sélect pour choisir une catégorie parente */}
          <div className="flex flex-col gap-2">
            <label htmlFor="cat_id" className="font-bold text-lg">
              Catégorie parente :
            </label>
            <select
              id="cat_id"
              name="cat_id"
              value={categorieInput.cat_id}
              onChange={handleInput}
              className="bg-zinc-200 px-4 py-2 rounded-md shadow"
              required
            >
              <option value="" disabled>
                -- Sélectionnez une catégorie --
              </option>
              {listProduit}
            </select>
          </div>

          {/* Champ pour le nom de la sous-catégorie */}
          <div className="flex flex-col gap-2">
            <label htmlFor="nom_categorie" className="font-bold text-lg">
              Nom de la sous-catégorie :
            </label>
            <input
              type="text"
              id="nom_categorie"
              name="nom_categorie"
              value={categorieInput.nom_categorie}
              onChange={handleInput}
              className="bg-zinc-50 px-4 py-2 rounded-md shadow"
              placeholder="Ex. Ordinateur portable"
              required
            />
          </div>

          <button
            type="submit"
            className="
              rounded-md uppercase font-bold bg-blue-500
              hover:bg-blue-600 focus:ring-2 ring-purple-300
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

export default SubCategorie;
