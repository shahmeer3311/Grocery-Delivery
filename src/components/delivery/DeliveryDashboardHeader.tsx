import React from "react";

type DeliveryDashboardHeaderProps = {
  activeCount: number;
};

const DeliveryDashboardHeader = ({
  activeCount,
}: DeliveryDashboardHeaderProps) => {
  return (
    <header className="rounded-3xl border bg-white px-6 py-5 shadow-lg shadow-emerald-500/10 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Live Deliveries
          </p>
          <h1 className="text-2xl font-bold text-green-500 sm:text-3xl">
            Delivery Dashboard
          </h1>
          <p className="mt-1 text-sm text-green-400">
            Track your current delivery and pick up new assignments in real
            time.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 px-4 py-3 shadow-inner">
          <div className="flex items-center gap-3 text-right">
            <span className="text-[11px] uppercase tracking-wide text-green-400">
              Active assignments
            </span>
            <span className="text-2xl font-semibold text-emerald-500">
              {activeCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DeliveryDashboardHeader;
