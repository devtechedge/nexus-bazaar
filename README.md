# NexusBazaar 🛒✨

NexusBazaar is a highly feature-rich, high-performance, and secure multi-role e-commerce marketplace and B2B wholesale procurement platform. Designed with a desktop-first layout, elegant visual design, and fluid transitions, the platform operates entirely client-side using a simulated SQL ledger, real-time localized edge-computing nodes, and offline state persistence.

---

## 🌟 Key Capabilities & Architectural Core

NexusBazaar goes far beyond standard e-commerce sites by introducing several advanced modules that handle secure B2B workflows, localized AI simulations, and detailed security vaults:

### 👤 Multi-Role Experience
- **Storefront View**: Clean product grid featuring categories, real-time search, dynamic rating averages, and interactive curation cards.
- **Buyer Features**: Personalized Wishlists, Cart management, transparent Checkout, active Order Tracking, and comprehensive Q&A/review forms.
- **Seller Portal**: Self-service product listing manager, dynamic inventory trackers, revenue analytics, and interactive review management tools.
- **Admin Dashboard**: Marketplace metrics tracker, real-time user session status maps, transaction ledger logs, and custom system-wide discount dispatch tools.

### 💼 B2B Wholesale & Procurement (`/src/views/B2BWholesaleView.tsx`)
- **Interactive RFQ (Request for Quote) Center**: Facilitates customizable high-volume bidding.
- **Credit Frameworks & Net-30 Invoices**: Manage credit lines (limits, headroom, and stable utilization ratios) and view outstanding balances in an interactive invoice ledger.
- **Team Budget & Access Limits**: Invite team members, set quarterly purchase budgets, and require hierarchical manager approvals for orders over specified limits.
- **Shipping & Delivery Calculator**: Dynamically calculates standard pallet spatial sizing (48" x 40" configurations), load weight parameters, and cargo container utilization.
- **Automated Orders**: Schedule standing automated orders on intervals (e.g., Monthly, Quarterly) for repeat procurement.
- **Business Verification & Compliance**: Structured compliance checklist covering ISO-9001 certification, fair labor standards, and liability insurance filings.
- **Developer API Gateway**: Allows secure procurement data synchronization via live API console feeds using custom access tokens.

### ⚡ Edge Lab Optimization Suite (`/src/views/EdgeLabView.tsx`)
- **High-Speed Private Mode**: Employs browser-based edge processing. No shopping activities, product lookups, or photos are ever sent to external trackers or servers.
- **Smart Product Suggestions**: Lightweight client-side recommendation engine finding product matches instantly.
- **Custom Product Highlights**: Context-aware copywriting emphasizing technical specs, eco-friendly details, or designer aesthetics depending on user personas.
- **Instant Typo Autocorrect**: Localized memory Trie dictionary that instantly catches and corrects search typos.
- **Offline Mode Browser Sync**: Simulates network instability, allowing users to browse a locally cached and indexed product catalog (IndexedDB standard) during fragile connection states.
- **Hardware Diagnostics & Display Settings**: Real-time canvas telemetry tracking refresh rates, GPU load configurations, responsive viewport grids, and low-performance mode toggles.
- **Photo Scanner & Finder**: Advanced computer vision mockup allowing visual search using uploaded images, scanning vectors, and returning localized visual matches.

### 🛡️ Security Vault & Guilds
- **Security Vault**: End-to-end data encryption control panel, active security audits, mock hardware key verification, and encrypted transaction log monitors.
- **Guilds & Loyalty Communities**: Joint group-buying structures (Guilds) with pooled discounts, active group checkout progression bars, and custom customer loyalty programs.

---

## 🛠️ Technology Stack & Libraries

- **Framework**: React (Vite-powered single-page architecture)
- **Styling**: Tailwind CSS (Clean, high-contrast typography, negative space rhythm, custom color systems)
- **Icons**: Lucide React
- **Animations**: Motion (from `motion/react`)
- **Data Visualization & Charts**: Recharts & D3 for interactive administrative charts, credit line progress meters, and hardware diagnostic telemetry gauges.

---

## 🚀 Getting Started & Setup

Follow these steps to run the NexusBazaar development environment locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (version 18 or higher) and `npm` installed.

### 2. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

### 3. Start the Development Server
Launch the development environment:
```bash
npm run dev
```
The server will start on port `3000` (or your platform's mapped port), offering HMR-enabled previewing of the app.

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
The static build outputs will compile into the `dist/` directory, ready for deployment.

---

## 📜 Development Guidelines & Code Standards

- **TypeScript Precision**: Keep complete type definitions. Avoid using loose types or `any`.
- **Desktop-First & Fluid Layouts**: Design with desktop grid density and screen margins while using Tailwind's mobile prefixes (`sm:`, `md:`, `lg:`) to preserve responsiveness.
- **User Privacy First**: Keep server and tracking integrations secure, routing operations to client-side sandboxes or local edge processors where possible to protect consumer security.
