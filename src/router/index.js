import { createRouter, createWebHistory } from 'vue-router';

import DashboardView from '../views/DashboardView.vue';
import MapView from '../views/MapView.vue';
import CitizenView from '../views/CitizenView.vue';
import LeaderView from '../views/LeaderView.vue';
import MediaView from '../views/MediaView.vue';
import ProjectAdminView from '../views/ProjectAdminView.vue';
import WardNeedsView from '../views/WardNeedsView.vue';
import WeiTableView from '../views/WeiTableView.vue'; // new

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/map', name: 'Map', component: MapView },
  { path: '/citizen', name: 'Citizen', component: CitizenView },
  { path: '/leader', name: 'Leader', component: LeaderView },
  { path: '/media', name: 'Media', component: MediaView },
  { path: '/ward-needs', name: 'WardNeeds', component: WardNeedsView },
  { path: '/admin/projects', name: 'ProjectAdmin', component: ProjectAdminView },
  { path: '/wei-table', name: 'WeiTable', component: WeiTableView } // new route
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
