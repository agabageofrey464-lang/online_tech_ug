"use client";

import { useEffect } from "react";

/** Stores a ?ref=CODE from the URL so it can be attached at checkout. */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) localStorage.setItem("otu_ref", ref.trim().toUpperCase());
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
