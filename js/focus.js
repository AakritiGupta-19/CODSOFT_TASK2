/* =========================================
   TASKORA — PHASE 5 FOCUS SYSTEM    focus.js
========================================= */
(function () {
    "use strict";
    const DEFAULT_SECONDS = 25 * 60;
    let remainingSeconds = DEFAULT_SECONDS;
    let timerInterval = null;
    let isRunning = false;
    let sessionSeconds = 0;
    function getFocusData() {
        if (
            window.TaskoraFocusStorage &&
            typeof window.TaskoraFocusStorage.get ===
                "function"
        ) {
            return window.TaskoraFocusStorage.get();
        }
        return {
            totalSeconds: 0,
            sessions: 0
        };
    }
    function saveFocusData(data) {
        if (
            window.TaskoraFocusStorage &&
            typeof window.TaskoraFocusStorage.save ===
                "function"
        ) {
            window.TaskoraFocusStorage.save(data);
        }
    }
    function formatTime(seconds) {
        const minutes =
            Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0");
        const remaining =
            (seconds % 60)
                .toString()
                .padStart(2, "0");
        return `${minutes}:${remaining}`;
    }
    function updateTimerDisplay() {
        const display =
            document.getElementById(
                "focusTimerDisplay"
            );
        if (display) {
            display.textContent =
                formatTime(remainingSeconds);
        }
    }
    function updateFocusStats() {
        const data = getFocusData();
        const sessions =
            document.getElementById(
                "focusSessionCount"
            );
        const totalTime =
            document.getElementById(
                "focusTotalTime"
            );
        const insightTime =
            document.getElementById(
                "insightFocusTime"
            );
        const minutes =
            Math.floor(data.totalSeconds / 60);
        if (sessions) {
            sessions.textContent =
                data.sessions;
        }
        if (totalTime) {
            totalTime.textContent =
                `${minutes} min`;
        }
        if (insightTime) {
            insightTime.textContent =
                `${minutes} min`;
        }
    }
    function setStatus(text) {
        const status =
            document.getElementById(
                "focusStatus"
            );
        if (status) {
            status.textContent = text;
        }
    }
    function startTimer() {
        if (isRunning) {
            return;
        }
        isRunning = true;
        setStatus("Focus session in progress");
        timerInterval =
            setInterval(() => {
                if (remainingSeconds <= 0) {
                    finishSession();
                    return;
                }
                remainingSeconds--;
                sessionSeconds++;
                updateTimerDisplay();
            }, 1000);
    }
    function pauseTimer() {
        if (!isRunning) {
            return;
        }
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        setStatus("Focus paused");
    }
    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        remainingSeconds =
            DEFAULT_SECONDS;
        sessionSeconds = 0;
        updateTimerDisplay();
        setStatus("Ready to focus");
    }
    function finishSession() {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        const data = getFocusData();
        data.totalSeconds +=
            sessionSeconds;
        data.sessions += 1;
        saveFocusData(data);
        sessionSeconds = 0;
        remainingSeconds =
            DEFAULT_SECONDS;
        updateTimerDisplay();
        updateFocusStats();
        setStatus("Focus session completed 🎉");
        if (
            typeof window.taskoraShowToast ===
            "function"
        ) {
            window.taskoraShowToast(
                "Focus session completed!"
            );
        }
        if (
            typeof window.TaskoraProgress?.refresh ===
            "function"
        ) {
            window.TaskoraProgress.refresh();
        }
    }
    function initializeFocus() {
        if (
            document.body.dataset
                .taskoraFocusInitialized === "true"
        ) {
            return;
        }
        if (
            !document.getElementById(
                "focusTimerDisplay"
            )
        ) {
            return;
        }
        document.body.dataset
            .taskoraFocusInitialized = "true";
        updateTimerDisplay();
        updateFocusStats();
        document
            .getElementById("focusStartBtn")
            ?.addEventListener(
                "click",
                startTimer
            );
        document
            .getElementById("focusPauseBtn")
            ?.addEventListener(
                "click",
                pauseTimer
            );
        document
            .getElementById("focusResetBtn")
            ?.addEventListener(
                "click",
                resetTimer
            );
    }
    window.TaskoraFocus = {
        start: startTimer,
        pause: pauseTimer,
        reset: resetTimer,
        refresh: updateFocusStats
    };
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeFocus,
            { once: true }
        );
    } else {
        initializeFocus();
    }
})();