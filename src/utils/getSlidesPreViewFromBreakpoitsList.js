export default function getSlidesPreViewFromBreakpoitsList(breakpoitsList) {
  let currentSlidesPerView;

  if (breakpoitsList[breakpoitsList.length - 1].breakpoint < window.innerWidth) {
    currentSlidesPerView = breakpoitsList[breakpoitsList.length - 1].slidesPerView;
  } else {
    breakpoitsList.reduce((acc, setting) => {
      if (setting.breakpoint >= window.innerWidth && acc.breakpoint <= window.innerWidth) {
        currentSlidesPerView = acc.slidesPerView;
      }
      return setting;
    }, 0);
  }
  return currentSlidesPerView;
}
