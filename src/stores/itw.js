import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useInterviewStore = defineStore(
  "itw",
  () => {
    const { api } = useFeathers();
    const interviewDesignService = api.service("itwd");
    const design = ref(null); // the interview design
    const record = ref(null); // the current step form record
    const cred = ref(null); // the participant credentials if self-administered
    const itw = ref(null); // the interview collected data, to be saved
    const save = ref(null); // the completed interviews to save

    const participant = computed(() => design.value?.participant);
    const investigators = computed(() => design.value?.investigators);
    const steps = computed(() => design.value?.steps);

    async function initByParticipant(code, password) {
      cred.value = btoa(password ? `${code}:${password}` : code);
      return interviewDesignService
        .find({
          query: {},
          headers: { Authorization: `Participant ${cred.value}` },
        })
        .then((response) => {
          design.value = response.data[0];
        });
    }

    async function initByInterviewer(code) {
      return interviewDesignService
        .find({
          query: { $limit: 1, code: code },
        })
        .then((response) => {
          design.value = response.data[0];
        });
    }

    /**
     * Initialize the interview if not already done.
     */
    function initInterview() {
      if (!itw.value) {
        itw.value = {
          code: participant.value.code,
          interviewDesign: design.value._id,
          steps: {},
        };
      }
    }

    /**
     * Get the step definition from the interview design.
     * @param {string} name
     * @returns
     */
    function getStep(name) {
      return design.value?.steps?.find((step) => step.name === name);
    }

    /**
     * Initiate or reinstate the current record for the step.
     * @param {string} name
     */
    function setupRecord(name) {
      initInterview();
      // TODO add other steps data
      if (itw.value.steps[name]) {
        record.value = {
          name,
          data: itw.value.steps[name].data,
        };
      } else {
        // start the record of the step
        record.value = {
          name,
          data: { __page: 0 },
        };
      }
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
    function pauseRecord() {
      initInterview();
      if (record.value) {
        mergeRecord("in_progress");
        record.value = null;
      }
    }

    /**
     * Complete form: merge current record into the interview steps data with 'completed' state and set record to null.
     */
    function completeRecord() {
      initInterview();
      if (record.value) {
        mergeRecord("completed");
        record.value = null;
      }
    }

    /**
     * Save the interview with the provided state.
     * @param {string} state
     */
    function saveInterview(state) {
      const interview = {
        code: participant.value.code,
        identifier: participant.value.identifier,
        participant: participant.value._id,
        interviewDesign: design.value._id,
        state: state,
        steps: [],
      };
      for (const name in itw.value.steps) {
        const stepRecord = itw.value.steps[name];
        const stepDesign = design.value.steps.find(
          (s) => s.name === stepRecord.name
        );
        const step = {
          name: stepDesign.name,
          form: stepDesign.form,
          revision: stepDesign.revision,
          state: stepRecord.state,
          data: stepRecord.data,
        };
        interview.steps.push(step);
      }
      // make sure there is only one interview for the same participant
      const idx = save.value
        .map((itw) => itw.code)
        .indexOf(participant.value.code);
      if (idx < 0) {
        save.value.push(interview);
      } else {
        save.value.splice(idx, 1, interview);
      }
    }

    /**
     * Get step state: 'in_progress', 'completed' or null (i.e. not started).
     * @param {string} name
     * @returns
     */
    function getRecordStatus(name) {
      if (itw.value && itw.value.steps[name]) {
        return itw.value.steps[name].state;
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
      design.value = null;
      record.value = null;
      cred.value = null;
      itw.value = null;
      save.value = null;
    }

    return {
      design,
      record,
      cred,
      itw,
      save,
      participant,
      investigators,
      steps,
      payload,
      initByInterviewer,
      initByParticipant,
      getStep,
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
