# 🖥️ Slate Frontend (Next.js Client)

Welcome to the Slate Frontend documentation. This client is a premium, feature-packed Single Page Application built on **Next.js 16 (App Router)** and **React 19**, designed to offer fluid user interactions, robust state caching, and a polished rich-text editing experience.

---

## 🛠️ Stack & Technologies

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) for highly optimized routing and component streaming.
* **Component Engine**: React 19 utilizing cutting-edge hook topologies and modern functional architectures.
* **Styling & Layout**: **Tailwind CSS v4** for next-generation lightning-fast styling, combined with **shadcn/ui** components.
* **Editor Integration**: **TipTap Rich Text Editor** for powerful block-level task sheets, inline notes, and formatting control.
* **Client Cache / Server-State**: **TanStack React Query v5** for robust request-caching, deduplication, and zero-latency visual switches.
* **Motion & Animations**: **Framer Motion** for fine-grained interactive micro-animations.
* **Auth Integration**: **Firebase Web SDK v12** for secure Email/Password registration, logging, and automated JWT session tracking.

---

## 📂 Frontend Directory Mapping

```
frontend/
├── app/                      # App Router Views & Layouts
│   ├── dashboard/            # Workspace views containing active tabs
│   │   ├── notes/            # Notes container & display views
│   │   ├── todos/            # Todo lists & tasks grids
│   │   ├── layout.tsx        # Dashboard shell layout (Navbar, Sidebars)
│   │   └── page.tsx          # Tab control coordinator
│   ├── login/                # Authentication interface (Login, Sign-Up)
│   ├── globals.css           # Styling theme rules, custom utilities & tokens
│   ├── layout.tsx            # Global HTML wrapper (Query and Auth providers)
│   └── page.tsx              # Root URL router / splash controller
│
├── components/               # Custom React Components
│   ├── auth/                 # Form blocks, login cards, and submit buttons
│   ├── dashboard/            # Global components (Tab triggers, Stat modules)
│   ├── notes/                # Tiptap text areas, note card managers, formatting toolbars
│   ├── todos/                # Task row components, action checklists, urgency icons
│   └── ui/                   # shadcn component primitives (Dialogs, Cards, Inputs, Toasts)
│
├── context/                  # Context State Managers
│   └── AuthContext.tsx       # Firebase state listener, user profile tracker, session tokens
│
├── hooks/                    # TanStack Query Custom Hooks
│   ├── useNotes.ts           # Fetching, editing, creating, and removing Notes
│   └── useTodos.ts           # Fetching, updating completion, and adding Tasks
│
├── lib/                      # Core APIs & Config clients
│   ├── api.ts                # Customized fetch client injected with bearer tokens
│   ├── firebase.ts           # Firebase client web application initialization
│   └── utils.ts              # Tailwind merger classes (cn)
│
└── providers/                # Custom Query Provider
    └── QueryProvider.tsx     # React Query configuration and client contexts
```

---

## ⚙️ Environment Variables Setup

Ensure that you create a `.env` file in the `frontend` folder containing the following:

```env
# URL to local FastAPI Server
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Web App Client Configs
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=todo-notes-app-9547d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=todo-notes-app-9547d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=todo-notes-app-9547d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=353600080331
NEXT_PUBLIC_FIREBASE_APP_ID=1:353600080331:web:bd379fed0e09988592ce4e
```

---

## 🚀 Running the Client App

1. **Install required packages**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. Open your browser and access [http://localhost:3000](http://localhost:3000).

---

## 🏆 Frontend Polish and Engineering Safeguards

We have integrated custom UX enhancements to ensure the application feels premium:

### 1. Unified Clickable Cursor Guarantee
To guarantee a responsive click feel across any operating system and device, we've injected a global custom base layer into `globals.css`:
```css
a, button, select, input[type="submit"], [role="button"], .cursor-pointer {
  cursor: pointer !important;
}
```
This guarantees that *every* clickable component displays a crisp pointer cursor when hovered, improving sensory response and interaction clarity.

### 2. Network Optimizations via TanStack Query
To avoid unnecessary network traffic and clean up developer console logging, we've configured our `QueryClient` inside `QueryProvider.tsx` with:
```typescript
defaultOptions: {
  queries: {
    refetchOnWindowFocus: false, // Prevents aggressive refresh spikes on browser tab switching
    retry: 1,                    // Prevents infinite error retry cascades on server downtime
    staleTime: 30000             // Retains current state fresh for 30 seconds
  }
}
```
This prevents the frontend from spamming the backend API with duplicate query calls every time you change browser windows.

### 3. Navigation Infinite Loop Prevention
In `DashboardPage.tsx`, routing transitions could trigger synchronous window navigation events that caused recursive loops. We resolved this by introducing a strict navigation boundary, verifying the target state is different before triggering transition dispatch events.
