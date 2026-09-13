/* =========================================================
   TASKORA — SIDEBAR FOUNDATION   sidebar.js
========================================================= */

(() => {
    "use strict";
    let initialized = false;
    function initializeSidebar() {
        if (initialized) {
            return;
        }
        initialized = true;
        const app = document.getElementById("app");
        const sidebarToggle = document.getElementById("sidebarToggle");
        const mobileMenuButton = document.getElementById("mobileMenuButton");
        const sidebarOverlay = document.getElementById("sidebarOverlay");
        const navItems = document.querySelectorAll(".nav-item");
        const sidebarPageItems =
            document.querySelectorAll(".sidebar-bottom-item");
        if (!app) {
            return;
        }
        function isMobile() {
            return window.matchMedia("(max-width: 800px)").matches;
        }
        function closeMobileSidebar() {
            app.classList.remove("sidebar-mobile-open");
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove("open");
                sidebarOverlay.setAttribute("aria-hidden", "true");
            }
        }
        function openMobileSidebar() {
            app.classList.add("sidebar-mobile-open");
            if (sidebarOverlay) {
                sidebarOverlay.classList.add("open");
                sidebarOverlay.setAttribute("aria-hidden", "false");
            }
        }
        function toggleSidebar() {
            if (isMobile()) {
                if (
                    app.classList.contains("sidebar-mobile-open")
                ) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
                return;
            }
            app.classList.toggle("sidebar-collapsed");
            const collapsed =
                app.classList.contains("sidebar-collapsed");
            if (sidebarToggle) {
                sidebarToggle.setAttribute(
                    "aria-expanded",
                    String(!collapsed)
                );
            }
            if (window.TaskoraStorage) {
                const settings =
                    window.TaskoraStorage.read(
                        window.TaskoraStorage.keys.settings,
                        {}
                    );
                settings.sidebarCollapsed = collapsed;
                window.TaskoraStorage.write(
                    window.TaskoraStorage.keys.settings,
                    settings
                );
            }
        }
        function handleNavigation(event) {
            event.preventDefault();
            const item = event.currentTarget;
            const page = item.dataset.page;
            if (!page) {
                return;
            }
            navItems.forEach((navItem) => {
                navItem.classList.remove("active");
                navItem.removeAttribute("aria-current");
            });
            item.classList.add("active");
            item.setAttribute("aria-current", "page");
            document.dispatchEvent(
                new CustomEvent("taskora:navigate", {
                    detail: {
                        page
                    }
                })
            );
            if (isMobile()) {
                closeMobileSidebar();
            }
        }
        function handleBottomNavigation(event) {
            event.preventDefault();
            const item = event.currentTarget;
            const page = item.dataset.page;
            if (!page) {
                return;
            }
            document.dispatchEvent(
                new CustomEvent("taskora:navigate", {
                    detail: {
                        page
                    }
                })
            );
            if (isMobile()) {
                closeMobileSidebar();
            }
        }
        if (sidebarToggle) {
            sidebarToggle.addEventListener(
                "click",
                toggleSidebar
            );
        }
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener(
                "click",
                toggleSidebar
            );
        }
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener(
                "click",
                closeMobileSidebar
            );
        }
        navItems.forEach((item) => {
            item.addEventListener(
                "click",
                handleNavigation
            );
        });
        sidebarPageItems.forEach((item) => {
            item.addEventListener(
                "click",
                handleBottomNavigation
            );
        });
        window.addEventListener("resize", () => {
            if (!isMobile()) {
                closeMobileSidebar();
            }
        });
        const settings =
            window.TaskoraStorage?.read(
                window.TaskoraStorage.keys.settings,
                {}
            );
        if (
            settings &&
            settings.sidebarCollapsed &&
            !isMobile()
        ) {
            app.classList.add("sidebar-collapsed");
            if (sidebarToggle) {
                sidebarToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    }
    window.TaskoraSidebar = {
        initialize: initializeSidebar
    };
})();
/* =========================================================
   TASKORA — STEP 1
   GLOBAL SIDEBAR NAVIGATION CONTROLLER
========================================================= */
(() => {
    "use strict";
    if (window.taskoraNavigationControllerInitialized) {
        return;
    }
    window.taskoraNavigationControllerInitialized = true;
    const PAGE_MAP = {
        dashboard: "dashboard",
        upcoming: "upcoming",
        today: "today",
        calendar: "calendar",
        "add-task": "add-task",
        "edit-task": "edit-task",
        lists: "lists",
        recycle: "recycle",
        notifications: "notifications",
        settings: "settings",
        about: "about"
    };
    function normalizePage(page) {
        if (!page) {
            return "dashboard";
        }
        const normalized = String(page)
            .trim()
            .toLowerCase();
        return PAGE_MAP[normalized]
            ? normalized
            : "dashboard";
    }
    function setActiveNavigation(page) {
        const normalizedPage =
            normalizePage(page);
        document
            .querySelectorAll(
                ".nav-item[data-page], .sidebar-bottom-item[data-page]"
            )
            .forEach(item => {
                const itemPage =
                    normalizePage(
                        item.dataset.page
                    );
                const isActive =
                    itemPage === normalizedPage;
                item.classList.toggle(
                    "active",
                    isActive
                );
                if (isActive) {
                    item.setAttribute(
                        "aria-current",
                        "page"
                    );
                } else {
                    item.removeAttribute(
                        "aria-current"
                    );
                }
            });
    }
    function navigateTo(page) {
        const normalizedPage =
            normalizePage(page);
        setActiveNavigation(
            normalizedPage
        );
        document.dispatchEvent(
            new CustomEvent(
                "taskora:navigate",
                {
                    detail: {
                        page: normalizedPage
                    }
                }
            )
        );
        window.dispatchEvent(
            new CustomEvent(
                "taskora:page-change",
                {
                    detail: {
                        page: normalizedPage
                    }
                }
            )
        );
    }
    document.addEventListener(
        "taskora:navigate",
        event => {
            const page =
                event.detail?.page;
            if (page) {
                setActiveNavigation(page);
            }
        }
    );
    window.TaskoraNavigation = {
        navigate: navigateTo,
        setActive: setActiveNavigation,
        normalize: normalizePage,
        pages: PAGE_MAP
    };
})();