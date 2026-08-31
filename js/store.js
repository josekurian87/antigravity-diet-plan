/**
 * Reactive Proxy Store
 * Provides fine-grained reactive state management for user inputs, computed diet metrics,
 * active weekly meal plan, and shopping checklist.
 */

import { calculateBMI, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros, calculateWaterIntake } from "./calculator.js";
import { resolveDietPlan } from "./dietResolver.js";
import { aggregateWeeklyIngredients } from "./grocery.js";

const STORAGE_KEY = "antigravity_diet_planner_v1";

const DEFAULT_STATE = {
  // User Inputs
  height: 175,
  weight: 80,
  age: 28,
  gender: "male",
  activity: "moderate",
  dietPreference: "standard",
  timeframe: "moderate_16",
  portionScale: 1.0,
  activeDay: "monday",
  viewMode: "tabs", // "tabs" or "all"
  displayMode: "meals", // "meals", "ingredients", "combined"
  alternateSeed: 0,
  checkedGroceryItems: [],

  // Loaded Config
  dietConfig: null,

  // Computed Properties (Initialized via recomputeMetrics)
  bmi: null,
  bmr: 0,
  tdee: 0,
  caloricTarget: null,
  macros: null,
  waterIntake: null,
  resolvedPlan: null,
  groceryList: []
};

/**
 * Loads persisted settings from LocalStorage
 */
function loadPersistedState() {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      height: typeof parsed.height === "number" ? parsed.height : undefined,
      weight: typeof parsed.weight === "number" ? parsed.weight : undefined,
      age: typeof parsed.age === "number" ? parsed.age : undefined,
      gender: parsed.gender || undefined,
      activity: parsed.activity || undefined,
      dietPreference: parsed.dietPreference || undefined,
      timeframe: parsed.timeframe || undefined,
      displayMode: parsed.displayMode || undefined,
      checkedGroceryItems: Array.isArray(parsed.checkedGroceryItems) ? parsed.checkedGroceryItems : []
    };
  } catch (err) {
    console.warn("Could not load persisted state", err);
    return {};
  }
}

/**
 * Saves user settings to LocalStorage
 */
function persistState(state) {
  try {
    if (typeof localStorage === "undefined") return;
    const dataToSave = {
      height: state.height,
      weight: state.weight,
      age: state.age,
      gender: state.gender,
      activity: state.activity,
      dietPreference: state.dietPreference,
      timeframe: state.timeframe,
      displayMode: state.displayMode,
      checkedGroceryItems: state.checkedGroceryItems
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.warn("Could not persist state", err);
  }
}

/**
 * Recomputes all derived metrics from current inputs and dietConfig
 */
function recompute(state) {
  // 1. BMI Calculation
  state.bmi = calculateBMI(state.weight, state.height);

  // 2. BMR & TDEE
  state.bmr = calculateBMR(state.weight, state.height, state.age, state.gender);
  state.tdee = calculateTDEE(state.bmr, state.activity);

  // 3. Caloric Target & Differentials
  state.caloricTarget = calculateTargetCalories(
    state.weight,
    state.height,
    state.tdee,
    state.timeframe,
    state.gender
  );

  // 4. Hydration Target
  state.waterIntake = calculateWaterIntake(state.weight, state.activity);

  // 5. Diet Plan Resolution (if config is loaded)
  if (state.dietConfig) {
    state.resolvedPlan = resolveDietPlan(
      state.dietConfig,
      state.bmi.bracket,
      state.dietPreference,
      state.timeframe,
      state.caloricTarget.targetCalories,
      state.portionScale,
      state.alternateSeed || 0
    );

    // 6. Macro Distribution
    state.macros = calculateMacros(
      state.caloricTarget.targetCalories,
      state.resolvedPlan.macroDistribution
    );

    // 7. Aggregated Grocery List
    state.groceryList = aggregateWeeklyIngredients(state.resolvedPlan.weeklyPlan);
  }
}

/**
 * Creates the reactive store
 */
export function createDietStore(initialConfig = null) {
  const saved = loadPersistedState();
  const rawState = {
    ...DEFAULT_STATE,
    ...saved,
    dietConfig: initialConfig
  };

  const listeners = new Set();
  let pendingUpdate = false;
  let changedProperties = new Set();

  // Run initial calculations
  recompute(rawState);

  function notifySubscribers() {
    if (pendingUpdate) return;
    pendingUpdate = true;

    // Batch notifications via microtask
    queueMicrotask(() => {
      pendingUpdate = false;
      const keysArray = Array.from(changedProperties);
      changedProperties.clear();

      persistState(rawState);

      listeners.forEach(cb => {
        try {
          cb(proxyState, keysArray);
        } catch (err) {
          console.error("Store subscriber error:", err);
        }
      });
    });
  }

  const proxyState = new Proxy(rawState, {
    set(target, prop, value) {
      if (target[prop] === value) return true;

      target[prop] = value;
      changedProperties.add(prop);

      // Recompute metrics when inputs or config change
      const inputProps = ["height", "weight", "age", "gender", "activity", "dietPreference", "timeframe", "portionScale", "dietConfig", "alternateSeed"];
      if (inputProps.includes(prop)) {
        recompute(target);
      }

      notifySubscribers();
      return true;
    }
  });

  return {
    state: proxyState,

    subscribe(callback) {
      listeners.add(callback);
      // Immediately notify listener on initial subscribe
      callback(proxyState, ["__init__"]);
      return () => listeners.delete(callback);
    },

    setDietConfig(config) {
      proxyState.dietConfig = config;
    },

    update(prop, value) {
      proxyState[prop] = value;
    },

    updateInputs(inputs) {
      Object.entries(inputs).forEach(([k, v]) => {
        proxyState[k] = v;
      });
    },

    toggleGroceryItem(itemId) {
      const items = [...proxyState.checkedGroceryItems];
      const idx = items.indexOf(itemId);
      if (idx >= 0) {
        items.splice(idx, 1);
      } else {
        items.push(itemId);
      }
      proxyState.checkedGroceryItems = items;
    },

    clearCheckedGroceries() {
      proxyState.checkedGroceryItems = [];
    },

    generateAlternatePlan() {
      proxyState.alternateSeed = (proxyState.alternateSeed || 0) + 1;
    }
  };
}
