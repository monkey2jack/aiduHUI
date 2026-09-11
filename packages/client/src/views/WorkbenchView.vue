<script setup lang="ts">
/**
 * aiduHUI workbench — 爱嘟心视界
 *
 * 严格对齐 aiduMEI / aiduPARK 界面范式与布局规范：
 * 1. 屏幕宽度占比与 aiduPARK 保持一致：70% 宽幅 shell (--shell: 1240px)，Tabs、Stage、Header 宽度完全一致
 * 2. 顶部 Header (brandbar)：左侧版本号 (v0.1.0)，右侧 Powered by monkey² 与 GitHub 图标
 * 3. 顶部水平选项卡 (Nav Tabs)：自适应宽度居中，收纳 6 个主模块（含 PROFILES 配置档案）
 * 4. 底部 Footer：居中网站名（aiduHUI⚕爱嘟心视界），背景纯透明，同字号同基线
 * 5. 各部分卡片透明度降至 30%（0.30），显透底层 Canvas 三角晶格动态背景
 * 6. Slogan 动效：在整行空白区域内随机横向跳动浮现（I do·惟吾 / aidu·爱嘟 / AI do·智助）
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NTabPane, NTabs } from 'naive-ui'

import ModelsView from '@/views/hermes/ModelsView.vue'
import JobsView from '@/views/hermes/JobsView.vue'
import ChannelsView from '@/views/hermes/ChannelsView.vue'
import MemoryView from '@/views/hermes/MemoryView.vue'
import PerformanceView from '@/views/hermes/PerformanceView.vue'
import UsageView from '@/views/hermes/UsageView.vue'
import LogsView from '@/views/hermes/LogsView.vue'
import ProfilesView from '@/views/hermes/ProfilesView.vue'
import CompressionSettings from '@/components/hermes/settings/CompressionSettings.vue'
import { mountLatticeBG, unmountLatticeBG } from '@/utils/lattice-bg'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const workbenchRef = ref<HTMLElement | null>(null)

type SectionKey = 'models' | 'settings' | 'jobs' | 'channels' | 'memory' | 'profiles'
type SettingsKey = 'compression' | 'performance' | 'usage' | 'logs'

const SECTIONS = ['models', 'settings', 'jobs', 'channels', 'memory', 'profiles'] as const
const SETTINGS_PANES = ['compression', 'performance', 'usage', 'logs'] as const

const section = ref<SectionKey>('models')
const settingsPane = ref<SettingsKey>('compression')

function normalizeSection(value: unknown): SectionKey {
  const key = typeof value === 'string' ? value : ''
  return (SECTIONS as readonly string[]).includes(key) ? (key as SectionKey) : 'models'
}

function normalizeSettingsPane(value: unknown): SettingsKey {
  const key = typeof value === 'string' ? value : ''
  return (SETTINGS_PANES as readonly string[]).includes(key)
    ? (key as SettingsKey)
    : 'compression'
}

watch(
  () => route.query,
  (query) => {
    section.value = normalizeSection(query.s)
    settingsPane.value = normalizeSettingsPane(query.p)
  },
  { immediate: true },
)

function selectSection(key: SectionKey) {
  if (key === section.value) return
  void router.replace({
    query: { ...route.query, s: key === 'models' ? undefined : key, p: undefined },
  })
}

function selectSettingsPane(key: SettingsKey) {
  if (key === settingsPane.value) return
  void router.replace({
    query: { ...route.query, s: 'settings', p: key === 'compression' ? undefined : key },
  })
}

const SECTION_TABS = computed<{ key: SectionKey; en: string; label: string; icon: string }[]>(() => [
  {
    key: 'models',
    en: 'MODELS',
    label: t('workbench.sectionModels'),
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
  {
    key: 'settings',
    en: 'SETTINGS',
    label: t('workbench.sectionSettings'),
    icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7.5-3a7.5 7.5 0 01-.1 1.2l2.1 1.6-2 3.5-2.5-1a7.5 7.5 0 01-2.1 1.2l-.4 2.7h-4l-.4-2.7a7.5 7.5 0 01-2.1-1.2l-2.5 1-2-3.5 2.1-1.6A7.5 7.5 0 014.5 12c0-.4 0-.8.1-1.2L2.5 9.2l2-3.5 2.5 1A7.5 7.5 0 019.1 5.5L9.5 2.8h4l.4 2.7a7.5 7.5 0 012.1 1.2l2.5-1 2 3.5-2.1 1.6c.1.4.1.8.1 1.2z',
  },
  {
    key: 'jobs',
    en: 'JOBS',
    label: t('workbench.sectionJobs'),
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'channels',
    en: 'CHANNELS',
    label: t('workbench.sectionChannels'),
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    key: 'memory',
    en: 'MEMORY',
    label: t('workbench.sectionMemory'),
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    key: 'profiles',
    en: 'PROFILES',
    label: t('profiles.title') || '配置档案',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
])

// Slogan dynamic pairs
const SLOGAN_PAIRS = [
  { tier: 'gray', en: 'I do', cn: '惟吾' },
  { tier: 'ink', en: 'aidu', cn: '爱嘟' },
  { tier: 'blue', en: 'AI do', cn: '智助' },
]

const sloganIndex = ref(0)
const isSwitching = ref(false)
const sloganLeftPercent = ref(50) // 随机在 25% ~ 75% 空白区域浮现
let sloganTimer: ReturnType<typeof setInterval> | null = null

const currentSlogan = computed(() => SLOGAN_PAIRS[sloganIndex.value])

function pickRandomPosition() {
  // 生成 25% 到 75% 之间的随机百分比位置
  sloganLeftPercent.value = Math.round(25 + Math.random() * 50)
}

onMounted(() => {
  if (workbenchRef.value) {
    mountLatticeBG(workbenchRef.value)
  }

  pickRandomPosition()
  sloganTimer = setInterval(() => {
    isSwitching.value = true
    setTimeout(() => {
      sloganIndex.value = (sloganIndex.value + 1) % SLOGAN_PAIRS.length
      pickRandomPosition()
      isSwitching.value = false
    }, 240)
  }, 3200)
})

onUnmounted(() => {
  if (workbenchRef.value) {
    unmountLatticeBG(workbenchRef.value)
  }
  if (sloganTimer) {
    clearInterval(sloganTimer)
    sloganTimer = null
  }
})
</script>

<template>
  <div ref="workbenchRef" class="workbench">
    <!-- Top Header: 宽度严格对齐 70% 容器 -->
    <header class="brandbar">
      <div class="shell brandbar-inner">
        <div class="foot-left">
          <span class="ver-text">v0.1.0</span>
        </div>

        <!-- Slogan 在该行空白区域随机跳动浮现 -->
        <div
          class="slogan-wrap"
          :class="[{ 'is-switching': isSwitching }, `tier-${currentSlogan.tier}`]"
          :style="{ left: `${sloganLeftPercent}%` }"
        >
          <span class="slogan-en">{{ currentSlogan.en }}</span>
          <span class="slogan-dot">·</span>
          <span class="slogan-cn">{{ currentSlogan.cn }}</span>
        </div>

        <div class="foot-right">
          <span>Powered by <b>monkey²</b></span>
          <a
            class="gh-link"
            href="https://github.com/monkey2jack"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Top Navigation Horizontal Tabs: 宽度严格对齐 70% 容器，自适应居中 -->
    <nav class="wb-nav">
      <div class="shell nav-shell">
        <div class="tab-list" role="tablist" :aria-label="t('workbench.navLabel')">
          <button
            v-for="item in SECTION_TABS"
            :key="item.key"
            type="button"
            class="nav-tab-item"
            :class="{ 'is-active': section === item.key }"
            role="tab"
            :aria-selected="section === item.key"
            @click="selectSection(item.key)"
          >
            <svg class="tab-item__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path :d="item.icon" />
            </svg>
            <span class="tab-item__label">{{ item.label }}</span>
            <span class="tab-item__en">{{ item.en }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Stage Content Area: 宽度严格对齐 70% 容器，30% 透明度磨砂透出背景 -->
    <main class="wb-stage">
      <div class="shell stage-inner">
        <div class="paper-card">
          <ModelsView v-if="section === 'models'" />

          <div v-else-if="section === 'settings'" class="wb-settings">
            <NTabs
              :value="settingsPane"
              type="line"
              animated
              class="wb-settings__tabs"
              @update:value="selectSettingsPane"
            >
              <NTabPane name="compression" :tab="t('workbench.paneCompression')">
                <div class="wb-pane"><CompressionSettings /></div>
              </NTabPane>
              <NTabPane name="performance" :tab="t('workbench.panePerformance')">
                <div class="wb-pane"><PerformanceView /></div>
              </NTabPane>
              <NTabPane name="usage" :tab="t('workbench.paneUsage')">
                <div class="wb-pane"><UsageView /></div>
              </NTabPane>
              <NTabPane name="logs" :tab="t('workbench.paneLogs')">
                <div class="wb-pane"><LogsView /></div>
              </NTabPane>
            </NTabs>
          </div>

          <JobsView v-else-if="section === 'jobs'" />
          <ChannelsView v-else-if="section === 'channels'" />
          <MemoryView v-else-if="section === 'memory'" />
          <ProfilesView v-else-if="section === 'profiles'" />
        </div>
      </div>
    </main>

    <!-- Bottom Footer: 纯透明背景，文字间无空格，同字号同基线 -->
    <footer class="site-foot">
      <div class="shell foot-shell">
        <div class="site-foot-brand">
          <picture>
            <source srcset="/assets/img/monkey.webp" type="image/webp" />
            <img class="brand-logo" src="/assets/img/monkey.png" alt="aiduHUI" width="44" height="44" draggable="false" />
          </picture>
          <span class="wordmark"><span class="lbl-gray">aidu</span><b class="lbl-blue">HUI</b><i class="sep">⚕</i><span class="lbl-gray">爱嘟</span><b class="lbl-blue">心视界</b></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
$blue: #1f4e79;
$gray: #525252;
$ink: #000000;
$gray-soft: #7c7c7c;
$gray-faint: #9a9a9a;
$gray-line: rgba(82, 82, 82, 0.16);
$blue-tint: rgba(31, 78, 121, 0.08);
$blue-line: rgba(31, 78, 121, 0.28);
$radius: 12px;
$ease: cubic-bezier(0.22, 0.61, 0.36, 1);
$font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
$mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, "PingFang SC", Consolas, monospace;

.workbench {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #ffffff;
  font-family: $font;
  color: $gray;
}

/* 70% Width Shell, 严格对齐 aiduPARK / aiduMEI 标准 (--shell: 1240px) */
.shell {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 clamp(16px, 2vw, 32px);
}

/* Top brandbar Header (Version on left, Powered by monkey² on right) */
.brandbar {
  position: relative;
  z-index: 20;
  width: 100%;
  padding: 12px 0 6px;
  background: transparent;
}

.brandbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ver-text {
  font-family: $mono;
  font-size: 13px;
  font-weight: 600;
  color: $gray-faint;
  letter-spacing: 0.04em;
}

.foot-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: $gray-faint;

  b {
    color: $blue;
    font-weight: 700;
  }
}

.gh-link {
  display: inline-flex;
  align-items: center;
  color: $gray;
  transition: color 0.2s $ease;

  &:hover {
    color: $blue;
  }

  svg {
    width: 17px;
    height: 17px;
  }
}

/* Slogan 动态浮现：在 Header 空白区域内随机跳动位置 */
.slogan-wrap {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 1.12rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  opacity: 1;
  transition: opacity 0.24s $ease, transform 0.24s $ease, left 0.4s $ease;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;

  &.is-switching {
    opacity: 0;
    transform: translate(-50%, calc(-50% - 4px));
  }

  &.tier-ink {
    color: $ink;
  }

  &.tier-gray {
    color: $gray;
  }

  &.tier-blue {
    color: $blue;
  }
}

.slogan-en {
  font-family: $font;
  font-weight: 700;
}

.slogan-dot {
  opacity: 0.45;
  font-size: 0.9em;
}

.slogan-cn {
  font-family: $font;
  font-weight: 700;
}

/* Top Navigation Horizontal Tabs: 保持 70% 居中，6 个选项卡均分整行自适应 */
.wb-nav {
  position: relative;
  z-index: 15;
  width: 100%;
  padding: 6px 0 10px;
  background: transparent;
}

.nav-shell {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}

.tab-list {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  padding: 4px 0 8px;
  border-bottom: 1px solid $gray-line;
}

.nav-tab-item {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(82, 82, 82, 0.12);
  /* 适度磨砂 24%，既看清内容也透出晶格 */
  background: rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.22s $ease;
  outline: none;
  white-space: nowrap;
}

.nav-tab-item:hover {
  background: rgba(255, 255, 255, 0.55);
  border-color: $blue-line;
  transform: translateY(-1px);
}

.nav-tab-item.is-active {
  background: rgba(255, 255, 255, 0.70);
  border-color: $blue;
  box-shadow: 0 4px 14px rgba(31, 78, 121, 0.10);
}

.tab-item__icon {
  width: 16px;
  height: 16px;
  stroke: $blue;
  stroke-width: 1.8;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tab-item__label {
  font-size: 0.92rem;
  font-weight: 700;
  color: $ink;
}

.tab-item__en {
  font-family: $mono;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(82, 82, 82, 0.5);
}

.nav-tab-item.is-active .tab-item__en {
  color: $blue;
}

/* Stage Area: 30% 透明度透底 (rgba 0.30) */
.wb-stage {
  position: relative;
  z-index: 10;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 74px;
}

.stage-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.paper-card {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* 适度磨砂 22% (rgba 0.22)，保持阅读质感同时背景晶格通透可见 */
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(82, 82, 82, 0.14);
  border-radius: $radius;
  box-shadow: 0 8px 32px rgba(31, 78, 121, 0.03);
  padding: 16px 20px;

  /* 穿透控制内嵌卡片透明度 */
  :deep(.provider-card),
  :deep(.profile-card),
  :deep(.job-card),
  :deep(.channel-card),
  :deep(.n-card) {
    background: rgba(255, 255, 255, 0.35) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-color: rgba(82, 82, 82, 0.14) !important;
  }
}

.wb-settings {
  display: flex;
  flex-direction: column;
}

.wb-pane {
  padding-top: 12px;
}

/* Bottom Footer: 纯透明背景，宽度与上方 70% shell 严格一致 */
.site-foot {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0 16px;
  background: transparent; /* 网站名那一行卡片纯透明 */
  border-top: none;
  pointer-events: none;
}

.foot-shell {
  display: flex;
  justify-content: center;
}

.site-foot-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  pointer-events: auto;
}

.brand-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 6px;
  flex-shrink: 0;
}

.wordmark {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
}

.wordmark .lbl-gray {
  color: $gray;
  font-weight: 700;
}

.wordmark .lbl-blue {
  color: $blue;
  font-weight: 700;
}

.wordmark .sep {
  display: inline-block;
  margin: 0 6px;
  color: $blue;
  font-style: normal;
  font-weight: 400;
  font-size: 28px;
}
</style>
