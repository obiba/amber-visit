import { defineStore } from "pinia";

export const useInterviewStore = defineStore("itw", {
  state: () => ({
    design: null,
    itw: null,
    cred: null,
  }),
  getters: {
    participant: (state) => state.design?.participant,
    investigators: (state) => state.design?.investigators,
    steps: (state) => state.design?.steps,
    payload: (state) =>
      state.cred
        ? {
            query: {},
            headers: {
              Authorization: `Participant ${state.cred}`,
            },
          }
        : { query: {} },
  },
  persist: true,
});
