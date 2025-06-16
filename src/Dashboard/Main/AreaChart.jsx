import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AreaCharts = ({ commandes }) => {
  const [startDate, setStartDate] = useState(
    moment().subtract(1, 'months').format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [chartData, setChartData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  const buildChart = () => {
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
    const diffDays = end.diff(start, 'days');
    const diffMonths = end.diff(start, 'months');
    const diffYears = end.diff(start, 'years');

    let unit = 'month';
    let totalUnits = diffMonths;
    if (diffDays <= 31) {
      unit = 'day';
      totalUnits = diffDays;
    } else if (diffYears >= 1) {
      unit = 'year';
      totalUnits = diffYears;
    }

    const buckets = Array.from({ length: totalUnits + 1 }).map((_, i) => {
      const date = moment(start).add(i, unit + 's');
      let name;
      if (unit === 'day') name = date.format('DD MMM');
      else if (unit === 'year') name = date.format('YYYY');
      else name = date.format('MMM YYYY');
      return { name, sales: 0 };
    });

    let sum = 0;
    commandes.forEach(com => {
      const created = moment(com.created_at);
      if (created.isBetween(start, end, 'day', '[]')) {
        let idx;
        if (unit === 'day') idx = created.diff(start, 'days');
        else if (unit === 'year') idx = created.diff(start, 'years');
        else idx = created.diff(start, 'months');

        const sale = Number(com.prix_total || 0);
        if (buckets[idx]) {
          buckets[idx].sales += sale;
          sum += sale;
        }
      }
    });

    setChartData(buckets);
    setTotalSales(sum);
  };

  useEffect(() => {
    buildChart();
  }, [commandes, startDate, endDate]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Analyse des ventes</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
        <button
          onClick={buildChart}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Appliquer
        </button>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              fill="#bfdbfe"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-right">
        <p className="text-sm text-gray-600">
          Total entre {moment(startDate).format('LL')} et {moment(endDate).format('LL')} :
        </p>
        <p className="text-2xl font-bold text-gray-800">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalSales)}
        </p>
      </div>
    </div>
  );
};

export default AreaCharts;
