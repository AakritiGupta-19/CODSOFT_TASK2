/* =========================================================
   TASKORA — PROFILE MODULE FOUNDATION   profile.js
========================================================= */

(() => {
    "use strict";
    const DEFAULT_PROFILE = Object.freeze({
        name: "Alex",
        slogan: "",
        photo: "",
        password: "",
        createdAt: ""
    });
    function getProfile() {
        if (!window.TaskoraStorage) {
            return {
                ...DEFAULT_PROFILE
            };
        }
        return window.TaskoraStorage.read(
            window.TaskoraStorage.keys.user,
            {
                ...DEFAULT_PROFILE
            }
        );
    }
    function updateHeaderProfile() {
        const profile = getProfile();
        const nameElement =
            document.getElementById("headerProfileName");
        const avatarElement =
            document.getElementById("headerProfileAvatar");
        const greetingElement =
            document.getElementById("dashboardGreeting");
        const safeName =
            profile.name?.trim() || "Alex";
        if (nameElement) {
            nameElement.textContent = safeName;
        }
        if (greetingElement) {
            greetingElement.textContent =
                `Hi, ${safeName}`;
        }
        if (avatarElement) {
            if (profile.photo) {
                avatarElement.innerHTML = "";
                const image =
                    document.createElement("img");
                image.src = profile.photo;
                image.alt = `${safeName} profile photo`;
                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "cover";
                image.style.borderRadius = "inherit";
                avatarElement.appendChild(image);
            } else {
                avatarElement.innerHTML =
                    '<i class="fa-regular fa-user"></i>';
            }
        }
    }
    function initializeProfile() {
        updateHeaderProfile();
    }
    window.TaskoraProfile = Object.freeze({
        initialize: initializeProfile,
        getProfile,
        updateHeaderProfile
    });
})();
/* =========================================================
   TASKORA — PROFILE SYSTEM
   STEP 8 — ADD AT END
========================================================= */
(function initTaskoraProfile() {
    if (window.taskoraProfileInitialized) return;
    window.taskoraProfileInitialized = true;
    const PROFILE_KEY = "taskora_user";
    function getProfile() {
        try {
            return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
        } catch {
            return {};
        }
    }
    function saveProfile(profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
    function updateProfileUI() {
        const profile = getProfile();
        const name = profile.name && profile.name.trim()
            ? profile.name.trim()
            : "Alex";
        const headerName = document.getElementById("headerProfileName");
        if (headerName) {
            headerName.textContent = name;
        }
        const greetingNames = document.querySelectorAll(
            "#userName, .user-name, .greeting-name"
        );
        greetingNames.forEach(el => {
            el.textContent = name;
        });
    }
    function createProfileModal() {
        if (document.getElementById("taskoraProfileModal")) return;
        const modal = document.createElement("div");
        modal.id = "taskoraProfileModal";
        modal.className = "taskora-modal";
        modal.innerHTML = `
            <div class="taskora-modal-card">
                <button class="taskora-modal-close" id="taskoraProfileClose"
                    aria-label="Close profile">×</button>
                <h2>Create / Edit Profile</h2>
                <p class="taskora-modal-subtitle">
                    Personalize your Taskora profile.
                </p>
                <label>
                    Name
                    <input id="taskoraProfileName"
                           type="text"
                           maxlength="40"
                           placeholder="Enter your name">
                </label>
                <label>
                    Password
                    <input id="taskoraProfilePassword"
                           type="password"
                           maxlength="100"
                           placeholder="Enter a password">
                </label>
                <label>
                    Personal slogan
                    <input id="taskoraProfileSlogan"
                           type="text"
                           maxlength="100"
                           placeholder="Your personal slogan">
                </label>
                <label>
                    Profile photo
                    <input id="taskoraProfilePhoto"
                           type="file"
                           accept="image/*">
                </label>
                <img id="taskoraProfilePreview"
                     class="taskora-profile-preview"
                     alt="Profile preview"
                     hidden>
                <button id="taskoraSaveProfile"
                        class="primary-btn"
                        type="button">
                    Save Profile
                </button>
                <p id="taskoraProfileMessage" class="taskora-form-message"></p>
            </div>
        `;
        document.body.appendChild(modal);
        const profile = getProfile();
        document.getElementById("taskoraProfileName").value =
            profile.name || "";
        document.getElementById("taskoraProfilePassword").value =
            profile.password || "";
        document.getElementById("taskoraProfileSlogan").value =
            profile.slogan || "";
        if (profile.photo) {
            const preview = document.getElementById("taskoraProfilePreview");
            preview.src = profile.photo;
            preview.hidden = false;
        }
        document.getElementById("taskoraProfileClose")
            .addEventListener("click", closeProfile);
        modal.addEventListener("click", e => {
            if (e.target === modal) closeProfile();
        });
        document.getElementById("taskoraProfilePhoto")
            .addEventListener("change", handlePhoto);
        document.getElementById("taskoraSaveProfile")
            .addEventListener("click", saveProfileData);
    }
    function openProfile() {
        createProfileModal();
        const modal = document.getElementById("taskoraProfileModal");
        if (modal) {
            modal.classList.add("show");
        }
    }
    function closeProfile() {
        const modal = document.getElementById("taskoraProfileModal");
        if (modal) {
            modal.classList.remove("show");
        }
    }
    function handlePhoto(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const preview =
                document.getElementById("taskoraProfilePreview");
            preview.src = reader.result;
            preview.hidden = false;
            preview.dataset.photo = reader.result;
        };
        reader.readAsDataURL(file);
    }
    function saveProfileData() {
        const name =
            document.getElementById("taskoraProfileName").value.trim();
        const password =
            document.getElementById("taskoraProfilePassword").value;
        const slogan =
            document.getElementById("taskoraProfileSlogan").value.trim();
        const preview =
            document.getElementById("taskoraProfilePreview");
        if (!name) {
            showProfileMessage("Please enter your name.");
            return;
        }
        if (!password) {
            showProfileMessage("Please enter a password.");
            return;
        }
        const oldProfile = getProfile();
        const profile = {
            name,
            password,
            slogan,
            photo: preview.dataset.photo || oldProfile.photo || "",
            updatedAt: new Date().toISOString()
        };
        saveProfile(profile);
        updateProfileUI();
        showProfileMessage("Profile saved successfully.");
        setTimeout(closeProfile, 700);
    }
    function showProfileMessage(message) {
        const element =
            document.getElementById("taskoraProfileMessage");
        if (element) {
            element.textContent = message;
        }
    }
    const profileTrigger =
        document.getElementById("profileTrigger");
    if (profileTrigger) {
        profileTrigger.addEventListener("click", openProfile);
    }
    updateProfileUI();
})();