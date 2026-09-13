/* =========================================================
   TASKORA — CALENDAR MODULE FOUNDATION   calendar.js
========================================================= */

(() => {
    "use strict";
    let initialized = false;
    function initializeCalendar() {
        if (initialized) {
            return;
        }
        initialized = true;
        /*
         * The complete calendar engine will be implemented
         * in Phase 4.
         *
         * Keeping initialization isolated prevents duplicate
         * calendar event listeners in later phases.
         */
        document.addEventListener(
            "taskora:navigate",
            (event) => {
                if (event.detail?.page !== "calendar") {
                    return;
                }
                document.dispatchEvent(
                    new CustomEvent("taskora:calendar-open")
                );
            }
        );
    }
    window.TaskoraCalendar = {
        initialize: initializeCalendar
    };
})();
/* =========================================
   TASKORA — PHASE 4 CALENDAR
========================================= */
(function () {
    "use strict";
    const CALENDAR_STATE_KEY = "taskora_calendar_state";
    const state = {
        currentDate: new Date(),
        selectedDate: new Date()
    };
    function getTasks() {
        try {
            const tasks = JSON.parse(
                localStorage.getItem("taskora_tasks")
            );
            return Array.isArray(tasks) ? tasks : [];
        } catch (error) {
            console.error("Unable to load Taskora tasks.");
            return [];
        }
    }
    function saveCalendarState() {
        try {
            localStorage.setItem(
                CALENDAR_STATE_KEY,
                JSON.stringify({
                    currentDate: state.currentDate.toISOString(),
                    selectedDate: state.selectedDate.toISOString()
                })
            );
        } catch (error) {
            console.error("Unable to save calendar state.");
        }
    }
    function loadCalendarState() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(CALENDAR_STATE_KEY)
            );
            if (saved?.currentDate) {
                state.currentDate = new Date(saved.currentDate);
            }
            if (saved?.selectedDate) {
                state.selectedDate = new Date(saved.selectedDate);
            }
        } catch (error) {
            // Use default calendar state.
        }
    }
    function dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    function taskDateKey(task) {
        if (!task || !task.dueDate) {
            return null;
        }
        return String(task.dueDate).slice(0, 10);
    }
    function sameDate(date1, date2) {
        return dateKey(date1) === dateKey(date2);
    }
    function getTasksForDate(date) {
        const key = dateKey(date);
        return getTasks().filter(task => {
            return (
                taskDateKey(task) === key &&
                task.status !== "deleted"
            );
        });
    }
    function priorityRank(priority) {
        const rank = {
            Urgent: 4,
            High: 3,
            Medium: 2,
            Low: 1
        };
        return rank[priority] || 0;
    }
    function getHighestPriority(tasks) {
        if (!tasks.length) {
            return null;
        }
        return tasks
            .slice()
            .sort(
                (a, b) =>
                    priorityRank(b.priority) -
                    priorityRank(a.priority)
            )[0]?.priority || null;
    }
    function renderCalendar() {
        const grid = document.getElementById("taskoraCalendarGrid");
        const title = document.getElementById("calendarMonthTitle");
        if (!grid || !title) {
            return;
        }
        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();
        title.textContent = new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric"
        }).format(state.currentDate);
        grid.innerHTML = "";
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const previousMonthDays = new Date(year, month, 0).getDate();
        const totalCells = Math.ceil(
            (firstDay + daysInMonth) / 7
        ) * 7;
        for (let i = 0; i < totalCells; i++) {
            let dayNumber;
            let cellDate;
            let isOtherMonth = false;
            if (i < firstDay) {
                dayNumber = previousMonthDays - firstDay + i + 1;
                cellDate = new Date(
                    year,
                    month - 1,
                    dayNumber
                );
                isOtherMonth = true;
            } else if (i >= firstDay + daysInMonth) {
                dayNumber =
                    i - (firstDay + daysInMonth) + 1;
                cellDate = new Date(
                    year,
                    month + 1,
                    dayNumber
                );
                isOtherMonth = true;
            } else {
                dayNumber = i - firstDay + 1;
                cellDate = new Date(
                    year,
                    month,
                    dayNumber
                );
            }
            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendar-day";
            if (isOtherMonth) {
                button.classList.add("other-month");
            }
            if (sameDate(cellDate, new Date())) {
                button.classList.add("today");
            }
            if (sameDate(cellDate, state.selectedDate)) {
                button.classList.add("selected");
            }
            const tasks = getTasksForDate(cellDate);
            const priority = getHighestPriority(tasks);
            if (tasks.length) {
                button.classList.add("has-task");
                if (priority) {
                    button.classList.add(
                        `priority-${priority.toLowerCase()}`
                    );
                }
            }
            const number = document.createElement("span");
            number.className = "calendar-day-number";
            number.textContent = dayNumber;
            button.appendChild(number);
            if (tasks.length) {
                const dot = document.createElement("span");
                dot.className = "calendar-task-dot";
                button.appendChild(dot);
            }
            button.addEventListener("click", function () {
                state.selectedDate = new Date(cellDate);
                if (isOtherMonth) {
                    state.currentDate = new Date(
                        cellDate.getFullYear(),
                        cellDate.getMonth(),
                        1
                    );
                }
                saveCalendarState();
                renderCalendar();
                renderSelectedDate();
            });
            grid.appendChild(button);
        }
    }
    function createTaskCard(task) {
        const card = document.createElement("article");
        card.className = "calendar-task-card";
        if (task.completed) {
            card.classList.add("completed");
        }
        const title = document.createElement("h4");
        title.textContent = task.title || "Untitled Task";
        const description = document.createElement("p");
        description.className = "calendar-task-description";
        description.textContent =
            task.description || "No description added.";
        const meta = document.createElement("div");
        meta.className = "task-card-meta";
        const priority = document.createElement("span");
        const pLevel = (task.priority || "Medium").toLowerCase();
        priority.className = `task-meta-chip priority-badge ${pLevel}`;
        priority.textContent =
            task.priority || "Medium";
        const category = document.createElement("span");
        category.className = "task-meta-chip category-badge";
        category.textContent =
            task.category || "Other";
        const time = document.createElement("span");
        time.className = "task-meta-chip time-chip";
        time.textContent =
            task.time || (task.dueDate ? `📅 ${task.dueDate}` : "No time");
        meta.append(priority, category, time);
        if (task.reminder) {
            const reminder = document.createElement("span");
            reminder.className = "task-meta-chip reminder-chip";
            reminder.textContent = `🔔 ${task.reminder}`;
            meta.appendChild(reminder);
        }
        const actions = document.createElement("div");
        actions.className = "task-card-actions";
        const viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openTaskDetails(task);
        });
        const completeBtn = document.createElement("button");
        completeBtn.type = "button";
        completeBtn.textContent =
            task.completed ? "Completed" : "Complete";
        completeBtn.disabled = Boolean(task.completed);
        completeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            completeTask(task.id);
        });
        actions.append(viewBtn, completeBtn);
        card.append(
            title,
            description,
            meta,
            actions
        );
        card.addEventListener("click", (e) => {
            if (e.target.closest(".task-card-actions")) return;
            openTaskDetails(task);
        });
        card.style.cursor = "pointer";
        return card;
    }
    function renderSelectedDate() {
        const title =
            document.getElementById("selectedDateTitle");
        const container =
            document.getElementById("selectedDateTasks");
        if (!title || !container) {
            return;
        }
        title.textContent =
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }).format(state.selectedDate);
        container.innerHTML = "";
        const tasks =
            getTasksForDate(state.selectedDate);
        if (!tasks.length) {
            container.innerHTML = `
                <div class="calendar-empty-state">
                    <span>📋</span>
                    <p>Nothing scheduled for this date.</p>
                </div>
            `;
            return;
        }
        tasks.forEach(task => {
            container.appendChild(
                createTaskCard(task)
            );
        });
    }
    function renderTodayTasks() {
        const container =
            document.getElementById("todayTasksContainer");
        if (!container) {
            return;
        }
        container.innerHTML = "";
        const tasks =
            getTasksForDate(new Date());
        if (!tasks.length) {
            container.innerHTML = `
                <div class="calendar-empty-state">
                    <span>☀️</span>
                    <p>No tasks scheduled for today.</p>
                </div>
            `;
            return;
        }
        tasks.forEach(task => {
            container.appendChild(
                createTaskCard(task)
            );
        });
    }
    function startOfWeek(date) {
        const result = new Date(date);
        const day = result.getDay();
        result.setDate(
            result.getDate() - day
        );
        result.setHours(0, 0, 0, 0);
        return result;
    }
    function renderWeeklyTasks() {
        const container =
            document.getElementById("weeklyTasksContainer");
        if (!container) {
            return;
        }
        container.innerHTML = "";
        const start = startOfWeek(new Date());
        const end = new Date(start);
        end.setDate(
            start.getDate() + 6
        );
        const tasks = getTasks().filter(task => {
            if (!task.dueDate) {
                return false;
            }
            const date = new Date(
                task.dueDate + "T00:00:00"
            );
            return (
                date >= start &&
                date <= end &&
                task.status !== "deleted"
            );
        });
        if (!tasks.length) {
            container.innerHTML = `
                <div class="calendar-empty-state">
                    <span>📆</span>
                    <p>No weekly tasks yet.</p>
                </div>
            `;
            return;
        }
        tasks.slice(0, 6).forEach(task => {
            container.appendChild(
                createTaskCard(task)
            );
        });
    }
    function renderUpcoming() {
        const container =
            document.getElementById("upcomingTimeline");
        if (!container) {
            return;
        }
        container.innerHTML = "";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tasks = getTasks()
            .filter(task => {
                if (!task.dueDate || task.completed) {
                    return false;
                }
                const date = new Date(
                    task.dueDate + "T00:00:00"
                );
                return (
                    date > today &&
                    task.status !== "deleted"
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.dueDate) -
                    new Date(b.dueDate)
            )
            .slice(0, 7);
        if (!tasks.length) {
            container.innerHTML = `
                <div class="calendar-empty-state">
                    <span>🚀</span>
                    <p>No upcoming tasks.</p>
                </div>
            `;
            return;
        }
        tasks.forEach(task => {
            const item = document.createElement("article");
            item.className = "upcoming-item";
            const date = document.createElement("div");
            date.className = "upcoming-date";
            date.textContent =
                new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric"
                }).format(
                    new Date(task.dueDate + "T00:00:00")
                );
            const content = document.createElement("div");
            const title = document.createElement("h4");
            title.textContent =
                task.title || "Untitled Task";
            const description = document.createElement("p");
            description.textContent =
                task.description ||
                "No description added.";
            content.append(title, description);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "small-action-btn";
            button.textContent = "View";
            button.addEventListener("click", () => {
                openTaskDetails(task);
            });
            item.append(
                date,
                content,
                button
            );
            container.appendChild(item);
        });
    }
    function openTaskDetails(task) {
        const modal =
            document.getElementById("taskDetailsModal");
        if (!modal) {
            return;
        }
        const setText = (id, value) => {
            const element =
                document.getElementById(id);
            if (element) {
                element.textContent =
                    value || "—";
            }
        };
        setText(
            "detailsTaskTitle",
            task.title || "Untitled Task"
        );
        setText(
            "detailsTaskDescription",
            task.description ||
            "No description added."
        );
        setText(
            "detailsCategory",
            task.category || "Other"
        );
        setText(
            "detailsPriority",
            task.priority || "Medium"
        );
        setText(
            "detailsDueDate",
            task.dueDate
        );
        setText(
            "detailsTime",
            task.time
        );
        setText(
            "detailsReminder",
            task.reminder
        );
        setText(
            "detailsStatus",
            task.completed
                ? "Completed"
                : "Pending"
        );
        const tags =
            document.getElementById("detailsTags");
        if (tags) {
            tags.innerHTML = "";
            const taskTags =
                Array.isArray(task.tags)
                    ? task.tags
                    : [];
            taskTags.forEach(tag => {
                const element =
                    document.createElement("span");
                element.className =
                    "task-meta-chip";
                element.textContent =
                    `#${String(tag).replace(/^#/, "")}`;
                tags.appendChild(element);
            });
        }
        modal.dataset.taskId = task.id;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    }
    function closeTaskDetails() {
        const modal =
            document.getElementById("taskDetailsModal");
        if (!modal) {
            return;
        }
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    }
    function completeTask(taskId) {
        const tasks = getTasks();
        const task =
            tasks.find(item => item.id === taskId);
        if (!task || task.completed) {
            return;
        }
        task.completed = true;
        task.status = "completed";
        task.completedAt =
            new Date().toISOString();
        task.updatedAt =
            new Date().toISOString();
        localStorage.setItem(
            "taskora_tasks",
            JSON.stringify(tasks)
        );
        renderCalendar();
        renderSelectedDate();
        renderTodayTasks();
        renderWeeklyTasks();
        renderUpcoming();
        closeTaskDetails();
        document.dispatchEvent(
            new CustomEvent("taskora:tasksChanged", {
                detail: { action: "complete", taskId: taskId }
            })
        );
        const celebration = document.getElementById("completion-celebration");
        if (celebration) {
            celebration.classList.add("show");
            setTimeout(() => celebration.classList.remove("show"), 2500);
        }
        if (typeof window.taskoraShowToast === "function") {
            window.taskoraShowToast(
                "Task completed successfully."
            );
        }
        if (
            typeof window.taskoraRefreshDashboard ===
            "function"
        ) {
            window.taskoraRefreshDashboard();
        }
    }
    function changeMonth(amount) {
        state.currentDate = new Date(
            state.currentDate.getFullYear(),
            state.currentDate.getMonth() + amount,
            1
        );
        saveCalendarState();
        renderCalendar();
    }
    function initializeCalendar() {
        if (
            document.body.dataset
                .taskoraCalendarInitialized === "true"
        ) {
            return;
        }
        const grid =
            document.getElementById(
                "taskoraCalendarGrid"
            );
        if (!grid) {
            return;
        }
        document.body.dataset
            .taskoraCalendarInitialized = "true";
        loadCalendarState();
        const previous =
            document.getElementById(
                "calendarPrevBtn"
            );
        const next =
            document.getElementById(
                "calendarNextBtn"
            );
        previous?.addEventListener(
            "click",
            () => changeMonth(-1)
        );
        next?.addEventListener(
            "click",
            () => changeMonth(1)
        );
        document
            .getElementById("closeTaskDetailsModal")
            ?.addEventListener(
                "click",
                closeTaskDetails
            );
        document
            .querySelector(
                "[data-close-task-modal]"
            )
            ?.addEventListener(
                "click",
                closeTaskDetails
            );
        renderCalendar();
        renderSelectedDate();
        renderTodayTasks();
        renderWeeklyTasks();
        renderUpcoming();

        document.addEventListener("taskora:tasksChanged", () => {
            window.TaskoraCalendar?.refresh();
        });
        document.addEventListener("taskora:calendar-open", () => {
            window.TaskoraCalendar?.refresh();
        });
    }
    window.TaskoraCalendar = {
        refresh: function () {
            renderCalendar();
            renderSelectedDate();
            renderTodayTasks();
            renderWeeklyTasks();
            renderUpcoming();
        },
        completeTask
    };
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeCalendar,
            { once: true }
        );
    } else {
        initializeCalendar();
    }
})();