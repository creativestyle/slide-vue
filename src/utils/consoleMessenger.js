export default {
  warn(msg) {
		/* eslint-disable no-console */
    console.warn(msg);
  },
  error(msg) {
    throw new TypeError(msg);
  }
};
