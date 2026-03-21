// ─── Client-side state management ─────────────────────────────────────────
// Uses React context instead of localStorage (blocked in sandboxed iframes).
// In production, this would be replaced with API calls to a backend.

import { createContext, useContext } from "react";

export interface HouseholdMember {
  id: string;
  name: string;
  relationship: "self" | "spouse" | "child" | "parent" | "other";
  age: number;
  hasDisability: boolean;
  isVeteran: boolean;
  employmentStatus: string;
  monthlyIncome: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  state: string;
  zipCode: string;
  citizenshipStatus: string;
  housingSituation: string;
  householdMembers: HouseholdMember[];
  subscriptionTier: "free" | "basic" | "premium";
  referralCode: string;
  theme: "light" | "dark" | "system";
}

// Screener progress — saved form data for resume functionality
export interface SavedScreenerAnswers {
  step: number;
  form: Record<string, string | boolean>;
  savedAt: number; // timestamp
}

export interface AppState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  theme: "light" | "dark" | "system";
  savedScreenerAnswers: SavedScreenerAnswers | null;
}

export const defaultUser: UserProfile = {
  id: "demo-user-1",
  email: "demo@benefitsscreener.com",
  name: "Demo User",
  state: "",
  zipCode: "",
  citizenshipStatus: "",
  housingSituation: "",
  householdMembers: [{
    id: "self-1",
    name: "You",
    relationship: "self",
    age: 0,
    hasDisability: false,
    isVeteran: false,
    employmentStatus: "",
    monthlyIncome: 0,
  }],
  subscriptionTier: "free",
  referralCode: "BEN-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
  theme: "dark",
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: (action: AppAction) => void;
}>({
  state: { user: null, isLoggedIn: false, theme: "system" },
  dispatch: () => {},
});

export type AppAction =
  | { type: "LOGIN"; payload: UserProfile }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }
  | { type: "ADD_MEMBER"; payload: HouseholdMember }
  | { type: "REMOVE_MEMBER"; payload: string }
  | { type: "UPDATE_MEMBER"; payload: { id: string; data: Partial<HouseholdMember> } }
  | { type: "SAVE_SCREENER_PROGRESS"; payload: SavedScreenerAnswers }
  | { type: "CLEAR_SCREENER_PROGRESS" };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isLoggedIn: true };
    case "LOGOUT":
      return { ...state, user: null, isLoggedIn: false };
    case "UPDATE_PROFILE":
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "ADD_MEMBER":
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          householdMembers: [...state.user.householdMembers, action.payload],
        },
      };
    case "REMOVE_MEMBER":
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          householdMembers: state.user.householdMembers.filter(m => m.id !== action.payload),
        },
      };
    case "UPDATE_MEMBER":
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          householdMembers: state.user.householdMembers.map(m =>
            m.id === action.payload.id ? { ...m, ...action.payload.data } : m
          ),
        },
      };
    case "SAVE_SCREENER_PROGRESS":
      return { ...state, savedScreenerAnswers: action.payload };
    case "CLEAR_SCREENER_PROGRESS":
      return { ...state, savedScreenerAnswers: null };
    default:
      return state;
  }
}

export function useAppState() {
  return useContext(AppContext);
}
