export const toPersianDigits = (n: number | string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

export const formatPrice = (price: number): string => {
  // Format with commas then convert to Persian digits
  const withCommas = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return toPersianDigits(withCommas);
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${toPersianDigits(m)}:${toPersianDigits(s < 10 ? '0' + s : s)}`;
};