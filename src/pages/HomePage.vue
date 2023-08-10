<template>
  <q-page v-cloak>
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="row q-pa-md">
        <div class="col"></div>
        <div class="col-md-6 col-sm-8 col-xs-12">
          <div v-if="auth.user">
            <q-card flat class="q-mb-md bg-grey-3">
              <q-card-section>
                <q-list>
                  <q-item v-if="itwStore.participant && !receive">
                    <q-item-section>
                      <div class="text-h6">{{ itwStore.participant.code }}</div>
                    </q-item-section>
                    <q-item-section avatar>
                      <q-btn
                        :title="$t('main.receive_participant')"
                        icon-right="person"
                        color="secondary"
                        rounded
                        no-caps
                        class="q-mt-sm q-mb-sm"
                        @click="onReceive(true)"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item v-if="receive || !itwStore.participant">
                    <q-item-section>
                      <q-input
                        v-model="code"
                        :label="$t('main.code')"
                        mask="XXXXXX"
                        class="q-mb-md"
                      />
                    </q-item-section>
                    <q-item-section avatar>
                      <q-btn
                        color="dark"
                        @click="onLoad(code)"
                        :disable="!code || code.length < 6"
                        class="q-mt-md"
                        >{{ $t("start") }}</q-btn
                      >
                      <q-btn
                        v-if="itwStore.participant"
                        :label="$t('cancel')"
                        color="secondary"
                        flat
                        no-caps
                        class="q-mt-sm"
                        @click="onReceive(false)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
          <q-card
            v-if="itwStore.design && !receive"
            :dark="settings.theme.dark"
            flat
            class="q-mb-md"
          >
            <q-card-section>
              <div class="q-pl-md q-pr-md">
                <div class="text-h6">{{ tr(itwStore.design.label) }}</div>
                <div v-html="md(tr(itwStore.design.description))"></div>
              </div>
            </q-card-section>
            <q-separator :dark="settings.theme.dark"></q-separator>
            <q-card-section>
              <q-list :dark="settings.theme.dark" separator>
                <template v-for="step in itwStore.design.steps" :key="step._id">
                  <q-item :dark="settings.theme.dark" class="q-pt-lg q-pb-lg">
                    <q-item-section>
                      <q-item-label>{{ tr(step.label) }}</q-item-label>
                      <q-item-label caption lines="2">{{
                        tr(step.description)
                      }}</q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                      <q-btn
                        v-if="itwStore.getRecordStatus(step.name) === null"
                        :title="$t('main.start_record')"
                        :icon-right="
                          $q.lang.rtl ? 'chevron_left' : 'chevron_right'
                        "
                        color="primary"
                        rounded
                        no-caps
                        class="q-mt-sm q-mb-sm"
                        :to="`step/${step.name}`"
                      />
                      <q-btn
                        v-if="
                          itwStore.getRecordStatus(step.name) === 'in_progress'
                        "
                        :title="$t('main.start_record')"
                        icon-right="fas fa-ellipsis-h"
                        color="primary"
                        rounded
                        no-caps
                        class="q-mt-sm q-mb-sm"
                        :to="`step/${step.name}`"
                      />
                      <q-btn
                        v-if="
                          itwStore.getRecordStatus(step.name) === 'completed'
                        "
                        :title="$t('main.start_record')"
                        icon-right="check"
                        color="positive"
                        rounded
                        no-caps
                        class="q-mt-sm q-mb-sm"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-card-section>
          </q-card>
          <div v-if="!auth.user">
            <q-card flat class="q-mb-md bg-grey-3">
              <q-card-section>
                <q-list>
                  <q-item>
                    <q-item-section>
                      {{ $t("main.investigator_help") }}
                    </q-item-section>
                    <q-item-section avatar>
                      <q-btn
                        icon-right="help"
                        color="info"
                        rounded
                        no-caps
                        @click="showHelp = !showHelp"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
              <q-separator />
              <q-card-section v-show="showHelp">
                <q-list>
                  <q-item
                    v-for="investigator in itwStore.investigators"
                    :key="investigator.email"
                    class="q-mb-md"
                  >
                    <q-item-section>
                      <q-item-label overline
                        >{{ investigator.firstname }}
                        {{ investigator.lastname }}</q-item-label
                      >
                      <q-item-label v-if="investigator.email">
                        <q-icon name="fas fa-envelope" class="q-mr-sm" />
                        <a :href="`mailto:${investigator.email}`">{{
                          investigator.email
                        }}</a></q-item-label
                      >
                      <q-item-label v-if="investigator.phone">
                        <q-icon name="fas fa-phone" class="q-mr-sm" />
                        {{ investigator.phone }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div class="col"></div>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { Notify } from "quasar";
import { settings } from "../boot/settings";
import snarkdown from "snarkdown";
import { makeSchemaFormTr } from "@obiba/quasar-ui-amber";

export default defineComponent({
  name: "HomePage",
  setup() {
    const auth = useAuthStore();
    const { api } = useFeathers();
    const interviewDesignService = api.service("itwd");
    const itwStore = useInterviewStore();
    const { locale } = useI18n({ useScope: "global" });
    return {
      locale,
      auth,
      settings,
      interviewDesignService,
      code: ref(""),
      receive: ref(false),
      showHelp: ref(false),
      itwStore,
    };
  },
  methods: {
    tr(key) {
      return makeSchemaFormTr(this.itwStore.design, { locale: this.locale })(
        key
      );
    },
    truncate(text) {
      if (!text) return text;
      const sentences = text.split(".");
      return (
        sentences[0] +
        (sentences.length > 1 && sentences[1] !== "" ? "..." : ".")
      );
    },
    md(text) {
      return text ? snarkdown(text) : text;
    },
    onReceive(val) {
      this.receive = val;
      if (val) {
        this.code = "";
      }
    },
    onRefresh(done) {
      if (this.itwStore.participant) {
        this.onLoad(this.itwStore.participant.code, done);
      } else if (typeof done === "function") {
        done();
      }
    },
    onLoad(code, done) {
      const payload = this.itwStore.payload;
      if (!this.itwStore.cred) {
        // the credentials contains the participant's code
        payload.query = { $limit: 1, code: code };
      }
      this.interviewDesignService
        .find(payload)
        .then((response) => {
          if (typeof done === "function") {
            done();
          }
          this.itwStore.$patch({
            design: response.data[0],
          });
          this.receive = false;
        })
        .catch((err) => {
          if (typeof done === "function") {
            done();
          }
          if (err.name === "NotAuthenticated") {
            this.$router.push("login");
          } else {
            Notify.create({
              message: err.message,
              color: "negative",
            });
          }
        });
    },
    onStepStart(name) {
      console.log(`Start step ${name}`);
    },
  },
});
</script>
