const currentYear = new Date().getFullYear();
const dateRegex = new RegExp(
  `^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/(${currentYear}|[2-9][0-9]{3})$`
);
export function validateDate(date) {
  if (dateRegex.test(date)) {
    const [day, month, year] = date.split("/").map(Number);
    const monthIndex = month - 1;
    const dateObject = new Date(year, monthIndex, day);
    if (
      dateObject.getFullYear() === year &&
      dateObject.getMonth() === monthIndex &&
      dateObject.getDate() === day
    ) {
      return true;
    }
  }
  return false;
}
