/**
 * Core Mathematical Models for Diet & Nutrition Calculations
 * Implements BMI, Mifflin-St Jeor BMR, TDEE, Caloric Differentials, Macros & Hydration
 */

export const BMI_THRESHOLDS = {
  UNDERWEIGHT: 18.5,
  NORMAL_MAX: 24.9,
  OVERWEIGHT_MAX: 29.9,
  BASELINE_TARGET: 22.0
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: "Sedentary (desk job, little exercise)", value: 1.20, waterBonus: 0 },
  light: { label: "Lightly Active (1–3 days/wk light workout)", value: 1.375, waterBonus: 350 },
  moderate: { label: "Moderately Active (3–5 days/wk moderate workout)", value: 1.55, waterBonus: 600 },
  active: { label: "Very Active (6–7 days/wk intense workout)", value: 1.725, waterBonus: 900 }
};

export const TIMEFRAME_CONFIG = {
  gradual_24: { weeks: 24, days: 168, label: "Gradual / Sustainable (24 Weeks)" },
  moderate_16: { weeks: 16, days: 112, label: "Moderate Progression (16 Weeks)" },
  accelerated_8: { weeks: 8, days: 56, label: "Accelerated / Strict (8 Weeks)" }
};

export const GENDER_CONSTANTS = {
  male: { s: 5, minSafeCalories: 1500, label: "Male" },
  female: { s: -161, minSafeCalories: 1200, label: "Female" },
  neutral: { s: 0, minSafeCalories: 1350, label: "Non-binary / Neutral" }
};

/**
 * Calculates Body Mass Index (BMI)
 * @param {number} weightKg 
 * @param {number} heightCm 
 * @returns {{ bmi: number, bracket: string, label: string, color: string, badgeClass: string, gaugePercent: number }}
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, bracket: "normal", label: "Enter values", color: "#10b981", badgeClass: "badge-normal", gaugePercent: 50 };
  }

  const heightM = heightCm / 100;
  const bmi = +(weightKg / (heightM * heightM)).toFixed(1);

  let bracket = "normal";
  let label = "Normal Weight";
  let color = "#10b981"; // Emerald
  let badgeClass = "badge-normal";
  let gaugePercent = 50;

  if (bmi < BMI_THRESHOLDS.UNDERWEIGHT) {
    bracket = "underweight";
    label = "Underweight";
    color = "#3b82f6"; // Blue
    badgeClass = "badge-underweight";
    gaugePercent = Math.max(5, Math.min(25, (bmi / 18.5) * 25));
  } else if (bmi <= BMI_THRESHOLDS.NORMAL_MAX) {
    bracket = "normal";
    label = "Normal Weight (Target Baseline)";
    color = "#10b981"; // Green
    badgeClass = "badge-normal";
    gaugePercent = 25 + ((bmi - 18.5) / (24.9 - 18.5)) * 25;
  } else if (bmi <= BMI_THRESHOLDS.OVERWEIGHT_MAX) {
    bracket = "overweight";
    label = "Overweight";
    color = "#f59e0b"; // Orange / Amber
    badgeClass = "badge-overweight";
    gaugePercent = 50 + ((bmi - 25.0) / (29.9 - 25.0)) * 25;
  } else {
    bracket = "obese";
    label = "Obese";
    color = "#ef4444"; // Red / Crimson
    badgeClass = "badge-obese";
    gaugePercent = Math.min(98, 75 + ((bmi - 30.0) / 15.0) * 23);
  }

  return { bmi, bracket, label, color, badgeClass, gaugePercent: +gaugePercent.toFixed(1) };
}

/**
 * Calculates Mifflin-St Jeor Basal Metabolic Rate (BMR)
 * BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (yr) + s
 */
export function calculateBMR(weightKg, heightCm, ageYears, gender = "neutral") {
  const genderConfig = GENDER_CONSTANTS[gender] || GENDER_CONSTANTS.neutral;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + genderConfig.s;
  return Math.round(bmr);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr, activityKey = "moderate") {
  const activity = ACTIVITY_MULTIPLIERS[activityKey] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * activity.value);
}

/**
 * Calculates Target Caloric Target to reach normal BMI baseline (22.0 midpoint)
 */
export function calculateTargetCalories(weightKg, heightCm, tdee, timeframeKey = "moderate_16", gender = "neutral") {
  const heightM = heightCm / 100;
  const targetWeight = +(BMI_THRESHOLDS.BASELINE_TARGET * (heightM * heightM)).toFixed(1);
  const deltaWeight = +(targetWeight - weightKg).toFixed(1);

  const timeframe = TIMEFRAME_CONFIG[timeframeKey] || TIMEFRAME_CONFIG.moderate_16;
  const totalCaloricDifferential = deltaWeight * 7700; // 7700 kcal per kg of body fat
  const dailyDifferential = Math.round(totalCaloricDifferential / timeframe.days);

  const rawDailyTarget = tdee + dailyDifferential;
  const genderConfig = GENDER_CONSTANTS[gender] || GENDER_CONSTANTS.neutral;

  // Safeguard floor & bounds
  let targetCalories = Math.max(genderConfig.minSafeCalories, rawDailyTarget);
  let isCappedBySafety = rawDailyTarget < genderConfig.minSafeCalories;

  let strategy = "maintenance";
  if (deltaWeight < -1) {
    strategy = "caloric_deficit";
  } else if (deltaWeight > 1) {
    strategy = "caloric_surplus";
  }

  return {
    targetWeight,
    deltaWeight,
    totalCaloricDifferential: Math.round(totalCaloricDifferential),
    dailyDifferential,
    targetCalories: Math.round(targetCalories),
    rawDailyTarget: Math.round(rawDailyTarget),
    isCappedBySafety,
    strategy,
    timeframeDays: timeframe.days,
    timeframeWeeks: timeframe.weeks
  };
}

/**
 * Calculates macronutrient splits in grams and calories
 */
export function calculateMacros(dailyCalories, distribution = { protein_pct: 30, carbs_pct: 40, fat_pct: 30 }) {
  const proteinKcal = dailyCalories * (distribution.protein_pct / 100);
  const carbsKcal = dailyCalories * (distribution.carbs_pct / 100);
  const fatKcal = dailyCalories * (distribution.fat_pct / 100);

  return {
    protein_g: Math.round(proteinKcal / 4),
    carbs_g: Math.round(carbsKcal / 4),
    fat_g: Math.round(fatKcal / 9),
    protein_pct: distribution.protein_pct,
    carbs_pct: distribution.carbs_pct,
    fat_pct: distribution.fat_pct,
    protein_kcal: Math.round(proteinKcal),
    carbs_kcal: Math.round(carbsKcal),
    fat_kcal: Math.round(fatKcal)
  };
}

/**
 * Calculates recommended daily water intake (ml & glasses)
 */
export function calculateWaterIntake(weightKg, activityKey = "moderate") {
  const baseWater = weightKg * 35; // 35 ml per kg body weight
  const activity = ACTIVITY_MULTIPLIERS[activityKey] || ACTIVITY_MULTIPLIERS.moderate;
  const totalMl = Math.round(baseWater + activity.waterBonus);
  const liters = +(totalMl / 1000).toFixed(1);
  const glasses = Math.round(totalMl / 250); // standard 250ml glass

  return { totalMl, liters, glasses };
}
