# Changelog

All notable changes to aiduHUI (爱嘟心视界) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed
- **Bridge Worker Socket Path Fallback**: Fixed potential daemon exit/bind failures by calculating Unix domain socket path lengths against `_AF_UNIX_MAX_PATH` (104 on Darwin, 108 on Linux) and automatically falling back to localized TCP endpoints when temporary workspace directories exceed platform limits (upstream #3048).
- **Hermes Agent 0.21+ Session Key Compatibility**: Added multi-tier import fallback for `set_current_session_key` / `reset_current_session_key` across `tools.approval_context` and legacy `tools.approval` paths (upstream #3018).
- **Skill Frontmatter Parsing Robustness**: Hardened scalar parsing regex to prevent indented multiline descriptions from overflowing and consuming subsequent keys (upstream #3083).

---

## [0.1.1] - 2026-09-14

### Added
- **Hermes Agent Version Display**: Embedded runtime Hermes Agent version badge (`Hermes Agent v0.21.2`) directly into the header of the `ProfilesView` management panel, giving users instant visibility into the underlying agent runtime.

### Changed
- **Provider Management**: Enabled full removal capabilities for built-in/preset providers across both frontend `ProviderCard` and backend service layer, bringing parity with custom providers.
- **Update Check Neutralization**: Sanitized `/api/studio/announcements` endpoint to return empty notification lists by default, eliminating legacy update prompts.

### Fixed
- **OpenCode Free Deletion & Bypassing**: Completely decoupled and bypassed hardcoded `opencode-free` injection paths across models catalog cache, controller filters, and background probes, allowing clean runtime exclusion.

---

## [0.1.0] - 2026-09-11

### Added
- Initial official release of **aiduHUI (爱嘟心视界)**: Hermes Agent specialized intelligent control dashboard.
- Condensed 10 core capability sections: General Models, Auxiliary Models, Combination Models, Context Compression, Performance Monitoring, Usage Metrics, System Logs, Scheduled Jobs, External Channels, and Memory/Skill integrations.
- Complete aidu brand design system with Apple typography and dynamic lattice backdrop.
- Full hot-reload development and daemonized production deployment support.
