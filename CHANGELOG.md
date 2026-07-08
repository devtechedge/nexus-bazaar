# Changelog 📜

All notable changes and structural improvements to the **NexusBazaar** marketplace platform are documented in this file.

---

## [1.2.0] - 2026-07-08
### Added
- **README.md & CHANGELOG.md**: Introduced comprehensive project documentation, system layout blueprints, multi-role views description, and clear guidelines for developer-ready deployments.

### Changed & Refined (Aesthetic Polish & User-Friendly Language)
- **B2B Wholesale Module Restructuring**:
  - Replaced technical jargon and tech-larping indicators with professional, clear business terminology.
  - Refined headers from "84. Net-30 Invoicing Credit Frameworks" to "**Business Credit (Net-30)**".
  - Replaced "Threat Rating: Stable (0.01% Defaults)" with a clean, professional "**Status: Excellent**" credit status.
  - Renamed "83. Corporate Multi-Seat Accounts" to "**Team Budget & Access**".
  - Simplified multi-seat provision forms: replaced "+ Register Corporate Key" with "**+ Invite Team Member**".
  - Cleaned up cargo parameters: updated "Custom Pallet Logistics Configurator" to "**Shipping & Delivery Calculator**" and "Interactive Cargo Pallet Spatial Matrix" to "**Pallet Spatial Grid**".
  - Renamed "88. B2B Vendor Compliance Checklists" to "**Business Profile & Compliance**".
  - Cleaned up "89. Direct API Product Feeds for Procurement" to "**Developer API Feeds**" and streamlined key-value label indicators.
- **Edge Lab Interface Simplification**:
  - Replaced complex larping titles to emphasize real-world benefits (e.g., "**Private Shopping Assistant & Speed Optimizer**" and "**High-Speed Private Mode**").
  - Simplified tab triggers: renamed "Smart Descriptions & Recommendations" to "**Smart Descriptions & Suggestions**", "Local Trie Autocorrect & Sync" to "**Smart Search & Offline Mode**", and "CV Vector Image Matcher" to "**Photo Scanner & Finder**".
  - Replaced technical debug terminology with friendly descriptions showing how the browser-based client-side tools run 100% privately.

### Fixed
- **Severe React Parser Syntax Errors**:
  - Resolved fatal Vite parsing failures inside `/src/views/EdgeLabView.tsx` where unclosed HTML fragments and misplaced comments (e.g., `{/* TAB 2: LOCAL TRIE ... */}`) caused rendering and compiler crashes.
  - Restored clean, nested element structures to ensure seamless client-side tab switching.
- **Linter & Compiler Cleanups**:
  - Ran system-wide checks to resolve dead code blocks, missing variables, and ESLint warnings.
  - Re-compiled the entire application successfully, yielding a green build.

---

## [1.1.0] - 2026-07-01
### Added
- Multi-role switching layouts (Buyer, Seller, Admin, B2B wholesale, Edge Lab).
- Group buying modules (Guilds) and Customer Loyalty tracker.
- Developer API gateways and client-side Trie search engines.
- Advanced administrative statistics grids with interactive Recharts components.
