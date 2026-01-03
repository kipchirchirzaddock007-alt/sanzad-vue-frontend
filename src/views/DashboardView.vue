<script setup>
import { ref, onMounted } from 'vue';

const API_BASE = 'http://localhost:3000';

const loading = ref(true);
const error = ref('');
const metricsSummary = ref({
  totalProjects: 0,
  totalReports: 0,
  byStatus: {},
});

const loadMetrics = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch(`${API_BASE}/api/metrics/summary`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    metricsSummary.value = {
      totalProjects: data.totalProjects ?? 0,
      totalReports: data.totalReports ?? 0,
      byStatus: data.byStatus || {},
    };
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load metrics.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadMetrics);
</script>

<template>
  <section class="dashboard">
    <h2>Dashboard</h2>

    <p v-if="loading">Loading metrics…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else class="metrics-grid">
      <div class="metric-card">
        <h3>Total projects</h3>
        <p class="value">{{ metricsSummary.totalProjects }}</p>
      </div>
      <div class="metric-card">
        <h3>Total reports</h3>
        <p class="value">{{ metricsSummary.totalReports }}</p>
      </div>
      <div class="metric-card">
        <h3>Projects by status</h3>
        <ul class="status-list">
          <li v-for="(count, status) in metricsSummary.byStatus" :key="status">
            {{ status }}: {{ count }}
          </li>
          <li v-if="!Object.keys(metricsSummary.byStatus).length">No projects yet.</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.metric-card {
  border: 1px solid #1f2937;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #020617;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #22c55e;
  margin: 0.5rem 0 0;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.error {
  color: #f97373;
  font-size: 0.9rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background: #7f1d1d;
}
</style>
