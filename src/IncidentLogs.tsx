import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

/** Demo incident data — mirrors incident-response-dashboard/app.js */
type Incident = {
  id: string;
  title: string;
  category: string;
  priority: 'Critical' | 'High' | 'Monitoring';
  status: 'Dispatched' | 'Investigating' | 'Resolved' | 'Monitoring';
  time: string;
  relative: string;
  location: string;
  reporter: string;
  unit: string;
  response: string;
  tags: string[];
};

const incidents: Incident[] = [
  {
    id: 'INC-2408', title: 'Unauthorized access detected', category: 'Security breach', priority: 'Critical', status: 'Dispatched', time: '10:42 AM', relative: '2 min ago',
    location: 'North Beach / Pier 39', reporter: 'Perimeter sensor 04', unit: 'Unit S-14', response: '02:18',
    tags: ['perimeter', 'after-hours', 'camera AI'],
  },
  {
    id: 'INC-2407', title: 'Crowd density threshold exceeded', category: 'Public safety', priority: 'High', status: 'Investigating', time: '10:28 AM', relative: '16 min ago',
    location: 'Union Square / Stockton St', reporter: 'Vision monitor 12', unit: 'Unit M-03', response: '03:46',
    tags: ['crowd', 'footfall', 'monitoring'],
  },
  {
    id: 'INC-2406', title: 'Medical assistance requested', category: 'Medical', priority: 'Critical', status: 'Dispatched', time: '09:56 AM', relative: '48 min ago',
    location: 'Civic Center / Grove St', reporter: 'Emergency call', unit: 'Unit M-07', response: '01:52',
    tags: ['medical', 'priority response', 'EMS'],
  },
  {
    id: 'INC-2405', title: 'Vehicle stopped in restricted zone', category: 'Traffic', priority: 'High', status: 'Resolved', time: '09:41 AM', relative: '1 hr ago',
    location: 'Embarcadero / Ferry Building', reporter: 'Roadside camera 06', unit: 'Unit T-11', response: '04:05',
    tags: ['traffic', 'restricted zone'],
  },
  {
    id: 'INC-2404', title: 'Unusual activity near entrance', category: 'Behavioral alert', priority: 'Monitoring', status: 'Monitoring', time: '09:18 AM', relative: '1 hr ago',
    location: 'Mission District / 16th St', reporter: 'Camera AI 21', unit: 'Unit S-02', response: '—',
    tags: ['behavioral', 'camera AI'],
  },
  {
    id: 'INC-2403', title: 'Perimeter sensor offline', category: 'Infrastructure', priority: 'Monitoring', status: 'Monitoring', time: '08:56 AM', relative: '2 hrs ago',
    location: 'Dogpatch / 3rd Street', reporter: 'Sensor network', unit: 'Tech team 02', response: '—',
    tags: ['infrastructure', 'sensor', 'maintenance'],
  },
];

const priorityClass = (priority: string) => priority.toLowerCase();
const statusClass = (status: string) => status.toLowerCase().replace(/\s+/g, '-');

export function IncidentLogs() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0].id);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    return incidents.filter((incident) => {
      const filterMatches = activeFilter === 'all' || incident.priority === activeFilter || incident.status === activeFilter;
      const haystack = `${incident.id} ${incident.title} ${incident.category} ${incident.location} ${incident.unit}`.toLowerCase();
      return filterMatches && haystack.includes(searchTerm.toLowerCase());
    });
  }, [activeFilter, searchTerm]);

  const filterLabel = activeFilter === 'all' ? 'All' : activeFilter;

  return (
    <aside className="incident-logs-panel">
      <div className="il-header">
        <div className="il-header-text">
          <span className="il-eyebrow">EVENT STREAM</span>
          <div className="il-title-row">
            <h2>Incident logs</h2>
            <span className="il-count">{String(filtered.length).padStart(2, '0')}</span>
          </div>
          <p className="il-subtitle">Review active events and dispatch activity.</p>
        </div>
        <button className="il-new-incident" type="button">
          <Plus size={15} /> Log incident
        </button>
      </div>

      <div className="il-summary-strip">
        <div className="il-summary-item">
          <span className="il-summary-icon red">!</span>
          <span>
            <b>02</b>
            <small>Critical</small>
          </span>
        </div>
        <div className="il-summary-item">
          <span className="il-summary-icon amber">↗</span>
          <span>
            <b>04:12</b>
            <small>Avg. response</small>
          </span>
        </div>
        <div className="il-summary-item">
          <span className="il-summary-icon green">✓</span>
          <span>
            <b>98%</b>
            <small>Resolved today</small>
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
        <button
          className={`il-filter-button${filterOpen ? ' active' : ''}`}
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
        >
          <Filter size={14} /> Filter <b>{filterLabel}</b>
        </button>
      </div>

      {filterOpen && (
        <div className="il-filter-menu">
          {[
            { label: 'All incidents', value: 'all', count: '06' },
            { label: 'Critical', value: 'Critical', count: '02' },
            { label: 'High priority', value: 'High', count: '02' },
            { label: 'Monitoring', value: 'Monitoring', count: '02' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setActiveFilter(opt.value);
                setFilterOpen(false);
              }}
            >
              {opt.label} <span>{opt.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="il-logs-list">
        {filtered.length ? (
          filtered.map((incident) => (
            <button
              key={incident.id}
              className={`il-log-card${selectedId === incident.id ? ' selected' : ''}`}
              type="button"
              onClick={() => setSelectedId(incident.id)}
            >
              <span className={`il-priority-bar ${priorityClass(incident.priority)}`} />
              <span className="il-log-main">
                <span className="il-log-topline">
                  <span className="il-log-title">{incident.title}</span>
                  <span className="il-log-time">{incident.relative}</span>
                </span>
                <span className="il-log-meta">
                  <span>{incident.location}</span>
                  <span>{incident.category}</span>
                </span>
              </span>
              <span className={`il-status-pill ${statusClass(incident.status)}`}>{incident.status}</span>
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
