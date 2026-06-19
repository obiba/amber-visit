<template>
  <q-layout v-if="itwStore.isAuthenticated" v-cloak view="hHh lpR fFf">
    <q-header elevated class="print-hide" :class="settings.theme.header">
      <q-toolbar>
        <q-toolbar-title>
          {{ tr(step.label) }}
        </q-toolbar-title>
        <q-toolbar-title>
          <q-btn v-if="
            step.schema.description ||
            step.schema.copyright ||
            step.schema.license
          " size="12px" flat dense round icon="info" class="text-subtitle2 float-right" @click="onShowFormDescription">
          </q-btn>
        </q-toolbar-title>
      </q-toolbar>
      <q-toolbar v-if="hasIdLabel()" class="bg-secondary q-pt-sm q-pb-sm" style="min-height: 20px">
        <div>{{ idLabel }}: {{ formData._id }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="bg-grey-2">
        <div v-if="isMulti()">
          <q-linear-progress :value="progress" animation-speed="100" size="xl" />
        </div>
        <div class="q-pa-md">
          <div class="row">
            <div v-if="!$q.screen.lt.sm" class="col-md-3 col-sm-2 text-center">
              <q-icon v-if="canPrevious()" :name="$q.lang.rtl ? 'arrow_forward' : 'arrow_back'" size="xl"
                color="secondary" class="print-hide fixed q-mt-xl bg-warning q-pa-md cursor-pointer"
                style="border-radius: 50%; margin-left: -50px" @click="previousStep" />
            </div>
            <div class="col-md-6 col-sm-8 col-xs-12 q-mt-sm q-mb-sm">
              <div>
                <BlitzForm ref="form" :key="remountCounter" :schema="schema" v-model="formData" :columnCount="1"
                  :show-errors-on="errorMode" :lang="lang" gridGap="32px" />
              </div>
              <div v-if="isMulti()" style="height: 200px" v-touch-swipe.mouse="handleSwipe"></div>
              <!-- <div class="bg-black text-white q-mt-lg q-pa-md">
                <pre>{{ JSON.stringify(formData, null, "  ") }}</pre>
              </div> -->
            </div>
            <div v-if="!$q.screen.lt.sm" class="col-md-3 col-sm-2 text-center">
              <q-icon v-if="canNext()" :name="$q.lang.rtl ? 'arrow_back' : 'arrow_forward'" size="xl" color="secondary"
                class="print-hide fixed q-mt-xl bg-warning q-pa-md cursor-pointer"
                style="border-radius: 50%; margin-left: -25px" @click="nextStep" />
              <q-icon v-else name="cloud_upload" size="xl" color="white"
                class="print-hide fixed q-mt-xl bg-primary q-pa-md cursor-pointer"
                style="border-radius: 50%; margin-left: -25px" @click="onComplete" />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <q-footer elevated class="print-hide" :class="settings.theme.footer">
      <q-toolbar>
        <q-separator dark vertical v-if="mode === 'single' && toc.length > 1" />
        <q-btn-dropdown v-if="mode === 'single' && toc.length > 1" stretch flat icon="toc"
          :label="$q.screen.lt.sm ? '' : $t('go_to')">
          <q-list>
            <q-item-label v-for="entry in toc" :key="entry.id" header clickable v-close-popup
              @click="onScroll(entry.id)">
              {{ entry.label }}
            </q-item-label>
          </q-list>
        </q-btn-dropdown>
        <q-space />

        <q-separator dark vertical v-if="isMulti()" />
        <q-btn v-if="isMulti() && canPrevious()" stretch flat :icon="$q.lang.rtl ? 'chevron_right' : 'chevron_left'"
          @click="previousStep" :label="$t('previous')" />
        <q-separator dark vertical v-if="isMulti()" />
        <q-btn v-if="isMulti() && canNext()" stretch flat :icon="$q.lang.rtl ? 'chevron_left' : 'chevron_right'"
          @click="nextStep" :label="$t('next')" />
        <q-separator dark vertical v-if="mode === 'single'" />
        <q-btn v-if="mode === 'single' || isFinalStep" stretch flat class="bg-primary" :title="$t('validate_save')"
          :label="$t('save')" icon="cloud_upload" @click="onComplete" />
        <q-separator dark vertical />
        <q-btn stretch flat :label="$q.screen.lt.sm ? '' : $t('pause')" icon="pause" @click="onPause" />
      </q-toolbar>
    </q-footer>

    <q-dialog v-model="showFormDescription">
      <q-card style="min-width: 300px">
        <q-card-section v-if="step.schema.label">
          <div class="text-h6">
            {{ tr(step.schema.label) }}
          </div>
        </q-card-section>
        <q-card-section v-if="step.schema.description">
          <div v-html="md(tr(step.schema.description))" />
        </q-card-section>
        <q-card-section>
          <div v-if="step.schema.copyright" v-html="'&#169; ' + md(tr(step.schema.copyright))" />
          <div v-if="caseReportLicense" class="q-mt-sm" v-html="md($t(caseReportLicense))" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { makeBlitzarQuasarSchemaForm, makeSchemaFormTr, getBlitzarErrors } from '@obiba/quasar-ui-amber'
import { Notify, scroll } from 'quasar'
import { BlitzForm, validateFormPerSchema } from '@blitzar/form'
import { settings as _settings } from '../boot/settings'

const { getScrollTarget, setVerticalScrollPosition } = scroll

const settings = _settings as Record<string, any>
const authStore = useAuthStore()
const itwStore = useInterviewStore()
const { locale, t } = useI18n({ useScope: 'global' })
const router = useRouter()
const route = useRoute()

const form = ref()
const errorsRemain = ref(false)
const errors = ref<any[]>([])
const debug = ref(false)
const remountCounter = ref(0)
const progress = ref(0)
const formData = ref<Record<string, any>>({})
const schema = ref<any[]>([])
const step = ref<any>({ schema: { items: [] } })
const showFormDescription = ref(false)
const mode = ref('multi')
const errorMode = ref('interaction')
const lang = ref<Record<string, string>>({})

const stepName = computed(() => route.params.name as string)
const caseReportLicense = computed(() => step.value.schema?.license as string | undefined)

const toc = computed(() => {
  const result: { id: string; label: string }[] = []
  if (step.value.schema?.items) {
    step.value.schema.items
      .filter((item: any) => ['group', 'section'].includes(item.type))
      .forEach((item: any) =>
        result.push({ id: item.name.replaceAll('.', '_').toLowerCase(), label: tr(item.label) })
      )
  }
  return result.filter((entry) => entry.label)
})

const idLabel = computed(() => (step.value.schema.idLabel ? tr(step.value.schema.idLabel) : 'ID'))

const isFinalStep = computed(
  () => isMulti() && formData.value.__page === step.value.schema.items.length - 1
)

const modeOptions = computed(() => [
  { value: 'single', label: t('single_page') },
  { value: 'multi', label: t('multi_steps') },
])

watch(mode, (newValue) => {
  updateFormData()
  schema.value = makeBlitzarQuasarSchemaForm(step.value.schema, {
    locale: locale.value,
    ...(newValue !== 'single' ? { stepId: '__page' } : {}),
    debug: debug.value,
  })
  updateProgress()
  remountCounter.value++
})

onMounted(() => {
  if (!itwStore.isAuthenticated) {
    onLogout()
    return
  }
  step.value = itwStore.getStepDesign(stepName.value)
  if (step.value) {
    if (step.value.schema.layout) mode.value = step.value.schema.layout
    schema.value = makeBlitzarQuasarSchemaForm(step.value.schema, {
      locale: locale.value,
      stepId: '__page',
      debug: debug.value,
    })
    lang.value = { requiredField: t('required_field') }
    const record = itwStore.record
    const initForm = () => {
      formData.value = itwStore.record.data
      updateProgress()
      remountCounter.value++
    }
    if (!record || record.id !== stepName.value || !record.data) {
      itwStore.setupRecord(stepName.value).then(() => initForm())
    } else {
      initForm()
    }
  } else {
    console.error('No such interview step with id: ' + stepName.value)
    router.push('..')
  }
})

function tr(key: string) {
  let rval = makeSchemaFormTr(step.value.schema, { locale: locale.value })(key)
  if (rval === key) {
    rval = makeSchemaFormTr(itwStore.design, { locale: locale.value })(key)
  }
  return rval
}

function md(text: string | undefined) {
  return text ? (marked.parse(tr(text), { headerIds: false, mangle: false }) as string) : text
}

function hasIdLabel() {
  return step.value.schema.idLabel
}

function onShowFormDescription() {
  showFormDescription.value = true
}

function onScroll(id: string) {
  const ele = document.getElementById(id)
  if (ele) {
    setVerticalScrollPosition(getScrollTarget(ele), ele.offsetTop, 200)
  }
}

function updateProgress() {
  progress.value = formData.value.__page / (step.value.schema.items.length - 1)
}

function isMulti() {
  return mode.value === 'multi'
}

function handleSwipe({ ...newInfo }: any) {
  if (!isMulti()) return
  if (newInfo.direction === 'up' || newInfo.direction === 'left') nextStep()
  else if (newInfo.direction === 'down' || newInfo.direction === 'right') previousStep()
}

function formatErrorMessages() {
  const msgs: string[] = []
  for (let i = 0; i < Math.min(errors.value.length, 3); i++) {
    const err = errors.value[i]
    if (err.message === 'Field is required') err.message = t('required_field')
    err.message = err.message.charAt(0).toLowerCase() + err.message.slice(1)
    msgs.push(`<li>${err.label}: ${err.message}</li>`)
  }
  if (errors.value.length > 3) {
    msgs.push(`<li>${t('validations.more_errors', { count: errors.value.length - 3 })}</li>`)
  }
  return `<ul>${msgs.join('')}</ul>`
}

function canPrevious() {
  return isMulti() && formData.value.__page > 0
}

function canNext() {
  return isMulti() && formData.value.__page < step.value.schema.items.length - 1
}

function toggleMode(value: string) {
  mode.value = value
}

function updateFormData() {
  itwStore.updateRecord(stepName.value, formData.value)
}

function mergeStepData(payload: { data: Record<string, any> }) {
  const record = itwStore.record
  for (const key in payload.data) record.data[key] = payload.data[key]
  itwStore.updateRecord(stepName.value, record.data)
  itwStore.intermediateRecord()
}

function onValidate() {
  errorMode.value = 'always'
  errors.value = getBlitzarErrors(schema.value, validateFormPerSchema(formData.value, schema.value))
  errorsRemain.value = errors.value.length > 0
}

function previousStep() {
  if (!canPrevious()) return
  updateFormData()
  mergeStepData({ data: { __page: formData.value.__page - 1 } })
  updateProgress()
  remountCounter.value++
  errorsRemain.value = false
  errors.value = []
  window.scrollTo(0, 0)
}

function nextStep() {
  if (!canNext()) return
  updateFormData()
  onValidate()
  if (errorsRemain.value) {
    Notify.create({ message: t('validation_errors', { errors: formatErrorMessages() }), html: true, color: 'negative' })
  } else {
    errorMode.value = 'interaction'
    mergeStepData({ data: { __page: formData.value.__page + 1 } })
    updateProgress()
    remountCounter.value++
    window.scrollTo(0, 0)
  }
}

function onComplete() {
  updateFormData()
  onValidate()
  if (errorsRemain.value) {
    Notify.create({ message: t('validation_errors', { errors: formatErrorMessages() }), html: true, color: 'negative' })
  } else {
    itwStore.completeRecord().then(() => router.push('..'))
  }
}

function onPause() {
  updateFormData()
  itwStore.pauseRecord().then(() => router.push('..'))
}

function onLogout() {
  itwStore.reset(true)
  if (authStore.isAuthenticated) {
    authStore.logout().then(() => router.push('../login'))
  } else {
    router.push('../login')
  }
}
</script>
