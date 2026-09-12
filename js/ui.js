/**
 * UI Renderer and Component Engine
 * Handles reactive DOM updates, animated counters, 7-day schedule tabs/accordions,
 * meal itemization cards, BMI gauge needle, and shopping checklist interactions.
 */

import { formatGroceryListAsText } from "./grocery.js";

const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun"
};

const MEAL_ICONS = {
  Breakfast: "🍳",
  Lunch: "🥗",
  Snack: "🍎",
  Dinner: "🍲"
};

/**
 * Renders the real-time BMI indicator badge and visual gauge
 */
export function renderBMIBadge(bmiData) {
  const badgeEl = document.getElementById("bmi-badge");
  const valueEl = document.getElementById("bmi-value");
  const gaugeNeedleEl = document.getElementById("bmi-gauge-needle");
  const targetWeightNote = document.getElementById("bmi-target-note");

  if (!bmiData) return;

  if (valueEl) {
    valueEl.textContent = `${bmiData.bmi} — ${bmiData.label}`;
  }

  if (badgeEl) {
    badgeEl.className = `bmi-status-badge ${bmiData.badgeClass}`;
    badgeEl.style.borderColor = bmiData.color;
  }

  if (gaugeNeedleEl) {
    // Percent from 0% to 100%
    gaugeNeedleEl.style.left = `${bmiData.gaugePercent}%`;
  }
}

/**
 * Renders the top summary banner with Daily Target Calories, Macros, and Water Intake
 */
export function renderSummaryBanner(state) {
  const { caloricTarget, macros, waterIntake, tdee, bmr, bmi } = state;
  if (!caloricTarget || !macros || !waterIntake) return;

  // Target Calories
  const caloriesEl = document.getElementById("target-calories-val");
  if (caloriesEl) {
    animateValue(caloriesEl, parseInt(caloriesEl.textContent) || 0, caloricTarget.targetCalories, 300);
  }

  // Differential tag
  const diffTagEl = document.getElementById("caloric-diff-badge");
  if (diffTagEl) {
    const diff = caloricTarget.dailyDifferential;
    if (diff < 0) {
      diffTagEl.innerHTML = `<span class="diff-icon">▼</span> ${Math.abs(diff)} kcal/day Deficit`;
      diffTagEl.className = "diff-badge deficit";
    } else if (diff > 0) {
      diffTagEl.innerHTML = `<span class="diff-icon">▲</span> +${diff} kcal/day Surplus`;
      diffTagEl.className = "diff-badge surplus";
    } else {
      diffTagEl.innerHTML = `<span class="diff-icon">●</span> Maintenance (${caloricTarget.targetCalories} kcal)`;
      diffTagEl.className = "diff-badge maintenance";
    }
  }

  // Target weight & delta
  const targetWeightEl = document.getElementById("target-weight-val");
  if (targetWeightEl) {
    const delta = caloricTarget.deltaWeight;
    const deltaText = delta > 0 ? `(+${delta} kg)` : delta < 0 ? `(${delta} kg)` : `(At target)`;
    targetWeightEl.textContent = `${caloricTarget.targetWeight} kg ${deltaText}`;
  }

  // TDEE & BMR display
  const tdeeEl = document.getElementById("tdee-val");
  if (tdeeEl) {
    tdeeEl.textContent = `${tdee.toLocaleString()} kcal`;
  }
  const bmrEl = document.getElementById("bmr-val");
  if (bmrEl) {
    bmrEl.textContent = `${bmr.toLocaleString()} kcal`;
  }

  // Safety Warning Flag
  const safetyEl = document.getElementById("safety-warning-banner");
  if (safetyEl) {
    if (caloricTarget.isCappedBySafety) {
      safetyEl.classList.remove("hidden");
      safetyEl.innerHTML = `⚠️ <strong>Safety Threshold Applied:</strong> Target calorie intake was raised to the clinical minimum safe floor (${caloricTarget.targetCalories} kcal/day) to prevent metabolic slowdown.`;
    } else {
      safetyEl.classList.add("hidden");
    }
  }

  // Macro Split
  const proteinGramEl = document.getElementById("macro-protein-g");
  const proteinPctEl = document.getElementById("macro-protein-pct");
  const proteinBarEl = document.getElementById("macro-bar-protein");

  const carbsGramEl = document.getElementById("macro-carbs-g");
  const carbsPctEl = document.getElementById("macro-carbs-pct");
  const carbsBarEl = document.getElementById("macro-bar-carbs");

  const fatGramEl = document.getElementById("macro-fat-g");
  const fatPctEl = document.getElementById("macro-fat-pct");
  const fatBarEl = document.getElementById("macro-bar-fat");

  if (proteinGramEl) proteinGramEl.textContent = `${macros.protein_g}g`;
  if (proteinPctEl) proteinPctEl.textContent = `${macros.protein_pct}%`;
  if (proteinBarEl) proteinBarEl.style.width = `${macros.protein_pct}%`;

  if (carbsGramEl) carbsGramEl.textContent = `${macros.carbs_g}g`;
  if (carbsPctEl) carbsPctEl.textContent = `${macros.carbs_pct}%`;
  if (carbsBarEl) carbsBarEl.style.width = `${macros.carbs_pct}%`;

  if (fatGramEl) fatGramEl.textContent = `${macros.fat_g}g`;
  if (fatPctEl) fatPctEl.textContent = `${macros.fat_pct}%`;
  if (fatBarEl) fatBarEl.style.width = `${macros.fat_pct}%`;

  // Hydration Target
  const waterLitersEl = document.getElementById("water-liters-val");
  const waterGlassesEl = document.getElementById("water-glasses-val");
  const waterIconsContainer = document.getElementById("water-icons-container");

  if (waterLitersEl) waterLitersEl.textContent = `${waterIntake.liters} L`;
  if (waterGlassesEl) waterGlassesEl.textContent = `~${waterIntake.glasses} glasses (250ml)`;

  if (waterIconsContainer) {
    const glassesCount = Math.min(16, waterIntake.glasses);
    let html = "";
    for (let i = 0; i < glassesCount; i++) {
      html += `<span class="water-glass" title="Glass ${i + 1} (250ml)">💧</span>`;
    }
    waterIconsContainer.innerHTML = html;
  }
}

/**
 * Renders the 7-day Weekly Diet Schedule (Tabs & Day Content)
 */
export function renderWeeklyPlan(state, store) {
  const { resolvedPlan, activeDay, viewMode, displayMode, portionScale } = state;
  const planContainer = document.getElementById("weekly-plan-container");
  const tabsContainer = document.getElementById("day-tabs-container");
  const dailySummaryEl = document.getElementById("active-day-summary");

  if (!planContainer || !tabsContainer) return;

  if (!resolvedPlan || !resolvedPlan.weeklyPlan) {
    planContainer.innerHTML = `<div class="empty-state-card"><p style="padding: 1.5rem; text-align: center; color: var(--text-secondary);">⚠️ Loading meal plan configuration...</p></div>`;
    return;
  }

  // Sync active state on header view mode buttons
  syncDisplayModeButtons(displayMode || "meals");

  // Normalize active day
  const days = Object.keys(resolvedPlan.weeklyPlan);
  const normalizedActiveDay = (activeDay && days.includes(activeDay.toLowerCase()))
    ? activeDay.toLowerCase()
    : (days[0] || "monday");

  // Render Day Tabs
  let tabsHtml = "";

  days.forEach(day => {
    const isActive = viewMode === "tabs" && normalizedActiveDay === day.toLowerCase();
    const totals = resolvedPlan.dailyTotals?.[day] || { calories: 0 };
    tabsHtml += `
      <button type="button" class="day-tab-btn ${isActive ? 'active' : ''}" data-day="${day}" id="tab-btn-${day}">
        <span class="day-name">${DAY_LABELS[day] || day}</span>
        <span class="day-cal-preview">${totals.calories} kcal</span>
      </button>
    `;
  });

  // Add "View All Days" tab button
  tabsHtml += `
    <button type="button" class="day-tab-btn all-days-tab ${viewMode === 'all' ? 'active' : ''}" data-day="all" id="tab-btn-all">
      <span class="day-name">🗓️ All 7 Days</span>
      <span class="day-cal-preview">Full Week</span>
    </button>
  `;

  tabsContainer.innerHTML = tabsHtml;

  // Wire Tab Click Events
  tabsContainer.querySelectorAll(".day-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedDay = btn.getAttribute("data-day");
      if (selectedDay === "all") {
        store.update("viewMode", "all");
      } else {
        store.updateInputs({
          viewMode: "tabs",
          activeDay: selectedDay
        });
      }
    });
  });

  // Render Daily Summary bar for active day
  if (dailySummaryEl) {
    if (viewMode === "tabs") {
      const totals = resolvedPlan.dailyTotals?.[normalizedActiveDay] || {};
      dailySummaryEl.innerHTML = `
        <div class="day-summary-card">
          <div class="day-title-wrap">
            <h3 class="active-day-title">${capitalize(normalizedActiveDay)} Schedule</h3>
            <span class="day-summary-badge">${totals.calories || 0} Total Calories</span>
          </div>
          <div class="day-summary-macros">
            <span class="macro-tag protein">🍗 Protein: <strong>${totals.protein_g || 0}g</strong></span>
            <span class="macro-tag carbs">🌾 Carbs: <strong>${totals.carbs_g || 0}g</strong></span>
            <span class="macro-tag fat">🥑 Fat: <strong>${totals.fat_g || 0}g</strong></span>
            <span class="macro-tag weight">⚖️ Food Weight: <strong>${totals.weight_g || 0}g</strong></span>
          </div>
        </div>
      `;
      dailySummaryEl.style.display = "block";
    } else {
      dailySummaryEl.style.display = "none";
    }
  }

  // Render Meals Container
  let mealsHtml = "";
  const currentDisplay = displayMode || "meals";

  if (viewMode === "tabs") {
    const meals = resolvedPlan.weeklyPlan[normalizedActiveDay] || resolvedPlan.weeklyPlan[days[0]] || [];
    mealsHtml = `
      <div class="day-meals-grid display-mode-${currentDisplay}" id="day-meals-${normalizedActiveDay}">
        ${meals.length > 0
          ? meals.map((meal, idx) => renderMealCard(meal, idx, normalizedActiveDay, currentDisplay)).join("")
          : `<p class="empty-state" style="padding: 1.5rem; text-align: center; color: var(--text-secondary);">No meals scheduled for this day.</p>`
        }
      </div>
    `;
  } else {
    // All 7 Days View
    mealsHtml = `<div class="all-days-wrapper display-mode-${currentDisplay}">`;
    days.forEach(day => {
      const meals = resolvedPlan.weeklyPlan[day] || [];
      const totals = resolvedPlan.dailyTotals?.[day] || {};
      mealsHtml += `
        <section class="all-day-section" id="section-${day}">
          <div class="all-day-header">
            <h3 class="all-day-heading">${capitalize(day)}</h3>
            <div class="all-day-meta">
              <span>🔥 ${totals.calories} kcal</span>
              <span>🍗 ${totals.protein_g || 0}g P</span>
              <span>🌾 ${totals.carbs_g || 0}g C</span>
              <span>🥑 ${totals.fat_g || 0}g F</span>
            </div>
          </div>
          <div class="day-meals-grid">
            ${meals.map((meal, idx) => renderMealCard(meal, idx, day, currentDisplay)).join("")}
          </div>
        </section>
      `;
    });
    mealsHtml += `</div>`;
  }

  planContainer.innerHTML = mealsHtml;

  // Wire Accordion Toggle for Meal Ingredients (click & keyboard)
  planContainer.querySelectorAll(".meal-card-header").forEach(header => {
    const toggleMealCard = () => {
      const card = header.closest(".meal-card");
      if (card) {
        const isCollapsed = card.classList.toggle("collapsed");
        header.setAttribute("aria-expanded", (!isCollapsed).toString());
      }
    };

    header.addEventListener("click", toggleMealCard);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMealCard();
      }
    });
  });
}

/**
 * Generates HTML for an individual Meal Card with clear separation between Meals & Ingredients
 */
function renderMealCard(meal, index, day, displayMode = "meals") {
  const icon = MEAL_ICONS[meal.meal_type] || "🍽️";
  const ingredients = meal.ingredients || [];

  return `
    <article class="meal-card mode-${displayMode}" data-meal-type="${meal.meal_type}" id="card-${day}-${index}">
      <header class="meal-card-header" role="button" tabindex="0" aria-expanded="true">
        <div class="meal-header-left">
          <span class="meal-icon-badge">${icon}</span>
          <div>
            <div class="meal-title-sub-row">
              <span class="meal-type-label">${meal.meal_type}</span>
              <span class="ing-count-badge">🥦 ${ingredients.length} items</span>
            </div>
            <h4 class="meal-item-name">${meal.item_name}</h4>
          </div>
        </div>
        <div class="meal-header-right">
          <div class="meal-metrics">
            <span class="meal-cal-badge">${meal.calories_kcal} kcal</span>
            <span class="meal-weight-badge">${meal.total_weight_g}g portion</span>
          </div>
          <button type="button" class="accordion-toggle-btn" aria-label="Toggle meal details">
            <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      <div class="meal-card-content">
        ${meal.protein_g ? `
          <div class="meal-macros-row">
            <span class="meal-macro-pill p">🍗 Protein: <strong>${meal.protein_g}g</strong></span>
            <span class="meal-macro-pill c">🌾 Carbs: <strong>${meal.carbs_g}g</strong></span>
            <span class="meal-macro-pill f">🥑 Fat: <strong>${meal.fat_g}g</strong></span>
          </div>
        ` : ''}

        <div class="ingredients-section">
          <div class="ingredients-section-header">
            <h5 class="ingredients-title">🥗 Itemized Ingredients & Amounts</h5>
            <span class="ingredients-sub-tag">Fresh Kerala Produce</span>
          </div>
          <div class="ingredients-grid">
            ${ingredients.map(ing => `
              <div class="ingredient-chip">
                <span class="ing-bullet">•</span>
                <span class="ing-name">${ing.name}</span>
                <span class="ing-quantity">${ing.quantity} ${ing.unit}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders the Aggregated Weekly Grocery Shopping List
 */
export function renderGroceryList(state, store) {
  const { groceryList, checkedGroceryItems } = state;
  const container = document.getElementById("grocery-list-container");
  const countBadge = document.getElementById("grocery-count-badge");
  const progressFill = document.getElementById("grocery-progress-bar");
  const progressText = document.getElementById("grocery-progress-text");

  if (!container) return;

  if (!groceryList || groceryList.length === 0) {
    container.innerHTML = `<p class="empty-state">No ingredients found for current plan.</p>`;
    return;
  }

  // Calculate totals for progress
  let totalItemsCount = 0;
  groceryList.forEach(cat => totalItemsCount += cat.items.length);
  const checkedCount = (checkedGroceryItems || []).length;
  const percentChecked = totalItemsCount > 0 ? Math.round((checkedCount / totalItemsCount) * 100) : 0;

  if (countBadge) {
    countBadge.textContent = `${totalItemsCount} items`;
  }
  const navBadge = document.getElementById("nav-badge-grocery");
  if (navBadge) {
    navBadge.textContent = totalItemsCount.toString();
  }
  if (progressFill) {
    progressFill.style.width = `${percentChecked}%`;
  }
  if (progressText) {
    progressText.textContent = `${checkedCount} of ${totalItemsCount} items checked (${percentChecked}%)`;
  }

  let html = "";
  groceryList.forEach(cat => {
    html += `
      <div class="grocery-aisle-group">
        <h4 class="grocery-aisle-title">
          <span class="aisle-icon">${cat.icon}</span>
          <span>${cat.categoryName}</span>
          <span class="aisle-count">(${cat.items.length})</span>
        </h4>
        <div class="grocery-items-grid">
          ${cat.items.map(item => {
            const isChecked = (checkedGroceryItems || []).includes(item.id);
            return `
              <label class="grocery-item-card ${isChecked ? 'checked' : ''}" for="${item.id}">
                <input type="checkbox" id="${item.id}" class="grocery-checkbox" ${isChecked ? 'checked' : ''} data-item-id="${item.id}">
                <span class="custom-checkbox"></span>
                <span class="item-details">
                  <span class="item-name">${item.name}</span>
                  <span class="item-qty">${item.formattedQuantity}</span>
                </span>
              </label>
            `;
          }).join("")}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Wire checkbox events
  container.querySelectorAll(".grocery-checkbox").forEach(chk => {
    chk.addEventListener("change", (e) => {
      const itemId = e.target.getAttribute("data-item-id");
      store.toggleGroceryItem(itemId);
    });
  });
}

/**
 * Wires action buttons for grocery list (Copy, Print, Reset)
 */
export function setupGroceryActions(store) {
  const copyBtn = document.getElementById("btn-copy-grocery");
  const printBtn = document.getElementById("btn-print-grocery");
  const clearBtn = document.getElementById("btn-clear-grocery");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const list = store.state.groceryList;
      const text = formatGroceryListAsText(list);
      try {
        await navigator.clipboard.writeText(text);
        showToast("✅ Grocery list copied to clipboard!");
      } catch (err) {
        // Fallback for non-https/restricted clipboard
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast("✅ Grocery list copied to clipboard!");
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      store.clearCheckedGroceries();
      showToast("Checked items cleared.");
    });
  }
}

/**
 * Toast Notification Helper
 */
export function showToast(message, durationMs = 2800) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, durationMs);
}

/**
 * Animated number counter for smooth DOM updates
 */
function animateValue(element, start, end, duration) {
  if (start === end) return;
  const range = end - start;
  let current = start;
  const increment = end > start ? Math.ceil(range / 20) : Math.floor(range / 20);
  const stepTime = Math.abs(Math.floor(duration / 20));

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = current.toLocaleString();
  }, stepTime);
}

/**
 * Wires the "Check Alternate Plan" button and Schedule View Mode toggles
 */
export function setupPlannerHeaderActions(store) {
  const alternateBtn = document.getElementById("btn-alternate-plan");
  const headerAlternateBtn = document.getElementById("header-alternate-btn");
  const viewBtns = document.querySelectorAll(".view-mode-btn");

  const triggerSwap = () => {
    const icon = (alternateBtn && alternateBtn.querySelector(".refresh-icon")) || (headerAlternateBtn && headerAlternateBtn.querySelector(".refresh-icon"));
    if (icon) {
      icon.classList.add("spinning");
      setTimeout(() => icon.classList.remove("spinning"), 600);
    }
    store.generateAlternatePlan();
    showToast("✨ Refreshed Alternate Kerala Meals & Ingredients!");
  };

  if (alternateBtn) alternateBtn.addEventListener("click", triggerSwap);
  if (headerAlternateBtn) headerAlternateBtn.addEventListener("click", triggerSwap);

  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-display-mode");
      if (mode) {
        store.update("displayMode", mode);
        syncDisplayModeButtons(mode);
      }
    });
  });
}

function syncDisplayModeButtons(currentMode) {
  const viewBtns = document.querySelectorAll(".view-mode-btn");
  viewBtns.forEach(btn => {
    const mode = btn.getAttribute("data-display-mode");
    if (mode === currentMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Setup Mobile Bottom Navigation Bar (Footer Component)
 */
export function setupBottomNavigation(store) {
  const navButtons = document.querySelectorAll(".nav-tab-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-nav-target");
      if (!targetId) return;

      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/**
 * Setup Mobile Quick Presets Drawer / Modal
 */
export function setupMobilePresetsDrawer(store, applyPresetCallback) {
  const drawer = document.getElementById("mobile-presets-drawer");
  const openBtn = document.getElementById("header-presets-btn");
  const closeBtn = document.getElementById("drawer-close-btn");
  const overlay = document.getElementById("drawer-overlay");

  const deficitBtn = document.getElementById("drawer-preset-deficit");
  const normalBtn = document.getElementById("drawer-preset-normal");
  const surplusBtn = document.getElementById("drawer-preset-surplus");

  function openDrawer() {
    if (drawer) {
      drawer.classList.remove("hidden");
      drawer.setAttribute("aria-hidden", "false");
    }
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.add("hidden");
      drawer.setAttribute("aria-hidden", "true");
    }
  }

  if (openBtn) openBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  if (deficitBtn) {
    deficitBtn.addEventListener("click", () => {
      if (applyPresetCallback) applyPresetCallback("deficit");
      closeDrawer();
    });
  }
  if (normalBtn) {
    normalBtn.addEventListener("click", () => {
      if (applyPresetCallback) applyPresetCallback("normal");
      closeDrawer();
    });
  }
  if (surplusBtn) {
    surplusBtn.addEventListener("click", () => {
      if (applyPresetCallback) applyPresetCallback("surplus");
      closeDrawer();
    });
  }
}
