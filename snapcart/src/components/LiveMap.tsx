"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { LiveMapProps } from "./LiveMapClient";

const LiveMap = dynamic(() => import("./LiveMapClient"), {
  ssr: false,
}) as React.ComponentType<LiveMapProps>;

export default LiveMap;