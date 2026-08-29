/**
 * Aggregated Ingredient Shopping List Engine
 * Sums ingredient weights across the full 7-day schedule, categorizes into aisles,
 * and provides shopping list management (checking off, exporting, printing).
 */

export const AISLE_CATEGORIES = {
  produce: {
    id: "produce",
    name: "Produce & Fresh Greens",
    icon: "🥦",
    keywords: [
      "spinach", "cheera", "amaranth", "muringakka", "drumstick", "muringayila", "moringa",
      "ash gourd", "kumbalanga", "plantain", "nendran", "banana", "snake gourd", "padavalanga",
      "ivy gourd", "kovakka", "yam", "chena", "bitter gourd", "pavakka", "ridge gourd", "peechinga",
      "okra", "vendakka", "shallot", "cheriya ulli", "small onion", "onion", "curry leaves", "kariveppila",
      "green chili", "chili", "ginger", "garlic", "coriander leaves", "mint", "raw mango",
      "cucumber", "vellarikka", "tomato", "carrot", "cabbage", "beans", "beetroot", "cauliflower",
      "broccoli", "lemon", "lime", "apple", "papaya", "guava"
    ]
  },
  proteins: {
    id: "proteins",
    name: "Meat, Seafood & Plant Proteins",
    icon: "🥩",
    keywords: [
      "chicken", "fish", "sardine", "mathi", "chaala", "mackerel", "ayala", "karimeen",
      "pearl spot", "netholi", "anchovy", "choora", "tuna", "chemmeen", "prawns", "shrimp",
      "egg", "mutta", "kadala", "chickpeas", "cherupayar", "green gram", "moong",
      "toor dal", "parippu", "chana dal", "urad dal", "vanpayar", "cowpeas", "muthira", "horse gram",
      "dal", "soya", "paneer", "tofu", "turkey", "salmon", "beef", "whey", "protein powder"
    ]
  },
  dairy: {
    id: "dairy",
    name: "Dairy & Milk Alternatives",
    icon: "🥛",
    keywords: [
      "curd", "thairu", "yogurt", "buttermilk", "sambharam", "moru", "milk", "ghee", "neyy",
      "cottage cheese", "cheese", "almond milk", "soy milk"
    ]
  },
  grains: {
    id: "grains",
    name: "Grains, Breads & Legumes",
    icon: "🌾",
    keywords: [
      "matta rice", "red rice", "rice", "puttu podi", "puttu flour", "appam", "idli", "dosa",
      "idiyappam", "broken wheat", "nurukku gothambu", "dalia", "ragi", "koovapodi", "atta",
      "chapati", "phulka", "oats", "poha", "aval", "bread", "quinoa", "millet"
    ]
  },
  nuts_seeds: {
    id: "nuts_seeds",
    name: "Nuts, Seeds & Healthy Fats",
    icon: "🥑",
    keywords: [
      "coconut", "thenga", "coconut oil", "velichenna", "peanut", "groundnut", "kadalapparippu",
      "cashew", "andiparippu", "almond", "walnut", "sesame", "ellu", "chia", "flaxseed",
      "olive oil", "avocado", "pumpkin seeds"
    ]
  },
  pantry: {
    id: "pantry",
    name: "Pantry, Spices & Condiments",
    icon: "🧂",
    keywords: [
      "kudampuli", "malabar tamarind", "tamarind", "puli", "turmeric", "manjal", "chili powder",
      "mulaku podi", "coriander powder", "malli podi", "pepper", "kurumulaku", "mustard",
      "kaduku", "fenugreek", "uluva", "cumin", "jeera", "jeerakam", "fennel", "perumjeerakam",
      "sambar powder", "rasam powder", "asafoetida", "hing", "kayam", "garam masala",
      "cardamom", "cloves", "cinnamon", "salt", "vinegar", "jaggery", "sharkkara", "honey"
    ]
  }
};

/**
 * Categorizes an ingredient based on name keywords
 */
export function categorizeIngredient(name) {
  const lower = name.toLowerCase();
  for (const [key, category] of Object.entries(AISLE_CATEGORIES)) {
    for (const keyword of category.keywords) {
      if (lower.includes(keyword)) {
        return key;
      }
    }
  }
  return "pantry";
}

/**
 * Aggregates all ingredients across a 7-day weekly meal plan
 * @param {object} weeklyPlan - object with keys monday..sunday containing meal arrays
 * @returns {Array<{ categoryId: string, categoryName: string, icon: string, items: Array<{ id: string, name: string, quantity: number, unit: string, formatted: string }> }>}
 */
export function aggregateWeeklyIngredients(weeklyPlan) {
  if (!weeklyPlan) return [];

  const rawMap = new Map();

  Object.values(weeklyPlan).forEach(meals => {
    (meals || []).forEach(meal => {
      (meal.ingredients || []).forEach(ing => {
        const rawName = (ing.name || "").trim();
        if (!rawName) return;

        const normalizedKey = rawName.toLowerCase();
        const unit = (ing.unit || "g").trim().toLowerCase();
        const qty = parseFloat(ing.quantity) || 0;

        const compositeKey = `${normalizedKey}:::${unit}`;

        if (!rawMap.has(compositeKey)) {
          rawMap.set(compositeKey, {
            originalName: rawName,
            name: rawName,
            unit,
            totalQuantity: 0,
            categoryKey: categorizeIngredient(rawName)
          });
        }

        const existing = rawMap.get(compositeKey);
        existing.totalQuantity += qty;
      });
    });
  });

  // Group by category
  const categorized = {};
  Object.keys(AISLE_CATEGORIES).forEach(catKey => {
    categorized[catKey] = {
      categoryId: catKey,
      categoryName: AISLE_CATEGORIES[catKey].name,
      icon: AISLE_CATEGORIES[catKey].icon,
      items: []
    };
  });

  rawMap.forEach((entry, key) => {
    const roundedQty = Math.round(entry.totalQuantity * 10) / 10;
    let formattedText = `${roundedQty} ${entry.unit}`;

    // Nicer human formatting (e.g. 1200g -> 1.2 kg)
    if (entry.unit === "g" && roundedQty >= 1000) {
      formattedText = `${(roundedQty / 1000).toFixed(2)} kg (${roundedQty}g)`;
    } else if (entry.unit === "ml" && roundedQty >= 1000) {
      formattedText = `${(roundedQty / 1000).toFixed(2)} L (${roundedQty}ml)`;
    }

    const itemId = `grocery-${entry.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${entry.unit}`;

    const item = {
      id: itemId,
      name: entry.name,
      quantity: roundedQty,
      unit: entry.unit,
      formattedQuantity: formattedText
    };

    const targetCat = categorized[entry.categoryKey] || categorized.pantry;
    targetCat.items.push(item);
  });

  // Filter out empty categories and sort items alphabetically
  return Object.values(categorized)
    .filter(cat => cat.items.length > 0)
    .map(cat => ({
      ...cat,
      items: cat.items.sort((a, b) => a.name.localeCompare(b.name))
    }));
}

/**
 * Exports categorized grocery list to clean plain-text format for clipboard
 */
export function formatGroceryListAsText(categorizedList) {
  let text = "🛒 WEEKLY DIET GROCERY LIST (7-Day Aggregation)\n";
  text += "===============================================\n\n";

  let totalItemCount = 0;

  categorizedList.forEach(cat => {
    text += `${cat.icon} ${cat.categoryName.toUpperCase()}\n`;
    text += "-----------------------------------------------\n";
    cat.items.forEach(item => {
      text += ` [ ] ${item.name}: ${item.formattedQuantity}\n`;
      totalItemCount++;
    });
    text += "\n";
  });

  text += `Total unique ingredients: ${totalItemCount}\n`;
  text += "Generated by Antigravity Diet Planner\n";

  return text;
}
