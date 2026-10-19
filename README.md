# Librux 

<p align="center">
  <img src="./src/assets/Logo.png" alt="Librux Logo" width="180" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>MODERN, RESPONSIVE AND INTELLIGENT PLATFORM FOR EXPLORATION, RESERVATION AND MANAGEMENT OF LIBRARY LOANS.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Sass-SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="Sass" />
  <img src="https://img.shields.io/badge/Vitest-Unit%20Tests-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

---

## Table of Contents

- [General Description](#-general-description)
- [Main Features](#-main-features)
- [System Architecture](#-system-architecture)
- [Responsive Design and UX](#-responsive-design-and-ux)
- [Technological Stack](#-technological-stack)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Testing Strategy](#-testing-strategy)
- [Deployment](#-deployment)
- [License](#-license)

---

## General Description

**Librux** is an application designed to transform library management experience. Combines access to millions of books through the **OpenLibrary API** with **Supabase** (PostgreSQL, Authentication and Edge Functions). 

Allows users to explore real-time catalogs, filter by subjects, save book references, request loans, perform renewals with policy validation, and receive automatic expiration alerts through a proactive notification system.

---

## Main Features

| Module | Functionality | Description |
| :--- | :--- | :--- |
| **Dynamic Dashboard** | Metrics and Acquisitions | Real-time statistics of total loans, active, renewed and overdue, along with the latest acquisitions. |
| **Explorer and Search** | OpenLibrary Catalog | Reactive search with debounce, subject filters and book cards with intelligent cover handling (*fallback*). |
| **Loan Lifecycle** | Complete Management | Request physical loan, immediate return, cancellation and renewal (+7 days, max. 2 renewals allowed). |
| **Saved References** | Favorites / Bookmark | Optimistic saving and synchronization with Supabase of books of interest. |
| **Smart Notifications** | Proactive Monitoring | Background engine that inspects due dates, alerting overdue or upcoming loans (3 days). |
| **Secure Authentication** | Supabase Auth | Complete registration and login flow with persistent JWT and protected routes. |
| **Adaptive Layout** | Mobile First / Desktop | Floating sidebar with tooltips that automatically switches to a bottom navigation bar (*Bottom Bar*) on mobile devices. |

---

## System Architecture

The application follows a decoupled and reactive pattern:

```
┌────────────────────────────────────────────────────────┐
│                      UI / VIEWS                        │
│    (Dashboard, BooksPage, LoanPage, SavedBooksPage)    │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       ┌────────▼────────┐      ┌────────▼────────┐
       │ React Contexts  │      │  Custom Hooks   │
       │  • AuthContext  │      │   • useFetch    │
       │  • SearchCtx    │      └────────┬────────┘
       │  • NotifCtx     │               │
       └────────┬────────┘               │
                │                        │
       ┌────────▼────────────────────────▼────────┐
       │             Services Layer               │
       │  • loans.service.ts   • books.service.ts │
       │  • openlibrary.service.ts                │
       └────────┬────────────────────────┬────────┘
                │                        │
       ┌────────▼────────┐      ┌────────▼────────┐
       │ Supabase Cloud  │      │   OpenLibrary   │
       │ Edge Functions  │      │   Public API    │
       │  & PostgreSQL   │      └─────────────────┘
       └─────────────────┘
```

### Key Decisions:
- **Decentralized Global State:** Instead of overloading the application with Redux, Specialized Contexts with `useCallback` and `memo` are used to isolate re-renders.
- **Hybrid Persistence:** Conditional verification and insertion (*Ensure-Before-Mutate*) of external books in the relational table `book_references` before linking loans.
- **Persistent Layout:** Nested routing in `react-router` via `<Outlet />`, avoiding navigation reloads.

---

## Responsive Design and UX

The interface was built with a **comprehensive adaptive** philosophy using **SCSS**, **CSS Grid** and **Flexbox**:

* **Desktop (> 768px):**  
  Floating lateral sidebar with microanimations, animated CSS tooltips and quick navigation. Metrics grid in 4 columns and two-panel view (Active loans vs. New acquisitions).
* **Tablet (451px - 768px):**  
  Automatic reorganization of the dashboard grid to double or single columns to optimize readability.
* **Mobile (≤ 450px):**  
  The Sidebar disappears as a side panel and is dynamically transformed into a **fixed Bottom Navigation Bar**, adapted to the safe areas of touch devices (`env(safe-area-inset-bottom)`), guaranteeing a one-handed usage experience.

---

## Technical Stack

- **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler and Dev Server:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Styling:** [Sass (SCSS)](https://sass-lang.com/) + CSS Grid + Flexbox
- **Typography and Iconography:** [Material Symbols Outlined](https://fonts.google.com/icons)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- **Data Source:** [OpenLibrary API](https://openlibrary.org/developers/api)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jsdom](https://github.com/jsdom/jsdom)

---

## Installation and Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **pnpm** / **yarn**

### 1. Clone the repository
```bash
git clone https://github.com/victor5879/project-2-responsive-layout.git
cd project-2-responsive-layout
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root of the project based on the following format:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu-anon-key-o-publishable-key
VITE_OPEN_LIBRARY_URL=https://openlibrary.org
```

### 4. Start development server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## Available Scripts

In the project directory you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles TypeScript and generates the production build in the `/dist` folder. |
| `npm run preview` | Locally previews the generated production build. |
| `npm run test` | Runs the unit test suite with Vitest once. |
| `npm run test:watch` | Runs the tests in interactive/continuous listening mode. |
| `npm run lint` | Analyzes the code with ESLint to ensure quality standards. |

---

## Testing Strategy

The project has unit and integration test coverage oriented to user behavior (*User-Centric Testing*):

- **Interactive Components:** Tests for conditional rendering, error handling, and service calls.
- **Custom Hooks:** Validation of the asynchronous cycle, loading states, and exception handling.

To run the tests:
```bash
# Run all tests
npm test

# Run a specific test
npm test -- SaveBookButton.test.tsx
```

---

## Deployment

The project is ready to deploy on platforms like **Vercel** or **Netlify**. It has the appropriate configuration in [vercel.json].

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## License

This project was developed for educational purposes for the course of **Web Development**. Distributed under the MIT License.
