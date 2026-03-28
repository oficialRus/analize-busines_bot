import { create } from "zustand";

import type { AnalysisStatus, Location } from "@/types";

export interface DashboardState {
  selectedLocation: Location | null;
  uiStatus: AnalysisStatus;
  setSelectedLocation: (location: Location | null) => void;
  setUiStatus: (status: AnalysisStatus) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedLocation: null,
  uiStatus: "idle",
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setUiStatus: (uiStatus) => set({ uiStatus }),
}));
