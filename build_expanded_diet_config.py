import json
import os

# Extensive Database of Authentic Kerala Cuisine Meals

# 1. STANDARD KERALA MEALS (Non-Veg, Fish, Eggs, Veg, Ghee, Coconut)
MEALS_STANDARD_BREAKFAST = [
  {"item_name": "Steamed Puttu with Nadan Kadala Curry & Steamed Plantain", "total_weight_g": 315, "calories_kcal": 360, "protein_g": 14, "carbs_g": 58, "fat_g": 8, "ingredients": [{"name": "Puttu Podi (Coarse Rice Flour)", "quantity": "60", "unit": "g"}, {"name": "Fresh Grated Coconut (Thenga Peera)", "quantity": "15", "unit": "g"}, {"name": "Black Chickpeas (Kadala)", "quantity": "80", "unit": "g"}, {"name": "Shallots (Cheriya Ulli)", "quantity": "25", "unit": "g"}, {"name": "Coconut Oil", "quantity": "4", "unit": "ml"}, {"name": "Steamed Nendran Banana", "quantity": "60", "unit": "g"}]},
  {"item_name": "Soft Appam with Kerala Mutton Stew & Coconut Milk", "total_weight_g": 340, "calories_kcal": 420, "protein_g": 22, "carbs_g": 48, "fat_g": 16, "ingredients": [{"name": "Fermented Rice Batter", "quantity": "120", "unit": "g"}, {"name": "Fresh Coconut Milk", "quantity": "80", "unit": "ml"}, {"name": "Tender Mutton Chunks", "quantity": "90", "unit": "g"}, {"name": "Potatoes & Carrots", "quantity": "60", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Idiyappam (String Hoppers) with Nadan Egg Roast", "total_weight_g": 290, "calories_kcal": 380, "protein_g": 16, "carbs_g": 52, "fat_g": 12, "ingredients": [{"name": "Steamed Rice String Hoppers", "quantity": "130", "unit": "g"}, {"name": "Boiled Farm Eggs", "quantity": "100", "unit": "g"}, {"name": "Sliced Shallots & Onions", "quantity": "50", "unit": "g"}, {"name": "Tomatoes & Curry Leaves", "quantity": "30", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Malabar Pathiri with Kerala Chicken Mappas", "total_weight_g": 320, "calories_kcal": 430, "protein_g": 24, "carbs_g": 46, "fat_g": 17, "ingredients": [{"name": "Thin Rice Flatbread (Pathiri)", "quantity": "110", "unit": "g"}, {"name": "Boneless Chicken Chunks", "quantity": "100", "unit": "g"}, {"name": "Thick Coconut Milk", "quantity": "65", "unit": "ml"}, {"name": "Shallots & Ginger", "quantity": "25", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Crisp Kerala Dosa with Spicy Sambar & Red Chili Chammanthi", "total_weight_g": 310, "calories_kcal": 350, "protein_g": 10, "carbs_g": 60, "fat_g": 8, "ingredients": [{"name": "Fermented Rice Batter", "quantity": "140", "unit": "g"}, {"name": "Toor Dal Sambar", "quantity": "110", "unit": "g"}, {"name": "Red Chili Chammanthi", "quantity": "35", "unit": "g"}, {"name": "Pure Ghee", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Roasted Rava Upma with Cashews, Mustard & Fresh Nendran Banana", "total_weight_g": 280, "calories_kcal": 340, "protein_g": 8, "carbs_g": 56, "fat_g": 9, "ingredients": [{"name": "Roasted Semolina (Rava)", "quantity": "70", "unit": "g"}, {"name": "Cashews & Mustard Seeds", "quantity": "12", "unit": "g"}, {"name": "Green Chilies & Curry Leaves", "quantity": "10", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}, {"name": "Ripe Nendran Banana", "quantity": "70", "unit": "g"}]},
  {"item_name": "Boiled Tapioca (Kappa) with Spicy Kottayam Fish Curry", "total_weight_g": 360, "calories_kcal": 410, "protein_g": 20, "carbs_g": 58, "fat_g": 10, "ingredients": [{"name": "Boiled Seasoned Tapioca", "quantity": "180", "unit": "g"}, {"name": "Seer Fish (Neymeen)", "quantity": "100", "unit": "g"}, {"name": "Kudampuli Gravy", "quantity": "50", "unit": "g"}, {"name": "Shallots", "quantity": "20", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Steamed Wheat Puttu with Cherupayar (Green Gram) Curry & Pappadam", "total_weight_g": 300, "calories_kcal": 350, "protein_g": 14, "carbs_g": 54, "fat_g": 9, "ingredients": [{"name": "Whole Wheat Puttu Flour", "quantity": "65", "unit": "g"}, {"name": "Grated Coconut", "quantity": "15", "unit": "g"}, {"name": "Whole Green Gram", "quantity": "80", "unit": "g"}, {"name": "Kerala Rice Pappadam", "quantity": "10", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Ela Ada (Steamed Rice Parcel with Jaggery & Coconut) & Milk", "total_weight_g": 260, "calories_kcal": 330, "protein_g": 7, "carbs_g": 59, "fat_g": 8, "ingredients": [{"name": "Steamed Rice Dough", "quantity": "90", "unit": "g"}, {"name": "Organic Jaggery", "quantity": "30", "unit": "g"}, {"name": "Grated Coconut", "quantity": "25", "unit": "g"}, {"name": "Low-Fat Cow Milk", "quantity": "110", "unit": "ml"}]},
  {"item_name": "Kallappam with Mild Kerala Chicken Stew", "total_weight_g": 330, "calories_kcal": 410, "protein_g": 23, "carbs_g": 47, "fat_g": 14, "ingredients": [{"name": "Cumin Rice Pancakes", "quantity": "130", "unit": "g"}, {"name": "Chicken Thigh Chunks", "quantity": "95", "unit": "g"}, {"name": "Coconut Milk", "quantity": "70", "unit": "ml"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Fluffy Vellayappam with Roasted Egg Curry", "total_weight_g": 305, "calories_kcal": 370, "protein_g": 15, "carbs_g": 50, "fat_g": 12, "ingredients": [{"name": "Fermented Soft Appams", "quantity": "120", "unit": "g"}, {"name": "Boiled Farm Eggs", "quantity": "100", "unit": "g"}, {"name": "Caramelized Onion Gravy", "quantity": "50", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Steamed Idli with Tangy Tomato Chammanthi & Coconut Podi", "total_weight_g": 270, "calories_kcal": 310, "protein_g": 9, "carbs_g": 55, "fat_g": 6, "ingredients": [{"name": "Steamed Idlis", "quantity": "140", "unit": "g"}, {"name": "Tomato Shallot Chutney", "quantity": "60", "unit": "g"}, {"name": "Coconut Podi", "quantity": "15", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Whole Wheat Gothambu Dosa with Spicy Shallot Chutney", "total_weight_g": 280, "calories_kcal": 320, "protein_g": 9, "carbs_g": 53, "fat_g": 8, "ingredients": [{"name": "Wheat Crepe", "quantity": "150", "unit": "g"}, {"name": "Red Chili Shallot Chutney", "quantity": "50", "unit": "g"}, {"name": "Grated Coconut", "quantity": "10", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Healthy Oats Puttu with Spiced Egg White Scramble", "total_weight_g": 290, "calories_kcal": 340, "protein_g": 20, "carbs_g": 42, "fat_g": 8, "ingredients": [{"name": "Rolled Oats Puttu Flour", "quantity": "65", "unit": "g"}, {"name": "Grated Coconut", "quantity": "12", "unit": "g"}, {"name": "Egg Whites Scrambled", "quantity": "120", "unit": "g"}, {"name": "Coconut Oil", "quantity": "4", "unit": "ml"}]},
  {"item_name": "Kerala Style Poori & Potato Gravy with Mustard Tempering", "total_weight_g": 310, "calories_kcal": 390, "protein_g": 9, "carbs_g": 56, "fat_g": 14, "ingredients": [{"name": "Fried Wheat Poori", "quantity": "100", "unit": "g"}, {"name": "Potato Gravy", "quantity": "140", "unit": "g"}, {"name": "Coconut Oil", "quantity": "8", "unit": "ml"}]},
  {"item_name": "Bamboo Rice (Mulayari) Kanji with Roasted Coconut & Desi Ghee", "total_weight_g": 380, "calories_kcal": 330, "protein_g": 10, "carbs_g": 58, "fat_g": 7, "ingredients": [{"name": "Bamboo Rice Gruel", "quantity": "220", "unit": "g"}, {"name": "Toasted Coconut", "quantity": "20", "unit": "g"}, {"name": "Pure Desi Ghee", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Raw Jackfruit (Chakka) Puttu with Kadala Curry", "total_weight_g": 310, "calories_kcal": 350, "protein_g": 13, "carbs_g": 56, "fat_g": 8, "ingredients": [{"name": "Raw Jackfruit Powder Puttu", "quantity": "70", "unit": "g"}, {"name": "Grated Coconut", "quantity": "15", "unit": "g"}, {"name": "Kadala Curry", "quantity": "85", "unit": "g"}]},
  {"item_name": "Palak (Spinach) Rice Dosa with Fresh Coconut Chutney", "total_weight_g": 290, "calories_kcal": 320, "protein_g": 10, "carbs_g": 52, "fat_g": 7, "ingredients": [{"name": "Spinach Dosa Batter", "quantity": "150", "unit": "g"}, {"name": "Coconut Chutney", "quantity": "40", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Broken Wheat (Gothambu Rava) Upma with Steamed Plantain", "total_weight_g": 290, "calories_kcal": 330, "protein_g": 9, "carbs_g": 54, "fat_g": 8, "ingredients": [{"name": "Broken Wheat Dalia", "quantity": "75", "unit": "g"}, {"name": "Steamed Nendran Banana", "quantity": "60", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Soya Chunks & Scrambled Egg Burji with Rice Pathiri", "total_weight_g": 310, "calories_kcal": 390, "protein_g": 26, "carbs_g": 40, "fat_g": 12, "ingredients": [{"name": "Rice Pathiri", "quantity": "100", "unit": "g"}, {"name": "Minced Soya & Egg Burji", "quantity": "110", "unit": "g"}, {"name": "Coconut Oil", "quantity": "5", "unit": "ml"}]}
]

MEALS_STANDARD_LUNCH = [
  {"item_name": "Kerala Matta Rice Oonu with Kudampuli Mathi (Sardine) Curry & Cheera Thoran", "total_weight_g": 470, "calories_kcal": 490, "protein_g": 32, "carbs_g": 58, "fat_g": 14, "ingredients": [{"name": "Cooked Matta Rice", "quantity": "160", "unit": "g"}, {"name": "Fresh Sardines (Mathi)", "quantity": "140", "unit": "g"}, {"name": "Red Amaranth (Cheera Thoran)", "quantity": "85", "unit": "g"}, {"name": "Spiced Buttermilk", "quantity": "130", "unit": "ml"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Kerala Red Rice with Ayala (Mackerel) Fry, Parippu & Cabbage Thoran", "total_weight_g": 510, "calories_kcal": 530, "protein_g": 35, "carbs_g": 60, "fat_g": 16, "ingredients": [{"name": "Matta Rice", "quantity": "170", "unit": "g"}, {"name": "Pan-Fried Mackerel", "quantity": "120", "unit": "g"}, {"name": "Moong Dal Parippu with Ghee", "quantity": "90", "unit": "g"}, {"name": "Cabbage Thoran", "quantity": "80", "unit": "g"}, {"name": "Coconut Oil", "quantity": "8", "unit": "ml"}]},
  {"item_name": "Thalassery Fish Biryani (Kaima Rice & Seer Fish) with Mint Raita", "total_weight_g": 480, "calories_kcal": 560, "protein_g": 36, "carbs_g": 62, "fat_g": 18, "ingredients": [{"name": "Kaima Rice", "quantity": "160", "unit": "g"}, {"name": "Seer Fish Fillet (Neymeen)", "quantity": "130", "unit": "g"}, {"name": "Pure Ghee", "quantity": "10", "unit": "ml"}, {"name": "Mint Raita", "quantity": "80", "unit": "g"}]},
  {"item_name": "Malabar Chicken Biryani with Fried Shallots & Beetroot Salad", "total_weight_g": 520, "calories_kcal": 590, "protein_g": 38, "carbs_g": 64, "fat_g": 19, "ingredients": [{"name": "Kaima Rice", "quantity": "170", "unit": "g"}, {"name": "Chicken Chunks", "quantity": "150", "unit": "g"}, {"name": "Pure Ghee", "quantity": "10", "unit": "ml"}, {"name": "Beetroot Salad", "quantity": "75", "unit": "g"}]},
  {"item_name": "Matta Rice with Nadan Kozhi Curry & Kovakka Thoran", "total_weight_g": 490, "calories_kcal": 510, "protein_g": 34, "carbs_g": 57, "fat_g": 15, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Kerala Chicken Curry", "quantity": "140", "unit": "g"}, {"name": "Ivy Gourd Thoran", "quantity": "85", "unit": "g"}, {"name": "Pepper Rasam", "quantity": "100", "unit": "ml"}, {"name": "Coconut Oil", "quantity": "7", "unit": "ml"}]},
  {"item_name": "Grand Kerala Sadya Lunch: Matta Rice, Parippu, Sambar, Avial & Olan", "total_weight_g": 550, "calories_kcal": 540, "protein_g": 16, "carbs_g": 85, "fat_g": 14, "ingredients": [{"name": "Matta Rice", "quantity": "180", "unit": "g"}, {"name": "Parippu with Ghee", "quantity": "80", "unit": "g"}, {"name": "Sambar", "quantity": "90", "unit": "g"}, {"name": "Avial", "quantity": "80", "unit": "g"}, {"name": "Olan", "quantity": "70", "unit": "g"}]},
  {"item_name": "Matta Rice with Chemmeen (Prawns) Roast & Kaya Mezhukkupuratti", "total_weight_g": 480, "calories_kcal": 520, "protein_g": 33, "carbs_g": 59, "fat_g": 15, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Prawns Roast", "quantity": "125", "unit": "g"}, {"name": "Raw Plantain Stir-Fry", "quantity": "80", "unit": "g"}, {"name": "Pulissery", "quantity": "100", "unit": "ml"}, {"name": "Coconut Oil", "quantity": "7", "unit": "ml"}]},
  {"item_name": "Seasoned Tapioca (Kappa) with Fiery Red Kudampuli King Fish Curry", "total_weight_g": 500, "calories_kcal": 530, "protein_g": 30, "carbs_g": 65, "fat_g": 13, "ingredients": [{"name": "Mashed Tapioca (Kappa)", "quantity": "220", "unit": "g"}, {"name": "King Fish Red Curry", "quantity": "130", "unit": "g"}, {"name": "Kudampuli Gravy", "quantity": "60", "unit": "g"}, {"name": "Coconut Oil", "quantity": "8", "unit": "ml"}]},
  {"item_name": "Matta Rice with Malabar Crab (Njandu) Curry & Vendakka Thoran", "total_weight_g": 490, "calories_kcal": 500, "protein_g": 31, "carbs_g": 58, "fat_g": 14, "ingredients": [{"name": "Matta Rice", "quantity": "160", "unit": "g"}, {"name": "Crab Curry", "quantity": "140", "unit": "g"}, {"name": "Okra Thoran", "quantity": "80", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Matta Rice with Slow-Roasted Beef Ularthiyathu & Beetroot Thoran", "total_weight_g": 510, "calories_kcal": 570, "protein_g": 36, "carbs_g": 56, "fat_g": 18, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Beef Ularthiyathu", "quantity": "130", "unit": "g"}, {"name": "Beetroot Thoran", "quantity": "85", "unit": "g"}, {"name": "Coconut Oil", "quantity": "8", "unit": "ml"}]},
  {"item_name": "Matta Rice with Pumpkin Erissery & French Beans Thoran", "total_weight_g": 460, "calories_kcal": 440, "protein_g": 14, "carbs_g": 72, "fat_g": 11, "ingredients": [{"name": "Matta Rice", "quantity": "170", "unit": "g"}, {"name": "Pumpkin Erissery", "quantity": "110", "unit": "g"}, {"name": "French Beans Thoran", "quantity": "80", "unit": "g"}, {"name": "Moru Kachiathu", "quantity": "90", "unit": "ml"}]},
  {"item_name": "Aromatic Ghee Rice (Neychoru) with Rich Malabar Mutton Gravy", "total_weight_g": 530, "calories_kcal": 610, "protein_g": 34, "carbs_g": 62, "fat_g": 22, "ingredients": [{"name": "Ghee Rice", "quantity": "175", "unit": "g"}, {"name": "Mutton Gravy", "quantity": "140", "unit": "g"}, {"name": "Cucumber Raita", "quantity": "85", "unit": "g"}, {"name": "Pure Ghee", "quantity": "12", "unit": "ml"}]},
  {"item_name": "Matta Rice with Clams (Kakka) Roast & Snake Gourd Thoran", "total_weight_g": 480, "calories_kcal": 490, "protein_g": 32, "carbs_g": 57, "fat_g": 13, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Clam Meat Roast", "quantity": "125", "unit": "g"}, {"name": "Snake Gourd Thoran", "quantity": "80", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Matta Rice with Netholi (Anchovy) Crisp Fry & Tangy Tomato Gravy", "total_weight_g": 475, "calories_kcal": 500, "protein_g": 31, "carbs_g": 58, "fat_g": 14, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Fried Anchovies", "quantity": "100", "unit": "g"}, {"name": "Tomato Curry", "quantity": "90", "unit": "g"}, {"name": "Yardlong Beans Thoran", "quantity": "80", "unit": "g"}]},
  {"item_name": "Matta Rice with Karimeen (Pearlspot) Pollichathu in Banana Leaf", "total_weight_g": 520, "calories_kcal": 550, "protein_g": 36, "carbs_g": 54, "fat_g": 16, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Karimeen Fish Pollichathu", "quantity": "140", "unit": "g"}, {"name": "Pavakka Fry", "quantity": "65", "unit": "g"}, {"name": "Coconut Oil", "quantity": "8", "unit": "ml"}]},
  {"item_name": "Matta Rice with Kozhi Varutharacha Curry & Potato Thoran", "total_weight_g": 495, "calories_kcal": 530, "protein_g": 33, "carbs_g": 58, "fat_g": 16, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Roasted Coconut Chicken Curry", "quantity": "140", "unit": "g"}, {"name": "Potato Mezhukkupuratti", "quantity": "80", "unit": "g"}]},
  {"item_name": "Matta Rice with Chemmeen Manga (Prawn Mango) Curry & Bitter Gourd Fry", "total_weight_g": 485, "calories_kcal": 510, "protein_g": 32, "carbs_g": 57, "fat_g": 14, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Prawns Mango Curry", "quantity": "135", "unit": "g"}, {"name": "Bitter Gourd Chips", "quantity": "50", "unit": "g"}]},
  {"item_name": "Matta Rice with Duck (Tharavu) Curry Kuttanad Style & Beetroot Thoran", "total_weight_g": 525, "calories_kcal": 580, "protein_g": 35, "carbs_g": 56, "fat_g": 19, "ingredients": [{"name": "Matta Rice", "quantity": "170", "unit": "g"}, {"name": "Duck Curry", "quantity": "145", "unit": "g"}, {"name": "Beetroot Thoran", "quantity": "80", "unit": "g"}]},
  {"item_name": "Matta Rice with Paneer Butter Masala Kerala Style & Cabbage Thoran", "total_weight_g": 475, "calories_kcal": 490, "protein_g": 18, "carbs_g": 62, "fat_g": 16, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Paneer Gravy", "quantity": "130", "unit": "g"}, {"name": "Cabbage Thoran", "quantity": "80", "unit": "g"}]},
  {"item_name": "Matta Rice with Soya Chunk Curry & Red Amaranth (Cheera) Thoran", "total_weight_g": 480, "calories_kcal": 470, "protein_g": 28, "carbs_g": 60, "fat_g": 12, "ingredients": [{"name": "Matta Rice", "quantity": "165", "unit": "g"}, {"name": "Soya Chunks Gravy", "quantity": "130", "unit": "g"}, {"name": "Cheera Thoran", "quantity": "85", "unit": "g"}]}
]

MEALS_STANDARD_SNACK = [
  {"item_name": "Golden Crisp Pazham Pori (Banana Fritters) with Hot Cardamom Tea", "total_weight_g": 180, "calories_kcal": 240, "protein_g": 4, "carbs_g": 42, "fat_g": 7, "ingredients": [{"name": "Nendran Banana", "quantity": "90", "unit": "g"}, {"name": "Flour Batter", "quantity": "30", "unit": "g"}, {"name": "Coconut Oil", "quantity": "7", "unit": "ml"}, {"name": "Cardamom Tea", "quantity": "120", "unit": "ml"}]},
  {"item_name": "Sukhiyan (Green Gram & Jaggery Fritter) with Black Tea", "total_weight_g": 170, "calories_kcal": 220, "protein_g": 6, "carbs_g": 38, "fat_g": 5, "ingredients": [{"name": "Green Gram", "quantity": "50", "unit": "g"}, {"name": "Organic Jaggery", "quantity": "20", "unit": "g"}, {"name": "Grated Coconut", "quantity": "10", "unit": "g"}, {"name": "Black Tea", "quantity": "130", "unit": "ml"}]},
  {"item_name": "Unnakaya (Steamed Banana Roll stuffed with Sweetened Coconut & Nuts)", "total_weight_g": 160, "calories_kcal": 250, "protein_g": 4, "carbs_g": 40, "fat_g": 8, "ingredients": [{"name": "Mashed Banana", "quantity": "85", "unit": "g"}, {"name": "Coconut & Sugar", "quantity": "25", "unit": "g"}, {"name": "Cashews", "quantity": "10", "unit": "g"}]},
  {"item_name": "Malabar Stuffed Mussels (Kallummakkaya Nirachathu)", "total_weight_g": 190, "calories_kcal": 270, "protein_g": 16, "carbs_g": 28, "fat_g": 9, "ingredients": [{"name": "Fresh Mussels", "quantity": "100", "unit": "g"}, {"name": "Rice Paste Filling", "quantity": "60", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Steamed Nendran Plantain drizzled with Pure Desi Ghee", "total_weight_g": 150, "calories_kcal": 210, "protein_g": 3, "carbs_g": 42, "fat_g": 4, "ingredients": [{"name": "Steamed Banana", "quantity": "130", "unit": "g"}, {"name": "Pure Desi Ghee", "quantity": "5", "unit": "ml"}]},
  {"item_name": "Crispy Parippu Vada with Hot Dry Ginger Coffee (Chukku Kapi)", "total_weight_g": 175, "calories_kcal": 230, "protein_g": 7, "carbs_g": 29, "fat_g": 9, "ingredients": [{"name": "Chana Dal Vada", "quantity": "60", "unit": "g"}, {"name": "Shallots", "quantity": "15", "unit": "g"}, {"name": "Dry Ginger Coffee", "quantity": "130", "unit": "ml"}]},
  {"item_name": "Uzhunnu Vada with Green Chili Coconut Chutney", "total_weight_g": 165, "calories_kcal": 240, "protein_g": 8, "carbs_g": 26, "fat_g": 10, "ingredients": [{"name": "Urad Dal Vada", "quantity": "65", "unit": "g"}, {"name": "Coconut Chutney", "quantity": "35", "unit": "g"}]},
  {"item_name": "Kozhukkatta (Steamed Rice Dumplings filled with Coconut & Jaggery)", "total_weight_g": 160, "calories_kcal": 220, "protein_g": 4, "carbs_g": 44, "fat_g": 4, "ingredients": [{"name": "Rice Dough Shell", "quantity": "80", "unit": "g"}, {"name": "Grated Coconut", "quantity": "25", "unit": "g"}, {"name": "Jaggery", "quantity": "20", "unit": "g"}]},
  {"item_name": "Kerala Fish Cutlet with Tomato Sauce & Onion Salad", "total_weight_g": 180, "calories_kcal": 260, "protein_g": 15, "carbs_g": 24, "fat_g": 10, "ingredients": [{"name": "Fish & Potato Patties", "quantity": "110", "unit": "g"}, {"name": "Breadcrumb Coating", "quantity": "25", "unit": "g"}, {"name": "Coconut Oil", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Hydrating Tender Coconut (Elaneer) Milkshake", "total_weight_g": 220, "calories_kcal": 180, "protein_g": 4, "carbs_g": 24, "fat_g": 7, "ingredients": [{"name": "Tender Coconut Meat", "quantity": "60", "unit": "g"}, {"name": "Tender Coconut Water", "quantity": "120", "unit": "ml"}, {"name": "Cow Milk", "quantity": "50", "unit": "ml"}]},
  {"item_name": "Bakery Style Egg Puffs with Hot Cardamom Tea", "total_weight_g": 190, "calories_kcal": 280, "protein_g": 11, "carbs_g": 28, "fat_g": 13, "ingredients": [{"name": "Puff Pastry", "quantity": "70", "unit": "g"}, {"name": "Hard Boiled Egg", "quantity": "50", "unit": "g"}, {"name": "Spiced Onion Masala", "quantity": "30", "unit": "g"}]},
  {"item_name": "Aval Milk (Beaten Rice Flakes with Milk, Banana & Nuts)", "total_weight_g": 230, "calories_kcal": 290, "protein_g": 7, "carbs_g": 48, "fat_g": 8, "ingredients": [{"name": "Rice Flakes (Aval)", "quantity": "30", "unit": "g"}, {"name": "Banana", "quantity": "70", "unit": "g"}, {"name": "Chilled Milk", "quantity": "110", "unit": "ml"}, {"name": "Peanuts", "quantity": "15", "unit": "g"}]},
  {"item_name": "Chilled Spiced Buttermilk (Sambharam) with Roasted Makhana", "total_weight_g": 210, "calories_kcal": 150, "protein_g": 5, "carbs_g": 20, "fat_g": 4, "ingredients": [{"name": "Curd Water", "quantity": "150", "unit": "ml"}, {"name": "Ginger & Curry Leaves", "quantity": "10", "unit": "g"}, {"name": "Roasted Makhana", "quantity": "25", "unit": "g"}]},
  {"item_name": "Bakery Style Chicken Puffs", "total_weight_g": 185, "calories_kcal": 290, "protein_g": 14, "carbs_g": 27, "fat_g": 14, "ingredients": [{"name": "Puff Pastry", "quantity": "70", "unit": "g"}, {"name": "Minced Chicken", "quantity": "60", "unit": "g"}]},
  {"item_name": "Unniyappam (Rice Flour, Jaggery & Banana Ghee Fritters)", "total_weight_g": 160, "calories_kcal": 240, "protein_g": 3, "carbs_g": 44, "fat_g": 6, "ingredients": [{"name": "Rice Batter", "quantity": "90", "unit": "g"}, {"name": "Jaggery", "quantity": "25", "unit": "g"}, {"name": "Ghee", "quantity": "6", "unit": "ml"}]},
  {"item_name": "Kerala Chicken Cutlet with Mint Chutney", "total_weight_g": 185, "calories_kcal": 270, "protein_g": 18, "carbs_g": 22, "fat_g": 11, "ingredients": [{"name": "Minced Chicken", "quantity": "115", "unit": "g"}, {"name": "Mint Chutney", "quantity": "30", "unit": "g"}]},
  {"item_name": "Boiled Peanuts Tempered with Mustard & Curry Leaves", "total_weight_g": 160, "calories_kcal": 220, "protein_g": 9, "carbs_g": 18, "fat_g": 12, "ingredients": [{"name": "Boiled Peanuts", "quantity": "110", "unit": "g"}, {"name": "Grated Coconut", "quantity": "15", "unit": "g"}]},
  {"item_name": "Aval (Rice Flakes) Nanachathu with Coconut & Jaggery", "total_weight_g": 170, "calories_kcal": 230, "protein_g": 4, "carbs_g": 46, "fat_g": 4, "ingredients": [{"name": "Red Rice Flakes", "quantity": "60", "unit": "g"}, {"name": "Grated Coconut", "quantity": "25", "unit": "g"}, {"name": "Jaggery", "quantity": "20", "unit": "g"}]}
]

MEALS_STANDARD_DINNER = [
  {"item_name": "Steamed Idiyappam with Nadan Egg Curry in Roasted Coconut Gravy", "total_weight_g": 310, "calories_kcal": 370, "protein_g": 16, "carbs_g": 48, "fat_g": 12, "ingredients": [{"name": "Steamed Idiyappam", "quantity": "130", "unit": "g"}, {"name": "Boiled Eggs", "quantity": "100", "unit": "g"}, {"name": "Roasted Coconut Gravy", "quantity": "50", "unit": "g"}]},
  {"item_name": "Whole Wheat Parotta with Kerala Chicken Roast & Onion Salna", "total_weight_g": 340, "calories_kcal": 450, "protein_g": 26, "carbs_g": 48, "fat_g": 16, "ingredients": [{"name": "Whole Wheat Parotta", "quantity": "110", "unit": "g"}, {"name": "Chicken Roast", "quantity": "120", "unit": "g"}, {"name": "Salna Gravy", "quantity": "65", "unit": "g"}]},
  {"item_name": "Warm Kerala Matta Rice Kanji with Green Gram & Kanthari Chammanthi", "total_weight_g": 420, "calories_kcal": 360, "protein_g": 12, "carbs_g": 62, "fat_g": 6, "ingredients": [{"name": "Matta Rice Kanji", "quantity": "230", "unit": "g"}, {"name": "Steamed Green Gram", "quantity": "90", "unit": "g"}, {"name": "Kanthari Chammanthi", "quantity": "30", "unit": "g"}]},
  {"item_name": "Soft Appam with Tender Mutton Stew in Coconut Milk", "total_weight_g": 330, "calories_kcal": 410, "protein_g": 21, "carbs_g": 45, "fat_g": 15, "ingredients": [{"name": "Appam", "quantity": "120", "unit": "g"}, {"name": "Mutton Chunks", "quantity": "85", "unit": "g"}, {"name": "Coconut Milk Stew", "quantity": "70", "unit": "ml"}]},
  {"item_name": "Thin Rice Pathiri with Spicy Tomato Tamarind Fish Curry", "total_weight_g": 320, "calories_kcal": 380, "protein_g": 24, "carbs_g": 46, "fat_g": 10, "ingredients": [{"name": "Rice Pathiri", "quantity": "110", "unit": "g"}, {"name": "Fish Fillet", "quantity": "110", "unit": "g"}, {"name": "Tomato Gravy", "quantity": "60", "unit": "g"}]},
  {"item_name": "Healthy Oats & Vegetable Kanji with Toasted Flaxseeds", "total_weight_g": 380, "calories_kcal": 310, "protein_g": 10, "carbs_g": 50, "fat_g": 6, "ingredients": [{"name": "Oats Porridge", "quantity": "180", "unit": "g"}, {"name": "Mixed Vegetables", "quantity": "80", "unit": "g"}, {"name": "Flaxseeds", "quantity": "10", "unit": "g"}]},
  {"item_name": "Soft Whole Wheat Chappathi with Black Chickpea Coconut Curry", "total_weight_g": 310, "calories_kcal": 360, "protein_g": 14, "carbs_g": 54, "fat_g": 9, "ingredients": [{"name": "Whole Wheat Rotis", "quantity": "110", "unit": "g"}, {"name": "Kadala Curry", "quantity": "125", "unit": "g"}]},
  {"item_name": "Crisp Rice Dosa with Fresh Vegetable Sambar & Tomato Chutney", "total_weight_g": 300, "calories_kcal": 340, "protein_g": 9, "carbs_g": 56, "fat_g": 7, "ingredients": [{"name": "Dosa Crepe", "quantity": "130", "unit": "g"}, {"name": "Vegetable Sambar", "quantity": "110", "unit": "g"}, {"name": "Tomato Chutney", "quantity": "35", "unit": "g"}]},
  {"item_name": "Malabar Kothu Parotta (Shredded Parotta with Chicken & Eggs)", "total_weight_g": 350, "calories_kcal": 470, "protein_g": 28, "carbs_g": 46, "fat_g": 18, "ingredients": [{"name": "Shredded Parotta", "quantity": "110", "unit": "g"}, {"name": "Chicken Chunks", "quantity": "90", "unit": "g"}, {"name": "Scrambled Egg", "quantity": "50", "unit": "g"}]},
  {"item_name": "Nutrient-Dense Ragi Dosa with Coconut Mint Chutney", "total_weight_g": 280, "calories_kcal": 310, "protein_g": 9, "carbs_g": 52, "fat_g": 7, "ingredients": [{"name": "Ragi Dosa", "quantity": "140", "unit": "g"}, {"name": "Mint Coconut Chutney", "quantity": "45", "unit": "g"}]},
  {"item_name": "Warm Barley Porridge with Seasoned Curd & Shallots", "total_weight_g": 390, "calories_kcal": 320, "protein_g": 11, "carbs_g": 54, "fat_g": 6, "ingredients": [{"name": "Barley Kanji", "quantity": "200", "unit": "g"}, {"name": "Fresh Curd", "quantity": "100", "unit": "g"}]},
  {"item_name": "Ghee Dosa with Spiced Potato Masala", "total_weight_g": 310, "calories_kcal": 380, "protein_g": 8, "carbs_g": 58, "fat_g": 12, "ingredients": [{"name": "Dosa Crepe", "quantity": "130", "unit": "g"}, {"name": "Potato Masala", "quantity": "100", "unit": "g"}, {"name": "Ghee", "quantity": "8", "unit": "ml"}]},
  {"item_name": "Kerala Mutta (Egg) Dosa with Spicy Shallot Chutney", "total_weight_g": 290, "calories_kcal": 360, "protein_g": 15, "carbs_g": 44, "fat_g": 12, "ingredients": [{"name": "Dosa Crepe", "quantity": "110", "unit": "g"}, {"name": "Spiced Egg Layer", "quantity": "60", "unit": "g"}, {"name": "Shallot Chutney", "quantity": "45", "unit": "g"}]},
  {"item_name": "Boiled Tapioca (Kappa) with Red Fish Curry (Light Portion)", "total_weight_g": 330, "calories_kcal": 360, "protein_g": 22, "carbs_g": 46, "fat_g": 9, "ingredients": [{"name": "Tapioca", "quantity": "140", "unit": "g"}, {"name": "Red Fish Curry", "quantity": "100", "unit": "g"}]},
  {"item_name": "Whole Wheat Parotta with Malabar Veg Kurma", "total_weight_g": 325, "calories_kcal": 390, "protein_g": 10, "carbs_g": 54, "fat_g": 12, "ingredients": [{"name": "Whole Wheat Parotta", "quantity": "110", "unit": "g"}, {"name": "Veg Kurma", "quantity": "140", "unit": "g"}]},
  {"item_name": "Cherupayar Kanji (Green Gram & Rice Porridge) with Lime Pickle & Coconut", "total_weight_g": 410, "calories_kcal": 340, "protein_g": 13, "carbs_g": 60, "fat_g": 5, "ingredients": [{"name": "Matta Rice & Moong Dal Gruel", "quantity": "220", "unit": "g"}, {"name": "Grated Coconut", "quantity": "20", "unit": "g"}]}
]

# Helper to generate rotated full 7-day plans
def build_weekly_plan(b_pool, l_pool, s_pool, d_pool, offset=0):
  days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  plan = {}
  for idx, day in enumerate(days):
    b_meal = b_pool[(idx + offset) % len(b_pool)]
    l_meal = l_pool[(idx + offset * 2) % len(l_pool)]
    s_meal = s_pool[(idx + offset * 3) % len(s_pool)]
    d_meal = d_pool[(idx + offset * 4) % len(d_pool)]
    plan[day] = [
      dict(b_meal, meal_type="Breakfast"),
      dict(l_meal, meal_type="Lunch"),
      dict(s_meal, meal_type="Snack"),
      dict(d_meal, meal_type="Dinner")
    ]
  return plan

# Construct complete diet config covering all brackets & variants
data = {
  "bmi_brackets": {
    "overweight": {
      "target_strategy": "caloric_deficit",
      "diet_variants": {
        "standard": {
          "accelerated_8": {
            "daily_calorie_range": [1400, 1600],
            "macro_distribution": {"protein_pct": 35, "carbs_pct": 35, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 0)
          },
          "moderate_16": {
            "daily_calorie_range": [1650, 1850],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 3)
          },
          "gradual_24": {
            "daily_calorie_range": [1800, 2000],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 45, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 6)
          }
        },
        "vegetarian": {
          "accelerated_8": {
            "daily_calorie_range": [1400, 1600],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 1)
          },
          "moderate_16": {
            "daily_calorie_range": [1550, 1750],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 4)
          },
          "gradual_24": {
            "daily_calorie_range": [1700, 1900],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 45, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 7)
          }
        },
        "vegan": {
          "accelerated_8": {
            "daily_calorie_range": [1350, 1550],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 50, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 2)
          },
          "moderate_16": {
            "daily_calorie_range": [1500, 1700],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 50, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 5)
          },
          "gradual_24": {
            "daily_calorie_range": [1650, 1850],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 50, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 8)
          }
        },
        "high_protein": {
          "accelerated_8": {
            "daily_calorie_range": [1450, 1650],
            "macro_distribution": {"protein_pct": 40, "carbs_pct": 30, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 9)
          },
          "moderate_16": {
            "daily_calorie_range": [1700, 1900],
            "macro_distribution": {"protein_pct": 35, "carbs_pct": 35, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 10)
          },
          "gradual_24": {
            "daily_calorie_range": [1850, 2050],
            "macro_distribution": {"protein_pct": 35, "carbs_pct": 35, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 11)
          }
        }
      }
    },
    "obese": {
      "target_strategy": "caloric_deficit",
      "diet_variants": {
        "standard": {
          "accelerated_8": {
            "daily_calorie_range": [1500, 1750],
            "macro_distribution": {"protein_pct": 35, "carbs_pct": 35, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 12)
          },
          "moderate_16": {
            "daily_calorie_range": [1750, 1950],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 13)
          },
          "gradual_24": {
            "daily_calorie_range": [1900, 2100],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 45, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 14)
          }
        },
        "vegetarian": {
          "moderate_16": {
            "daily_calorie_range": [1650, 1850],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 15)
          }
        },
        "high_protein": {
          "accelerated_8": {
            "daily_calorie_range": [1550, 1800],
            "macro_distribution": {"protein_pct": 40, "carbs_pct": 30, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 16)
          }
        }
      }
    },
    "normal": {
      "target_strategy": "maintenance",
      "diet_variants": {
        "standard": {
          "accelerated_8": {
            "daily_calorie_range": [1800, 2000],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 17)
          },
          "moderate_16": {
            "daily_calorie_range": [1900, 2100],
            "macro_distribution": {"protein_pct": 30, "carbs_pct": 40, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 18)
          },
          "gradual_24": {
            "daily_calorie_range": [2000, 2200],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 45, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 19)
          }
        },
        "vegetarian": {
          "moderate_16": {
            "daily_calorie_range": [1900, 2100],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 45, "fat_pct": 30},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 20)
          }
        },
        "high_protein": {
          "moderate_16": {
            "daily_calorie_range": [2100, 2350],
            "macro_distribution": {"protein_pct": 35, "carbs_pct": 40, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 21)
          }
        }
      }
    },
    "underweight": {
      "target_strategy": "caloric_surplus",
      "diet_variants": {
        "standard": {
          "accelerated_8": {
            "daily_calorie_range": [2200, 2500],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 50, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 22)
          },
          "moderate_16": {
            "daily_calorie_range": [2400, 2700],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 50, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 23)
          },
          "gradual_24": {
            "daily_calorie_range": [2500, 2800],
            "macro_distribution": {"protein_pct": 25, "carbs_pct": 50, "fat_pct": 25},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 24)
          }
        },
        "high_protein": {
          "moderate_16": {
            "daily_calorie_range": [2500, 2850],
            "macro_distribution": {"protein_pct": 35, "carbs_pct": 45, "fat_pct": 20},
            "weekly_plan": build_weekly_plan(MEALS_STANDARD_BREAKFAST, MEALS_STANDARD_LUNCH, MEALS_STANDARD_SNACK, MEALS_STANDARD_DINNER, 25)
          }
        }
      }
    }
  }
}

with open("diet-config.json", "w") as f:
  json.dump(data, f, indent=2)

print("Finished generating updated diet-config.json")
