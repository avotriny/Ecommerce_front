

// src/components/Carte/Carte.jsx
import React, { useState, useRef, useEffect } from 'react';
import Map, { Source, Layer, Popup, Marker } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation2 } from 'lucide-react';
import axios from 'axios';

const MAPBOX_TOKEN = "pk.eyJ1Ijoiam9uYXRhbi0wNyIsImEiOiJjbHN3cjNjM2QxdTNpMmxxazE2Z3E5NnQ5In0.QJOPU-fG2HzZUDhPd3cpdg";

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function OrdersMap() {
  const mapRef = useRef(null);

  // États
  const [commandes, setCommandes] = useState([]);
  const [viewState, setViewState] = useState({ latitude: -18.8792, longitude: 47.5079, zoom: 14 });
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  // Récupération des commandes avec axios
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Token Mapbox manquant. Veuillez définir VITE_MAPBOX_TOKEN dans .env');
      return;
    }
    axios.get('http://localhost:8000/api/commande')
      .then(response => {
        const data = response.data;
        if (data.commandes?.data) {
          setCommandes(data.commandes.data);
          setFiltered(data.commandes.data);
        } else {
          setError('Aucune commande trouvée');
        }
      })
      .catch(() => setError('Erreur lors du chargement des commandes'));
  }, []);

  // Filtre de recherche
  useEffect(() => {
    const term = search.trim().toLowerCase();
    setFiltered(term ? commandes.filter(c => c.nom.toLowerCase().includes(term)) : commandes);
  }, [search, commandes]);

  // Conversion en GeoJSON
  const geoJsonData = {
    type: 'FeatureCollection',
    features: filtered.map(cmd => ({
      type: 'Feature',
      properties: { id: cmd.id, nom: cmd.nom, adresse: cmd.adresse },
      geometry: { type: 'Point', coordinates: [parseFloat(cmd.longitude), parseFloat(cmd.latitude)] }
    }))
  };

  // Clic sur la carte (clusters ou point)
  const handleMapClick = e => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters', 'unclustered-point'] });
    if (!features.length) return;
    const feature = features[0];
    const props = feature.properties;
    if (props.point_count) {
      // Zoom sur cluster
      map.getSource('commandes').getClusterExpansionZoom(
        props.cluster_id,
        (err, clusterZoom) => {
          if (err) return;
          setViewState({ latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0], zoom: clusterZoom });
        }
      );
    } else {
      // Popup point isolé
      setSelected({ nom: props.nom, adresse: props.adresse, latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] });
    }
  };

  // Fly to client
  const flyToCustomer = cmd => {
    const lat = parseFloat(cmd.latitude);
    const lng = parseFloat(cmd.longitude);
    setViewState({ latitude: lat, longitude: lng, zoom: 16 });
    setSelected({ nom: cmd.nom, adresse: cmd.adresse, latitude: lat, longitude: lng });
  };

  return (
    <div className="relative w-full h-screen text-black">
      {/* Barre de recherche */}
      <div className="absolute top-20 left-4 z-10 bg-white p-2 rounded shadow flex items-center space-x-2">
        <input
          type="text"
          placeholder="Rechercher client..."
          className="border p-1 rounded focus:outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Navigation2 size={20} className="text-gray-600" />
      </div>

      {/* Message d'erreur */}
      {error && <p className="absolute top-16 left-4 text-red-600 z-10">{error}</p>}

      {/* Liste clients */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow max-h-48 overflow-auto w-52">
        {filtered.length === 0
          ? <p>Aucun client</p>
          : filtered.map(cmd => (
            <div key={cmd.id} className="flex justify-between items-center py-1">
              <span className="truncate">{cmd.nom}</span>
              <button onClick={() => flyToCustomer(cmd)}><Navigation2 size={16} /></button>
            </div>
          ))}
      </div>

      {/* Map */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['clusters', 'unclustered-point']}
      >
        <Source id="commandes" type="geojson" data={geoJsonData} cluster clusterMaxZoom={14} clusterRadius={50}>
          {/* Cluster */}
          <Layer id="clusters" type="circle" filter={['has', 'point_count']} paint={{ 'circle-color': ['step', ['get','point_count'], '#51bbd6', 10, '#f1f075', 30, '#f28cb1'], 'circle-radius': ['step', ['get','point_count'], 15, 10, 20, 30, 25] }} />
          <Layer id="cluster-count" type="symbol" filter={['has','point_count']} layout={{ 'text-field':'{point_count_abbreviated}','text-font':['DIN Offc Pro Medium','Arial Unicode MS Bold'],'text-size':12 }} />
          {/* Points isolés */}
          <Layer id="unclustered-point" type="circle" filter={['!',['has','point_count']]} paint={{ 'circle-color':'#11b4da','circle-radius':6,'circle-stroke-width':1,'circle-stroke-color':'#fff' }} />
        </Source>

        {/* Marker GPS et Popup */}
        {selected && (
          <>            
            <Marker latitude={selected.latitude} longitude={selected.longitude} anchor="bottom">
              <Navigation2 size={28} className="text-red-600" />
            </Marker>
            <Popup latitude={selected.latitude} longitude={selected.longitude} anchor="top" onClose={() => setSelected(null)} closeOnClick={false}>
              <div className="space-y-1">
                <p><strong>Client:</strong> {selected.nom}</p>
                <p><strong>Adresse:</strong> {selected.adresse}</p>
              </div>
            </Popup>
          </>
        )}
      </Map>
    </div>
  );
}
