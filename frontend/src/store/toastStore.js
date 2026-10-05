import { create } from 'zustand';

let nextId = 1;

export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (type, message) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, type, message }] });
    setTimeout(() => get().dismiss(id), 4500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((item) => item.id !== id) }),
}));
