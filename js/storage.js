/* =========================================================
   TASKORA — CENTRAL STORAGE FOUNDATION storage.js
========================================================= */

(() => {
    "use strict";
    const STORAGE_PREFIX = "taskora_";
    const STORAGE_KEYS = Object.freeze({
        user: `${STORAGE_PREFIX}user`,
        tasks: `${STORAGE_PREFIX}tasks`,
        drafts: `${STORAGE_PREFIX}drafts`,
        lists: `${STORAGE_PREFIX}lists`,
        categories: `${STORAGE_PREFIX}categories`,
        notifications: `${STORAGE_PREFIX}notifications`,
        recycleBin: `${STORAGE_PREFIX}recycle_bin`,
        settings: `${STORAGE_PREFIX}settings`,
        theme: `${STORAGE_PREFIX}theme`,
        history: `${STORAGE_PREFIX}history`,
        focus: `${STORAGE_PREFIX}focus`,
        productivity: `${STORAGE_PREFIX}productivity`
    });
    function read(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                return fallback;
            }
            return JSON.parse(value);
        } catch (error) {
            console.error("Taskora storage read error:", error);
            return fallback;
        }
    }
    function write(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );
            return true;
        } catch (error) {
            console.error("Taskora storage write error:", error);
            return false;
        }
    }
    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error("Taskora storage remove error:", error);
            return false;
        }
    }
    function clearTaskoraData() {
        Object.values(STORAGE_KEYS).forEach((key) => {
            remove(key);
        });
    }
    window.TaskoraStorage = Object.freeze({
        keys: STORAGE_KEYS,
        read,
        write,
        remove,
        clearTaskoraData
    });
})();
/* =========================================
   TASKORA — PHASE 5 STORAGE HELPERS
========================================= */
(function () {
    "use strict";
    const FOCUS_KEY = "taskora_focus";
    function getFocusData() {
        try {
            const data =
                JSON.parse(
                    localStorage.getItem(FOCUS_KEY)
                );
            if (!data || typeof data !== "object") {
                return {
                    totalSeconds: 0,
                    sessions: 0
                };
            }
            return {
                totalSeconds:
                    Number(data.totalSeconds) || 0,
                sessions:
                    Number(data.sessions) || 0
            };
        } catch (error) {
            return {
                totalSeconds: 0,
                sessions: 0
            };
        }
    }
    function saveFocusData(data) {
        localStorage.setItem(
            FOCUS_KEY,
            JSON.stringify(data)
        );
    }
    window.TaskoraFocusStorage = {
        get: getFocusData,
        save: saveFocusData
    };
})();