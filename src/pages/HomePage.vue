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
                      <q-item-label class="text-h6">{{
                        itwStore.participant.code
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top>
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
                      />
                    </q-item-section>
                    <q-item-section side top>
                      <q-btn
                        color="dark"
                        @click="onLoad(code)"
                        class="q-mt-md"
                        :disable="!code || code.length < 6"
                        >{{ $t("start") }}</q-btn
                      >
                      <q-btn
                        v-if="itwStore.participant"
                        :label="$t('cancel')"
                        color="secondary"
                        flat
                        no-caps
                        class="q-mt-sm q-mb-sm"
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
          >
            <q-card-section>
              <div class="q-pl-md q-pr-md">
                <div class="text-h6">{{ itwStore.design.label }}</div>
                <div>{{ itwStore.design.description }}</div>
              </div>
            </q-card-section>
            <q-separator :dark="settings.theme.dark"></q-separator>
            <q-card-section>
              <q-list :dark="settings.theme.dark" separator>
                <template v-for="step in itwStore.design.steps" :key="step._id">
                  <q-item :dark="settings.theme.dark" class="q-pt-lg q-pb-lg">
                    <q-item-section>
                      <q-item-label>{{ step.label }}</q-item-label>
                      <q-item-label caption lines="2">{{
                        step.description
                      }}</q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                      <q-item-label caption>5 min ago</q-item-label>
                      <q-icon name="star" color="yellow" />
                      <q-btn
                        :title="$t('main.new_case_report')"
                        :icon-right="
                          $q.lang.rtl ? 'chevron_left' : 'chevron_right'
                        "
                        color="primary"
                        rounded
                        no-caps
                        class="q-mt-sm q-mb-sm"
                        @click="onStepStart(step.name)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-card-section>
          </q-card>
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

export default defineComponent({
  name: "HomePage",
  setup() {
    const auth = useAuthStore();
    const { api } = useFeathers();
    const interviewDesignService = api.service("itwd");
    const itwStore = useInterviewStore();
    return {
      auth,
      settings,
      interviewDesignService,
      code: ref(""),
      receive: ref(false),
      itwStore,
    };
  },
  methods: {
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
