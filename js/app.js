/**
 * Main Application Orchestrator
 * Bootstraps the application, fetches modular configuration, attaches reactive listeners,
 * and initializes UI components and theme controllers.
 */

import { createDietStore } from "./store.js";
import { renderBMIBadge, renderSummaryBanner, renderWeeklyPlan, renderGroceryList, setupGroceryActions, showToast } from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Fetch Modular Diet Configuration
    const response = await fetch(`./diet-config.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load diet configuration: ${response.statusText}`);
    }
    const dietConfig = await response.json();

    // 2. Initialize Reactive Store
    const store = createDietStore(dietConfig);

    // 3. Bind UI Form Controls to Store
    initFormControls(store);

    // 4. Setup Theme Toggle (Dark/Light)
    initThemeToggle();

    // 5. Setup Grocery Actions (Copy, Print, Clear)
    setupGroceryActions(store);

    // 6. Setup Preset Buttons
    initQuickPresets(store);

    // 7. Subscribe UI Views to Store updates
    store.subscribe((state, changedKeys) => {
      // BMI updates
      renderBMIBadge(state.bmi);

      // Summary Banner updates
      renderSummaryBanner(state);

      // Weekly Schedule updates
      renderWeeklyPlan(state, store);

      // Grocery List updates
      renderGroceryList(state, store);
    });

    // Remove loading overlay if present
    const loader = document.getElementById("app-loading");
    if (loader) loader.classList.add("hidden");

  } catch (error) {
    console.error("Initialization Error:", error);
    const errorBanner = document.getElementById("app-error-banner");
    if (errorBanner) {
      errorBanner.classList.remove("hidden");
      errorBanner.innerHTML = `⚠️ <strong>Error loading configuration:</strong> ${error.message}. Please ensure the app is served via a local server.`;
    }
  }
});

/**
 * Connects HTML form input elements with reactive store
 */
function initFormControls(store) {
  const heightInput = document.getElementById("input-height");
  const weightInput = document.getElementById("input-weight");
  const ageInput = document.getElementById("input-age");
  const genderSelect = document.getElementById("select-gender");
  const activitySelect = document.getElementById("select-activity");
  const dietSelect = document.getElementById("select-diet");
  const timeframeSelect = document.getElementById("select-timeframe");
  const portionSlider = document.getElementById("slider-portion");
  const portionVal = document.getElementById("portion-scale-val");

  const currentState = store.state;

  // Set initial form values from store state
  if (heightInput) heightInput.value = currentState.height;
  if (weightInput) weightInput.value = currentState.weight;
  if (ageInput) ageInput.value = currentState.age;
  if (genderSelect) genderSelect.value = currentState.gender;
  if (activitySelect) activitySelect.value = currentState.activity;
  if (dietSelect) dietSelect.value = currentState.dietPreference;
  if (timeframeSelect) timeframeSelect.value = currentState.timeframe;

  // Sync Height
  if (heightInput) {
    heightInput.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (val >= 80 && val <= 260) {
        store.update("height", val);
      }
    });
  }

  // Sync Weight
  if (weightInput) {
    weightInput.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (val >= 25 && val <= 350) {
        store.update("weight", val);
      }
    });
  }

  // Sync Age
  if (ageInput) {
    ageInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (val >= 12 && val <= 120) {
        store.update("age", val);
      }
    });
  }

  // Sync Gender
  if (genderSelect) {
    genderSelect.addEventListener("change", (e) => {
      store.update("gender", e.target.value);
    });
  }

  // Sync Activity
  if (activitySelect) {
    activitySelect.addEventListener("change", (e) => {
      store.update("activity", e.target.value);
    });
  }

  // Sync Dietary Preference
  if (dietSelect) {
    dietSelect.addEventListener("change", (e) => {
      store.update("dietPreference", e.target.value);
    });
  }

  // Sync Timeframe
  if (timeframeSelect) {
    timeframeSelect.addEventListener("change", (e) => {
      store.update("timeframe", e.target.value);
    });
  }

  // Portion Scaling Slider
  if (portionSlider && portionVal) {
    portionSlider.addEventListener("input", (e) => {
      const scale = parseFloat(e.target.value);
      portionVal.textContent = `${Math.round(scale * 100)}%`;
      store.update("portionScale", scale);
    });
  }
}

/**
 * Setup Theme Mode (Dark / Light) with system preference detection & localStorage
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const storedTheme = localStorage.getItem("antigravity_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const currentTheme = storedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme");
      const nextTheme = active === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("antigravity_theme", nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const iconEl = document.getElementById("theme-icon");
  if (iconEl) {
    iconEl.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

/**
 * Quick Goal Presets for user exploration
 */
function initQuickPresets(store) {
  const presetDeficit = document.getElementById("preset-deficit");
  const presetNormal = document.getElementById("preset-normal");
  const presetSurplus = document.getElementById("preset-surplus");

  if (presetDeficit) {
    presetDeficit.addEventListener("click", () => {
      store.updateInputs({
        height: 175,
        weight: 88,
        activity: "moderate",
        dietPreference: "standard",
        timeframe: "moderate_16"
      });
      syncInputsFromStore(store.state);
      showToast("Applied Preset: Weight Loss & Lean Deficit");
    });
  }

  if (presetNormal) {
    presetNormal.addEventListener("click", () => {
      store.updateInputs({
        height: 175,
        weight: 68,
        activity: "moderate",
        dietPreference: "standard",
        timeframe: "gradual_24"
      });
      syncInputsFromStore(store.state);
      showToast("Applied Preset: Healthy Balance & Maintenance");
    });
  }

  if (presetSurplus) {
    presetSurplus.addEventListener("click", () => {
      store.updateInputs({
        height: 180,
        weight: 58,
        activity: "active",
        dietPreference: "high_protein",
        timeframe: "moderate_16"
      });
      syncInputsFromStore(store.state);
      showToast("Applied Preset: Caloric Surplus & Lean Mass");
    });
  }
}

function syncInputsFromStore(state) {
  const heightInput = document.getElementById("input-height");
  const weightInput = document.getElementById("input-weight");
  const dietSelect = document.getElementById("select-diet");
  const timeframeSelect = document.getElementById("select-timeframe");

  if (heightInput) heightInput.value = state.height;
  if (weightInput) weightInput.value = state.weight;
  if (dietSelect) dietSelect.value = state.dietPreference;
  if (timeframeSelect) timeframeSelect.value = state.timeframe;
}
