import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileSpreadsheet,
  GitBranch,
  LayoutDashboard,
  Layers3,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  budgetChangesSeed,
  budgetLinesSeed,
  buyInRatesSeed,
  configurationSeed,
  evmSeed,
  labourPlanSeed,
  periods,
  projects,
  resourcesSeed,
  roleRatesSeed,
  scheduleWbsSeed,
  spendSeed,
  timesheetSeed,
} from "./data.js";

const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "budget", label: "Budget", icon: WalletCards },
  { key: "resources", label: "Resources & Rates", icon: UsersRound },
  { key: "labour", label: "Labour", icon: BadgeDollarSign },
  { key: "spend", label: "Spend", icon: FileSpreadsheet },
  { key: "forecast", label: "Forecast", icon: TrendingIcon },
  { key: "variance", label: "Variance", icon: AlertTriangle },
  { key: "evm", label: "EVM", icon: BarChart3 },
  { key: "configuration", label: "Configuration", icon: Settings },
];

function TrendingIcon(props) {
  return <ArrowUpRight {...props} />;
}

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

function money(value) {
  return currencyFormatter.format(value || 0);
}

function sum(values = []) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function byCode(items, code) {
  return items.find((item) => item.code === code);
}

function shortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function App() {
  const [activeView, setActiveView] = useState("overview");
  const [selectedProject, setSelectedProject] = useState("alpha");
  const [config, setConfig] = useState(configurationSeed);
  const [resources, setResources] = useState(resourcesSeed);
  const [buyInRates, setBuyInRates] = useState(buyInRatesSeed);
  const [roleRates, setRoleRates] = useState(roleRatesSeed);
  const [budgetLines, setBudgetLines] = useState(budgetLinesSeed);
  const [labourLines, setLabourLines] = useState(labourPlanSeed);
  const [timesheets, setTimesheets] = useState(timesheetSeed);
  const [budgetChanges, setBudgetChanges] = useState(budgetChangesSeed);

  const context = {
    selectedProject,
    setSelectedProject,
    config,
    setConfig,
    resources,
    setResources,
    buyInRates,
    setBuyInRates,
    roleRates,
    setRoleRates,
    budgetLines,
    setBudgetLines,
    labourLines,
    setLabourLines,
    timesheets,
    setTimesheets,
    budgetChanges,
    setBudgetChanges,
  };

  const project = projects.find((item) => item.id === selectedProject);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">Q</div>
          <div>
            <div className="brand-title">Quvoryx</div>
            <div className="brand-subtitle">Financial Module</div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`nav-item ${activeView === item.key ? "active" : ""}`}
                onClick={() => setActiveView(item.key)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="mini-label">Prototype mode</div>
          <div className="mini-copy">Local state only. No Lovable credits used.</div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">Capital Infrastructure Program</div>
            <h1>{project?.name} finance control</h1>
          </div>
          <div className="topbar-actions">
            <label className="field compact">
              <span>Project</span>
              <select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}>
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="icon-button" title="Upload SAP actuals">
              <Upload size={17} />
            </button>
            <button className="primary-button">
              <Save size={16} />
              Snapshot
            </button>
          </div>
        </header>

        {activeView === "overview" && <Overview {...context} />}
        {activeView === "budget" && <BudgetWorkbench {...context} />}
        {activeView === "resources" && <ResourcesAndRates {...context} />}
        {activeView === "labour" && <LabourWorkbench {...context} />}
        {activeView === "spend" && <SpendView {...context} />}
        {activeView === "forecast" && <ForecastView {...context} />}
        {activeView === "variance" && <VarianceView {...context} />}
        {activeView === "evm" && <EvmView {...context} />}
        {activeView === "configuration" && <ConfigurationView {...context} />}
      </main>
    </div>
  );
}

function Overview({ selectedProject, config, budgetLines, labourLines, timesheets, budgetChanges }) {
  const projectBudget = budgetLines.filter((line) => line.projectId === selectedProject);
  const currentBudget = projectBudget.reduce((total, line) => total + sum(line.current), 0);
  const draftDelta = projectBudget.reduce((total, line) => total + sum(line.draft), 0);
  const actuals = spendSeed
    .filter((item) => item.projectId === selectedProject && item.type === "Actual")
    .reduce((total, item) => total + item.baseAmount, 0);
  const commitments = spendSeed
    .filter((item) => item.projectId === selectedProject && item.type !== "Actual")
    .reduce((total, item) => total + item.baseAmount, 0);
  const forecast = currentBudget + draftDelta + commitments * 0.35;
  const unmapped = timesheets.filter((line) => line.projectId === selectedProject && line.mappingStatus === "Exception").length;
  const labourCount = labourLines.filter((line) => line.projectId === selectedProject).length;

  return (
    <section className="screen-grid">
      <div className="metric-grid">
        <MetricCard title="Current budget" value={money(currentBudget)} note="Approved baseline plus approved changes" tone="blue" icon={WalletCards} />
        <MetricCard title="Actuals to date" value={money(actuals)} note="SAP upload and manual actuals" tone="green" icon={CircleDollarSign} />
        <MetricCard title="Forecast EAC" value={money(forecast)} note={`${money(forecast - currentBudget)} variance at completion`} tone="amber" icon={ArrowUpRight} />
        <MetricCard title="Mapping exceptions" value={unmapped} note="Must be resolved before lock" tone={unmapped ? "red" : "green"} icon={AlertTriangle} />
      </div>

      <div className="two-column">
        <Panel
          title="Financial position"
          subtitle="Cost item first, WBS as traceability"
          action={<StatusPill label={forecast > currentBudget ? "Watch" : "On track"} tone={forecast > currentBudget ? "amber" : "green"} />}
        >
          <div className="stack-list">
            {projectBudget.map((line) => {
              const detail = byCode(config.costDetails, line.costDetail);
              const element = byCode(config.costElements, detail?.parent);
              return (
                <div className="summary-row" key={line.id}>
                  <div>
                    <strong>{detail?.name}</strong>
                    <span>{element?.name} · Budget WBS {line.budgetWbs} · SAP {line.sapWbs}</span>
                  </div>
                  <div className="right-value">
                    <strong>{money(sum(line.current))}</strong>
                    <DeltaBadge value={sum(line.draft)} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="This month" subtitle="Review actions and governance gates">
          <div className="checklist">
            <CheckItem done label="SAP actuals uploaded" detail="July actuals imported and mapped" />
            <CheckItem done={unmapped === 0} label="Mapping exceptions resolved" detail={`${unmapped} exception remaining`} />
            <CheckItem done label="Forecast refreshed" detail="EAC calculated from draft budget and commitments" />
            <CheckItem done={false} label="Budget changes submitted" detail={`${budgetChanges.filter((item) => item.projectId === selectedProject && item.status === "Draft").length} draft still open`} />
          </div>
        </Panel>
      </div>

      <Panel title="Labour pulse" subtitle="Recharge, buy-in, and recovery view">
        <div className="labour-pulse">
          <MetricInline label="Labour plan lines" value={labourCount} />
          <MetricInline label="Approved timesheet hours" value={timesheets.filter((line) => line.projectId === selectedProject).reduce((total, line) => total + line.hours, 0)} />
          <MetricInline label="Recharge estimate" value={money(timesheets.filter((line) => line.projectId === selectedProject).reduce((total, line) => total + line.days * line.rechargeRate, 0))} />
          <MetricInline label="Buy-in estimate" value={money(timesheets.filter((line) => line.projectId === selectedProject).reduce((total, line) => total + line.days * line.buyInRate, 0))} />
        </div>
      </Panel>
    </section>
  );
}

function BudgetWorkbench({ selectedProject, config, budgetLines, setBudgetLines, budgetChanges, setBudgetChanges }) {
  const [expanded, setExpanded] = useState({ LAB: true, GOODS: true, SERV: true });
  const [draftOpen, setDraftOpen] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const visibleLines = budgetLines.filter((line) => line.projectId === selectedProject);
  const totalCurrent = visibleLines.reduce((total, line) => total + sum(line.current), 0);
  const totalDraft = visibleLines.reduce((total, line) => total + sum(line.draft), 0);

  const groups = useMemo(() => {
    return config.costCategories
      .map((category) => {
        const elements = config.costElements
          .filter((element) => element.parent === category.code)
          .map((element) => {
            const details = config.costDetails.filter((detail) => detail.parent === element.code);
            const rows = visibleLines.filter((line) => details.some((detail) => detail.code === line.costDetail));
            return { ...element, rows };
          })
          .filter((element) => element.rows.length);
        return { ...category, elements };
      })
      .filter((category) => category.elements.length);
  }, [config, visibleLines]);

  function submitDraftChange() {
    setBudgetChanges((items) => [
      {
        id: `chg-${Date.now()}`,
        title: "Draft budget submission",
        projectId: selectedProject,
        status: "Submitted",
        submittedBy: "Current user",
        delta: totalDraft,
        note: "Submitted from local prototype budget workbench.",
        direction: totalDraft >= 0 ? "increase" : "decrease",
      },
      ...items,
    ]);
    setDraftOpen(false);
  }

  return (
    <section className="screen-grid">
      <ScreenHeader
        eyebrow="Unified Budget Workbench"
        title="Draft, compare, approve, and rebaseline in one place"
        actions={
          <>
            <button className="secondary-button" onClick={() => setLineOpen(true)}>
              <Plus size={16} />
              Add line
            </button>
            <button className="secondary-button" onClick={() => setDraftOpen(true)}>
              <Pencil size={16} />
              Edit draft
            </button>
            <button className="primary-button" onClick={submitDraftChange}>
              <Send size={16} />
              Submit change
            </button>
          </>
        }
      />

      <div className="metric-grid three">
        <MetricCard title="Current approved" value={money(totalCurrent)} note="All visible cost items" icon={WalletCards} tone="blue" />
        <MetricCard title="Draft movement" value={money(totalDraft)} note="Open changes not yet approved" icon={totalDraft >= 0 ? ArrowUpRight : ArrowDownRight} tone={totalDraft >= 0 ? "amber" : "green"} />
        <MetricCard title="Proposed revised" value={money(totalCurrent + totalDraft)} note="If all draft changes are approved" icon={CheckCircle2} tone="green" />
      </div>

      <Panel title="Time-phased current budget" subtitle="Expandable hierarchy: Cost Category > Cost Element > Cost Detail / budget line">
        <div className="table-wrap">
          <table className="data-table budget-table">
            <thead>
              <tr>
                <th className="pin-col">Cost item</th>
                <th>Cost category</th>
                <th>Funding</th>
                <th>Budget WBS</th>
                {periods.map((period) => (
                  <th key={period}>{period}</th>
                ))}
                <th>Total</th>
                <th>Draft</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((category) => {
                const categoryRows = category.elements.flatMap((element) => element.rows);
                return (
                  <FragmentBlock key={category.code}>
                    <tr className="group-row">
                      <td className="pin-col">
                        <button className="expand-button" onClick={() => setExpanded((state) => ({ ...state, [category.code]: !state[category.code] }))}>
                          {expanded[category.code] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          {category.name}
                        </button>
                      </td>
                      <td>{category.name}</td>
                      <td></td>
                      <td></td>
                      {periods.map((_, index) => (
                        <td key={index}>{money(categoryRows.reduce((total, line) => total + line.current[index], 0))}</td>
                      ))}
                      <td>{money(categoryRows.reduce((total, line) => total + sum(line.current), 0))}</td>
                      <td><DeltaBadge value={categoryRows.reduce((total, line) => total + sum(line.draft), 0)} /></td>
                    </tr>
                    {expanded[category.code] &&
                      category.elements.map((element) => (
                        <FragmentBlock key={element.code}>
                          <tr className="subgroup-row">
                            <td className="pin-col">{element.name}</td>
                            <td>{category.name}</td>
                            <td></td>
                            <td></td>
                            {periods.map((_, index) => (
                              <td key={index}>{money(element.rows.reduce((total, line) => total + line.current[index], 0))}</td>
                            ))}
                            <td>{money(element.rows.reduce((total, line) => total + sum(line.current), 0))}</td>
                            <td><DeltaBadge value={element.rows.reduce((total, line) => total + sum(line.draft), 0)} /></td>
                          </tr>
                          {element.rows.map((line) => {
                            const detail = byCode(config.costDetails, line.costDetail);
                            return (
                              <tr key={line.id}>
                                <td className="pin-col indent">{detail?.name}</td>
                                <td>{category.name}</td>
                                <td>{byCode(config.fundingSources, line.fundingSource)?.name}</td>
                                <td>{line.budgetWbs}</td>
                                {periods.map((_, index) => (
                                  <td key={index}>{money(line.current[index])}</td>
                                ))}
                                <td>{money(sum(line.current))}</td>
                                <td><DeltaBadge value={sum(line.draft)} /></td>
                              </tr>
                            );
                          })}
                        </FragmentBlock>
                      ))}
                  </FragmentBlock>
                );
              })}
              <tr className="grand-total">
                <td className="pin-col">Grand total</td>
                <td></td>
                <td></td>
                <td></td>
                {periods.map((_, index) => <td key={index}>{money(visibleLines.reduce((total, line) => total + line.current[index], 0))}</td>)}
                <td>{money(totalCurrent)}</td>
                <td><DeltaBadge value={totalDraft} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="two-column">
        <Panel title="Budget change submissions" subtitle="Draft changes need notes before approval">
          <div className="stack-list">
            {budgetChanges.filter((item) => item.projectId === selectedProject).map((change) => (
              <div className="summary-row" key={change.id}>
                <div>
                  <strong>{change.title}</strong>
                  <span>{change.note}</span>
                </div>
                <div className="right-value">
                  <StatusPill label={change.status} tone={change.status === "Draft" ? "amber" : "blue"} />
                  <DeltaBadge value={change.delta} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Variation history" subtitle="Stock-market style indicators for rebaseline movement">
          <VariationTimeline changes={budgetChanges.filter((item) => item.projectId === selectedProject)} />
        </Panel>
      </div>

      {draftOpen && (
        <Drawer title="Draft budget change" onClose={() => setDraftOpen(false)}>
          <DraftBudgetForm config={config} lines={visibleLines} setBudgetLines={setBudgetLines} onSubmit={submitDraftChange} />
        </Drawer>
      )}

      {lineOpen && (
        <Drawer title="Add budget line" onClose={() => setLineOpen(false)}>
          <BudgetLineForm selectedProject={selectedProject} config={config} setBudgetLines={setBudgetLines} onClose={() => setLineOpen(false)} />
        </Drawer>
      )}
    </section>
  );
}

function ResourcesAndRates({ config, setConfig, resources, setResources, buyInRates, setBuyInRates, roleRates, setRoleRates }) {
  const [tab, setTab] = useState("resources");
  const [drawer, setDrawer] = useState(null);

  return (
    <section className="screen-grid">
      <ScreenHeader
        eyebrow="Resources & Rates"
        title="Master data, buy-in rates, role rate cards, and work schedules"
        actions={
          <button className="primary-button" onClick={() => setDrawer(tab)}>
            <Plus size={16} />
            Add {tab === "resources" ? "resource" : tab === "buyin" ? "buy-in rate" : tab === "roleRates" ? "role rate" : "work schedule"}
          </button>
        }
      />
      <Segmented value={tab} onChange={setTab} options={[
        ["resources", "Resources"],
        ["buyin", "Buy-in Rates"],
        ["roleRates", "Role Rate Cards"],
        ["schedules", "Work Schedules"],
      ]} />

      {tab === "resources" && (
        <Panel title="Resource master" subtitle="Rate amounts are shown as summaries from child rate records">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Default role</th>
                  <th>Work schedule</th>
                  <th>Current buy-in</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => {
                  const rate = buyInRates.find((item) => item.resourceId === resource.id && item.active);
                  return (
                    <tr key={resource.id}>
                      <td><strong>{resource.name}</strong></td>
                      <td>{resource.vendor}</td>
                      <td>{byCode(config.resourceTypes, resource.resourceType)?.name}</td>
                      <td>{byCode(config.labourRoles, resource.defaultRole)?.name}</td>
                      <td>{byCode(config.workSchedules, resource.workSchedule)?.name}</td>
                      <td>{rate ? `${money(rate.amount)} / ${byCode(config.labourRateUnits, rate.rateUnit)?.name}` : "No active rate"}</td>
                      <td><StatusPill label={resource.active ? "Active" : "Inactive"} tone={resource.active ? "green" : "muted"} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "buyin" && (
        <Panel title="Effective-dated buy-in rates" subtitle="What the organisation pays for people or vendor resources">
          <EditableRateTable rows={buyInRates} setRows={setBuyInRates} resources={resources} config={config} type="buyin" />
        </Panel>
      )}

      {tab === "roleRates" && (
        <Panel title="Labour role rate cards" subtitle="What projects are normally charged for each role">
          <EditableRateTable rows={roleRates} setRows={setRoleRates} resources={resources} config={config} type="role" />
        </Panel>
      )}

      {tab === "schedules" && (
        <Panel title="Work schedules" subtitle="Working pattern and hours used for rate conversion">
          <CrudConfigTable domain="workSchedules" config={config} setConfig={setConfig} readOnly={false} />
        </Panel>
      )}

      {drawer && (
        <Drawer title={`Add ${drawer === "resources" ? "resource" : drawer}`} onClose={() => setDrawer(null)}>
          <ResourceRateForm
            drawer={drawer}
            config={config}
            resources={resources}
            setResources={setResources}
            setConfig={setConfig}
            setBuyInRates={setBuyInRates}
            setRoleRates={setRoleRates}
            onClose={() => setDrawer(null)}
          />
        </Drawer>
      )}
    </section>
  );
}

function LabourWorkbench({ selectedProject, config, resources, buyInRates, roleRates, labourLines, setLabourLines, timesheets }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const projectLines = labourLines.filter((line) => line.projectId === selectedProject);
  const projectTimesheets = timesheets.filter((line) => line.projectId === selectedProject);

  return (
    <section className="screen-grid">
      <ScreenHeader
        eyebrow="Labour Planning"
        title="Plan by named resource, generic role, blended team, imported estimate, or fixed price"
        actions={
          <button className="primary-button" onClick={() => setDrawerOpen(true)}>
            <Plus size={16} />
            New labour line
          </button>
        }
      />

      <div className="metric-grid four">
        <MetricCard title="Recharge estimate" value={money(projectLines.reduce((total, line) => total + lineRecharge(line, config, resources, roleRates, buyInRates), 0))} note="Sell/project cost" icon={ArrowUpRight} tone="blue" />
        <MetricCard title="Buy-in estimate" value={money(projectLines.reduce((total, line) => total + lineBuyIn(line, resources, buyInRates), 0))} note="Payable/accrual evidence" icon={ArrowDownRight} tone="amber" />
        <MetricCard title="Timesheet hours" value={projectTimesheets.reduce((total, line) => total + line.hours, 0)} note="Approved or staged" icon={CalendarDays} tone="green" />
        <MetricCard title="Exceptions" value={projectTimesheets.filter((line) => line.mappingStatus === "Exception").length} note="Mapping gaps" icon={AlertTriangle} tone="red" />
      </div>

      <Panel title="Labour plan" subtitle="Cost item first, period columns for planned units and cost">
        <div className="table-wrap">
          <table className="data-table budget-table">
            <thead>
              <tr>
                <th className="pin-col">Cost item</th>
                <th>Category</th>
                <th>Method</th>
                <th>Resource / Role</th>
                <th>Rate basis</th>
                <th>Task WBS</th>
                {periods.map((period) => <th key={period}>{period}</th>)}
                <th>Recharge</th>
                <th>Buy-in</th>
              </tr>
            </thead>
            <tbody>
              {projectLines.map((line) => {
                const detail = byCode(config.costDetails, line.costDetail);
                const element = byCode(config.costElements, detail?.parent);
                const category = byCode(config.costCategories, element?.parent);
                const resource = resources.find((item) => item.id === line.resourceId);
                return (
                  <tr key={line.id}>
                    <td className="pin-col"><strong>{detail?.name}</strong></td>
                    <td>{category?.name}</td>
                    <td>{byCode(config.labourPlanningMethods, line.planningMethod)?.name}</td>
                    <td>{resource?.name || byCode(config.labourRoles, line.role)?.name || "Amount-only"}</td>
                    <td>{byCode(config.rateBasis, line.rateBasis)?.name}</td>
                    <td>{line.taskWbs}</td>
                    {line.units.map((unit, index) => <td key={index}>{line.unit === "AUD" ? money(unit) : `${unit} ${line.unit.toLowerCase()}`}</td>)}
                    <td>{money(lineRecharge(line, config, resources, roleRates, buyInRates))}</td>
                    <td>{money(lineBuyIn(line, resources, buyInRates))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <TimesheetBridge timesheets={projectTimesheets} config={config} resources={resources} />

      {drawerOpen && (
        <Drawer title="New labour line" onClose={() => setDrawerOpen(false)}>
          <LabourLineForm
            selectedProject={selectedProject}
            config={config}
            resources={resources}
            buyInRates={buyInRates}
            roleRates={roleRates}
            setLabourLines={setLabourLines}
            onClose={() => setDrawerOpen(false)}
          />
        </Drawer>
      )}
    </section>
  );
}

function SpendView({ selectedProject, config }) {
  const rows = spendSeed.filter((item) => item.projectId === selectedProject);
  return (
    <section className="screen-grid">
      <ScreenHeader eyebrow="Spend" title="SAP actuals, commitments, pending invoices, and accrual evidence" actions={<button className="primary-button"><Upload size={16} /> Upload actuals</button>} />
      <Panel title="Spend detail" subtitle="Actuals remain source-traceable and mapped to the finance hierarchy">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cost item</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Period</th>
                <th>Base amount</th>
                <th>Reporting amount</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{byCode(config.costDetails, row.costDetail)?.name}</td>
                  <td>{row.vendor}</td>
                  <td>{row.type}</td>
                  <td>{row.period}</td>
                  <td>{money(row.baseAmount)}</td>
                  <td>USD {Math.round(row.reportingAmount).toLocaleString()}</td>
                  <td>{row.source}</td>
                  <td><StatusPill label={row.status} tone={row.status === "Mapped" ? "green" : "amber"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}

function ForecastView({ selectedProject, config, budgetLines, labourLines, roleRates, buyInRates, resources }) {
  const rows = budgetLines.filter((line) => line.projectId === selectedProject);
  return (
    <section className="screen-grid">
      <ScreenHeader eyebrow="Forecast" title="Forward-looking cost control by period" actions={<button className="primary-button"><Save size={16} /> Submit forecast</button>} />
      <Panel title="Forecast workbench" subtitle="Current budget, draft movements, commitments, and labour plan combine into EAC">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cost item</th>
                <th>Current budget</th>
                <th>Draft movement</th>
                <th>Labour forecast</th>
                <th>EAC</th>
                <th>VAC</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((line) => {
                const labour = labourLines
                  .filter((lab) => lab.projectId === selectedProject && lab.costDetail === line.costDetail)
                  .reduce((total, lab) => total + lineRecharge(lab, config, resources, roleRates, buyInRates), 0);
                const current = sum(line.current);
                const eac = current + sum(line.draft) + labour * 0.12;
                return (
                  <tr key={line.id}>
                    <td>{byCode(config.costDetails, line.costDetail)?.name}</td>
                    <td>{money(current)}</td>
                    <td><DeltaBadge value={sum(line.draft)} /></td>
                    <td>{money(labour)}</td>
                    <td>{money(eac)}</td>
                    <td><DeltaBadge value={current - eac} inverse /></td>
                    <td><StatusPill label={Math.abs(current - eac) > 15000 ? "Medium" : "High"} tone={Math.abs(current - eac) > 15000 ? "amber" : "green"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}

function VarianceView({ selectedProject, config, budgetLines }) {
  const rows = budgetLines.filter((line) => line.projectId === selectedProject && sum(line.draft) !== 0);
  return (
    <section className="screen-grid">
      <ScreenHeader eyebrow="Variance" title="Explain material movement and required action" actions={<button className="primary-button"><ClipboardList size={16} /> Add explanation</button>} />
      <Panel title="Variance explanations" subtitle="Only material movement requires explanation">
        <div className="stack-list">
          {rows.map((line) => (
            <div className="variance-card" key={line.id}>
              <div>
                <strong>{byCode(config.costDetails, line.costDetail)?.name}</strong>
                <span>{line.notes}</span>
              </div>
              <DeltaBadge value={sum(line.draft)} />
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function EvmView({ selectedProject }) {
  const row = evmSeed.find((item) => item.projectId === selectedProject);
  const cpi = row.ev / row.ac;
  const spi = row.ev / row.pv;
  const vac = row.bac - row.eac;
  return (
    <section className="screen-grid">
      <ScreenHeader eyebrow="Earned Value" title="Finance-owned EVM cockpit with schedule/progress adapter boundary" />
      <div className="metric-grid four">
        <MetricCard title="CPI" value={cpi.toFixed(2)} note="EV / AC" icon={BarChart3} tone={cpi < 0.9 ? "red" : "green"} />
        <MetricCard title="SPI" value={spi.toFixed(2)} note="EV / PV" icon={GitBranch} tone={spi < 0.9 ? "red" : "green"} />
        <MetricCard title="EAC" value={money(row.eac)} note="Forecast at completion" icon={ArrowUpRight} tone="amber" />
        <MetricCard title="VAC" value={money(vac)} note="BAC - EAC" icon={vac < 0 ? ArrowDownRight : ArrowUpRight} tone={vac < 0 ? "red" : "green"} />
      </div>
      <Panel title="EVM source split" subtitle="Actual cost comes from SAP/manual actuals; PV and EV need schedule/progress basis">
        <div className="evm-grid">
          {[
            ["BAC", row.bac],
            ["PV", row.pv],
            ["EV", row.ev],
            ["AC", row.ac],
            ["EAC", row.eac],
            ["VAC", vac],
          ].map(([label, value]) => (
            <div className="evm-cell" key={label}>
              <span>{label}</span>
              <strong>{money(value)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function ConfigurationView({ config, setConfig }) {
  const [domain, setDomain] = useState("costCategories");
  const domainLabels = {
    costCategories: "Cost Categories",
    costElements: "Cost Elements",
    costDetails: "Cost Element Details",
    fundingSources: "Funding Sources",
    labourRoles: "Labour Roles",
    resourceTypes: "Resource Types",
    labourPlanningMethods: "Labour Planning Methods",
    rateBasis: "Labour Rate Basis",
    labourRateUnits: "Labour Rate Units",
    workSchedules: "Work Schedules",
    labourWorkTypes: "Labour Work Types",
    currencies: "Currencies",
  };
  return (
    <section className="screen-grid">
      <ScreenHeader eyebrow="Configuration Admin" title="Customer-variable attributes are full CRUD configuration" />
      <Segmented value={domain} onChange={setDomain} options={Object.entries(domainLabels).map(([key, label]) => [key, label])} wrap />
      <Panel title={domainLabels[domain]} subtitle="Seed values are editable in prototype state; referenced values should deactivate rather than hard delete in production">
        <CrudConfigTable domain={domain} config={config} setConfig={setConfig} />
      </Panel>
    </section>
  );
}

function TimesheetBridge({ timesheets, config, resources }) {
  return (
    <Panel title="Timesheet bridge" subtitle="Timesheet users choose project, person, Task WBS, work type, and hours; finance coding is derived">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Vendor</th>
              <th>Task WBS</th>
              <th>Budget WBS</th>
              <th>Work type</th>
              <th>Days</th>
              <th>Hours</th>
              <th>Recharge</th>
              <th>Buy-in</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((line) => {
              const resource = resources.find((item) => item.id === line.resourceId);
              return (
                <tr key={line.id}>
                  <td>{line.person}</td>
                  <td>{resource?.vendor}</td>
                  <td>{line.taskWbs}</td>
                  <td>{line.budgetWbs || "Needs mapping"}</td>
                  <td>{byCode(config.labourWorkTypes, line.workType)?.name}</td>
                  <td>{line.days}</td>
                  <td>{line.hours}</td>
                  <td>{money(line.days * line.rechargeRate)}</td>
                  <td>{money(line.days * line.buyInRate)}</td>
                  <td><StatusPill label={line.mappingStatus} tone={line.mappingStatus === "Exception" ? "red" : "green"} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function LabourLineForm({ selectedProject, config, resources, buyInRates, roleRates, setLabourLines, onClose }) {
  const [form, setForm] = useState({
    projectId: selectedProject,
    costDetail: "PM_CONTRACTOR",
    fundingSource: "CAPEX",
    planningMethod: "NAMED",
    resourceId: "res-ethan",
    role: "PM",
    rateBasis: "ROLE_CARD",
    taskWbs: "1.1",
    units: "5",
    notes: "",
  });

  const detail = byCode(config.costDetails, form.costDetail);
  const element = byCode(config.costElements, detail?.parent);
  const category = byCode(config.costCategories, element?.parent);
  const selectedResource = resources.find((item) => item.id === form.resourceId);
  const method = form.planningMethod;
  const needsResource = method === "NAMED";
  const needsRole = method === "NAMED" || method === "ROLE";
  const amountOnly = method === "IMPORTED" || method === "MANUAL" || method === "FIXED" || method === "TEAM";
  const rateOptions = config.rateBasis.filter((item) => {
    if (method === "NAMED") return ["ROLE_CARD", "BUYIN_PASS", "PROJECT_OVERRIDE", "NO_CHARGE"].includes(item.code);
    if (method === "ROLE") return ["ROLE_CARD", "BLENDED"].includes(item.code);
    if (method === "TEAM") return ["BLENDED", "MANUAL_AMOUNT", "FIXED_PRICE"].includes(item.code);
    if (method === "IMPORTED") return ["MANUAL_AMOUNT", "FIXED_PRICE"].includes(item.code);
    if (method === "MANUAL") return item.code === "MANUAL_AMOUNT";
    if (method === "FIXED") return item.code === "FIXED_PRICE";
    return true;
  });

  function update(key, value) {
    setForm((state) => {
      const next = { ...state, [key]: value };
      if (key === "resourceId") {
        const resource = resources.find((item) => item.id === value);
        next.role = resource?.defaultRole || next.role;
      }
      if (key === "planningMethod") {
        if (value === "NAMED") next.rateBasis = "ROLE_CARD";
        if (value === "ROLE") next.rateBasis = "ROLE_CARD";
        if (value === "MANUAL" || value === "IMPORTED") next.rateBasis = "MANUAL_AMOUNT";
        if (value === "FIXED") next.rateBasis = "FIXED_PRICE";
        if (value === "TEAM") next.rateBasis = "BLENDED";
      }
      return next;
    });
  }

  function saveLine() {
    const amount = Number(form.units || 0);
    setLabourLines((lines) => [
      ...lines,
      {
        id: `lab-${Date.now()}`,
        projectId: selectedProject,
        costDetail: form.costDetail,
        fundingSource: form.fundingSource,
        planningMethod: form.planningMethod,
        resourceId: needsResource ? form.resourceId : "",
        role: needsRole ? form.role : "",
        rateBasis: form.rateBasis,
        taskWbs: form.taskWbs,
        budgetWbs: scheduleWbsSeed.find((item) => item.code === form.taskWbs)?.budgetWbs || "",
        units: periods.map(() => amount),
        unit: amountOnly ? "AUD" : "DAY",
        notes: form.notes || "Created in local prototype.",
      },
    ]);
    onClose();
  }

  const roleRate = roleRates.find((item) => item.role === form.role);
  const buyRate = buyInRates.find((item) => item.resourceId === form.resourceId);

  return (
    <div className="form-stack">
      <Field label="Project">
        <select value={selectedProject} disabled>
          <option>{projects.find((item) => item.id === selectedProject)?.name}</option>
        </select>
      </Field>
      <Field label="Cost item">
        <select value={form.costDetail} onChange={(event) => update("costDetail", event.target.value)}>
          {config.costDetails.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </Field>
      <div className="derived-box">
        <span>Derived cost category</span>
        <strong>{category?.name}</strong>
        <span>Derived cost element</span>
        <strong>{element?.name}</strong>
      </div>
      <Field label="Planning method">
        <select value={form.planningMethod} onChange={(event) => update("planningMethod", event.target.value)}>
          {config.labourPlanningMethods.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </Field>
      {needsResource && (
        <Field label="Resource">
          <select value={form.resourceId} onChange={(event) => update("resourceId", event.target.value)}>
            {resources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
      )}
      {needsRole && (
        <Field label="Role">
          <select value={form.role} onChange={(event) => update("role", event.target.value)}>
            {config.labourRoles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </Field>
      )}
      {method === "TEAM" && <Field label="Team name"><input placeholder="e.g. Build partner squad" onChange={(event) => update("notes", event.target.value)} /></Field>}
      {(method === "IMPORTED" || method === "MANUAL" || method === "FIXED") && <Field label="Estimate / quote reference"><input placeholder="External estimate reference" onChange={(event) => update("notes", event.target.value)} /></Field>}
      <Field label="Rate basis">
        <select value={form.rateBasis} onChange={(event) => update("rateBasis", event.target.value)}>
          {rateOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </Field>
      <Field label={amountOnly ? "Amount per period" : "Planned days per period"}>
        <input value={form.units} onChange={(event) => update("units", event.target.value)} />
      </Field>
      <Field label="Task WBS / schedule task">
        <select value={form.taskWbs} onChange={(event) => update("taskWbs", event.target.value)}>
          {scheduleWbsSeed.map((item) => <option key={item.code} value={item.code}>{item.code} - {item.name}</option>)}
        </select>
      </Field>
      <Field label="Funding source">
        <select value={form.fundingSource} onChange={(event) => update("fundingSource", event.target.value)}>
          {config.fundingSources.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </Field>
      <div className="derived-box">
        <span>Current role rate</span>
        <strong>{roleRate ? `${money(roleRate.amount)} / ${roleRate.rateUnit.toLowerCase()}` : "Not applicable"}</strong>
        <span>Current buy-in rate</span>
        <strong>{selectedResource && buyRate ? `${money(buyRate.amount)} / ${buyRate.rateUnit.toLowerCase()}` : "Not applicable"}</strong>
      </div>
      <button className="primary-button wide" onClick={saveLine}>
        <Save size={16} />
        Add labour line
      </button>
    </div>
  );
}

function DraftBudgetForm({ config, lines, setBudgetLines, onSubmit }) {
  const [selectedLine, setSelectedLine] = useState(lines[0]?.id || "");
  const [delta, setDelta] = useState("5000");
  const [note, setNote] = useState("");
  function applyDelta() {
    setBudgetLines((items) =>
      items.map((line) =>
        line.id === selectedLine
          ? { ...line, draft: line.draft.map((value, index) => value + (index >= 2 ? Number(delta || 0) : 0)), notes: note || line.notes }
          : line,
      ),
    );
  }
  return (
    <div className="form-stack">
      <Field label="Budget line">
        <select value={selectedLine} onChange={(event) => setSelectedLine(event.target.value)}>
          {lines.map((line) => <option key={line.id} value={line.id}>{byCode(config.costDetails, line.costDetail)?.name}</option>)}
        </select>
      </Field>
      <Field label="Monthly change from Sep 26">
        <input value={delta} onChange={(event) => setDelta(event.target.value)} />
      </Field>
      <Field label="Submission notes">
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain why this budget movement is required" />
      </Field>
      <button className="secondary-button wide" onClick={applyDelta}>
        <Save size={16} />
        Apply to draft
      </button>
      <button className="primary-button wide" onClick={onSubmit}>
        <Send size={16} />
        Submit for approval
      </button>
    </div>
  );
}

function BudgetLineForm({ selectedProject, config, setBudgetLines, onClose }) {
  const [form, setForm] = useState({
    costDetail: "PM_CONTRACTOR",
    fundingSource: "CAPEX",
    budgetWbs: "B-NEW",
    sapWbs: "SAP-NEW",
    owner: "Current user",
    monthlyAmount: "10000",
    notes: "",
  });
  const detail = byCode(config.costDetails, form.costDetail);
  const element = byCode(config.costElements, detail?.parent);
  const category = byCode(config.costCategories, element?.parent);

  function update(key, value) {
    setForm((state) => ({ ...state, [key]: value }));
  }

  function saveLine() {
    const amount = Number(form.monthlyAmount || 0);
    setBudgetLines((lines) => [
      ...lines,
      {
        id: `bud-${Date.now()}`,
        projectId: selectedProject,
        costDetail: form.costDetail,
        fundingSource: form.fundingSource,
        budgetWbs: form.budgetWbs,
        sapWbs: form.sapWbs,
        owner: form.owner,
        status: "Draft change",
        baseline: 0,
        current: periods.map(() => amount),
        draft: periods.map(() => 0),
        notes: form.notes || "Created in local prototype.",
      },
    ]);
    onClose();
  }

  return (
    <div className="form-stack">
      <Field label="Project">
        <select value={selectedProject} disabled>
          <option>{projects.find((item) => item.id === selectedProject)?.name}</option>
        </select>
      </Field>
      <Field label="Cost item">
        <select value={form.costDetail} onChange={(event) => update("costDetail", event.target.value)}>
          {config.costDetails.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </Field>
      <div className="derived-box">
        <span>Derived cost category</span>
        <strong>{category?.name}</strong>
        <span>Derived cost element</span>
        <strong>{element?.name}</strong>
      </div>
      <Field label="Funding source">
        <select value={form.fundingSource} onChange={(event) => update("fundingSource", event.target.value)}>
          {config.fundingSources.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </Field>
      <Field label="Budget WBS"><input value={form.budgetWbs} onChange={(event) => update("budgetWbs", event.target.value)} /></Field>
      <Field label="SAP/source WBS"><input value={form.sapWbs} onChange={(event) => update("sapWbs", event.target.value)} /></Field>
      <Field label="Monthly amount"><input type="number" value={form.monthlyAmount} onChange={(event) => update("monthlyAmount", event.target.value)} /></Field>
      <Field label="Notes"><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} /></Field>
      <button className="primary-button wide" onClick={saveLine}>
        <Save size={16} />
        Add budget line
      </button>
    </div>
  );
}

function ResourceRateForm({ drawer, config, resources, setResources, setConfig, setBuyInRates, setRoleRates, onClose }) {
  const [form, setForm] = useState({});
  function update(key, value) {
    setForm((state) => ({ ...state, [key]: value }));
  }
  function save() {
    if (drawer === "resources") {
      setResources((rows) => [
        ...rows,
        {
          id: `res-${Date.now()}`,
          name: form.name || "New Resource",
          vendor: form.vendor || "New Vendor",
          resourceType: form.resourceType || "CON",
          defaultRole: form.defaultRole || "BA",
          workSchedule: form.workSchedule || "5X8",
          defaultCostCentre: form.costCentre || "",
          currency: "AUD",
          active: true,
        },
      ]);
    }
    if (drawer === "buyin") {
      setBuyInRates((rows) => [
        ...rows,
        {
          id: `buy-${Date.now()}`,
          resourceId: form.resourceId || resources[0]?.id,
          rateType: "buy_in",
          amount: Number(form.amount || 0),
          currency: form.currency || "AUD",
          rateUnit: form.rateUnit || "DAY",
          effectiveFrom: form.effectiveFrom || "2026-07-01",
          effectiveTo: form.effectiveTo || "2026-12-31",
          reference: form.reference || "Prototype entry",
          active: true,
        },
      ]);
    }
    if (drawer === "roleRates") {
      setRoleRates((rows) => [
        ...rows,
        {
          id: `role-${Date.now()}`,
          role: form.role || "BA",
          card: form.card || "Standard",
          amount: Number(form.amount || 0),
          currency: form.currency || "AUD",
          rateUnit: form.rateUnit || "DAY",
          effectiveFrom: form.effectiveFrom || "2026-07-01",
          effectiveTo: form.effectiveTo || "2026-12-31",
          scope: form.scope || "Tenant",
          active: true,
        },
      ]);
    }
    if (drawer === "schedules") {
      setConfig((state) => ({
        ...state,
        workSchedules: [
          ...state.workSchedules,
          {
            code: (form.code || `SCH${state.workSchedules.length + 1}`).toUpperCase(),
            name: form.name || "New Work Schedule",
            description: form.description || "Prototype work schedule",
            pattern: form.pattern || "Mon-Fri",
            daysPerWeek: Number(form.daysPerWeek || 5),
            hoursPerDay: Number(form.hoursPerDay || 8),
            active: true,
          },
        ],
      }));
    }
    onClose();
  }
  return (
    <div className="form-stack">
      {drawer === "resources" && (
        <>
          <Field label="Name"><input onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Vendor"><input onChange={(event) => update("vendor", event.target.value)} /></Field>
          <Field label="Resource type"><select onChange={(event) => update("resourceType", event.target.value)}>{config.resourceTypes.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
          <Field label="Default role"><select onChange={(event) => update("defaultRole", event.target.value)}>{config.labourRoles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
          <Field label="Work schedule"><select onChange={(event) => update("workSchedule", event.target.value)}>{config.workSchedules.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
        </>
      )}
      {drawer === "buyin" && (
        <>
          <Field label="Resource"><select onChange={(event) => update("resourceId", event.target.value)}>{resources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <RateInputs config={config} update={update} />
        </>
      )}
      {drawer === "roleRates" && (
        <>
          <Field label="Role"><select onChange={(event) => update("role", event.target.value)}>{config.labourRoles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
          <Field label="Rate card"><input placeholder="Standard" onChange={(event) => update("card", event.target.value)} /></Field>
          <RateInputs config={config} update={update} />
        </>
      )}
      {drawer === "schedules" && (
        <>
          <Field label="Code"><input onChange={(event) => update("code", event.target.value)} /></Field>
          <Field label="Name"><input onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Description"><textarea onChange={(event) => update("description", event.target.value)} /></Field>
          <Field label="Working pattern"><input placeholder="e.g. Mon-Fri" onChange={(event) => update("pattern", event.target.value)} /></Field>
          <Field label="Workdays per week"><input type="number" placeholder="5" onChange={(event) => update("daysPerWeek", event.target.value)} /></Field>
          <Field label="Hours per day"><input type="number" placeholder="8" onChange={(event) => update("hoursPerDay", event.target.value)} /></Field>
        </>
      )}
      <button className="primary-button wide" onClick={save}>
        <Save size={16} />
        Save
      </button>
    </div>
  );
}

function RateInputs({ config, update }) {
  return (
    <>
      <Field label="Rate amount"><input type="number" onChange={(event) => update("amount", event.target.value)} /></Field>
      <Field label="Currency"><select onChange={(event) => update("currency", event.target.value)}>{config.currencies.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
      <Field label="Rate unit"><select onChange={(event) => update("rateUnit", event.target.value)}>{config.labourRateUnits.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
      <Field label="Effective from"><input type="date" onChange={(event) => update("effectiveFrom", event.target.value)} /></Field>
      <Field label="Effective to"><input type="date" onChange={(event) => update("effectiveTo", event.target.value)} /></Field>
    </>
  );
}

function EditableRateTable({ rows, setRows, resources, config, type }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{type === "buyin" ? "Resource" : "Role"}</th>
            <th>Rate card / type</th>
            <th>Rate</th>
            <th>Currency</th>
            <th>Unit</th>
            <th>Effective</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{type === "buyin" ? resources.find((item) => item.id === row.resourceId)?.name : byCode(config.labourRoles, row.role)?.name}</td>
              <td>{type === "buyin" ? row.rateType : row.card}</td>
              <td>{money(row.amount)}</td>
              <td>{row.currency}</td>
              <td>{byCode(config.labourRateUnits, row.rateUnit)?.name}</td>
              <td>{shortDate(row.effectiveFrom)} - {shortDate(row.effectiveTo)}</td>
              <td><StatusPill label={row.active ? "Active" : "Inactive"} tone={row.active ? "green" : "muted"} /></td>
              <td>
                <button className="ghost-icon" onClick={() => setRows((items) => items.map((item) => item.id === row.id ? { ...item, active: !item.active } : item))}>
                  <Pencil size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CrudConfigTable({ domain, config, setConfig, readOnly = false }) {
  const rows = config[domain] || [];
  const [draft, setDraft] = useState({ code: "", name: "", description: "" });
  function addRow() {
    if (readOnly || !setConfig || !draft.code || !draft.name) return;
    setConfig((state) => ({
      ...state,
      [domain]: [...state[domain], { ...draft, active: true }],
    }));
    setDraft({ code: "", name: "", description: "" });
  }
  function toggle(code) {
    if (readOnly || !setConfig) return;
    setConfig((state) => ({
      ...state,
      [domain]: state[domain].map((item) => (item.code === code ? { ...item, active: !item.active } : item)),
    }));
  }
  return (
    <div className="config-grid">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              {"parent" in (rows[0] || {}) && <th>Parent</th>}
              {"hoursPerDay" in (rows[0] || {}) && <th>Hours/day</th>}
              {"daysPerWeek" in (rows[0] || {}) && <th>Days/week</th>}
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code}>
                <td><strong>{row.code}</strong></td>
                <td>{row.name}</td>
                <td>{row.description}</td>
                {"parent" in row && <td>{resolveParentLabel(domain, row.parent, config)}</td>}
                {"hoursPerDay" in row && <td>{row.hoursPerDay}</td>}
                {"daysPerWeek" in row && <td>{row.daysPerWeek}</td>}
                <td><StatusPill label={row.active ? "Active" : "Inactive"} tone={row.active ? "green" : "muted"} /></td>
                <td>
                  <button className="ghost-icon" onClick={() => toggle(row.code)}>
                    {row.active ? <Trash2 size={15} /> : <CheckCircle2 size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && setConfig && (
        <div className="inline-form">
          <h3>Add configuration value</h3>
          <input placeholder="Code" value={draft.code} onChange={(event) => setDraft((state) => ({ ...state, code: event.target.value.toUpperCase() }))} />
          <input placeholder="Name" value={draft.name} onChange={(event) => setDraft((state) => ({ ...state, name: event.target.value }))} />
          <textarea placeholder="Description" value={draft.description} onChange={(event) => setDraft((state) => ({ ...state, description: event.target.value }))} />
          <button className="primary-button wide" onClick={addRow}><Plus size={16} /> Add value</button>
        </div>
      )}
    </div>
  );
}

function resolveParentLabel(domain, parent, config) {
  if (domain === "costElements") return byCode(config.costCategories, parent)?.name || parent;
  if (domain === "costDetails") return byCode(config.costElements, parent)?.name || parent;
  return parent;
}

function lineRecharge(line, config, resources, roleRates) {
  if (line.rateBasis === "FIXED_PRICE" || line.rateBasis === "MANUAL_AMOUNT") return sum(line.units);
  if (line.rateBasis === "NO_CHARGE") return 0;
  const rate = roleRates.find((item) => item.role === line.role)?.amount || 0;
  return sum(line.units) * rate;
}

function lineBuyIn(line, resources, buyInRates) {
  if (!line.resourceId || line.rateBasis === "FIXED_PRICE" || line.rateBasis === "MANUAL_AMOUNT") return 0;
  const rate = buyInRates.find((item) => item.resourceId === line.resourceId)?.amount || 0;
  return sum(line.units) * rate;
}

function VariationTimeline({ changes }) {
  return (
    <div className="timeline">
      {changes.map((change) => (
        <div className="timeline-item" key={change.id}>
          <div className={`timeline-dot ${change.delta >= 0 ? "up" : "down"}`}>{change.delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</div>
          <div>
            <strong>{change.title}</strong>
            <span>{change.note}</span>
          </div>
          <DeltaBadge value={change.delta} />
        </div>
      ))}
    </div>
  );
}

function MetricCard({ title, value, note, icon: Icon, tone = "blue" }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-icon"><Icon size={19} /></div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </div>
  );
}

function MetricInline({ label, value }) {
  return (
    <div className="metric-inline">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ScreenHeader({ eyebrow, title, actions }) {
  return (
    <div className="screen-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {actions && <div className="screen-actions">{actions}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Drawer({ title, onClose, children }) {
  return (
    <div className="drawer-backdrop">
      <aside className="drawer">
        <div className="drawer-header">
          <h2>{title}</h2>
          <button className="ghost-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function Segmented({ value, onChange, options, wrap = false }) {
  return (
    <div className={`segmented ${wrap ? "wrap" : ""}`}>
      {options.map(([key, label]) => (
        <button key={key} className={value === key ? "active" : ""} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function StatusPill({ label, tone = "blue" }) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}

function DeltaBadge({ value, inverse = false }) {
  const positive = inverse ? value > 0 : value >= 0;
  const zero = Number(value || 0) === 0;
  return (
    <span className={`delta-badge ${zero ? "zero" : positive ? "positive" : "negative"}`}>
      {!zero && (positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)}
      {money(value)}
    </span>
  );
}

function CheckItem({ done, label, detail }) {
  return (
    <div className="check-item">
      <div className={`check-dot ${done ? "done" : ""}`}>{done ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}</div>
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function FragmentBlock({ children }) {
  return children;
}

export default App;
