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
}

const defaultValue: UserPreferencesContextType = {
  userGender: "unspecified",
  setUserGender: () => {},
};

const STORAGE_KEY = "calme-user-gender";
const ENCRYPTION_KEY = "CALME_USER_PREFS_ENCRYPTION_KEY_32BYTELONG";
const ENCRYPTION_IV_LENGTH = 12;

const UserPreferencesContext =
  createContext<UserPreferencesContextType>(defaultValue);

async function getCryptoKey(): Promise<CryptoKey | null> {
  if (typeof window === "undefined") return null;
  const subtle = window.crypto?.subtle;
  if (subtle === undefined) return null;
  try {
    return await subtle.importKey(
      "raw",
      new TextEncoder().encode(ENCRYPTION_KEY),
      "AES-GCM",
      false,
      ["encrypt", "decrypt"],
    );
  } catch (error) {
    console.warn("Unable to import encryption key", error);
    return null;
  }
}

async function encryptPreferenceValue(
  value: UserGender,
): Promise<string | null> {
  const subtleKey = await getCryptoKey();
  if (subtleKey == null || typeof window === "undefined") {
    return null;
  }
  try {
    const iv = window.crypto.getRandomValues(
      new Uint8Array(ENCRYPTION_IV_LENGTH),
    );
    const encoded = new TextEncoder().encode(value);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      subtleKey,
      encoded,
    );
    const data = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + data.length);
    combined.set(iv);
    combined.set(data, iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.warn("Unable to encrypt gender preference for storage", error);
    return null;
  }
}

async function decryptPreferenceValue(
  value: string | null,
): Promise<UserGender> {
  if (value == null || typeof window === "undefined") {
    return "unspecified";
  }
  const subtleKey = await getCryptoKey();
  if (subtleKey == null) {
    return "unspecified";
  }
  try {
    const combined = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    const iv = combined.slice(0, ENCRYPTION_IV_LENGTH);
    const data = combined.slice(ENCRYPTION_IV_LENGTH);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      subtleKey,
      data,
    );
    const decoded = new TextDecoder().decode(decrypted);
    if (
      decoded === "male" ||
      decoded === "female" ||
      decoded === "unspecified"
    ) {
      return decoded;
    }
  } catch (error) {
    console.warn("Unable to decrypt stored gender preference", error);
  }
  return "unspecified";
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [userGender, setUserGenderState] = useState<UserGender>("unspecified");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    void decryptPreferenceValue(stored).then((value) => {
      setUserGenderState(value);
    });
  }, []);

  const setUserGender = useCallback((value: UserGender) => {
    setUserGenderState(value);
    if (typeof window === "undefined") return;
    void encryptPreferenceValue(value).then((encrypted) => {
      if (encrypted == null) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, encrypted);
      } catch (error) {
        console.warn("Unable to persist gender preference", error);
      }
    });
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
