import { defineStore } from "pinia";
import { useAuth } from "feathers-pinia";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const { api } = useFeathers();
    const auth = useAuth({ api, servicePath: "user" });
    if (auth.isAuthenticated) auth.reAuthenticate();
    return { ...auth };
  },
  { persist: true }
);
