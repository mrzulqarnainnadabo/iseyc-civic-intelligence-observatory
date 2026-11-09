import snapshots from "../data/indicators/national-department-snapshots.v1.json";

type SnapshotMetric = { label: string; value: string; unit: string; period: string; interval?: string };
type SnapshotRecord = {
  id: string;
  departmentId: string | null;
  title: string;
  publisher: string;
  sourceId: string;
  sourceUrl: string;
  referencePeriod: string;
  retrievedAt: string;
  geography: { level: string; label: string };
  evidenceType: string;
  metrics: SnapshotMetric[];
  limitations: string[];
  interpretation: string;
};

const records = snapshots.records as SnapshotRecord[];

export default function NationalSnapshotGrid({ departmentId }: { departmentId?: string }) {
  const visible = records.filter((record) => !departmentId || record.departmentId === departmentId);
  if (!visible.length) return null;

  return (
    <section className="national-snapshots" aria-label="Dated national evidence snapshots">
      <div className="national-snapshots__head">
        <div><span className="observatory-kicker observatory-kicker--dark">Publisher-reported evidence</span><h3>National source snapshots</h3></div>
        <span className="national-snapshots__date">Reviewed 9 Nov 2026</span>
      </div>
      <div className="national-snapshots__grid">
        {visible.map((record) => (
          <article className="national-snapshot" key={record.id}>
            <div className="national-snapshot__top"><span>{record.evidenceType}</span><span>{record.referencePeriod}</span></div>
            <h4>{record.title}</h4>
            <p className="national-snapshot__publisher">{record.publisher} · {record.geography.label}</p>
            <div className="national-snapshot__metrics">
              {record.metrics.map((metric) => (
                <div className="national-snapshot__metric" key={metric.label}>
                  <strong>{metric.value}{metric.interval ? <small> [{metric.interval}]</small> : null}</strong>
                  <span>{metric.label}</span>
                  <em>{metric.unit} · {metric.period}</em>
                </div>
              ))}
            </div>
            <div className="national-snapshot__foot"><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a><span>Reference: {record.referencePeriod}</span></div>
            <details><summary>Interpretation & limitations</summary><p>{record.interpretation}</p><ul>{record.limitations.map((item) => <li key={item}>{item}</li>)}</ul></details>
          </article>
        ))}
      </div>
      <p className="national-snapshots__note">Dated source transcriptions, not a live data feed. National values do not establish state or facility conditions unless the source explicitly reports that geography.</p>
    </section>
  );
}
