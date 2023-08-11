import { defineStore } from "pinia";
import { ref, computed, toHandlers } from "vue";

export const useInterviewStore = defineStore(
  "itw",
  () => {
    const { api } = useFeathers();
    const itwdService = api.service("itwd");
    const itwService = api.service("itw");
    const design = ref(null); // the interview design
    const record = ref(null); // the current step form record
    const code = ref(null); // the current participant's code
    const cred = ref(null); // the participant credentials if self-administered
    const itw = ref(null); // the interview collected data, to be saved
    const tosave = ref([]); // mark steps which changes are to be saved

    const participant = computed(() => design.value?.participant);
    const investigators = computed(() => design.value?.investigators);
    const steps = computed(() => design.value?.steps);
    const pending = computed(() => tosave.value.length > 0); // has pending changes to be saved
    const completed = computed(() => {
      if (itw.value) {
        return itw.value.state === "completed";
      }
      return false;
    });

    async function initByParticipant(code, password) {
      if (code) {
        cred.value = btoa(password ? `${code}:${password}` : code);
      }
      return itwdService
        .find({
          query: {},
          headers: { Authorization: `Participant ${cred.value}` },
        })
        .then((response) => {
          design.value = response.data[0];
          itw.value = null;
        })
        .then(() => initInterview());
    }

    async function initByInterviewer(pcode) {
      code.value = pcode;
      return itwdService
        .find({
          query: { $limit: 1, code: pcode },
        })
        .then((response) => {
          design.value = response.data[0];
          itw.value = null;
        })
        .then(() => initInterview());
    }

    function makePayload() {
      const payload = {};
      if (cred.value) {
        payload.query = {};
        payload.headers = { Authorization: `Participant ${cred.value}` };
      } else {
        payload.query = { code: code.value };
      }
      return payload;
    }

    /**
     * Initialize the interview if not already done.
     */
    async function initInterview() {
      if (!itw.value) {
        // get the interview data if we do not have it already
        const payload = makePayload();
        return itwService.find(payload).then((response) => {
          itw.value = response.data[0];
        });
      } else {
        return new Promise((resolve) => resolve());
      }
    }

    /**
     * Get the step definition from the interview design.
     * @param {string} name
     * @returns
     */
    function getStepDesign(name) {
      return design.value?.steps?.find((step) => step.name === name);
    }

    /**
     * Initiate or reinstate the current record for the step.
     * @param {string} name
     */
    async function setupRecord(name) {
      return initInterview().then(() => {
        const step = itw.value.steps?.find((step) => step.name === name);
        let rec;
        if (step) {
          rec = {
            name,
            data: step.data,
          };
        } else {
          // start the record of the step
          rec = {
            name,
            data: { __page: 0 },
          };
        }
        // add other steps data
        itw.value.steps
          ?.filter((step) => step.name !== name)
          .forEach((step) => {
            if (!rec.data._) {
              rec.data._ = {};
            }
            rec.data._[step.name] = step.data;
          });
        record.value = rec;
      });
    }

    /**
     * Update the current record and merge into the interview steps data.
     * @param {string} name
     * @param {Object} data
     */
    function updateRecord(name, data) {
      record.value = {
        name,
        data,
      };
      mergeRecord("in_progress");
    }

    /**
     * Pause form: merge current record into the interview steps data with 'in_progress' state and set record to null.
     */
    async function pauseRecord() {
      return saveRecord("in_progress");
    }

    /**
     * Complete form: merge current record into the interview steps data with 'completed' state and set record to null.
     */
    async function completeRecord() {
      return saveRecord("completed");
    }

    /**
     * Save the interview with the provided state.
     * @param {string} state
     */
    async function saveRecord(state) {
      const payload = makePayload();
      const stepDesign = getStepDesign(record.value.name);
      const stepObj = {
        form: stepDesign.form,
        revision: stepDesign.revision,
        ...record.value,
      };
      stepObj.state = state;
      delete stepObj.data._;
      return itwService
        .patch(itw.value._id, { steps: [stepObj] }, payload)
        .then((response) => {
          record.value = null;
          itw.value = response;
        })
        .catch((err) => {
          // handle save error
          // include patch data to current itw, so that it works offline and saving can be postponed
          if (!itw.value.steps) {
            itw.value.steps = [stepObj];
          } else {
            const idx = itw.value.steps
              .map((step) => step.name)
              .indexOf(stepObj.name);
            if (idx < 0) {
              itw.value.steps.push(stepObj);
            } else {
              itw.value.steps.splice(idx, 1, stepObj);
            }
          }
          if (!tosave.value.includes(stepObj.name)) {
            tosave.value.push(stepObj.name);
          }
        });
    }

    /**
     * Save steps data that could not be changed before.
     * @returns
     */
    async function savePendingRecords() {
      if (tosave.value.length > 0) {
        const stepObjs = itw.value.steps.filter((step) =>
          tosave.value.includes(step.name)
        );
        const payload = makePayload();
        return itwService
          .patch(itw.value._id, { steps: stepObjs }, payload)
          .then((response) => {
            itw.value = response;
            tosave.value = [];
          });
      }
    }

    /**
     * Get step state: 'in_progress', 'completed' or null (i.e. not started).
     * @param {string} name
     * @returns
     */
    function getRecordStatus(name) {
      if (itw.value && itw.value.steps) {
        const step = itw.value.steps.find((step) => step.name === name);
        if (step) {
          return step.state;
        }
      }
      return null;
    }

    /**
     * Merge current record into the interview steps data.
     * @param {string} state
     */
    function mergeRecord(state) {
      itw.value.steps[record.value.name] = record.value;
      itw.value.steps[record.value.name].state = state;
      // TODO remove other steps data
    }

    /**
     * Clear store from data.
     */
    function reset(force) {
      // check if changes to saved, otherwise data will be lost
      if (tosave.value.length === 0 || force) {
        code.value = null;
        design.value = null;
        record.value = null;
        cred.value = null;
        itw.value = null;
        tosave.value = [];
      }
    }

    return {
      cred,
      code,
      design,
      record,
      itw,
      tosave,
      // computed
      participant,
      investigators,
      steps,
      pending,
      completed,
      // methods
      initByInterviewer,
      initByParticipant,
      initInterview,
      getStepDesign,
      setupRecord,
      updateRecord,
      pauseRecord,
      completeRecord,
      getRecordStatus,
      savePendingRecords,
      reset,
    };
  },
  {
    persist: true,
  }
);
