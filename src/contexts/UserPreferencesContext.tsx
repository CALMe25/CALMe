import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserGender = "female" | "male" | "unspecified";

interface UserPreferencesContextType {
  userGender: UserGender;
  setUserGender: (gender: UserGender) => void;
  dyslexicMode: boolean;
  setDyslexicMode: (enabled: boolean) => void;
}

const GENDER_KEY = "calme-user-gender";
const DYSLEXIC_KEY = "calme-dyslexic-mode";

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

function getStoredPreferenceValue(): UserGender {
  if (typeof window === "undefined") return "unspecified";
  try {
    const stored = window.localStorage.getItem(GENDER_KEY);
    if (stored === "male" || stored === "female" || stored === "unspecified") {
      return stored;
    }
  } catch (error) {
    console.warn("Unable to read stored gender preference", error);
  }
  return "unspecified";
}

function setStoredPreferenceValue(value: UserGender): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GENDER_KEY, value);
  } catch (error) {
    console.warn("Unable to persist gender preference", error);
  }
}

function getStoredDyslexicMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DYSLEXIC_KEY) === "true";
  } catch {
    return false;
  }
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [userGender, setUserGenderState] = useState<UserGender>(() => getStoredPreferenceValue());
  const [dyslexicMode, setDyslexicModeState] = useState<boolean>(() => getStoredDyslexicMode());

  const setUserGender = useCallback((value: UserGender) => {
    setUserGenderState(value);
    setStoredPreferenceValue(value);
  }, []);

  const setDyslexicMode = useCallback((enabled: boolean) => {
    setDyslexicModeState(enabled);
    try {
      window.localStorage.setItem(DYSLEXIC_KEY, String(enabled));
    } catch {
      // ignore
    }
  }, []);

  // Apply/remove the dyslexic class on <html>
  useEffect(() => {
    if (dyslexicMode) {
      document.documentElement.classList.add("dyslexic");
    } else {
      document.documentElement.classList.remove("dyslexic");
    }
  }, [dyslexicMode]);

  const contextValue = useMemo(
    () => ({
      userGender,
      setUserGender,
      dyslexicMode,
      setDyslexicMode,
    }),
    [setUserGender, userGender, dyslexicMode, setDyslexicMode],
  );

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}
