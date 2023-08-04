import { boot } from "quasar/wrappers";
import axios from "axios";
import { LoadingBar } from "quasar";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: process.env.API });

api.defaults.withCredentials = true;

LoadingBar.setDefaults({
  color: "secondary",
  size: "15px",
  position: "top",
});

api.interceptors.request.use(
  function (config) {
    LoadingBar.start();
    return config;
  },
  function (error) {
    LoadingBar.stop();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  function (response) {
    LoadingBar.stop();
    return response;
  },
  function (error) {
    LoadingBar.stop();
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { axios };
