const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: 'Tết Dương lịch' },
  { month: 4, day: 30, name: 'Ngày Giải phóng miền Nam' },
  { month: 5, day: 1, name: 'Ngày Quốc tế Lao động' },
  { month: 9, day: 2, name: 'Ngày Quốc khánh' },
];

const LUNAR_RULES = [
  { lunarMonth: 1, lunarDay: 1, name: 'Tết Nguyên đán (Mùng 1)' },
  { lunarMonth: 3, lunarDay: 10, name: 'Giỗ Tổ Hùng Vương' },
];

const VIETNAM_TIME_ZONE = 7;
const AUTO_LUNAR_MIN_YEAR = 1900;
const AUTO_LUNAR_MAX_YEAR = 2199;
const PI = Math.PI;

const int = (value) => Math.floor(value);

const julianDayFromDate = (day, month, year) => {
  const a = int((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
  if (jd < 2299161) {
    jd = day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - 32083;
  }

  return jd;
};

const dateFromJulianDay = (jd) => {
  let a;
  let b;
  let c;

  if (jd > 2299160) {
    a = jd + 32044;
    b = int((4 * a + 3) / 146097);
    c = a - int((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }

  const d = int((4 * c + 3) / 1461);
  const e = c - int((1461 * d) / 4);
  const m = int((5 * e + 2) / 153);

  const day = e - int((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * int(m / 10);
  const year = b * 100 + d - 4800 + int(m / 10);

  return [day, month, year];
};

const newMoon = (k) => {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const dr = PI / 180;

  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);

  const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const mPrime = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;

  let c1 = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
  c1 -= 0.4068 * Math.sin(mPrime * dr) + 0.0161 * Math.sin(dr * 2 * mPrime);
  c1 -= 0.0004 * Math.sin(dr * 3 * mPrime);
  c1 += 0.0104 * Math.sin(dr * 2 * f) - 0.0051 * Math.sin(dr * (m + mPrime));
  c1 -= 0.0074 * Math.sin(dr * (m - mPrime)) + 0.0004 * Math.sin(dr * (2 * f + m));
  c1 -= 0.0004 * Math.sin(dr * (2 * f - m)) - 0.0006 * Math.sin(dr * (2 * f + mPrime));
  c1 += 0.001 * Math.sin(dr * (2 * f - mPrime)) + 0.0005 * Math.sin(dr * (2 * mPrime + m));

  let deltaT;
  if (t < -11) {
    deltaT = 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3;
  } else {
    deltaT = -0.000278 + 0.000265 * t + 0.000262 * t2;
  }

  return jd1 + c1 - deltaT;
};

const sunLongitude = (jdn) => {
  const t = (jdn - 2451545.0) / 36525;
  const t2 = t * t;
  const dr = PI / 180;
  const m = 357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;

  let dl = (1.9146 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
  dl += (0.019993 - 0.000101 * t) * Math.sin(dr * 2 * m) + 0.00029 * Math.sin(dr * 3 * m);

  let longitude = (l0 + dl) * dr;
  longitude -= PI * 2 * int(longitude / (PI * 2));

  return longitude;
};

const getSunLongitude = (dayNumber, timeZone) => int((sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6);

const getNewMoonDay = (k, timeZone) => int(newMoon(k) + 0.5 + timeZone / 24);

const getLunarMonth11 = (year, timeZone) => {
  const off = julianDayFromDate(31, 12, year) - 2415021.076998695;
  const k = int(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }

  return nm;
};

const getLeapMonthOffset = (a11, timeZone) => {
  const k = int(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let i = 1;
  let last;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);

  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);

  return i - 1;
};

const convertLunarToSolar = (lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) => {
  let a11;
  let b11;

  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }

  const k = int(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }

  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) {
      leapMonth += 12;
    }

    if (lunarLeap !== 0 && lunarMonth !== leapMonth) {
      return [0, 0, 0];
    }

    if (lunarLeap !== 0 || off >= leapOff) {
      off += 1;
    }
  }

  const monthStart = getNewMoonDay(k + off, timeZone);
  return dateFromJulianDay(monthStart + lunarDay - 1);
};

const getAutoLunarHolidaysForYear = (year) => {
  if (year < AUTO_LUNAR_MIN_YEAR || year > AUTO_LUNAR_MAX_YEAR) {
    return [];
  }

  return LUNAR_RULES.map((rule) => {
    const [day, month, convertedYear] = convertLunarToSolar(
      rule.lunarDay,
      rule.lunarMonth,
      year,
      0,
      VIETNAM_TIME_ZONE
    );

    return {
      month,
      day,
      year: convertedYear,
      name: rule.name,
    };
  }).filter((holiday) => holiday.day > 0 && holiday.month > 0 && holiday.year === year);
};

const createLocalDate = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getVietnamHolidaysForYear = (year) => {
  const fixedEntries = FIXED_HOLIDAYS.map((holiday) => {
    const date = createLocalDate(year, holiday.month, holiday.day);
    return {
      ...holiday,
      date,
      key: toDateKey(date),
    };
  });

  const lunarEntries = getAutoLunarHolidaysForYear(year).map((holiday) => {
    const date = createLocalDate(holiday.year, holiday.month, holiday.day);
    return {
      ...holiday,
      date,
      key: toDateKey(date),
    };
  });

  return [...fixedEntries, ...lunarEntries].sort((a, b) => a.date - b.date);
};

export const getVietnamHolidaysInRange = (startDate, endDate) => {
  const from = new Date(startDate);
  const to = new Date(endDate);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const holidays = [];
  for (let year = from.getFullYear(); year <= to.getFullYear(); year += 1) {
    holidays.push(...getVietnamHolidaysForYear(year));
  }

  return holidays.filter((holiday) => holiday.date >= from && holiday.date <= to);
};

export const getVietnamHolidayLookupInRange = (startDate, endDate) => {
  const map = new Map();
  getVietnamHolidaysInRange(startDate, endDate).forEach((holiday) => {
    map.set(holiday.key, holiday.name);
  });
  return map;
};