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

class UserProfileStorage {
  private dbName = "CALMeUserData";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

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
        reject(request.error);
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
        const profile = request.result;
        console.log("Active profile retrieved:", profile?.id);
        resolve(profile || null);
      };
      request.onerror = () => {
        reject(request.error);
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
        reject(request.error);
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
        reject(request.error);
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
        resolve(request.result || null);
      };
      request.onerror = () => {
        reject(request.error);
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
        reject(request.error);
      };
    });
  }

  async getRecentActivities(profileId: string, limit = 10): Promise<unknown[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["activityHistory"], "readonly");
    const store = transaction.objectStore("activityHistory");
    const index = store.index("profileId");

    return new Promise((resolve, reject) => {
      const activities: unknown[] = [];
      const request = index.openCursor(IDBKeyRange.only(profileId), "prev");

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && activities.length < limit) {
          activities.push(cursor.value);
          cursor.continue();
        } else {
          resolve(activities);
        }
      };
      request.onerror = () => {
        reject(request.error);
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
