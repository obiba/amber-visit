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
                <q-card-section v-show="!withToken">
                  <div class="text-center q-pt-sm">
                    <div class="col text-subtitle">
                      {{ $t("login.user_title") }}
                    </div>
                  </div>
                  <q-form @submit="onSubmit" class="q-gutter-md">
                    <q-input
                      autofocus
                      :dark="settings.theme.dark"
                      :color="settings.theme.dark ? 'white' : 'grey-10'"
                      v-model="email"
                      :label="$t('email')"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="fas fa-envelope" size="xs" />
                      </template>
                    </q-input>

                    <q-input
                      type="password"
                      :dark="settings.theme.dark"
                      :color="settings.theme.dark ? 'white' : 'grey-10'"
                      v-model="password"
                      :label="$t('password')"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="fas fa-lock" size="xs" />
                      </template>
                    </q-input>

                    <div>
                      <q-btn
                        :label="$t('login.submit')"
                        type="submit"
                        color="secondary"
                        :disable="disableSubmit"
                      />
                      <q-btn
                        v-if="settings.register_enabled"
                        :label="$t('login.register')"
                        flat
                        to="/register"
                        stretch
                        class="text-bold q-ml-md"
                      />
                    </div>
                  </q-form>
                </q-card-section>
                <q-card-section v-show="secret">
                  <div class="col text-subtitle">
                    {{ $t("login.totp") }}
                  </div>
                  <div class="text-center q-mt-md">
                    <img :src="qr" />
                  </div>
                  <div class="col text-subtitle q-mt-md">
                    {{ $t("login.totp_secret") }}
                  </div>
                  <q-input
                    :dark="settings.theme.dark"
                    dense
                    :color="settings.theme.dark ? 'white' : 'grey-10'"
                    v-model="secret"
                    readonly
                  >
                    <template v-slot:after>
                      <q-btn
                        round
                        dense
                        flat
                        icon="content_copy"
                        @click="onCopySecret"
                      />
                    </template>
                  </q-input>
                  <div class="col text-subtitle q-mt-md">
                    {{ $t("login.email_otp") }}
                  </div>
                  <div class="q-mt-md">
                    <q-btn
                      :label="$t('login.send_email_token')"
                      @click="onEmailToken"
                      color="info"
                      stretch
                      class="text-bold"
                    />
                  </div>
                </q-card-section>
                <q-card-section v-if="withToken">
                  <q-form @submit="onSubmit" class="q-gutter-md">
                    <q-input
                      autofocus
                      type="number"
                      :dark="settings.theme.dark"
                      :color="settings.theme.dark ? 'white' : 'grey-10'"
                      v-model="token"
                      :label="$t('login.token')"
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
                        color="secondary"
                        :disable="disableValidate"
                      />
                      <q-btn
                        :label="$t('cancel')"
                        @click="onCancelToken"
                        flat
                        stretch
                        class="text-bold q-ml-md"
                      />
                    </div>
                  </q-form>
                </q-card-section>
                <q-card-section v-if="!withToken" class="q-pt-none q-pb-none">
                  <q-btn
                    flat
                    to="/forgot-password"
                    dense
                    no-caps
                    class="text-bold"
                  >
                    {{ $t("login.forgot_password") }}
                  </q-btn>
                </q-card-section>
              </q-card-section>
              <q-card-section v-if="strategy === 'participant'">
                <div class="text-center q-pt-sm">
                  <div class="col text-subtitle">
                    {{ $t("login.participant_title") }}
                  </div>
                </div>
                <q-form
                  @submit="onSubmit"
                  class="q-gutter-md"
                  autocomplete="off"
                >
                  <div v-if="!withPassword">
                    <q-input
                      autofocus
                      autocomplete="new-password"
                      :dark="settings.theme.dark"
                      :color="settings.theme.dark ? 'white' : 'grey-10'"
                      v-model="code"
                      :label="$t('login.code')"
                      mask="XXXXXX"
                    >
                      <template v-slot:prepend>
                        <q-icon name="fas fa-mobile" size="xs" />
                      </template>
                    </q-input>
                  </div>
                  <div v-else class="q-mb-xl">
                    <q-input
                      :autofocus="withPassword"
                      type="password"
                      autocomplete="new-password"
                      :dark="settings.theme.dark"
                      :color="settings.theme.dark ? 'white' : 'grey-10'"
                      v-model="password"
                      :label="$t('login.participant_password')"
                      :hint="$t('login.participant_password_hint')"
                    >
                      <template v-slot:prepend>
                        <q-icon name="fas fa-key" size="xs" />
                      </template>
                    </q-input>
                  </div>
                  <div>
                    <q-btn
                      :label="$t('login.enter')"
                      type="submit"
                      color="secondary"
                      :disable="disableEnter"
                    />
                  </div>
                </q-form>
              </q-card-section>
              <q-card-section>
                <q-btn
                  v-if="strategy === 'participant'"
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
                  @click="toStrategy('participant')"
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
import { defineComponent, ref } from "vue";
import AppBanner from "src/components/AppBanner.vue";
import { locales } from "../boot/i18n";
import { settings } from "../boot/settings";
import { Notify, copyToClipboard } from "quasar";
import { useCookies } from "vue3-cookies";

export default defineComponent({
  name: "LoginPage",
  components: {
    AppBanner,
  },
  setup() {
    const authStore = useAuthStore();
    const { api } = useFeathers();
    const interviewDesignService = api.service("itwd");
    const itwStore = useInterviewStore();
    const { locale } = useI18n({ useScope: "global" });
    const { cookies } = useCookies();

    return {
      cookies,
      locale,
      settings,
      authStore,
      interviewDesignService,
      itwStore,
      email: ref(""),
      token: ref(""),
      secret: ref(""),
      password: ref(""),
      qr: ref(""),
      withToken: ref(false),
      method: ref(""),
      strategy: ref("participant"),
      code: ref(""),
      withPassword: ref(false),
    };
  },
  mounted() {
    if (this.authStore.isAuthenticated) {
      this.authStore.logout();
    }
    if (this.$route.query.code) {
      this.code = this.$route.query.code;
      this.strategy = "participant";
      this.onSubmit();
    }
  },
  computed: {
    localeOptions() {
      return locales
        .map((loc) => {
          return {
            value: loc,
            label: this.$t("locales." + loc),
          };
        })
        .sort((loc1, loc2) => {
          if (loc1.label > loc2.label) return 1;
          if (loc1.label < loc2.label) return -1;
          return 0;
        });
    },
    hasLocales() {
      return locales.length > 1;
    },
    disableEnter() {
      return (
        this.code.length !== 6 ||
        (this.withPassword && this.password.length < 8)
      );
    },
    disableSubmit() {
      return this.email.length === 0 || this.password.length === 0;
    },
    disableValidate() {
      return this.token.length < 6;
    },
  },
  methods: {
    onLocaleSelection(opt) {
      this.locale = opt.value;
      this.cookies.set("locale", opt.value);
    },
    toStrategy(strategy) {
      this.strategy = strategy;
      this.withPassword = false;
      this.withToken = false;
      this.code = "";
      this.password = "";
      this.email = "";
      this.secret = "";
      this.token = "";
    },
    makePayload() {
      const payload = {
        strategy: "local",
      };
      payload.email = this.email;
      payload.password = this.password;
      if (this.method) {
        payload.method = this.method;
      }
      if (this.token) {
        payload.token = this.token;
      }
      if (!this.method && this.secret) {
        payload.secret = this.secret;
      }
      return payload;
    },
    onCopySecret() {
      copyToClipboard(this.secret).then(() => {
        Notify.create({
          message: this.$t("login.secret_copied"),
          color: "positive",
        });
      });
    },
    onEmailToken() {
      this.method = "otp";
      this.onSubmit();
    },
    onCancelToken() {
      this.withToken = false;
      this.token = "";
      this.password = "";
      this.secret = "";
      this.method = "otp";
    },
    onCancelPassword() {
      this.withPassword = false;
    },
    onSubmit() {
      if (this.strategy === "local") {
        const payload = this.makePayload();
        this.authStore.clearError();
        this.authStore
          .authenticate(payload)
          .then((response) => {
            if (response.data && response.data.qr && response.data.secret) {
              // 2FA is enabled for that user
              this.qr = response.data.qr;
              this.secret = response.data.secret;
              this.withToken = true;
            } else {
              this.itwStore.setUser(response.user);
              this.redirect();
            }
          })
          .catch((err) => {
            const type = err.className;
            if (
              type === "bad-request" &&
              err.message.startsWith("Token required")
            ) {
              this.withToken = true;
            } else if (
              type === "bad-request" &&
              err.message.startsWith("Invalid token")
            ) {
              Notify.create({
                message: this.$t("login.failed_token"),
                color: "negative",
              });
              this.token = "";
            } else {
              Notify.create({
                message: this.$t("login.failed"),
                color: "negative",
              });
            }
          });
      } else {
        const credentials = btoa(
          this.withPassword ? `${this.code}:${this.password}` : this.code
        );
        this.itwStore
          .initByParticipant(
            this.code,
            this.withPassword ? this.password : undefined
          )
          .then(() => {
            this.redirect();
          })
          .catch((err) => {
            const type = err.className;
            if (
              type === "not-authenticated" &&
              err.message.startsWith("A participant password is required")
            ) {
              this.withPassword = true;
            } else if (type === "bad-request") {
              Notify.create({
                message: this.$t(err.message),
                color: "negative",
              });
            } else {
              console.error(err);
              Notify.create({
                message: this.$t("login.participant_failed"),
                color: "negative",
              });
            }
          });
      }
    },
    redirect() {
      const redirectTo = this.authStore.loginRedirect || "..";
      this.authStore.loginRedirect = null;
      this.$router.push(redirectTo);
    },
  },
});
</script>
