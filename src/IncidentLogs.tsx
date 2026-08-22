import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, ArrowRight, MapPin, Clock, User, Shield } from 'lucide-react';

/** Core incident fields per spec */
type Incident = {
  id: string;
  title: string;
  category: 'Harassment' | 'Stalking' | 'Poor Lighting' | 'Assault' | 'Unsafe Transport' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Dispatched' | 'Resolved';
  timestamp: string;
  date: string;
  time: string;
  location: {
    street: string;
    landmark: string;
    lat: number;
    lng: number;
  };
  reporterId: string;
  responderNotes: string;
};

const incidents: Incident[] = [
  {
    id: 'INC-2408',
    title: 'Street harassment reported',
    category: 'Harassment',
    severity: 'Critical',
    status: 'Dispatched',
    timestamp: '2026-08-22T10:42:00',
    date: 'Aug 22, 2026',
    time: '10:42 AM',
    location: { street: 'North Beach / Pier 39', landmark: 'Near Fisherman\'s Wharf', lat: 37.8087, lng: -122.4098 },
    reporterId: 'USR-A4F2K',
    responderNotes: 'Unit S-14 dispatched. Caller guided to well-lit cafe pending arrival.',
  },
  {
    id: 'INC-2407',
    title: 'Followed home from transit station',
    category: 'Stalking',
    severity: 'High',
    status: 'Open',
    timestamp: '2026-08-22T10:28:00',
    date: 'Aug 22, 2026',
    time: '10:28 AM',
    location: { street: 'Union Square / Stockton St', landmark: 'Powell Station exit', lat: 37.7879, lng: -122.4074 },
    reporterId: 'USR-B8C3D',
    responderNotes: 'Helpline volunteer on call, guiding user to nearest safe zone.',
  },
  {
    id: 'INC-2406',
    title: 'Assault near park entrance',
    category: 'Assault',
    severity: 'Critical',
    status: 'Dispatched',
    timestamp: '2026-08-22T09:56:00',
    date: 'Aug 22, 2026',
    time: '09:56 AM',
    location: { street: 'Civic Center / Grove St', landmark: 'Civic Center Plaza', lat: 37.7796, lng: -122.4177 },
    reporterId: 'USR-C2E9F',
    responderNotes: 'EMS + patrol dispatched. Scene secured, victim receiving aid.',
  },
  {
    id: 'INC-2405',
    title: 'Poor lighting on walking route',
    category: 'Poor Lighting',
    severity: 'Medium',
    status: 'Resolved',
    timestamp: '2026-08-22T09:41:00',
    date: 'Aug 22, 2026',
    time: '09:41 AM',
    location: { street: 'Embarcadero / Ferry Building', landmark: 'Ferry Plaza', lat: 37.7955, lng: -122.3937 },
    reporterId: 'USR-D7A1B',
    responderNotes: 'City maintenance notified, streetlight repaired within 2 hrs.',
  },
  {
    id: 'INC-2404',
    title: 'Unsafe taxi — driver taking detour',
    category: 'Unsafe Transport',
    severity: 'High',
    status: 'Open',
    timestamp: '2026-08-22T09:18:00',
    date: 'Aug 22, 2026',
    time: '09:18 AM',
    location: { street: 'Mission District / 16th St', landmark: '16th & Mission BART', lat: 37.7651, lng: -122.4197 },
    reporterId: 'USR-E5F4C',
    responderNotes: 'Live tracking shared with helpline. Driver rerouting confirmed via GPS.',
  },
  {
    id: 'INC-2403',
    title: 'Stalking pattern over 3 days',
    category: 'Stalking',
    severity: 'Low',
    status: 'Open',
    timestamp: '2026-08-22T08:56:00',
    date: 'Aug 22, 2026',
    time: '08:56 AM',
    location: { street: 'Dogpatch / 3rd Street', landmark: 'Minnesota St', lat: 37.7582, lng: -122.3878 },
    reporterId: 'USR-F9D2A',
    responderNotes: 'Pattern report logged, flagged for patrol attention in corridor.',
  },
];

const severityClass = (severity: string) => severity.toLowerCase();
const statusClass = (status: string) => status.toLowerCase();

export function IncidentLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0].id);

  const filtered = useMemo(() => {
    return incidents.filter((incident) => {
      const haystack = `${incident.id} ${incident.title} ${incident.category} ${incident.location.street} ${incident.reporterId}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const criticalCount = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const openCount = incidents.filter((i) => i.status !== 'Resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;

  return (
    <aside className="incident-logs-panel">
      <div className="il-header">
        <div className="il-header-text">
          <span className="il-eyebrow">EVENT STREAM</span>
          <div className="il-title-row">
            <h2>Incident logs</h2>
            <span className="il-count">{String(filtered.length).padStart(2, '0')}</span>
          </div>
          <p className="il-subtitle">Live safety incident reports and response activity.</p>
        </div>
        <button className="il-new-incident" type="button">
          <Plus size={15} /> Log incident
        </button>
      </div>

      <div className="il-summary-strip">
        <div className="il-summary-item">
          <span className="il-summary-icon red">!</span>
          <span>
            <b>{String(criticalCount).padStart(2, '0')}</b>
            <small>Critical</small>
          </span>
        </div>
        <div className="il-summary-item">
          <span className="il-summary-icon amber">●</span>
          <span>
            <b>{String(openCount).padStart(2, '0')}</b>
            <small>Open</small>
          </span>
        </div>
        <div className="il-summary-item">
          <span className="il-summary-icon green">✓</span>
          <span>
            <b>{String(resolvedCount).padStart(2, '0')}</b>
            <small>Resolved</small>
          </span>
        </div>
      </div>

      <div className="il-filter-bar">
        <div className="il-search-field">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="il-logs-list">
        {filtered.length ? (
          filtered.map((incident) => (
            <button
              key={incident.id}
              className={`il-log-card${selectedId === incident.id ? ' selected' : ''}`}
              type="button"
              onClick={() => setSelectedId(incident.id)}
            >
              <span className={`il-priority-bar ${severityClass(incident.severity)}`} />
              <span className="il-log-main">
                <span className="il-log-topline">
                  <span className="il-log-title">{incident.title}</span>
                  <span className="il-log-time">{incident.date} · {incident.time}</span>
                </span>
                <span className="il-log-meta">
                  <span><MapPin size={10} /> {incident.location.street}</span>
                  <span>{incident.category}</span>
                </span>
                <span className="il-log-coords">
                  <small>Reporter: {incident.reporterId} · GPS: {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}</small>
                </span>
                {incident.responderNotes && (
                  <span className="il-responder-notes">
                    <Shield size={10} /> {incident.responderNotes}
                  </span>
                )}
              </span>
              <span className={`il-status-pill ${statusClass(incident.status)}`}>
                <span className={`il-severity-dot ${severityClass(incident.severity)}`} />
                {incident.status}
              </span>
            </button>
          ))
        ) : (
          <div className="il-no-results">No incidents match your current filters.</div>
        )}
      </div>

      <div className="il-footer">
        <span>
          <i className="il-footer-pulse" /> Streaming updates
        </span>
        <button type="button">
          Load older events <ArrowRight size={12} />
        </button>
      </div>
    </aside>
  );
}
