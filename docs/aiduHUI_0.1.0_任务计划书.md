# aiduHUI 0.1.0 任务计划书

> **项目名称**：aiduHUI（爱嘟心视界）
> **版本**：v0.1.0（首个内部构建）
> **制定日期**：2026-09-11
> **制定与执行者**：小猴 🐒
> **审核与拍板人**：猴哥
> **归档位置**：飞书 Wiki `/aiduPARK/aiduHUI`
> **上位 SOP**：`aidumei_sop.md`（基本原则与阶段步骤一致，本文仅记录 aiduHUI 特有条款）

---

## 一、项目定位

**aiduHUI（爱嘟心视界）** 是 aidu 品牌系列的新成员：**基于 Ekko Studio（原 Hermes Studio）二次开发的自有品牌 AI 工作台**。

- **上游基座**：`EKKOLearnAI/hermes-studio` v0.7.19（TS monorepo，BSL-1.1）
- **上游能力**：多 agent 工作台，同时接 Hermes / Ekko / Claude Code / Codex / Pi / Grok / OpenCode 七种运行时
- **我们的取舍**：**只保留 Hermes 一条链路**，砍掉其余六种运行时及其周边
- **品牌定位**：aidu 家族的操作界面（HUI = **H**ermes **U**ser **I**nterface / 心视界）
- **中文名**：爱嘟心视界

### 命名与品牌序列

| 项目 | 中文名 | 定位 |
|---|---|---|
| aiduMEI | 爱嘟美 | 智能体通用智慧引擎（后端大脑） |
| aiduPOP | 爱嘟泡 | Hermes 飞书流式插件（消息通道） |
| aiduPARK | 爱嘟乐园 | HERMES AGENT 中文社区站（门户） |
| **aiduHUI** | **爱嘟心视界** | **Hermes 操作台（人机界面）** |

**VI 统一**：全站视觉沿用 aiduPARK 定下的品牌铁律（见 §5）。

---

## 二、范围界定（本版保留清单）

**猴哥点名保留的 10 个板块，一个不多、一个不少：**

### A. 模型管理（1 个页面，3 个页签）

| 页签 | 上游组件 | 接口 |
|---|---|---|
| 通用模型 | `models/ProvidersPanel.vue` | `/api/hermes/providers` |
| 辅助模型 | `models/AuxiliaryModelsPanel.vue` | `/api/hermes/auxiliary-models` |
| 组合模型 | `models/CombinationModelsPanel.vue` | `/api/hermes/combination-models` |

**明确砍掉**：STT 提供方、TTS 提供方（两个页签整页删除，含 `sherpa-onnx-node` 依赖）。

### B. 设置（4 个板块）

| 板块 | 上游组件 | 接口 |
|---|---|---|
| 上下文压缩 | `settings/CompressionSettings.vue` | `/api/hermes/config` |
| 性能监控 | `views/PerformanceView.vue` | `/api/studio/monitoring` |
| 用量 | `views/UsageView.vue` | `/api/studio/usage` |
| 日志 | `views/LogsView.vue` | `/api/studio/logs` |

**日志范围收窄**：只保留与上述板块相关的日志源（压缩/监控/用量/模型），不展示全量日志。

### C. 快捷面板（Ctrl+J）

| 板块 | 上游组件 | 接口 |
|---|---|---|
| 任务 | `jobs/JobsPanel.vue` | `/api/hermes/jobs` |
| 频道 | `settings/PlatformSettings.vue` | `/api/hermes/config` |
| 记忆 | `views/hermes/MemoryView.vue` | `/api/hermes/skills` |

> **注意**：上游 Ctrl+J 是「跳转到任务页」的快捷键。aiduHUI 改造成**唤出三合一快捷面板**（任务/频道/记忆），符合猴哥要求。

---

## 三、阶段流水线（六阶段，与 aiduMEI SOP 一致）

```
阶段一：需求输入与方案制定        ← 本文（任务计划书）
   ↓
阶段二：本地重构与严格自测        ← 当前所在阶段
   ↓
阶段三：杭州候选包验证与实机验收  ───【关键检验点】
   ↓
阶段四：停止点 1 ───【猴哥拍板确认】
   ↓
阶段五：私有小仓同步与部署
   ↓
阶段六：全链路归档与复盘
```

### 阶段一：需求输入与方案制定
1. 通读上游 Ekko Studio 源码（架构、连接机制、模块边界）。
2. 实际只读核查杭州生产实例（版本、启动方式、流量分布）。
3. 与猴哥确认保留清单（10 个板块）。
4. **产出物**：本任务计划书。

### 阶段二：本地重构与严格自测（当前）
1. **建立不可变基线**：上游 v0.7.19 原样提交为一个 commit（便于回溯与上游 merge）。
2. **VI 改造**：品牌三原色 + 苹果系统字体栈（见 §5）。
3. **路由裁剪**：只留保留清单对应的路由 + 登录。
4. **视图与组件裁剪**：删除无关 view / component / store。
5. **后端裁剪**：移除 Ekko / Coding Agents / esp32-c3 / Desktop 包。
6. **前后端接口对齐**：保留 `/api/hermes/*` 与必要的 `/api/studio/*`，确认路径与上游一致。
7. **热生效保持**：确认 dev 模式下前后端均可热更新（见 §4）。
8. **质量三关**：测试关 / 构建关 / 脱密关。

### 阶段三：杭州候选包验证与实机验收
1. 制作白名单包，传杭州独立沙箱目录（**禁止覆盖运行中的服务目录**）。
2. 沙箱内构建 + 启动 + 接口冒烟。
3. **严禁触碰生产 `~/.hermes/` 与 `~/.hermes-web-ui/` 数据。**

### 阶段四：停止点 1
- 向猴哥汇报：裁剪对照表、构建结果、实机截图、接口对齐证明。
- **停下等猴哥明确指令。**

### 阶段五：私有小仓同步与部署
- 小仓：`monkey2jack/aiduHUI_dudu`（已建，private）。
- 部署方式同 aiduPOP：**文件拷贝 / bundle+reset**，不走 git 直拉。
- 部署前必须 diff 生产 HEAD，SHA 不许手打。

### 阶段六：全链路归档与复盘
- 结案陈词归档飞书 Wiki。
- 本文避坑清单回写。

---

## 四、接口与部署约束（aiduHUI 特有 · 重点）

### 4.1 前后端接口约定

| 层 | 路径前缀 | 归属 | 本版处置 |
|---|---|---|---|
| Studio 自有 | `/api/studio/*` | 会话/用量/监控/日志 | **保留所需子集** |
| Hermes 控制面 | `/api/hermes/*` | 模型/配置/任务/技能/记忆 | **保留（核心）** |
| 认证 | `/api/auth/*` | 登录态 | 保留 |
| Ekko | `/api/ekko/*` | —— | **删除** |
| Coding Agents | `/api/coding-agents/*` | —— | **删除** |

**铁律**：**凡保留的接口，路径与请求/响应结构必须与上游逐字一致**，只做减法不做改名。理由：嘟嘟部署时若出现路径漂移，排障成本极高。

### 4.2 Hermes 后端连接方式（不可改动）

```
Studio ──┬─ Socket.IO /chat-run ──── 流式对话
         ├─ HTTP /api/hermes/* ───── Gateway 127.0.0.1:8642
         └─ Python Bridge ────────── ipc:///tmp/hermes-agent-bridge.sock
                                      --agent-root /hermes/hermes-agent
                                      --hermes-home /root/.hermes
```

**风险提示（必须写进交付说明）**：Bridge 通过 `HERMES_AGENT_ROOT` **直接 import Hermes 的 Python 模块**。这意味着：
- Hermes 上游升级可能打断 bridge —— 升级前必须先验证；
- 本版**不改动** bridge 任何代码，保持与上游一致。

### 4.3 热生效保持（猴哥点名要求）

上游做得好的地方，必须保持：

| 机制 | 上游实现 | 本版要求 |
|---|---|---|
| 前端热更新 | Vite HMR（`npm run dev:client`，端口 8649） | **保持，不破坏** |
| 后端热重启 | nodemon（`npm run dev:server`，端口 8647） | **保持，不破坏** |
| 后端代理 | client dev 通过 `HERMES_WEB_UI_BACKEND_PORT` 转发 | **保持** |

**验收断言**：改动 `packages/client/src` 下任意 `.vue`，浏览器**不刷新**即生效；改动 `packages/server/src` 下任意 `.ts`，服务**自动重启**且请求仍通。

### 4.4 部署形态

- 目标机：杭州生产机（与 Hermes / aiduPOP 同机）
- 服务形态：`systemd` 服务（参照上游 `hermes-studio.service`）
- 端口：**待定**，须与现有 9301（上游 studio）错开，避免冲突
- 静态资源：nginx 反代（参照 `hs.hycoforce.com` 配置）

---

## 五、VI 规范（沿用 aiduPARK 铁律，不可违背）

### 5.1 品牌三原色

```css
--blue:  #1f4e79;   /* 主色 */
--gray:  #525252;   /* 辅色 */
--ink:   #000000;   /* 强调 */
--paper: #ffffff;   /* 底色 */
```

**铁律**：不得引入第四种高饱和杂色。交互反馈统一用**同色提亮**或**透明度变化**实现。

### 5.2 苹果系统字体栈

```css
--font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
```

**铁律**：终端/代码块保留等宽字体可读性，其余界面文字统一苹果声线。

### 5.3 落地方式

上游 Studio 自带主题系统（`styles/variables.scss` + `styles/theme.ts` + `App.vue` 的 `themeOverrides`）。
**做法**：覆写 CSS 变量与 Naive UI themeOverrides，**不改组件结构**。这样上游更新时可安全 merge。

---

## 六、质量关卡（阶段二自测清单）

| 关卡 | 判据 | 命令 |
|---|---|---|
| 类型关 | 0 error | `npx vue-tsc -b` |
| 构建关 | 构建成功 | `npm run build` |
| 测试关 | 全绿（逐条点名，禁 `-k` 汇总） | `npm run test` |
| 脱密关 | 七面 0 命中 + 负向对照 | 见 aiduMEI SOP §阶段五.3 |
| 接口关 | 保留接口路径与上游逐字一致 | diff 上游 route 表 |
| 热生效关 | 前端 HMR + 后端 nodemon 实测 | 手工验证 |

---

## 七、风险与待决

| # | 风险 | 影响 | 处置 |
|---|---|---|---|
| 1 | BSL-1.1 许可 | 自用无碍；**对外分发/托管服务受限** | 自用内部项目；若要分发需单独评估 |
| 2 | Bridge 强耦合 Hermes 源码 | Hermes 升级可能打断 | 本版不动 bridge；升级前先验证 |
| 3 | 裁剪产生死引用 | 构建失败 | 每轮裁剪后跑构建关 |
| 4 | 上游更新 merge 冲突 | 维护成本 | 保留上游目录结构，只做减法 |
| 5 | 端口冲突 | 部署失败 | 部署前核查现有监听端口 |

---

## 八、当前进度

- [x] 上游源码通读（架构 / 连接机制 / 模块边界）
- [x] 杭州生产实例只读核查
- [x] 保留清单与猴哥确认（10 板块）
- [x] 私有小仓建立（`monkey2jack/aiduHUI_dudu`）
- [x] 上游基线 commit（`a97d1f9`）
- [ ] VI 改造第一版
- [ ] 路由 / 视图 / 后端裁剪
- [ ] 接口对齐核验
- [ ] 本地起服务实测
- [ ] 阶段三 杭州沙箱验证

---

## 九、避坑清单（aiduHUI 专属，持续追加）

1. **上游 Ctrl+J 语义 != 我们的 Ctrl+J**：上游是跳转任务页，本版改为唤出快捷面板。改造时注意 `useKeyboard.ts` 的 `mod+j` 分支，别与路由冲突。
2. **`ModelsView.vue` 的页签是 `NTabs` 白名单制**：`MODELS_TABS` 集合同时控制 URL query 合法性，删页签必须同步改这个集合，否则 `?tab=stt` 会回落且留下死链。
3. **STT/TTS 依赖牵一发动全身**：`sherpa-onnx-node` 是 `dependencies`（非 optional 的部分）+ 6 个平台 `optionalDependencies`，还有 `overrides` 段锁版本。删除时必须三处同步。
4. **热生效的两个端口别搞混**：client `8649`、backend `8647`、生产 `8648`。

---

*本计划书为 aiduHUI 0.1.0 的施工基准，后续变更须回写本文。*
