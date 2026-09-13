/**
 * Main Application Orchestrator
 * Bootstraps the application, fetches modular configuration, attaches reactive listeners,
 * and initializes UI components and theme controllers.
 */

import { createDietStore } from "./store.js";
import { 
  renderBMIBadge, 
  renderSummaryBanner, 
  renderWeeklyPlan, 
  renderGroceryList, 
  setupGroceryActions, 
  setupPlannerHeaderActions, 
  setupBottomNavigation, 
  showToast 
} from "./ui.js";

async function initApp() {
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

    // 6. Setup Planner Header Actions (Check Alternate Plan, View Mode Toggles)
    setupPlannerHeaderActions(store);

    // 7. Setup Preset Buttons
    initQuickPresets(store);

    // 8. Setup Sticky Minimal Parameters Observer on Scroll
    initStickyParamsObserver();

    // 9. Setup Mobile Bottom Navigation Bar (Footer Component)
    setupBottomNavigation(store);

    // 9. Subscribe UI Views to Store updates
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

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
    const handleHeight = (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 80 && val <= 260) {
        store.update("height", val);
      }
    };
    heightInput.addEventListener("input", handleHeight);
    heightInput.addEventListener("change", handleHeight);
    heightInput.addEventListener("blur", (e) => {
      const val = parseFloat(e.target.value);
      if (isNaN(val) || val < 80 || val > 260) {
        e.target.value = store.state.height;
      }
    });
  }

  // Sync Weight
  if (weightInput) {
    const handleWeight = (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 25 && val <= 350) {
        store.update("weight", val);
      }
    };
    weightInput.addEventListener("input", handleWeight);
    weightInput.addEventListener("change", handleWeight);
    weightInput.addEventListener("blur", (e) => {
      const val = parseFloat(e.target.value);
      if (isNaN(val) || val < 25 || val > 350) {
        e.target.value = store.state.weight;
      }
    });
  }

  // Sync Age
  if (ageInput) {
    const handleAge = (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 12 && val <= 120) {
        store.update("age", val);
      }
    };
    ageInput.addEventListener("input", handleAge);
    ageInput.addEventListener("change", handleAge);
    ageInput.addEventListener("blur", (e) => {
      const val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 12 || val > 120) {
        e.target.value = store.state.age;
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

  const currentTheme = storedTheme || "light";
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
  const metaThemeColor = document.getElementById("meta-theme-color");
  if (iconEl) {
    iconEl.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#090d16" : "#f8fafc");
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
    presetDeficit.addEventListener("click", () => applyPreset(store, "deficit"));
  }
  if (presetNormal) {
    presetNormal.addEventListener("click", () => applyPreset(store, "normal"));
  }
  if (presetSurplus) {
    presetSurplus.addEventListener("click", () => applyPreset(store, "surplus"));
  }
}

export function applyPreset(store, presetType) {
  // Highlight active preset chip
  const chips = document.querySelectorAll(".preset-chip");
  chips.forEach(c => c.classList.remove("active"));
  const activeChip = document.getElementById(`preset-${presetType}`);
  if (activeChip) activeChip.classList.add("active");

  if (presetType === "deficit") {
    store.updateInputs({
      height: 175,
      weight: 88,
      activity: "moderate",
      dietPreference: "standard",
      timeframe: "moderate_16"
    });
    syncInputsFromStore(store.state);
    showToast("🔥 Applied Preset: Weight Loss & Lean Deficit");
  } else if (presetType === "normal") {
    store.updateInputs({
      height: 175,
      weight: 68,
      activity: "moderate",
      dietPreference: "standard",
      timeframe: "gradual_24"
    });
    syncInputsFromStore(store.state);
    showToast("⚖️ Applied Preset: Healthy Balance & Maintenance");
  } else if (presetType === "surplus") {
    store.updateInputs({
      height: 180,
      weight: 58,
      activity: "active",
      dietPreference: "high_protein",
      timeframe: "moderate_16"
    });
    syncInputsFromStore(store.state);
    showToast("💪 Applied Preset: Caloric Surplus & Lean Mass");
  }
}

function syncInputsFromStore(state) {
  const heightInput = document.getElementById("input-height");
  const weightInput = document.getElementById("input-weight");
  const ageInput = document.getElementById("input-age");
  const genderSelect = document.getElementById("select-gender");
  const activitySelect = document.getElementById("select-activity");
  const dietSelect = document.getElementById("select-diet");
  const timeframeSelect = document.getElementById("select-timeframe");
  const portionSlider = document.getElementById("slider-portion");
  const portionVal = document.getElementById("portion-scale-val");

  if (heightInput) heightInput.value = state.height;
  if (weightInput) weightInput.value = state.weight;
  if (ageInput && state.age) ageInput.value = state.age;
  if (genderSelect && state.gender) genderSelect.value = state.gender;
  if (activitySelect && state.activity) activitySelect.value = state.activity;
  if (dietSelect) dietSelect.value = state.dietPreference;
  if (timeframeSelect) timeframeSelect.value = state.timeframe;
  if (portionSlider && typeof state.portionScale === "number") {
    portionSlider.value = state.portionScale;
    if (portionVal) portionVal.textContent = `${Math.round(state.portionScale * 100)}%`;
  }
}

/**
  * Toggles minimal horizontal sticky view for Personal Parameters when scrolling down
  */
function initStickyParamsObserver() {
  const paramsCard = document.getElementById("section-params");
  if (!paramsCard) return;

  const handleScroll = () => {
    if (window.scrollY > 80) {
      paramsCard.classList.add("is-sticky-minimal");
    } else {
      paramsCard.classList.remove("is-sticky-minimal");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}
