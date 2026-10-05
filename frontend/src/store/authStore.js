import { create } from 'zustand';

const STORAGE_KEY = 'jobquest_auth';

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

// "Remember me" keeps the session in localStorage, otherwise it lives only until the tab closes.
function writeSession(session, remember) {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
}

const saved = readSession();

export const useAuthStore = create((set, get) => ({
  token: saved?.token || null,
  user: saved?.user || null,
  isBootstrapped: !saved?.token,

  setSession: (token, user, remember = true) => {
    writeSession({ token, user }, remember);
    set({ token, user, isBootstrapped: true });
  },
  setUser: (user) => {
    const remember = Boolean(localStorage.getItem(STORAGE_KEY));
    writeSession({ token: get().token, user }, remember);
    set({ user });
  },
  setBootstrapped: () => set({ isBootstrapped: true }),
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isBootstrapped: true });
  },
}));
