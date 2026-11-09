import { useMemo, useState } from "react";
import hubData from "../data/innovation-hubs.v1.json";

type Hub = { id: string; name: string; city: string; state: string; focus: string[]; isnStatus: string };
const hubs = hubData.hubs as Hub[];

export default function InnovationHubDirectory() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hubs;
    return hubs.filter((hub) => [hub.name, hub.city, hub.state, ...hub.focus, hub.isnStatus].join(" ").toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="innovation-hubs" aria-label="Selected Nigerian innovation hubs">
      <div className="innovation-hubs__head">
        <div><span className="observatory-kicker observatory-kicker--dark">National ecosystem</span><h3>Innovation hub directory</h3><p>Selected ISN member listings · 9 Nov 2026 review</p></div>
        <a href={hubData.sourceUrl} target="_blank" rel="noopener noreferrer">Full ISN directory ↗</a>
      </div>
      <label className="innovation-hubs__search">
        <span>Find a hub</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search hub, city, state or focus area" />
      </label>
      <div className="innovation-hubs__grid">
        {filtered.map((hub) => (
          <article className="innovation-hub" key={hub.id}>
            <div className="innovation-hub__top"><span>{hub.city}, {hub.state}</span><span className={hub.isnStatus === "ISO Certified" ? "innovation-hub__status innovation-hub__status--certified" : "innovation-hub__status"}>{hub.isnStatus}</span></div>
            <h4>{hub.name}</h4>
            <div className="innovation-hub__focus">{hub.focus.map((focus) => <span key={focus}>{focus}</span>)}</div>
          </article>
        ))}
        {!filtered.length && <p className="innovation-hubs__empty">No directory listing matches this search.</p>}
      </div>
      <p className="innovation-hubs__note">ISN directory status is reproduced as listed; “ISO Certified” refers to ISN’s Innovation Support Organisation certification, not ISO 9001. Listings do not prove current operating capacity or impact.</p>
    </section>
  );
}
