// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import Vuex from "vuex";
import ajax from "./functions/ajax";
import urls from "./functions/urls";
import getHumanDate from "./functions/humanDate";

Vue.prototype.$urls = urls;
Vue.prototype.$antd = Antd;
Vue.prototype.$ajax = ajax;
Vue.prototype.$humanDate = getHumanDate;

Vue.config.productionTip = false;

Vue.use(Antd);
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    avatarSrc: "http://p.qlogo.cn/bizmail/DaKOA6aHxn24gyNbZg1ZeEuiaDwI83BxRkg16o7nMOJ6WFZAEtzBIpA/",
    loginStatus: false,
    navActive: 0
  },
  mutations: {
    updateAvatarSrc(state, url) {
      state.avatarSrc = url;
    },
    updateLoginStatus(state, status) {
      state.loginStatus = status;
    },
    setActiveNav(state, val) {
      state.navActive = val;
    }
  },
  actions: {
    async checkLoginStatus(context) {
      const responseRaw = await ajax.get(urls.myInfo);
      const response = responseRaw.data;
      if (response.code === 1) {
        context.commit("updateAvatarSrc", response.msg.avatar);
        context.commit("updateLoginStatus", true);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        context.commit("updateLoginStatus", false);
      }
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  components: { App },
  template: "<App/>"
});