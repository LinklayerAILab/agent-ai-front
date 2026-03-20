/* eslint-disable @typescript-eslint/no-this-alias */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 100
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const _this = this;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      fn.apply(_this, args);
    }, delay);
  };
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// addr mask
export function addressDots(v: string | number, len = 12, lastlen = 12) {
  const newstr = typeof v === "number" ? v.toString() : v;
  return newstr
    ? newstr.slice(0, len) +
        "..." +
        newstr.slice(newstr.length - lastlen, newstr.length)
    : "";
}



export function delayFunction(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}


/**
 * 将 Unix timestamp（毫seconds）format化for yyyy-M-d
 * 兼容 IE11 及all现代浏览器
 * @param timestamp 毫secondstimestamp
 * @returns 形如 "1989-9-8"
 */
export function formatDate(
  timestamp: number,
  format = 'YYYY-M-D'
): string {
  if (!isFinite(timestamp)) return '';

  const dt = new Date(timestamp);

  // 基础field
  const year = dt.getFullYear();
  const month = dt.getMonth() + 1; // 0 基
  const day = dt.getDate();
  const hours = dt.getHours();
  const minutes = dt.getMinutes();
  const seconds = dt.getSeconds();
  const ms = dt.getMilliseconds();

  // 补零助手（避免依赖 padStart）
  function pad2(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }
  function pad3(n: number): string {
    if (n < 10) return '00' + n;
    if (n < 100) return '0' + n;
    return String(n);
  }

  // 12 hours制
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const ampmLower = hours < 12 ? 'am' : 'pm';
  const ampmUpper = ampmLower.toUpperCase();

  // support占位符（size写敏感）：
  // YYYY, YY, MM, M, DD, D, HH, H, hh, h, mm, m, ss, s, SSS, S, A, a
  const tokenMap: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MM: pad2(month),
    M: String(month),
    DD: pad2(day),
    D: String(day),
    HH: pad2(hours),
    H: String(hours),
    hh: pad2(hour12),
    h: String(hour12),
    mm: pad2(minutes),
    m: String(minutes),
    ss: pad2(seconds),
    s: String(seconds),
    SSS: pad3(ms),
    S: String(ms),
    A: ampmUpper,
    a: ampmLower,
  };

  // 单次全量替换，避免repeat/交叉替换issues
  const re = /(YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|S|A|a)/g;
  return String(format).replace(re, (t) => tokenMap[t]);
}
