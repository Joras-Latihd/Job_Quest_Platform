import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { articleService } from '@/services/engagementService';
import { formatDate } from '@/utils/format';

export default function ArticlePage() {
  const { slug } = useParams();
  const { data: article, isLoading, isError, error } = useQuery({ queryKey: ['article', slug], queryFn: () => articleService.getBySlug(slug), select: (res) => res.data });
  useDocumentTitle(article?.title || 'Article');

  if (isLoading) return <div className="container-page max-w-3xl py-10"><Skeleton className="h-96" /></div>;
  if (isError) return <div className="container-page py-12"><ErrorState message={error.message} /></div>;

  return (
    <article className="container-page max-w-3xl py-10">
      <Link to="/career-resources" className="text-sm font-medium text-brand-600 hover:underline">Back to career resources</Link>
      <h1 className="mt-3 text-3xl font-bold">{article.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{article.author?.name || 'Job Quest team'} &middot; {formatDate(article.publishedAt)}</p>
      {article.thumbnail && <img src={article.thumbnail} alt="" className="mt-6 w-full rounded-2xl object-cover" />}
      {/* Content is plain text with blank lines between paragraphs - rendered as text, never as HTML. */}
      <div className="mt-6 space-y-4 leading-relaxed text-slate-700">
        {article.content.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </article>
  );
}
