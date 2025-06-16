import React from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PieCharts = ({ commandes }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4567'];

  const buckets = commandes.reduce((acc, cmd) => {
    const key = cmd.produit?.nom_prod || 'Inconnu';
    acc[key] = (acc[key] || 0) + parseInt(cmd.quantite || 0, 10);
    return acc;
  }, {});

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
            <Tooltip />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </RePieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieCharts;
