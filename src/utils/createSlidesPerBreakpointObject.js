export default function createSlidesPerBreakpointObject(slidesPerView) {
  let slidesPerBreakpoint = [];
  for (let breakpoint in slidesPerView) {
    const slidesPerViewValue = slidesPerView[breakpoint];
    if (!Number.isNaN(slidesPerViewValue)) {
      if (breakpoint === 'default') {
        slidesPerBreakpoint.unshift({ breakpoint: 0, slidesPerView: slidesPerViewValue });
      } else {
        const breakpointValue = breakpoint;
        if (!Number.isNaN(breakpointValue)) {
          slidesPerBreakpoint.push({ breakpoint: breakpointValue, slidesPerView: slidesPerViewValue })
        }
      }
    } else if (slidesPerView[breakpoint] === 'auto') {
      slidesPerBreakpoint.push({ breakpoint: breakpoint, slidesPerView: slidesPerView[breakpoint] });
    } else {
      consoleMessenger.warn('Invalid property value: slides-per-view');
    }
  }

  slidesPerBreakpoint = slidesPerBreakpoint.sort((a, b) => a.breakpoint - b.breakpoint);
  return slidesPerBreakpoint;
}