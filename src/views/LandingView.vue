<script setup>
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const features = [
  { icon: '📊', title: 'AI Business Plans', desc: 'Generate comprehensive plans with financials, roadmaps and risk analysis in minutes.' },
  { icon: '💰', title: 'Financial Modeling', desc: 'Real-time burn rate tracking, runway projections, and cash flow forecasting.' },
  { icon: '🗺️', title: 'Smart Roadmaps', desc: 'Auto-generated phased roadmaps broken into actionable tasks with priorities.' },
  { icon: '👥', title: 'Team Workspace', desc: 'Invite your team, assign tasks, track progress, and collaborate in one place.' },
  { icon: '⚡', title: 'AI Insights Engine', desc: 'Proactive alerts and recommendations as your startup evolves in real time.' },
  { icon: '📈', title: 'Investor Reports', desc: 'Export pitch-ready reports and financial summaries for VC presentations.' },
]

const stats = [
  { value: '500+', label: 'Startups launched' },
  { value: '1,200+', label: 'Business plans generated' },
  { value: '98%', label: 'Budget accuracy' },
  { value: '4.9★', label: 'Average rating' },
]

const testimonials = [
  { text: 'StartupPilot cut our planning time from weeks to hours. The AI roadmap alone saved us from a critical cash flow mistake.', name: 'Sarah K.', role: 'CEO, Launchify' },
  { text: 'The financial modeling is incredibly accurate. Our investors were impressed by the depth of our pitch deck.', name: 'Ramy A.', role: 'Founder, Finterra' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <Navbar />

    <!-- Hero -->
    <main>
      <section class="relative overflow-hidden bg-white">
        <div class="bg-grid absolute inset-0 opacity-60 pointer-events-none"></div>
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/8 via-violet-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <!-- Left -->
          <div class="lg:col-span-5 space-y-7 animate-slide-up">
            <div class="inline-flex items-center gap-2 bg-primary-light text-primary border border-primary/20 rounded-full px-3.5 py-1.5 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow"></span>
              Now in public beta · Free to start
            </div>

            <h1 class="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Build your startup<br />
              <span class="text-gradient">with AI strategy</span>
            </h1>

            <p class="text-slate-500 text-lg leading-relaxed max-w-lg">
              Turn ideas into funded companies. AI-generated business plans, financial models, and execution roadmaps — ready in minutes.
            </p>

            <div class="flex flex-wrap gap-3 pt-1">
              <router-link to="/register" class="sp-btn-primary text-base px-7 py-3 shadow-elevated">
                Start free
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </router-link>
              <button class="sp-btn-outline text-base px-6 py-3">
                <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch demo
              </button>
            </div>

            <div class="flex items-center gap-4 pt-2">
              <div class="flex -space-x-2">
                <div v-for="i in 4" :key="i" class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  {{ ['S','R','A','M'][i-1] }}
                </div>
              </div>
              <p class="text-sm text-slate-500">Joined by <strong class="text-slate-800">500+ founders</strong> this month</p>
            </div>
          </div>

          <!-- Right: Dark Console Panel -->
          <div class="lg:col-span-7 flex justify-center lg:justify-end animate-fade-in">
            <div class="relative w-full max-w-[580px]">
              <!-- Floating badge -->
              <div class="absolute -top-4 -left-4 z-20 bg-white rounded-2xl px-4 py-2.5 shadow-elevated border border-[#e4e4f0] flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center font-black text-primary text-sm">98%</div>
                <div>
                  <p class="text-xs font-bold text-slate-900 leading-none">Budget Accuracy</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">AI Prediction Model</p>
                </div>
              </div>

              <div class="bg-[#0c101d] rounded-3xl p-6 shadow-2xl border border-slate-800 overflow-hidden">
                <!-- Window chrome -->
                <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-800/60">
                  <div class="flex gap-1.5">
                    <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <span class="text-[10px] uppercase tracking-widest font-mono text-slate-500">Financial Analytics Console</span>
                  <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgb(52,211,153,0.5)]"></div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <!-- Main chart -->
                  <div class="col-span-2 bg-[#121829] rounded-2xl p-4 border border-slate-800">
                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Financial Runway</p>
                    <div class="flex items-baseline gap-2 mt-1 mb-4">
                      <h3 class="text-xl font-black text-white">$142,380</h3>
                      <span class="text-emerald-400 text-xs font-bold">+12.4%</span>
                    </div>
                    <div class="flex items-end gap-1.5 h-20">
                      <div v-for="(h, i) in [38, 52, 45, 82, 60, 70, 88]" :key="i"
                        class="flex-1 rounded-t-sm transition-all"
                        :class="i === 3 ? 'bg-gradient-to-t from-primary to-violet-400' : 'bg-slate-700/80'"
                        :style="`height: ${h}%`">
                      </div>
                    </div>
                    <div class="flex justify-between text-[8px] font-mono text-slate-600 mt-2">
                      <span v-for="m in ['Jan','Feb','Mar','Apr','May','Jun','Jul']" :key="m">{{ m }}</span>
                    </div>
                  </div>

                  <!-- Side stats -->
                  <div class="flex flex-col gap-3">
                    <div class="bg-[#121829] rounded-2xl p-3.5 border border-slate-800">
                      <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Runway</p>
                      <p class="text-base font-black text-white mt-0.5">18 mo</p>
                      <div class="w-full bg-slate-800 h-1 rounded-full mt-2">
                        <div class="h-full w-3/4 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <div class="bg-[#121829] rounded-2xl p-3.5 border border-slate-800 flex-1">
                      <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ARR Goal</p>
                      <p class="text-base font-black text-emerald-400 mt-0.5">84%</p>
                      <p class="text-[9px] text-purple-400 mt-1.5">🚀 On track</p>
                    </div>
                  </div>
                </div>

                <!-- Bottom row -->
                <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/50 text-center">
                  <div><p class="text-[8px] font-bold text-slate-500 uppercase">Burn Rate</p><p class="text-xs font-bold text-red-400 mt-0.5">$8.2K/mo</p></div>
                  <div><p class="text-[8px] font-bold text-slate-500 uppercase">CAC</p><p class="text-xs font-bold text-slate-300 mt-0.5">1:3.4</p></div>
                  <div><p class="text-[8px] font-bold text-slate-500 uppercase">LTV</p><p class="text-xs font-bold text-emerald-400 mt-0.5">$4.2K</p></div>
                </div>
              </div>

              <!-- Bottom floating pill -->
              <div class="absolute -bottom-3 right-6 bg-white rounded-xl px-4 py-2 shadow-elevated border border-[#e4e4f0] flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-xs font-semibold text-slate-700">AI generating roadmap...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Bar -->
      <section class="border-y border-[#e4e4f0] bg-white py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="s in stats" :key="s.label">
            <p class="text-3xl font-black text-slate-900">{{ s.value }}</p>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">{{ s.label }}</p>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center mb-14">
          <p class="sp-section-title">Platform capabilities</p>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight">Everything your startup needs</h2>
          <p class="text-slate-500 mt-3 max-w-xl mx-auto">From idea validation to investor-ready reports — one platform to plan, build, and grow.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="f in features" :key="f.title" class="sp-card p-6 hover:shadow-elevated transition-shadow duration-200 group">
            <div class="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              {{ f.icon }}
            </div>
            <h3 class="font-bold text-slate-900 mb-1.5">{{ f.title }}</h3>
            <p class="text-sm text-slate-500 leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="bg-white border-y border-[#e4e4f0] py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="sp-section-title text-center">What founders say</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div v-for="t in testimonials" :key="t.name" class="sp-card p-7 space-y-4">
              <div class="flex gap-0.5">
                <svg v-for="i in 5" :key="i" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <p class="text-slate-700 leading-relaxed text-sm">"{{ t.text }}"</p>
              <div>
                <p class="font-bold text-sm text-slate-900">{{ t.name }}</p>
                <p class="text-xs text-slate-400">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="relative bg-primary rounded-3xl px-8 py-16 text-center overflow-hidden">
          <div class="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <h2 class="relative text-4xl font-black text-white tracking-tight">Launch your startup<br />in under 60 minutes</h2>
          <p class="relative text-primary-light/80 mt-3 mb-8 max-w-lg mx-auto">Join 500+ founders who've already generated their first AI business plan. No credit card required.</p>
          <router-link to="/register" class="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
            Get started free
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
