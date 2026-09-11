<script setup lang="ts">
/**
 * aiduHUI 登录界面
 *
 * 规范：
 * 1. 背景、header、网站名与主页 (WorkbenchView) 完全保持一致，包括 Canvas 动态晶格与随机 Slogan 动效
 * 2. 极简单输入框（只输密码，小猴图片置于输入框之上）
 * 3. 结构与语义参照 Field / FieldLabel / Input / FieldDescription 范式实现
 */
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setApiKey, clearApiKey, hasApiKey } from "@/api/client";
import { fetchAuthStatus, loginWithPassword } from "@/api/studio/auth";
import { isDesktopShell } from "@/utils/desktop-bridge";
import { resolveLoginRedirect } from "@/utils/login-redirect";
import { useTheme } from "@/composables/useTheme";
import { mountLatticeBG, unmountLatticeBG } from "@/utils/lattice-bg";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const { activateUserTheme } = useTheme();

const loginContainerRef = ref<HTMLElement | null>(null);
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const showLockResetHint = ref(false);
const desktopShell = isDesktopShell();

if (desktopShell) {
  clearApiKey();
} else if (hasApiKey()) {
  router.replace(resolveLoginRedirect(route.query.redirect));
}

// Slogan dynamic pairs: aidu 爱嘟 / I do 惟吾 / AI do 智助
const SLOGAN_PAIRS = [
  { tier: "gray", en: "I do", cn: "惟吾" },
  { tier: "ink", en: "aidu", cn: "爱嘟" },
  { tier: "blue", en: "AI do", cn: "智助" },
];

const sloganIndex = ref(0);
const isSwitching = ref(false);
const sloganLeftPercent = ref(50);
let sloganTimer: ReturnType<typeof setInterval> | null = null;

const currentSlogan = computed(() => SLOGAN_PAIRS[sloganIndex.value]);

function pickRandomPosition() {
  sloganLeftPercent.value = Math.round(25 + Math.random() * 50);
}

onMounted(async () => {
  if (loginContainerRef.value) {
    mountLatticeBG(loginContainerRef.value);
  }

  pickRandomPosition();
  sloganTimer = setInterval(() => {
    isSwitching.value = true;
    setTimeout(() => {
      sloganIndex.value = (sloganIndex.value + 1) % SLOGAN_PAIRS.length;
      pickRandomPosition();
      isSwitching.value = false;
    }, 240);
  }, 3200);

  try {
    await fetchAuthStatus();
  } catch {
    // Keep login form actionable
  }
});

onUnmounted(() => {
  if (loginContainerRef.value) {
    unmountLatticeBG(loginContainerRef.value);
  }
  if (sloganTimer) {
    clearInterval(sloganTimer);
    sloganTimer = null;
  }
});

async function handleLogin() {
  if (!password.value) {
    errorMsg.value = t("login.credentialsRequired");
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  showLockResetHint.value = false;

  try {
    const session = await loginWithPassword("", password.value);
    setApiKey(session.token);
    activateUserTheme(session.userId, session.theme);
    router.replace(resolveLoginRedirect(route.query.redirect));
  } catch (err: any) {
    if (err.status === 429 || err.status === 503) {
      errorMsg.value = t("login.tooManyAttempts");
      showLockResetHint.value = true;
    } else {
      errorMsg.value = err.message || t("login.invalidCredentials");
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div ref="loginContainerRef" class="login-page">
    <!-- Top Header: 完全与主页一致 -->
    <header class="brandbar">
      <div class="shell brandbar-inner">
        <div class="foot-left">
          <span class="ver-text">v0.1.0</span>
        </div>

        <!-- Slogan 空白区域随机跳动 -->
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

    <!-- Center Login Field Stage -->
    <main class="login-stage">
      <div class="shell stage-inner">
        <div class="login-paper">
          <!-- 小猴头像在输入框之上 -->
          <div class="login-brand-avatar">
            <picture>
              <source srcset="/assets/img/monkey.webp" type="image/webp" />
              <img src="/assets/img/monkey.png" alt="aiduHUI" width="76" height="76" draggable="false" />
            </picture>
          </div>

          <form class="ui-field" @submit.prevent="handleLogin">
            <label class="ui-field-label" for="login-pass">
              {{ t("login.passwordPlaceholder") || "访问密码" }}
            </label>

            <div class="ui-input-wrap">
              <input
                id="login-pass"
                v-model="password"
                type="password"
                class="ui-input"
                :placeholder="t('login.passwordPlaceholder') || '请输入访问密码'"
                autofocus
                @keyup.enter="handleLogin"
              />
              <button type="submit" class="ui-submit-btn" :disabled="loading" aria-label="登录">
                <span v-if="loading" class="spin-dot">...</span>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <p class="ui-field-desc">
              {{ t("login.description") || "请输入管理员或工作台授权访问密码。" }}
            </p>

            <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
            <div v-if="showLockResetHint" class="login-lock-hint">
              <template v-if="desktopShell">
                <span>{{ t("login.desktopLockResetHint") }}</span>
              </template>
              <template v-else>
                <span>{{ t("login.lockResetHint") }}</span>
                <code>hermes-web-ui clear-login-locks --restart</code>
                <span>{{ t("login.defaultLoginResetHint") }}</span>
                <code>hermes-web-ui reset-default-login</code>
              </template>
            </div>
          </form>
        </div>
      </div>
    </main>

    <!-- Bottom Footer: 与主页完全一致 -->
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

.login-page {
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

/* 70% Width Shell */
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

/* Stage Area: 超高透磨砂卡片 */
.login-stage {
  position: relative;
  z-index: 10;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding-bottom: 74px;
}

.stage-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-paper {
  width: 440px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 36px 36px;
  /* 适度磨砂 24%，层次清晰且透出晶格底纹 */
  background: rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(82, 82, 82, 0.16);
  border-radius: $radius;
  box-shadow: 0 8px 32px rgba(31, 78, 121, 0.04);
}

.login-brand-avatar {
  margin-bottom: 24px;

  img {
    width: 76px;
    height: 76px;
    object-fit: contain;
    border-radius: 16px;
  }
}

/* React Field Demo 风格的极简表单 */
.ui-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ui-field-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: $gray;
  letter-spacing: 0.02em;
}

.ui-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.ui-input {
  width: 100%;
  height: 44px;
  padding: 0 48px 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(82, 82, 82, 0.22);
  background: rgba(255, 255, 255, 0.45);
  font-family: inherit;
  font-size: 0.95rem;
  color: $ink;
  outline: none;
  transition: all 0.2s $ease;

  &:hover {
    border-color: rgba(31, 78, 121, 0.4);
    background: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    border-color: $blue;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.12);
  }

  &::placeholder {
    color: rgba(82, 82, 82, 0.4);
  }
}

.ui-submit-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: none;
  background: $blue;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.18s $ease;

  &:hover:not(:disabled) {
    background: #2a6296;
    transform: translateY(-50%) scale(1.04);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.ui-field-desc {
  font-size: 0.76rem;
  color: $gray-faint;
  margin-top: 2px;
  line-height: 1.4;
}

.login-error {
  color: #c62828;
  font-size: 0.82rem;
  margin-top: 6px;
}

.login-lock-hint {
  font-size: 0.78rem;
  color: $gray;
  margin-top: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;

  code {
    display: block;
    font-family: $mono;
    font-size: 0.75rem;
    margin: 4px 0;
    padding: 2px 4px;
    background: rgba(82, 82, 82, 0.1);
    border-radius: 4px;
  }
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
