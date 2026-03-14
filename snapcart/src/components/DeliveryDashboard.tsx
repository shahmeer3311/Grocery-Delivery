"use client";
import axios from "axios";
import React, { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DeliveryActiveOrderSection from "./delivery/DeliveryActiveOrderSection";
import DeliveryAssignmentList from "./delivery/DeliveryAssignmentList";
import DeliveryDashboardHeader from "./delivery/DeliveryDashboardHeader";
import {
  EmptyAssignmentsState,
  ErrorState,
  LoadingState,
} from "./delivery/DeliveryDashboardStates";
import DeliveryEarningsChart, {
  DeliveryChartPoint,
  DeliveryEarningSummary,
} from "./delivery/DeliveryEarningsChart";
import DeliveryOtpModal from "./delivery/DeliveryOtpModal";

type DeliveryDashboardProps = {
  earning?: DeliveryEarningSummary;
  chartData?: DeliveryChartPoint[];
  completedToday?: number;
};

const DeliveryDashboard = ({
  earning = { today: 0, sevenDays: 0, total: 0 },
  chartData = [],
  completedToday = 0,
}: DeliveryDashboardProps) => {
  // Immediate log - fires on every render
  console.log("[DELIVERY_DASHBOARD] ========== CLIENT COMPONENT RENDERING ==========");
  console.log("[DELIVERY_DASHBOARD] Props received:", { earning, chartDataLength: chartData.length, completedToday });
  
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [currentAssignment, setCurrentAssignment] = React.useState<any | null>(
    null,
  );
  const [activeOrder, setActiveOrder] = React.useState<any | null>(null);
  const [location, setLocation] = React.useState<[number, number] | null>(null); // delivery boy live location
  const [deliveryLocation, setDeliveryLocation] = React.useState<
    [number, number] | null
  >(null); // alias for live location if needed
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showOtpBox, setShowOtpBox] = React.useState<boolean>(false);
  const [otp, setOtp] = React.useState<string>("");
  const [otpDigits, setOtpDigits] = React.useState<string[]>(
    Array(6).fill(""),
  );
  const [otpLoading, setOtpLoading] = React.useState<boolean>(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const otpInputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  const { userData } = useSelector((state: RootState) => state.user);

  const currentAssignmentRef = React.useRef<any | null>(null);

  useEffect(() => {
    if (!userData?._id) {
      console.log(
        "[DeliveryDashboard] Skipping deliveryLocation watcher, no userId yet",
      );
      return;
    }
    if (!navigator.geolocation) {
      console.log(
        "[DeliveryDashboard] Geolocation is not supported by this browser.",
      );
      return;
    }
    console.log(
      "[DeliveryDashboard] Starting deliveryLocation watcher for user:",
      userData._id,
    );
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("[DeliveryDashboard] deliveryLocation update:", {
          latitude,
          longitude,
        });
        setDeliveryLocation([latitude, longitude]);
        const socket = getSocket();
        console.log("[DeliveryDashboard] Emitting locationUpdate over socket", {
          userId: userData._id,
          location: [longitude, latitude],
        });
        socket.emit("locationUpdate", {
          userId: userData._id,
          location: [longitude, latitude],
        });
      },
      (err) => {
        console.error(
          "[DeliveryDashboard] deliveryLocation watcher error:",
          err,
          "code:",
          err?.code,
          "message:",
          err?.message,
        );
        if (err.code === 1) {
          console.warn(
            "[DeliveryDashboard] Permission denied for deliveryLocation watcher.",
          );
        } else if (err.code === 2) {
          console.warn(
            "[DeliveryDashboard] Position unavailable for deliveryLocation watcher (Chrome may not have OS location access).",
          );
        } else if (err.code === 3) {
          console.warn(
            "[DeliveryDashboard] Location request timed out while sending updates. This can happen with weak GPS/Wi‑Fi.",
          );
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
    console.log("[DeliveryDashboard] deliveryLocation watcher id:", watcher);
    return () => {
      console.log(
        "[DeliveryDashboard] Clearing deliveryLocation watcher",
        watcher,
      );
      navigator.geolocation.clearWatch(watcher);
    };
  }, [userData?._id]);

  React.useEffect(() => {
    currentAssignmentRef.current = currentAssignment;
  }, [currentAssignment]);

  const fetchAssignments = async () => {
      console.log("[DELIVERY_DASHBOARD] fetchAssignments() called");
      try {
        setLoading(true);
        setError(null);
        // First, check if there is a current active order/assignment
        console.log("[DELIVERY_DASHBOARD] Fetching /api/delivery/current-order...");
        const currentRes = await axios.get("/api/delivery/current-order");
        console.log("[DELIVERY_DASHBOARD] current-order response:", currentRes.data);
        const activeAssignment = currentRes.data?.assignment || null;
        const activeOrderData = currentRes.data?.order || null;
        setCurrentAssignment(activeAssignment);
        setActiveOrder(activeOrderData);

        // If there is no active assignment, load broadcasted assignments
        if (!activeAssignment) {
          console.log("[DELIVERY_DASHBOARD] No active assignment, fetching get-assignments...");
          const result = await axios.get("/api/delivery/get-assignments");
          console.log("[DELIVERY_DASHBOARD] get-assignments response:", result.data);
          setAssignments(result.data.assignments || []);
        } else {
          setAssignments([]);
        }
      } catch (err: any) {
        console.error("[DELIVERY_DASHBOARD] Failed to fetch assignments:", err);
        setError("Failed to load assignments. Please try again.");
      } finally {
        console.log("[DELIVERY_DASHBOARD] fetchAssignments() complete, setting loading=false");
        setLoading(false);
      }
    };

  useEffect(() => {
    console.log("[DELIVERY_DASHBOARD] Initial useEffect - calling fetchAssignments");
    fetchAssignments();
  }, []);

  console.log("Current Assignment:", currentAssignment);

  // Extract user's saved delivery address coordinates from the active order (customer/home location)
  const userAddressLocation: [number, number] | null = React.useMemo(() => {
    const lat = activeOrder?.address?.latitude;
    const lng = activeOrder?.address?.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      return [lat, lng];
    }
    return null;
  }, [activeOrder]);

  // Track the delivery boy's current location
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.log(
        "[DeliveryDashboard] navigator or geolocation not available for tracking watcher",
      );
      return;
    }

    console.log(
      "[DeliveryDashboard] Starting tracking watcher for current device location",
    );
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("[DeliveryDashboard] tracking watcher update:", {
          latitude,
          longitude,
        });
        setLocation([latitude, longitude]);
      },
      (err) => {
        console.error(
          "[DeliveryDashboard] tracking watcher error:",
          err,
          "code:",
          err?.code,
          "message:",
          err?.message,
        );
        if (err.code === 1) {
          console.warn(
            "[DeliveryDashboard] Permission denied for tracking watcher.",
          );
        } else if (err.code === 2) {
          console.warn(
            "[DeliveryDashboard] Position unavailable for tracking watcher (Chrome may not have OS location access).",
          );
        } else if (err.code === 3) {
          console.warn(
            "[DeliveryDashboard] Location request timed out while tracking position. This can happen with weak GPS/Wi‑Fi.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 30000,
      },
    );

    return () => {
      console.log("[DeliveryDashboard] Clearing tracking watcher", watcher);
      navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handler = (deliveryAssignment: any) => {
      setAssignments((prev) => {
        // If there is already a current active assignment, ignore
        if (currentAssignmentRef.current) {
          return prev;
        }
        return [...prev, deliveryAssignment];
      });
    };

    socket.on("new-delivery-assignment", handler);
    return () => {
      socket.off("new-delivery-assignment", handler);
    };
  }, []);

  const sendOtp = async () => {
    try {
      setOtpError(null);
      const res = await axios.post("/api/delivery/otp/send", {
        orderId: activeOrder._id,
      });
      if (res.status === 200) {
        setShowOtpBox(true);
      }
    } catch (error) {
      console.error("Failed to send OTP", error);
      setOtpError("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    try {
      setOtpLoading(true);
      setOtpError(null);
      const res = await axios.post("/api/delivery/otp/verify", {
        orderId: activeOrder._id,
        otp,
      });

      if (res.status === 200) {
        setActiveOrder((prev: any) =>
          prev ? { ...prev, deliveryOtpVerified: true, status: "completed" } : prev,
        );
        closeOtpBox();
      }
    } catch (error: any) {
      console.error("Failed to verify OTP", error);
      const message =
        error?.response?.data?.message || "Invalid or expired OTP. Please try again.";
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      const joined = next.join("");
      setOtp(joined);
      return next;
    });

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;

    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i += 1) {
      next[i] = text[i];
    }
    setOtpDigits(next);
    setOtp(text);

    const targetIndex = Math.min(text.length, 5);
    otpInputsRef.current[targetIndex]?.focus();
  };

  const closeOtpBox = () => {
    setShowOtpBox(false);
    setOtp("");
    setOtpDigits(Array(6).fill(""));
    setOtpError(null);
  };

  const hasActiveOrder = Boolean(currentAssignment && activeOrder);
  const hasPendingAssignments = assignments.length > 0;
  // Show earnings when no active order (assignments can still be shown alongside)
  const showEarningsChart = !loading && !error && !hasActiveOrder;
  const showAssignmentList = !loading && !error && !hasActiveOrder && hasPendingAssignments;
  const currentView = loading
    ? "loading"
    : error
      ? "error"
      : hasActiveOrder
        ? "active-order"
        : hasPendingAssignments
          ? "earnings-with-assignments"
          : "earnings-only";

  console.warn("[DeliveryDashboard] Rendering view ->", currentView, {
    loading,
    error,
    hasActiveOrder,
    hasPendingAssignments,
    assignmentsCount: assignments.length,
    hasCurrentAssignment: Boolean(currentAssignment),
    hasActiveOrderData: Boolean(activeOrder),
    showEarningsChart,
    showAssignmentList,
  });

  useEffect(() => {
    console.log("[DeliveryDashboard] Render decision:", {
      currentView,
      loading,
      error,
      hasActiveOrder,
      hasPendingAssignments,
      assignmentsCount: assignments.length,
      hasCurrentAssignment: Boolean(currentAssignment),
      hasActiveOrderData: Boolean(activeOrder),
      showEarningsChart,
      showAssignmentList,
    });
  }, [
    currentView,
    loading,
    error,
    hasActiveOrder,
    hasPendingAssignments,
    assignments.length,
    currentAssignment,
    activeOrder,
    showEarningsChart,
    showAssignmentList,
  ]);

  return (
    <div className="min-h-screen w-full px-4 py-10 bg-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 relative mt-24">
        {/* ALWAYS VISIBLE - Debug header */}

        <DeliveryDashboardHeader
          activeCount={currentAssignment ? 1 : assignments.length}
        />

        {/* Earnings chart - shown when no active order */}
        {showEarningsChart && (
          <DeliveryEarningsChart
            earning={earning}
            chartData={chartData}
            completedToday={completedToday}
          />
        )}

        <main className="rounded-3xl bg-black p-5 sm:p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
          {loading && <LoadingState />}

          {!loading && error && <ErrorState message={error} />}

          {/* Active order section - shown when delivering */}
          {!loading && !error && hasActiveOrder && (
            <DeliveryActiveOrderSection
              activeOrder={activeOrder}
              userAddressLocation={userAddressLocation}
              location={location}
              deliveryLocation={deliveryLocation}
              userId={userData?._id?.toString() || ""}
              showOtpBox={showOtpBox}
              onSendOtp={sendOtp}
            />
          )}

          {/* Assignments list - shown when there are pending assignments */}
          {showAssignmentList && (
            <DeliveryAssignmentList
              assignments={assignments}
              onAccept={fetchAssignments}
            />
          )}

          {/* Empty state - no active order and no assignments */}
          {showEarningsChart && !hasPendingAssignments && <EmptyAssignmentsState />}
        </main>

        {showOtpBox && (
          <DeliveryOtpModal
            otp={otp}
            otpDigits={otpDigits}
            otpLoading={otpLoading}
            otpError={otpError}
            onClose={closeOtpBox}
            onVerify={verifyOtp}
            onChange={handleOtpChange}
            onKeyDown={handleOtpKeyDown}
            onPaste={handleOtpPaste}
            inputsRef={otpInputsRef}
          />
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
