<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const API_BASE = 'http://localhost:3000';

const loading = ref(false);
const error = ref('');
const reports = ref([]);
const updatingId = ref(null);

// projects + search + selected project
const projects = ref([]);
const search = ref('');
const selectedProjectId = ref('');
const selectedProjectMedia = ref([]);

// fullscreen viewer
const showViewer = ref(false);
const viewerUrl = ref('');
const viewerType = ref('image');

const loadReports = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch(`${API_BASE}/api/reports`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    reports.value = await res.json();
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load reports.';
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (report, status) => {
  updatingId.value = report.id;
  error.value = '';
  try {
    const res = await fetch(`${API_BASE}/api/reports/${report.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        leaderNote: report.leaderNote || '',
      }),
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const updated = await res.json();
    const idx = reports.value.findIndex((r) => r.id === report.id);
    if (idx !== -1) reports.value[idx] = updated;
  } catch (e) {
    console.error(e);
    error.value = 'Failed to update report.';
  } finally {
    updatingId.value = null;
  }
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

const filteredProjects = computed(() => {
  const term = search.value.trim().toLowerCase();
  return [...projects.value]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .filter((p) => {
      if (!term) return true;
      const haystack = [
        p.name,
        p.ward,
        p.county,
        p.type,
        p.fundingBody,
        p.initiatingLeader,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
});

const loadProjectMedia = async () => {
  selectedProjectMedia.value = [];
  if (!selectedProjectId.value) return;
  try {
    const res = await fetch(`${API_BASE}/api/projects/${selectedProjectId.value}`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    selectedProjectMedia.value = Array.isArray(data.project.media)
      ? data.project.media
      : [];
  } catch (e) {
    console.error(e);
  }
};

watch(selectedProjectId, () => {
  loadProjectMedia();
});

const openViewer = (url) => {
  viewerUrl.value = url;
  viewerType.value = url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
  showViewer.value = true;
};

const closeViewer = () => {
  showViewer.value = false;
  viewerUrl.value = '';
};

onMounted(() => {
  loadReports();
  loadProjects();
});
</script>

<template>
  <section class="page">
    <h2>Leader Review</h2>
    <p>Review citizen reports and see on-the-ground photos and videos for each project.</p>

    <div class="toolbar">
      <button @click="loadReports" :disabled="loading">
        {{ loading ? 'Refreshing…' : 'Refresh reports' }}
      </button>
      <span v-if="error" class="error">{{ error }}</span>
    </div>

    <div class="layout">
      <!-- reports -->
      <div class="card">
        <h3>Citizen reports</h3>

        <div class="list">
          <p v-if="loading && !reports.length">Loading reports…</p>
          <p v-else-if="!reports.length">No reports submitted yet.</p>

          <article
            v-for="r in reports"
            :key="r.id"
            class="report"
          >
            <h4>{{ r.issueType }} – {{ r.location }}</h4>
            <p class="meta">
              From: {{ r.reporterName }} · Status: {{ r.status }}
            </p>
            <p>{{ r.description }}</p>
            <p v-if="r.evidenceUrl">
              Evidence:
              <a :href="r.evidenceUrl" target="_blank" rel="noreferrer">
                {{ r.evidenceUrl }}
              </a>
            </p>

            <div class="actions">
              <button
                @click="updateStatus(r, 'verified')"
                :disabled="updatingId === r.id"
              >
                Verify
              </button>
              <button
                @click="updateStatus(r, 'rejected')"
                :disabled="updatingId === r.id"
              >
                Reject
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- projects + media -->
      <div class="card">
        <h3>Projects & media (A–Z)</h3>

        <div class="search-row">
          <input
            v-model="search"
            class="search-input"
            placeholder="Search by project name, ward, leader, funding body…"
          />
          <span class="count" v-if="filteredProjects.length">
            {{ filteredProjects.length }} project(s)
          </span>
        </div>

        <p v-if="!projects.length">No projects registered yet.</p>

        <div v-else class="project-media-layout">
          <ul class="project-list">
            <li
              v-for="p in filteredProjects"
              :key="p.id"
              class="project-item"
              :class="{ active: String(selectedProjectId) === String(p.id) }"
              @click="selectedProjectId = p.id"
            >
              <div class="info">
                <strong>{{ p.name }}</strong>
                <p class="meta">
                  Ward: {{ p.ward }} · County: {{ p.county }} · Type: {{ p.type }} · Status: {{ p.status }}
                </p>
                <p class="meta">
                  Funding: {{ p.fundingBody || 'Not set' }} · Leader: {{ p.initiatingLeader || 'Not set' }}
                </p>
              </div>
            </li>
          </ul>

          <div class="media-panel">
            <h4>Media from locals</h4>
            <p v-if="!selectedProjectId">
              Select a project to view its citizen media.
            </p>
            <p v-else-if="!selectedProjectMedia.length">
              No media uploaded yet for this project.
            </p>

            <div
              v-else
              class="media-grid"
            >
              <div
                v-for="(url, idx) in selectedProjectMedia"
                :key="idx"
                class="media-wrapper"
              >
                <button
                  class="media-item"
                  type="button"
                  @click="openViewer(url)"
                >
                  <template v-if="url.match(/\.(mp4|webm|ogg)$/i)">
                    <video :src="url" class="media-video"></video>
                  </template>
                  <template v-else>
                    <img :src="url" alt="Project media" class="media-image" />
                  </template>
                </button>
                <a
                  :href="url"
                  class="download-link"
                  :download="`project-media-${idx}`"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- fullscreen viewer -->
    <div
      v-if="showViewer"
      class="viewer-overlay"
      @click.self="closeViewer"
    >
      <div class="viewer-content">
        <button class="viewer-close" type="button" @click="closeViewer">✕</button>

        <template v-if="viewerType === 'video'">
          <video
            :src="viewerUrl"
            controls
            autoplay
            class="viewer-media"
          ></video>
        </template>
        <template v-else>
          <img
            :src="viewerUrl"
            alt="Full view"
            class="viewer-media"
          />
        </template>
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
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
button {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: none;
  background: #38bdf8;
  color: #020617;
  font-size: 0.9rem;
  cursor: pointer;
}
button[disabled] {
  opacity: 0.6;
  cursor: default;
}
.error {
  color: #f97373;
  font-size: 0.85rem;
}
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr);
  gap: 1rem;
}
.card {
  border: 1px solid #1f2937;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #020617;
  font-size: 0.9rem;
}

/* reports */
.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.report {
  border-radius: 0.75rem;
  border: 1px solid #1f2937;
  padding: 0.6rem;
  background: #020617;
}
.meta {
  font-size: 0.8rem;
  color: #9ca3af;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.actions button:first-child {
  background: #22c55e;
}
.actions button:last-child {
  background: #f97316;
}

/* projects + media */
.search-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.search-input {
  flex: 1;
  background: #020617;
  border-radius: 0.375rem;
  border: 1px solid #1f2937;
  color: #e5e7eb;
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
}
.count {
  font-size: 0.8rem;
  color: #9ca3af;
}
.project-media-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.1fr);
  gap: 0.75rem;
}
.project-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.project-item {
  padding: 0.35rem 0.4rem;
  border-radius: 0.5rem;
  background: #020617;
  border: 1px solid #1f2937;
  cursor: pointer;
}
.project-item.active {
  border-color: #38bdf8;
}
.project-item .meta {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* media */
.media-panel {
  border-left: 1px solid #1f2937;
  padding-left: 0.75rem;
}
.media-grid {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.4rem;
}
.media-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.media-item {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #1f2937;
  background: #020617;
  padding: 0;
}
.media-image,
.media-video {
  width: 100%;
  height: 90px;
  object-fit: cover;
}
.download-link {
  font-size: 0.75rem;
  color: #38bdf8;
  text-align: center;
}

/* fullscreen viewer */
.viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.viewer-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.viewer-media {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 0.75rem;
}
.viewer-close {
  position: absolute;
  top: -2.2rem;
  right: 0;
  background: transparent;
  color: #e5e7eb;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  border: 1px solid #4b5563;
  font-size: 1.1rem;
  cursor: pointer;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .project-media-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .media-panel {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #1f2937;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }
}
</style>
