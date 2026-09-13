/* =========================================
   TASKORA — PHASE 5 PRODUCTIVITY progress.js
========================================= */
(function () {
    "use strict";
    function getTasks() {
        try {
            const tasks =
                JSON.parse(
                    localStorage.getItem(
                        "taskora_tasks"
                    )
                );
            return Array.isArray(tasks)
                ? tasks
                : [];
        } catch (error) {
            return [];
        }
    }
    function getActiveTasks() {
        return getTasks().filter(
            task =>
                task.status !== "deleted"
        );
    }
    function calculateProductivity(tasks) {
        if (!tasks.length) {
            return 0;
        }
        const completed =
            tasks.filter(
                task => task.completed
            ).length;
        return Math.round(
            (completed / tasks.length) * 100
        );
    }
    function getStreakData(tasks) {
        const completedDates =
            tasks
                .filter(
                    task =>
                        task.completed &&
                        task.completedAt
                )
                .map(
                    task =>
                        new Date(
                            task.completedAt
                        )
                )
                .map(date => {
                    date.setHours(0, 0, 0, 0);
                    return date.getTime();
                });
        const uniqueDates =
            [...new Set(completedDates)]
                .sort((a, b) => b - a);
        if (!uniqueDates.length) {
            return {
                current: 0,
                best: 0
            };
        }
        let best = 1;
        let current = 1;
        for (
            let i = 0;
            i < uniqueDates.length - 1;
            i++
        ) {
            const difference =
                (
                    uniqueDates[i] -
                    uniqueDates[i + 1]
                ) /
                (1000 * 60 * 60 * 24);
            if (difference === 1) {
                current++;
            } else {
                best =
                    Math.max(best, current);
                current = 1;
            }
        }
        best =
            Math.max(best, current);
        const today =
            new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday =
            new Date(today);
        yesterday.setDate(
            yesterday.getDate() - 1
        );
        const todayTime =
            today.getTime();
        const yesterdayTime =
            yesterday.getTime();
        let activeCurrent = 0;
        if (
            uniqueDates.includes(todayTime) ||
            uniqueDates.includes(yesterdayTime)
        ) {
            activeCurrent = 1;
            for (
                let i = 0;
                i < uniqueDates.length - 1;
                i++
            ) {
                const difference =
                    (
                        uniqueDates[i] -
                        uniqueDates[i + 1]
                    ) /
                    (1000 * 60 * 60 * 24);
                if (difference === 1) {
                    activeCurrent++;
                } else {
                    break;
                }
            }
        }
        return {
            current: activeCurrent,
            best
        };
    }
    function mostCommon(tasks, property) {
        const values = tasks
            .map(task => task[property])
            .filter(Boolean);
        if (!values.length) {
            return "Not enough data";
        }
        const counts = {};
        values.forEach(value => {
            counts[value] =
                (counts[value] || 0) + 1;
        });
        return Object.keys(counts)
            .sort(
                (a, b) =>
                    counts[b] -
                    counts[a]
            )[0];
    }
    function getMostProductiveDay(tasks) {
        const counts = {};
        tasks
            .filter(
                task =>
                    task.completed &&
                    task.completedAt
            )
            .forEach(task => {
                const day =
                    new Intl.DateTimeFormat(
                        "en-US",
                        {
                            weekday: "long"
                        }
                    ).format(
                        new Date(
                            task.completedAt
                        )
                    );
                counts[day] =
                    (counts[day] || 0) + 1;
            });
        const days =
            Object.keys(counts);
        if (!days.length) {
            return "Not enough data";
        }
        return days.sort(
            (a, b) =>
                counts[b] -
                counts[a]
        )[0];
    }
    function getTotalTime(tasks, property) {
        return tasks.reduce(
            (total, task) => {
                const value =
                    Number(
                        task[property]
                    ) || 0;
                return total + value;
            },
            0
        );
    }
    function updateElement(id, value) {
        document.querySelectorAll(`#${id}`).forEach(element => {
            element.textContent = value;
        });
    }
    function renderProgress() {
        const tasks =
            getActiveTasks();
        const completed =
            tasks.filter(
                task => task.completed
            );
        const pending =
            tasks.filter(
                task => !task.completed
            );
        const productivity =
            calculateProductivity(tasks);
        const streak =
            getStreakData(tasks);
        updateElement(
            "productivityScore",
            `${productivity}%`
        );
        updateElement(
            "progressCompletedTasks",
            completed.length
        );
        updateElement(
            "progressPendingTasks",
            pending.length
        );
        updateElement(
            "progressCurrentStreak",
            `${streak.current} days`
        );
        updateElement(
            "progressBestStreak",
            `${streak.best} days`
        );
        const progressBar =
            document.getElementById(
                "productivityProgressBar"
            );
        if (progressBar) {
            progressBar.style.width =
                `${productivity}%`;
        }
        const message =
            document.getElementById(
                "productivityMessage"
            );
        if (message) {
            if (!tasks.length) {
                message.textContent =
                    "Start creating tasks to build your productivity score.";
            } else if (productivity >= 80) {
                message.textContent =
                    "Excellent progress! Keep your momentum going.";
            } else if (productivity >= 50) {
                message.textContent =
                    "Good progress. Keep completing your planned tasks.";
            } else {
                message.textContent =
                    "You have room to improve. Start with your highest-priority task.";
            }
        }
        const estimated =
            getTotalTime(
                tasks,
                "estimatedTime"
            );
        const actual =
            getTotalTime(
                tasks,
                "actualTime"
            );
        updateElement(
            "estimatedTotalTime",
            `${estimated} min`
        );
        updateElement(
            "actualTotalTime",
            `${actual} min`
        );
        const actualProgress =
            document.getElementById(
                "actualTimeProgress"
            );
        if (actualProgress) {
            const percentage =
                estimated > 0
                    ? Math.min(
                        100,
                        Math.round(
                            (actual / estimated) * 100
                        )
                    )
                    : 0;
            actualProgress.style.width =
                `${percentage}%`;
        }
        const timeMessage =
            document.getElementById(
                "timeTrackingMessage"
            );
        if (timeMessage) {
            if (!estimated && !actual) {
                timeMessage.textContent =
                    "Add estimated and actual time to your tasks to track your progress.";
            } else {
                timeMessage.textContent =
                    "Your time tracking is calculated from stored task data.";
            }
        }
        updateElement(
            "mostProductiveDay",
            getMostProductiveDay(tasks)
        );
        updateElement(
            "mostUsedCategory",
            mostCommon(
                tasks,
                "category"
            )
        );
        updateElement(
            "commonPriority",
            mostCommon(
                tasks,
                "priority"
            )
        );
        if (
            typeof window.TaskoraFocusStorage !==
            "undefined"
        ) {
            const focus =
                window.TaskoraFocusStorage.get();
            updateElement(
                "insightFocusTime",
                `${Math.floor(
                    focus.totalSeconds / 60
                )} min`
            );
        }
    }
    function initializeProgress() {
        if (
            document.body.dataset
                .taskoraProgressInitialized ===
            "true"
        ) {
            return;
        }
        document.body.dataset
            .taskoraProgressInitialized =
            "true";
        renderProgress();
    }
    window.TaskoraProgress = {
        refresh: renderProgress
    };
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeProgress,
            { once: true }
        );
    } else {
        initializeProgress();
    }
})();