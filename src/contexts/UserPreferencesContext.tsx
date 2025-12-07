import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type UserGender = "female" | "male" | "unspecified";

interface UserPreferencesContextType {
  userGender: UserGender;
  setUserGender: (gender: UserGender) => void;
}

const defaultValue: UserPreferencesContextType = {
  userGender: "unspecified",
  setUserGender: () => {},
};

const STORAGE_KEY = "calme-user-gender";

const UserPreferencesContext = createContext<UserPreferencesContextType>(defaultValue);

function getStoredPreferenceValue(): UserGender {
  if (typeof window === "undefined") return "unspecified";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.warn("Unable to persist gender preference", error);
  }
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [userGender, setUserGenderState] = useState<UserGender>(() => getStoredPreferenceValue());

  const setUserGender = useCallback((value: UserGender) => {
    setUserGenderState(value);
    setStoredPreferenceValue(value);
  }, []);

  const contextValue = useMemo(
    () => ({
      userGender,
      setUserGender,
    }),
    [setUserGender, userGender],
  );

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}
