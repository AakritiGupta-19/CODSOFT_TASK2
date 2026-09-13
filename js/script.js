/* =========================================================
   TASKORA — APPLICATION CORE
========================================================= */
(() => {
    "use strict";
    let initialized = false;
    function getCurrentHour() {
        return new Date().getHours();
    }
    function getGreeting(name = "") {
        const hour = getCurrentHour();
        const cleanName =
            typeof name === "string"
                ? name.trim()
                : "";
        let greeting;
        if (hour >= 5 && hour < 12) {
            greeting = "Good morning";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Good afternoon";
        } else if (hour >= 18 && hour < 22) {
            greeting = "Good evening";
        } else {
            greeting = "Hi";
        }
        return cleanName
            ? `${greeting}, ${cleanName}`
            : greeting;
    }
    function updateGreeting() {
        const greetingElement =
            document.getElementById("dashboardGreeting");
        if (!greetingElement) {
            return;
        }
        const profile =
            window.TaskoraProfile?.getProfile?.() || {
                name: "Alex"
            };
        const name =
            profile.name?.trim() || "Alex";
        greetingElement.textContent =
            getGreeting(name);
    }
    function applyTheme(theme) {
        const safeTheme =
            theme === "dark"
                ? "dark"
                : "light";
        const isDark = safeTheme === "dark";
        document.documentElement.dataset.theme = safeTheme;
        document.documentElement.classList.toggle("dark-mode", isDark);
        document.documentElement.classList.toggle("dark-theme", isDark);
        if (document.body) {
            document.body.classList.toggle("dark-mode", isDark);
            document.body.classList.toggle("dark-theme", isDark);
            document.body.dataset.theme = safeTheme;
            if (document.body.style) {
                if (typeof document.body.style.removeProperty === "function") {
                    document.body.style.removeProperty("background");
                    document.body.style.removeProperty("background-color");
                    document.body.style.removeProperty("color");
                } else {
                    document.body.style.background = "";
                    document.body.style.backgroundColor = "";
                    document.body.style.color = "";
                }
            }
        }
        const themeButton =
            document.getElementById("themeToggle");
        if (themeButton) {
            const icon =
                themeButton.querySelector("i");
            if (icon) {
                icon.className =
                    isDark
                        ? "fa-regular fa-sun"
                        : "fa-regular fa-moon";
            } else {
                themeButton.textContent = isDark ? "☀" : "☾";
            }
            themeButton.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to light theme"
                    : "Switch to dark theme"
            );
            themeButton.title = isDark ? "Switch to light theme" : "Switch to dark theme";
        }
        try {
            localStorage.setItem("taskora_theme", safeTheme);
            if (window.TaskoraStorage) {
                window.TaskoraStorage.write("theme", safeTheme);
                if (window.TaskoraStorage.keys?.theme) {
                    window.TaskoraStorage.write(
                        window.TaskoraStorage.keys.theme,
                        safeTheme
                    );
                }
            }
            if (window.TaskoraSettings?.saveSettings) {
                const settings =
                    window.TaskoraSettings.getSettings?.() || {};
                settings.theme = safeTheme;
                window.TaskoraSettings.saveSettings(settings);
            }
        } catch (e) {
            console.warn("Theme persistence warning:", e);
        }
        window.dispatchEvent(new CustomEvent("taskora:themeChanged", { detail: { theme: safeTheme, isDark } }));
    }
    function initializeTheme() {
        let savedTheme = "light";
        if (window.TaskoraStorage) {
            savedTheme =
                window.TaskoraStorage.read(
                    window.TaskoraStorage.keys.theme,
                    "light"
                );
        } else {
            savedTheme = localStorage.getItem("taskora_theme") || "light";
        }
        applyTheme(savedTheme);
        const themeButton =
            document.getElementById("themeToggle");
        if (!themeButton) {
            return;
        }
        if (themeButton.dataset.taskoraThemeBound === "true") {
            return;
        }
        themeButton.dataset.taskoraThemeBound = "true";
        themeButton.addEventListener(
            "click",
            (e) => {
                if (e && typeof e.preventDefault === "function") e.preventDefault();
                const currentTheme =
                    document.documentElement.dataset.theme ||
                    (document.body && document.body.classList.contains("dark-mode") ? "dark" : "light");
                const nextTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";
                applyTheme(nextTheme);
            }
        );
    }
    window.TaskoraTheme = {
        applyTheme,
        toggleTheme: () => {
            const currentTheme = document.documentElement.dataset.theme || "light";
            const next = currentTheme === "dark" ? "light" : "dark";
            applyTheme(next);
            return next;
        },
        getTheme: () => document.documentElement.dataset.theme || "light"
    };
    function initializeQuickActions() {
        const quickAddTask =
            document.getElementById("quickAddTask");
        const emptyStateAddTask =
            document.getElementById("emptyStateAddTask");
        const addListButton =
            document.getElementById("addListButton");
        const aboutButton =
            document.getElementById("aboutTaskoraButton");
        const reviewButton =
            document.getElementById("reviewButton");
        const profileTrigger =
            document.getElementById("profileTrigger");
        const notificationButton =
            document.getElementById("notificationButton");
        const navigate = (page) => {
            document.dispatchEvent(
                new CustomEvent("taskora:navigate", {
                    detail: {
                        page
                    }
                })
            );
        };
        if (quickAddTask) {
            quickAddTask.addEventListener(
                "click",
                () => navigate("add-task")
            );
        }
        if (emptyStateAddTask) {
            emptyStateAddTask.addEventListener(
                "click",
                () => navigate("add-task")
            );
        }
        if (addListButton) {
            addListButton.addEventListener(
                "click",
                () => {
                    if (typeof openListModal === "function") {
                        openListModal();
                    }
                }
            );
        }
        if (aboutButton) {
            aboutButton.addEventListener(
                "click",
                () => navigate("about")
            );
        }
        if (reviewButton) {
            reviewButton.addEventListener(
                "click",
                () => {
                    showToast(
                        "Review and feedback will be added in a later phase."
                    );
                }
            );
        }
        if (profileTrigger) {
            profileTrigger.addEventListener(
                "click",
                () => navigate("profile")
            );
        }
        if (notificationButton) {
            notificationButton.addEventListener(
                "click",
                () => navigate("notifications")
            );
        }
    }
    function initializeSearch() {
        const searchInput =
            document.getElementById("globalSearch");
        if (!searchInput) {
            return;
        }
        searchInput.addEventListener(
            "input",
            (event) => {
                const query =
                    event.target.value.trim();
                document.dispatchEvent(
                    new CustomEvent(
                        "taskora:search",
                        {
                            detail: {
                                query
                            }
                        }
                    )
                );
            }
        );
    }
    function showToast(message) {
        const container =
            document.getElementById("toastContainer");
        if (!container) {
            return;
        }
        const toast =
            document.createElement("div");
        toast.className = "toast";
        const icon =
            document.createElement("span");
        icon.className = "toast-icon";
        icon.innerHTML =
            '<i class="fa-solid fa-sparkles"></i>';
        const messageElement =
            document.createElement("span");
        messageElement.className =
            "toast-message";
        messageElement.textContent =
            message;
        toast.append(
            icon,
            messageElement
        );
        container.appendChild(toast);
        window.setTimeout(() => {
            toast.classList.add("removing");
            window.setTimeout(() => {
                toast.remove();
            }, 220);
        }, 3000);
    }
    function initializeNavigation() {
        document.addEventListener(
            "taskora:navigate",
            (event) => {
                const page =
                    event.detail?.page;
                if (!page) {
                    return;
                }
                /*
                 * Phase 1 keeps Dashboard visible.
                 *
                 * Future phases will connect these navigation
                 * events to their actual pages/views.
                 */
                if (page === "dashboard") {
                    const dashboard =
                        document.getElementById(
                            "dashboardPage"
                        );
                    const placeholder =
                        document.getElementById(
                            "futurePageContainer"
                        );
                    if (dashboard) {
                        dashboard.style.display = "block";
                    }
                    if (placeholder) {
                        placeholder.style.display = "none";
                    }
                    return;
                }
                const dashboard =
                    document.getElementById(
                        "dashboardPage"
                    );
                const placeholder =
                    document.getElementById(
                        "futurePageContainer"
                    );
                if (dashboard) {
                    dashboard.style.display = "none";
                }
                if (placeholder) {
                    placeholder.style.display =
                        "grid";
                    const title =
                        placeholder.querySelector("h2");
                    const description =
                        placeholder.querySelector("p");
                    if (title) {
                        title.textContent =
                            `${formatPageName(page)}`;
                    }
                    if (description) {
                        description.textContent =
                            "This workspace will be connected in the appropriate Taskora development phase.";
                    }
                }
            }
        );
    }
    function formatPageName(page) {
        return page
            .replace(/-/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    }
    function initializeAuthAndProfile() {
        const loginBtn = document.getElementById("login-btn");
        const loginModal = document.getElementById("login-modal");
        const loginClose = document.getElementById("login-close");
        const loginBackdrop = document.getElementById("login-modal-backdrop");
        const loginForm = document.getElementById("login-form");
        const loginError = document.getElementById("login-error");
        const loginNameInput = document.getElementById("login-name");
        const loginPasswordInput = document.getElementById("login-password");
        
        const profileTrigger = document.getElementById("profileTrigger");
        const profilePanel = document.getElementById("profilePanel");
        const saveProfileBtn = document.getElementById("saveProfileBtn");
        const profileNameInput = document.getElementById("profileName");
        const profilePasswordInput = document.getElementById("profilePassword");
        const profileSloganInput = document.getElementById("profileSlogan");

        function updateProfileUI(userName, slogan) {
            const name = userName || "Alex";
            const greetingElem = document.getElementById("dashboardGreeting");
            if (greetingElem) {
                const hour = new Date().getHours();
                const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
                greetingElem.textContent = `${part}, ${name}`;
            }
            const headerName = document.getElementById("headerProfileName");
            if (headerName) headerName.textContent = name;
            const panelName = document.getElementById("profilePanelName");
            if (panelName) panelName.textContent = name;
            if (loginBtn) {
                const span = loginBtn.querySelector("span");
                if (span) span.textContent = (userName && userName !== "Guest") ? "Logout" : "Login";
            }
        }

        try {
            const savedUser = JSON.parse(localStorage.getItem("taskora_user") || "null");
            if (savedUser && savedUser.name) {
                updateProfileUI(savedUser.name, savedUser.slogan);
                if (profileNameInput) profileNameInput.value = savedUser.name;
                if (profileSloganInput) profileSloganInput.value = savedUser.slogan || "";
            }
        } catch (e) {}

        if (loginBtn) {
            loginBtn.addEventListener("click", (e) => {
                e?.preventDefault?.();
                try {
                    const savedUser = JSON.parse(localStorage.getItem("taskora_user") || "null");
                    if (savedUser && savedUser.loggedIn) {
                        localStorage.removeItem("taskora_user");
                        updateProfileUI("Alex", "");
                        showToast("Logged out successfully.");
                        return;
                    }
                } catch(err) {}
                if (loginModal) {
                    loginModal.classList.add("show");
                    loginModal.setAttribute("aria-hidden", "false");
                    loginNameInput?.focus?.();
                }
            });
        }

        function closeLoginModal() {
            if (loginModal) {
                loginModal.classList.remove("show");
                loginModal.setAttribute("aria-hidden", "true");
            }
            if (loginError) loginError.textContent = "";
        }

        loginClose?.addEventListener("click", closeLoginModal);
        loginBackdrop?.addEventListener("click", closeLoginModal);

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e?.preventDefault?.();
                const name = loginNameInput?.value?.trim();
                const password = loginPasswordInput?.value;
                if (!name) {
                    if (loginError) loginError.textContent = "Please enter your name.";
                    return;
                }
                const userData = {
                    name: name,
                    password: password || "",
                    loggedIn: true,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem("taskora_user", JSON.stringify(userData));
                updateProfileUI(name, "");
                closeLoginModal();
                showToast(`Welcome back, ${name}!`);
            });
        }

        if (profileTrigger && profilePanel) {
            profileTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                profilePanel.hidden = !profilePanel.hidden;
            });
            document.addEventListener("click", (e) => {
                if (!profilePanel.hidden && !profilePanel.contains(e.target) && !profileTrigger.contains(e.target)) {
                    profilePanel.hidden = true;
                }
            });
        }

        if (saveProfileBtn) {
            saveProfileBtn.addEventListener("click", () => {
                const name = profileNameInput?.value?.trim() || "Alex";
                const slogan = profileSloganInput?.value?.trim() || "";
                const password = profilePasswordInput?.value || "";
                
                let existing = {};
                try { existing = JSON.parse(localStorage.getItem("taskora_user") || "{}"); } catch(err) {}
                existing.name = name;
                existing.slogan = slogan;
                if (password) existing.password = password;
                existing.loggedIn = true;
                localStorage.setItem("taskora_user", JSON.stringify(existing));
                
                updateProfileUI(name, slogan);
                if (profilePanel) profilePanel.hidden = true;
                showToast("Profile saved successfully.");
            });
        }
    }
    
    /* =========================================================
       CUSTOM LISTS ENGINE & UI (TaskoraLists)
       ========================================================= */
        function escapeHTML(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const TaskoraLists = (function () {
        const STORAGE_KEY = "taskora_lists";

        function getLists() {
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (Array.isArray(saved) && saved.length) {
                    return saved;
                }
            } catch(e) {}
            const defaults = [
                {
                    id: "list-1",
                    title: "Daily Focus",
                    items: [
                        { id: "item-1-1", text: "Review key priorities for today", done: true },
                        { id: "item-1-2", text: "Complete project milestone tasks", done: false },
                        { id: "item-1-3", text: "Evening productivity check-in", done: false }
                    ],
                    createdAt: new Date().toISOString()
                },
                {
                    id: "list-2",
                    title: "Project Ideas",
                    items: [
                        { id: "item-2-1", text: "Custom widget dashboard layout", done: false },
                        { id: "item-2-2", text: "Kanban board drag and drop", done: false }
                    ],
                    createdAt: new Date().toISOString()
                },
                {
                    id: "list-3",
                    title: "Reading & Learning",
                    items: [
                        { id: "item-3-1", text: "Read 20 pages of Deep Work", done: false },
                        { id: "item-3-2", text: "Explore CSS modern grid architectures", done: true }
                    ],
                    createdAt: new Date().toISOString()
                }
            ];
            saveLists(defaults, false);
            return defaults;
        }

        function saveLists(lists, notify = true) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
                if (notify) {
                    document.dispatchEvent(new CustomEvent("taskora:listsChanged", { detail: { lists } }));
                }
            } catch(e) {}
        }

        function createList(title, rawText) {
            const lists = getLists();
            const items = (rawText || "")
                .split("\n")
                .map(s => s.trim())
                .filter(Boolean)
                .map((text, idx) => ({
                    id: "item-" + Date.now() + "-" + idx,
                    text: text,
                    done: false
                }));

            const newList = {
                id: "list-" + Date.now(),
                title: title.trim() || "Untitled List",
                items: items,
                createdAt: new Date().toISOString()
            };

            lists.unshift(newList);
            saveLists(lists);
            return newList;
        }

        function updateList(id, title, rawText) {
            const lists = getLists();
            const list = lists.find(l => l.id === id);
            if (!list) return;

            list.title = (title || "").trim() || list.title;
            if (rawText !== undefined) {
                const newLines = (rawText || "")
                    .split("\n")
                    .map(s => s.trim())
                    .filter(Boolean);

                list.items = newLines.map((line, idx) => {
                    const existing = list.items.find(it => it.text === line);
                    return existing || {
                        id: "item-" + Date.now() + "-" + idx,
                        text: line,
                        done: false
                    };
                });
            }
            list.updatedAt = new Date().toISOString();
            saveLists(lists);
        }

        function deleteList(id) {
            let lists = getLists();
            lists = lists.filter(l => l.id !== id);
            saveLists(lists);
        }

        function addItem(listId, text) {
            if (!text || !text.trim()) return;
            const lists = getLists();
            const list = lists.find(l => l.id === listId);
            if (!list) return;
            if (!Array.isArray(list.items)) list.items = [];
            list.items.push({
                id: "item-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
                text: text.trim(),
                done: false
            });
            saveLists(lists);
        }

        function toggleItem(listId, itemId) {
            const lists = getLists();
            const list = lists.find(l => l.id === listId);
            if (!list || !Array.isArray(list.items)) return;
            const item = list.items.find(it => it.id === itemId);
            if (item) {
                item.done = !item.done;
                saveLists(lists);
            }
        }

        function deleteItem(listId, itemId) {
            const lists = getLists();
            const list = lists.find(l => l.id === listId);
            if (!list || !Array.isArray(list.items)) return;
            list.items = list.items.filter(it => it.id !== itemId);
            saveLists(lists);
        }

        return {
            getLists,
            saveLists,
            createList,
            updateList,
            deleteList,
            addItem,
            toggleItem,
            deleteItem
        };
    })();
    window.TaskoraLists = TaskoraLists;

    function openListModal(editingList = null) {
        const modal = document.getElementById("listModal");
        const titleInput = document.getElementById("listModalTitleInput");
        const textInput = document.getElementById("listModalTextInput");
        const editingIdInput = document.getElementById("editingListId");
        const heading = document.getElementById("listModalTitle");
        if (!modal) return;

        if (editingList) {
            if (heading) heading.textContent = "Edit List";
            if (editingIdInput) editingIdInput.value = editingList.id;
            if (titleInput) titleInput.value = editingList.title || "";
            if (textInput) textInput.value = (editingList.items || []).map(it => it.text).join("\n");
        } else {
            if (heading) heading.textContent = "Create New List";
            if (editingIdInput) editingIdInput.value = "";
            if (titleInput) titleInput.value = "";
            if (textInput) textInput.value = "";
        }

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        titleInput?.focus?.();
    }

    function closeListModal() {
        const modal = document.getElementById("listModal");
        if (!modal) return;
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }

    function renderSidebarLists() {
        const container = document.getElementById("customListsPreview");
        if (!container) return;
        const lists = TaskoraLists.getLists();
        container.innerHTML = "";

        if (!lists.length) {
            container.innerHTML = '<p class="sidebar-placeholder">Your lists will appear here.</p>';
            return;
        }

        // Rule: Show 2 or 3 lists directly
        const displayed = lists.slice(0, 3);
        displayed.forEach(list => {
            const btn = document.createElement("button");
            btn.className = "sidebar-list-item";
            btn.type = "button";
            btn.innerHTML = `
                <div class="sidebar-list-left">
                    <span class="sidebar-list-icon">📋</span>
                    <span class="sidebar-list-title">${escapeHTML(list.title || "Untitled List")}</span>
                </div>
                <span class="sidebar-list-badge">${(list.items || []).length}</span>
            `;
            btn.addEventListener("click", () => {
                document.dispatchEvent(new CustomEvent("taskora:navigate", {
                    detail: { page: "lists", listId: list.id }
                }));
            });
            container.appendChild(btn);
        });

        // Rule: If more than 3 lists, show clickable "... More" option
        if (lists.length > 3) {
            const moreBtn = document.createElement("button");
            moreBtn.className = "sidebar-more-lists-btn";
            moreBtn.type = "button";
            moreBtn.innerHTML = `... More (${lists.length - 3} more)`;
            moreBtn.addEventListener("click", () => {
                document.dispatchEvent(new CustomEvent("taskora:navigate", {
                    detail: { page: "lists" }
                }));
            });
            container.appendChild(moreBtn);
        }
    }

    function initializeListsModule() {
        const modalClose = document.getElementById("listModalClose");
        const modalCancel = document.getElementById("listModalCancelBtn");
        const modalBackdrop = document.getElementById("listModalBackdrop");
        const listForm = document.getElementById("listForm");
        const titleInput = document.getElementById("listModalTitleInput");
        const textInput = document.getElementById("listModalTextInput");
        const editingIdInput = document.getElementById("editingListId");

        modalClose?.addEventListener("click", closeListModal);
        modalCancel?.addEventListener("click", closeListModal);
        modalBackdrop?.addEventListener("click", closeListModal);

        if (listForm) {
            listForm.addEventListener("submit", (e) => {
                e?.preventDefault?.();
                const title = titleInput?.value?.trim();
                const text = textInput?.value || "";
                const editingId = editingIdInput?.value;

                if (!title) {
                    if (typeof showToast === "function") showToast("Please enter a list title.");
                    return;
                }

                if (editingId) {
                    TaskoraLists.updateList(editingId, title, text);
                    if (typeof showToast === "function") showToast("List updated successfully.");
                } else {
                    TaskoraLists.createList(title, text);
                    if (typeof showToast === "function") showToast("List created successfully.");
                }

                closeListModal();
            });
        }

        document.addEventListener("taskora:listsChanged", renderSidebarLists);
        renderSidebarLists();
    }

    function initializeApplication() {
        if (initialized) {
            return;
        }
        initialized = true;
        initializeTheme();
        window.TaskoraSidebar?.initialize?.();
        window.TaskoraCalendar?.initialize?.();
        window.TaskoraNotifications?.initialize?.();
        window.TaskoraProfile?.initialize?.();
        window.TaskoraSettings?.initialize?.();
        initializeAuthAndProfile();
        initializeListsModule();
        updateGreeting();
        initializeQuickActions();
        initializeSearch();
        initializeNavigation();
        window.setInterval(
            updateGreeting,
            60000
        );
        document.dispatchEvent(
            new CustomEvent("taskora:ready")
        );
    }
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApplication,
            {
                once: true
            }
        );
    } else {
        initializeApplication();
    }
    window.Taskora = Object.freeze({
        getGreeting,
        showToast,
        applyTheme
    });
})();
/* =========================================
   TASKORA PHASE 2 - DASHBOARD LOGIC
========================================= */
(function () {
    "use strict";
    const TASKORA_STORAGE = {
        user: "taskora_user",
        tasks: "taskora_tasks",
        theme: "taskora_theme",
        notifications: "taskora_notifications",
        settings: "taskora_settings"
    };
    function getTaskoraData(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }
    function saveTaskoraData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn("Taskora storage error.");
        }
    }
    function getTaskoraTasks() {
        return getTaskoraData(TASKORA_STORAGE.tasks, []);
    }
    function updateDashboardGreeting() {
        const greetingElement = document.getElementById("greetingText");
        const nameElement = document.getElementById("headerProfileName");
        const avatarElement = document.getElementById("profileAvatar");
        if (!greetingElement) return;
        const user = getTaskoraData(TASKORA_STORAGE.user, {
            name: "Alex",
            slogan: "Plan better. Focus smarter. Get things done."
        });
        const name = user.name && user.name.trim()
            ? user.name.trim()
            : "";
        const hour = new Date().getHours();
        let greeting = "Hi";
        if (hour >= 5 && hour < 12) {
            greeting = "Good morning";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Good afternoon";
        } else if (hour >= 18 && hour < 22) {
            greeting = "Good evening";
        }
        greetingElement.textContent = name
            ? `${greeting} ${name} 👋`
            : greeting;
        if (nameElement) {
            nameElement.textContent = name || "Profile";
        }
        if (avatarElement) {
            avatarElement.textContent = name
                ? name.charAt(0).toUpperCase()
                : "A";
        }
        const sloganElement = document.getElementById("dashboardSlogan");
        if (sloganElement) {
            sloganElement.textContent =
                user.slogan ||
                "Plan better. Focus smarter. Get things done.";
        }
    }
    function updateDashboardStats() {
        const tasks = getTaskoraTasks();
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed === true).length;
        const pending = tasks.filter(task => !task.completed).length;
        const todayTasks = tasks.filter(task => task.dueDate === todayString);
        const scheduled = tasks.filter(task =>
            task.dueDate && !task.completed
        );
        const inProcess = tasks.filter(task =>
            task.status === "in-progress"
        );
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };
        setText("newTasksCount", tasks.filter(task => {
            if (!task.createdAt) return false;
            const created = new Date(task.createdAt);
            const difference =
                (Date.now() - created.getTime()) /
                (1000 * 60 * 60 * 24);
            return difference <= 1;
        }).length);
        setText("scheduledTasksCount", scheduled.length);
        setText("inProcessTasksCount", inProcess.length);
        setText("pendingTasksCount", pending);
        setText("completedTasksCount", completed);
        setText("todayTasksCount", todayTasks.length);
        setText("totalTasksCount", total);
        setText("productivityCompletedCount", completed);
        setText("productivityPendingCount", pending);
        const percentage = total
            ? Math.round((completed / total) * 100)
            : 0;
        setText("completionPercentage", `${percentage}%`);
        const productivityScore = total
            ? Math.min(100, Math.round(
                (completed / total) * 100
            ))
            : 0;
        setText("productivityScore", productivityScore);
        setText("weeklyTasksCount", tasks.length);
        setText(
            "reminderCount",
            tasks.filter(task => task.reminder).length
        );
        updateProgressRing(percentage);
        renderDashboardTaskPreviews(tasks, todayString);
    }
    function updateProgressRing(percentage) {
        const ring = document.querySelector(".progress-ring");
        if (!ring) return;
        const degrees = Math.round(
            (percentage / 100) * 360
        );
        ring.style.background = `
            conic-gradient(
                var(--taskora-primary) ${degrees}deg,
                var(--taskora-lavender) ${degrees}deg
            )
        `;
    }
    function renderDashboardTaskPreviews(tasks, todayString) {
        const todayContainer =
            document.getElementById("todayTaskPreview");
        const upcomingContainer =
            document.getElementById("upcomingTaskPreview");
        const urgentContainer =
            document.getElementById("urgentTaskPreview");
        const highContainer =
            document.getElementById("highTaskPreview");
        if (!todayContainer) return;
        const todayTasks = tasks.filter(task =>
            task.dueDate === todayString &&
            !task.completed
        );
        const futureTasks = tasks
            .filter(task =>
                task.dueDate &&
                task.dueDate > todayString &&
                !task.completed
            )
            .sort((a, b) =>
                a.dueDate.localeCompare(b.dueDate)
            );
        const urgentTasks = tasks.filter(task =>
            task.priority === "Urgent" &&
            !task.completed
        );
        const highTasks = tasks.filter(task =>
            task.priority === "High" &&
            !task.completed
        );
        renderPreviewList(
            todayContainer,
            todayTasks.slice(0, 4),
            "No tasks for today yet."
        );
        renderPreviewList(
            upcomingContainer,
            futureTasks.slice(0, 4),
            "No upcoming tasks."
        );
        renderPreviewList(
            urgentContainer,
            urgentTasks.slice(0, 3),
            "No urgent tasks."
        );
        renderPreviewList(
            highContainer,
            highTasks.slice(0, 3),
            "No high-priority tasks."
        );
    }
    function renderPreviewList(container, tasks, emptyText) {
        if (!container) return;
        if (!tasks.length) {
            container.innerHTML = `<small>${emptyText}</small>`;
            return;
        }
        container.innerHTML = tasks.map(task => `
            <div class="preview-task">
                <div>
                    <div class="preview-task-title">
                        ${escapeTaskoraText(task.title)}
                    </div>

                    <div class="preview-task-meta">
                        ${escapeTaskoraText(task.category || "Other")}
                        ${task.dueDate ? ` • ${task.dueDate}` : ""}
                    </div>
                </div>

                <span>${task.completed ? "✓" : "○"}</span>
            </div>
        `).join("");
    }
    function escapeTaskoraText(value) {
        const element = document.createElement("div");
        element.textContent = value ?? "";
        return element.innerHTML;
    }
    function initializeTheme() {
        if (window.TaskoraTheme?.applyTheme) {
            const savedTheme = localStorage.getItem("taskora_theme") || "light";
            window.TaskoraTheme.applyTheme(savedTheme);
            return;
        }
    }
    function updateThemeIcon() {
        if (window.TaskoraTheme?.getTheme) {
            const isDark = window.TaskoraTheme.getTheme() === "dark";
            const button = document.getElementById("themeToggle");
            if (button) {
                const icon = button.querySelector("i");
                if (icon) {
                    icon.className = isDark ? "fa-regular fa-sun" : "fa-regular fa-moon";
                } else {
                    button.textContent = isDark ? "☀" : "☾";
                }
            }
        }
    }
    function initializeFaq() {
        document.querySelectorAll(".faq-question").forEach(button => {
            if (button.dataset.taskoraInitialized === "true") {
                return;
            }
            button.dataset.taskoraInitialized = "true";
            button.addEventListener("click", function () {
                const item = button.closest(".faq-item");
                if (!item) return;
                item.classList.toggle("active");
                const symbol =
                    button.querySelector("span:last-child");
                if (symbol) {
                    symbol.textContent =
                        item.classList.contains("active")
                            ? "−"
                            : "+";
                }
            });
        });
    }
    function initializeDashboardButtons() {
        const addButton =
            document.getElementById("quickAddTaskBtn");
        if (addButton &&
            addButton.dataset.taskoraInitialized !== "true") {
            addButton.dataset.taskoraInitialized = "true";
            addButton.addEventListener("click", function () {
                const modal =
                    document.getElementById("taskModal");
                if (modal) {
                    modal.classList.add("show");
                    modal.setAttribute("aria-hidden", "false");
                }
            });
        }
        const aboutButton =
            document.getElementById("aboutTaskoraBtn");
        if (aboutButton &&
            aboutButton.dataset.taskoraInitialized !== "true") {
            aboutButton.dataset.taskoraInitialized = "true";
            aboutButton.addEventListener("click", function () {
                document
                    .getElementById("aboutTaskoraSection")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            });
        }
    }
    function initializeSearchSuggestions() {
        const input =
            document.getElementById("searchInput");
        const suggestions =
            document.getElementById("searchSuggestions");
        if (!input || !suggestions) return;
        if (input.dataset.taskoraInitialized === "true") {
            return;
        }
        input.dataset.taskoraInitialized = "true";
        const searchOptions = [
            "today",
            "upcoming",
            "urgent",
            "high priority",
            "completed",
            "pending",
            "overdue"
        ];
        input.addEventListener("focus", function () {
            renderSearchSuggestions("");
        });
        input.addEventListener("input", function () {
            renderSearchSuggestions(input.value.trim());
        });
        document.addEventListener("click", function (event) {
            if (!input.contains(event.target) &&
                !suggestions.contains(event.target)) {
                suggestions.classList.remove("show");
            }
        });
        function renderSearchSuggestions(query) {
            const filtered = searchOptions.filter(option =>
                option.includes(query.toLowerCase())
            );
            if (!filtered.length) {
                suggestions.classList.remove("show");
                return;
            }
            suggestions.innerHTML = filtered.map(option => `
                <div
                    class="search-suggestion"
                    data-search="${option}"
                >
                    🔍 ${option}
                </div>
            `).join("");
            suggestions.classList.add("show");
            suggestions
                .querySelectorAll(".search-suggestion")
                .forEach(item => {
                    item.addEventListener("click", function () {
                        input.value =
                            item.dataset.search;
                        suggestions.classList.remove("show");
                        input.dispatchEvent(
                            new Event("input")
                        );
                    });
                });
        }
    }
    function initializePhaseTwo() {
        updateDashboardGreeting();
        updateDashboardStats();
        initializeTheme();
        initializeFaq();
        initializeDashboardButtons();
        initializeSearchSuggestions();
    }
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializePhaseTwo,
            { once: true }
        );
    } else {
        initializePhaseTwo();
    }
})();
/* =========================================
   TASKORA PHASE 6
   SEARCH + ORGANIZATION
========================================= */
(function () {
    "use strict";
    const STORAGE_KEY = "taskora_tasks";
    const getTasks = () => {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    };
    const saveTasks = (tasks) => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    };
    const searchInput =
        document.getElementById("globalSearch");
    const categoryFilter =
        document.getElementById("taskoraP6CategoryFilter");
    const priorityFilter =
        document.getElementById("taskoraP6PriorityFilter");
    const statusFilter =
        document.getElementById("taskoraP6StatusFilter");
    const sortFilter =
        document.getElementById("taskoraP6SortFilter");
    const resultsContainer =
        document.getElementById("taskoraP6Results");
    const resultCount =
        document.getElementById("taskoraP6ResultCount");
    const activeFilters =
        document.getElementById("taskoraP6ActiveFilters");
    const clearButton =
        document.getElementById("taskoraP6ClearFilters");
    if (
        !searchInput ||
        !resultsContainer ||
        !categoryFilter ||
        !priorityFilter ||
        !statusFilter ||
        !sortFilter
    ) {
        return;
    }
    function populateCategories() {
        const tasks = getTasks();
        const categories = [
            ...new Set(
                tasks
                    .map(task => task.category)
                    .filter(Boolean)
            )
        ];
        categoryFilter.innerHTML =
            '<option value="all">All Categories</option>';
        categories.forEach(category => {
            const option =
                document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    function isOverdue(task) {
        if (!task.dueDate || task.completed) {
            return false;
        }
        const today =
            new Date().toISOString().split("T")[0];
        return task.dueDate < today;
    }
    function matchesSmartSearch(task, query) {
        const text = query.toLowerCase().trim();
        if (!text) {
            return true;
        }
        const today =
            new Date().toISOString().split("T")[0];
        const searchableText = [
            task.title,
            task.description,
            task.category,
            ...(Array.isArray(task.tags) ? task.tags : []),
            task.priority
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        if (text === "today") {
            return task.dueDate === today;
        }
        if (text === "upcoming") {
            return task.dueDate > today;
        }
        if (text === "urgent") {
            return String(task.priority).toLowerCase() === "urgent";
        }
        if (text === "high priority") {
            return String(task.priority).toLowerCase() === "high";
        }
        if (text === "completed") {
            return task.completed === true;
        }
        if (text === "pending") {
            return !task.completed;
        }
        if (text === "overdue") {
            return isOverdue(task);
        }
        return searchableText.includes(text);
    }
    function filterTasks() {
        let tasks = getTasks();
        const query =
            searchInput.value.trim();
        const category =
            categoryFilter.value;
        const priority =
            priorityFilter.value;
        const status =
            statusFilter.value;
        const sort =
            sortFilter.value;
        tasks = tasks.filter(task =>
            matchesSmartSearch(task, query)
        );
        if (category !== "all") {
            tasks = tasks.filter(
                task => task.category === category
            );
        }
        if (priority !== "all") {
            tasks = tasks.filter(
                task => task.priority === priority
            );
        }
        if (status === "completed") {
            tasks = tasks.filter(
                task => task.completed === true
            );
        }
        if (status === "pending") {
            tasks = tasks.filter(
                task => !task.completed
            );
        }
        if (status === "overdue") {
            tasks = tasks.filter(
                task => isOverdue(task)
            );
        }
        const priorityOrder = {
            Urgent: 1,
            High: 2,
            Medium: 3,
            Low: 4
        };
        if (sort === "priority") {
            tasks.sort(
                (a, b) =>
                    (priorityOrder[a.priority] || 99) -
                    (priorityOrder[b.priority] || 99)
            );
        }
        if (sort === "dueDate") {
            tasks.sort(
                (a, b) =>
                    String(a.dueDate || "")
                        .localeCompare(
                            String(b.dueDate || "")
                        )
            );
        }
        if (sort === "az") {
            tasks.sort(
                (a, b) =>
                    String(a.title || "")
                        .localeCompare(
                            String(b.title || "")
                        )
            );
        }
        if (sort === "status") {
            tasks.sort(
                (a, b) =>
                    Number(a.completed) -
                    Number(b.completed)
            );
        }
        renderResults(tasks);
        renderActiveFilters();
    }
    function renderResults(tasks) {
        resultCount.textContent =
            `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
        if (!tasks.length) {
            resultsContainer.innerHTML = `
                <div class="taskora-p6-empty-state">
                    <div class="taskora-p6-empty-icon">
                        🔍
                    </div>
                    <h3>No matching tasks found</h3>
                    <p>
                        Try another search or change your filters.
                    </p>
                </div>
            `;
            return;
        }
        resultsContainer.innerHTML =
            tasks.map(task => {
                const tags =
                    Array.isArray(task.tags)
                        ? task.tags.join(", ")
                        : "";
                return `
                    <article
                        class="taskora-p6-result-card">
                        <h4>
                            ${escapeHTML(task.title || "Untitled Task")}
                        </h4>
                        <div
                            class="taskora-p6-result-description">
                            ${escapeHTML(
                    task.description || "No description"
                )}
                        </div>
                        <div class="taskora-p6-meta">
                            <span>
                                ${escapeHTML(
                    task.category || "Other"
                )}
                            </span>
                            <span>
                                ${escapeHTML(
                    task.priority || "Medium"
                )}
                            </span>
                            <span>
                                ${task.completed
                        ? "Completed"
                        : "Pending"
                    }
                            </span>
                            ${task.dueDate
                        ? `<span>${escapeHTML(task.dueDate)}</span>`
                        : ""
                    }
                            ${tags
                        ? `<span>${escapeHTML(tags)}</span>`
                        : ""
                    }
                        </div>
                    </article>
                `;
            }).join("");
    }
    function renderActiveFilters() {
        const filters = [];
        if (categoryFilter.value !== "all") {
            filters.push(categoryFilter.value);
        }
        if (priorityFilter.value !== "all") {
            filters.push(priorityFilter.value);
        }
        if (statusFilter.value !== "all") {
            filters.push(statusFilter.value);
        }
        activeFilters.innerHTML =
            filters.map(filter =>
                `<span class="taskora-p6-active-filter">
                    ${escapeHTML(filter)}
                </span>`
            ).join("");
    }
    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
    searchInput.addEventListener(
        "input",
        filterTasks
    );
    categoryFilter.addEventListener(
        "change",
        filterTasks
    );
    priorityFilter.addEventListener(
        "change",
        filterTasks
    );
    statusFilter.addEventListener(
        "change",
        filterTasks
    );
    sortFilter.addEventListener(
        "change",
        filterTasks
    );
    document
        .querySelectorAll(
            "#taskoraP6Suggestions button"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    searchInput.value =
                        button.dataset.search || "";
                    filterTasks();
                }
            );
        });
    clearButton.addEventListener(
        "click",
        () => {
            searchInput.value = "";
            categoryFilter.value = "all";
            priorityFilter.value = "all";
            statusFilter.value = "all";
            sortFilter.value = "default";
            filterTasks();
        }
    );
    window.addEventListener(
        "storage",
        () => {
            populateCategories();
            filterTasks();
        }
    );
    populateCategories();
    filterTasks();
})();
/* =========================================
   TASKORA PHASE 7
   NOTIFICATIONS + REMINDERS
========================================= */
(function () {
    "use strict";
    const NOTIFICATION_KEY =
        "taskora_notifications";
    const TASK_KEY =
        "taskora_tasks";
    const notificationList =
        document.getElementById(
            "taskoraP7NotificationList"
        );
    const markAllRead =
        document.getElementById(
            "taskoraP7MarkAllRead"
        );
    const notificationBadge =
        document.getElementById(
            "notificationBadge"
        );
    if (!notificationList) {
        return;
    }
    function getNotifications() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(
                        NOTIFICATION_KEY
                    )
                );
            return Array.isArray(data)
                ? data
                : [];
        } catch (error) {
            return [];
        }
    }
    function saveNotifications(notifications) {
        localStorage.setItem(
            NOTIFICATION_KEY,
            JSON.stringify(notifications)
        );
    }
    function getTasks() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(
                        TASK_KEY
                    )
                );
            return Array.isArray(data)
                ? data
                : [];
        } catch (error) {
            return [];
        }
    }
    function escapeHTML(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
    function updateBadge() {
        if (!notificationBadge) {
            return;
        }
        const notifications =
            getNotifications();
        const unread =
            notifications.filter(
                notification =>
                    !notification.read
            ).length;
        if (unread > 0) {
            notificationBadge.textContent =
                unread > 99
                    ? "99+"
                    : unread;
            notificationBadge.style.display =
                "flex";
        } else {
            notificationBadge.textContent = "";
            notificationBadge.style.display =
                "none";
        }
    }
    function getIcon(type) {
        const icons = {
            reminder: "⏰",
            upcoming: "📅",
            overdue: "⚠️",
            completion: "🎉",
            draft: "📝",
            suggestion: "💡",
            system: "🔔"
        };
        return icons[type] || "🔔";
    }
    function formatTime(timestamp) {
        if (!timestamp) {
            return "";
        }
        const date =
            new Date(timestamp);
        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    }
    function renderNotifications(
        filter = "all"
    ) {
        let notifications =
            getNotifications();
        if (filter === "unread") {
            notifications =
                notifications.filter(
                    notification =>
                        !notification.read
                );
        }
        if (filter === "today") {
            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];
            notifications =
                notifications.filter(
                    notification =>
                        String(
                            notification.createdAt
                        ).startsWith(today)
                );
        }
        notifications.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
        if (!notifications.length) {
            notificationList.innerHTML = `
                <div class="taskora-p7-empty">
                    <div class="taskora-p7-empty-icon">
                        🔔
                    </div>
                    <h3>
                        You have no notifications currently.
                    </h3>
                    <p>
                        Task reminders and important updates
                        will appear here.
                    </p>
                </div>
            `;
            updateBadge();
            return;
        }
        notificationList.innerHTML =
            notifications.map(notification => {
                return `
                    <article
                        class="taskora-p7-notification
                        ${notification.read ? "" : "unread"}">
                        <div class="taskora-p7-notification-icon">
                            ${getIcon(notification.type)}
                        </div>
                        <div
                            class="taskora-p7-notification-content">
                            <h4>
                                ${escapeHTML(
                    notification.title
                )}
                            </h4>
                            <p>
                                ${escapeHTML(
                    notification.message
                )}
                            </p>
                            <span class="taskora-p7-time">
                                ${formatTime(
                    notification.createdAt
                )}
                            </span>
                            <div
                                class="taskora-p7-actions">
                                ${!notification.read
                        ? `
                                        <button
                                            type="button"
                                            data-action="read"
                                            data-id="${notification.id}">
                                            Mark as read
                                        </button>
                                        `
                        : ""
                    }
                                ${notification.taskId
                        ? `
                                        <button
                                            type="button"
                                            data-action="view"
                                            data-task-id="${notification.taskId}">
                                            View
                                        </button>
                                        `
                        : ""
                    }
                                <button
                                    type="button"
                                    data-action="dismiss"
                                    data-id="${notification.id}">
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");
        updateBadge();
    }
    function createNotification(
        type,
        title,
        message,
        taskId = null
    ) {
        const notifications =
            getNotifications();
        const notification = {
            id:
                "notification-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 8),
            type,
            title,
            message,
            createdAt:
                new Date().toISOString(),
            read: false,
            taskId,
            actions: []
        };
        notifications.unshift(
            notification
        );
        /* Keep notification history manageable */
        const limited =
            notifications.slice(0, 100);
        saveNotifications(limited);
        renderNotifications();
    }
    function checkTaskReminders() {
        const tasks =
            getTasks();
        if (!tasks.length) {
            return;
        }
        const today =
            new Date()
                .toISOString()
                .split("T")[0];
        tasks.forEach(task => {
            if (
                !task.dueDate ||
                task.completed
            ) {
                return;
            }
            if (task.dueDate < today) {
                const notifications =
                    getNotifications();
                const alreadyExists =
                    notifications.some(
                        notification =>
                            notification.taskId === task.id &&
                            notification.type === "overdue"
                    );
                if (!alreadyExists) {
                    createNotification(
                        "overdue",
                        "Task Overdue",
                        `"${task.title}" is overdue.`,
                        task.id
                    );
                }
                return;
            }
            if (task.dueDate === today) {
                const notifications =
                    getNotifications();
                const alreadyExists =
                    notifications.some(
                        notification =>
                            notification.taskId === task.id &&
                            notification.type === "reminder" &&
                            String(
                                notification.createdAt
                            ).startsWith(today)
                    );
                if (!alreadyExists) {
                    createNotification(
                        "reminder",
                        "Task Due Today",
                        `"${task.title}" is scheduled for today.`,
                        task.id
                    );
                }
            }
        });
    }
    markAllRead?.addEventListener(
        "click",
        () => {
            const notifications =
                getNotifications();
            notifications.forEach(
                notification => {
                    notification.read = true;
                }
            );
            saveNotifications(
                notifications
            );
            renderNotifications();
        }
    );
    document.addEventListener(
        "click",
        event => {
            const actionButton =
                event.target.closest(
                    "[data-action]"
                );
            if (!actionButton) {
                return;
            }
            const action =
                actionButton.dataset.action;
            const id =
                actionButton.dataset.id;
            if (action === "read") {
                const notifications =
                    getNotifications();
                const notification =
                    notifications.find(
                        item =>
                            item.id === id
                    );
                if (notification) {
                    notification.read = true;
                }
                saveNotifications(
                    notifications
                );
                renderNotifications();
            }
            if (action === "dismiss") {
                const notifications =
                    getNotifications();
                const updated =
                    notifications.filter(
                        item =>
                            item.id !== id
                    );
                saveNotifications(
                    updated
                );
                renderNotifications();
            }
            if (action === "view") {
                const taskId =
                    actionButton.dataset.taskId;
                const tasks =
                    getTasks();
                const task =
                    tasks.find(
                        item =>
                            item.id === taskId
                    );
                if (task) {
                    document.dispatchEvent(
                        new CustomEvent(
                            "taskora:open-task",
                            {
                                detail: task
                            }
                        )
                    );
                }
            }
        }
    );
    document
        .querySelectorAll(
            ".taskora-p7-tab"
        )
        .forEach(tab => {
            tab.addEventListener(
                "click",
                () => {
                    document
                        .querySelectorAll(
                            ".taskora-p7-tab"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );
                    tab.classList.add(
                        "active"
                    );
                    renderNotifications(
                        tab.dataset.notificationFilter
                    );
                }
            );
        });
    document.addEventListener(
        "taskora:task-completed",
        event => {
            const task =
                event.detail;
            if (!task) {
                return;
            }
            createNotification(
                "completion",
                "Task Completed 🎉",
                `"${task.title}" has been completed.`,
                task.id
            );
        }
    );
    renderNotifications();
    updateBadge();
    checkTaskReminders();
    setInterval(
        checkTaskReminders,
        60000
    );
})();

/* =========================================================
   TASKORA PHASE 8 + 9
   RECYCLE BIN + UNDO/REDO + HISTORY
   PROFILE + SETTINGS + BACKUP
   ========================================================= */
(function initTaskoraPhase89() {
    if (window.taskoraPhase89Initialized) return;
    window.taskoraPhase89Initialized = true;
    const STORAGE = {
        tasks: "taskora_tasks",
        recycle: "taskora_recycle_bin",
        history: "taskora_history",
        settings: "taskora_settings",
        profile: "taskora_user"
    };
    /* ---------------------------------------------------------
       SAFE STORAGE
       --------------------------------------------------------- */
    function getData(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch {
            return fallback;
        }
    }
    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch {
            showPhase89Toast("Unable to save data.");
            return false;
        }
    }
    /* ---------------------------------------------------------
       TASK DATA
       --------------------------------------------------------- */
    function getTasks() {
        return getData(STORAGE.tasks, []);
    }
    function saveTasks(tasks) {
        saveData(STORAGE.tasks, tasks);
    }
    /* ---------------------------------------------------------
       RECYCLE BIN
       --------------------------------------------------------- */
    function getRecycleBin() {
        return getData(STORAGE.recycle, []);
    }
    function saveRecycleBin(items) {
        saveData(STORAGE.recycle, items);
    }
    function moveTaskToRecycle(taskId) {
        const tasks = getTasks();
        const index = tasks.findIndex(task => String(task.id) === String(taskId));
        if (index === -1) {
            showPhase89Toast("Task not found.");
            return;
        }
        const task = tasks[index];
        const now = Date.now();
        const deletedTask = {
            originalTask: task,
            deletedAt: now,
            expiryAt: now + (60 * 24 * 60 * 60 * 1000)
        };
        const recycle = getRecycleBin();
        recycle.push(deletedTask);
        tasks.splice(index, 1);
        saveTasks(tasks);
        saveRecycleBin(recycle);
        addPhase89History(
            "Task deleted",
            task.title || "Untitled task"
        );
        showPhase89Toast("Task moved to Recycle Bin.");
        refreshTaskoraUI();
    }
    function restoreRecycleTask(index) {
        const recycle = getRecycleBin();
        if (!recycle[index]) return;
        const item = recycle[index];
        const tasks = getTasks();
        tasks.push(item.originalTask);
        recycle.splice(index, 1);
        saveTasks(tasks);
        saveRecycleBin(recycle);
        addPhase89History(
            "Task restored",
            item.originalTask?.title || "Task"
        );
        showPhase89Toast("Task restored.");
        renderRecycleBin();
        refreshTaskoraUI();
    }
    function permanentlyDeleteRecycleTask(index) {
        const recycle = getRecycleBin();
        if (!recycle[index]) return;
        const title =
            recycle[index].originalTask?.title || "Task";
        if (!confirm(`Permanently delete "${title}"?`)) {
            return;
        }
        recycle.splice(index, 1);
        saveRecycleBin(recycle);
        addPhase89History(
            "Task permanently deleted",
            title
        );
        showPhase89Toast("Task permanently deleted.");
        renderRecycleBin();
    }
    function cleanExpiredRecycleItems() {
        const recycle = getRecycleBin();
        const now = Date.now();
        const validItems = recycle.filter(
            item => !item.expiryAt || item.expiryAt > now
        );
        if (validItems.length !== recycle.length) {
            saveRecycleBin(validItems);
        }
    }
    /* ---------------------------------------------------------
       HISTORY
       --------------------------------------------------------- */
    function getHistory() {
        return getData(STORAGE.history, {
            undo: [],
            redo: [],
            actions: []
        });
    }
    function saveHistory(history) {
        saveData(STORAGE.history, history);
    }
    function addPhase89History(action, details = "") {
        const history = getHistory();
        history.actions.unshift({
            id: Date.now(),
            action,
            details,
            timestamp: Date.now()
        });
        if (history.actions.length > 50) {
            history.actions = history.actions.slice(0, 50);
        }
        saveHistory(history);
    }
    function clearRedoAfterNewAction() {
        const history = getHistory();
        history.redo = [];
        saveHistory(history);
    }
    function pushUndoState(label, previousTasks) {
        const history = getHistory();
        history.undo.push({
            label,
            tasks: previousTasks,
            timestamp: Date.now()
        });
        if (history.undo.length > 30) {
            history.undo.shift();
        }
        history.redo = [];
        saveHistory(history);
    }
    function undoTaskoraAction() {
        const history = getHistory();
        if (!history.undo.length) {
            showPhase89Toast("Nothing to undo.");
            return;
        }
        const currentTasks = getTasks();
        const previousState =
            history.undo.pop();
        history.redo.push({
            label: previousState.label,
            tasks: currentTasks,
            timestamp: Date.now()
        });
        saveTasks(previousState.tasks);
        saveHistory(history);
        addPhase89History(
            "Undo",
            previousState.label
        );
        showPhase89Toast("Action undone.");
        refreshTaskoraUI();
    }
    function redoTaskoraAction() {
        const history = getHistory();
        if (!history.redo.length) {
            showPhase89Toast("Nothing to redo.");
            return;
        }
        const currentTasks = getTasks();
        const nextState =
            history.redo.pop();
        history.undo.push({
            label: nextState.label,
            tasks: currentTasks,
            timestamp: Date.now()
        });
        saveTasks(nextState.tasks);
        saveHistory(history);
        addPhase89History(
            "Redo",
            nextState.label
        );
        showPhase89Toast("Action redone.");
        refreshTaskoraUI();
    }
    /* ---------------------------------------------------------
       TOOLS PANEL
       --------------------------------------------------------- */
    function createToolsPanel() {
        if (document.getElementById("taskoraToolsPanel")) {
            return;
        }
        const panel = document.createElement("div");
        panel.id = "taskoraToolsPanel";
        panel.className = "taskora-tools-panel";
        panel.innerHTML = `
            <div class="taskora-tools-title">
                Taskora Tools
            </div>
            <button class="taskora-tool-btn"
                data-tool="recycle">
                <span class="taskora-tool-icon">♻️</span>
                <span>Recycle Bin</span>
            </button>
            <button class="taskora-tool-btn"
                data-tool="undo">
                <span class="taskora-tool-icon">↶</span>
                <span>Undo</span>
            </button>
            <button class="taskora-tool-btn"
                data-tool="redo">
                <span class="taskora-tool-icon">↷</span>
                <span>Redo</span>
            </button>
            <button class="taskora-tool-btn"
                data-tool="history">
                <span class="taskora-tool-icon">📜</span>
                <span>Action History</span>
            </button>
            <button class="taskora-tool-btn"
                data-tool="profile">
                <span class="taskora-tool-icon">👤</span>
                <span>Profile</span>
            </button>
            <button class="taskora-tool-btn"
                data-tool="settings">
                <span class="taskora-tool-icon">⚙️</span>
                <span>Settings</span>
            </button>
            <button class="taskora-tool-btn"
                data-tool="backup">
                <span class="taskora-tool-icon">💾</span>
                <span>Backup & Restore</span>
            </button>
        `;
        document.body.appendChild(panel);
        panel.addEventListener("click", event => {
            const button =
                event.target.closest("[data-tool]");
            if (!button) return;
            const tool = button.dataset.tool;
            panel.classList.remove("active");
            if (tool === "recycle") {
                openTaskoraModal(
                    "♻️ Recycle Bin",
                    renderRecycleBin()
                );
            }
            if (tool === "undo") {
                undoTaskoraAction();
            }
            if (tool === "redo") {
                redoTaskoraAction();
            }
            if (tool === "history") {
                openTaskoraModal(
                    "📜 Action History",
                    renderHistory()
                );
            }
            if (tool === "profile") {
                openTaskoraModal(
                    "👤 Profile",
                    renderProfile()
                );
            }
            if (tool === "settings") {
                openTaskoraModal(
                    "⚙️ Settings",
                    renderSettings()
                );
            }
            if (tool === "backup") {
                openTaskoraModal(
                    "💾 Backup & Restore",
                    renderBackup()
                );
            }
        });
    }
    /* ---------------------------------------------------------
       FIND EXISTING SIDEBAR
       --------------------------------------------------------- */
    function connectToolsToSidebar() {
        createToolsPanel();
        const trigger =
            document.getElementById("taskoraToolsTrigger");
        const panel =
            document.getElementById("taskoraToolsPanel");
        if (!trigger || !panel) return;
        if (trigger.dataset.connected === "true") {
            return;
        }
        trigger.dataset.connected = "true";
        trigger.addEventListener("click", event => {
            event.stopPropagation();
            panel.classList.toggle("active");
        });
        document.addEventListener("click", event => {
            if (
                !panel.contains(event.target) &&
                !trigger.contains(event.target)
            ) {
                panel.classList.remove("active");
            }
        });
    }
    /* ---------------------------------------------------------
       MODAL
       --------------------------------------------------------- */
    function createModal() {
        if (document.getElementById("taskoraPhase89Modal")) {
            return;
        }
        const overlay =
            document.createElement("div");
        overlay.id = "taskoraPhase89Modal";
        overlay.className = "taskora-modal-overlay";
        overlay.innerHTML = `
            <div class="taskora-modal">
                <div class="taskora-modal-header">
                    <h2 id="taskoraModalTitle">
                        Taskora
                    </h2>
                    <button
                        class="taskora-close"
                        id="taskoraModalClose"
                        aria-label="Close">
                        ×
                    </button>
                </div>
                <div id="taskoraModalBody"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        document
            .getElementById("taskoraModalClose")
            .addEventListener("click", closeTaskoraModal);
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeTaskoraModal();
            }
        });
    }
    function openTaskoraModal(title, content) {
        createModal();
        const overlay =
            document.getElementById("taskoraPhase89Modal");
        document.getElementById(
            "taskoraModalTitle"
        ).textContent = title;
        const body =
            document.getElementById("taskoraModalBody");
        if (typeof content === "string") {
            body.innerHTML = content;
        } else {
            body.innerHTML = "";
            body.appendChild(content);
        }
        overlay.classList.add("active");
    }
    function closeTaskoraModal() {
        const modal =
            document.getElementById("taskoraPhase89Modal");
        if (modal) {
            modal.classList.remove("active");
        }
    }
    /* ---------------------------------------------------------
       RECYCLE BIN UI
       --------------------------------------------------------- */
    function renderRecycleBin() {
        const wrapper =
            document.createElement("div");
        cleanExpiredRecycleItems();
        const recycle = getRecycleBin();
        if (!recycle.length) {
            wrapper.innerHTML = `
                <div style="
                    text-align:center;
                    padding:35px 15px;
                    opacity:.7;
                ">
                    <div style="font-size:42px;">♻️</div>
                    <h3>Your recycle bin is empty.</h3>
                    <p>
                        Deleted tasks will appear here.
                    </p>
                </div>
            `;
            return wrapper;
        }
        recycle.forEach((item, index) => {
            const task =
                item.originalTask || {};
            const element =
                document.createElement("div");
            element.className =
                "taskora-recycle-item";
            const deletedDate =
                item.deletedAt
                    ? new Date(item.deletedAt)
                        .toLocaleDateString()
                    : "Unknown";
            element.innerHTML = `
                <div class="taskora-recycle-info">
                    <div class="taskora-recycle-title">
                        ${escapeTaskoraHTML(
                task.title || "Untitled task"
            )}
                    </div>
                    <div class="taskora-recycle-meta">
                        ${task.priority || "No priority"}
                        · Deleted ${deletedDate}
                    </div>
                </div>
                <div class="taskora-recycle-actions">
                    <button
                        class="taskora-small-btn
                        taskora-restore-btn"
                        data-restore="${index}">
                        Restore
                    </button>
                    <button
                        class="taskora-small-btn
                        taskora-permanent-btn"
                        data-permanent="${index}">
                        Delete
                    </button>
                </div>
            `;
            wrapper.appendChild(element);
        });
        wrapper.addEventListener("click", event => {
            const restore =
                event.target.closest("[data-restore]");
            const permanent =
                event.target.closest("[data-permanent]");
            if (restore) {
                restoreRecycleTask(
                    Number(restore.dataset.restore)
                );
            }
            if (permanent) {
                permanentlyDeleteRecycleTask(
                    Number(permanent.dataset.permanent)
                );
            }
        });
        return wrapper;
    }
    /* ---------------------------------------------------------
       HISTORY UI
       --------------------------------------------------------- */
    function renderHistory() {
        const wrapper =
            document.createElement("div");
        const history =
            getHistory().actions;
        if (!history.length) {
            wrapper.innerHTML = `
                <div style="
                    text-align:center;
                    padding:35px;
                    opacity:.7;
                ">
                    <div style="font-size:40px;">📜</div>
                    <h3>No action history yet.</h3>
                </div>
            `;
            return wrapper;
        }
        history.forEach(item => {
            const element =
                document.createElement("div");
            element.className =
                "taskora-history-item";
            element.innerHTML = `
                <div class="taskora-history-action">
                    ${escapeTaskoraHTML(item.action)}
                </div>
                <div class="taskora-history-time">
                    ${escapeTaskoraHTML(item.details || "")}
                    ·
                    ${new Date(item.timestamp)
                    .toLocaleString()}
                </div>
            `;
            wrapper.appendChild(element);
        });
        return wrapper;
    }
    /* ---------------------------------------------------------
       PROFILE
       --------------------------------------------------------- */
    function getProfile() {
        return getData(STORAGE.profile, {
            name: "Alex",
            password: "",
            slogan: "Plan better. Focus smarter. Get things done.",
            photo: ""
        });
    }
    function renderProfile() {
        const profile =
            getProfile();
        const tasks =
            getTasks();
        const completed =
            tasks.filter(task => task.completed).length;
        const avatar =
            profile.photo
                ? `<img src="${escapeTaskoraAttribute(profile.photo)}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:50%;
                    "
                    alt="Profile photo">`
                : escapeTaskoraHTML(
                    (profile.name || "A").charAt(0).toUpperCase()
                );
        const wrapper =
            document.createElement("div");
        wrapper.innerHTML = `
            <div class="taskora-profile-card">
                <div class="taskora-profile-avatar">
                    ${avatar}
                </div>
                <div class="taskora-profile-name">
                    ${escapeTaskoraHTML(
            profile.name || "Alex"
        )}
                </div>
                <div class="taskora-profile-slogan">
                    ${escapeTaskoraHTML(
            profile.slogan || ""
        )}
                </div>
                <div class="taskora-profile-stats">
                    <div class="taskora-profile-stat">
                        <strong>${tasks.length}</strong>
                        <span>Total Tasks</span>
                    </div>
                    <div class="taskora-profile-stat">
                        <strong>${completed}</strong>
                        <span>Completed</span>
                    </div>
                    <div class="taskora-profile-stat">
                        <strong>${tasks.length
                ? Math.round(
                    completed /
                    tasks.length *
                    100
                )
                : 0
            }%</strong>
                        <span>Progress</span>
                    </div>
                </div>
                <button
                    class="taskora-small-btn"
                    id="taskoraEditProfile"
                    style="
                        margin-top:20px;
                        width:100%;
                    ">
                    Edit Profile
                </button>
            </div>
        `;
        wrapper
            .querySelector("#taskoraEditProfile")
            .addEventListener("click", () => {
                renderProfileEdit();
            });
        return wrapper;
    }
    function renderProfileEdit() {
        const profile =
            getProfile();
        const wrapper =
            document.createElement("div");
        wrapper.innerHTML = `
            <div class="taskora-setting-group">
                <div class="taskora-setting-label">
                    Name
                </div>
                <input
                    id="taskoraProfileName"
                    class="taskora-setting-input"
                    style="width:100%;margin-top:7px;"
                    value="${escapeTaskoraAttribute(
            profile.name || ""
        )}">
            </div>
            <div class="taskora-setting-group">
                <div class="taskora-setting-label">
                    Slogan
                </div>
                <input
                    id="taskoraProfileSlogan"
                    class="taskora-setting-input"
                    style="width:100%;margin-top:7px;"
                    value="${escapeTaskoraAttribute(
            profile.slogan || ""
        )}">
            </div>
            <div class="taskora-setting-group">
                <div class="taskora-setting-label">
                    Password
                </div>
                <input
                    type="password"
                    id="taskoraProfilePassword"
                    class="taskora-setting-input"
                    style="width:100%;margin-top:7px;"
                    placeholder="Enter new password"
                    value="${escapeTaskoraAttribute(
            profile.password || ""
        )}">
            </div>
            <button
                id="taskoraSaveProfile"
                class="taskora-small-btn"
                style="width:100%;">
                Save Profile
            </button>
        `;
        openTaskoraModal(
            "✏️ Edit Profile",
            wrapper
        );
        wrapper
            .querySelector("#taskoraSaveProfile")
            .addEventListener("click", () => {
                const updatedProfile = {
                    name:
                        wrapper
                            .querySelector(
                                "#taskoraProfileName"
                            )
                            .value.trim()
                        || "Alex",
                    slogan:
                        wrapper
                            .querySelector(
                                "#taskoraProfileSlogan"
                            )
                            .value.trim(),
                    password:
                        wrapper
                            .querySelector(
                                "#taskoraProfilePassword"
                            )
                            .value,
                    photo:
                        profile.photo || ""
                };
                saveData(
                    STORAGE.profile,
                    updatedProfile
                );
                addPhase89History(
                    "Profile updated"
                );
                showPhase89Toast(
                    "Profile updated successfully."
                );
                closeTaskoraModal();
                refreshTaskoraUI();
            });
    }
    /* ---------------------------------------------------------
       SETTINGS
       --------------------------------------------------------- */
    function getSettings() {
        return getData(STORAGE.settings, {
            defaultPriority: "Medium",
            defaultCategory: "Personal",
            startOfWeek: "Monday",
            notifications: true,
            reminders: true,
            reducedMotion: false
        });
    }
    function renderSettings() {
        const settings =
            getSettings();
        const wrapper =
            document.createElement("div");
        wrapper.innerHTML = `
            <div class="taskora-setting-group">
                <div class="taskora-setting-row">
                    <div>
                        <div class="taskora-setting-label">
                            Notifications
                        </div>
                        <span class="taskora-setting-description">
                            Enable Taskora notifications
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        id="taskoraSettingNotifications"
                        ${settings.notifications ? "checked" : ""}
                    >
                </div>
                <div class="taskora-setting-row">
                    <div>
                        <div class="taskora-setting-label">
                            Reminders
                        </div>
                        <span class="taskora-setting-description">
                            Allow task reminder features
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        id="taskoraSettingReminders"
                        ${settings.reminders ? "checked" : ""}
                    >
                </div>
            </div>
            <div class="taskora-setting-group">
                <div class="taskora-setting-row">
                    <div>
                        <div class="taskora-setting-label">
                            Default Priority
                        </div>
                    </div>
                    <select
                        id="taskoraDefaultPriority"
                        class="taskora-setting-select">
                        <option ${settings.defaultPriority === "Urgent"
                ? "selected" : ""
            }>Urgent</option>
                        <option ${settings.defaultPriority === "High"
                ? "selected" : ""
            }>High</option>
                        <option ${settings.defaultPriority === "Medium"
                ? "selected" : ""
            }>Medium</option>
                        <option ${settings.defaultPriority === "Low"
                ? "selected" : ""
            }>Low</option>
                    </select>
                </div>
            </div>
            <div class="taskora-setting-group">
                <div class="taskora-setting-row">
                    <div>
                        <div class="taskora-setting-label">
                            Start of Week
                        </div>
                    </div>
                    <select
                        id="taskoraStartWeek"
                        class="taskora-setting-select">
                        <option ${settings.startOfWeek === "Monday"
                ? "selected" : ""
            }>Monday</option>
                        <option ${settings.startOfWeek === "Sunday"
                ? "selected" : ""
            }>Sunday</option>
                    </select>
                </div>
            </div>
            <div class="taskora-setting-group">
                <div class="taskora-setting-row">
                    <div>
                        <div class="taskora-setting-label">
                            Reduced Motion
                        </div>
                        <span class="taskora-setting-description">
                            Reduce animations
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        id="taskoraReducedMotion"
                        ${settings.reducedMotion ? "checked" : ""}
                    >
                </div>
            </div>
            <button
                id="taskoraSaveSettings"
                class="taskora-small-btn"
                style="width:100%;">
                Save Settings
            </button>
        `;
        wrapper
            .querySelector("#taskoraSaveSettings")
            .addEventListener("click", () => {
                const updatedSettings = {
                    ...getSettings(),
                    notifications:
                        wrapper
                            .querySelector(
                                "#taskoraSettingNotifications"
                            )
                            .checked,
                    reminders:
                        wrapper
                            .querySelector(
                                "#taskoraSettingReminders"
                            )
                            .checked,
                    defaultPriority:
                        wrapper
                            .querySelector(
                                "#taskoraDefaultPriority"
                            )
                            .value,
                    startOfWeek:
                        wrapper
                            .querySelector(
                                "#taskoraStartWeek"
                            )
                            .value,
                    reducedMotion:
                        wrapper
                            .querySelector(
                                "#taskoraReducedMotion"
                            )
                            .checked
                };
                saveData(
                    STORAGE.settings,
                    updatedSettings
                );
                addPhase89History(
                    "Settings updated"
                );
                showPhase89Toast(
                    "Settings saved."
                );
                closeTaskoraModal();
            });
        return wrapper;
    }
    /* ---------------------------------------------------------
       BACKUP / RESTORE
       --------------------------------------------------------- */
    function renderBackup() {
        const wrapper =
            document.createElement("div");
        wrapper.innerHTML = `
            <div class="taskora-setting-group">
                <div class="taskora-setting-label">
                    Export Taskora Data
                </div>
                <span class="taskora-setting-description">
                    Download your tasks, profile,
                    settings and other stored data.
                </span>
                <button
                    id="taskoraExportData"
                    class="taskora-small-btn"
                    style="margin-top:12px;">
                    Export Backup
                </button>
            </div>
            <div class="taskora-setting-group">
                <div class="taskora-setting-label">
                    Restore Backup
                </div>
                <span class="taskora-setting-description">
                    Restore a previously exported Taskora backup.
                </span>
                <input
                    type="file"
                    id="taskoraImportFile"
                    accept=".json"
                    style="margin-top:12px;width:100%;">
            </div>
        `;
        wrapper
            .querySelector("#taskoraExportData")
            .addEventListener(
                "click",
                exportTaskoraData
            );
        wrapper
            .querySelector("#taskoraImportFile")
            .addEventListener(
                "change",
                importTaskoraData
            );
        return wrapper;
    }
    function exportTaskoraData() {
        const backup = {
            version: 1,
            exportedAt:
                new Date().toISOString(),
            data: {
                tasks:
                    getData(STORAGE.tasks, []),
                recycleBin:
                    getData(STORAGE.recycle, []),
                history:
                    getData(STORAGE.history, {
                        undo: [],
                        redo: [],
                        actions: []
                    }),
                settings:
                    getData(STORAGE.settings, {}),
                profile:
                    getData(STORAGE.profile, {}),
                lists:
                    getData(
                        "taskora_lists",
                        []
                    ),
                categories:
                    getData(
                        "taskora_categories",
                        []
                    ),
                notifications:
                    getData(
                        "taskora_notifications",
                        []
                    ),
                focus:
                    getData(
                        "taskora_focus",
                        []
                    )
            }
        };
        const blob =
            new Blob(
                [
                    JSON.stringify(
                        backup,
                        null,
                        2
                    )
                ],
                {
                    type: "application/json"
                }
            );
        const url =
            URL.createObjectURL(blob);
        const link =
            document.createElement("a");
        link.href = url;
        link.download =
            `taskora-backup-${new Date()
                .toISOString()
                .slice(0, 10)
            }.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        addPhase89History(
            "Backup exported"
        );
        showPhase89Toast(
            "Backup exported successfully."
        );
    }
    function importTaskoraData(event) {
        const file =
            event.target.files[0];
        if (!file) return;
        const reader =
            new FileReader();
        reader.onload = function () {
            try {
                const backup =
                    JSON.parse(
                        reader.result
                    );
                if (
                    !backup.data ||
                    !backup.version
                ) {
                    throw new Error(
                        "Invalid backup"
                    );
                }
                if (
                    !confirm(
                        "Restore this backup? Existing stored data may be replaced."
                    )
                ) {
                    return;
                }
                const data =
                    backup.data;
                if (data.tasks)
                    saveData(
                        STORAGE.tasks,
                        data.tasks
                    );
                if (data.recycleBin)
                    saveData(
                        STORAGE.recycle,
                        data.recycleBin
                    );
                if (data.history)
                    saveData(
                        STORAGE.history,
                        data.history
                    );
                if (data.settings)
                    saveData(
                        STORAGE.settings,
                        data.settings
                    );
                if (data.profile)
                    saveData(
                        STORAGE.profile,
                        data.profile
                    );
                if (data.lists)
                    saveData(
                        "taskora_lists",
                        data.lists
                    );
                if (data.categories)
                    saveData(
                        "taskora_categories",
                        data.categories
                    );
                if (data.notifications)
                    saveData(
                        "taskora_notifications",
                        data.notifications
                    );
                if (data.focus)
                    saveData(
                        "taskora_focus",
                        data.focus
                    );
                addPhase89History(
                    "Backup restored"
                );
                showPhase89Toast(
                    "Backup restored successfully."
                );
                setTimeout(() => {
                    location.reload();
                }, 700);
            } catch {
                showPhase89Toast(
                    "Invalid Taskora backup file."
                );
            }
        };
        reader.readAsText(file);
    }
    /* ---------------------------------------------------------
       TOAST
       --------------------------------------------------------- */
    function showPhase89Toast(message) {
        let toast =
            document.getElementById(
                "taskoraPhase89Toast"
            );
        if (!toast) {
            toast =
                document.createElement("div");
            toast.id =
                "taskoraPhase89Toast";
            toast.className =
                "taskora-phase-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(
            window.taskoraPhase89ToastTimer
        );
        window.taskoraPhase89ToastTimer =
            setTimeout(() => {
                toast.classList.remove("show");
            }, 2600);
    }
    /* ---------------------------------------------------------
       HELPERS
       --------------------------------------------------------- */
    function escapeTaskoraHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function escapeTaskoraAttribute(value) {
        return escapeTaskoraHTML(value);
    }
    function refreshTaskoraUI() {
        document.dispatchEvent(
            new CustomEvent(
                "taskora:dataUpdated"
            )
        );
    }
    /* ---------------------------------------------------------
       INITIALIZATION
       --------------------------------------------------------- */
    function initializePhase89() {
        cleanExpiredRecycleItems();
        createModal();
        connectToolsToSidebar();
        setTimeout(
            connectToolsToSidebar,
            300
        );
        setTimeout(
            connectToolsToSidebar,
            1000
        );
    }
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializePhase89,
            { once: true }
        );
    } else {
        initializePhase89();
    }
})();
/* =========================================
   PHASE 10 — FINAL POLISH
   ========================================= */
(function initTaskoraFinalPolish() {
    "use strict";
    /* Prevent duplicate initialization */
    if (window.taskoraFinalPolishInitialized) {
        return;
    }
    window.taskoraFinalPolishInitialized = true;
    const $ = (selector, parent = document) =>
        parent.querySelector(selector);
    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];
    /* =========================================
       SCROLL TO TOP
       ========================================= */
    const scrollTopBtn = $("#scroll-top-btn");
    if (scrollTopBtn) {
        const updateScrollButton = () => {
            scrollTopBtn.classList.toggle(
                "visible",
                window.scrollY > 350
            );
        };
        window.addEventListener(
            "scroll",
            updateScrollButton,
            { passive: true }
        );
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
        updateScrollButton();
    }
    /* =========================================
       CONFIRMATION MODAL
       ========================================= */
    const confirmModal = $("#confirm-modal");
    const confirmTitle = $("#confirm-title");
    const confirmMessage = $("#confirm-message");
    const confirmAction = $("#confirm-action");
    const confirmCancel = $("#confirm-cancel");
    const confirmClose = $("#confirm-close");
    let confirmCallback = null;
    function closeConfirmModal() {
        if (!confirmModal) return;
        confirmModal.classList.remove("active");
        confirmModal.setAttribute("aria-hidden", "true");
        confirmCallback = null;
    }
    function openConfirmModal({
        title = "Are you sure?",
        message = "This action cannot be undone.",
        actionText = "Confirm",
        callback = null
    } = {}) {
        if (!confirmModal) return;
        if (confirmTitle) {
            confirmTitle.textContent = title;
        }
        if (confirmMessage) {
            confirmMessage.textContent = message;
        }
        if (confirmAction) {
            confirmAction.textContent = actionText;
        }
        confirmCallback = callback;
        confirmModal.classList.add("active");
        confirmModal.setAttribute("aria-hidden", "false");
    }
    window.taskoraConfirm = openConfirmModal;
    confirmAction?.addEventListener("click", () => {
        if (typeof confirmCallback === "function") {
            const callback = confirmCallback;
            closeConfirmModal();
            callback();
        } else {
            closeConfirmModal();
        }
    });
    confirmCancel?.addEventListener(
        "click",
        closeConfirmModal
    );
    confirmClose?.addEventListener(
        "click",
        closeConfirmModal
    );
    $$("[data-close-confirm]").forEach(element => {
        element.addEventListener(
            "click",
            closeConfirmModal
        );
    });
    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            confirmModal?.classList.contains("active")
        ) {
            closeConfirmModal();
        }
    });
    /* =========================================
       COMPLETION CELEBRATION
       ========================================= */
    const celebration = $("#completion-celebration");
    let celebrationTimer = null;
    function showTaskCompletionCelebration() {
        if (!celebration) return;
        clearTimeout(celebrationTimer);
        celebration.classList.add("active");
        celebration.setAttribute("aria-hidden", "false");
        celebrationTimer = setTimeout(() => {
            celebration.classList.remove("active");
            celebration.setAttribute("aria-hidden", "true");
        }, 2600);
    }
    window.showTaskCompletionCelebration =
        showTaskCompletionCelebration;
    /* =========================================
       TOAST HELPER
       ========================================= */
    function showFinalToast(
        message,
        type = "success"
    ) {
        const existingContainer =
            $("#toast-container");
        if (!existingContainer) {
            return;
        }
        const toast = document.createElement("div");
        toast.className =
            `toast final-toast ${type}`;
        toast.textContent = message;
        existingContainer.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add("show");
        });
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    window.taskoraFinalToast = showFinalToast;
    /* =========================================
       SAFE CLICK FEEDBACK
       ========================================= */
    document.addEventListener("click", event => {
        const button =
            event.target.closest("button");
        if (!button || button.disabled) {
            return;
        }
        button.classList.add("button-pressed");
        setTimeout(() => {
            button.classList.remove("button-pressed");
        }, 140);
    });
    /* =========================================
       IMAGE FALLBACK
       ========================================= */
    document.addEventListener(
        "error",
        event => {
            const image = event.target;
            if (
                image &&
                image.tagName === "IMG" &&
                !image.dataset.fallbackApplied
            ) {
                image.dataset.fallbackApplied = "true";
                image.style.objectFit = "cover";
                image.src =
                    "data:image/svg+xml," +
                    encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg"
                             width="300"
                             height="200"
                             viewBox="0 0 300 200">
                            <rect width="300"
                                  height="200"
                                  fill="#eee9f8"/>
                            <text x="150"
                                  y="105"
                                  text-anchor="middle"
                                  font-family="Arial"
                                  font-size="16"
                                  fill="#7c6f95">
                                Taskora
                            </text>
                        </svg>
                    `);
            }
        },
        true
    );
    /* =========================================
       ONLINE / OFFLINE FEEDBACK
       ========================================= */
    window.addEventListener("offline", () => {
        showFinalToast(
            "You are offline. Your local data is still available.",
            "warning"
        );
    });
    window.addEventListener("online", () => {
        showFinalToast(
            "You're back online.",
            "success"
        );
    });
    /* =========================================
       SAFE LOCAL STORAGE CHECK
       ========================================= */
    function storageAvailable() {
        try {
            const testKey =
                "__taskora_storage_test__";
            localStorage.setItem(
                testKey,
                "1"
            );
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }
    if (!storageAvailable()) {
        setTimeout(() => {
            showFinalToast(
                "Local storage is unavailable. Some data may not persist.",
                "error"
            );
        }, 800);
    }
    /* =========================================
       IMAGE / CARD ACCESSIBILITY
       ========================================= */
    $$("[data-tooltip]").forEach(element => {
        if (!element.getAttribute("aria-label")) {
            element.setAttribute(
                "aria-label",
                element.dataset.tooltip
            );
        }
    });
})();
/* =========================================================
   TASKORA — MAIN INTEGRATION
   STEP 10 — ADD AT END
========================================================= */
(function initTaskoraMainIntegration() {
    if (window.taskoraMainIntegrationInitialized) return;
    window.taskoraMainIntegrationInitialized = true;
    function getProfileName() {
        try {
            const profile =
                JSON.parse(
                    localStorage.getItem("taskora_user")
                ) || {};
            return profile.name || "Alex";
        } catch {
            return "Alex";
        }
    }
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return "Good morning";
        }
        if (hour >= 12 && hour < 18) {
            return "Good afternoon";
        }
        if (hour >= 18 && hour < 22) {
            return "Good evening";
        }
        return "Hi";
    }
    function updateGreeting() {
        const greeting =
            document.querySelector(
                "#greetingText, .greeting-text"
            );
        if (!greeting) return;
        greeting.textContent =
            `${getGreeting()} ${getProfileName()}`;
    }
    function notify(type, title, message) {
        if (typeof window.taskoraAddNotification === "function") {
            window.taskoraAddNotification({
                type,
                title,
                message
            });
        }
    }
    window.taskoraNotify = notify;
    updateGreeting();
    window.addEventListener("storage", event => {
        if (event.key === "taskora_user") {
            updateGreeting();
        }
    });
})();
/* =========================================================
   TASKORA — GLOBAL SEARCH
   STEP 11 — ADD BELOW STEP 10
========================================================= */
(function initTaskoraGlobalSearch() {
    if (window.taskoraSearchInitialized) return;
    window.taskoraSearchInitialized = true;
    const input =
        document.getElementById("globalSearch");
    if (!input) return;
    const searchWrapper =
        input.closest(".header-search");
    if (!searchWrapper) return;
    let results =
        document.getElementById("taskoraSearchResults");
    if (!results) {
        results = document.createElement("div");
        results.id = "taskoraSearchResults";
        results.className = "taskora-search-results";
        searchWrapper.appendChild(results);
    }
    function getTasks() {
        const possibleKeys = [
            "taskora_tasks",
            "tasks"
        ];
        for (const key of possibleKeys) {
            try {
                const data =
                    JSON.parse(
                        localStorage.getItem(key)
                    );
                if (Array.isArray(data)) {
                    return data;
                }
            } catch { }
        }
        return [];
    }
    function searchTasks(query) {
        const tasks = getTasks();
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return tasks.filter(task => {
            const searchable = [
                task.title,
                task.description,
                task.category,
                task.priority,
                task.status,
                ...(Array.isArray(task.tags)
                    ? task.tags
                    : [])
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return searchable.includes(q);
        }).slice(0, 10);
    }
    function renderResults(matches) {
        if (!matches.length) {
            results.innerHTML = `
                <div class="taskora-search-empty">
                    No matching tasks found.
                </div>
            `;
            results.classList.add("show");
            return;
        }
        results.innerHTML = matches.map(task => `
            <button
                type="button"
                class="taskora-search-result"
                data-task-id="${task.id}">
                <div class="taskora-search-result-title">
                    ${escapeHTML(task.title || "Untitled Task")}
                </div>
                <div class="taskora-search-result-meta">
                    ${escapeHTML(task.category || "Other")}
                    •
                    ${escapeHTML(task.priority || "Medium")}
                </div>
            </button>
        `).join("");
        results.classList.add("show");
    }
    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value || "";
        return div.innerHTML;
    }
    input.addEventListener("input", () => {
        const query = input.value.trim();
        if (!query) {
            results.classList.remove("show");
            results.innerHTML = "";
            return;
        }
        renderResults(searchTasks(query));
    });
    document.addEventListener("click", event => {
        if (!searchWrapper.contains(event.target)) {
            results.classList.remove("show");
        }
    });
})();
/* =========================================================
   TASKORA — THEME PERSISTENCE COMPATIBILITY
   STEP 13 — ADD AT END
========================================================= */
(function initTaskoraThemePersistence() {
    if (window.taskoraThemePersistenceInitialized) return;
    window.taskoraThemePersistenceInitialized = true;
    const savedTheme = localStorage.getItem("taskora_theme") || "light";
    if (window.TaskoraTheme?.applyTheme) {
        window.TaskoraTheme.applyTheme(savedTheme);
    }
})();
/* =========================================================
   TASKORA — FINAL DUPLICATION SAFETY
   STEP 14 — ADD AT END
========================================================= */
(function taskoraFinalSafety() {
    if (window.taskoraFinalSafetyInitialized) return;
    window.taskoraFinalSafetyInitialized = true;
    const requiredElements = {
        search: "globalSearch",
        notification: "notificationButton",
        notificationBadge: "notificationBadge",
        profile: "profileTrigger",
        theme: "themeToggle",
        mobileMenu: "mobileMenuButton"
    };
    Object.entries(requiredElements).forEach(
        ([name, id]) => {
            const elements =
                document.querySelectorAll("#" + id);
            if (elements.length > 1) {
                console.warn(
                    `Taskora: duplicate ${name} element detected: #${id}`
                );
            }
        }
    );
    window.addEventListener("error", event => {
        console.error(
            "Taskora handled an application error:",
            event.error
        );
    });
})();
/* =========================================================
   TASKORA — STEP 2
   PAGE / SECTION MANAGER
========================================================= */
(() => {
    "use strict";
    if (window.taskoraPageManagerInitialized) {
        return;
    }
    window.taskoraPageManagerInitialized = true;
    const PAGE_SELECTORS = {
        // progress: [
        //     "#progressSection",
        //     "#progress",
        //     "#progressPage",
        //     ".progress-page",
        //     "[data-section='progress']"
        // ],
        dashboard: [
            "#dashboard",
            "#dashboardPage",
            ".dashboard-page",
            "[data-section='dashboard']"
        ],
        upcoming: [
            "#upcoming",
            "#upcomingPage",
            ".upcoming-page",
            "[data-section='upcoming']"
        ],
        today: [
            "#today",
            "#todayPage",
            ".today-page",
            "[data-section='today']"
        ],
        calendar: [
            // "#calendarSection",
            "#calendar",
            "#calendarPage",
            ".calendar-page",
            "[data-section='calendar']"
        ],
        "add-task": [
            "#addTask",
            "#addTaskPage",
            ".add-task-page",
            "[data-section='add-task']"
        ],
        "edit-task": [
            "#editTask",
            "#editTaskPage",
            ".edit-task-page",
            "[data-section='edit-task']"
        ],
        lists: [
            "#lists",
            "#listsPage",
            ".lists-page",
            "[data-section='lists']"
        ],
        recycle: [
            "#recycle",
            "#recyclePage",
            ".recycle-page",
            "[data-section='recycle']"
        ],
        notifications: [
            // "#taskoraP7NotificationPanel",
            "#notifications",
            "#notificationsPage",
            ".notifications-page",
            "[data-section='notifications']"
        ],
        settings: [
            "#settings",
            "#settingsPage",
            ".settings-page",
            "[data-section='settings']"
        ],
        about: [
            // "#aboutTaskoraSection",
            "#about",
            "#aboutPage",
            ".about-page",
            "[data-section='about']"
        ]
    };
    function findPageElement(page) {
        const selectors =
            PAGE_SELECTORS[page] || [];
        for (const selector of selectors) {
            const element =
                document.querySelector(selector);
            if (element) {
                return element;
            }
        }
        return null;
    }
    function hideAllPages() {
        const allSelectors = Object.values(
            PAGE_SELECTORS
        ).flat();
        const uniqueSelectors = [
            ...new Set(allSelectors)
        ];
        const elements = [];
        uniqueSelectors.forEach(selector => {
            document
                .querySelectorAll(selector)
                .forEach(element => {
                    if (!elements.includes(element)) {
                        elements.push(element);
                    }
                });
        });
        elements.forEach(element => {
            element.classList.remove(
                "taskora-page-active"
            );
            element.classList.add(
                "taskora-page-hidden"
            );
            element.setAttribute(
                "aria-hidden",
                "true"
            );
        });
    }
    function showPage(page) {
        const normalizedPage =
            window.TaskoraNavigation
                ? window.TaskoraNavigation.normalize(page)
                : page;
        const pageElement =
            findPageElement(
                normalizedPage
            );
        if (!pageElement) {
            console.warn(
                `Taskora: page section not found for "${normalizedPage}".`
            );
            return false;
        }
        hideAllPages();
        pageElement.classList.remove(
            "taskora-page-hidden"
        );
        pageElement.classList.add(
            "taskora-page-active"
        );
        pageElement.setAttribute(
            "aria-hidden",
            "false"
        );
        if (
            window.TaskoraNavigation
        ) {
            window.TaskoraNavigation.setActive(
                normalizedPage
            );
        }
        document.dispatchEvent(
            new CustomEvent(
                "taskora:pageShown",
                {
                    detail: {
                        page: normalizedPage,
                        element: pageElement
                    }
                }
            )
        );
        return true;
    }
    function handleNavigation(event) {
        const page =
            event.detail?.page;
        if (!page) {
            return;
        }
        showPage(page);
    }
    document.addEventListener(
        "taskora:navigate",
        handleNavigation
    );
    window.TaskoraPages = {
        show: showPage,
        hideAll: hideAllPages,
        find: findPageElement,
        selectors: PAGE_SELECTORS
    };
})();
/* =========================================================
   TASKORA — STEP 3
   UPCOMING TASKS PAGE
========================================================= */
(() => {
    "use strict";
    if (window.taskoraUpcomingInitialized) {
        return;
    }
    window.taskoraUpcomingInitialized = true;
    const TASK_KEY = "taskora_tasks";
    function getTasks() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(TASK_KEY)
                );
            return Array.isArray(data)
                ? data
                : [];
        } catch {
            return [];
        }
    }
    function getToday() {
        return new Date()
            .toISOString()
            .split("T")[0];
    }
    function getUpcomingTasks() {
        const today = getToday();
        return getTasks()
            .filter(task => {
                if (!task.dueDate) {
                    return false;
                }
                if (task.completed) {
                    return false;
                }
                return task.dueDate > today;
            })
            .sort((a, b) =>
                String(a.dueDate)
                    .localeCompare(
                        String(b.dueDate)
                    )
            );
    }
    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function renderUpcoming() {
        const container =
            document.querySelector(
                "#upcoming, #upcomingPage, [data-section='upcoming']"
            );
        if (!container) {
            return;
        }
        const tasks =
            getUpcomingTasks();
        container.innerHTML = `
            <div class="taskora-upcoming-header">
                <div>
                    <h2>Upcoming Tasks</h2>
                    <p>
                        Tasks scheduled for the coming days.
                    </p>
                </div>
                <div class="taskora-upcoming-count">
                    ${tasks.length}
                    ${tasks.length === 1 ? "Task" : "Tasks"}
                </div>
            </div>
            <div class="taskora-upcoming-list">
                ${tasks.length
                ? tasks.map(task => `
                            <article
                                class="taskora-upcoming-card"
                                data-task-id="${escapeHTML(task.id)}">
                                <div class="taskora-upcoming-card-main">
                                    <h3>
                                        ${escapeHTML(
                    task.title ||
                    "Untitled Task"
                )}
                                    </h3>
                                    <p>
                                        ${escapeHTML(
                    task.description ||
                    "No description"
                )}
                                    </p>
                                </div>
                                <div class="taskora-upcoming-meta">
                                    <span>
                                        📅
                                        ${escapeHTML(
                    task.dueDate
                )}
                                    </span>
                                    <span>
                                        ${escapeHTML(
                    task.priority ||
                    "Medium"
                )
                    }
                                    </span>
                                    <span>
                                        ${escapeHTML(
                        task.category ||
                        "Other"
                    )
                    }
                                    </span>
                                </div>
                            </article>
                        `).join("")
                : `
                            <div class="taskora-upcoming-empty">
                                <div>📅</div>
                                <h3>No upcoming tasks</h3>
                                <p>
                                    You don't have any upcoming
                                    pending tasks.
                                </p>
                            </div>
                        `
            }
            </div>
        `;
        container
            .querySelectorAll(
                "[data-task-id]"
            )
            .forEach(card => {
                card.addEventListener(
                    "click",
                    () => {
                        const taskId =
                            card.dataset.taskId;
                        const task =
                            getTasks().find(
                                item =>
                                    String(item.id) ===
                                    String(taskId)
                            );
                        if (!task) {
                            return;
                        }
                        document.dispatchEvent(
                            new CustomEvent(
                                "taskora:open-task",
                                {
                                    detail: task
                                }
                            )
                        );
                    }
                );
            });
    }
    document.addEventListener(
        "taskora:pageShown",
        event => {
            if (
                event.detail?.page ===
                "upcoming"
            ) {
                renderUpcoming();
            }
        }
    );
    document.addEventListener(
        "taskora:dataUpdated",
        () => {
            const currentPage =
                document.querySelector(
                    ".taskora-page-active"
                );
            if (
                currentPage &&
                (
                    currentPage.id ===
                    "upcoming" ||
                    currentPage.id ===
                    "upcomingPage" ||
                    currentPage.dataset.section ===
                    "upcoming"
                )
            ) {
                renderUpcoming();
            }
        }
    );
    window.TaskoraUpcoming = {
        render: renderUpcoming
    };
})();
/* =========================================================
   TASKORA — STEP 4
   TODAY TASKS PAGE
========================================================= */
(() => {
    "use strict";
    if (window.taskoraTodayInitialized) {
        return;
    }
    window.taskoraTodayInitialized = true;
    const TASK_KEY = "taskora_tasks";
    function getTasks() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(TASK_KEY)
                );
            return Array.isArray(data)
                ? data
                : [];
        } catch {
            return [];
        }
    }
    function getToday() {
        return new Date()
            .toISOString()
            .split("T")[0];
    }
    function getTodayTasks() {
        const today = getToday();
        return getTasks()
            .filter(task =>
                task.dueDate === today
            )
            .sort(
                (a, b) =>
                    Number(a.completed) -
                    Number(b.completed)
            );
    }
    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function renderToday() {
        const container =
            document.querySelector(
                "#today, #todayPage, [data-section='today']"
            );
        if (!container) {
            return;
        }
        const tasks =
            getTodayTasks();
        const completed =
            tasks.filter(
                task => task.completed
            ).length;
        const pending =
            tasks.length -
            completed;
        container.innerHTML = `
            <div class="taskora-today-header">
                <div>
                    <h2>Today's Tasks</h2>
                    <p>
                        ${new Date().toLocaleDateString(
            undefined,
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        )}
                    </p>
                </div>
                <div class="taskora-today-summary">
                    <span>
                        ${tasks.length}
                        Total
                    </span>
                    <span>
                        ${pending}
                        Pending
                    </span>
                    <span>
                        ${completed}
                        Completed
                    </span>
                </div>
            </div>
            <div class="taskora-today-list">
                ${tasks.length
                ? tasks.map(task => `
                            <article
                                class="
                                    taskora-today-card
                                    ${task.completed
                        ? "completed"
                        : ""
                    }
                                "
                                data-task-id="${escapeHTML(
                        task.id
                    )}">
                                <div class="taskora-today-check">
                                    ${task.completed
                        ? "✓"
                        : "○"
                    }
                                </div>
                                <div class="taskora-today-content">
                                    <h3>
                                        ${escapeHTML(
                        task.title ||
                        "Untitled Task"
                    )}
                                    </h3>
                                    <p>
                                        ${escapeHTML(
                        task.description ||
                        "No description"
                    )}
                                    </p>
                                    <div class="taskora-today-meta">
                                        <span>
                                            ${escapeHTML(
                        task.priority ||
                        "Medium"
                    )
                    }
                                        </span>
                                        <span>
                                            ${escapeHTML(
                        task.category ||
                        "Other"
                    )
                    }
                                        </span>
                                        <span>
                                            ${task.completed
                        ? "Completed"
                        : "Pending"
                    }
                                        </span>
                                    </div>
                                </div>
                            </article>
                        `).join("")
                : `
                            <div class="taskora-today-empty">
                                <div>
                                    🌤️
                                </div>
                                <h3>
                                    No tasks for today
                                </h3>
                                <p>
                                    Enjoy your day or
                                    add a new task.
                                </p>
                            </div>
                        `
            }
            </div>
        `;
        container
            .querySelectorAll(
                "[data-task-id]"
            )
            .forEach(card => {
                card.addEventListener(
                    "click",
                    () => {
                        const taskId =
                            card.dataset.taskId;
                        const task =
                            getTasks().find(
                                item =>
                                    String(item.id) ===
                                    String(taskId)
                            );
                        if (!task) {
                            return;
                        }
                        document.dispatchEvent(
                            new CustomEvent(
                                "taskora:open-task",
                                {
                                    detail: task
                                }
                            )
                        );
                    }
                );
            });
    }
    document.addEventListener(
        "taskora:pageShown",
        event => {
            if (
                event.detail?.page ===
                "today"
            ) {
                renderToday();
            }
        }
    );
    document.addEventListener(
        "taskora:dataUpdated",
        () => {
            const currentPage =
                document.querySelector(
                    ".taskora-page-active"
                );
            if (
                currentPage &&
                (
                    currentPage.id ===
                    "today" ||
                    currentPage.id ===
                    "todayPage" ||
                    currentPage.dataset.section ===
                    "today"
                )
            ) {
                renderToday();
            }
        }
    );
    window.TaskoraToday = {
        render: renderToday
    };
})();
/* =========================================================
   TASKORA — STEP 5
   CALENDAR
========================================================= */
(function initTaskoraCalendar() {
    "use strict";
    if (window.taskoraCalendarInitialized) {
        return;
    }
    window.taskoraCalendarInitialized = true;
    const TASK_KEY = "taskora_tasks";
    const page =
        document.getElementById("calendarPage");
    const monthTitle =
        document.getElementById(
            "taskoraCalendarMonth"
        );
    const calendarGrid =
        document.getElementById(
            "taskoraCalendarGrid"
        );
    const taskContainer =
        document.getElementById(
            "taskoraCalendarTasks"
        );
    const previousButton =
        document.getElementById(
            "taskoraCalendarPrev"
        );
    const todayButton =
        document.getElementById(
            "taskoraCalendarToday"
        );
    const nextButton =
        document.getElementById(
            "taskoraCalendarNext"
        );
    if (
        !page ||
        !monthTitle ||
        !calendarGrid ||
        !taskContainer
    ) {
        return;
    }
    let currentDate = new Date();
    function getTasks() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(
                        TASK_KEY
                    )
                );
            return Array.isArray(data)
                ? data
                : [];
        } catch {
            return [];
        }
    }
    function pad(value) {
        return String(value).padStart(2, "0");
    }
    function formatDate(year, month, day) {
        return (
            year +
            "-" +
            pad(month + 1) +
            "-" +
            pad(day)
        );
    }
    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function renderCalendar() {
        const year =
            currentDate.getFullYear();
        const month =
            currentDate.getMonth();
        const monthName =
            currentDate.toLocaleDateString(
                undefined,
                {
                    month: "long",
                    year: "numeric"
                }
            );
        monthTitle.textContent =
            monthName;
        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();
        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();
        const today =
            new Date();
        const todayString =
            formatDate(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
        let html = "";
        const weekdays = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];
        weekdays.forEach(day => {
            html += `
                <div class="taskora-calendar-weekday">
                    ${day}
                </div>
            `;
        });
        for (
            let i = 0;
            i < firstDay;
            i++
        ) {
            html += `
                <div class="taskora-calendar-day empty"></div>
            `;
        }
        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {
            const dateString =
                formatDate(
                    year,
                    month,
                    day
                );
            const dayTasks =
                getTasks().filter(
                    task =>
                        task.dueDate ===
                        dateString
                );
            html += `
                <button
                    type="button"
                    class="
                        taskora-calendar-day
                        ${dateString === todayString
                    ? "today"
                    : ""
                }
                        ${dayTasks.length
                    ? "has-tasks"
                    : ""
                }
                    "
                    data-calendar-date="${dateString}">
                    <span>
                        ${day}
                    </span>
                    ${dayTasks.length
                    ? `
                                <small>
                                    ${dayTasks.length}
                                </small>
                              `
                    : ""
                }
                </button>
            `;
        }
        calendarGrid.innerHTML =
            html;
        calendarGrid
            .querySelectorAll(
                "[data-calendar-date]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        showDateTasks(
                            button.dataset.calendarDate
                        );
                    }
                );
            });
        showDateTasks(
            todayString
        );
    }
    function showDateTasks(date) {
        const tasks =
            getTasks().filter(
                task =>
                    task.dueDate === date
            );
        const formattedDate =
            new Date(
                date + "T00:00:00"
            ).toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );
        if (!tasks.length) {
            taskContainer.innerHTML = `
                <div class="taskora-calendar-empty">
                    <div>📅</div>
                    <h3>
                        No tasks for this date
                    </h3>
                    <p>
                        ${escapeHTML(
                formattedDate
            )}
                    </p>
                </div>
            `;
            return;
        }
        taskContainer.innerHTML = `
            <div class="taskora-calendar-task-heading">
                <h3>
                    Tasks for
                    ${escapeHTML(formattedDate)}
                </h3>
            </div>
            ${tasks.map(task => `
                <article
                    class="
                        taskora-calendar-task
                        ${task.completed
                ? "completed"
                : ""
            }
                    "
                    data-task-id="${escapeHTML(
                task.id
            )}">
                    <div>
                        <h4>
                            ${escapeHTML(
                task.title ||
                "Untitled Task"
            )}
                        </h4>
                        <p>
                            ${escapeHTML(
                task.description ||
                "No description"
            )}
                        </p>
                    </div>
                    <span>
                        ${task.completed
                ? "Completed"
                : escapeHTML(
                    task.priority ||
                    "Medium"
                )
            }
                    </span>
                </article>
            `).join("")}
        `;
        taskContainer
            .querySelectorAll(
                "[data-task-id]"
            )
            .forEach(card => {
                card.addEventListener(
                    "click",
                    () => {
                        const task =
                            getTasks().find(
                                item =>
                                    String(item.id) ===
                                    String(
                                        card.dataset.taskId
                                    )
                            );
                        if (!task) {
                            return;
                        }
                        document.dispatchEvent(
                            new CustomEvent(
                                "taskora:open-task",
                                {
                                    detail: task
                                }
                            )
                        );
                    }
                );
            });
    }
    previousButton?.addEventListener(
        "click",
        () => {
            currentDate.setMonth(
                currentDate.getMonth() - 1
            );
            renderCalendar();
        }
    );
    nextButton?.addEventListener(
        "click",
        () => {
            currentDate.setMonth(
                currentDate.getMonth() + 1
            );
            renderCalendar();
        }
    );
    todayButton?.addEventListener(
        "click",
        () => {
            currentDate =
                new Date();
            renderCalendar();
        }
    );
    document.addEventListener(
        "taskora:pageShown",
        event => {
            if (
                event.detail?.page ===
                "calendar"
            ) {
                renderCalendar();
            }
        }
    );
    document.addEventListener(
        "taskora:dataUpdated",
        renderCalendar
    );
    renderCalendar();
})();
/* =========================================================
   TASKORA — STEP 7
   UPCOMING / TODAY / CALENDAR NAVIGATION
========================================================= */
(function initTaskoraSmartNavigation() {
    "use strict";
    if (window.taskoraSmartNavigationInitialized) {
        return;
    }
    window.taskoraSmartNavigationInitialized = true;
    function getTasks() {
        try {
            const data = JSON.parse(
                localStorage.getItem("taskora_tasks")
            );
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }
    function getToday() {
        return new Date()
            .toISOString()
            .split("T")[0];
    }
    function getUpcomingTasks() {
        const today = getToday();
        return getTasks()
            .filter(task => {
                if (!task.dueDate || task.completed) {
                    return false;
                }
                return task.dueDate > today;
            })
            .sort((a, b) =>
                String(a.dueDate)
                    .localeCompare(String(b.dueDate))
            );
    }
    function getTodayTasks() {
        const today = getToday();
        return getTasks().filter(task =>
            task.dueDate === today
        );
    }
    function getOverdueTasks() {
        const today = getToday();
        return getTasks().filter(task => {
            if (!task.dueDate || task.completed) {
                return false;
            }
            return task.dueDate < today;
        });
    }
    function dispatchNavigation(page, data = {}) {
        document.dispatchEvent(
            new CustomEvent("taskora:navigate", {
                detail: {
                    page,
                    ...data
                }
            })
        );
    }
    window.TaskoraSmartNavigation = {
        getUpcomingTasks,
        getTodayTasks,
        getOverdueTasks,
        dispatchNavigation
    };
    /*
     * Listen for navigation events coming from sidebar.js
     */
    document.addEventListener(
        "taskora:navigate",
        event => {
            const page =
                event.detail?.page;
            if (!page) {
                return;
            }
            /*
             * These events are intentionally
             * dispatched here so other Taskora
             * modules can listen to them.
             */
            if (page === "upcoming") {
                document.dispatchEvent(
                    new CustomEvent(
                        "taskora:show-upcoming",
                        {
                            detail: {
                                tasks:
                                    getUpcomingTasks()
                            }
                        }
                    )
                );
            }
            if (
                page === "today" ||
                page === "up-to-date"
            ) {
                document.dispatchEvent(
                    new CustomEvent(
                        "taskora:show-today",
                        {
                            detail: {
                                tasks:
                                    getTodayTasks()
                            }
                        }
                    )
                );
            }
            if (page === "overdue") {
                document.dispatchEvent(
                    new CustomEvent(
                        "taskora:show-overdue",
                        {
                            detail: {
                                tasks:
                                    getOverdueTasks()
                            }
                        }
                    )
                );
            }
            if (page === "calendar") {
                document.dispatchEvent(
                    new CustomEvent(
                        "taskora:open-calendar"
                    )
                );
            }
        }
    );
})();
/* =========================================================
   TASKORA — STEP 8
   ADD TASK / EDIT TASK / TASK LIST ACTIONS
========================================================= */
(function initTaskoraTaskActions() {
    "use strict";
    if (window.taskoraTaskActionsInitialized) {
        return;
    }
    window.taskoraTaskActionsInitialized = true;
    const TASK_KEY = "taskora_tasks";
    function getTasks() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(TASK_KEY)
                );
            return Array.isArray(data)
                ? data
                : [];
        } catch {
            return [];
        }
    }
    function saveTasks(tasks) {
        try {
            localStorage.setItem(
                TASK_KEY,
                JSON.stringify(tasks)
            );
            return true;
        } catch {
            return false;
        }
    }
    function generateTaskId() {
        return (
            "task-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }
    function normalizeTask(task) {
        return {
            id:
                task.id ||
                generateTaskId(),
            title:
                String(
                    task.title || ""
                ).trim(),
            description:
                String(
                    task.description || ""
                ).trim(),
            category:
                task.category ||
                "Personal",
            priority:
                task.priority ||
                "Medium",
            dueDate:
                task.dueDate ||
                "",
            completed:
                Boolean(task.completed),
            tags:
                Array.isArray(task.tags)
                    ? task.tags
                    : [],
            createdAt:
                task.createdAt ||
                new Date().toISOString(),
            updatedAt:
                new Date().toISOString()
        };
    }
    /*
     * ADD TASK
     */
    function addTask(taskData = {}) {
        const tasks = getTasks();
        const task =
            normalizeTask(taskData);
        if (!task.title) {
            return null;
        }
        tasks.push(task);
        if (!saveTasks(tasks)) {
            return null;
        }
        document.dispatchEvent(
            new CustomEvent(
                "taskora:task-added",
                {
                    detail: task
                }
            )
        );
        document.dispatchEvent(
            new CustomEvent(
                "taskora:dataUpdated",
                {
                    detail: {
                        action: "add",
                        task
                    }
                }
            )
        );
        return task;
    }
    /*
     * EDIT TASK
     */
    function updateTask(
        taskId,
        updates = {}
    ) {
        const tasks = getTasks();
        const index =
            tasks.findIndex(
                task =>
                    String(task.id) ===
                    String(taskId)
            );
        if (index === -1) {
            return null;
        }
        const previousTask = {
            ...tasks[index]
        };
        tasks[index] =
            normalizeTask({
                ...tasks[index],
                ...updates,
                id: tasks[index].id,
                createdAt:
                    tasks[index].createdAt,
                updatedAt:
                    new Date().toISOString()
            });
        if (!saveTasks(tasks)) {
            return null;
        }
        document.dispatchEvent(
            new CustomEvent(
                "taskora:task-updated",
                {
                    detail: {
                        task:
                            tasks[index],
                        previousTask
                    }
                }
            )
        );
        document.dispatchEvent(
            new CustomEvent(
                "taskora:dataUpdated",
                {
                    detail: {
                        action: "update",
                        task:
                            tasks[index]
                    }
                }
            )
        );
        return tasks[index];
    }
    /*
     * DELETE TASK
     *
     * We don't directly destroy the task here.
     * The existing Phase 8 recycle-bin system
     * can handle permanent task deletion.
     */
    function deleteTask(taskId) {
        const tasks = getTasks();
        const task =
            tasks.find(
                item =>
                    String(item.id) ===
                    String(taskId)
            );
        if (!task) {
            return false;
        }
        /*
         * Use the existing Phase 8 function
         * when available.
         */
        if (
            typeof window.taskoraDeleteTask ===
            "function"
        ) {
            window.taskoraDeleteTask(
                taskId
            );
            return true;
        }
        /*
         * Fallback:
         * remove from normal task storage.
         */
        const updatedTasks =
            tasks.filter(
                item =>
                    String(item.id) !==
                    String(taskId)
            );
        if (!saveTasks(updatedTasks)) {
            return false;
        }
        document.dispatchEvent(
            new CustomEvent(
                "taskora:dataUpdated",
                {
                    detail: {
                        action: "delete",
                        task
                    }
                }
            )
        );
        return true;
    }
    /*
     * COMPLETE / UNCOMPLETE TASK
     */
    function toggleTaskComplete(taskId) {
        const tasks = getTasks();
        const index =
            tasks.findIndex(
                task =>
                    String(task.id) ===
                    String(taskId)
            );
        if (index === -1) {
            return null;
        }
        const task =
            tasks[index];
        const wasCompleted =
            Boolean(task.completed);
        task.completed =
            !wasCompleted;
        task.updatedAt =
            new Date().toISOString();
        if (!saveTasks(tasks)) {
            return null;
        }
        if (task.completed) {
            document.dispatchEvent(
                new CustomEvent(
                    "taskora:task-completed",
                    {
                        detail: task
                    }
                )
            );
            if (
                typeof window
                    .showTaskCompletionCelebration ===
                "function"
            ) {
                window
                    .showTaskCompletionCelebration();
            }
        }
        document.dispatchEvent(
            new CustomEvent(
                "taskora:dataUpdated",
                {
                    detail: {
                        action:
                            "toggle-complete",
                        task
                    }
                }
            )
        );
        return task;
    }
    /*
     * OPEN TASK
     */
    function openTask(taskId) {
        const tasks = getTasks();
        const task =
            tasks.find(
                item =>
                    String(item.id) ===
                    String(taskId)
            );
        if (!task) {
            return;
        }
        document.dispatchEvent(
            new CustomEvent(
                "taskora:open-task",
                {
                    detail: task
                }
            )
        );
    }
    /*
     * PUBLIC API
     */
    window.TaskoraTasks = {
        getTasks,
        saveTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        openTask,
        generateTaskId
    };
    /*
     * GLOBAL EVENT HANDLERS
     */
    document.addEventListener(
        "taskora:add-task",
        event => {
            addTask(
                event.detail || {}
            );
        }
    );
    document.addEventListener(
        "taskora:edit-task",
        event => {
            const detail =
                event.detail || {};
            if (!detail.id) {
                return;
            }
            updateTask(
                detail.id,
                detail.updates || {}
            );
        }
    );
    document.addEventListener(
        "taskora:delete-task",
        event => {
            const taskId =
                event.detail?.taskId ||
                event.detail?.id;
            if (!taskId) {
                return;
            }
            deleteTask(taskId);
        }
    );
    document.addEventListener(
        "taskora:toggle-task",
        event => {
            const taskId =
                event.detail?.taskId ||
                event.detail?.id;
            if (!taskId) {
                return;
            }
            toggleTaskComplete(
                taskId
            );
        }
    );
    document.addEventListener(
        "taskora:open-task",
        event => {
            const taskId =
                event.detail?.taskId ||
                event.detail?.id;
            if (!taskId) {
                return;
            }
            openTask(taskId);
        }
    );
})();
/* =========================================================
   TASKORA — FINAL PAGE NAVIGATION CONTROLLER
   FINAL FIX FOR SIDEBAR NAVIGATION
========================================================= */
(function initTaskoraFinalNavigation() {
    "use strict";
    if (window.taskoraFinalNavigationInitialized) {
        return;
    }
    window.taskoraFinalNavigationInitialized = true;
    const app = document.getElementById("app");
    const dashboardPage =
        document.getElementById("dashboardPage");
    const futurePageContainer =
        document.getElementById("futurePageContainer");
    const calendarSection =
        document.getElementById("calendarSection");
    const progressSection =
        document.getElementById("progressSection");
    const searchPanel =
        document.getElementById("taskoraP6SearchPanel");
    const notificationPanel =
        document.getElementById("taskoraP7NotificationPanel");
    const aboutSection =
        document.getElementById("aboutTaskoraSection");
    const taskModal =
        document.getElementById("taskModal");
    const taskDetailsModal =
        document.getElementById("taskDetailsModal");
    /* =====================================================
       HELPER — GET TASKS
    ===================================================== */
    function getTasks() {
        try {
            const data = JSON.parse(
                localStorage.getItem("taskora_tasks")
            );
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }
    /* =====================================================
       HELPER — TODAY
    ===================================================== */
    function getTodayDate() {
        const now = new Date();
        const year =
            now.getFullYear();
        const month =
            String(now.getMonth() + 1)
                .padStart(2, "0");
        const day =
            String(now.getDate())
                .padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    /* =====================================================
       HELPER — ESCAPE HTML
    ===================================================== */
    function escapeHTML(value) {
        const div =
            document.createElement("div");
        div.textContent =
            value == null ? "" : String(value);
        return div.innerHTML;
    }
    /* =====================================================
       HIDE ALL MAIN VIEWS
    ===================================================== */
    function hideAllViews() {
        const editPage = document.getElementById("editTaskPage");
        const extraCards = document.getElementById("dashboardExtraCards");
        const dash = dashboardPage || document.getElementById("dashboardPage");
        const views = [
            dash,
            extraCards,
            editPage,
            calendarSection,
            progressSection,
            searchPanel,
            notificationPanel,
            aboutSection,
            futurePageContainer
        ];
        views.forEach(view => {
            if (view) {
                view.style.display = "none";
            }
        });
    }
    /* =====================================================
       CLOSE MODALS
    ===================================================== */
    function closeAllModals() {
        if (taskDetailsModal) {
            taskDetailsModal.setAttribute(
                "aria-hidden",
                "true"
            );
            taskDetailsModal.classList.remove("active");
        }
    }
    /* =====================================================
       UPDATE SIDEBAR ACTIVE ITEM
    ===================================================== */
    function updateActiveSidebar(page) {
        document
            .querySelectorAll(".nav-item, .sidebar-bottom-item")
            .forEach(item => {
                const itemPage =
                    item.dataset.page;
                item.classList.remove("active");
                item.removeAttribute(
                    "aria-current"
                );
                if (itemPage === page) {
                    item.classList.add("active");
                    item.setAttribute(
                        "aria-current",
                        "page"
                    );
                }
            });
    }
    /* =====================================================
       PAGE TITLE
    ===================================================== */
    function getPageTitle(page) {
        const titles = {
            dashboard: "Dashboard",
            upcoming: "Upcoming Tasks",
            today: "Today's Tasks",
            calendar: "Calendar",
            lists: "My Lists",
            settings: "Settings",
            about: "About Taskora",
            progress: "Progress & Focus",
            search: "Find Your Tasks",
            notifications: "Notifications"
        };
        return titles[page] || "Taskora";
    }
    /* =====================================================
       RENDER SIMPLE TASK PAGE
    ===================================================== */
    function renderTaskPage(page) {
        if (!futurePageContainer) {
            return;
        }
        const tasks =
            getTasks();
        const today =
            getTodayDate();
        let filteredTasks = [];
        if (page === "today") {
            filteredTasks =
                tasks.filter(task => {
                    if (!task.dueDate) {
                        return false;
                    }
                    return (
                        task.dueDate === today &&
                        !task.completed
                    );
                });
        } else if (page === "upcoming") {
            filteredTasks =
                tasks.filter(task => {
                    if (!task.dueDate) {
                        return false;
                    }
                    return (
                        task.dueDate > today &&
                        !task.completed
                    );
                });
        } else if (page === "lists") {
            filteredTasks =
                tasks;
        }
        const title =
            getPageTitle(page);
        let description = "";
        if (page === "today") {
            description =
                "Tasks scheduled for today.";
        }
        if (page === "upcoming") {
            description =
                "Your upcoming tasks are shown here.";
        }
        if (page === "lists") {
            description =
                "Manage and organize your Taskora tasks and lists.";
        }
        let taskHTML = "";
        if (!filteredTasks.length) {
            taskHTML = `
                <div class="taskora-navigation-empty">
                    <div class="placeholder-icon">
                        <i class="fa-regular fa-clipboard"></i>
                    </div>
                    <h3>No tasks found</h3>
                    <p>
                        ${escapeHTML(description)}
                    </p>
                    <button
                        type="button"
                        class="primary-button"
                        id="navigationAddTaskButton">
                        <i class="fa-solid fa-plus"></i>
                        Add Task
                    </button>
                </div>
            `;
        } else {
            taskHTML = `
                <div class="taskora-navigation-task-list">
                    ${filteredTasks.map(task => {
                const status =
                    task.completed
                        ? "Completed"
                        : "Pending";
                return `
                            <article
                                class="taskora-navigation-task-card"
                                data-task-id="${escapeHTML(task.id)}">
                                <div>
                                    <h3>
                                        ${escapeHTML(
                    task.title ||
                    "Untitled Task"
                )}
                                    </h3>
                                    <p>
                                        ${escapeHTML(
                    task.description ||
                    "No description"
                )}
                                    </p>
                                </div>
                                <div class="taskora-navigation-task-meta">
                                    <span>
                                        ${escapeHTML(
                    task.category ||
                    "Other"
                )}
                                    </span>
                                    <span>
                                        ${escapeHTML(
                    task.priority ||
                    "Medium"
                )}
                                    </span>
                                    <span>
                                        ${escapeHTML(
                    task.dueDate ||
                    "No date"
                )}
                                    </span>
                                    <span>
                                        ${status}
                                    </span>
                                </div>
                            </article>
                        `;
            }).join("")}
                </div>
            `;
        }
        futurePageContainer.innerHTML = `
            <div class="placeholder-card taskora-navigation-page">
                <div class="placeholder-icon">
                    <i class="fa-solid fa-layer-group"></i>
                </div>
                <span class="section-label">
                    TASKORA
                </span>
                <h2>
                    ${escapeHTML(title)}
                </h2>
                <p>
                    ${escapeHTML(description)}
                </p>
                ${taskHTML}
            </div>
        `;
        futurePageContainer.style.display =
            "grid";
        const addButton =
            document.getElementById(
                "navigationAddTaskButton"
            );
        if (addButton) {
            addButton.addEventListener(
                "click",
                () => {
                    document.dispatchEvent(
                        new CustomEvent(
                            "taskora:navigate",
                            {
                                detail: {
                                    page: "add-task"
                                }
                            }
                        )
                    );
                }
            );
        }
    }
    /* =====================================================
       OPEN ADD TASK
    ===================================================== */
    function openAddTask() {
        if (!taskModal) {
            console.warn(
                "Taskora: #taskModal not found."
            );
            return;
        }
        closeAllModals();
        taskModal.setAttribute(
            "aria-hidden",
            "false"
        );
        taskModal.classList.add("active");
        taskModal.style.display = "flex";
        const title =
            document.getElementById("taskModalTitle");
        if (title) {
            title.textContent =
                "Create New Task";
        }
        const editingId =
            document.getElementById("editingTaskId");
        if (editingId) {
            editingId.value = "";
        }
    }
    /* =====================================================
       OPEN EDIT TASK
    ===================================================== */
    function openEditTask() {
        const tasks =
            getTasks();
        if (!tasks.length) {
            if (typeof window.showToast === "function") {
                window.showToast(
                    "No tasks available to edit."
                );
            }
            return;
        }
        renderTaskPage("lists");
    }
    /* =====================================================
       MAIN NAVIGATION
    ===================================================== */
    
    /* =====================================================
       RENDER DEDICATED LISTS PAGE & LIST WINDOWS
    ===================================================== */
    function renderListsPage(targetListId) {
        if (!futurePageContainer) return;
        const lists = window.TaskoraLists.getLists();

        let gridHTML = "";
        if (!lists.length) {
            gridHTML = `
                <div class="taskora-navigation-empty">
                    <div class="placeholder-icon">
                        <i class="fa-solid fa-list-check"></i>
                    </div>
                    <h3>No lists created yet</h3>
                    <p>Create your first custom list to organize tasks, notes, or ideas.</p>
                    <button type="button" class="primary-button" id="emptyListsAddBtn">
                        <i class="fa-solid fa-plus"></i>
                        Create First List
                    </button>
                </div>
            `;
        } else {
            gridHTML = `
                <div class="lists-grid">
                    ${lists.map(list => {
                        const items = Array.isArray(list.items) ? list.items : [];
                        return `
                            <article class="list-window-card" id="list-window-${escapeHTML(list.id)}" data-list-id="${escapeHTML(list.id)}">
                                <div class="list-window-header">
                                    <div class="list-window-title-area">
                                        <span class="list-window-icon">📋</span>
                                        <h3 class="list-window-title">${escapeHTML(list.title || "Untitled List")}</h3>
                                        <span class="list-window-badge">${items.length}</span>
                                    </div>
                                    <div class="list-window-header-actions">
                                        <button type="button" class="list-icon-btn list-edit-btn" data-list-id="${escapeHTML(list.id)}" title="Edit List" aria-label="Edit list">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button type="button" class="list-icon-btn danger list-delete-btn" data-list-id="${escapeHTML(list.id)}" title="Delete List" aria-label="Delete list">
                                            <i class="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="list-window-items">
                                    ${!items.length ? '<div class="list-window-empty">No items yet. Add one below!</div>' : items.map(item => `
                                        <div class="list-item-row ${item.done ? "done" : ""}" data-item-id="${escapeHTML(item.id)}">
                                            <label class="list-item-left">
                                                <input type="checkbox" class="list-item-checkbox" data-list-id="${escapeHTML(list.id)}" data-item-id="${escapeHTML(item.id)}" ${item.done ? "checked" : ""}>
                                                <span class="list-item-text">${escapeHTML(item.text)}</span>
                                            </label>
                                            <button type="button" class="list-item-delete-btn" data-list-id="${escapeHTML(list.id)}" data-item-id="${escapeHTML(item.id)}" title="Remove item" aria-label="Remove item">
                                                <i class="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    `).join("")}
                                </div>
                                <!-- End of List Input Bar -->
                                <div class="list-add-item-bar">
                                    <input type="text" class="list-add-item-input" data-list-id="${escapeHTML(list.id)}" placeholder="Add new text or item...">
                                    <button type="button" class="list-add-item-btn" data-list-id="${escapeHTML(list.id)}">+ Add</button>
                                </div>
                                <div class="list-window-footer">
                                    <button type="button" class="list-window-footer-btn list-edit-footer-btn" data-list-id="${escapeHTML(list.id)}">
                                        <i class="fa-solid fa-pen"></i> Edit List
                                    </button>
                                </div>
                            </article>
                        `;
                    }).join("")}
                </div>
            `;
        }

        futurePageContainer.innerHTML = `
            <div class="lists-page-container">
                <div class="lists-page-header">
                    <div>
                        <span class="section-eyebrow">YOUR WORKSPACE</span>
                        <h1>My Lists</h1>
                        <p>Organize, brainstorm and manage your custom lists and notes.</p>
                    </div>
                    <button type="button" class="primary-button" id="listsPageAddBtn">
                        <i class="fa-solid fa-plus"></i>
                        Add New List
                    </button>
                </div>
                ${gridHTML}
            </div>
        `;
        futurePageContainer.style.display = "block";

        document.getElementById("listsPageAddBtn")?.addEventListener("click", () => openListModal());
        document.getElementById("emptyListsAddBtn")?.addEventListener("click", () => openListModal());

        futurePageContainer.querySelectorAll(".list-item-checkbox").forEach(cb => {
            cb.addEventListener("change", (e) => {
                const listId = e.target.dataset.listId;
                const itemId = e.target.dataset.itemId;
                window.TaskoraLists.toggleItem(listId, itemId);
            });
        });

        futurePageContainer.querySelectorAll(".list-item-delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const listId = btn.dataset.listId;
                const itemId = btn.dataset.itemId;
                window.TaskoraLists.deleteItem(listId, itemId);
            });
        });

        futurePageContainer.querySelectorAll(".list-add-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const listId = btn.dataset.listId;
                const input = futurePageContainer.querySelector(`.list-add-item-input[data-list-id="${listId}"]`);
                if (input && input.value.trim()) {
                    window.TaskoraLists.addItem(listId, input.value.trim());
                    input.value = "";
                }
            });
        });

        futurePageContainer.querySelectorAll(".list-add-item-input").forEach(input => {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const listId = input.dataset.listId;
                    if (input.value.trim()) {
                        window.TaskoraLists.addItem(listId, input.value.trim());
                        input.value = "";
                    }
                }
            });
        });

        futurePageContainer.querySelectorAll(".list-edit-btn, .list-edit-footer-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const listId = btn.dataset.listId;
                const lists = window.TaskoraLists.getLists();
                const list = lists.find(l => l.id === listId);
                if (list) openListModal(list);
            });
        });

        futurePageContainer.querySelectorAll(".list-delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const listId = btn.dataset.listId;
                if (typeof window.confirm === "undefined" || confirm("Are you sure you want to delete this list?")) {
                    window.TaskoraLists.deleteList(listId);
                    if (typeof showToast === "function") showToast("List deleted.");
                }
            });
        });

        if (targetListId) {
            const targetEl = document.getElementById(`list-window-${targetListId}`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                targetEl.style.borderColor = "var(--purple, #7c3aed)";
            }
        }
    }

    function showFinalPage(page, eventDetail) {
        if (!page) {
            return;
        }
        /* ---------------------------------------------
           Close mobile sidebar
        --------------------------------------------- */
        if (app) {
            app.classList.remove(
                "sidebar-mobile-open"
            );
        }
        const overlay =
            document.getElementById(
                "sidebarOverlay"
            );
        if (overlay) {
            overlay.classList.remove("open");
            overlay.setAttribute(
                "aria-hidden",
                "true"
            );
        }
        /* ---------------------------------------------
           Close details modal
        --------------------------------------------- */
        closeAllModals();
        /* ---------------------------------------------
           Update sidebar
        --------------------------------------------- */
        updateActiveSidebar(page);
        /* ---------------------------------------------
           Hide all pages
        --------------------------------------------- */
        hideAllViews();
        /* =================================================
           DASHBOARD
        ================================================= */
        if (page === "dashboard") {
            const dp = dashboardPage || document.getElementById("dashboardPage");
            if (dp) {
                dp.style.display = "block";
            }
            const extra = document.getElementById("dashboardExtraCards");
            if (extra) {
                extra.style.display = "grid";
            }
            return;
        }
        /* =================================================
           UPCOMING
        ================================================= */
        if (page === "upcoming") {
            renderTaskPage("upcoming");
            return;
        }
        /* =================================================
           TODAY
        ================================================= */
        if (
            page === "today" ||
            page === "up-to-date"
        ) {
            renderTaskPage("today");
            return;
        }
        /* =================================================
           CALENDAR
        ================================================= */
        if (page === "calendar") {
            if (calendarSection) {
                calendarSection.style.display =
                    "block";
                window.TaskoraCalendar?.refresh?.();
                calendarSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
            return;
        }
        /* =================================================
           ADD TASK
        ================================================= */
        if (page === "add-task") {
            const dp = dashboardPage || document.getElementById("dashboardPage");
            if (dp) {
                dp.style.display = "block";
            }
            openAddTask();
            return;
        }
        /* =================================================
           EDIT TASK
        ================================================= */
        if (page === "edit-task") {
            const editPage = document.getElementById("editTaskPage");
            if (editPage) {
                editPage.style.display = "block";
            }
            openEditTask();
            return;
        }
        /* =================================================
           LISTS
        ================================================= */
        if (page === "lists") {
            renderListsPage(eventDetail?.listId);
            return;
        }
        /* =================================================
           ABOUT
        ================================================= */
        if (page === "about") {
            if (aboutSection) {
                aboutSection.style.display =
                    "block";
                aboutSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
            return;
        }
        /* =================================================
           PROGRESS
        ================================================= */
        if (page === "progress") {
            if (progressSection) {
                progressSection.style.display =
                    "block";
                window.TaskoraProgress?.refresh?.();
                window.TaskoraProgress?.updateAll?.();
                progressSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
            return;
        }
        /* =================================================
           SEARCH
        ================================================= */
        if (page === "search") {
            if (searchPanel) {
                searchPanel.style.display =
                    "block";
            }
            return;
        }
        /* =================================================
           NOTIFICATIONS
        ================================================= */
        if (page === "notifications") {
            if (notificationPanel) {
                notificationPanel.style.display =
                    "block";
            }
            return;
        }
        /* =================================================
           SETTINGS
        ================================================= */
        if (page === "settings") {
            /*
             * Settings.js can handle its own
             * interface if available.
             */
            const settingsPage =
                document.getElementById(
                    "settingsPage"
                );
            if (settingsPage) {
                settingsPage.style.display =
                    "block";
                settingsPage.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                return;
            }
            renderTaskPage("settings");
            return;
        }
        /* =================================================
           FALLBACK
        ================================================= */
        renderTaskPage(page);
    }
    /* =====================================================
       LISTEN FOR SIDEBAR NAVIGATION
    ===================================================== */
    document.addEventListener(
        "taskora:navigate",
        function (event) {
            const page =
                event.detail?.page;
            if (!page) {
                return;
            }
            showFinalPage(page, event.detail);
        }
    );
    /* =====================================================
       LISTEN FOR TASK CHANGES ACROSS APP
    ===================================================== */
    document.addEventListener(
        "taskora:tasksChanged",
        function () {
            const activeNav = document.querySelector(".nav-item.active, .sidebar-bottom-item.active");

    /* =====================================================
       LISTEN FOR LISTS CHANGES ACROSS APP
    ===================================================== */
    document.addEventListener(
        "taskora:listsChanged",
        function () {
            renderSidebarLists();
            const activeNav = document.querySelector(".nav-item.active, .sidebar-bottom-item.active");
            if (activeNav?.dataset?.page === "lists") {
                renderListsPage();
            }
        }
    );


            const activePage = activeNav?.dataset?.page;
            if (activePage === "today" || activePage === "upcoming" || activePage === "lists") {
                renderTaskPage(activePage);
            }
        }
    );
    /* =====================================================
       DASHBOARD CARD LINKS
    ===================================================== */
    document.addEventListener(
        "click",
        function (event) {
            const button =
                event.target.closest(
                    "[data-page]"
                );
            if (!button) {
                return;
            }
            /*
             * Sidebar.js already handles
             * sidebar navigation.
             *
             * This handles dashboard
             * buttons such as:
             *
             * View all
             * More
             */
            if (
                button.classList.contains(
                    "nav-item"
                ) ||
                button.classList.contains(
                    "sidebar-bottom-item"
                )
            ) {
                return;
            }
            const page =
                button.dataset.page;
            if (!page) {
                return;
            }
            event.preventDefault();
            showFinalPage(page);
        }
    );
    /* =====================================================
       INITIAL STATE
    ===================================================== */
    /*
     * Dashboard remains the default view.
     */
    if (dashboardPage) {
        dashboardPage.style.display =
            "block";
    }
    console.log(
        "Taskora: Final navigation controller initialized."
    );
})();
document.addEventListener("DOMContentLoaded", () => {
    const sidebarToggleBtn = document.getElementById("sidebarToggle"); // आपके टॉگل बटन की आईडी या क्लास
    const mobileMenuBtn = document.getElementById("mobileMenuButton"); 
    const appContainer = document.querySelector(".app"); // आपका मुख्य पेरेंट कंटेनर

    function toggleSidebar() {
        if (appContainer) {
            appContainer.classList.toggle("sidebar-collapsed");
            
            // सेव करने के लिए ताकि पेज रीफ्रेश होने पर भी स्थिति बनी रहे
            const isCollapsed = appContainer.classList.contains("sidebar-collapsed");
            localStorage.setItem("sidebar_collapsed", isCollapsed);
        }
    }

    // अगर पेज लोड होने पर पहले से सेव्ड है तो उसे लागू करें
    const savedState = localStorage.getItem("sidebar_collapsed");
    if (savedState === "true" && appContainer) {
        appContainer.classList.add("sidebar-collapsed");
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener("click", toggleSidebar);
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleSidebar);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    // आपके HTML में मौजूद टॉगल बटन और ऐप कंटेनर की सटीक क्लास/आईडी ढूंढना
    const sidebarToggleBtn = document.getElementById("sidebarToggle");
    const mobileMenuBtn = document.getElementById("mobileMenuButton"); 
    const appContainer = document.querySelector(".app");

    function handleToggle(e) {
        e.preventDefault();
        if (appContainer) {
            appContainer.classList.toggle("sidebar-collapsed");
            console.log("Sidebar toggle clicked! Current classes:", appContainer.className);
        } else {
            console.error("Error: .app container not found!");
        }
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener("click", handleToggle);
    } else {
        console.warn("Warning: #sidebarToggle button not found in HTML.");
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", handleToggle);
    }
});
// Universal click listener to open the task modal from any "Add Task" button
document.addEventListener("click", (e) => {
    const trigger = e.target.closest(
        ".open-task-modal, #quickAddTask, #quickAddTaskBtn, #emptyStateAddTask, #editPageAddTaskBtn, [data-page='add-task']"
    );
    if (trigger) {
        e.preventDefault();
        if (typeof window.taskoraOpenTaskModal === "function") {
            window.taskoraOpenTaskModal();
        } else {
            const modal = document.getElementById("taskModal");
            if (modal) {
                modal.classList.add("show");
                modal.classList.add("active");
                modal.style.display = "flex";
                modal.setAttribute("aria-hidden", "false");
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("taskModal");
    const closeBtn = document.getElementById("closeTaskModal");

    // Close modal on 'X' click
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            if (typeof window.taskoraCloseTaskModal === "function") {
                window.taskoraCloseTaskModal();
            } else {
                modal.classList.remove("show");
                modal.classList.remove("active");
                modal.style.display = "none";
                modal.setAttribute("aria-hidden", "true");
            }
        });
    }

    // Close modal when clicking outside the card
    window.addEventListener("click", (e) => {
        if (e.target === modal || (e.target && e.target.hasAttribute("data-close-task-modal"))) {
            if (typeof window.taskoraCloseTaskModal === "function") {
                window.taskoraCloseTaskModal();
            } else {
                modal.classList.remove("show");
                modal.classList.remove("active");
                modal.style.display = "none";
                modal.setAttribute("aria-hidden", "true");
            }
        }
    });
});
/* =========================================================
   TASKORA — SYNC ENGINE (Calendar, Upcoming, Weekly, All Tasks)
========================================================= */
(function () {
    "use strict";

    const STORAGE_TASKS = "taskora_tasks";

    function getAllTasks() {
        try {
            const data = localStorage.getItem(STORAGE_TASKS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    // 1. कैलेंडर हाइलाइटिंग और क्लिक करने पर उस दिन के टास्क दिखाना
    function setupCalendarSync() {
        const tasks = getAllTasks();
        const calendarCells = document.querySelectorAll(".taskora-calendar-day, .calendar-day, #taskoraCalendarGrid td, [data-date]");

        // तारीख के हिसाब से टास्क मैप करना
        const tasksByDate = {};
        tasks.forEach(task => {
            if (!task.dueDate) return;
            // YYYY-MM-DD फॉर्मेट मैच करना
            const dateStr = task.dueDate.split("T")[0];
            if (!tasksByDate[dateStr]) {
                tasksByDate[dateStr] = [];
            }
            tasksByDate[dateStr].push(task);
        });

        // कैलेंडर ग्रिड या सेल्स को अपडेट करना
        document.addEventListener("click", (e) => {
            const dayCell = e.target.closest("[data-calendar-date], .calendar-day, td");
            if (!dayCell) return;

            const selectedDate = dayCell.dataset.date || dayCell.getAttribute("data-calendar-date");
            if (!selectedDate && !dayCell.textContent) return;

            // अगर यूजर किसी खास तारीख पर क्लिक करता है
            const targetDateStr = selectedDate || parseCellDate(dayCell);
            if (targetDateStr && tasksByDate[targetDateStr]) {
                renderSelectedDayTasks(targetDateStr, tasksByDate[targetDateStr]);
            }
        });
    }

    function parseCellDate(cell) {
        // अगर आपके कैलेंडर में तारीख डेटा एट्रिब्यूट के रूप में है
        return cell.dataset.date || null;
    }

    function renderSelectedDayTasks(dateStr, tasks) {
        const previewContainer = document.getElementById("todayTaskPreview") || document.getElementById("upcomingTaskPreview");
        if (!previewContainer) return;

        previewContainer.innerHTML = `
            <div class="selected-date-header" style="font-weight:bold; margin-bottom:8px; color:var(--taskora-primary, #6366f1);">
                Tasks for ${dateStr} (${tasks.length})
            </div>
            ${tasks.map(task => `
                <div class="preview-task" style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
                    <div>
                        <div class="preview-task-title" style="${task.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">
                            ${escapeHTML(task.title)}
                        </div>
                        <small style="opacity:0.7;">${escapeHTML(task.category || "General")}</small>
                    </div>
                    <span>${task.completed ? "✓" : "○"}</span>
                </div>
            `).join("")}
        `;
    }

    // 2. ऑल टास्क बटन इंटीग्रेशन (#navAllTasksBtn)
    function setupAllTasksButton() {
        const allTasksBtn = document.getElementById("navAllTasksBtn") || document.getElementById("allTasksButton");
        if (!allTasksBtn) return;

        allTasksBtn.addEventListener("click", () => {
            // ग्लोबल सर्च या रिजल्ट व्यू को ट्रिगर करना
            const searchInput = document.getElementById("globalSearch") || document.getElementById("searchInput");
            if (searchInput) {
                searchInput.value = "";
                searchInput.dispatchEvent(new Event("input"));
            }
            
            // अगर पेज नेविगेशन इवेंट है तो उसे कॉल करें
            document.dispatchEvent(
                new CustomEvent("taskora:navigate", { detail: { page: "search" } })
            );
        });
    }

    function escapeHTML(str) {
        return String(str || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // ऑटो-इनिशियलाइज़ेशन
    function initSyncEngine() {
        setupCalendarSync();
        setupAllTasksButton();

        // जब भी कोई टास्क सेव या अपडेट हो, डैशबोर्ड या व्यू रिफ्रेश हो जाए
        window.addEventListener("storage", (e) => {
            if (e.key === STORAGE_TASKS) {
                setupCalendarSync();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSyncEngine);
    } else {
        initSyncEngine();
    }
})();
