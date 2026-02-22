const KEY = "EMBERCORE_GEMINI_KEY";

export const storage = {
  getApiKey(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEY);
  },

  setApiKey(key: string): void {
    localStorage.setItem(KEY, key);
  },

  clearApiKey(): void {
    localStorage.removeItem(KEY);
  },

  hasApiKey(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(KEY);
  },
};
