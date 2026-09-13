/* =========================================================
   TASKORA — SETTINGS MODULE FOUNDATION  settings.js
========================================================= */

(() => {
    "use strict";
    const DEFAULT_SETTINGS = Object.freeze({
        theme: "light",
        sidebarCollapsed: false,
        notificationsEnabled: true,
        remindersEnabled: true,
        defaultPriority: "Medium",
        defaultCategory: "Other",
        startOfWeek: "monday",
        reducedMotion: false,
        soundEnabled: false,
        animationEnabled: true
    });
    function getSettings() {
        if (!window.TaskoraStorage) {
            return {
                ...DEFAULT_SETTINGS
            };
        }
        return {
            ...DEFAULT_SETTINGS,
            ...window.TaskoraStorage.read(
                window.TaskoraStorage.keys.settings,
                {}
            )
        };
    }
    function saveSettings(settings) {
        if (!window.TaskoraStorage) {
            return false;
        }
        return window.TaskoraStorage.write(
            window.TaskoraStorage.keys.settings,
            {
                ...DEFAULT_SETTINGS,
                ...settings
            }
        );
    }
    function initializeSettings() {
        const settings = getSettings();
        if (settings.reducedMotion) {
            document.documentElement.dataset.reducedMotion = "true";
        }
    }
    window.TaskoraSettings = Object.freeze({
        initialize: initializeSettings,
        getSettings,
        saveSettings,
        defaults: DEFAULT_SETTINGS
    });
})();