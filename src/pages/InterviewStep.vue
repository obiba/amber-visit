<template>
  <q-layout v-if="itwStore.isAuthenticated" v-cloak view="hHh lpR fFf">
    <q-header
      elevated
      class="print-hide"
      :class="settings.theme.header"
      v-touch-swipe.mouse.left.right="handleSwipe"
    >
      <q-toolbar>
        <q-toolbar-title>
          {{ tr(step.label) }}
        </q-toolbar-title>
        <q-toolbar-title>
          <span class="text-subtitle2 float-right"
            >{{ tr(step.schema.label) }}
            <q-btn
              v-if="
                step.schema.description ||
                step.schema.copyright ||
                step.schema.license
              "
              size="12px"
              flat
              dense
              round
              icon="info"
              @click="onShowFormDescription"
            >
            </q-btn
          ></span>
        </q-toolbar-title>
      </q-toolbar>
      <q-toolbar
        v-if="hasIdLabel()"
        class="bg-secondary q-pt-sm q-pb-sm"
        style="min-height: 20px"
      >
        <div>{{ idLabel }}: {{ formData._id }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="bg-grey-2">
        <div v-if="isMulti()">
          <q-linear-progress :value="progress" animation-speed="100" />
        </div>
        <div class="q-pa-md">
          <div class="row">
            <div
              v-if="!$q.screen.lt.sm"
              class="col-md-4 col-sm-2"
              :class="
                canPrevious() && isMulti()
                  ? 'text-grey-5 text-center flex flex-center cursor-pointer'
                  : ''
              "
              @click="previousStep"
            >
              <q-icon
                v-if="canPrevious()"
                :name="$q.lang.rtl ? 'arrow_forward' : 'arrow_back'"
                size="xl"
                class="print-hide"
              />
            </div>
            <div class="col-md-4 col-sm-8 col-xs-12 q-mt-sm q-mb-sm">
              <div v-if="isFinalStep">
                <div class="text-subtitle1 q-mt-md q-mb-lg">
                  {{ $t("final_step_label") }}
                </div>
                <div class="flex flex-center">
                  <q-btn
                    :label="$t('save')"
                    icon="cloud_upload"
                    color="primary"
                    @click="onComplete"
                  />
                </div>
              </div>
              <div v-else>
                <BlitzForm
                  :key="remountCounter"
                  :schema="schema"
                  v-model="formData"
                  :columnCount="1"
                  gridGap="32px"
                />
              </div>
              <!--div class="bg-black text-white q-mt-lg q-pa-md">
                <pre>{{ JSON.stringify(formData, null, '  ') }}</pre>
              </div-->
            </div>
            <div
              v-if="!$q.screen.lt.sm"
              class="col-md-4 col-sm-2"
              :class="
                canNext() && isMulti()
                  ? 'text-grey-5 text-center flex flex-center cursor-pointer'
                  : ''
              "
              @click="nextStep"
            >
              <q-icon
                v-if="canNext()"
                :name="$q.lang.rtl ? 'arrow_back' : 'arrow_forward'"
                size="xl"
                class="print-hide"
              />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <q-footer
      elevated
      class="print-hide"
      :class="settings.theme.footer"
      v-touch-swipe.mouse.left.right="handleSwipe"
    >
      <q-toolbar>
        <q-btn
          v-if="mode === 'single'"
          stretch
          flat
          icon="dynamic_feed"
          @click="toggleMode('multi')"
          :title="$t('multi_steps')"
        />
        <q-btn
          v-if="mode === 'multi'"
          stretch
          flat
          icon="grading"
          @click="toggleMode('single')"
          :title="$t('single_page')"
        />
        <q-separator dark vertical v-if="mode === 'single'" />
        <q-btn-dropdown
          v-if="mode === 'single' && toc.length > 0"
          stretch
          flat
          icon="toc"
          :label="$q.screen.lt.sm ? '' : $t('go_to')"
        >
          <q-list>
            <q-item-label
              v-for="entry in toc"
              :key="entry.id"
              header
              clickable
              v-close-popup
              @click="onScroll(entry.id)"
            >
              {{ entry.label }}
            </q-item-label>
          </q-list>
        </q-btn-dropdown>
        <q-space />

        <q-separator dark vertical v-if="isMulti()" />
        <q-btn
          v-if="isMulti()"
          stretch
          flat
          :icon="$q.lang.rtl ? 'chevron_right' : 'chevron_left'"
          @click="previousStep"
          :label="$q.screen.lt.sm ? '' : $t('previous')"
          :disabled="!canPrevious()"
        />
        <q-separator dark vertical v-if="isMulti()" />
        <q-btn
          v-if="isMulti()"
          stretch
          flat
          :icon="$q.lang.rtl ? 'chevron_left' : 'chevron_right'"
          @click="nextStep"
          :label="$q.screen.lt.sm ? '' : $t('next')"
          :disabled="!canNext()"
        />
        <q-separator dark vertical v-if="mode === 'single'" />
        <q-btn
          v-if="mode === 'single'"
          flat
          :title="$t('validate_save')"
          :label="$q.screen.lt.sm ? '' : $t('save')"
          icon="cloud_upload"
          @click="onComplete"
        />
        <q-separator dark vertical />
        <q-btn
          stretch
          flat
          :label="$q.screen.lt.sm ? '' : $t('pause')"
          icon="pause"
          :disable="isFinalStep"
          @click="onPause"
        />
      </q-toolbar>
    </q-footer>

    <q-dialog v-model="showFormDescription">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div
            v-if="step.schema.description"
            v-html="md(tr(step.schema.description))"
          />
        </q-card-section>
        <q-card-section>
          <div
            v-if="step.schema.copyright"
            v-html="'&#169; ' + md(tr(step.schema.copyright))"
          />
          <div
            v-if="caseReportLicense"
            class="q-mt-sm"
            v-html="md($t(caseReportLicense))"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import snarkdown from "snarkdown";
import {
  makeBlitzarQuasarSchemaForm,
  makeSchemaFormTr,
  getBlitzarErrors,
} from "@obiba/quasar-ui-amber";
import { Notify, scroll } from "quasar";
import { BlitzForm, validateFormPerSchema } from "@blitzar/form";
import { t } from "../boot/i18n";
import { settings } from "../boot/settings";

const { getScrollTarget, setVerticalScrollPosition } = scroll;

export default defineComponent({
  name: "InterviewStep",
  components: {
    BlitzForm,
  },
  setup() {
    const authStore = useAuthStore();
    const itwStore = useInterviewStore();
    return {
      authStore,
      itwStore,
      errorsRemain: ref(false),
      errors: ref([]),
      settings,
      debug: ref(false),
      remountCounter: ref(0),
      progress: ref(0),
      formData: ref({}),
      schema: ref([]),
      step: ref({ schema: { items: [] } }),
      showFormDescription: ref(false),
      mode: ref("multi"),
    };
  },

  mounted() {
    if (!this.itwStore.isAuthenticated) {
      this.onLogout();
    } else {
      this.step = this.itwStore.getStepDesign(this.stepName);
      if (this.step) {
        if (this.step.schema.layout) {
          this.mode = this.step.schema.layout;
        }
        this.schema = makeBlitzarQuasarSchemaForm(this.step.schema, {
          locale: this.currentLocale,
          stepId: "__page",
          debug: this.debug,
        });
        // TODO reinstate previous data and other steps data + participant data (for skip conditions)
        const record = this.itwStore.record;
        const initForm = () => {
          this.formData = this.itwStore.record.data;
          this.updateProgress();
          this.remountCounter++;
        };
        if (!record || record.id !== this.stepName || !record.data) {
          this.itwStore.setupRecord(this.stepName).then(() => {
            initForm();
          });
        } else {
          initForm();
        }
      } else {
        console.error("No such interview step with id: " + this.stepName);
        this.$router.push("..");
      }
    }
  },

  watch: {
    mode(newValue, oldValue) {
      this.updateFormData();
      if (newValue === "single") {
        this.schema = makeBlitzarQuasarSchemaForm(this.step.schema, {
          locale: this.currentLocale,
          debug: this.debug,
        });
      } else {
        this.schema = makeBlitzarQuasarSchemaForm(this.step.schema, {
          locale: this.currentLocale,
          stepId: "__page",
          debug: this.debug,
        });
      }
      this.updateProgress();
      this.remountCounter++;
    },
  },

  computed: {
    currentLocale() {
      return this.$root.$i18n.locale;
    },
    stepName() {
      return this.$route.params.name;
    },
    toc() {
      const toc = [];
      if (this.step.schema && this.step.schema.items) {
        this.step.schema.items
          .filter((item) => ["group", "section"].includes(item.type))
          .forEach((item) =>
            toc.push({
              id: item.name.replaceAll(".", "_").toLowerCase(),
              label: this.tr(item.label),
            })
          );
      }
      return toc.filter((entry) => entry.label);
    },
    idLabel() {
      return this.step.schema.idLabel
        ? this.tr(this.step.schema.idLabel)
        : "ID";
    },
    isFinalStep() {
      return (
        this.isMulti() && this.formData.__page === this.step.schema.items.length
      );
    },
    modeOptions() {
      return [
        {
          value: "single",
          label: t("single_page"),
        },
        {
          value: "multi",
          label: t("multi_steps"),
        },
      ];
    },
  },

  methods: {
    hasIdLabel() {
      return this.step.schema.idLabel;
    },
    onShowFormDescription() {
      this.showFormDescription = true;
    },
    onScroll(id) {
      const ele = document.getElementById(id);
      if (ele) {
        const target = getScrollTarget(ele);
        const offset = ele.offsetTop;
        const duration = 200;
        setVerticalScrollPosition(target, offset, duration);
      }
    },
    updateProgress() {
      this.progress = this.formData.__page / this.step.schema.items.length;
    },
    isMulti() {
      return this.mode === "multi";
    },
    handleSwipe({ evt, ...newInfo }) {
      if (this.isMulti()) {
        if (newInfo.direction === "left") {
          this.nextStep();
        } else if (newInfo.direction === "right") {
          this.previousStep();
        }
      }
    },
    formatErrorMessages() {
      const errorMessages = this.errors
        .map((err) => {
          let errMessage =
            err.message === "Field is required"
              ? t("required_field")
              : err.message;
          errMessage = errMessage.charAt(0).toLowerCase() + errMessage.slice(1);
          return `<li>${err.label}: ${errMessage}</li>`;
        })
        .join("");
      return `<ul>${errorMessages}</ul>`;
    },
    canPrevious() {
      return this.isMulti() && this.formData.__page > 0;
    },
    toggleMode(value) {
      this.mode = value;
    },
    previousStep() {
      if (!this.canPrevious()) return;

      this.updateFormData();
      this.mergeStepData({
        data: { __page: this.formData.__page - 1 },
      });
      this.updateProgress();
      this.remountCounter++;
      this.errorsRemain = false;
      this.errors = undefined;
      window.scrollTo(0, 0);
    },
    mergeStepData(payload) {
      const record = this.itwStore.record;
      for (const key in payload.data) {
        record.data[key] = payload.data[key];
      }
      this.itwStore.updateRecord(this.stepName, record.data);
    },
    canNext() {
      return (
        this.isMulti() && this.formData.__page < this.step.schema.items.length
      );
    },
    nextStep() {
      if (!this.canNext()) return;

      this.updateFormData();
      this.onValidate();
      // if no error in the step, continue
      if (this.errorsRemain) {
        Notify.create({
          message: this.$t("validation_errors", {
            errors: this.formatErrorMessages(),
          }),
          html: true,
          color: "negative",
        });
      } else {
        this.mergeStepData({
          data: { __page: this.formData.__page + 1 },
        });
        this.updateProgress();
        this.remountCounter++;
        window.scrollTo(0, 0);
      }
    },
    updateFormData() {
      this.itwStore.updateRecord(this.stepName, this.formData);
    },
    onValidate() {
      this.errors = getBlitzarErrors(
        this.schema,
        validateFormPerSchema(this.formData, this.schema)
      );
      this.errorsRemain = this.errors.length > 0;
    },
    onComplete() {
      this.updateFormData();
      this.onValidate();
      if (this.errorsRemain) {
        Notify.create({
          message: this.$t("validation_errors", {
            errors: this.formatErrorMessages(),
          }),
          html: true,
          color: "negative",
        });
      } else {
        this.itwStore.completeRecord().then(() => this.$router.push(".."));
      }
    },
    onPause() {
      this.updateFormData();
      this.itwStore.pauseRecord().then(() => this.$router.push(".."));
    },
    tr(key) {
      return makeSchemaFormTr(this.step.schema, { locale: this.currentLocale })(
        key
      );
    },
    md(text) {
      return text ? snarkdown(text) : text;
    },
    onLogout() {
      // TODO make sure no save is pending
      this.itwStore.reset(true);
      if (this.authStore.isAuthenticated) {
        this.authStore.logout().then(() => {
          this.$router.push("../login");
        });
      } else {
        this.$router.push("../login");
      }
    },
  },
});
</script>
