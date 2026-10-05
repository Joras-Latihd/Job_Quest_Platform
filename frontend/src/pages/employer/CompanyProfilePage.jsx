import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import StatusBadge from '@/components/ui/StatusBadge';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useLocations } from '@/hooks/useMeta';
import { companyService } from '@/services/companyService';
import { companySchema } from '@/schemas/miscSchemas';
import { COMPANY_SIZES, FILE_RULES, INDUSTRIES, VERIFICATION_STATUSES } from '@/constants';
import { validateFile } from '@/utils/validators';

const EMPTY = { name: '', industry: '', description: '', website: '', email: '', phone: '', address: '', location: '', size: '', foundedYear: '', linkedin: '', facebook: '', twitter: '' };

export default function CompanyProfilePage() {
  useDocumentTitle('Company profile');
  const { data: locations = [] } = useLocations();
  const [files, setFiles] = useState({ logo: null, coverImage: null });
  const [fileErrors, setFileErrors] = useState({});
  const query = useQuery({ queryKey: ['company', 'mine'], queryFn: companyService.getMine, select: (res) => res.data, retry: false });
  const company = query.data;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(companySchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!company) return;
    reset({ ...EMPTY, ...company, location: company.location?._id || company.location || '', foundedYear: company.foundedYear ?? '', linkedin: company.socialLinks?.linkedin || '', facebook: company.socialLinks?.facebook || '', twitter: company.socialLinks?.twitter || '' });
  }, [company, reset]);

  const save = useActionMutation((values) => {
    const { linkedin, facebook, twitter, ...rest } = values;
    const formData = new FormData();
    Object.entries({ ...rest, socialLinks: JSON.stringify({ linkedin, facebook, twitter }) }).forEach(([key, value]) => value !== '' && value != null && formData.append(key, value));
    if (files.logo) formData.append('logo', files.logo);
    if (files.coverImage) formData.append('coverImage', files.coverImage);
    return company ? companyService.update(company._id, formData) : companyService.create(formData);
  }, { success: 'Company profile saved.', invalidate: [['company'], ['employer-dashboard']], onSuccess: () => setFiles({ logo: null, coverImage: null }) });

  const pickFile = (key) => (event) => {
    const file = event.target.files[0];
    const problem = file && validateFile(file, FILE_RULES.image);
    setFileErrors((current) => ({ ...current, [key]: problem || '' }));
    if (file && !problem) setFiles((current) => ({ ...current, [key]: file }));
  };

  if (query.isLoading) return <Skeleton className="h-96 max-w-4xl" />;
  if (query.isError && query.error.status !== 404) return <ErrorState message={query.error.message} onRetry={query.refetch} />;

  return (
    <div className="max-w-4xl">
      <PageHeader title="Company profile" description="This is what job seekers see on your company page and job listings." actions={company && <StatusBadge status={company.verificationStatus} options={VERIFICATION_STATUSES} />} />
      <form onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-6" noValidate>
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">Branding</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-4"><Avatar src={files.logo ? URL.createObjectURL(files.logo) : company?.logo} name={company?.name || 'Logo'} size="xl" square /><div><label className="label" htmlFor="logo">Logo</label><input id="logo" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={pickFile('logo')} className="text-sm" />{fileErrors.logo && <p role="alert" className="text-xs text-red-600">{fileErrors.logo}</p>}</div></div>
            <div><label className="label" htmlFor="cover">Cover image</label><input id="cover" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={pickFile('coverImage')} className="text-sm" />{fileErrors.coverImage && <p role="alert" className="text-xs text-red-600">{fileErrors.coverImage}</p>}<p className="mt-1 text-xs text-slate-500">{FILE_RULES.image.label}</p></div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">About the company</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company name" required error={errors.name?.message} {...register('name')} />
            <Select label="Industry" required placeholder="Select" options={INDUSTRIES} error={errors.industry?.message} {...register('industry')} />
            <Select label="Company size" required placeholder="Select" options={COMPANY_SIZES} error={errors.size?.message} {...register('size')} />
            <Input label="Founded year" type="number" error={errors.foundedYear?.message} {...register('foundedYear')} />
            <Textarea label="Description" required rows={6} wrapperClassName="sm:col-span-2" error={errors.description?.message} {...register('description')} />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">Contact and location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company email" type="email" required error={errors.email?.message} {...register('email')} />
            <Input label="Phone" type="tel" {...register('phone')} />
            <Input label="Website" placeholder="https://" error={errors.website?.message} {...register('website')} />
            <Select label="Location" required placeholder="Select" options={locations.map((item) => ({ value: item._id, label: `${item.city}, ${item.country}` }))} error={errors.location?.message} {...register('location')} />
            <Input label="Address" wrapperClassName="sm:col-span-2" {...register('address')} />
            <Input label="LinkedIn" placeholder="https://" {...register('linkedin')} />
            <Input label="Facebook" placeholder="https://" {...register('facebook')} />
            <Input label="X / Twitter" placeholder="https://" {...register('twitter')} />
          </div>
        </section>
        <div className="flex justify-end"><Button type="submit" loading={save.isPending}>{company ? 'Save company profile' : 'Create company profile'}</Button></div>
      </form>
    </div>
  );
}
