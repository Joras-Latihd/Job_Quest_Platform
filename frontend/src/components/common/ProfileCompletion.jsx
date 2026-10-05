import { Link } from 'react-router-dom';
import { calcProfileCompletion } from '@/utils/profile';

export default function ProfileCompletion({ user }) {
  const { percent, missing } = calcProfileCompletion(user);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Profile completion</h2>
        <span className="text-sm font-semibold text-brand-700">{percent}%</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      {missing.length > 0 ? (
        <>
          <p className="mt-3 text-sm text-slate-600">A complete profile helps employers understand your background. Still missing: {missing.join(', ')}.</p>
          <Link to="/dashboard/profile" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">Complete your profile</Link>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Your profile covers every section. Keep it up to date as your experience grows.</p>
      )}
    </div>
  );
}
