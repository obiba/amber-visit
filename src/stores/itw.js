import { defineStore } from "pinia";

export const useInterviewStore = defineStore("itw", {
  state: () => ({
    design: null, // the interview design
    record: null, // the current step form record
    cred: null, // the participant credentials if self-administered
    itw: null, // the interview collected data, to be saved
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
    /**
     * Get the step definition from the interview design.
     * @param {string} name
     * @returns
     */
    getStep(name) {
      return this.design?.steps?.find((step) => step.name === name);
    },
    /**
     * Initiate or reinstate the current record for the step.
     * @param {string} name
     */
    setupRecord(name) {
      this.initInterview();
      // TODO add other steps data
      if (this.itw.steps[name]) {
        this.record = {
          name,
          data: this.itw.steps[name].data,
        };
      } else {
        // start the record of the step
        this.record = {
          name,
          data: { __page: 0 },
        };
      }
    },
    /**
     * Update the current record and merge into the interview steps data.
     * @param {string} name
     * @param {Object} data
     */
    updateRecord(name, data) {
      this.record = {
        name,
        data,
      };
      this.mergeRecord("in_progress");
    },
    /**
     * Pause form: merge current record into the interview steps data with 'in_progress' status and set record to null.
     */
    pauseRecord() {
      this.initInterview();
      if (this.record) {
        this.mergeRecord("in_progress");
        this.record = null;
      }
    },
    /**
     * Complete form: merge current record into the interview steps data with 'completed' status and set record to null.
     */
    completeRecord() {
      this.initInterview();
      if (this.record) {
        this.mergeRecord("completed");
        this.record = null;
      }
    },
    /**
     * Get step status: 'in_progress', 'completed' or null (i.e. not started).
     * @param {string} name
     * @returns
     */
    getRecordStatus(name) {
      if (this.itw && this.itw.steps[name]) {
        return this.itw.steps[name].status;
      }
      return null;
    },
    /**
     * Initialize the interview if not already done.
     */
    initInterview() {
      if (!this.itw) {
        this.itw = {
          code: this.participant.code,
          interviewDesign: this.design._id,
          steps: {},
        };
      }
    },
    /**
     * Merge current record into the interview steps data.
     * @param {string} status
     */
    mergeRecord(status) {
      this.itw.steps[this.record.name] = this.record;
      this.itw.steps[this.record.name].status = status;
      // TODO remove other steps data
    },
  },
  persist: true,
});
