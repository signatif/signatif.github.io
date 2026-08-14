<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

type TimeAnchor = 'fresh' | 'grace' | 'stale';
type Label = 'certified' | 'verified' | 'attested' | 'rejected';

const hard = reactive({ signature: true, scope: true, revocation: true });
const soft = reactive({
  transparency: true,
  multiLog: true,
  timeAnchor: 'fresh' as TimeAnchor,
  roots: 2 as 0 | 1 | 2,
});
const policy = ref<'strict' | 'standard'>('standard');

const hardFail = computed(() => !hard.signature || !hard.scope || !hard.revocation);

const label = computed<Label>(() => {
  if (hardFail.value) return 'rejected';
  if (soft.timeAnchor === 'stale') return 'rejected';
  if (soft.timeAnchor === 'grace') return 'verified';
  if (!soft.transparency || soft.roots < 2 || !soft.multiLog) return 'attested';
  return 'certified';
});

const accepted = computed(
  () => (policy.value === 'strict' ? label.value === 'certified' : label.value !== 'rejected'),
);

const labelNote: Record<Label, string> = {
  certified: 'Full dimensional coverage, transparency and multi-root inclusion.',
  verified: 'Within the grace window — accepted at a downgraded label.',
  attested: 'Soft-check coverage incomplete. Downgraded by the classification policy.',
  rejected: 'A hard check failed, or the time attestation is outside the window.',
};

const dotColor: Record<Label, string> = {
  certified: 'bg-emerald-600',
  verified: 'bg-amber-500',
  attested: 'bg-ink-400',
  rejected: 'bg-seal-600',
};

const report = computed(() => [
  { k: 'signature_valid', ok: hard.signature, v: hard.signature ? 'true' : 'false' },
  { k: 'scope_narrowing', ok: hard.scope, v: hard.scope ? 'monotonic' : 'widened' },
  { k: 'revocation_status', ok: hard.revocation, v: hard.revocation ? 'clear' : 'revoked' },
  { k: 'transparency', ok: soft.transparency, v: soft.transparency ? 'included' : 'missing' },
  { k: 'time_anchor', ok: soft.timeAnchor !== 'stale', v: soft.timeAnchor },
  { k: 'independent_roots', ok: soft.roots >= 2, v: String(soft.roots) },
  { k: 'multi_log_quorum', ok: soft.multiLog, v: soft.multiLog ? 'met' : 'unmet' },
]);
</script>

<template>
  <div class="grid border border-ink-300 dark:border-ink-700 lg:grid-cols-2 lg:divide-x lg:divide-ink-300 dark:lg:divide-ink-700">
    <!-- controls -->
    <div class="p-6 md:p-8">
      <p class="text-xs font-medium uppercase tracking-wider text-ink-400 dark:text-ink-500">
        Hard checks — failure rejects
      </p>
      <div class="mt-4 space-y-3">
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink-800 dark:text-ink-100">
          <input v-model="hard.signature" type="checkbox" class="size-4 accent-seal-600" />
          Signature valid
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink-800 dark:text-ink-100">
          <input v-model="hard.scope" type="checkbox" class="size-4 accent-seal-600" />
          Scope narrowing holds
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink-800 dark:text-ink-100">
          <input v-model="hard.revocation" type="checkbox" class="size-4 accent-seal-600" />
          Revocation clear
        </label>
      </div>

      <p class="mt-8 text-xs font-medium uppercase tracking-wider text-ink-400 dark:text-ink-500">
        Soft checks — coverage accumulates
      </p>
      <div class="mt-4 space-y-3">
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink-800 dark:text-ink-100">
          <input v-model="soft.transparency" type="checkbox" class="size-4 accent-seal-600" />
          Transparency inclusion
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink-800 dark:text-ink-100">
          <input v-model="soft.multiLog" type="checkbox" class="size-4 accent-seal-600" />
          Multi-log quorum met
        </label>
        <div>
          <span class="text-sm text-ink-800 dark:text-ink-100">Time anchor</span>
          <div class="mt-2 flex divide-x divide-ink-300 border border-ink-300 dark:divide-ink-700 dark:border-ink-700" style="width: fit-content">
            <button
              v-for="t in ['fresh', 'grace', 'stale'] as const"
              :key="t"
              type="button"
              class="px-3.5 py-1.5 font-mono text-xs transition-colors"
              :class="soft.timeAnchor === t
                ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
                : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'"
              @click="soft.timeAnchor = t"
            >
              {{ t }}
            </button>
          </div>
        </div>
        <div>
          <span class="text-sm text-ink-800 dark:text-ink-100">Independent roots</span>
          <div class="mt-2 flex divide-x divide-ink-300 border border-ink-300 dark:divide-ink-700 dark:border-ink-700" style="width: fit-content">
            <button
              v-for="r in [0, 1, 2] as const"
              :key="r"
              type="button"
              class="px-4 py-1.5 font-mono text-xs transition-colors"
              :class="soft.roots === r
                ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
                : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'"
              @click="soft.roots = r"
            >
              {{ r }}
            </button>
          </div>
        </div>
      </div>

      <p class="mt-8 text-xs font-medium uppercase tracking-wider text-ink-400 dark:text-ink-500">
        Verifier acceptance policy
      </p>
      <div class="mt-3 flex divide-x divide-ink-300 border border-ink-300 dark:divide-ink-700 dark:border-ink-700" style="width: fit-content">
        <button
          v-for="p in ['standard', 'strict'] as const"
          :key="p"
          type="button"
          class="px-3.5 py-1.5 font-mono text-xs transition-colors"
          :class="policy === p
            ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
            : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'"
          @click="policy = p"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- output -->
    <div class="flex flex-col border-t border-ink-300 p-6 dark:border-ink-700 md:p-8 lg:border-t-0">
      <p class="text-xs font-medium uppercase tracking-wider text-ink-400 dark:text-ink-500">Coverage report</p>
      <dl class="mt-3">
        <div
          v-for="row in report"
          :key="row.k"
          class="flex items-baseline justify-between gap-4 border-b border-ink-100 py-2 font-mono text-[13px] dark:border-ink-800"
        >
          <dt class="text-ink-500 dark:text-ink-400">{{ row.k }}</dt>
          <dd class="flex items-center gap-2 text-ink-800 dark:text-ink-100">
            <span v-if="row.ok" class="text-emerald-600">✓</span>
            <span v-else class="text-seal-600 dark:text-seal-400">✗</span>
            <span>{{ row.v }}</span>
          </dd>
        </div>
      </dl>

      <div class="mt-6 flex items-center justify-between gap-4">
        <span class="text-xs font-medium uppercase tracking-wider text-ink-400 dark:text-ink-500">Classification</span>
        <span class="flex items-center gap-2 border border-ink-300 px-2.5 py-1 font-mono text-xs font-medium text-ink-800 dark:border-ink-700 dark:text-ink-100">
          <span class="size-2 rounded-full" :class="dotColor[label]"></span>
          {{ label }}
        </span>
      </div>
      <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">{{ labelNote[label] }}</p>

      <div class="mt-auto flex items-center justify-between gap-4 border-t border-ink-200 pt-5 dark:border-ink-800 lg:mt-8">
        <p class="font-mono text-xs text-ink-500 dark:text-ink-400">
          acceptance policy: {{ policy }}
        </p>
        <p
          class="font-mono text-lg font-semibold uppercase tracking-wide"
          :class="accepted
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-seal-600 dark:text-seal-400'"
        >
          {{ accepted ? 'accept' : 'reject' }}
        </p>
      </div>
    </div>
  </div>
</template>
