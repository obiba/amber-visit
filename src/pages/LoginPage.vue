<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center" :class="settings.theme.front.bg">
        <div
          class="column"
          :style="
            $q.screen.lt.sm
              ? { width: '80%' }
              : $q.screen.lt.md
              ? { width: '50%' }
              : { width: '30%' }
          "
        >
          <div class="col">
            <app-banner />
          </div>
          <div class="col">
            <q-card :class="settings.theme.front.card">
              <q-card-section v-if="strategy === 'local'">
                <div class="text-center q-pt-sm">
                  <div class="col text-subtitle">
                    {{ $t("login.user_title") }}
                  </div>
                </div>
              </q-card-section>
              <q-card-section v-if="strategy === 'api-key'">
                <div class="text-center q-pt-sm">
                  <div class="col text-subtitle">
                    {{ $t("login.participant_title") }}
                  </div>
                </div>
                <q-form @submit="onSubmit" class="q-gutter-md">
                  <q-input
                    dark
                    color="white"
                    v-model="code"
                    :label="$t('login.code')"
                    lazy-rules
                    class="no-spinner"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fas fa-mobile" size="xs" />
                    </template>
                  </q-input>
                  <div>
                    <q-btn
                      :label="$t('login.validate')"
                      type="submit"
                      color="dark"
                      :disable="disableValidate"
                    />
                    <q-btn
                      :label="$t('cancel')"
                      @click="onCancelCode"
                      flat
                      stretch
                      class="text-bold q-ml-md"
                    />
                  </div>
                </q-form>
              </q-card-section>
              <q-card-section>
                <q-btn
                  v-if="strategy === 'api-key'"
                  flat
                  dense
                  no-caps
                  class="text-bold"
                  @click="toStrategy('local')"
                >
                  {{ $t("login.as_user") }}
                </q-btn>
                <q-btn
                  v-if="strategy === 'local'"
                  flat
                  dense
                  no-caps
                  class="text-bold"
                  @click="toStrategy('api-key')"
                >
                  {{ $t("login.as_participant") }}
                </q-btn>
                <q-btn-dropdown
                  v-show="hasLocales"
                  flat
                  :label="$t('locales.' + locale)"
                  class="float-right"
                >
                  <q-list>
                    <q-item
                      clickable
                      v-close-popup
                      @click="onLocaleSelection(localeOpt)"
                      v-for="localeOpt in localeOptions"
                      :key="localeOpt.value"
                    >
                      <q-item-section>
                        <q-item-label>{{ localeOpt.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section avatar v-if="locale === localeOpt.value">
                        <q-icon color="primary" name="check" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useI18n } from "vue-i18n";
import { defineComponent, ref } from "vue";
import AppBanner from "src/components/AppBanner.vue";
import { locales } from "../boot/i18n";
import { settings } from "../boot/settings";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "LoginPage",
  components: {
    AppBanner,
  },
  setup() {
    const { api } = useFeathers();
    const User = api.service("user");
    const authStore = useAuthStore();

    const $q = useQuasar();
    const { locale } = useI18n({ useScope: "global" });

    return {
      locale,
      settings,
      authStore,
      code: ref(""),
      email: ref(""),
      token: ref(""),
      secret: ref(""),
      password: ref(""),
      strategy: ref("api-key"),
    };
  },
  watch: {
    code() {
      this.code = this.code.toUpperCase();
    },
  },
  computed: {
    localeOptions() {
      return locales.map((loc) => {
        return {
          value: loc,
          label: this.$t("locales." + loc),
        };
      });
    },
    hasLocales() {
      return locales.length > 1;
    },
    disableValidate() {
      return this.code.length !== 6;
    },
  },
  methods: {
    onLocaleSelection(opt) {
      this.locale = opt.value;
    },
    toStrategy(strategy) {
      this.strategy = strategy;
    },
    makePayload() {
      const payload = {
        strategy: this.strategy,
      };
      if (this.strategy === "local") {
        payload.email = this.email;
        payload.password = this.password;
        if (this.token && this.token.length > 0) {
          payload.token = this.token;
        }
        if (this.secret && this.secret.length > 0) {
          payload.secret = this.secret;
        }
      } else {
        payload.code = this.code;
      }
      return payload;
    },
    onSubmit() {
      const payload = this.makePayload();
      this.authStore.clearError();
      this.authStore.authenticate(payload);
    },
    onCancelCode() {
      this.code = "";
    },
  },
});
</script>
