import React from "react";

export function LoadingState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-slate-200">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-500/40 border-t-transparent" />
        <div className="absolute inset-2 rounded-full bg-slate-900/80" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium">Loading your assignments...</p>
        <p className="text-xs text-slate-400">
          Please wait while we fetch the latest deliveries.
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[200px] rounded-2xl border border-rose-500/60 bg-rose-950/60 p-5 text-center text-sm text-rose-100 shadow-lg shadow-rose-900/40">
      {message}
    </div>
  );
}

export function EmptyAssignmentsState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-slate-800/80 p-4 shadow-inner shadow-slate-950/50">
        <span className="text-2xl">🚚</span>
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-50">
          No active delivery assignments
        </p>
        <p className="mx-auto max-w-sm text-xs text-slate-400">
          When new deliveries are broadcast or assigned to you, they will
          appear here automatically.
        </p>
      </div>
    </div>
  );
}
