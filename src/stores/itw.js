import { defineStore } from "pinia";
import { ref, computed } from "vue";

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
    const save = ref(null); // the completed interviews to save

    const participant = computed(() => design.value?.participant);
    const investigators = computed(() => design.value?.investigators);
    const steps = computed(() => design.value?.steps);

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

    /**
     * Initialize the interview if not already done.
     */
    async function initInterview() {
      if (!itw.value) {
        const payload = {};
        if (cred.value) {
          payload.query = {};
          payload.headers = { Authorization: `Participant ${cred.value}` };
        } else {
          payload.query = { $limit: 1, code: code.value };
        }
        return itwService.find(payload).then((response) => {
          itw.value = response.data[0];
        }); // TODO handle error
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
        // TODO add other steps data
        const step = itw.value.steps?.find((step) => step.name === name);
        if (step) {
          record.value = {
            name,
            data: step.data,
          };
        } else {
          // start the record of the step
          record.value = {
            name,
            data: { __page: 0 },
          };
        }
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
      const payload = {};
      if (cred.value) {
        payload.query = {};
        payload.headers = { Authorization: `Participant ${cred.value}` };
      } else {
        payload.query = { code: code.value };
      }
      const stepDesign = getStepDesign(record.value.name);
      const data = {
        form: stepDesign.form,
        revision: stepDesign.revision,
        ...record.value,
      };
      data.state = state;
      return itwService
        .patch(itw.value._id, { steps: [data] }, payload)
        .then((response) => {
          record.value = null;
          itw.value = response;
        });
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

    function reset() {
      code.value = null;
      design.value = null;
      record.value = null;
      cred.value = null;
      itw.value = null;
      save.value = null;
    }

    return {
      cred,
      code,
      design,
      record,
      itw,
      save,
      participant,
      investigators,
      steps,
      initByInterviewer,
      initByParticipant,
      initInterview,
      getStepDesign,
      setupRecord,
      updateRecord,
      pauseRecord,
      completeRecord,
      getRecordStatus,
      reset,
    };
  },
  {
    persist: true,
  }
);
