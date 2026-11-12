"use client"

import * as React from "react"
import Link from "next/link"

import { SkinArtwork } from "@/components/skin-artwork"
import { useSkin } from "@/components/skin-provider"
import { SKIN_PRESETS, type SkinTheme } from "@/lib/skin-system"

type Project = {
  name: string
  type: string
  progress: number
  status: "In progress" | "In review" | "Complete"
  due: string
  mark: string
}

const initialProjects: Project[] = [
  { name: "The New Ritual", type: "Brand platform", progress: 82, status: "In progress", due: "Nov 18", mark: "NR" },
  { name: "Field Notes — Vol. 04", type: "Editorial", progress: 64, status: "In review", due: "Nov 21", mark: "FN" },
  { name: "Common Ground", type: "Digital experience", progress: 100, status: "Complete", due: "Nov 08", mark: "CG" },
  { name: "Objects of Tomorrow", type: "Art direction", progress: 38, status: "In progress", due: "Nov 26", mark: "OT" },
]

const navItems = [
  { label: "Overview", symbol: "◫" },
  { label: "Projects", symbol: "▧" },
  { label: "Library", symbol: "▤" },
  { label: "Insights", symbol: "⌁" },
]

const activity = [
  { initials: "AM", name: "Alex Morgan", action: "shared a new direction", target: "The New Ritual", time: "12 min ago" },
  { initials: "JL", name: "Jamie Lee", action: "left feedback on", target: "Field Notes — Vol. 04", time: "1 hour ago" },
  { initials: "SK", name: "Sam Kim", action: "completed a milestone in", target: "Common Ground", time: "3 hours ago" },
]

function ArrowUpRight({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" /><path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function MoreIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><circle cx="4" cy="10" r="1.2" /><circle cx="10" cy="10" r="1.2" /><circle cx="16" cy="10" r="1.2" /></svg>
}
function TrendChart({ period }: { period: string }) {
  const points = period === "7D"
    ? "0,122 42,108 84,114 126,78 168,89 210,48 252,58 294,26"
    : period === "30D"
      ? "0,132 42,114 84,120 126,83 168,96 210,54 252,65 294,22"
      : "0,140 42,121 84,98 126,111 168,74 210,61 252,40 294,18"
  return (
    <svg viewBox="0 0 294 156" preserveAspectRatio="none" className="skin-dashboard__chart" role="img" aria-describedby="skin-dashboard-chart-summary" aria-label={"Engagement trend for the last " + period}>
      <defs><linearGradient id="skin-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity=".25" /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" /></linearGradient></defs>
      {[24, 64, 104, 144].map((y) => <line key={y} x1="0" x2="294" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />)}
      <polygon points={"0,156 " + points + " 294,156"} fill="url(#skin-chart-fill)" />
      <polyline points={points} fill="none" stroke="var(--chart-1)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx="294" cy={period === "7D" ? "26" : period === "30D" ? "22" : "18"} r="4.5" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
function SkinChoice({ preset, active, onSelect }: { preset: SkinTheme; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={active} className={"skin-dashboard__skin-choice" + (active ? " is-active" : "")} title={"Use " + preset.label + " skin"}>
      <span className="skin-dashboard__skin-dot" style={{ background: preset.light.primary }} />
      <span>{preset.artDirection?.name ?? preset.label}</span>
      {active && <span className="skin-dashboard__skin-check" aria-hidden="true">✓</span>}
    </button>
  )
}

export function SkinDashboardPreview() {
  const { skin, setSkin } = useSkin()
  const [period, setPeriod] = React.useState("30D")
  const [query, setQuery] = React.useState("")
  const [activeNav, setActiveNav] = React.useState("Overview")
  const [projects, setProjects] = React.useState(initialProjects)
  const [announcement, setAnnouncement] = React.useState("")
  const direction = skin.artDirection
  const activeTitle = activeNav === "Overview" ? "Good morning, Alex." : activeNav
  const filteredProjects = projects.filter((project) =>
    (project.name + " " + project.type + " " + project.status).toLowerCase().includes(query.toLowerCase())
  )

  function addProject() {
    setProjects((current) => [
      { name: "Untitled project", type: "New workspace", progress: 8, status: "In progress", due: "Dec 02", mark: "UP" },
      ...current,
    ])
    setActiveNav("Projects")
    setAnnouncement("Demo project added to this preview. It is not saved and will reset when the page reloads.")
  }

  return (
    <div className="skin-dashboard">
      <aside className="skin-dashboard__sidebar">
        <Link href="/" className="skin-dashboard__brand" aria-label="Go to home">
          <span className="skin-dashboard__brand-mark">f.</span>
          <span><strong>forma</strong><small>creative workspace</small></span>
        </Link>
        <div className="skin-dashboard__workspace">
          <span className="skin-dashboard__workspace-icon">A</span>
          <span><strong>Atelier North</strong><small>Studio workspace</small></span>
          <span className="skin-dashboard__workspace-chevron">⌄</span>
        </div>
        <p className="skin-dashboard__nav-label">WORKSPACE</p>
        <nav aria-label="Dashboard navigation" className="skin-dashboard__nav">
          {navItems.map((item) => (
            <button type="button" key={item.label} aria-current={activeNav === item.label ? "page" : undefined} onClick={() => setActiveNav(item.label)} className={activeNav === item.label ? "is-active" : ""}>
              <span aria-hidden="true">{item.symbol}</span>{item.label}
              {item.label === "Projects" && <small>{projects.length}</small>}
            </button>
          ))}
        </nav>
        <div className="skin-dashboard__sidebar-bottom">
          <div className="skin-dashboard__sidebar-note">
            <span className="skin-dashboard__note-orbit" aria-hidden="true">✳</span>
            <strong>Make space for good work.</strong>
            <p>Your next idea deserves a thoughtful place to grow.</p>
          </div>
          <div className="skin-dashboard__profile">
            <span className="skin-dashboard__avatar">AM</span>
            <span><strong>Alex Morgan</strong><small>Studio admin</small></span>
            <MoreIcon />
          </div>
        </div>
      </aside>

      <main className="skin-dashboard__main">
        <header className="skin-dashboard__topbar">
          <div className="skin-dashboard__breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div>
          <div className="skin-dashboard__top-actions">
            <label className="skin-dashboard__search"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." aria-label="Search projects" /><kbd>⌘ K</kbd></label>
            <span aria-hidden="true" className="skin-dashboard__icon-button">♧<i /></span>
            <span aria-hidden="true" className="skin-dashboard__avatar skin-dashboard__avatar--top">AM</span>
          </div>
        </header>

        <div className="skin-dashboard__content">
          <section className="skin-dashboard__intro">
            <div>
              <p className="skin-dashboard__eyebrow">TUESDAY, NOVEMBER 10, 2026 <span>•</span> YOUR STUDIO AT A GLANCE</p>
              <h1>{activeTitle}</h1>
              <p className="skin-dashboard__intro-copy">A clear view of the work, people, and ideas moving your studio forward.</p>
            </div>
            <button type="button" className="skin-dashboard__primary-button" onClick={addProject} aria-describedby="skin-dashboard-demo-note"><span aria-hidden="true">＋</span> Add demo project</button>
            <p id="skin-dashboard-demo-note" className="sr-only">Demo-only action. New projects are not saved and reset when the page reloads.</p>
          </section>

          <section className="skin-dashboard__skin-panel" aria-label="Choose a visual skin">
            <div className="skin-dashboard__skin-panel-copy">
              <span className="skin-dashboard__eyebrow">LIVE ART DIRECTION</span>
              <strong>Change the whole atmosphere.</strong>
              <span>Choose a skin to recompose this dashboard.</span>
            </div>
            <div className="skin-dashboard__skin-choices">
              {SKIN_PRESETS.map((preset) => <SkinChoice key={preset.name} preset={preset} active={skin.name === preset.name} onSelect={() => setSkin(preset)} />)}
            </div>
            <Link href="/skin-studio" className="skin-dashboard__studio-link">Open Skin Studio <ArrowUpRight /></Link>
          </section>

          <section className="skin-dashboard__hero" data-skin-surface="hero">
            <div className="skin-dashboard__hero-art" aria-hidden="true">{direction?.artwork && <SkinArtwork variant={direction.artwork} className="h-full w-full" />}</div>
            <div className="skin-dashboard__hero-copy">
              <span className="skin-dashboard__hero-kicker">{direction?.name ?? "Visual identity"} / FIELD NOTES 026</span>
              <h2>{direction?.narrative.title ?? "Clarity with a human pulse"}</h2>
              <p>{direction?.narrative.thesis ?? "A calm canvas where the content is the protagonist."}</p>
              <div className="skin-dashboard__hero-tags">{(direction?.narrative.keywords ?? ["clarity", "craft", "editorial"]).slice(0, 3).map((word) => <span key={word}>{word}</span>)}</div>
            </div>
            <div className="skin-dashboard__hero-index"><span>01</span><i /><span>04</span></div>
          </section>

          <section className="skin-dashboard__metrics" aria-label="Studio metrics">
            <article className="skin-dashboard__metric"><div><span>PROJECT VIEWS</span><b>↗ 12.8%</b></div><strong>27,420</strong><small>Compared with previous month</small><span className="skin-dashboard__metric-spark spark-one" aria-hidden="true">▁▃▂▅▄▆▇</span></article>
            <article className="skin-dashboard__metric"><div><span>ACTIVE PROJECTS</span><b className="is-neutral">● On track</b></div><strong>{String(projects.length).padStart(2, "0")}</strong><small>Across 3 creative teams</small><span className="skin-dashboard__metric-spark spark-two" aria-hidden="true">▂▂▄▃▅▅▇</span></article>
            <article className="skin-dashboard__metric"><div><span>DELIVERABLES</span><b>↗ 8.2%</b></div><strong>148</strong><small>12 completed this week</small><span className="skin-dashboard__metric-spark spark-three" aria-hidden="true">▁▂▄▃▆▅▇</span></article>
            <article className="skin-dashboard__metric"><div><span>TEAM CAPACITY</span><b className="is-neutral">Balanced</b></div><strong>86<span className="skin-dashboard__metric-unit">%</span></strong><small>Healthy utilization this month</small><div className="skin-dashboard__capacity"><i /></div></article>
          </section>

          <section className="skin-dashboard__lower-grid">
            <article className="skin-dashboard__panel skin-dashboard__trend-panel" data-skin-surface="card">
              <div className="skin-dashboard__panel-heading">
                <div><span className="skin-dashboard__eyebrow">PERFORMANCE</span><h3>Engagement overview</h3><p>How your work is resonating over time.</p></div>
                <div className="skin-dashboard__periods" role="group" aria-label="Engagement chart period">{["7D", "30D", "90D"].map((item) => <button key={item} type="button" aria-pressed={period === item} onClick={() => setPeriod(item)} className={period === item ? "is-active" : ""}>{item}</button>)}</div>
              </div>
              <div id="skin-dashboard-chart-summary" className="skin-dashboard__chart-summary"><strong>{period === "7D" ? "8,240" : period === "30D" ? "27,420" : "84,610"}</strong><span>↑ 12.8% <small>vs previous period</small></span></div>
              <TrendChart period={period} />
              <div className="skin-dashboard__chart-labels"><span>01 NOV</span><span>05 NOV</span><span>10 NOV</span><span>15 NOV</span><span>20 NOV</span><span>30 NOV</span></div>
            </article>

            <article className="skin-dashboard__panel skin-dashboard__activity-panel" data-skin-surface="card">
              <div className="skin-dashboard__panel-heading"><div><span className="skin-dashboard__eyebrow">THE STUDIO PULSE</span><h3>Recent activity</h3><p>Small steps, shared momentum.</p></div><span aria-hidden="true" className="skin-dashboard__more"><MoreIcon /></span></div>
              <div className="skin-dashboard__activity-list">{activity.map((item) => <div className="skin-dashboard__activity" key={item.initials}><span className="skin-dashboard__avatar">{item.initials}</span><p><strong>{item.name}</strong> {item.action} <b>{item.target}</b><small>{item.time}</small></p></div>)}</div>
              <button type="button" className="skin-dashboard__text-link" onClick={() => setActiveNav("Insights")}>View activity log <ArrowUpRight /></button>
            </article>
          </section>

          <section className="skin-dashboard__panel skin-dashboard__projects-panel" data-skin-surface="card">
            <div className="skin-dashboard__panel-heading skin-dashboard__projects-heading"><div><span className="skin-dashboard__eyebrow">IN MOTION</span><h3>Project spaces</h3><p>Everything your team is shaping right now.</p></div><button type="button" className="skin-dashboard__text-link" onClick={() => setActiveNav("Projects")}>View all projects <ArrowUpRight /></button></div>
            <div className="skin-dashboard__table-wrap">
              <table className="skin-dashboard__table">
                <thead><tr><th>PROJECT</th><th>TYPE</th><th>PROGRESS</th><th>STATUS</th><th>DUE DATE</th><th /></tr></thead>
                <tbody>
                  {filteredProjects.map((project) => <tr key={project.name + project.mark}><td><span className="skin-dashboard__project-mark">{project.mark}</span><strong>{project.name}</strong></td><td>{project.type}</td><td><span className="skin-dashboard__progress"><i style={{ width: project.progress + "%" }} /></span><small>{project.progress}%</small></td><td><span className={"skin-dashboard__status" + (project.status === "Complete" ? " is-complete" : project.status === "In review" ? " is-review" : "")}>{project.status}</span></td><td>{project.due}</td><td><span aria-hidden="true" className="skin-dashboard__more"><MoreIcon /></span></td></tr>)}
                  {filteredProjects.length === 0 && <tr><td colSpan={6} className="skin-dashboard__empty">No projects match “{query}”.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="skin-dashboard__projects-foot"><span>Showing {filteredProjects.length} of {projects.length} projects</span><span>Last synced just now <i /></span></div>
          </section>

          <footer className="skin-dashboard__footer"><span>FORMA WORKSPACE / DEMO DATA</span><span>Preview actions are local to this page and are not persisted.</span></footer>
          <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        </div>
      </main>
    </div>
  )
}
