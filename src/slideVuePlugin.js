import SliderVue from './components/slider.vue';

const slideVuePlugin = {
  install(Vue) {
    Vue.component('slide-vue', SliderVue);
  }
};

export default slideVuePlugin;
