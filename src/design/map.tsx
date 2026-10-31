import type { KeyboardEvent } from 'react';
import mapData from '../data/geo/nigeria-map.json';

const STEPS = ['#E9EFEA', '#BFD6C6', '#7FAE90', '#3F7F5C', '#14452F'];
function shade(v: number, max: number) { if (v <= 0) return STEPS[0]; return STEPS[Math.min(4, 1 + Math.floor((v / Math.max(1, max)) * 3.999))]; }

/** Choropleth of Nigeria's 36 states and the FCT. Keyboard operable; every state has a text label. */
export function NigeriaMap({ values, selected, onSelect, unit, ariaLabel }: { values: Record<string, number>; selected?: string; onSelect: (id: string) => void; unit: string; ariaLabel: string }) {
  const max = Math.max(0, ...Object.values(values));
  const key = (id: string) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } };
  return (
    <figure className="map">
      <svg viewBox={mapData.viewBox} role="group" aria-label={ariaLabel} className="map__svg">
        {mapData.locations.map(l => {
          const v = values[l.id] ?? 0; const on = selected === l.id;
          return (
            <path key={l.id} d={l.path} fill={shade(v, max)} className={`map__state${on ? ' map__state--on' : ''}`} tabIndex={0} role="button"
              aria-pressed={on} aria-label={`${l.name}: ${v} ${unit}`} onClick={() => onSelect(l.id)} onKeyDown={key(l.id)}><title>{`${l.name}: ${v} ${unit}`}</title></path>
          );
        })}
      </svg>
      <figcaption className="map__legend" aria-hidden="true">
        <span>0</span>{STEPS.map(c => <i key={c} style={{ background: c }} />)}<span>{max}</span><em>{unit}</em>
      </figcaption>
      <p className="map__credit">Stylised map: {mapData.attribution}</p>
    </figure>
  );
}
