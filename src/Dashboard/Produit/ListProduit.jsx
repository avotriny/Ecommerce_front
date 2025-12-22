// src/components/admin/ProductsList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from '@headlessui/react';
import { Edit2, Trash2, Plus, Search, Download } from 'lucide-react';
import axios from 'axios';
import { useValue } from '../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ListProduit() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { dispatch } = useValue();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await axios.get('http://localhost:8000/api/produit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRows(data.produit);
    } catch (err) {
      dispatch({ type: 'UPDATE_ALERT', payload: {
          open: true,
          severity: 'error',
          message: err.response?.data?.message || 'Erreur chargement produits'
      }});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer ce produit ?");
    if (!confirm) return;
  
    dispatch({ type: 'START_LOADING' });
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://localhost:8000/api/produit/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRows(rows.filter(p => p.id !== id));
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'success', message: 'Produit supprimé !' } });
    } catch (err) {
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'error', message: err.response?.data?.message || 'Erreur lors de la suppression.' } });
    } finally {
      dispatch({ type: 'END_LOADING' });
    }
  };
  

  // Filtrer selon la recherche
  const filtered = useMemo(() => rows.filter(p =>
    p.nom_prod.toLowerCase().includes(search.toLowerCase()) ||
    p.subcategorie?.name_categorie.toLowerCase().includes(search.toLowerCase())
  ), [rows, search]);

  // Export CSV
  const exportCsv = () => {
    const header = ['ID','Nom','Prix','Promo','Stock','Taille','Origine','Catégorie','Créé le'];
    const data = filtered.map(p => [
      p.id,
      p.nom_prod,
      p.prix_prod,
      p.prix_promo ?? '',
      p.stock_prod,
      p.taille ?? '',
      p.origin_prod,
      p.subcategorie?.name_categorie,
      new Date(p.created_at).toLocaleDateString()
    ]);
    const csvContent = [header, ...data].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'produits.csv');
  };

  // Export XLSX
  const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(p => ({
      ID: p.id,
      Nom: p.nom_prod,
      Prix: p.prix_prod,
      Promo: p.prix_promo ?? '',
      Stock: p.stock_prod,
      Taille: p.taille ?? '',
      Origine: p.origin_prod,
      Categorie: p.subcategorie?.name_categorie,
      'Créé le': new Date(p.created_at).toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produits');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'produits.xlsx');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Gestion des produits</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button onClick={exportCsv} className="inline-flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
            <Download className="w-4 h-4 mr-1" /> CSV
          </button>
          <button onClick={exportXlsx} className="inline-flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
            <Download className="w-4 h-4 mr-1" /> XLSX
          </button>
          <button
            onClick={() => navigate('/dashboard/produit/new')}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouveau
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID','Nom','Prix','Promo','Stock','Taille','Origine','Catégorie','Créé le','Actions']
                .map((h,i)=>(
                  <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(p=>{
              const stockColor = p.stock_prod < 50 ? 'text-red-600' : p.stock_prod <= 200 ? 'text-blue-600' : 'text-green-600';
              return (
                <tr key={p.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{p.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.nom_prod}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.prix_prod} €</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.prix_promo ?? '-'}</td>
                  <td className={`px-4 py-2 whitespace-nowrap font-semibold ${stockColor}`}>{p.stock_prod}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.taille ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.origin_prod}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.subcategorie?.name_categorie}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 hover:bg-gray-100 rounded">…</Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 min-w-max bg-white border rounded shadow-lg z-10">
                        <Menu.Item>{({ active }) => (
                          <button onClick={()=>navigate(`/dashboard/produit/${p.id}/edit`)}
                            className={`${active?'bg-gray-100':''} flex items-center w-full px-4 py-2 text-sm text-blue-700`}>
                            <Edit2 className="w-4 h-4 mr-2"/> Éditer
                          </button>
                        )}</Menu.Item>
                        <Menu.Item>{({ active }) => (
                          <button onClick={()=>handleDelete(p.id)}
                            className={`${active?'bg-gray-100':''} flex items-center w-full px-4 py-2 text-sm text-red-600`}>
                            <Trash2 className="w-4 h-4 mr-2"/> Supprimer
                          </button>
                        )}</Menu.Item>
                      </Menu.Items>
                    </Menu>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0&&!loading&&(
              <tr><td colSpan="10" className="px-4 py-6 text-center text-gray-500">Aucun produit trouvé.</td></tr>
            )}
          </tbody>
        </table>
        {loading&&<div className="p-4 text-center text-gray-500">Chargement…</div>}
      </div>
    </div>
  );
}
