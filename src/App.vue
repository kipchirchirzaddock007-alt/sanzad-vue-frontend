<template>
  <div class="app">
    <header class="app-header">
      <h1>Sanzad-Vue</h1>
      <p>
        Civic-tech platform for transparent public projects:
        citizen reports, leader verification, maps, and dashboards.
      </p>
    </header>

    <nav class="app-nav">
      <router-link to="/" class="nav-btn" active-class="active">Dashboard</router-link>
      <router-link to="/citizen" class="nav-btn" active-class="active">Citizen</router-link>
      <router-link to="/leader" class="nav-btn" active-class="active">Leader</router-link>
      <router-link to="/media" class="nav-btn" active-class="active">Media</router-link>
      <router-link to="/map" class="nav-btn" active-class="active">Map</router-link>
      <router-link to="/ward-needs" class="nav-btn" active-class="active">Ward Needs</router-link>
      <router-link to="/admin/projects" class="nav-btn" active-class="active">Admin</router-link>
    </nav>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <small>
        Sanzad-Vue – backend at http://localhost:3000, frontend at http://localhost:5173.
      </small>
    </footer>
  </div>
</template>

<script setup>
</script>

<style>
.app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  min-height: 100vh;
  margin: 0;
  padding: 1.5rem;
  background: #020617;
  color: #e5e7eb;
}
.app-header {
  margin-bottom: 1rem;
}
.app-header h1 {
  margin: 0 0 0.25rem;
  font-size: 2rem;
  color: #38bdf8;
}
.app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.nav-btn {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: none;
}
.nav-btn.active {
  background: #38bdf8;
  color: #020617;
}
.app-main {
  display: block;
}
.app-footer {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: #9ca3af;
}
</style>
