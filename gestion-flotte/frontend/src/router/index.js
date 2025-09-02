import { createRouter, createWebHistory } from 'vue-router';

// Pages publiques
import LoginPage from '@/views/Login.vue';
import MotDePasseOublie from '@/views/MotDePasseOublie.vue';

// Layouts
import ResponsableLayout from '@/layouts/ResponsableLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import ChauffeurLayout from '@/layouts/ChauffeurLayout.vue';
import DemandeurLayout from '@/layouts/DemandeurLayout.vue';
import HSELayout from '@/layouts/HSELayout.vue';
import ManagerLayout from '@/layouts/managerLayout.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
  },
  {
    path: '/mot-de-passe-oublie',
    name: 'MotDePasseOublie',
    component: MotDePasseOublie,
  },

  // 🟢 Responsable Parc
  {
    path: '/responsable',
    component: ResponsableLayout,
    meta: { role: 'RESPONSABLE_PARC' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'ResponsableDashboard', component: () => import('@/views/responsable/Dashboard.vue') },
      { path: 'profil', name: 'ResponsableProfil', component: () => import('@/views/responsable/profil.vue') },
      { path: 'vehicules', name: 'ResponsableVehicules', component: () => import('@/views/responsable/Vehicules.vue') },
      { path: 'vehicules/:id', name: 'VehiculeDetail', component: () => import('@/views/responsable/VehiculeDetail.vue'), props: true },
      { path: 'chauffeurs', name: 'ResponsableChauffeurs', component: () => import('@/views/responsable/Chauffeurs.vue') },
      { path: 'chauffeurs/:id', name: 'ChauffeurDetail', component: () => import('@/views/responsable/chauffeurDetail.vue'), props: true },
      { path: 'RapportHSE', name: 'ResponsableHSE', component: () => import('@/views/responsable/RapportHSE.vue') },
      { path: 'demandeMission', name: 'ResponsableDemandeMission', component: () => import('@/views/responsable/DemandeMissions.vue') },
      { path: 'missions', name: 'ResponsableMissions', component: () => import('@/views/responsable/Missions.vue') },
      { path: 'alertes', name: 'ResponsableAlertes', component: () => import('@/views/responsable/Alertes.vue') },
      { path: 'maintenance', name: 'ResponsableMaintenance', component: () => import('@/views/responsable/Maintenance.vue') },
      { path: 'incidents', name: 'ResponsableIncidents', component: () => import('@/views/responsable/Incidents.vue') },
      { path: 'checklists', name: 'ResponsableChecklists', component: () => import('@/views/responsable/Checklist.vue') },
      
    ],
  },

  // 🔵 Admin
  {
    path: '/admin',
    component: AdminLayout,
    meta: { role: 'ADMIN' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'nouvelle-demande', name: 'ANouvelleDemande', component: () => import('@/views/admin/NouvelleDemande.vue') },
      { path: 'profil', name: 'AdminProfil', component: () => import('@/views/admin/profil.vue') },
      { path: 'utilisateurs', name: 'AdminUtilisateurs', component: () => import('@/views/admin/Utilisateurs.vue') },
      { path: 'notifications', name: 'Adminnotifications', component: () => import('@/views/admin/notifications.vue') },
      { path: 'roles-permissions', name: 'AdminRolesPermissions', component: () => import('@/views/admin/RolesPermissions.vue') },
    ],
  },

  // 🟠 Chauffeur
  {
    path: '/chauffeur',
    component: ChauffeurLayout,
    meta: { role: 'CHAUFFEUR' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'ChauffeurDashboard', component: () => import('@/views/chauffeur/Dashboard.vue') },
      { path: 'nouvelle-demande', name: 'chNouvelleDemande', component: () => import('@/views/chauffeur/NouvelleDemande.vue') },
      { path: 'missions', name: 'ChauffeurMissions', component: () => import('@/views/chauffeur/MesMissions.vue') },
      { path: 'profil', name: 'ChauffeurProfil', component: () => import('@/views/chauffeur/Profil.vue') },
      { path: 'historique', name: 'ChauffeurHistorique', component: () => import('@/views/chauffeur/historique.vue') },
      { path: 'notifications', name: 'ChauffeurNotifications', component: () => import('@/views/chauffeur/notifications.vue') },
      { path: 'mission-map', name: 'ChauffeurMissionMap', component: () => import('@/views/chauffeur/MissionMap.vue') },
    ],
  },

  // 🟣 Demandeur
  {
    path: '/demandeur',
    component: DemandeurLayout,
    meta: { role: 'DEMANDEUR' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'DemandeurDashboard', component: () => import('@/views/demandeur/Dashboard.vue') },
      { path: 'nouvelle-demande', name: 'DemandeurNouvelleDemande', component: () => import('@/views/demandeur/NouvelleDemande.vue') },
      { path: 'mes-demandes', name: 'DemandeurMesDemandes', component: () => import('@/views/demandeur/MesDemandes.vue') },
      { path: 'profil', name: 'DemandeurProfil', component: () => import('@/views/demandeur/profil.vue') },
      { path: 'aide', name: 'DemandeurAide', component: () => import('@/views/demandeur/Aide.vue') },
    ],
  },

  // 🟤 Responsable HSE
  {
    path: '/responsableHSE',
    component: HSELayout,
    meta: { role: 'RESPONSABLE_HSE' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'HseDashboard', component: () => import('@/views/responsableHse/Dashboard.vue') },
      { path: 'nouvelle-demande', name: 'HSENouvelleDemande', component: () => import('@/views/responsableHse/NouvelleDemande.vue') },
      { path: 'suivi-missions', name: 'Hsemission', component: () => import('@/views/responsableHse/suivi-missions.vue') },
      { path: 'incidents', name: 'Hseincidents', component: () => import('@/views/responsableHse/incidents.vue') },
      { path: 'rapport', name: 'RapportHse', component: () => import('@/views/responsableHse/RapportHse.vue') },
      { path: 'checklists', name: 'Hsechecklists', component: () => import('@/views/responsableHse/checklists.vue') },
      { path: 'notifications', name: 'Hsenotifications', component: () => import('@/views/responsableHse/notifications.vue') },
      { path: 'profil', name: 'HseProfil', component: () => import('@/views/responsableHse/Profil.vue') },
      
    ],
  },

  // 🟡 Manager (Chef de département)
  {
    path: '/chefDepartement',
    component: ManagerLayout,
    meta: { role: 'MANAGER' },
    children: [
    { path: '', redirect: 'dashboard' },
    { path: 'dashboard', name: 'ChefDepartementDashboard', component: () => import('@/views/manager/Dashboard.vue')},
    { path: 'nouvelle-demande', name: 'M-NouvelleDemande', component: () => import('@/views/manager/NouvelleDemande.vue') },
    {path: 'signalements',name: 'ChefDepartementSignalement', component: () => import('@/views/manager/Signalements.vue')},
    { path: 'profil', name: 'ChefDepartementProfil', component: () => import("@/views/manager/Profil.vue") },
    {  path:'interventions', name: 'ChefDepartementDemandes', component: () => import("@/views/manager/Demandes.vue") },
    { path: 'notifications', name: 'chefnotifications', component: () => import('@/views/manager/notifications.vue') },
    { path: 'historique',  component: () => import("@/views/manager/Historique.vue") },
    { path: '/signalements', name: 'ChefDepartementSignalements', component: () => import("@/views/manager/Signalements.vue") },
  ],
},
    


  // 🚫 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🛡️ Auth + rôles
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/mot-de-passe-oublie'];
  const authRequired = !publicPages.includes(to.path);
  const user = JSON.parse(localStorage.getItem('user'));

  if (authRequired && !user) {
    return next('/login');
  }

  if (to.meta.role && user?.role !== to.meta.role) {
    return next('/login');
  }

  next();
});

export default router;