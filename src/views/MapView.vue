<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import maplibregl from 'maplibre-gl';

const API_BASE = 'http://localhost:3000';

const projects = ref([]);
const selectedProject = ref(null);
const map = ref(null);
const markers = ref([]);

const loadProjects = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    projects.value = await res.json();
    addMarkersToMap();
  } catch (e) {
    console.error(e);
  }
};

const initMap = () => {
  if (map.value) return;

  map.value = new maplibregl.Map({
    container: 'map-container',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [36.817223, -1.286389],
    zoom: 11,
  });

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right');
};

const addMarkersToMap = () => {
  if (!map.value) return;

  markers.value.forEach(m => m.remove());
  markers.value = [];

  projects.value.forEach((project) => {
    if (project.lat && project.lng) {
      const marker = new maplibregl.Marker({ color: '#22c55e' })
        .setLngLat([project.lng, project.lat])
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<strong>${project.name}</strong><br/>Ward: ${project.ward}<br/>Status: ${project.status}`
          )
        )
        .addTo(map.value);

      marker.getElement().addEventListener('click', () => {
        selectedProject.value = project;
      });

      markers.value.push(marker);
    }
  });
};

onMounted(() => {
  initMap();
  loadProjects();
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<template>
  <section class="page">
    <h2>Project Map View</h2>
    <p>View all registered projects on the map.</p>

    <div class="layout">
      <div id="map-container" class="map"></div>

      <div class="card sidebar">
        <h3>Project details</h3>
        <p v-if="!selectedProject">Click a marker to view project details.</p>
        <div v-else>
          <strong>{{ selectedProject.name }}</strong>
          <p><strong>Ward:</strong> {{ selectedProject.ward }}</p>
          <p><strong>County:</strong> {{ selectedProject.county }}</p>
          <p><strong>Type:</strong> {{ selectedProject.type }}</p>
          <p><strong>Status:</strong> {{ selectedProject.status }}</p>
          <p><strong>Budget:</strong> {{ selectedProject.budget || 'N/A' }} KSh</p>
          <p><strong>Funding:</strong> {{ selectedProject.fundingBody || 'Not set' }}</p>
          <p><strong>Leader:</strong> {{ selectedProject.initiatingLeader || 'Not set' }}</p>
          <p v-if="selectedProject.description"><strong>Description:</strong> {{ selectedProject.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  height: 600px;
}

.map {
  border: 1px solid #1f2937;
  border-radius: 0.75rem;
  background: #f0f0f0;
  width: 100%;
  height: 100%;
}

.sidebar {
  border: 1px solid #1f2937;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #020617;
  overflow-y: auto;
  font-size: 0.9rem;
}

.sidebar p {
  margin: 0.5rem 0;
  color: #e5e7eb;
}

.sidebar strong {
  color: #22c55e;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .map {
    height: 400px;
  }
}
</style>
