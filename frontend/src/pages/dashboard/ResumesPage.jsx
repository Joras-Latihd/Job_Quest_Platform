import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FileDropzone from '@/components/common/FileDropzone';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { FILE_RULES } from '@/constants';
import { formatDate, formatFileSize } from '@/utils/format';
import { validateFile } from '@/utils/validators';
import { toast } from '@/utils/toast';

export default function ResumesPage() {
  useDocumentTitle('Resumes');
  const setUser = useAuthStore((state) => state.setUser);
  const [deleting, setDeleting] = useState(null);
  const replaceInput = useRef(null);
  const [replaceId, setReplaceId] = useState(null);

  const query = useQuery({ queryKey: ['profile'], queryFn: authService.me, select: (res) => res.data });
  // Keep the logged-in user in the store in sync, so profile completion updates everywhere.
  const afterChange = { invalidate: [['profile'], ['apply-profile'], ['seeker-dashboard']], onSuccess: () => authService.me().then((res) => setUser(res.data)) };
  const upload = useActionMutation(userService.uploadResume, { success: 'Resume uploaded.', ...afterChange });
  const replace = useActionMutation(({ id, file }) => userService.replaceResume(id, file), { success: 'Resume replaced.', ...afterChange });
  const makeDefault = useActionMutation(userService.setDefaultResume, { success: 'Default resume updated.', ...afterChange });
  const remove = useActionMutation(userService.deleteResume, { success: 'Resume deleted.', invalidate: afterChange.invalidate, onSuccess: () => { setDeleting(null); afterChange.onSuccess(); } });

  const onReplaceChosen = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    const problem = file && validateFile(file, FILE_RULES.resume);
    if (problem) return toast.error(problem);
    return file && replace.mutate({ id: replaceId, file });
  };

  const resumes = query.data?.resumes || [];
  return (
    <div className="max-w-3xl">
      <PageHeader title="Resumes" description="Upload up to a few versions and choose a default for quick applications." />
      <FileDropzone rules={FILE_RULES.resume} loading={upload.isPending} onFile={(file) => upload.mutate(file)} label="Upload a resume" />
      <input ref={replaceInput} type="file" className="sr-only" tabIndex={-1} accept=".pdf,.doc,.docx" onChange={onReplaceChosen} />

      <div className="mt-6">
        {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? <Skeleton className="h-24" /> : resumes.length === 0 ? (
          <EmptyState icon={FileText} title="No resumes uploaded" description="Upload a PDF or Word resume to apply for jobs." />
        ) : (
          <ul className="space-y-3">
            {resumes.map((resume) => (
              <li key={resume._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <FileText className="h-8 w-8 shrink-0 text-brand-600" aria-hidden="true" />
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{resume.name} {resume.isDefault && <Badge tone="blue">Default</Badge>}</p><p className="text-xs text-slate-500">{formatFileSize(resume.size)} &middot; uploaded {formatDate(resume.uploadedAt)}</p></div>
                <div className="flex flex-wrap gap-2">
                  <Button as="a" href={resume.url} target="_blank" rel="noreferrer noopener" variant="outline" size="sm"><Download className="h-4 w-4" aria-hidden="true" /> Download</Button>
                  {!resume.isDefault && <Button variant="outline" size="sm" onClick={() => makeDefault.mutate(resume._id)}>Set default</Button>}
                  <Button variant="outline" size="sm" onClick={() => { setReplaceId(resume._id); replaceInput.current.click(); }}>Replace</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleting(resume)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog open={Boolean(deleting)} title="Delete this resume?" message={`"${deleting?.name}" will be removed. Applications you already sent keep their copy.`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate(deleting._id)} onCancel={() => setDeleting(null)} />
    </div>
  );
}
