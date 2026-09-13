/* =========================================================
   TASKORA — TASK MODULE FOUNDATION tasks.js
========================================================= */

(() => {
    "use strict";
    const DEFAULT_TASK = Object.freeze({
        id: "",
        title: "",
        description: "",
        category: "Other",
        tags: [],
        priority: "Medium",
        dueDate: "",
        time: "",
        reminder: "",
        recurring: false,
        recurrence: null,
        estimatedTime: 0,
        actualTime: 0,
        completed: false,
        createdAt: "",
        updatedAt: "",
        completedAt: null,
        status: "pending",
        listId: null
    });
    function createTaskObject(data = {}) {
        const now = new Date().toISOString();
        return {
            ...DEFAULT_TASK,
            ...data,
            id: data.id || crypto.randomUUID(),
            createdAt: data.createdAt || now,
            updatedAt: now
        };
    }
    function getTasks() {
        if (!window.TaskoraStorage) {
            return [];
        }
        return window.TaskoraStorage.read(
            window.TaskoraStorage.keys.tasks,
            []
        );
    }
    function saveTasks(tasks) {
        if (!window.TaskoraStorage) {
            return false;
        }
        return window.TaskoraStorage.write(
            window.TaskoraStorage.keys.tasks,
            tasks
        );
    }
    window.TaskoraTask = Object.freeze({
        createTaskObject,
        getTasks,
        saveTasks
    });
})();
/* =========================================
   TASKORA PHASE 3 - TASK SYSTEM
========================================= */
(function () {
    "use strict";
    const TASKORA_KEYS = {
        tasks: "taskora_tasks",
        drafts: "taskora_drafts",
        categories: "taskora_categories",
        settings: "taskora_settings",
        history: "taskora_history"
    };
    function getStorage(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (error) {
            return fallback;
        }
    }
    function setStorage(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );
        } catch (error) {
            showTaskoraToast(
                "Storage could not be updated.",
                "error"
            );
        }
    }
    function generateTaskoraId() {
        return `
            task_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}
        `.replace(/\s/g, "");
    }
    function getTasks() {
        return getStorage(
            TASKORA_KEYS.tasks,
            []
        );
    }
    function saveTasks(tasks) {
        setStorage(
            TASKORA_KEYS.tasks,
            tasks
        );
    }
    function getCategories() {
        return getStorage(
            TASKORA_KEYS.categories,
            [
                "Personal",
                "Study",
                "Work",
                "Important",
                "Other"
            ]
        );
    }
    function saveCategories(categories) {
        setStorage(
            TASKORA_KEYS.categories,
            categories
        );
    }
    function getCurrentDraft() {
        return getStorage(
            TASKORA_KEYS.drafts,
            null
        );
    }
    function collectTaskFormData() {
        const title =
            document.getElementById("taskTitle")?.value.trim() || "";
        const description =
            document.getElementById("taskDescription")?.value.trim() || "";
        const category =
            document.getElementById("taskCategory")?.value || "Other";
        const customCategory =
            document.getElementById("taskCustomCategory")
                ?.value.trim() || "";
        const tagsInput =
            document.getElementById("taskTags")
                ?.value.trim() || "";
        const tags = tagsInput
            ? tagsInput
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean)
            : [];
        const priority =
            document.getElementById("taskPriority")?.value || "Medium";
        const dueDate =
            document.getElementById("taskDueDate")?.value || "";
        const time =
            document.getElementById("taskTime")?.value || "";
        const reminder =
            document.getElementById("taskReminder")?.value || "";
        const recurring =
            document.getElementById("taskRecurrence")?.value || "none";
        const estimatedTime =
            Number(
                document.getElementById("taskEstimatedTime")
                    ?.value || 30
            );
        return {
            title,
            description,
            category: customCategory || category,
            tags,
            priority,
            dueDate,
            time,
            reminder,
            recurring,
            estimatedTime
        };
    }
    function validateTask(task) {
        const titleError =
            document.getElementById("taskTitleError");
        const dateError =
            document.getElementById("taskDateError");
        const titleField =
            document.getElementById("taskTitle")
                ?.closest(".task-form-field");
        const dateField =
            document.getElementById("taskDueDate")
                ?.closest(".task-form-field");
        if (titleError) {
            titleError.textContent = "";
        }
        if (dateError) {
            dateError.textContent = "";
        }
        titleField?.classList.remove("input-error");
        dateField?.classList.remove("input-error");
        let valid = true;
        if (!task.title) {
            if (titleError) {
                titleError.textContent =
                    "Please enter a task title.";
            }
            titleField?.classList.add("input-error");
            valid = false;
        }
        if (task.dueDate) {
            const selectedDate =
                new Date(`${task.dueDate}T23:59:59`);
            if (selectedDate < new Date()) {
                if (dateError) {
                    dateError.textContent =
                        "Please choose today or a future date.";
                }
                dateField?.classList.add("input-error");
                valid = false;
            }
        }
        return valid;
    }
    function createTask(taskData) {
        const now = new Date().toISOString();
        return {
            id: generateTaskoraId(),
            title: taskData.title,
            description: taskData.description,
            category: taskData.category,
            tags: taskData.tags,
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            time: taskData.time,
            reminder: taskData.reminder,
            recurring: taskData.recurring,
            estimatedTime: taskData.estimatedTime,
            actualTime: 0,
            completed: false,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            status: "pending",
            listId: null
        };
    }
    function saveTask(event) {
        event.preventDefault();
        const taskData =
            collectTaskFormData();
        if (!validateTask(taskData)) {
            showTaskoraToast(
                "Please fix the highlighted fields.",
                "error"
            );
            return;
        }
        const tasks = getTasks();
        const editingId =
            document.getElementById("editingTaskId")
                ?.value || "";
        if (editingId) {
            const index =
                tasks.findIndex(
                    task => task.id === editingId
                );
            if (index !== -1) {
                tasks[index] = {
                    ...tasks[index],
                    ...taskData,
                    updatedAt:
                        new Date().toISOString()
                };
                saveTasks(tasks);
                clearTaskDraft();
                closeTaskModal();
                showTaskoraToast(
                    "Task updated successfully.",
                    "success"
                );
                window.dispatchEvent(
                    new CustomEvent("taskora:tasksChanged")
                );
                return;
            }
        }
        const newTask =
            createTask(taskData);
        tasks.push(newTask);
        saveTasks(tasks);
        clearTaskDraft();
        closeTaskModal();
        showTaskoraToast(
            "Task created successfully.",
            "success"
        );
        const celebration = document.getElementById("celebrationOverlay");
        if (celebration) {
            celebration.classList.add("active");
            setTimeout(() => {
                celebration.classList.remove("active");
            }, 2000);
        }
        window.dispatchEvent(
            new CustomEvent("taskora:tasksChanged")
        );
    }
    function saveTaskDraft() {
        const draft =
            collectTaskFormData();
        const hasContent =
            draft.title ||
            draft.description ||
            draft.tags.length ||
            draft.dueDate;
        if (!hasContent) {
            showTaskoraToast(
                "Start filling the task to save a draft.",
                "error"
            );
            return;
        }
        setStorage(
            TASKORA_KEYS.drafts,
            {
                ...draft,
                savedAt: new Date().toISOString()
            }
        );
        updateDraftStatus();
        showTaskoraToast(
            "Task draft saved.",
            "success"
        );
    }
    function restoreTaskDraft() {
        const draft =
            getCurrentDraft();
        if (!draft) return;
        const setValue = (id, value) => {
            const element =
                document.getElementById(id);
            if (element) {
                element.value = value ?? "";
            }
        };
        setValue("taskTitle", draft.title);
        setValue("taskDescription", draft.description);
        setValue("taskTags", draft.tags?.join(", "));
        setValue("taskPriority", draft.priority);
        setValue("taskDueDate", draft.dueDate);
        setValue("taskTime", draft.time);
        setValue("taskReminder", draft.reminder);
        setValue("taskRecurrence", draft.recurring);
        setValue("taskEstimatedTime", draft.estimatedTime);
        const categories =
            getCategories();
        const categorySelect =
            document.getElementById("taskCategory");
        if (categorySelect &&
            categories.includes(draft.category)) {
            categorySelect.value =
                draft.category;
        } else {
            setValue(
                "taskCustomCategory",
                draft.category
            );
        }
        updateDraftStatus();
        updateSmartSuggestion();
    }
    function clearTaskDraft() {
        localStorage.removeItem(
            TASKORA_KEYS.drafts
        );
        updateDraftStatus();
    }
    function updateDraftStatus() {
        const status =
            document.getElementById("taskDraftStatus");
        if (!status) return;
        const draft =
            getCurrentDraft();
        status.textContent = draft
            ? "A saved draft is available."
            : "";
    }
    function createCustomCategory() {
        const input =
            document.getElementById(
                "taskCustomCategory"
            );
        if (!input) return;
        const name =
            input.value.trim();
        if (!name) {
            showTaskoraToast(
                "Enter a category name first.",
                "error"
            );
            return;
        }
        const categories =
            getCategories();
        const exists =
            categories.some(
                category =>
                    category.toLowerCase() ===
                    name.toLowerCase()
            );
        if (!exists) {
            categories.push(name);
            saveCategories(categories);
            const select =
                document.getElementById(
                    "taskCategory"
                );
            if (select) {
                const option =
                    document.createElement("option");
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
                select.value = name;
            }
        }
        input.value = "";
        showTaskoraToast(
            "Category added.",
            "success"
        );
    }
    function updateSmartSuggestion() {
        const suggestion =
            document.getElementById(
                "smartSuggestionText"
            );
        if (!suggestion) return;
        const task =
            collectTaskFormData();
        const title =
            task.title.toLowerCase();
        const today =
            new Date();
        let message =
            "Your task looks good. Add a due date if you want scheduling suggestions.";
        if (
            title.includes("exam") ||
            title.includes("deadline") ||
            title.includes("submit") ||
            title.includes("urgent")
        ) {
            message =
                "This task may be time-sensitive. Consider using High or Urgent priority.";
        }
        if (task.dueDate) {
            const due =
                new Date(`${task.dueDate}T23:59:59`);
            const difference =
                Math.ceil(
                    (due - today) /
                    (1000 * 60 * 60 * 24)
                );
            if (difference <= 1 && difference >= 0) {
                message =
                    "This task is due very soon. A reminder may help you stay on track.";
            }
        }
        suggestion.textContent = message;
    }
    function openTaskModal() {
        const modal =
            document.getElementById(
                "taskModal"
            );
        if (!modal) return;
        modal.classList.add("show");
        modal.classList.add("active");
        modal.style.display = "flex";
        modal.setAttribute(
            "aria-hidden",
            "false"
        );
        updateDraftStatus();
        const editingId =
            document.getElementById(
                "editingTaskId"
            )?.value;
        if (!editingId) {
            restoreTaskDraft();
        }
        updateSmartSuggestion();
        document
            .getElementById("taskTitle")
            ?.focus();
    }
    function closeTaskModal() {
        const modal =
            document.getElementById(
                "taskModal"
            );
        if (!modal) return;
        modal.classList.remove("show");
        modal.classList.remove("active");
        modal.style.display = "none";
        modal.setAttribute(
            "aria-hidden",
            "true"
        );
    }
    function resetTaskForm() {
        const form =
            document.getElementById(
                "taskForm"
            );
        if (form) {
            form.reset();
        }
        const editingId =
            document.getElementById(
                "editingTaskId"
            );
        if (editingId) {
            editingId.value = "";
        }
        const errorElements =
            document.querySelectorAll(
                ".task-field-error"
            );
        errorElements.forEach(
            element => element.textContent = ""
        );
        document
            .querySelectorAll(".task-form-field")
            .forEach(
                field =>
                    field.classList.remove(
                        "input-error"
                    )
            );
    }
    function showTaskoraToast(message, type = "success") {
        let container =
            document.getElementById(
                "toastContainer"
            );
        if (!container) {
            container =
                document.createElement("div");
            container.id =
                "toastContainer";
            container.className =
                "toast-container";
            document.body.appendChild(
                container
            );
        }
        const toast =
            document.createElement("div");
        toast.className =
            `taskora-toast ${type}`;
        toast.textContent =
            message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("hide");
            setTimeout(
                () => toast.remove(),
                250
            );
        }, 3000);
    }
    function initializeTaskSystem() {
        const form =
            document.getElementById(
                "taskForm"
            );
        if (form &&
            form.dataset.taskoraInitialized !== "true") {
            form.dataset.taskoraInitialized = "true";
            form.addEventListener(
                "submit",
                saveTask
            );
        }
        const closeButton =
            document.getElementById(
                "closeTaskModal"
            );
        if (closeButton &&
            closeButton.dataset.taskoraInitialized !== "true") {
            closeButton.dataset.taskoraInitialized = "true";
            closeButton.addEventListener(
                "click",
                closeTaskModal
            );
        }
        const cancelButton =
            document.getElementById(
                "cancelTaskBtn"
            );
        if (cancelButton &&
            cancelButton.dataset.taskoraInitialized !== "true") {
            cancelButton.dataset.taskoraInitialized = "true";
            cancelButton.addEventListener(
                "click",
                function () {
                    clearTaskDraft();
                    resetTaskForm();
                    closeTaskModal();
                }
            );
        }
        document
            .querySelectorAll("[data-close-task-modal]")
            .forEach(backdrop => {
                if (
                    backdrop.dataset.taskoraInitialized ===
                    "true"
                ) {
                    return;
                }
                backdrop.dataset.taskoraInitialized =
                    "true";
                backdrop.addEventListener(
                    "click",
                    closeTaskModal
                );
            });
        const draftButton =
            document.getElementById(
                "saveTaskDraftBtn"
            );
        if (draftButton &&
            draftButton.dataset.taskoraInitialized !== "true") {
            draftButton.dataset.taskoraInitialized =
                "true";
            draftButton.addEventListener(
                "click",
                saveTaskDraft
            );
        }
        const categoryButton =
            document.getElementById(
                "createCategoryBtn"
            );
        if (categoryButton &&
            categoryButton.dataset.taskoraInitialized !== "true") {
            categoryButton.dataset.taskoraInitialized =
                "true";
            categoryButton.addEventListener(
                "click",
                createCustomCategory
            );
        }
        [
            "taskTitle",
            "taskDescription",
            "taskTags",
            "taskDueDate",
            "taskPriority",
            "taskRecurrence"
        ].forEach(id => {
            const element =
                document.getElementById(id);
            if (!element ||
                element.dataset.taskoraInitialized ===
                "true") {
                return;
            }
            element.dataset.taskoraInitialized =
                "true";
            element.addEventListener(
                "input",
                updateSmartSuggestion
            );
            element.addEventListener(
                "change",
                updateSmartSuggestion
            );
        });
        document.addEventListener("click", function (e) {
            const trigger = e.target.closest(
                ".open-task-modal, #quickAddTask, #quickAddTaskBtn, #emptyStateAddTask, #editPageAddTaskBtn, [data-page='add-task']"
            );
            if (trigger) {
                e.preventDefault();
                resetTaskForm();
                openTaskModal();
            }
        });
        window.addEventListener(
            "taskora:tasksChanged",
            function () {
                if (typeof window.taskoraRefreshDashboard === "function") {
                    window.taskoraRefreshDashboard();
                }
                if (typeof window.TaskoraCalendar?.refresh === "function") {
                    window.TaskoraCalendar.refresh();
                }
                if (typeof window.TaskoraProgress?.refresh === "function") {
                    window.TaskoraProgress.refresh();
                }
                if (typeof window.TaskoraFocus?.refresh === "function") {
                    window.TaskoraFocus.refresh();
                }
            }
        );
    }
    window.taskoraOpenTaskModal =
        openTaskModal;
    window.taskoraCloseTaskModal =
        closeTaskModal;
    window.taskoraGetTasks =
        getTasks;
    window.taskoraShowToast =
        showTaskoraToast;
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeTaskSystem,
            { once: true }
        );
    } else {
        initializeTaskSystem();
    }
})();