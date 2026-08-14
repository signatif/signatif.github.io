<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

type TimeAnchor = 'fresh' | 'grace' | 'stale';
type Label = 'certified' | 'verified' | 'attested' | 'rejected';

const hard = reactive({ signature: true, scope: true, revocation: true });
const dims = reactive({ person: true, time: true, location: false });
const soft = reactive({
  transparency: true,
  multiLog: true,
  timeAnchor: 'fresh' as TimeAnchor,
  roots: 2 as 0 | 1 | 2,
});
const policy = ref<'strict' | 'standard'>('standard');

const dimensionList = computed(() =>
  ['authority', dims.person && 'person', dims.time && 'time', dims.location && 'location'].filter(
    Boolean,
  ) as string[],
);
const dimensionCount = computed(() => dimensionList.value.length);

const hardFail = computed(() => !hard.signature || !hard.scope || !hard.revocation);
const fullCoverage = computed(
  () => soft.transparency && soft.multiLog && soft.roots >= 2 && dimensionCount.value >= 4,
);

const label = computed<Label>(() => {
  if (hardFail.value) return 'rejected';
  if (soft.timeAnchor === 'stale') return 'rejected';
  if (soft.timeAnchor === 'grace') return 'verified';
  if (!fullCoverage.value) return 'attested';
  return 'certified';
});

const accepted = computed(
  () => (policy.value === 'strict' ? label.value === 'certified' : label.value !== 'rejected'),
);

const labelNote: Record<Label, string> = {
  certified: 'Full dimensional coverage, transparency and multi-root inclusion.',
  verified: 'Within the grace window — accepted at a downgraded label.',
  attested: 'Coverage incomplete. Downgraded by the classification policy.',
  rejected: 'A hard check failed, or the time attestation is outside the window.',
};

const dotColor: Record<Label, string> = {
  certified: 'bg-verify-700',
  verified: 'bg-azure-600',
  attested: 'bg-ink-3',
  rejected: 'bg-seal-600',
};

const chipColor: Record<Label, string> = {
  certified: 'border-verify-100 bg-verify-100/60 text-verify-700',
  verified: 'border-azure-100 bg-azure-50 text-azure-700',
  attested: 'border-rule bg-paper text-ink-2',
  rejected: 'border-seal-100 bg-seal-100/60 text-seal-600',
};

const report = computed(() => [
  { k: 'signature_valid', ok: hard.signature, v: hard.signature ? 'true' : 'false' },
  { k: 'scope_narrowing', ok: hard.scope, v: hard.scope ? 'monotonic' : 'widened' },
  { k: 'revocation_status', ok: hard.revocation, v: hard.revocation ? 'clear' : 'revoked' },
  { k: 'dimensions', ok: dimensionCount.value >= 2, v: dimensionList.value.join(' · ') },
  { k: 'dimension_count', ok: dimensionCount.value >= 2, v: String(dimensionCount.value) },
  { k: 'transparency', ok: soft.transparency, v: soft.transparency ? 'included' : 'missing' },
  { k: 'time_anchor', ok: soft.timeAnchor !== 'stale', v: soft.timeAnchor },
  { k: 'independent_roots', ok: soft.roots >= 2, v: String(soft.roots) },
  { k: 'multi_log_quorum', ok: soft.multiLog, v: soft.multiLog ? 'met' : 'unmet' },
]);
</script>

<template>
  <div class="shadow-panel grid overflow-hidden rounded-lg border border-rule bg-panel lg:grid-cols-2">
    <!-- control panel -->
    <div class="p-6 md:p-8">
      <p class="label-mono text-seal-600">Hard checks — failure rejects</p>
      <div class="mt-4 space-y-3">
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="hard.signature" type="checkbox" class="size-4 accent-azure-600" />
          Signature valid
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="hard.scope" type="checkbox" class="size-4 accent-azure-600" />
          Scope narrowing holds
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="hard.revocation" type="checkbox" class="size-4 accent-azure-600" />
          Revocation clear
        </label>
      </div>

      <p class="label-mono mt-8 text-azure-600">Dimension co-signatures</p>
      <p class="mt-2 text-xs leading-relaxed text-ink-3">Authority always attests via the chain; add dimensions as co-signatures on the same payload.</p>
      <div class="mt-3 space-y-3">
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="dims.person" type="checkbox" class="size-4 accent-azure-600" />
          Person — certified operator
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="dims.time" type="checkbox" class="size-4 accent-azure-600" />
          Time — independent time authority
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="dims.location" type="checkbox" class="size-4 accent-azure-600" />
          Location — attestation tree
        </label>
      </div>

      <p class="label-mono mt-8 text-azure-600">Soft checks — coverage accumulates</p>
      <div class="mt-4 space-y-3">
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="soft.transparency" type="checkbox" class="size-4 accent-azure-600" />
          Transparency inclusion
        </label>
        <label class="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input v-model="soft.multiLog" type="checkbox" class="size-4 accent-azure-600" />
          Multi-log quorum met
        </label>
        <div>
          <span class="text-sm text-ink">Time anchor</span>
          <div class="mt-2 flex w-fit divide-x divide-rule border border-rule">
            <button
              v-for="t in ['fresh', 'grace', 'stale'] as const"
              :key="t"
              type="button"
              class="px-3.5 py-1.5 font-mono text-xs transition-colors"
              :class="soft.timeAnchor === t
                ? 'bg-azure-700 text-white'
                : 'text-ink-3 hover:text-ink'"
              @click="soft.timeAnchor = t"
            >
              {{ t }}
            </button>
          </div>
        </div>
        <div>
          <span class="text-sm text-ink">Independent roots</span>
          <div class="mt-2 flex w-fit divide-x divide-rule border border-rule">
            <button
              v-for="r in [0, 1, 2] as const"
              :key="r"
              type="button"
              class="px-4 py-1.5 font-mono text-xs transition-colors"
              :class="soft.roots === r
                ? 'bg-azure-700 text-white'
                : 'text-ink-3 hover:text-ink'"
              @click="soft.roots = r"
            >
              {{ r }}
            </button>
          </div>
        </div>
      </div>

      <p class="label-mono mt-8 text-ink-3">Verifier acceptance policy</p>
      <div class="mt-3 flex w-fit divide-x divide-rule border border-rule">
        <button
          v-for="p in ['standard', 'strict'] as const"
          :key="p"
          type="button"
          class="px-3.5 py-1.5 font-mono text-xs transition-colors"
          :class="policy === p
            ? 'bg-ink text-white'
            : 'text-ink-3 hover:text-ink'"
          @click="policy = p"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- readout -->
    <div class="border-t border-rule-faint bg-paper/60 p-6 md:p-8 lg:border-t-0 lg:border-l lg:border-rule-faint">
      <p class="label-mono text-ink-3">Coverage report</p>
      <dl class="mt-3">
        <div
          v-for="row in report"
          :key="row.k"
          class="flex items-baseline justify-between gap-4 border-b border-rule-faint py-2 font-mono text-[13px]"
        >
          <dt class="text-ink-3">{{ row.k }}</dt>
          <dd class="flex items-center gap-2 text-right text-ink">
            <span v-if="row.ok" class="text-verify-700">✓</span>
            <span v-else class="text-seal-600">✗</span>
            <span>{{ row.v }}</span>
          </dd>
        </div>
      </dl>

      <div class="mt-6 flex items-center justify-between gap-4">
        <span class="label-mono text-ink-3">Classification</span>
        <span
          class="flex items-center gap-2 border px-2.5 py-1 font-mono text-xs font-medium text-ink"
          :class="chipColor[label]"
        >
          <span class="size-1.5 rounded-full" :class="dotColor[label]"></span>
          {{ label }}
        </span>
      </div>
      <p class="mt-2 text-sm text-ink-2">{{ labelNote[label] }}</p>

      <div class="mt-8 flex items-center justify-between gap-4 border-t-2 border-rule pt-5">
        <p class="font-mono text-xs text-ink-3">
          acceptance policy: {{ policy }}
        </p>
        <p
          :key="String(accepted) + label"
          class="animate-thump expanded text-xl font-bold uppercase tracking-wide"
          :class="accepted
            ? 'text-verify-700'
            : 'text-seal-600'"
        >
          {{ accepted ? 'accept' : 'reject' }}
        </p>
      </div>
    </div>
  </div>
</template>
