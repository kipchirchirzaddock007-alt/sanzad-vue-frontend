<template>
  <div style="padding: 1.5rem;">
    <h1>Wards – Needs Map + WEI</h1>

    <!-- Search controls -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
      <input
        v-model="searchText"
        @keyup.enter="searchWard"
        type="text"
        placeholder="Search ward by name (e.g. 'Kilimani')"
        style="flex: 1; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #64748b;"
      />
      <button
        @click="searchWard"
        style="padding: 0.5rem 1rem; border-radius: 8px; border: none; background-color: #0f766e; color: white; font-weight: 600; cursor: pointer;"
      >
        Search
      </button>
    </div>

    <!-- Map -->
    <div
      id="wei-map"
      style="width: 100%; height: 500px; border-radius: 12px; overflow: hidden; margin-bottom: 1rem;"
    ></div>

    <!-- WEI rankings section -->
    <div>
      <h2>Ward WEI Rankings (from backend)</h2>

      <button
        @click="loadRankings"
        style="margin: 0.5rem 0; padding: 0.4rem 0.9rem; border-radius: 8px; border: none; background-color: #0f766e; color: white; font-weight: 600; cursor: pointer;"
      >
        Load Rankings
      </button>

      <div v-if="error" style="color: red; margin-bottom: 0.5rem;">
        {{ error }}
      </div>

      <table
        v-if="wards.length"
        border="1"
        cellpadding="6"
        cellspacing="0"
        style="width: 100%; border-collapse: collapse; margin-top: 0.5rem; background-color: #111827;"
      >
        <thead style="background-color: #e5e7eb; color: black;">
          <tr>
            <th>Rank</th>
            <th>Ward</th>
            <th>County</th>
            <th>Code</th>
            <th>WEI</th>
          </tr>
        </thead>
        <tbody style="color: white;">
          <tr v-for="w in wards" :key="w.id">
            <td>{{ w.rank }}</td>
            <td>{{ w.name }}</td>
            <td>{{ w.county }}</td>
            <td>{{ w.code }}</td>
            <td>{{ w.wei }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else>
        No rankings loaded yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

const searchText = ref('');
const wardsSourceUrl =
  'https://raw.githubusercontent.com/benaboki/Kenya-County-Assembly-Boundaries/master/kenya_county_assemblies.geojson';

let map = null;
let wardsGeojsonCache = null;
let wardPopup = null;

// state for rankings table
const wards = ref([]);
const error = ref('');

// map init
onMounted(async () => {
  map = new maplibregl.Map({
    container: 'wei-map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [36.8219, -1.2921],
    zoom: 7.5,
    pitch: 60,
    bearing: -20,
    canvasContextAttributes: { antialias: true }
  });

  wardPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

  map.on('load', async () => {
    // base source
    map.addSource('kenya-wards', {
      type: 'geojson',
      data: wardsSourceUrl
    });

    // local cache of GeoJSON for search + enrichment
    try {
      const resp = await fetch(wardsSourceUrl);
      wardsGeojsonCache = await resp.json();
    } catch (e) {
      console.error('Failed to load ward GeoJSON cache', e);
    }

    // join WEI data from backend into GeoJSON features
    try {
      const weiRes = await fetch('http://localhost:4000/api/wei/rankings');
      const weiData = await weiRes.json();
      const weiList = weiData.all || [];

      // build lookup by code
      const weiByCode = {};
      weiList.forEach((w) => {
        if (w.code) {
          weiByCode[w.code] = w;
        }
      });

      if (wardsGeojsonCache && wardsGeojsonCache.features) {
        wardsGeojsonCache.features.forEach((f) => {
          const props = f.properties || {};
          // TODO: adjust these property names to match your GeoJSON exactly
          const code =
            props.code ||
            props.wardcode ||
            props.WARD_CODE ||
            props.WARDID ||
            '';

          const match = weiByCode[code];
          if (match) {
            props.wei = match.wei;
            props.wei_rank = match.rank;
            f.properties = props;
          }
        });

        // update map source with enriched data
        map.getSource('kenya-wards').setData(wardsGeojsonCache);
      }
    } catch (e) {
      console.error('Failed to join WEI data to wards', e);
    }

    // fill layer coloured by WEI (choropleth)
    map.addLayer({
      id: 'kenya-wards-wei-fill',
      type: 'fill',
      source: 'kenya-wards',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'wei'],
          0.0,
          '#f44336', // red low WEI
          0.4,
          '#ffeb3b', // yellow mid
          0.7,
          '#4caf50' // green high WEI
        ],
        'fill-opacity': 0.6
      }
    });

    // outline on top
    map.addLayer({
      id: 'kenya-wards-outline',
      type: 'line',
      source: 'kenya-wards',
      paint: {
        'line-color': '#00b0ff',
        'line-width': 2.5,
        'line-opacity': 0.95
      }
    });

    // popup on click
    map.on('click', 'kenya-wards-wei-fill', (e) => {
      const feature = e.features && e.features[0];
      if (!feature) return;

      const props = feature.properties || {};
      const wardName = props.ward || props.wardcounty || 'Unknown ward';
      const wardCode =
        props.code ||
        props.wardcode ||
        props.WARD_CODE ||
        props.WARDID ||
        'N/A';
      const countyName = props.county || props.COUNTY || 'Unknown county';
      const wei = props.wei != null ? props.wei : 'No WEI';

      const html = `
        <div style="font-size: 13px;">
          <div><strong>Ward:</strong> ${wardName}</div>
          <div><strong>County:</strong> ${countyName}</div>
          <div><strong>Code:</strong> ${wardCode}</div>
          <div><strong>WEI:</strong> ${wei}</div>
        </div>
      `;

      wardPopup
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    console.log('Ward outlines + WEI fill + popup added');
  });

  map.on('error', (e) => console.error('Map error:', e.error));
});

// search ward by name and highlight
const searchWard = async () => {
  if (!map) return;
  const q = (searchText.value || '').trim().toLowerCase();
  if (!q) return;

  try {
    if (!wardsGeojsonCache) {
      const resp = await fetch(wardsSourceUrl);
      wardsGeojsonCache = await resp.json();
    }

    const features = wardsGeojsonCache.features || [];
    const match = features.find((f) => {
      const props = f.properties || {};
      const wardName = (props.ward || props.wardcounty || '')
        .toString()
        .toLowerCase();
      return wardName.includes(q);
    });

    if (!match) {
      alert('No ward found matching: ' + searchText.value);
      if (map.getSource('ward-search-highlight')) {
        map.getSource('ward-search-highlight').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      return;
    }

    const highlightGeo = {
      type: 'FeatureCollection',
      features: [match]
    };

    if (map.getSource('ward-search-highlight')) {
      map.getSource('ward-search-highlight').setData(highlightGeo);
    } else {
      map.addSource('ward-search-highlight', {
        type: 'geojson',
        data: highlightGeo
      });

      map.addLayer({
        id: 'ward-search-highlight-fill',
        type: 'fill',
        source: 'ward-search-highlight',
        paint: {
          'fill-color': '#2196f3',
          'fill-opacity': 0.7
        }
      });
    }

    const bounds = new maplibregl.LngLatBounds();
    const coords = match.geometry.coordinates;

    const addCoords = (cs) => {
      cs.forEach((c) => {
        if (typeof c[0] === 'number') {
          bounds.extend(c);
        } else {
          addCoords(c);
        }
      });
    };
    addCoords(coords);

    map.fitBounds(bounds, {
      padding: 40,
      maxZoom: 13,
      duration: 1400
    });
  } catch (err) {
    console.error(err);
    alert('Error searching ward: ' + err.message);
  }
};

// fetch rankings for table
const loadRankings = async () => {
  error.value = '';
  try {
    const res = await fetch('http://localhost:4000/api/wei/rankings');
    const data = await res.json();
    wards.value = data.all || [];
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load rankings';
  }
};
</script>
