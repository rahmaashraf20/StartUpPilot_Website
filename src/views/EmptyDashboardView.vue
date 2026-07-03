<script setup>
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import {
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const router = useRouter()
const topbarUser = useAuthUser(mockManagerUser)

function handleNavigate(id) {
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
  if (id === 'settings') router.push('/manager/settings')
  if (id === 'dashboard') router.push('/dashboard/manager')
  if (id === 'projects') router.push('/manager/projects')
  if (id === 'financials') router.push('/manager/financials')
  if (id === 'tasks') router.push('/manager/tasks')
}
</script>

<template>
  <DashboardLayout
    active-id="dashboard"
    :sidebar-sections="managerSidebarSections"
    :notifications-count="managerNotificationsCount"
    :user="topbarUser"
    @navigate="handleNavigate"
  >
    <!-- Empty State Hero -->
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-slide-up">
      <!-- Illustration -->
      <div class="relative mb-6">
        <div class="w-24 h-24 rounded-2xl bg-white border border-[#e4e4f0] shadow-elevated flex items-center justify-center">
          <svg class="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <!-- Sparkle decoration -->
        <svg class="absolute -top-2 -right-2 w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
        </svg>
      </div>

      <h1 class="text-2xl font-black text-slate-900 mb-2">
        Welcome to Your New Workspace! ✨
      </h1>
      <p class="text-sm text-slate-400 max-w-sm leading-relaxed mb-8">
        Your AI-driven dashboard is ready, but it looks like you haven't generated a project plan yet. Let's build your future today.
      </p>

      <!-- Primary CTA -->
      <button class="sp-btn-primary text-base px-8 py-3.5 mb-4 shadow-elevated">
        Generate Your First AI Business Plan
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>

      <!-- Secondary action -->
      <button class="text-sm font-semibold text-primary hover:underline underline-offset-2 transition-colors">
        Or import an existing roadmap
      </button>
    </div>

    <!-- Skeleton placeholder cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="i in 4" :key="i" class="sp-card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="h-3 w-20 bg-slate-100 rounded-full"></div>
          <div class="w-7 h-7 rounded-lg bg-slate-100"></div>
        </div>
        <div class="h-7 w-24 bg-slate-100 rounded-full mb-2"></div>
        <div class="h-1.5 w-full bg-slate-100 rounded-full mb-2"></div>
        <div class="h-3 w-16 bg-slate-100 rounded-full"></div>
      </div>
    </div>

    <!-- Skeleton bottom row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 sp-card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <div class="h-4 w-32 bg-slate-100 rounded-full mb-2"></div>
            <div class="h-3 w-48 bg-slate-100 rounded-full"></div>
          </div>
          <div class="h-8 w-32 bg-slate-100 rounded-xl"></div>
        </div>
        <div class="flex items-end gap-1.5 h-40 mb-2">
          <div
            v-for="(h, i) in [35, 50, 45, 65, 55, 70, 60, 80, 65, 75, 58, 70]"
            :key="i"
            class="flex-1 rounded-t-md bg-slate-100"
            :style="`height: ${h}%`"
          ></div>
        </div>
        <div class="flex justify-between">
          <div v-for="i in 12" :key="i" class="h-2.5 w-4 bg-slate-100 rounded-full"></div>
        </div>
      </div>

      <div class="sp-card p-6">
        <div class="flex items-center justify-between mb-5">
          <div class="h-4 w-24 bg-slate-100 rounded-full"></div>
          <div class="h-3 w-12 bg-slate-100 rounded-full"></div>
        </div>
        <div class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-start gap-3">
            <div class="w-4 h-4 rounded border-2 border-slate-200 mt-0.5 shrink-0"></div>
            <div class="flex-1">
              <div class="h-3 w-full bg-slate-100 rounded-full mb-2"></div>
              <div class="h-2.5 w-20 bg-slate-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
