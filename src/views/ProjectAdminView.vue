<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import maplibregl from 'maplibre-gl';

const API_BASE = 'http://localhost:3000';
const loading = ref(false);
const error = ref('');
const message = ref('');
const projects = ref([]);

const form = ref({
  name: '',
  ward: '',
  county: 'Nairobi',
  type: 'road',
  budget: '',
  fundingBody: '',
  initiatingLeader: '',
  managingAgency: '',
  startDate: '',
  endDate: '',
  description: '',
  lat: '',
  lng: '',
  status: 'planned',
  implementationLevel: '',
  mdaCode: '',
  contractId: '',
  contractorName: '',
});

const map = ref(null);
const marker = ref(null);

const initMap = () => {
  if (map.value) return;

  map.value = new maplibregl.Map({
    container: 'admin-map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [36.817223, -1.286389],
    zoom: 12,
    pitch: 0,
    bearing: 0,
    antialias: true,
  });

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right');

  map.value.on('click', (e) => {
    const { lng, lat } = e.lngLat;
    form.value.lng = lng;
    form.value.lat = lat;

    if (!marker.value) {
      marker.value = new maplibregl.Marker({ draggable: false })
        .setLngLat([lng, lat])
        .addTo(map.value);
    } else {
      marker.value.setLngLat([lng, lat]);
    }
  });
};

const loadProjects = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    projects.value = await res.json();
  } catch (e) {
    console.error(e);
  }
};

const createProject = async () => {
  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    const payload = {
      ...form.value,
      budget: form.value.budget ? Number(form.value.budget) : null,
      lat: form.value.lat ? Number(form.value.lat) : null,
      lng: form.value.lng ? Number(form.value.lng) : null,
    };

    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const created = await res.json();
    message.value = 'Project created successfully.';
    projects.value.unshift(created);

    form.value = {
      name: '',
      ward: '',
      county: 'Nairobi',
      type: 'road',
      budget: '',
      fundingBody: '',
      initiatingLeader: '',
      managingAgency: '',
      startDate: '',
      endDate: '',
      description: '',
      lat: '',
      lng: '',
      status: 'planned',
      implementationLevel: '',
      mdaCode: '',
      contractId: '',
      contractorName: '',
    };
  } catch (e) {
    console.error(e);
    error.value = 'Failed to create project.';
  } finally {
    loading.value = false;
  }
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
    <h2>Admin – Register Projects</h2>
    <p>Capture full project details including funding, initiating leader, and exact map location.</p>

    <div class="layout">
      <form class="card form" @submit.prevent="createProject">
        <h3>Project details</h3>

        <div class="field">
          <label>Project name</label>
          <input v-model="form.name" required />
        </div>

        <div class="field-row">
          <div class="field">
            <label>Ward</label>
            <input v-model="form.ward" required />
          </div>
          <div class="field">
            <label>County</label>
            <input v-model="form.county" required />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Type</label>
            <select v-model="form.type">
              <option value="road">Road</option>
              <option value="school">School</option>
              <option value="hospital">Hospital</option>
              <option value="water">Water</option>
              <option value="market">Market</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="field">
            <label>Status</label>
            <select v-model="form.status">
              <option value="planned">Planned</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="stalled">Stalled</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Budget allocated (KSh)</label>
            <input v-model="form.budget" type="number" min="0" />
          </div>
          <div class="field">
            <label>Funding body</label>
            <input v-model="form.fundingBody" placeholder="e.g. World Bank, County Gov, CDF" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Initiating leader</label>
            <input v-model="form.initiatingLeader" placeholder="e.g. Hon. Jane Doe, MP" />
          </div>
          <div class="field">
            <label>Managing agency / MDA</label>
            <input v-model="form.managingAgency" placeholder="e.g. KeNHA, County Works Dept" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Implementation level / phase</label>
            <input v-model="form.implementationLevel" placeholder="e.g. Phase 1, 60% complete" />
          </div>
          <div class="field">
            <label>MDA / vote code</label>
            <input v-model="form.mdaCode" placeholder="Internal code if needed" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Contract ID</label>
            <input v-model="form.contractId" placeholder="Tender / contract reference" />
          </div>
          <div class="field">
            <label>Contractor name</label>
            <input v-model="form.contractorName" placeholder="Company or implementer" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Start date</label>
            <input v-model="form.startDate" type="date" />
          </div>
          <div class="field">
            <label>End date</label>
            <input v-model="form.endDate" type="date" />
          </div>
        </div>

        <div class="field">
          <label>Project description</label>
          <textarea v-model="form.description" rows="3" placeholder="Summary of scope, objectives, components…" />
        </div>

        <div class="field coords">
          <label>Coordinates (from map marker)</label>
          <div class="coord-row">
            <span>Lat: {{ form.lat }}</span>
            <span>Lng: {{ form.lng }}</span>
          </div>
          <small>Left-click on the map to set or move the marker to the exact project location.</small>
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Saving…' : 'Save project' }}
        </button>

        <p v-if="message" class="ok">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div class="card map-card">
        <h3>Set project location</h3>
        <div id="admin-map"></div>
      </div>
    </div>

    <div class="card list-card">
      <h3>Recently registered projects</h3>
      <p v-if="!projects.length">No projects yet.</p>
      <ul v-else class="project-list">
        <li v-for="p in projects" :key="p.id">
          <strong>{{ p.name }}</strong> – {{ p.type }} – Ward: {{ p.ward }}
          · Status: {{ p.status }} · Budget: {{ p.budget || 'N/A' }}
        </li>
      </ul>
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
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 1rem;
}
.card {
  border: 1px solid #1f2937;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #020617;
  font-size: 0.9rem;
}
.form {
  max-width: 640px;
}
.map-card {
  padding: 0.75rem;
}
#admin-map {
  width: 100%;
  height: 420px;
  border-radius: 0.75rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.6rem;
}
.field-row {
  display: flex;
  gap: 0.5rem;
}
.field-row .field {
  flex: 1;
}
label {
  font-size: 0.85rem;
  color: #9ca3af;
}
input,
select,
textarea {
  background: #020617;
  border-radius: 0.375rem;
  border: 1px solid #1f2937;
  color: #e5e7eb;
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
}
button {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: none;
  background: #22c55e;
  color: #020617;
  font-size: 0.9rem;
  cursor: pointer;
}
button[disabled] {
  opacity: 0.6;
  cursor: default;
}
.ok {
  color: #22c55e;
  font-size: 0.85rem;
  margin-top: 0.4rem;
}
.error {
  color: #f97373;
  font-size: 0.85rem;
  margin-top: 0.4rem;
}
.coords .coord-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
}
.list-card {
  margin-top: 1rem;
}
.project-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}
@media (max-width: 980px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
