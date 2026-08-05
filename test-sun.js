function getSunPos(date) {
  const hours = date.getUTCHours() - 5;
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const decimalHours = (hours + 24) % 24 + minutes / 60 + seconds / 3600;
  const phi = (decimalHours - 6) / 24 * Math.PI * 2;
  const distance = 100;
  const x = Math.cos(phi) * distance;
  const y = Math.sin(phi) * distance;
  const z = distance * Math.sin((38 / 180) * Math.PI);
  return { decimalHours, x, y, z };
}

console.log("6 AM:", getSunPos(new Date("2026-08-04T11:00:00Z"))); // 6 AM CDT
console.log("12 PM:", getSunPos(new Date("2026-08-04T17:00:00Z"))); // 12 PM CDT
console.log("6 PM:", getSunPos(new Date("2026-08-04T23:00:00Z"))); // 6 PM CDT
console.log("12 AM:", getSunPos(new Date("2026-08-05T05:00:00Z"))); // 12 AM CDT
