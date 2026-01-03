<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const API_BASE = 'http://localhost:3000';
const backendOrigin = 'http://localhost:3000';

// helper to turn stored value into a full URL
const resolveMediaUrl = (item) => {
  const raw = item.url || item;
  if (!raw) return '';
  // already absolute
  if (/^https?:\/\//i.test(raw)) return raw;
  // backend-relative path like /uploads/filename
  return `${backendOrigin}${raw}`;
};

// report form
const reporterName = ref('');
const contact = ref('');
const location = ref('');
const issueType = ref('delay');
const description = ref('');
const evidenceUrl = ref('');

const submitting = ref(false);
const message = ref('');
const error = ref('');

// projects + search + selected project for media
const projects = ref([]);
const search = ref('');
const selectedProjectId = ref('');
const selectedProjectMedia = ref([]);

// media upload
const files = ref([]);
const uploading = ref(false);
const uploadMessage = ref('');
const uploadError = ref('');

// fullscreen viewer
const showViewer = ref(false);
const viewerUrl = ref('');
const viewerType = ref('image'); // 'image' or 'video'

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
  uploadMessage.value = '';
  uploadError.value = '';
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

const onFilesChange = (event) => {
  files.value = Array.from(event.target.files || []);
};

// uses multipart/form-data with field "file" to match backend
const uploadMedia = async () => {
  if (!selectedProjectId.value) {
    uploadError.value = 'Please choose a project first.';
    return;
  }
  if (!files.value.length) {
    uploadError.value = 'Please select one or more photos/videos to upload.';
    return;
  }

  uploading.value = true;
  uploadError.value = '';
  uploadMessage.value = '';

  try {
    const projectId = selectedProjectId.value;
    let allMedia = [];

    for (const file of files.value) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('video') ? 'video' : 'image');
      formData.append('caption', file.name);

      const res = await fetch(
        `${API_BASE}/api/projects/${projectId}/media`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      allMedia = Array.isArray(data.media) ? data.media : allMedia;
    }

    selectedProjectMedia.value = allMedia;
    uploadMessage.value = 'Media uploaded successfully.';
    files.value = [];
  } catch (e) {
    console.error(e);
    uploadError.value = 'Failed to upload media.';
  } finally {
    uploading.value = false;
  }
};

const submitReport = async () => {
  submitting.value = true;
  message.value = '';
  error.value = '';
  try {
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterName: reporterName.value,
        contact: contact.value,
        location: location.value,
        issueType: issueType.value,
        description: description.value,
        evidenceUrl: evidenceUrl.value,
      }),
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    message.value = 'Report submitted successfully.';
    reporterName.value = '';
    contact.value = '';
    location.value = '';
    issueType.value = 'delay';
    description.value = '';
    evidenceUrl.value = '';
  } catch (e) {
    console.error(e);
    error.value = 'Failed to submit report.';
  } finally {
    submitting.value = false;
  }
};

const openViewer = (urlOrItem) => {
  const full = typeof urlOrItem === 'string'
    ? resolveMediaUrl({ url: urlOrItem })
    : resolveMediaUrl(urlOrItem);
  viewerUrl.value = full;
  viewerType.value = full.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
  showViewer.value = true;
};

const closeViewer = () => {
  showViewer.value = false;
  viewerUrl.value = '';
};

onMounted(() => {
  loadProjects();
});
</script>

<template>
  <section class="page">
    <h2>Citizen – Projects & Evidence</h2>
    <p>
      Submit issues and upload photos or videos of public projects so other citizens and leaders can see local evidence.
    </p>

    <!-- report form -->
    <form class="card form" @submit.prevent="submitReport">
      <h3>Submit a report</h3>
      <div class="field">
        <label>Full name</label>
        <input v-model="reporterName" required />
      </div>
      <div class="field">
        <label>Contact (optional)</label>
        <input v-model="contact" />
      </div>
      <div class="field">
        <label>Location / Ward</label>
        <input v-model="location" required />
      </div>
      <div class="field">
        <label>Issue type</label>
        <select v-model="issueType">
          <option value="delay">Delay</option>
          <option value="abandonment">Abandonment</option>
          <option value="quality">Quality</option>
          <option value="corruption">Corruption</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea v-model="description" rows="4" required />
      </div>
      <div class="field">
        <label>Evidence URL (optional)</label>
        <input v-model="evidenceUrl" placeholder="Link to extra photo, video, etc." />
      </div>

      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Submitting…' : 'Submit report' }}
      </button>

      <p v-if="message" class="ok">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <!-- projects & media -->
    <div class="layout">
      <!-- Left: projects list -->
      <div class="card project-overview">
        <h3>Public projects (A–Z)</h3>

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

        <ul v-else class="project-list">
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
            <div class="actions">
              <button
                class="small-btn"
                @click.stop="$router.push({ path: '/map', query: { projectId: p.id } })"
              >
                View on map
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Right: media upload & gallery -->
      <div class="card media-card">
        <h3>Local photos & videos</h3>

        <p v-if="!selectedProjectId">
          Select a project on the left to upload or view media from citizens.
        </p>

        <div v-else>
          <div class="field">
            <label>Upload media for this project</label>
            <input
              type="file"
              multiple
              @change="onFilesChange"
              accept="image/*,video/*"
            />
            <small>
              Supported: common image formats (JPG, PNG, etc.) and video formats (MP4, etc.).
            </small>
          </div>

          <button
            type="button"
            :disabled="uploading"
            @click="uploadMedia"
          >
            {{ uploading ? 'Uploading…' : 'Upload selected media' }}
          </button>

          <p v-if="uploadMessage" class="ok">{{ uploadMessage }}</p>
          <p v-if="uploadError" class="error">{{ uploadError }}</p>

          <hr />

          <h4>Media from locals</h4>
          <p v-if="!selectedProjectMedia.length">
            No media uploaded yet for this project.
          </p>

          <div v-else class="media-grid">
            <div
              v-for="(item, idx) in selectedProjectMedia"
              :key="idx"
              class="media-wrapper"
            >
              <button
                class="media-item"
                type="button"
                @click="openViewer(item)"
              >
                <template v-if="resolveMediaUrl(item).match(/\.(mp4|webm|ogg)$/i)">
                  <video :src="resolveMediaUrl(item)" class="media-video"></video>
                </template>
                <template v-else>
                  <img :src="resolveMediaUrl(item)" alt="Project media" class="media-image" />
                </template>
              </button>
              <a
                :href="resolveMediaUrl(item)"
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

/* report form */
.card.form {
  border: 1px solid #1f2937;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #020617;
  max-width: 520px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.6rem;
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

/* layout */
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

/* projects */
.project-overview {
  display: flex;
  flex-direction: column;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.search-input {
  flex: 1;
}
.count {
  font-size: 0.8rem;
  color: #9ca3af;
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
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
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
.actions {
  display: flex;
  align-items: center;
}
.small-btn {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: none;
  background: #38bdf8;
  color: #020617;
  font-size: 0.75rem;
  cursor: pointer;
}

/* media */
.media-card {
  display: flex;
  flex-direction: column;
}
.media-grid {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
}
.media-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.media-item {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #1f2937;
  background: #020617;
  padding: 0;
}
.media-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}
.media-video {
  width: 100%;
  height: 100px;
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
}
</style>
