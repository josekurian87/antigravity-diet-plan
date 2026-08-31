/**
 * Diet Resolver Engine
 * Matches (BMI Bracket + Dietary Preference + Timeline/Intensity) against diet-config.json
 * Features intelligent fallbacks, 7-day schedule synthesis, and portion scaling.
 */

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/**
 * Resolves the matching diet plan and ensures all 7 days have meal data
 * @param {object} dietConfig 
 * @param {string} bmiBracket - "underweight" | "normal" | "overweight" | "obese"
 * @param {string} dietPreference - "standard" | "vegetarian" | "vegan" | "high_protein"
 * @param {string} timeframeKey - "accelerated_8" | "moderate_16" | "gradual_24"
 * @param {number} targetCalories - Computed target calories
 * @param {number} portionScale - User multiplier or auto scale (1.0 = baseline)
 * @param {number} alternateSeed - Seed offset for refreshing alternate meal & ingredient combinations
 */
export function resolveDietPlan(dietConfig, bmiBracket, dietPreference, timeframeKey, targetCalories, portionScale = 1.0, alternateSeed = 0) {
  if (!dietConfig || !dietConfig.bmi_brackets) {
    throw new Error("Invalid or uninitialized diet configuration.");
  }

  const brackets = dietConfig.bmi_brackets;

  // 1. Resolve Bracket (with fallback)
  let bracketData = brackets[bmiBracket];
  if (!bracketData) {
    if (bmiBracket === "obese" && brackets.overweight) {
      bracketData = brackets.overweight;
    } else if (brackets.normal) {
      bracketData = brackets.normal;
    } else {
      bracketData = Object.values(brackets)[0];
    }
  }

  const targetStrategy = bracketData.target_strategy || "caloric_deficit";
  const variants = bracketData.diet_variants || {};

  // 2. Resolve Dietary Preference
  let variantData = variants[dietPreference];
  if (!variantData) {
    variantData = variants.standard || Object.values(variants)[0];
  }

  // 3. Resolve Timeframe
  let timeframePlan = variantData[timeframeKey];
  if (!timeframePlan) {
    // Pick the closest available timeframe
    const availableKeys = Object.keys(variantData);
    timeframePlan = variantData[availableKeys[0]];
  }

  const macroDistribution = timeframePlan.macro_distribution || { protein_pct: 30, carbs_pct: 40, fat_pct: 30 };
  const dailyCalorieRange = timeframePlan.daily_calorie_range || [1500, 1800];

  // 4. Resolve 7-Day Weekly Plan with Day-by-Day fallback/rotation
  const rawWeeklyPlan = timeframePlan.weekly_plan || {};
  const fullWeeklyPlan = {};

  // Find all explicitly defined days in this plan or fallbacks
  const definedDays = Object.keys(rawWeeklyPlan);
  const primaryDayKey = definedDays[0] || "monday";
  const primaryDayMeals = rawWeeklyPlan[primaryDayKey] || [];

  const standardMondayMeals = brackets.overweight?.diet_variants?.standard?.accelerated_8?.weekly_plan?.monday || primaryDayMeals;
  const scaleMultiplier = portionScale && portionScale > 0 ? portionScale : 1.0;

  // Build candidate meal pools for alternate plan variations
  const candidatePools = buildCandidateMealPools(dietConfig, dietPreference);

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    let dayMeals = rawWeeklyPlan[day];

    if (!dayMeals || dayMeals.length === 0) {
      // Check if standard accelerated plan has this day
      const fallbackDayMeals = brackets.overweight?.diet_variants?.standard?.accelerated_8?.weekly_plan?.[day];
      if (fallbackDayMeals && fallbackDayMeals.length > 0 && dietPreference === "standard") {
        dayMeals = fallbackDayMeals;
      } else {
        // Rotate from defined days with clean cloning
        const sourceDayKey = definedDays[dayIndex % definedDays.length] || primaryDayKey;
        const sourceMeals = rawWeeklyPlan[sourceDayKey] || standardMondayMeals;
        dayMeals = JSON.parse(JSON.stringify(sourceMeals));
      }
    }

    // Apply alternate plan variation if alternateSeed > 0
    let processedDayMeals = dayMeals;
    if (alternateSeed > 0) {
      processedDayMeals = dayMeals.map((meal, slotIdx) => {
        const pool = candidatePools[meal.meal_type];
        if (pool && pool.length > 0) {
          // Select a unique alternate meal based on seed, dayIndex, and slotIdx
          const idx = (dayIndex * 5 + slotIdx * 11 + alternateSeed * 7) % pool.length;
          return JSON.parse(JSON.stringify(pool[idx]));
        }
        return meal;
      });
    }

    fullWeeklyPlan[day] = processedDayMeals.map(meal => {
      const scaledCalories = Math.round(meal.calories_kcal * scaleMultiplier);
      const scaledWeight = Math.round(meal.total_weight_g * scaleMultiplier);
      const scaledProtein = meal.protein_g ? Math.round(meal.protein_g * scaleMultiplier) : undefined;
      const scaledCarbs = meal.carbs_g ? Math.round(meal.carbs_g * scaleMultiplier) : undefined;
      const scaledFat = meal.fat_g ? Math.round(meal.fat_g * scaleMultiplier) : undefined;

      const scaledIngredients = (meal.ingredients || []).map(ing => {
        const rawQty = parseFloat(ing.quantity);
        let scaledQty = ing.quantity;
        if (!isNaN(rawQty)) {
          scaledQty = Math.round(rawQty * scaleMultiplier).toString();
        }
        return {
          ...ing,
          quantity: scaledQty,
          originalQuantity: ing.quantity
        };
      });

      return {
        ...meal,
        calories_kcal: scaledCalories,
        total_weight_g: scaledWeight,
        protein_g: scaledProtein,
        carbs_g: scaledCarbs,
        fat_g: scaledFat,
        ingredients: scaledIngredients
      };
    });
  });

  // Calculate day totals for each day
  const dailyTotals = {};
  DAYS_OF_WEEK.forEach(day => {
    const meals = fullWeeklyPlan[day];
    const totalCalories = meals.reduce((acc, m) => acc + (m.calories_kcal || 0), 0);
    const totalWeight = meals.reduce((acc, m) => acc + (m.total_weight_g || 0), 0);
    const totalProtein = meals.reduce((acc, m) => acc + (m.protein_g || 0), 0);
    const totalCarbs = meals.reduce((acc, m) => acc + (m.carbs_g || 0), 0);
    const totalFat = meals.reduce((acc, m) => acc + (m.fat_g || 0), 0);

    dailyTotals[day] = {
      calories: totalCalories,
      weight_g: totalWeight,
      protein_g: totalProtein,
      carbs_g: totalCarbs,
      fat_g: totalFat
    };
  });

  return {
    bracket: bmiBracket,
    targetStrategy,
    dietPreference,
    timeframeKey,
    macroDistribution,
    dailyCalorieRange,
    weeklyPlan: fullWeeklyPlan,
    dailyTotals,
    portionScale: scaleMultiplier,
    alternateSeed
  };
}

/**
 * Builds candidate meal pools grouped by meal type from dietConfig
 */
function buildCandidateMealPools(dietConfig, dietPreference) {
  const pools = {
    Breakfast: [],
    Lunch: [],
    Snack: [],
    Dinner: []
  };

  function traverse(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (item && item.meal_type && item.item_name && Array.isArray(item.ingredients)) {
          const type = item.meal_type;
          if (pools[type] && !pools[type].some(m => m.item_name === item.item_name)) {
            pools[type].push(item);
          }
        } else {
          traverse(item);
        }
      });
    } else {
      Object.entries(obj).forEach(([key, val]) => {
        if (key === "diet_variants" && val && typeof val === "object") {
          if (val[dietPreference]) {
            traverse(val[dietPreference]);
          } else if (val.standard) {
            traverse(val.standard);
          } else {
            traverse(val);
          }
        } else {
          traverse(val);
        }
      });
    }
  }

  traverse(dietConfig);
  return pools;
}

