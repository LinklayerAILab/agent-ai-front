"use client";
export function throttle(fn, delay = 200) {
  let timer = null;
  return function () {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      timer ? clearTimeout(timer) : "";
      timer = null;
    }, delay);
  };
}

export function debounce(fn, delay = 100) {
  let timer = null;
  return function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      fn.apply(_this, args);
    }, delay);
  };
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
