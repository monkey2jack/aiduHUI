<script setup lang="ts">
/**
 * aiduHUI workbench — 爱嘟心视界
 *
 * 彻底重构布局体系：
 * 1. 左右分栏：6 个主选项卡垂直卡片位于左侧，高度自适应均分填满，右侧展示对应内容，保持 70% 宽幅 shell
 * 2. 左侧栏具备收起/展开折叠切换按钮，收起时仅展示精简图标以最大化右侧区域
 * 3. 右侧子选项卡 header (如通用/辅助/组合，上下文/性能/用量/日志) 严格吸顶固定，滚动内容不随之移动
 * 4. 降低透明度（提高不透明度至 0.65~0.75），确保阅读清晰质感，底纹晶格隐约透出
 * 5. 顶栏 brandbar 保留 v0.1.0、随机 Slogan 动效与 Powered by monkey²
 * 6. 底栏 Footer 保持纯透明居中对齐
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
import { clearApiKey } from '@/api/client'
import { mountLatticeBG, unmountLatticeBG } from '@/utils/lattice-bg'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const workbenchRef = ref<HTMLElement | null>(null)
const sidebarCollapsed = ref(false)

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
const sloganLeftPercent = ref(50)
let sloganTimer: ReturnType<typeof setInterval> | null = null

const currentSlogan = computed(() => SLOGAN_PAIRS[sloganIndex.value])

function handleLogout() {
  clearApiKey()
  void router.replace('/login')
}

function pickRandomPosition() {
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
    <!-- Top Header: 严格对齐 70% 容器 -->
    <header class="brandbar">
      <div class="shell brandbar-inner">
        <div class="foot-left">
          <span class="ver-text">v0.1.0</span>
        </div>

        <!-- Slogan 在空白区域随机跳动浮现 -->
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

    <!-- Main Workspace Stage: 70% 宽度左右分栏布局 -->
    <main class="wb-stage">
      <div class="shell stage-inner">
        <!-- 左侧 6 大卡片导航 + 优雅分界线折叠按钮 + 底部 Logout -->
        <aside class="wb-sidebar" :class="{ 'is-collapsed': sidebarCollapsed }">
          <!-- 分界线悬浮折叠圆钮 -->
          <button
            type="button"
            class="boundary-toggle-btn"
            :title="sidebarCollapsed ? '展开侧栏' : '收起侧栏'"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline v-if="!sidebarCollapsed" points="14 18 8 12 14 6" />
              <polyline v-else points="10 18 16 12 10 6" />
            </svg>
          </button>

          <div class="sidebar-cards">
            <button
              v-for="item in SECTION_TABS"
              :key="item.key"
              type="button"
              class="side-card"
              :class="{ 'is-active': section === item.key }"
              :title="item.label"
              @click="selectSection(item.key)"
            >
              <div class="side-card__icon-wrap">
                <svg class="side-card__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="item.icon" />
                </svg>
              </div>
              <div v-if="!sidebarCollapsed" class="side-card__meta">
                <span class="side-card__title">{{ item.label }}</span>
                <span class="side-card__en">{{ item.en }}</span>
              </div>
            </button>
          </div>

          <!-- 左下角 Logout 按钮 -->
          <div class="sidebar-foot">
            <button
              type="button"
              class="logout-btn"
              :title="t('login.logout') || '退出登录'"
              @click="handleLogout"
            >
              <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span v-if="!sidebarCollapsed" class="logout-text">{{ t('login.logout') || '退出登录' }}</span>
            </button>
          </div>
        </aside>

        <!-- 右侧内容展示面板：适度透明度 (0.72)，子 header 绝对吸顶固定 -->
        <section class="paper-card">
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
        </section>
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

/* Top brandbar Header */
.brandbar {
  position: relative;
  z-index: 20;
  width: 100%;
  padding: 12px 0 8px;
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

  &.tier-ink { color: $ink; }
  &.tier-gray { color: $gray; }
  &.tier-blue { color: $blue; }
}

.slogan-en { font-family: $font; font-weight: 700; }
.slogan-dot { opacity: 0.45; font-size: 0.9em; }
.slogan-cn { font-family: $font; font-weight: 700; }

/* Stage Area: 左右分栏 */
.wb-stage {
  position: relative;
  z-index: 10;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 74px; /* Space for centered footer */
}

.stage-inner {
  height: 100%;
  display: flex;
  gap: 16px;
}

/* 左侧 6 卡片导航侧栏 */
.wb-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 210px;
  flex-shrink: 0;
  height: 100%;
  transition: width 0.24s $ease;

  &.is-collapsed {
    width: 62px;
  }
}

/* 分界线优雅收起展开胶囊圆钮 */
.boundary-toggle-btn {
  position: absolute;
  top: 50%;
  right: -13px;
  transform: translateY(-50%);
  z-index: 40;
  width: 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(82, 82, 82, 0.16);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(31, 78, 121, 0.12);
  color: $gray;
  cursor: pointer;
  transition: all 0.2s $ease;

  &:hover {
    color: $blue;
    border-color: $blue;
    background: #ffffff;
    transform: translateY(-50%) scale(1.08);
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

/* 左下角 Logout 样式 */
.sidebar-foot {
  padding-top: 10px;
  flex-shrink: 0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid rgba(82, 82, 82, 0.14);
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(6px);
  color: $gray-soft;
  cursor: pointer;
  transition: all 0.2s $ease;

  &:hover {
    color: #c62828;
    border-color: rgba(198, 40, 40, 0.35);
    background: rgba(255, 255, 255, 0.88);
  }
}

.is-collapsed .logout-btn {
  padding: 9px 0;
  justify-content: center;
}

.logout-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.logout-text {
  font-size: 0.84rem;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-cards {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.side-card {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-radius: $radius;
  border: 1px solid rgba(82, 82, 82, 0.16);
  /* 适度磨砂，不透明度提升至 0.65，显质感 */
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.22s $ease;
  outline: none;
  text-align: start;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.88);
    border-color: $blue-line;
    transform: translateX(2px);
  }

  &.is-active {
    background: rgba(255, 255, 255, 0.95);
    border-color: $blue;
    box-shadow: 0 6px 20px rgba(31, 78, 121, 0.12);
  }
}

.is-collapsed .side-card {
  padding: 0;
  justify-content: center;
}

.side-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.side-card__icon {
  width: 20px;
  height: 20px;
  stroke: $blue;
  stroke-width: 1.8;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.side-card__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.side-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: $ink;
  white-space: nowrap;
}

.side-card__en {
  font-family: $mono;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(82, 82, 82, 0.55);
}

.side-card.is-active .side-card__en {
  color: $blue;
}

/* 右侧内容容器：适度提高不透明度至 0.72，阅读清晰，晶格隐约可见 */
.paper-card {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(82, 82, 82, 0.16);
  border-radius: $radius;
  box-shadow: 0 8px 32px rgba(31, 78, 121, 0.04);
  padding: 16px 22px;

  /* 穿透控制内嵌卡片透明度 */
  :deep(.provider-card),
  :deep(.profile-card),
  :deep(.job-card),
  :deep(.channel-card),
  :deep(.n-card) {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-color: rgba(82, 82, 82, 0.14) !important;
  }

  /* 隐藏子视图内冗余的标题，保留纯操作按钮 */
  :deep(.models-header-left),
  :deep(.page-header .header-title) {
    display: none !important;
  }

  :deep(.page-header) {
    border-bottom: none !important;
    min-height: 0 !important;
    padding: 0 0 10px 0 !important;
  }

  /* 子选项卡固定置顶：粘性定位吸顶，背景透光且滚动绝对不移走 */
  :deep(.models-content > .n-tabs > .n-tabs-nav),
  :deep(.wb-settings > .n-tabs > .n-tabs-nav),
  :deep(.jobs-view > .page-header),
  :deep(.profiles-view > .page-header) {
    position: sticky !important;
    top: 0 !important;
    z-index: 20 !important;
    background: rgba(255, 255, 255, 0.94) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    border-bottom: 1px solid $gray-line !important;
  }
}

.wb-settings {
  display: flex;
  flex-direction: column;
}

.wb-pane {
  padding-top: 12px;
}

/* Bottom Footer: 纯透明背景 */
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
  background: transparent;
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

.wordmark .lbl-gray { color: $gray; font-weight: 700; }
.wordmark .lbl-blue { color: $blue; font-weight: 700; }
.wordmark .sep {
  display: inline-block;
  margin: 0 6px;
  color: $blue;
  font-style: normal;
  font-weight: 400;
  font-size: 28px;
}

/* 手机端响应式适配 (Mobile & Tablet) */
@media (max-width: 768px) {
  .shell {
    padding: 0 12px;
  }

  .stage-inner {
    flex-direction: column;
    gap: 10px;
  }

  .wb-sidebar {
    width: 100% !important;
    height: auto !important;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
  }

  .boundary-toggle-btn {
    display: none !important;
  }

  .sidebar-cards {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .side-card {
    flex: 0 0 auto;
    padding: 8px 14px;
  }

  .sidebar-foot {
    padding-top: 0;
    margin-inline-start: auto;
  }

  .logout-btn {
    width: auto;
    padding: 8px 12px;
  }

  .paper-card {
    padding: 12px 14px;
  }

  .wordmark {
    font-size: 24px;
  }

  .slogan-wrap {
    display: none;
  }
}
</style>
