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

const report = computed(() => [
  { k: 'signature_valid', ok: hard.signature, v: hard.signature ? 'true' : 'false' },
  { k: 'scope_narrowing', ok: hard.scope, v: hard.scope ? 'monotonic' : 'widened' },
  { k: 'revocation_status', ok: hard.revocation, v: hard.revocation ? 'clear' : 'revoked' },
  { k: 'transparency', ok: soft.transparency, v: soft.transparency ? 'included' : 'missing' },
  { k: 'time_anchor', ok: soft.timeAnchor !== 'stale', v: soft.timeAnchor },
  { k: 'independent_roots', ok: soft.roots >= 2, v: String(soft.roots) },
  { k: 'multi_log_quorum', ok: soft.multiLog, v: soft.multiLog ? 'met' : 'unmet' },
]);

const labelClass: Record<Label, string> = {
  certified: 'border-brass-500/60 bg-brass-500/10 text-brass-600 dark:text-brass-400',
  verified: 'border-ink-500/40 bg-ink-500/10 text-ink-600 dark:text-parchment-100',
  attested: 'border-ink-500/40 bg-ink-500/10 text-ink-600 dark:text-parchment-100',
  rejected: 'border-seal-500/60 bg-seal-500/10 text-seal-600 dark:text-seal-400',
};
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <!-- controls -->
    <div class="rounded-xl border border-ink-900/15 bg-parchment-50 p-6 dark:border-parchment-100/15 dark:bg-ink-900">
      <fieldset>
        <legend class="font-mono text-[11px] uppercase tracking-[0.2em] text-seal-600 dark:text-seal-400">
          Hard checks — failure rejects
        </legend>
        <div class="mt-4 space-y-3">
          <label class="flex cursor-pointer items-center justify-between gap-4 text-sm">
            <span>Signature valid</span>
            <button
              type="button"
              role="switch"
              :aria-checked="hard.signature"
              class="relative h-5 w-9 rounded-full transition-colors"
              :class="hard.signature ? 'bg-seal-600 dark:bg-seal-500' : 'bg-ink-900/20 dark:bg-parchment-100/25'"
              @click="hard.signature = !hard.signature"
            >
              <span
                class="absolute top-0.5 size-4 rounded-full bg-parchment-50 transition-all dark:bg-ink-950"
                :class="hard.signature ? 'left-[1.125rem]' : 'left-0.5'"
              ></span>
            </button>
          </label>
          <label class="flex cursor-pointer items-center justify-between gap-4 text-sm">
            <span>Scope narrowing holds</span>
            <button
              type="button"
              role="switch"
              :aria-checked="hard.scope"
              class="relative h-5 w-9 rounded-full transition-colors"
              :class="hard.scope ? 'bg-seal-600 dark:bg-seal-500' : 'bg-ink-900/20 dark:bg-parchment-100/25'"
              @click="hard.scope = !hard.scope"
            >
              <span
                class="absolute top-0.5 size-4 rounded-full bg-parchment-50 transition-all dark:bg-ink-950"
                :class="hard.scope ? 'left-[1.125rem]' : 'left-0.5'"
              ></span>
            </button>
          </label>
          <label class="flex cursor-pointer items-center justify-between gap-4 text-sm">
            <span>Revocation clear</span>
            <button
              type="button"
              role="switch"
              :aria-checked="hard.revocation"
              class="relative h-5 w-9 rounded-full transition-colors"
              :class="hard.revocation ? 'bg-seal-600 dark:bg-seal-500' : 'bg-ink-900/20 dark:bg-parchment-100/25'"
              @click="hard.revocation = !hard.revocation"
            >
              <span
                class="absolute top-0.5 size-4 rounded-full bg-parchment-50 transition-all dark:bg-ink-950"
                :class="hard.revocation ? 'left-[1.125rem]' : 'left-0.5'"
              ></span>
            </button>
          </label>
        </div>
      </fieldset>

      <fieldset class="mt-8">
        <legend class="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 dark:text-parchment-300">
          Soft checks — coverage accumulates
        </legend>
        <div class="mt-4 space-y-3">
          <label class="flex cursor-pointer items-center justify-between gap-4 text-sm">
            <span>Transparency inclusion</span>
            <button
              type="button"
              role="switch"
              :aria-checked="soft.transparency"
              class="relative h-5 w-9 rounded-full transition-colors"
              :class="soft.transparency ? 'bg-seal-600 dark:bg-seal-500' : 'bg-ink-900/20 dark:bg-parchment-100/25'"
              @click="soft.transparency = !soft.transparency"
            >
              <span
                class="absolute top-0.5 size-4 rounded-full bg-parchment-50 transition-all dark:bg-ink-950"
                :class="soft.transparency ? 'left-[1.125rem]' : 'left-0.5'"
              ></span>
            </button>
          </label>
          <label class="flex cursor-pointer items-center justify-between gap-4 text-sm">
            <span>Multi-log quorum met</span>
            <button
              type="button"
              role="switch"
              :aria-checked="soft.multiLog"
              class="relative h-5 w-9 rounded-full transition-colors"
              :class="soft.multiLog ? 'bg-seal-600 dark:bg-seal-500' : 'bg-ink-900/20 dark:bg-parchment-100/25'"
              @click="soft.multiLog = !soft.multiLog"
            >
              <span
                class="absolute top-0.5 size-4 rounded-full bg-parchment-50 transition-all dark:bg-ink-950"
                :class="soft.multiLog ? 'left-[1.125rem]' : 'left-0.5'"
              ></span>
            </button>
          </label>
          <div class="text-sm">
            <span class="block">Time anchor</span>
            <div class="mt-2 grid grid-cols-3 rounded-lg border border-ink-900/15 p-0.5 dark:border-parchment-100/20">
              <button
                v-for="t in ['fresh', 'grace', 'stale'] as const"
                :key="t"
                type="button"
                class="rounded-md py-1.5 font-mono text-xs transition-colors"
                :class="soft.timeAnchor === t
                  ? 'bg-seal-600 text-parchment-50 dark:bg-seal-500'
                  : 'text-ink-500 hover:text-ink-800 dark:text-parchment-300 dark:hover:text-parchment-100'"
                @click="soft.timeAnchor = t"
              >
                {{ t }}
              </button>
            </div>
          </div>
          <div class="text-sm">
            <span class="block">Independent roots</span>
            <div class="mt-2 grid grid-cols-3 rounded-lg border border-ink-900/15 p-0.5 dark:border-parchment-100/20">
              <button
                v-for="r in [0, 1, 2] as const"
                :key="r"
                type="button"
                class="rounded-md py-1.5 font-mono text-xs transition-colors"
                :class="soft.roots === r
                  ? 'bg-seal-600 text-parchment-50 dark:bg-seal-500'
                  : 'text-ink-500 hover:text-ink-800 dark:text-parchment-300 dark:hover:text-parchment-100'"
                @click="soft.roots = r"
              >
                {{ r }}
              </button>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="mt-8">
        <legend class="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 dark:text-parchment-300">
          Verifier acceptance policy
        </legend>
        <div class="mt-3 grid grid-cols-2 rounded-lg border border-ink-900/15 p-0.5 dark:border-parchment-100/20">
          <button
            v-for="p in ['standard', 'strict'] as const"
            :key="p"
            type="button"
            class="rounded-md py-1.5 font-mono text-xs transition-colors"
            :class="policy === p
              ? 'bg-ink-900 text-parchment-50 dark:bg-parchment-100 dark:text-ink-900'
              : 'text-ink-500 hover:text-ink-800 dark:text-parchment-300 dark:hover:text-parchment-100'"
            @click="policy = p"
          >
            {{ p }}
          </button>
        </div>
      </fieldset>
    </div>

    <!-- output -->
    <div class="flex flex-col gap-6">
      <div class="rounded-xl border border-ink-900/15 bg-ink-950 p-6 text-parchment-100 dark:border-parchment-100/15 dark:bg-ink-900">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-parchment-300">Coverage report</span>
          <span class="flex items-center gap-1.5 font-mono text-[11px] text-parchment-300">
            <span class="size-1.5 rounded-full" :class="hardFail ? 'bg-seal-400' : 'bg-brass-400'"></span>
            deterministic
          </span>
        </div>
        <dl class="mt-4 space-y-2 font-mono text-xs">
          <div v-for="row in report" :key="row.k" class="flex justify-between gap-4">
            <dt class="text-parchment-300">{{ row.k }}</dt>
            <dd class="flex items-center gap-1.5">
              <span v-if="row.ok" class="text-brass-400">✓</span>
              <span v-else class="text-seal-400">✗</span>
              <span>{{ row.v }}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div class="relative flex-1 rounded-xl border border-ink-900/15 bg-parchment-50 p-6 dark:border-parchment-100/15 dark:bg-ink-900">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 dark:text-parchment-300">Classification label</span>
          <span
            class="rounded-sm border px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-wider transition-colors"
            :class="labelClass[label]"
          >
            {{ label }}
          </span>
        </div>
        <p class="mt-3 text-sm text-ink-500 dark:text-parchment-300">{{ labelNote[label] }}</p>

        <div class="mt-6 flex items-center justify-between gap-4 border-t border-dashed border-ink-900/15 pt-5 dark:border-parchment-100/15">
          <p class="font-mono text-[11px] leading-relaxed text-ink-400 dark:text-parchment-300">
            acceptance policy: {{ policy }}<br />
            decision:
            <span :class="accepted ? 'text-brass-600 dark:text-brass-400' : 'text-seal-600 dark:text-seal-400'">
              {{ accepted ? 'accept' : 'reject' }}
            </span>
          </p>
          <div
            class="animate-stamp select-none border-4 px-5 py-1.5 font-display text-2xl font-semibold uppercase tracking-widest"
            :class="accepted
              ? 'border-brass-600/80 text-brass-600 dark:border-brass-400/80 dark:text-brass-400'
              : 'border-seal-600/80 text-seal-600 dark:border-seal-400/80 dark:text-seal-400'"
          >
            {{ accepted ? 'accept' : 'reject' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
