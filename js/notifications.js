/* =========================================================
   TASKORA — NOTIFICATION MODULE FOUNDATION    notifications.js
========================================================= */

(() => {
    "use strict";
    let initialized = false;
    function getNotifications() {
        if (!window.TaskoraStorage) {
            return [];
        }
        return window.TaskoraStorage.read(
            window.TaskoraStorage.keys.notifications,
            []
        );
    }
    function getUnreadCount() {
        return getNotifications()
            .filter(notification => !notification.read)
            .length;
    }
    function updateBadge() {
        const badge =
            document.getElementById("notificationBadge");
        if (!badge) {
            return;
        }
        const unreadCount = getUnreadCount();
        if (unreadCount <= 0) {
            badge.classList.add("hidden");
            badge.textContent = "0";
            return;
        }
        badge.classList.remove("hidden");
        badge.textContent =
            unreadCount > 99
                ? "99+"
                : String(unreadCount);
    }
    function initializeNotifications() {
        if (initialized) {
            return;
        }
        initialized = true;
        updateBadge();
        document.addEventListener(
            "taskora:notification-updated",
            updateBadge
        );
    }
    window.TaskoraNotifications = Object.freeze({
        initialize: initializeNotifications,
        updateBadge,
        getNotifications,
        getUnreadCount
    });
})();
/* =========================================================
   TASKORA — NOTIFICATION SYSTEM
   STEP 9 — ADD AT END
========================================================= */
(function initTaskoraNotifications() {
    if (window.taskoraNotificationsInitialized) return;
    window.taskoraNotificationsInitialized = true;
    const NOTIFICATION_KEY = "taskora_notifications";
    function getNotifications() {
        try {
            return JSON.parse(
                localStorage.getItem(NOTIFICATION_KEY)
            ) || [];
        } catch {
            return [];
        }
    }
    function saveNotifications(items) {
        localStorage.setItem(
            NOTIFICATION_KEY,
            JSON.stringify(items)
        );
    }
    function updateBadge() {
        const badge =
            document.getElementById("notificationBadge");
        if (!badge) return;
        const unread = getNotifications()
            .filter(item => !item.read).length;
        if (unread > 0) {
            badge.textContent = unread > 99 ? "99+" : unread;
            badge.classList.remove("hidden");
        } else {
            badge.textContent = "0";
            badge.classList.add("hidden");
        }
    }
    function addNotification(data) {
        const notifications = getNotifications();
        notifications.unshift({
            id: "notification_" + Date.now(),
            type: data.type || "system",
            title: data.title || "Taskora",
            message: data.message || "",
            createdAt: new Date().toISOString(),
            read: false,
            taskId: data.taskId || null,
            actions: data.actions || []
        });
        saveNotifications(notifications.slice(0, 100));
        updateBadge();
    }
    function openNotificationCenter() {
        let panel =
            document.getElementById("taskoraNotificationCenter");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "taskoraNotificationCenter";
            panel.className = "taskora-notification-panel";
            document.body.appendChild(panel);
        }
        renderNotifications(panel);
        panel.classList.add("show");
    }
    function renderNotifications(panel) {
        const notifications = getNotifications();
        panel.innerHTML = `
            <div class="taskora-notification-card">
                <div class="taskora-notification-header">
                    <div>
                        <h2>Notifications</h2>
                        <p>Your Taskora activity</p>
                    </div>
                    <button id="taskoraNotificationClose"
                            aria-label="Close notifications">
                        ×
                    </button>
                </div>
                <div id="taskoraNotificationList">
                    ${
                        notifications.length
                        ? notifications.map(createNotificationHTML).join("")
                        : `
                            <div class="taskora-notification-empty">
                                <div class="empty-icon">🔔</div>
                                <h3>You don't have any notifications now.</h3>
                                <p>New task reminders and updates will appear here.</p>
                            </div>
                        `
                    }
                </div>
            </div>
        `;
        document.getElementById("taskoraNotificationClose")
            .addEventListener("click", () => {
                panel.classList.remove("show");
            });
        panel.addEventListener("click", e => {
            if (e.target === panel) {
                panel.classList.remove("show");
            }
        });
        document.querySelectorAll(
            "[data-notification-id]"
        ).forEach(button => {
            button.addEventListener("click", () => {
                markAsRead(button.dataset.notificationId);
            });
        });
    }
    function createNotificationHTML(notification) {
        return `
            <div class="taskora-notification-item ${
                notification.read ? "" : "unread"
            }">
                <div class="notification-item-icon">
                    🔔
                </div>
                <div class="notification-item-content">
                    <strong>${escapeHTML(notification.title)}</strong>
                    <p>${escapeHTML(notification.message)}</p>
                    <small>
                        ${formatNotificationDate(notification.createdAt)}
                    </small>
                    ${
                        notification.read
                        ? ""
                        : `
                            <button
                                class="notification-read-btn"
                                data-notification-id="${notification.id}">
                                Mark as read
                            </button>
                        `
                    }
                </div>
            </div>
        `;
    }
    function markAsRead(id) {
        const notifications = getNotifications();
        const item = notifications.find(n => n.id === id);
        if (item) {
            item.read = true;
            saveNotifications(notifications);
        }
        updateBadge();
        const panel =
            document.getElementById("taskoraNotificationCenter");
        if (panel) {
            renderNotifications(panel);
            panel.classList.add("show");
        }
    }
    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value || "";
        return div.innerHTML;
    }
    function formatNotificationDate(date) {
        return new Date(date).toLocaleString();
    }
    window.taskoraAddNotification = addNotification;
    const notificationButton =
        document.getElementById("notificationButton");
    if (notificationButton) {
        notificationButton.addEventListener(
            "click",
            openNotificationCenter
        );
    }
    updateBadge();
})();