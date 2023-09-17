<template>
  <q-layout v-if="itwStore.isAuthenticated" view="lHh Lpr lFf">
    <q-header elevated :class="settings.theme.header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> {{ $t("main.brand") }} </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn-dropdown
            v-show="hasLocales"
            flat
            :label="getLocaleLabel(locale)"
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
        </div>
      </q-toolbar>
      <q-toolbar
        v-if="itwStore.pending"
        class="bg-warning text-black q-pt-sm q-pb-sm"
        style="min-height: 20px"
      >
        <div>{{ $t("main.pending_save") }}</div>
        <q-btn flat dense no-caps class="q-ml-lg" @click="onSaveNow">{{
          $t("main.save_now")
        }}</q-btn>
      </q-toolbar>
      <q-toolbar
        v-if="itwStore.completed"
        class="bg-info q-pt-sm q-pb-sm"
        style="min-height: 20px"
      >
        <div>{{ $t("main.interview_completed") }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :class="settings.theme.drawer"
    >
      <q-list>
        <q-item-label header>
          <q-chip
            v-if="authStore.isAuthenticated"
            color="secondary"
            text-color="white"
            class="q-ma-none"
            >{{ itwStore.user?.email }}</q-chip
          >
          <q-chip
            v-else
            color="secondary"
            text-color="white"
            class="q-ma-none"
            >{{ itwStore?.participant?.code }}</q-chip
          >
        </q-item-label>

        <q-item clickable @click="onLogout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("main.logout") }}</q-item-label>
          </q-item-section>
        </q-item>

        <EssentialLink
          v-for="link in settings.links"
          :key="link.title"
          v-bind="link"
        />
        <q-item class="fixed-bottom text-caption">
          <div>
            {{ $t("main.powered_by") }}
            <a
              class="text-weight-bold"
              href="https://www.obiba.org/pages/products/amber"
              target="_blank"
              >OBiBa Amber</a
            >
          </div>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container :class="settings.theme.page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { locales } from "../boot/i18n";
import { settings } from "../boot/settings";

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const authStore = useAuthStore();
    const itwStore = useInterviewStore();
    const leftDrawerOpen = ref(false);
    const { locale } = useI18n({ useScope: "global" });

    return {
      locale,
      settings,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      interviewsCount: 0,
      authStore,
      itwStore,
    };
  },
  mounted() {
    if (!this.itwStore.isAuthenticated) {
      this.onLogout();
    } else if (!this.itwStore.user) {
      this.authStore.reAuthenticate().then((response) => {
        this.itwStore.setUser(response.user);
      });
    }
  },
  computed: {
    localeOptions() {
      let allLocales = [...locales];
      if (this.itwStore.design && this.itwStore.design.i18n) {
        allLocales.push(Object.keys(this.itwStore.design.i18n));
        allLocales = allLocales.flat();
      }
      allLocales = allLocales.filter(
        (value, index, array) => array.indexOf(value) === index
      );
      return allLocales
        .map((loc) => {
          return {
            value: loc,
            label: this.getLocaleLabel(loc),
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
  },
  methods: {
    getLocaleLabel(loc) {
      const key = `locales.${loc}`;
      let label = this.$t(key);
      if (label === key) {
        label = loc.toUpperCase();
      }
      return label;
    },
    onLocaleSelection(opt) {
      this.locale = opt.value;
      this.$q.lang.set(opt.value);
      this.$i18n.locale = opt.value;
    },
    onLogout() {
      // TODO make sure no save is pending
      this.itwStore.reset(true);
      if (this.authStore.isAuthenticated) {
        this.authStore.logout().then(() => {
          this.$router.push("login");
        });
      } else {
        this.$router.push("login");
      }
    },
    onSaveNow() {
      this.itwStore.savePendingRecords();
    },
  },
});
</script>
