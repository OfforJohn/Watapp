export function formatRextailsNumber(value) {
  const number = String(value || "").trim();
  // App-generated eight-digit IDs are display-formatted in a Dutch mobile style.
  // They are Rextails IDs, not callable or assigned telephone numbers.
  if (/^8\d{7}$/.test(number)) {
    return `+31 6 ${number.slice(0, 4)} ${number.slice(4)}`;
  }
  return number || "…";
}
