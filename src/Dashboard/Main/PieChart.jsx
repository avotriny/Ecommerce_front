// src/components/admin/PieCharts.jsx
import React from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * PieCharts affiche un camembert des quantités commandées par produit.
 * On s'appuie sur la structure API :
 * commandes.data[].lignes : array of lignes avec quantite et produit.
 * Chaque ligne contient produit.nom_prod.
 */
const PieCharts = ({ commandes }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4567'];

  // commandes peut venir paginé sous commandes.data
  const list = Array.isArray(commandes.data) ? commandes.data : commandes;

  // Buckets par nom de produit
  const buckets = list.reduce((acc, cmd) => {
    // Pour chaque ligne de la commande
    cmd.lignes.forEach(ligne => {
      const name = ligne.produit?.nom_prod || 'Inconnu';
      const qty = parseInt(ligne.quantite, 10) || 0;
      acc[name] = (acc[name] || 0) + qty;
    });
    return acc;
  }, {});

  // Préparer data pour recharts
  const data = Object.entries(buckets).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">Commandes par produit</h3>
      <div className="w-full h-64">
        <ResponsiveContainer>
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}`} />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </RePieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieCharts;
