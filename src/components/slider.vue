<template>
  <div
    ref="slider"
    :class="classNames.sliderClass"
    :style="sliderMainElementStyles"
  >
    <button
      :class="[
        classNames.sliderButtonClass,
        classNames.sliderButtonPrevClass,
        isFirstSlideVisible ? classNames.sliderButtonDisabledClass : '',
      ]"
      :disabled="isFirstSlideVisible || isScrolling"
      :style="addInlineStylesToButton ? sliderButtonStyles : ''"
      style="left: 0"
      @click="showPrev"
    >
      <slot
        name="button-prev"
      >
      </slot>
    </button>
    <div
      ref="sliderView"
      :class="classNames.sliderViewClass"
      :style="sliderViewStyles"
    >
      <div
        ref="sliderContainer"
        :class="classNames.sliderContainerClass"
        :style="sliderContainerStyles"
      >
        <div
          v-for="(value, slide, index) in this.$slots"
          :ref="`slide-${index}`"
          :key="index"
          :class="classNames.sliderElementClass"
          :style="sliderElementStyles"
        >
          <slot
            :name="`slide-${index}`"
          >
          </slot>
        </div>
      </div>
    </div>
    <button
      :class="[
        classNames.sliderButtonClass,
        classNames.sliderButtonNextClass,
        isLastSlideVisible ? classNames.sliderButtonDisabledClass : '',
      ]"
      :disabled="isLastSlideVisible || isScrolling"
      :style="addInlineStylesToButton ? sliderButtonStyles : ''"
      style="right: 0"
      title="Next slide"
      @click="showNext"
    >
      <slot
        name="button-next"
      >
      </slot>
    </button>
  </div>
</template>

<script>
  import smoothscroll from 'smoothscroll-polyfill';
  import consoleMessenger from '../utils/consoleMessenger';
  import createSlidesPerBreakpointObject from '../utils/createSlidesPerBreakpointObject';
  import getSlidesPreViewFromBreakpoitsList from '../utils/getSlidesPreViewFromBreakpoitsList';
  import debounce from '../utils/debounce';

  smoothscroll.polyfill();

  const defaultClassNames = {
    sliderClass: 'slider',
    sliderViewClass: 'slider__view',
    sliderContainerClass: 'slider__container',
    sliderElementClass: 'slider__element',
    sliderButtonClass: 'slider__btn',
    sliderButtonNextClass: 'slider__btn--next',
    sliderButtonPrevClass: 'slider__btn--prev',
    sliderButtonDisabledClass: 'slider__btn--disabled'
  };

  export default {
    name: 'slider',
    props: {
      initialSlideIndex: {
        type: Number,
        default: 0
      },
      slidesPerView: {
        type: [
          Number,
          String,
          Object
        ],
        default: 1
      },
      slideGapBetween: {
        type: Number,
        default: 0
      },
      marginStart: {
        type: Number,
        default: 0
      },
      marginEnd: {
        type: Number,
        default: 0
      },
      namespace: {
        type: Object,
        default: undefined
      },
      slidesPerPage: {
        type: [
          Number,
          String
        ],
        default: 1
      },
      addInlineStylesToButton: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        sliderPosition: 0,
        currentSlidesPerView: this.getCurrentSlidePerView(),
        previousSlideIndex: null,
        visibleSlides: [],
        isScrolling: false
      };
    },
    computed: {
      classNames() {
        if (this.namespace) {
          return Object.assign(defaultClassNames, this.namespace);
        } else {
          return defaultClassNames;
        }
      },
      intersectionObserverOptions() {
        return {
          root: this.$refs.sliderView,
          rootMargin: '0px',
          threshold: 0.99
        };
      },
      slidesAmount() {
        let total = 0;
        Object.keys(this.$slots).forEach(slot => {
          if (slot.match(/^slide\-/)) {
            total++;
          }
        });
        return total;
      },
      sliderViewStyles() {
        return {
          marginInlineStart: `${this.marginStart}px`,
          marginInlineEnd: `${this.marginEnd}px`,
        };
      },
      sliderContainerStyles() {
        return {
          display: 'flex',
          scrollSnapType: 'x mandatory',
          overflowX: 'scroll',
          scrollbarWidth: 'none', /* Hide scrollbar on Firefox */
          '-ms-overflow-style': 'none'
        };
      },
      sliderElementStyles() {
        const styles = {
          marginInlineEnd: `${this.slideGapBetween}px`,
          scrollSnapAlign: this.slidesPerViewcenter === 1 ? 'center' : 'start',
          height: 'auto',
        };
        this.currentSlidesPerView === 'auto' ? styles.width = 'auto' : styles.minWidth = this.singleSlideWidth;
        return styles;
      },
      sliderButtonStyles() {
        return {
          zIndex: '1',
          position: 'absolute',
          top: '50%',
          transform: 'translate(0, -50%)',
          width: '20px'
        };
      },
      sliderMainElementStyles() {
        return {
          position: 'relative'
        };
      },
      singleSlideWidth() {
        const elementsAmountRoundUp = Math.ceil(this.currentSlidesPerView);
        const marginsAmount = elementsAmountRoundUp - 1;
        const totalMarginsWidth = marginsAmount * this.slideGapBetween;
        const slideWidth = `calc((100% - ${totalMarginsWidth}px) / ${this.currentSlidesPerView})`;
        return slideWidth;
      },
      isFirstSlideVisible() {
        return this.visibleSlides.indexOf(0) > -1;
      },
      isLastSlideVisible() {
        return this.visibleSlides.indexOf(this.slidesAmount - 1) > -1;
      },
    },
    mounted() {
      /* Hide scrollbar for Chrome, Safari, Opera, IE and Edge */
      this.createStylesElement(`.${this.classNames.sliderClass}__container::-webkit-scrollbar { display: none;}`);

      if (this.slideGapBetween > 0) {
        this.removeMarginFromLastSlide();
      }

      if (this._observer) {
        this._observer = null;
      }
      this._observer = new IntersectionObserver(this.intersectionObserverCallback, this.intersectionObserverOptions);
      const slideElements = this.$refs.sliderContainer.childNodes;
      slideElements.forEach(elements => this._observer.observe(elements));

      if (this.initialSlideIndex > 0) {
        this.slideTo(this.initialSlideIndex);
      }

      let timer = null;

      this.$refs.sliderContainer.addEventListener('scroll', () => {
        this.isScrolling = true;

        if (timer !== null) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          this.isScrolling = false;
        }, 100);
      });
    },
    methods: {
      createStylesElement(styles) {
        const css = document.createTextNode(styles);
        const styleSheet = document.createElement('style');
        const { head } = document;
        head.appendChild(styleSheet);
        styleSheet.type = 'text/css';
        styleSheet.appendChild(css);
      },
      intersectionObserverCallback(entries) {
        entries.forEach(entry => {
          const currentElementIndex = this.getSlideIndex(entry.target);
          const slideIndexInVisibleSlides = this.visibleSlides.indexOf(currentElementIndex);
          if (entry.isIntersecting && slideIndexInVisibleSlides < 0) {
            this.visibleSlides.push(currentElementIndex);
            this.$refs[`slide-${currentElementIndex}`][0].classList.add(`${defaultClassNames.sliderElementClass}--active`);
          } else {
            this.$refs[`slide-${currentElementIndex}`][0].classList.remove(`${defaultClassNames.sliderElementClass}--active`);
            if (this.visibleSlides.indexOf(currentElementIndex) > -1) {
              this.visibleSlides = this.visibleSlides.filter(el => el !== currentElementIndex);
            }
          }
        });

        // sort visible slides and update current slide index with first visible slide index
        this.visibleSlides = this.visibleSlides.sort((a, b) => a - b);
      },
      getSlideIndex(element) {
        return Array.prototype.indexOf.call(this.$refs.sliderContainer.childNodes, element);
      },
      getCurrentSlidePerView() {
        if (this._windowResizeHandler) {
          window.removeEventListener('resize', debounce(this._windowResizeHandler, 300));
          this._windowResizeHandler = null;
        }

        if (typeof this.slidesPerView === 'number' && this.slidesPerView !== 0 || this.slidesPerView === 'auto') {
          return this.slidesPerView;
        } else if (typeof this.slidesPerView === 'object') {
          const slidesPerBreakpoint = createSlidesPerBreakpointObject(this.slidesPerView);

          this._windowResizeHandler = () => {
            this.sliderPosition = 0;
            this.currentSlidesPerView = getSlidesPreViewFromBreakpoitsList(slidesPerBreakpoint);
          };

          window.addEventListener('resize', this._windowResizeHandler);

          return getSlidesPreViewFromBreakpoitsList(slidesPerBreakpoint);
        } else {
          consoleMessenger.warn('Invalid property value: slides-per-view');
          return this.slidesPerView;
        }
      },
      removeMarginFromLastSlide() {
        if (this.slideGapBetween > 0) {
          const lastSlide = this.$refs.sliderContainer.lastChild;
          lastSlide.style.marginInlineEnd = 0;
        }
      },
      getVisibleSlideIndexes() {
        return this.visibleSlides;
      },
      showNext(e) {
        e.stopPropagation();
        if (this.isLastSlideVisible) return;
        if (this.slidesPerPage === 1) {
          const nextSlide = this.visibleSlides[0] + 1;
          this.slideTo(nextSlide);
        } else if (this.slidesPerPage === 'auto') {
          const fullyVisibleSlides = parseInt(this.currentSlidesPerView, 10);
          const newLastSlideIndex = fullyVisibleSlides + this.visibleSlides[0];
          this.slideTo(newLastSlideIndex);
        }
      },
      showPrev(e) {
        e.stopPropagation();
        if (this.isFirstSlideVisible) return;
        if (this.slidesPerPage === 1) {
          const prevSlide = this.visibleSlides[0] - 1;
          this.slideTo(prevSlide);
        } else if (this.slidesPerPage === 'auto') {
          const fullyVisibleSlides = parseInt(this.currentSlidesPerView, 10);
          const newLastSlideIndex = this.visibleSlides[0] - fullyVisibleSlides;
          this.slideTo(newLastSlideIndex);
        }
      },
      slideTo(slideIndex) {
        let scrollPosition = 0;
        let index = slideIndex;

        if (index > this.slidesAmount - 1) {
          index = this.slidesAmount - 1;
        }

        for (let i = 0; i < index; i++) {
          scrollPosition += this.$refs[`slide-${i}`][0].offsetWidth;
          scrollPosition += parseInt(window.getComputedStyle(this.$refs[`slide-${i}`][0]).marginInlineStart, 10);
          scrollPosition += parseInt(window.getComputedStyle(this.$refs[`slide-${i}`][0]).marginInlineEnd, 10);
        }

        this.$refs.sliderContainer.scroll({
          top: 0,
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };
</script>
