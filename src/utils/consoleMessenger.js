export default {
  warn(msg) {
    console.warn(msg);
  },
  error(msg) {
    throw new TypeError(msg);
  }
}