import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '../middleware/authGuard'
import LandingView from '../views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // Public
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { guestOnly: true } },

    // Protected (any authenticated user)
    { path: '/onboarding', name: 'onboarding', component: () => import('../views/OnboardingView.vue'), meta: { requiresAuth: true } },


    // Empty dashboard (no roadmap yet)
    {
      path: '/dashboard/empty',
      name: 'empty-dashboard',
      component: () => import('../views/EmptyDashboardView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },

    // Role-based dashboards
    {
      path: '/dashboard/manager',
      name: 'manager-dashboard',
      component: () => import('../views/ManagerDashboardView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/manager/financials',
      name: 'manager-financials',
      component: () => import('../views/FinancialsView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/manager/projects',
      name: 'manager-projects',
      component: () => import('../views/ManagerProjectsView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/manager/teams',
      name: 'manager-teams',
      component: () => import('../views/ManagerTeamsView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/manager/calendar',
      name: 'manager-calendar',
      component: () => import('../views/ManagerCalendarView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/manager/tasks',
      name: 'manager-tasks',
      component: () => import('../views/ManagerTasksView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/manager/settings',
      name: 'manager-settings',
      component: () => import('../views/ManagerSettingsView.vue'),
      meta: { requiresAuth: true, roles: ['manager'] },
    },
    {
      path: '/dashboard/employee',
      name: 'employee-dashboard',
      component: () => import('../views/EmployeeDashboardView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },

    // Employee sub-pages
    {
      path: '/dashboard/employee/tasks',
      name: 'employee-tasks',
      component: () => import('../views/EmployeeTasksView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/projects',
      name: 'employee-projects',
      component: () => import('../views/EmployeeProjectsView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/projects/:id',
      name: 'employee-project-details',
      component: () => import('../views/ProjectDetailsView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/calendar',
      name: 'employee-calendar',
      component: () => import('../views/EmployeeCalendarView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/messages',
      name: 'employee-messages',
      component: () => import('../views/EmployeeMessagesView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/profile',
      name: 'employee-profile',
      component: () => import('../views/EmployeeProfileView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/settings',
      name: 'employee-settings',
      component: () => import('../views/EmployeeSettingsView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },
    {
      path: '/dashboard/employee/ai-workspace',
      name: 'employee-ai-workspace',
      component: () => import('../views/AIWorkspaceView.vue'),
      meta: { requiresAuth: true, roles: ['employee'] },
    },

    // Misc
    { path: '/unauthorized', name: 'unauthorized', component: () => import('../views/UnauthorizedView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(authGuard)

export default router
