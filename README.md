<p align="center">
  <img src="packages/client/public/assets/aiduhui-banner.png" alt="aiduHUI v0.1" width="100%">
</p>

# aiduHUI⚕爱嘟心视界——HERMES AGENT 专精智控台

> **aidu Hermes User Interface**
>
> *不只是界面 — 是视界。*
>
> *界面不是繁复的堆砌，而是把最有价值的 10 个板块凝练于一屏；*
> *视界不是冰冷的监控，而是看懂 Agent 思考、检索与执行的每道脉络；*
> *操作台不是束缚，而是让开发者与使用者人机合一、从容驭马。*

[![License: BSL-1.1](https://img.shields.io/badge/license-BSL--1.1-blue.svg)](LICENSE)
[![Node >= 23.0.0](https://img.shields.io/badge/node-%3E%3D23.0.0-green.svg)](https://nodejs.org/)
[![Built for Hermes Agent](https://img.shields.io/badge/built%20for-Hermes%20Agent-orange.svg)](https://github.com/NousResearch/Hermes-Agent)
[![Version: v0.1](https://img.shields.io/badge/release-v0.1-1f4e79.svg)](https://github.com/monkey2jack/aiduHUI/releases)

**中文** | **[📖 English](README_EN.md)** | **[🤖 Agent Guide](AGENTS.md)**

---

## 🎯 aiduHUI 是什么？

**aiduHUI（爱嘟心视界）** 是 aidu 家族推出的自有品牌 **HERMES AGENT 专精智控工作台**。

基于开源上游 `EKKOLearnAI/hermes-studio` (v0.7.19) 进行深度裁剪与派生重构：
- **剥离繁冗运行时**：彻底剔除不必要的 Coding Agents / esp32 / 外部冗余依赖，只专注服务 **Hermes Agent** 核心控制面；
- **纯粹 10 核心板块**：一屏贯通模型管理（通用/辅助/组合）、系统设置（上下文压缩/性能监控/用量统计/日志透视）以及快捷调度（定时任务/通讯频道/长程记忆）；
- **原生活力 VI 体系**：严守 aiduPARK / aiduMEI 品牌三原色（`#1F4E79` 霁蓝、`#525252` 暮灰、`#000000` 墨黑、`#FFFFFF` 宣白）与苹果系统字系，搭载三角晶格（Lattice）交互式流光底纹；
- **零感热重载保全**：完整继承并保障前后端联动热生效能力（Vite HMR + nodemon 热重启），参数修改即时投产。

---

## 🏛️ aidu 家族矩阵定位

| 成员 | 中文名 | 角色定位 |
|---|---|---|
| **aiduMEI** | 爱嘟优忆思 | 智能体通用智慧引擎（AI 大脑与记忆中枢） |
| **aiduPOP** | 爱嘟泡波浪 | Hermes 飞书双向流式交互插件（通讯信使） |
| **aiduPARK** | 爱嘟乐园 | HERMES AGENT 门户与中文生态社区（门户之林） |
| **aiduHUI** | **爱嘟心视界** | **Hermes Agent 专精智控工作台（操作视界）** |

---

## 🧩 核心功能矩阵（精炼 10 大板块）

```
aiduHUI 爱嘟心视界
├── 1. 模型管理 (MODELS)
│   ├── 通用模型 (General Models) ── 主力对话与推演模型 Provider/Model 配置
│   ├── 辅助模型 (Auxiliary Models) ── 视觉、轻量化与 Fallback 备用策略
│   └── 组合模型 (Combination Models) ── 复合型 Agent 路由模型映射
├── 2. 系统设置 (SETTINGS)
│   ├── 上下文压缩 (Compression) ── 会话 Token 水位自动压缩与记忆凝练
│   ├── 性能监控 (Performance) ── 硬件负载、响应延迟与系统健康水位
│   ├── 用量统计 (Usage) ── API 请求量、Token 吞吐与成本透明监控
│   └── 系统日志 (Logs) ── 纯净收录专精板块运行日志，屏蔽杂波
├── 3. 调度与集成 (SHORTCUT)
│   ├── 定时任务 (Jobs) ── Cron 定时计划、周期作业与自检巡检调度
│   ├── 外部频道 (Channels) ── 飞书、Telegram、Discord 等消息入口配置
│   └── 技能记忆 (Memory) ── 技能包装配、长期沉淀与行为指令基座
└── 4. 配置档案 (PROFILES) ── 多 Profile 隔离切换、运行时网关管理与 Hermes Agent 实时版本感知
```

---

## ⚡ 快速开始

### 方式一：本地极速预览

```bash
# 1. 克隆代码
git clone https://github.com/monkey2jack/aiduHUI.git
cd aiduHUI

# 2. 安装依赖
npm install

# 3. 启动开发模式（前后端双通道联动热生效）
npm run dev
```

浏览器访问：`http://localhost:8649/#/workbench` 即可开启心视界。

### 方式二：生产级服务启动

```bash
# 构建完整前后端资源
npm run build

# 启动生产服务（后台 Daemon 守护）
node bin/hermes-web-ui.mjs start --port 9302 --no-open
```

---

## 🛡️ VI 视觉规范守则

本工程完全沿用 aiduPARK / aiduMEI 设计准则：
- **三原色规范**：深蓝 `#1f4e79`、暮灰 `#525252`、墨黑 `#000000`、宣白 `#ffffff`，严格禁止引入第 4 种高饱和杂色；
- **透明度原则**：卡片容器采用 10%~20% 超薄磨砂，底层三角网格动态透出；
- **苹果字系规范**：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC"` 统一声线。

---

## 📜 开源协议

本项目基于 BSL-1.1 许可发布，详见 [LICENSE](LICENSE)。

---

<p align="center">
  <b>©2026 Powered by monkey² ｜ 小猴平方 出品，略同天下英雄所见</b>
</p>
