import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { articleService } from '@/services/engagementService';
import { formatDate } from '@/utils/format';
import { STARTER_TIPS } from '@/constants/resources';

export default function ResourcesTeaser() {
  const { data: articles = [] } = useQuery({ queryKey: ['articles', 'teaser'], queryFn: () => articleService.list({ limit: 3 }), select: (res) => res.data, retry: false });
  const items = articles.length ? articles.map((a) => ({ key: a._id, title: a.title, text: formatDate(a.publishedAt), to: `/career-resources/${a.slug}` })) : STARTER_TIPS.map((tip) => ({ key: tip.title, title: tip.title, text: tip.summary, to: '/career-resources' }));
  return (
    <section className="bg-white py-14" aria-labelledby="resources-title">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="resources-title" className="section-title">Career resources</h2>
          <Link to="/career-resources" className="text-sm font-medium text-brand-600 hover:underline">More guides</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <Link key={item.key} to={item.to} className="card group p-5 transition hover:shadow-lift">
              <h3 className="text-lg font-semibold group-hover:text-brand-600">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">Read more <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
