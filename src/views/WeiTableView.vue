<template>
  <div style="padding: 1.5rem;">
    <h1>Ward WEI Rankings (Test)</h1>

    <button
      @click="loadRankings"
      style="margin-bottom: 0.75rem; padding: 0.5rem 1rem; border-radius: 8px; border: none; background-color: #0f766e; color: white; font-weight: 600; cursor: pointer;"
    >
      Load Rankings
    </button>

    <div v-if="error" style="color: red; margin-bottom: 0.5rem;">
      {{ error }}
    </div>

    <table v-if="wards.length" border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Ward</th>
          <th>County</th>
          <th>Code</th>
          <th>WEI</th>
        </tr>
      </thead>
      <tbody>
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
      No data loaded yet.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const wards = ref([]);
const error = ref('');

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
