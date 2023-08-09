import { defineStore } from "pinia";

export const useInterviewStore = defineStore("itw", {
  state: () => ({
    design: null,
    record: null,
    cred: null,
    itw: null,
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
  actions: {
    getStep(id) {
      return this.design?.steps?.find((step) => step._id === id);
    },
    setupRecord(stepId) {
      if (this.itw && this.itw[stepId]) {
        this.record = this.itw[stepId];
      } else {
        // start the record of the step
        this.record = {
          id: stepId,
          data: { __page: 0 },
          status: "in_progress",
        };
      }
    },
    updateRecord(val) {
      this.record = val;
    },
    pauseRecord() {
      if (!this.itw) {
        this.itw = {};
      }
      if (this.record) {
        this.itw[this.record.id] = this.record;
        this.itw[this.record.id].status = "in_progress";
        this.record = null;
      }
    },
    completeRecord() {
      if (!this.itw) {
        this.itw = {};
      }
      if (this.record) {
        this.itw[this.record.id] = this.record;
        this.itw[this.record.id].status = "completed";
        this.record = null;
      }
    },
    getRecordStatus(stepId) {
      if (this.itw && this.itw[stepId]) {
        return this.itw[stepId].status;
      }
      return null;
    },
  },
  persist: true,
});
