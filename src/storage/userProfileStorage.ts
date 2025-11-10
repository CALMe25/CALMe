// User Profile Storage using IndexedDB for PWA persistence
// Supports future multi-profile capability

export interface UserProfile {
  id: string;
  name: string;
  safeSpaceType: "miklat" | "mamad" | "stairway" | "other";
  safeSpaceLocation: string;
  timeToReachSafety: number; // in seconds
  backupLocation?: string;
  accessibilityNeeds: string[];
  calmingPreferences: string[];
  emergencyContacts?: string[];
  language: "en" | "he" | "ar";
  createdAt: Date;
  lastUpdated: Date;
  isActive: boolean; // For future multi-profile support
  onboardingCompleted: boolean;
}

export interface ConversationState {
  currentNodeId: string;
  conversationHistory: string[];
  attemptedActivities: string[];
  userVariables: Record<string, string | number | boolean>;
  lastActivity: Date;
}

interface ActivityHistoryEntry {
  id?: number;
  profileId: string;
  activityName: string;
  completed: boolean;
  timestamp: Date;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isUserVariablesRecord = (
  value: unknown,
): value is ConversationState["userVariables"] =>
  isRecord(value) &&
  Object.values(value).every((entry) => {
    const valueType = typeof entry;
    return (
      valueType === "string" ||
      valueType === "number" ||
      valueType === "boolean"
    );
  });

const isUserProfileRecord = (value: unknown): value is UserProfile => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.safeSpaceType === "string" &&
    typeof value.safeSpaceLocation === "string" &&
    typeof value.timeToReachSafety === "number" &&
    typeof value.language === "string" &&
    value.createdAt instanceof Date &&
    value.lastUpdated instanceof Date &&
    typeof value.isActive === "boolean" &&
    typeof value.onboardingCompleted === "boolean" &&
    isStringArray(value.accessibilityNeeds) &&
    isStringArray(value.calmingPreferences) &&
    (value.backupLocation == null ||
      typeof value.backupLocation === "string") &&
    (value.emergencyContacts == null || isStringArray(value.emergencyContacts))
  );
};

const isConversationStateRecord = (
  value: unknown,
): value is ConversationState => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.currentNodeId === "string" &&
    isStringArray(value.conversationHistory) &&
    isStringArray(value.attemptedActivities) &&
    isUserVariablesRecord(value.userVariables) &&
    value.lastActivity instanceof Date
  );
};

const isActivityHistoryEntryRecord = (
  value: unknown,
): value is ActivityHistoryEntry => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.profileId === "string" &&
    typeof value.activityName === "string" &&
    typeof value.completed === "boolean" &&
    value.timestamp instanceof Date &&
    (value.id == null || typeof value.id === "number")
  );
};

class UserProfileStorage {
  private dbName = "CALMeUserData";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const target = event.target;
        if (target == null || !(target instanceof IDBOpenDBRequest)) {
          return;
        }
        const db = target.result;

        // User profiles store
        if (!db.objectStoreNames.contains("profiles")) {
          const profileStore = db.createObjectStore("profiles", {
            keyPath: "id",
          });
          profileStore.createIndex("isActive", "isActive", { unique: false });
          profileStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Conversation state store
        if (!db.objectStoreNames.contains("conversationState")) {
          db.createObjectStore("conversationState", { keyPath: "id" });
        }

        // Activity history store
        if (!db.objectStoreNames.contains("activityHistory")) {
          const activityStore = db.createObjectStore("activityHistory", {
            keyPath: "id",
            autoIncrement: true,
          });
          activityStore.createIndex("profileId", "profileId", {
            unique: false,
          });
          activityStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
        }
      };
    });
  }

  // Profile management
  async saveProfile(profile: UserProfile): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["profiles"], "readwrite");
    const store = transaction.objectStore("profiles");

    // Ensure only one active profile (for now)
    if (profile.isActive) {
      await this.deactivateAllProfiles();
    }

    return new Promise((resolve, reject) => {
      const request = store.put(profile);
      request.onsuccess = () => {
        console.log("Profile saved successfully:", profile.id);
        resolve();
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  async getActiveProfile(): Promise<UserProfile | null> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["profiles"], "readonly");
    const store = transaction.objectStore("profiles");
    const index = store.index("isActive");

    return new Promise((resolve, reject) => {
      const request = index.get(IDBKeyRange.only(true));
      request.onsuccess = () => {
        const profile: unknown = request.result;
        if (isUserProfileRecord(profile)) {
          console.log("Active profile retrieved:", profile.id);
          resolve(profile);
          return;
        }
        resolve(null);
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["profiles"], "readonly");
    const store = transaction.objectStore("profiles");

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  private async deactivateAllProfiles(): Promise<void> {
    const profiles = await this.getAllProfiles();
    for (const profile of profiles) {
      profile.isActive = false;
      await this.saveProfile(profile);
    }
  }

  // Conversation state management
  async saveConversationState(state: ConversationState): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(
      ["conversationState"],
      "readwrite",
    );
    const store = transaction.objectStore("conversationState");

    return new Promise((resolve, reject) => {
      const request = store.put({ ...state, id: "current" });
      request.onsuccess = () => {
        console.log("Conversation state saved");
        resolve();
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  async getConversationState(): Promise<ConversationState | null> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["conversationState"], "readonly");
    const store = transaction.objectStore("conversationState");

    return new Promise((resolve, reject) => {
      const request = store.get("current");
      request.onsuccess = () => {
        const state: unknown = request.result;
        if (isConversationStateRecord(state)) {
          resolve(state);
          return;
        }
        resolve(null);
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  // Activity tracking
  async recordActivity(
    profileId: string,
    activityName: string,
    completed: boolean,
  ): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["activityHistory"], "readwrite");
    const store = transaction.objectStore("activityHistory");

    return new Promise((resolve, reject) => {
      const request = store.add({
        profileId,
        activityName,
        completed,
        timestamp: new Date(),
      });
      request.onsuccess = () => {
        console.log(
          `Activity recorded: ${activityName} (completed: ${completed})`,
        );
        resolve();
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  async getRecentActivities(
    profileId: string,
    limit = 10,
  ): Promise<ActivityHistoryEntry[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["activityHistory"], "readonly");
    const store = transaction.objectStore("activityHistory");
    const index = store.index("profileId");

    return new Promise((resolve, reject) => {
      const activities: ActivityHistoryEntry[] = [];
      const request = index.openCursor(IDBKeyRange.only(profileId), "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (
          cursor !== null &&
          cursor !== undefined &&
          activities.length < limit
        ) {
          const entry: unknown = cursor.value;
          if (isActivityHistoryEntryRecord(entry)) {
            activities.push(entry);
          }
          cursor.continue();
        } else {
          resolve(activities);
        }
      };
      request.onerror = () => {
        const errorMessage = request.error?.message ?? "Unknown error";
        reject(new Error(errorMessage));
      };
    });
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(
      ["profiles", "conversationState", "activityHistory"],
      "readwrite",
    );

    const promises = [
      transaction.objectStore("profiles").clear(),
      transaction.objectStore("conversationState").clear(),
      transaction.objectStore("activityHistory").clear(),
    ];

    await Promise.all(promises);
    console.log("All user data cleared");
  }
}

// Singleton instance
export const userProfileStorage = new UserProfileStorage();
