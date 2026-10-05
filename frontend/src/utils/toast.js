import { useToastStore } from '@/store/toastStore';

const push = (type, message) => useToastStore.getState().push(type, message);

export const toast = {
  success: (message) => push('success', message),
  error: (message) => push('error', message),
  info: (message) => push('info', message),
};
