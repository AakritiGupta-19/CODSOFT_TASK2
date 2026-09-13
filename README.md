
# Taskora — Smart Personal Productivity & Task Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://aakritigupta-19.github.io/CODSOFT_TASK2/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20SPA-8C78D9?style=for-the-badge)](#technical-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> 🌐 **Live Demo:** [https://aakritigupta-19.github.io/CODSOFT_TASK2/](https://aakritigupta-19.github.io/CODSOFT_TASK2/)  
> A modern, responsive, zero-dependency Single Page Application (SPA) engineered for task management, habit tracking, and personal productivity. Built entirely with Vanilla JavaScript (ES6+), custom CSS Design Tokens, and browser LocalStorage.

---

## 📌 Executive Summary (For Recruiters & Hiring Managers)

**Taskora** was designed and engineered as an end-to-end frontend productivity suite demonstrating core web software engineering fundamentals without relying on heavy external frontend frameworks (e.g., React, Vue, or Tailwind). 

### Key Engineering Accomplishments:
- **Modular Component Architecture:** Decoupled codebase divided into 10 purpose-built JavaScript modules (`tasks.js`, `calendar.js`, `progress.js`, `notifications.js`, etc.) operating through a reactive event-driven dispatch bus (`taskora:tasksChanged`, `taskora:themeChanged`, `taskora:listsChanged`).
- **Zero-Dependency State & Persistence:** Complete offline persistence engine built on browser `localStorage` with JSON serialization, data sanitization, and fallback recovery.
- **Custom Design Token & Theme Engine:** Robust CSS variable design system featuring seamless light/dark mode toggling, dynamic contrast protection (guaranteed dark text on light cards and white text on dark cards), and strict background restoration.
- **Dynamic View Routing (SPA):** Single Page Application view controller enabling instantaneous navigation between Dashboard, Calendar, Custom Lists, Tasks, Notifications, Profile, and FAQ without document reloads.

---

## ✨ Feature Overview

### 1. 📊 Interactive Dashboard & Productivity Analytics
- **Live Greeting & Statistics:** Dynamic time-of-day greeting tied to user profile with real-time statistics (completed, pending, overdue, and urgent tasks).
- **Productivity Progress Gauge:** SVG/CSS conic-gradient circular score tracking overall task completion ratios.
- **Priority Action Grids:** Quick preview cards for Urgent, High, and Medium priority task queues.

### 2. 📝 Custom Lists Engine (Window Cards)
- **Multi-List Creation:** Create custom lists with title and newline-delimited items through an interactive modal.
- **Sidebar Integration (Max 3 Rule):** Automatically renders up to 3 custom lists in the sidebar navigation, providing a dedicated `... More` shortcut when additional lists exist.
- **Interactive List Windows:** Dedicated Lists workspace displaying interactive cards with checkbox toggling, item deletion, edit modal access, and an **inline quick-add input bar** at the end of each window card.

### 3. 📅 Interactive Calendar & Date Tracking
- **Monthly Matrix:** Accurate day grid rendering with automated Leap Year and month boundary calculations.
- **Task Date Circling:** Days with scheduled deadlines display visual circular badges color-coded by task priority.
- **Date Isolation & Agenda:** Clicking any date isolates its specific agenda with full details (title, priority, due time, notes).
- **Weekly Strip:** Horizontal scrollable preview of the current week's commitments.

### 4. 🌓 Precision Light & Dark Mode
- **100% State Sync:** Unified theme controller eliminating class mutation conflicts.
- **High-Contrast Safety:** Enforced dark cards (`#211e2e`) with bright text (`#f8f6fc`) in dark mode, and pure white cards (`#ffffff`) with dark text (`#272338`) in light mode.
- **Pristine Reset:** Clean return to the original `#f8f7fc` light mode background when toggled back.

### 5. 🔍 Smart Search & Filter System
- Real-time search by task title, category, and tags.
- Instant filtering by priority (Urgent, High, Medium, Low) and completion status.

### 6. 👤 User Authentication & Profile Customization
- Clean modal login flow with persistent session storage.
- Customizable display name, personal slogan, and avatar initials.

---

## 🗂️ Project Structure

```text
Taskora/
├── index.html               # Main semantic SPA markup & modal definitions
├── LICENSE                  # MIT open-source license
├── .gitignore               # Ignored runtime, editor, and log files
├── README.md                # Comprehensive documentation
├── css/
│   ├── style.css            # Global design tokens, typography, dark/light themes & cards
│   ├── dashboard.css        # Dashboard grids, priority queues & focus widgets
│   ├── responsive.css       # Mobile, tablet, and desktop media queries
│   └── animations.css       # Micro-animations, modals, and transition keyframes
└── js/
    ├── script.js            # Core application orchestrator, theme engine & lists manager
    ├── tasks.js             # Task state management, validation, filter & search logic
    ├── calendar.js          # Monthly calendar engine, day calculations & date indicators
    ├── progress.js          # Productivity score calculators & statistical metrics
    ├── focus.js             # Focus timer & productivity session tracking
    ├── notifications.js     # Toast notifications & alert center
    ├── profile.js           # User profile storage & personalized greeting engine
    ├── settings.js          # User configuration & system settings
    ├── sidebar.js           # Responsive sidebar drawer, collapsible layout & list preview
    └── storage.js           # LocalStorage wrapper, key prefixing & fallback handling
```

---

## 🛠️ Technical Stack & Implementation Details

| Layer | Technology | Description |
|---|---|---|
| **Structure** | Semantic HTML5 | Accessible, SEO-friendly layout utilizing `<aside>`, `<main>`, `<section>`, `<dialog>`-style accessible modals with ARIA attributes. |
| **Styling** | Vanilla CSS3 | Custom CSS Variable Design System (`--bg-primary`, `--surface`, `--text-primary`), Flexbox, CSS Grid, and responsive clamp scaling. |
| **Logic** | Modern JavaScript (ES6+) | Modular separation, closures, custom event emitters, DOM manipulation without third-party frameworks. |
| **Persistence** | Browser Web Storage API | `localStorage` serialization for tasks, custom lists, user profile, and theme preference. |
| **Icons & Fonts** | FontAwesome 6 & Google Fonts | Inter typography with FontAwesome glyphs for intuitive visual hierarchy. |

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- Visual Studio Code or any preferred code editor.

### Local Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/aakritigupta-19/CODSOFT_TASK2.git
   ```
2. **Navigate into the directory:**
   ```bash
   cd CODSOFT_TASK2
   ```
3. **Run locally:**
   - **Option A (VS Code Live Server):** Right-click `index.html` and click **"Open with Live Server"**.
   - **Option B (Python Built-in Server):**
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` in your web browser.
   - **Option C (Direct file):** Double-click `index.html` to open it directly in your browser.

---

## 💡 Key Engineering Takeaways (Interview Highlights)

When discussing this project during technical interviews, key topics to highlight include:

1. **State Synchronization via Event Bus:**
   Rather than coupling UI elements tightly, actions emit custom window events (e.g., `taskora:tasksChanged`, `taskora:themeChanged`, `taskora:listsChanged`). The calendar, dashboard, task list, and sidebar listen independently and re-render only what is necessary.
2. **CSS Token Architecture:**
   Theming is managed centrally via CSS Custom Properties on `:root` and `[data-theme="dark"]`, eliminating hardcoded hex color fragmentation and enabling instantaneous theme switches with 0 layout reflows.
3. **Defensive DOM Manipulation:**
   All modals, drawers, and dynamic list windows implement defensive event delegation, keyboard triggers (`Enter` and `Escape`), and input sanitization to guard against XSS vulnerabilities.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] Drag-and-drop task prioritization (HTML5 Drag and Drop API).
- [ ] Data Export / Import (JSON & CSV export for task archives).
- [ ] PWA (Progressive Web App) service worker for 100% offline standalone usage.
- [ ] Sound effects and haptic audio cues on task completion.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to inspect, fork, and adapt for your own learning and portfolio use.

---

## 👩‍💻 Author

**Aakriti Gupta**  
- **Live Demo:** [https://aakritigupta-19.github.io/CODSOFT_TASK2/](https://aakritigupta-19.github.io/CODSOFT_TASK2/)
- **GitHub:** [@aakritigupta-19](https://github.com/aakritigupta-19)
- **Repository:** [aakritigupta-19/CODSOFT_TASK2](https://github.com/aakritigupta-19/CODSOFT_TASK2)

