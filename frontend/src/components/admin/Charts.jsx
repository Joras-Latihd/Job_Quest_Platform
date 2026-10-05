import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Data shape for both charts: [{ label: 'Jan', value: 12 }]
export function ChartCard({ title, children, empty }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 font-sans text-base font-semibold">{title}</h2>
      <div className="h-64">{empty ? <p className="flex h-full items-center justify-center text-sm text-slate-500">No data yet.</p> : children}</div>
    </section>
  );
}

export function TrendChart({ title, data = [] }) {
  return (
    <ChartCard title={title} empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" name={title} stroke="#2748d6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function BreakdownChart({ title, data = [] }) {
  return (
    <ChartCard title={title} empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" name="Jobs" fill="#3a62ee" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
