import React from "react";

type DeliveryOtpModalProps = {
  otp: string;
  otpDigits: string[];
  otpLoading: boolean;
  otpError: string | null;
  onClose: () => void;
  onVerify: () => void;
  onChange: (index: number, value: string) => void;
  onKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  inputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
};

const DeliveryOtpModal = ({
  otp,
  otpDigits,
  otpLoading,
  otpError,
  onClose,
  onVerify,
  onChange,
  onKeyDown,
  onPaste,
  inputsRef,
}: DeliveryOtpModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-lg leading-none text-slate-500 hover:text-slate-700"
        >
          ×
        </button>

        <h2 className="mb-1 text-center text-lg font-semibold text-slate-900">
          Enter Delivery OTP
        </h2>
        <p className="mb-5 text-center text-xs text-slate-500">
          Ask the customer for the 6-digit code to complete this delivery.
        </p>

        {otpError && (
          <p className="mb-3 text-center text-xs text-rose-500">{otpError}</p>
        )}

        <div className="mb-6 mt-3 flex justify-center gap-2">
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={index === 0 ? onPaste : undefined}
              className="h-12 w-10 rounded-lg border border-emerald-500/70 bg-white text-center text-lg font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ))}
        </div>

        <button
          type="button"
          disabled={otp.length !== 6 || otpLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onVerify}
        >
          {otpLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          )}
          <span>Verify OTP</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryOtpModal;
