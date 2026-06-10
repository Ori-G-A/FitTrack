/* FitTrack APP — app-specific data (routines, history, measurements, foods, profile) */

const isoMinus = (n) => {
  const d = new Date("2026-06-09T00:00:00");
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const routines = [
  {
    id: "push", nameES: "Empuje", nameEN: "Push", split: "A",
    exercises: [
      { key: "bench",    sets: 4, reps: 6,  kg: 80 },
      { key: "incline",  sets: 3, reps: 8,  kg: 28 },
      { key: "ohp",      sets: 4, reps: 6,  kg: 48 },
      { key: "lateral",  sets: 3, reps: 14, kg: 10 },
      { key: "pushdown", sets: 3, reps: 12, kg: 32 },
    ],
  },
  {
    id: "pull", nameES: "Tirón", nameEN: "Pull", split: "B",
    exercises: [
      { key: "deadlift", sets: 3, reps: 5,  kg: 145 },
      { key: "pullup",   sets: 4, reps: 8,  kg: 16 },
      { key: "row",      sets: 4, reps: 8,  kg: 72 },
      { key: "facepull", sets: 3, reps: 15, kg: 22 },
      { key: "curl",     sets: 3, reps: 10, kg: 16 },
    ],
  },
  {
    id: "legs", nameES: "Pierna", nameEN: "Legs", split: "C",
    exercises: [
      { key: "squat",    sets: 4, reps: 6,  kg: 118 },
      { key: "rdl",      sets: 3, reps: 8,  kg: 92 },
      { key: "legpress", sets: 3, reps: 12, kg: 180 },
      { key: "legcurl",  sets: 3, reps: 12, kg: 45 },
      { key: "calf",     sets: 4, reps: 15, kg: 90 },
    ],
  },
];

const history = [
  { iso: isoMinus(0), routine: "push", min: 64, vol: 8420,  sets: 17, top: { key: "bench",    kg: 80,  reps: 6 } },
  { iso: isoMinus(2), routine: "pull", min: 71, vol: 9210,  sets: 17, top: { key: "deadlift", kg: 145, reps: 5 } },
  { iso: isoMinus(3), routine: "legs", min: 58, vol: 11240, sets: 17, top: { key: "squat",    kg: 118, reps: 6 } },
  { iso: isoMinus(5), routine: "push", min: 66, vol: 8010,  sets: 17, top: { key: "bench",    kg: 78,  reps: 6 } },
  { iso: isoMinus(6), routine: "pull", min: 62, vol: 8880,  sets: 16, top: { key: "deadlift", kg: 142, reps: 5 } },
  { iso: isoMinus(8), routine: "legs", min: 60, vol: 10980, sets: 17, top: { key: "squat",    kg: 116, reps: 6 } },
];

const measureDates = [];
for (let i = 5; i >= 0; i--) measureDates.push(isoMinus(i * 14));

const measurements = {
  waist: { unit: "cm", series: [82.5, 81.8, 81.0, 80.2, 79.4, 78.6], goal: 76 },
  hips:  { unit: "cm", series: [98.0, 97.6, 97.2, 96.9, 96.5, 96.2], goal: null },
  arm:   { unit: "cm", series: [33.8, 33.9, 34.0, 34.1, 34.1, 34.2], goal: null },
  chest: { unit: "cm", series: [99.5, 99.2, 99.0, 98.8, 98.7, 98.6], goal: null },
  thigh: { unit: "cm", series: [56.2, 56.0, 55.8, 55.7, 55.6, 55.5], goal: null },
};

const photos = [
  { iso: isoMinus(56), kg: 76.9, label: "front" },
  { iso: isoMinus(28), kg: 75.4, label: "front" },
  { iso: isoMinus(0),  kg: 74.1, label: "front" },
];

const foods = [
  { id: "eggs",     nameES: "Huevos (2)",       nameEN: "Eggs (2)",         kcal: 156, p: 13, c: 1,  f: 11, serv: "2 ud" },
  { id: "oats",     nameES: "Avena 80g",         nameEN: "Oats 80g",         kcal: 304, p: 11, c: 51, f: 6,  serv: "80 g" },
  { id: "chicken",  nameES: "Pollo 150g",         nameEN: "Chicken 150g",     kcal: 248, p: 46, c: 0,  f: 5,  serv: "150 g" },
  { id: "rice",     nameES: "Arroz 200g",         nameEN: "Rice 200g",        kcal: 260, p: 5,  c: 56, f: 1,  serv: "200 g" },
  { id: "salmon",   nameES: "Salmón 140g",        nameEN: "Salmon 140g",      kcal: 280, p: 34, c: 0,  f: 16, serv: "140 g" },
  { id: "yogurt",   nameES: "Yogur griego",       nameEN: "Greek yogurt",     kcal: 130, p: 17, c: 7,  f: 4,  serv: "170 g" },
  { id: "whey",     nameES: "Batido proteico",    nameEN: "Whey shake",       kcal: 120, p: 25, c: 3,  f: 1,  serv: "1 scoop" },
  { id: "banana",   nameES: "Plátano",            nameEN: "Banana",           kcal: 105, p: 1,  c: 27, f: 0,  serv: "1 ud" },
  { id: "almonds",  nameES: "Almendras 30g",      nameEN: "Almonds 30g",      kcal: 174, p: 6,  c: 6,  f: 15, serv: "30 g" },
  { id: "avocado",  nameES: "Aguacate 1/2",       nameEN: "Avocado 1/2",      kcal: 160, p: 2,  c: 9,  f: 15, serv: "1/2 ud" },
  { id: "broccoli", nameES: "Brócoli 150g",       nameEN: "Broccoli 150g",    kcal: 51,  p: 4,  c: 10, f: 1,  serv: "150 g" },
  { id: "olive",    nameES: "Aceite oliva 1cda",  nameEN: "Olive oil 1 tbsp", kcal: 119, p: 0,  c: 0,  f: 14, serv: "1 cda" },
];

const todayMeals = {
  breakfast: ["oats", "eggs", "banana"],
  lunch: ["chicken", "rice", "broccoli", "olive"],
  dinner: [],
  snacks: ["yogurt", "whey"],
};

export const appData = {
  routines, history, measureDates, measurements, photos, foods, todayMeals,
  profile: {
    name: "Ana", age: 29, heightCm: 168, sex: "F",
    goal: "cut", goalKg: 72, startKg: 76.9,
    units: "metric", trainDaysGoal: 5,
    cycleTracking: true,
    integrations: { applehealth: true, whoop: false, strava: false },
  },
  foodById: Object.fromEntries(foods.map((f) => [f.id, f])),
};
