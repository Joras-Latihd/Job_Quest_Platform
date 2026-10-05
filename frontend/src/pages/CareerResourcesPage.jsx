import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { articleService } from '@/services/engagementService';
import { STARTER_TIPS } from '@/constants/resources';
import { formatDate } from '@/utils/format';

export default function CareerResourcesPage() {
  useDocumentTitle('Career resources');
  const { data: articles = [], isLoading } = useQuery({ queryKey: ['articles'], queryFn: () => articleService.list({ limit: 12 }), select: (res) => res.data, retry: false });

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Career resources</h1>
      <p className="mt-1 text-slate-500">Practical guides for your job search.</p>

      {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : articles.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article._id} to={`/career-resources/${article.slug}`} className="card overflow-hidden transition hover:shadow-lift">
              {article.thumbnail && <img src={article.thumbnail} alt="" loading="lazy" className="h-40 w-full object-cover" />}
              <div className="p-5">
                <h2 className="text-lg font-semibold">{article.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{article.author?.name || 'Job Quest team'} &middot; {formatDate(article.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-12 text-xl font-bold">Quick tips</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {STARTER_TIPS.map((tip) => (
          <div key={tip.title} className="card flex gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
            <div><h3 className="text-base font-semibold">{tip.title}</h3><p className="mt-1 text-sm text-slate-600">{tip.summary}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
