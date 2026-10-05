import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';

/*
 * One place for the usual "call API -> toast -> refresh lists" pattern.
 * invalidate: array of query keys to refetch, e.g. [['admin', 'users']]
 */
export default function useActionMutation(mutationFn, { success, invalidate = [], onSuccess } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      if (success) toast.success(typeof success === 'function' ? success(response) : success);
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      onSuccess?.(response, variables);
    },
    onError: (error) => toast.error(error.message),
  });
}
