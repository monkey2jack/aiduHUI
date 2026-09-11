<script setup lang="ts">
/**
 * aiduHUI workbench — 爱嘟心视界
 *
 * The single page that carries every section kept in 0.1.0:
 *   模型管理 (通用 / 辅助 / 组合) · 设置 (上下文压缩 / 性能监控 / 用量 / 日志)
 *   任务 · 频道 · 记忆
 *
 * Design rule: this file composes EXISTING upstream views/components and adds
 * only chrome (a brand header + a section rail). No panel is reimplemented —
 * that keeps every front-end option byte-identical to Ekko Studio and keeps
 * the API surface untouched, so a later upstream merge stays cheap.
 */
import { computed, ref, watch } from 'vue'
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
import CompressionSettings from '@/components/hermes/settings/CompressionSettings.vue'
import ProfileSelector from '@/components/layout/ProfileSelector.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

type SectionKey = 'models' | 'settings' | 'jobs' | 'channels' | 'memory'
type SettingsKey = 'compression' | 'performance' | 'usage' | 'logs'

const SECTIONS = ['models', 'settings', 'jobs', 'channels', 'memory'] as const
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

// The URL is the source of truth so the rail, the browser back button and a
// pasted deep link all agree. `?s=` picks the section, `?p=` the settings pane.
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

const SECTION_META = computed<{ key: SectionKey; label: string; hint: string }[]>(() => [
  { key: 'models', label: t('workbench.sectionModels'), hint: t('workbench.sectionModelsHint') },
  { key: 'settings', label: t('workbench.sectionSettings'), hint: t('workbench.sectionSettingsHint') },
  { key: 'jobs', label: t('workbench.sectionJobs'), hint: t('workbench.sectionJobsHint') },
  { key: 'channels', label: t('workbench.sectionChannels'), hint: t('workbench.sectionChannelsHint') },
  { key: 'memory', label: t('workbench.sectionMemory'), hint: t('workbench.sectionMemoryHint') },
])
</script>

<template>
  <div class="workbench">
    <header class="wb-head">
      <div class="wb-brand">
        <span class="wb-brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.6 20.5 7v10L12 21.4 3.5 17V7z" />
            <path d="M3.5 7 12 11.6 20.5 7" />
            <path d="M12 21.4V11.6" />
          </svg>
        </span>
        <span class="wb-brand__text">
          <span class="wb-brand__gray">aidu</span><b class="wb-brand__blue">HUI</b>
          <i class="wb-brand__sep">·</i>
          <span class="wb-brand__gray">爱嘟</span><b class="wb-brand__blue">心视界</b>
        </span>
      </div>
      <div class="wb-head__right">
        <ProfileSelector />
      </div>
    </header>

    <div class="wb-body">
      <nav class="wb-rail" :aria-label="t('workbench.navLabel')">
        <button
          v-for="item in SECTION_META"
          :key="item.key"
          type="button"
          class="wb-rail__item"
          :class="{ 'is-active': section === item.key }"
          :aria-current="section === item.key ? 'page' : undefined"
          @click="selectSection(item.key)"
        >
          <span class="wb-rail__label">{{ item.label }}</span>
          <span class="wb-rail__hint">{{ item.hint }}</span>
        </button>
      </nav>

      <main class="wb-main">
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
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* aiduHUI VI — white paper, brand tricolour, Apple system voice.
   No fourth colour is introduced anywhere in this file. */
$wb-blue: #1f4e79;
$wb-gray: #525252;
$wb-ink: #000000;
$wb-line: rgba(82, 82, 82, 0.16);
$wb-blue-tint: rgba(31, 78, 121, 0.07);
$wb-blue-line: rgba(31, 78, 121, 0.28);
$wb-font: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;

.workbench {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--bg-primary);
  font-family: $wb-font;
}

/* ---------- brand header ---------- */
.wb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
  padding: 10px 20px;
  border-bottom: 1px solid $wb-line;
  background: var(--bg-card);
}

.wb-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wb-brand__mark {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  color: $wb-blue;
}

.wb-brand__mark svg {
  width: 100%;
  height: 100%;
}

.wb-brand__text {
  font-size: 15px;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.wb-brand__gray {
  color: $wb-gray;
}

.wb-brand__blue {
  color: $wb-blue;
  font-weight: 600;
}

.wb-brand__sep {
  margin: 0 4px;
  color: $wb-blue;
  font-style: normal;
  opacity: 0.55;
}

.wb-head__right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* ---------- body: rail + main ---------- */
.wb-body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

.wb-rail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 0 0 auto;
  width: 148px;
  padding: 14px 10px;
  border-right: 1px solid $wb-line;
  background: var(--bg-card);
  overflow-y: auto;
}

.wb-rail__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: $wb-gray;
  font-family: inherit;
  font-size: 13.5px;
  text-align: left;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;
}

.wb-rail__item:hover {
  background: var(--bg-card-hover, rgba(0, 0, 0, 0.03));
  color: $wb-ink;
}

.wb-rail__item:focus-visible {
  outline: 2px solid $wb-blue;
  outline-offset: 1px;
}

.wb-rail__item.is-active {
  background: $wb-blue-tint;
  border-color: $wb-blue-line;
  color: $wb-blue;
  font-weight: 600;
}

.wb-rail__hint {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wb-rail__item.is-active .wb-rail__hint {
  color: $wb-blue;
  opacity: 0.7;
}

.wb-main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

/* ---------- settings panes ---------- */
.wb-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0 20px 20px;
}

.wb-settings__tabs {
  flex: 0 0 auto;
}

.wb-pane {
  padding-top: 12px;
}

@media (max-width: 768px) {
  .wb-rail {
    width: 108px;
    padding: 10px 6px;
  }

  .wb-rail__hint {
    display: none;
  }

  .wb-brand__sep,
  .wb-brand__text .wb-brand__gray:last-of-type {
    display: none;
  }
}
</style>
