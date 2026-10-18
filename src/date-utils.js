export const localISO = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const daysBetween = (start, end) => Math.round(
  (new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000
);

export const addDays = (iso, amount) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return localISO(date);
};
