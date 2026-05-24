# ⚡ Task Flow

**Task Flow** is a high-performance, visually stunning, and feature-rich collaborative project management and Kanban board application. Designed with modern aesthetics in mind, Task Flow provides teams and individuals with a seamless workflow to organize, prioritize, track, and analyze tasks in real-time.

---

## ✨ Features

- **📊 Interactive Dashboard**: Get a bird's-eye view of your project metrics, priority distributions, task completion rates, and recent activity logs.
- **📋 Kanban Board**: Manage your workflow with smooth drag-and-drop functionality (powered by `@dnd-kit`) to move tasks across standard columns (`To Do`, `In Progress`, `Under Review`, `Completed`).
- **📅 Calendar View**: Visualize task deadlines in an interactive monthly calendar. Quick filter or locate tasks by their due dates.
- **📈 Advanced Analytics**: Visual representation of productivity metrics, completed vs pending trends, and task distributions using interactive graphs powered by `Recharts`.
- **💼 Workspace & Member Management**: Set up multiple workspaces, invite collaborators, assign roles, and toggle between workspaces seamlessly.
- **🌗 Theme Toggle**: Fully integrated light and dark modes matching custom Tailwind v4 designs.
- **📡 Offline Mode**: Smooth tracking of online/offline status to prevent data loss and show status notifications.
- **🔐 Secure Mock Authentication**: Fully simulated signup, login, password recovery, and role-based session states managed via `Zustand`.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Drag & Drop**: [@dnd-kit/core](https://dnd-kit.com/)
- **Charts & Graphs**: [Recharts](https://recharts.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
Task Flow/
├── public/                 # Static assets (Favicons, SVG icons)
├── src/
│   ├── assets/             # Images and local media assets
│   ├── components/         # Highly reusable UI components (Buttons, Modals, Inputs, etc.)
│   ├── contexts/           # Application React Contexts (Theme, Toast notifications)
│   ├── hooks/              # Custom React Hooks (Offline tracking)
│   ├── layouts/            # Page shell layouts (AuthLayout, MainLayout with navigation)
│   ├── pages/              # Primary view pages (Dashboard, Kanban, Analytics, Calendar, Settings)
│   ├── routes/             # App navigation routing and protected route logic
│   ├── services/           # Service layers (Mock Database engine)
│   ├── store/              # Zustand global state stores (Authentication, UI state)
│   ├── types/              # Unified TypeScript definitions and interfaces
│   ├── App.tsx             # Root application component
│   ├── index.css           # Global stylesheets and Tailwind configuration
│   └── main.tsx            # React application entry point
├── eslint.config.js        # Linter rules
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite bundler options
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/iam-rishab07/Task-Flow.git
   cd Task-Flow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build the application for production:
   ```bash
   npm run build
   ```

---

## ⚙️ Services & State

- **Mock DB (`src/services/mockDb.ts`)**: Simulates a backend database using local storage persistence, ensuring tasks, workspaces, and user profiles persist across browser reloads.
- **Zustand Stores**:
  - `authStore.ts`: Controls logged-in user profiles, workspace creation, switching, and roles.
  - `uiStore.ts`: Manages sidebar visibility, active routes, and dialog actions.

---

## 📄 License

This project is licensed under the MIT License.

