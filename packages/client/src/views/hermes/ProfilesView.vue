<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton, NSpin, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import ProfilesPanel from '@/components/hermes/profiles/ProfilesPanel.vue'
import ProfileCreateModal from '@/components/hermes/profiles/ProfileCreateModal.vue'
import ProfileRenameModal from '@/components/hermes/profiles/ProfileRenameModal.vue'
import ProfileImportModal from '@/components/hermes/profiles/ProfileImportModal.vue'
import { useProfilesStore } from '@/stores/hermes/profiles'
import { restartProfileGateway } from '@/api/hermes/profiles'

const { t } = useI18n()
const message = useMessage()
const profilesStore = useProfilesStore()

const showCreateModal = ref(false)
const showImportModal = ref(false)
const restartingGateway = ref(false)
const renamingProfile = ref<string | null>(null)

async function handleRestartActiveGateway() {
  const profileName = profilesStore.activeProfileName || 'default'
  restartingGateway.value = true
  try {
    await restartProfileGateway(profileName)
    message.success(t('profiles.runtime.gatewayRestarted', { name: profileName }) || '网关已重启')
  } catch (err: any) {
    message.error(err?.message || t('profiles.runtime.gatewayRestartFailed') || '网关重启失败')
  } finally {
    restartingGateway.value = false
  }
}

onMounted(() => {
  profilesStore.fetchHermesProfiles()
})

function handleCreated() {
  showCreateModal.value = false
}

function handleRenamed() {
  renamingProfile.value = null
}

function handleImported() {
  showImportModal.value = false
}
</script>

<template>
  <div class="profiles-view">
    <header class="page-header">
      <h2 class="header-title">{{ t('profiles.title') }}</h2>
      <div class="header-actions">
        <NButton
          size="small"
          type="warning"
          secondary
          :loading="restartingGateway"
          @click="handleRestartActiveGateway"
        >
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9 9.7 9.7 0 0 1-6.7-2.7"/><path d="M3 12a9 9 0 0 1 9-9 9.7 9.7 0 0 1 6.7 2.7"/><path d="M21 3v6h-6"/><path d="M3 21v-6h6"/></svg>
          </template>
          {{ t('profiles.runtime.restartGateway') || '重启网关' }}
        </NButton>
        <NButton size="small" @click="showImportModal = true">
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </template>
          {{ t('profiles.import') }}
        </NButton>
        <NButton type="primary" size="small" @click="showCreateModal = true">
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </template>
          {{ t('profiles.create') }}
        </NButton>
      </div>
    </header>

    <div class="profiles-content">
      <NSpin :show="profilesStore.loading && profilesStore.profiles.length === 0">
        <ProfilesPanel @rename="renamingProfile = $event" />
      </NSpin>
    </div>

    <ProfileCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @saved="handleCreated"
    />
    <ProfileRenameModal
      v-if="renamingProfile"
      :profile-name="renamingProfile"
      @close="renamingProfile = null"
      @saved="handleRenamed"
    />
    <ProfileImportModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @saved="handleImported"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.profiles-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  border-bottom: none !important;
  min-height: 0 !important;
  padding: 0 0 10px 0 !important;
}

.header-title {
  display: none !important;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  gap: 8px;
}

.profiles-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
</style>
