function decimalDayToDate(year: number, decimalDay: number): string {
    const day = Math.floor(decimalDay);
    const fractionOfDay = decimalDay - day;

    // Start with the first day of the year
    const date = new Date(year, 0);
    // Adjust to the correct day of the year
    date.setDate(day);

    // Calculate the time from the fractional day
    const secondsInDay = 86400;
    const secondsToAdd = fractionOfDay * secondsInDay;
    date.setSeconds(secondsToAdd);

    // Format the date and time as a string
    const padZero = (num: number): string => num.toString().padStart(2, '0');
    const yearStr = date.getFullYear();
    const monthStr = padZero(date.getMonth() + 1); // getMonth() is zero-based
    const dayStr = padZero(date.getDate());
    const hourStr = padZero(date.getHours());
    const minuteStr = padZero(date.getMinutes());
    const secondStr = padZero(date.getSeconds());

    return `${yearStr}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}:${secondStr}`;
}

// Example usage
const year = 2024;
const decimalDay = 298.6503780343599;
console.log(decimalDayToDate(year, decimalDay));
