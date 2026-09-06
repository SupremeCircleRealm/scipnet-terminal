/**
 * STYLE REMINDER — 黑曜指揮台：將不對稱情報布局、近黑綠表面、鈾光綠訊號與等寬識別碼
 * 用於所有元件；互動應快、準、可追溯，避免一般置中卡片牆與過度圓角。
 */
import { useMemo, useState } from "react";
import {
  Activity,
  Archive,
  ArrowUpRight,
  BellRing,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Command,
  Crosshair,
  Database,
  FileSearch,
  FileText,
  Fingerprint,
  Globe2,
  Grid2X2,
  Inbox,
  LockKeyhole,
  Mail,
  MapPinned,
  Menu,
  MonitorDot,
  Network,
  Radar,
  RadioTower,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  Terminal,
  Timer,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

type ViewName = "overview" | "archives" | "command" | "monitor" | "comms" | "identity";

const HERO_IMAGE = "/manus-storage/scipnet-hero-command-deck_c2adfabb.jpg";
const TELEMETRY_IMAGE = "/manus-storage/scipnet-telemetry-grid_a6fe8354.jpg";
const ARCHIVE_IMAGE = "/manus-storage/scipnet-containment-archive_317a8b5e.jpg";
const LOGO_IMAGE = "/manus-storage/scipnet-logo-mark_2c3d1532.png";

const navigation: Array<{ id: ViewName; label: string; code: string; icon: typeof Terminal }> = [
  { id: "overview", label: "中央終端", code: "01", icon: Terminal },
  { id: "archives", label: "授權檔案", code: "02", icon: Archive },
  { id: "command", label: "特遣指揮", code: "03", icon: Command },
  { id: "monitor", label: "監控追蹤", code: "04", icon: Radar },
  { id: "comms", label: "安全通訊", code: "05", icon: RadioTower },
  { id: "identity", label: "身分憑證", code: "06", icon: Fingerprint },
];

const archiveRecords = [
  { id: "SCP-CN-2000", level: "EUCLID", levelTone: "warn", title: "遁入幽冥", summary: "該物品呈現為一面無源反射鏡；任何試圖記錄其表面的設備均會出現固定 17 秒的時間缺口。", state: "收容穩定", time: "今日 08:40", branch: "CN" },
  { id: "SCP-CN-1769", level: "KETER", levelTone: "critical", title: "上海舊影", summary: "收容區內的街景投影會在每個農曆初一增加一條不存在的道路。", state: "監視中", time: "昨日 22:16", branch: "CN" },
  { id: "SCP-CN-091", level: "SAFE", levelTone: "safe", title: "九龍之書", summary: "一冊以未知方言書寫的活頁檔案；其索引會對應現實中新增的異常登記。", state: "文檔修訂", time: "09/02 14:02", branch: "CN" },
  { id: "SCP-CN-554", level: "EUCLID", levelTone: "warn", title: "歸零車站", summary: "位於城市軌道末端的站台，其抵達列車不存在於任何營運記錄中。", state: "運輸限制", time: "09/01 06:51", branch: "CN" },
  { id: "SCP-CN-3140", level: "CN INDEX", levelTone: "neutral", title: "烈火焚心", summary: "來自 CN 分站索引的已授權摘要，完整收容文檔需經受控閱讀終端驗證。", state: "已索引", time: "已匯入", branch: "CN" },
  { id: "SCP-CN-4250", level: "CN INDEX", levelTone: "neutral", title: "虞美人的花語是「遺忘」", summary: "來自 CN 分站索引的已授權摘要，保留原始編號與收容資訊關聯。", state: "已索引", time: "已匯入", branch: "CN" },
];

const eventFeed = [
  { title: "圍欄完整性下降", code: "EVT-73B1 · Site-CN-19 / B-14", time: "09:42:18", severity: "中", tone: "warn" },
  { title: "異常頻譜匹配", code: "EVT-73AF · 杭州觀察節點", time: "09:28:05", severity: "高", tone: "critical" },
  { title: "失聯追蹤器重新上線", code: "EVT-739C · 中原低軌陣列", time: "08:55:41", severity: "低", tone: "safe" },
];

const units = [
  { code: "MTF-乙-11", name: "九尾狐", state: "待命", role: "設施響應／內部收容失效", ready: 92, members: 18, tone: "safe" },
  { code: "MTF-庚-03", name: "青竹", state: "部署中", role: "華北異常信號偵測", ready: 76, members: 11, tone: "warn" },
  { code: "MTF-辛-07", name: "山海經", state: "待命", role: "民俗與敘事型異常", ready: 84, members: 9, tone: "safe" },
];

const inbox = [
  { sender: "o5-council@scip.net", subject: "O5 指令：CN-1769 觀察優先級上調", copy: "自 00:00 起執行三重敘事隔離協議。", time: "08:12", tag: "行動", unread: true },
  { sender: "site-cn19.ops@scip.net", subject: "收容區 B-14／狀態簡報", copy: "圍欄維修機器人已到達目標區域。", time: "昨日", tag: "通告", unread: true },
  { sender: "temporal-lab@scip.net", subject: "α-27 鏡像時間線偏移報告", copy: "存在 47.2ms 的穩定性偏差。", time: "09/02", tag: "加密", unread: false },
];

function ActionLink({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button className={`action-link ${className}`} onClick={onClick}>{children}<ChevronRight size={15} strokeWidth={2.5} /></button>;
}

function StatusPill({ label, tone = "safe" }: { label: string; tone?: string }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{label}</span>;
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div className="section-kicker"><span>//</span>{children}<div className="kicker-rule" /></div>;
}

function Metric({ label, value, detail, tone = "lime" }: { label: string; value: string; detail: string; tone?: "lime" | "amber" | "red" }) {
  return <div className="metric-cell">
    <span className="metric-label">{label}</span>
    <div className={`metric-value ${tone}`}>{value}</div>
    <span className="metric-detail">{detail}</span>
  </div>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewName>(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view") as ViewName | null;
    return requestedView && navigation.some((item) => item.id === requestedView) ? requestedView : "overview";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveBranch, setArchiveBranch] = useState("全部");
  const [monitorFilter, setMonitorFilter] = useState("全部");
  const [isLocked, setIsLocked] = useState(true);

  const records = useMemo(() => archiveRecords.filter((record) => {
    const q = archiveQuery.trim().toLowerCase();
    const matchesQuery = !q || [record.id, record.title, record.level, record.summary].join(" ").toLowerCase().includes(q);
    const matchesBranch = archiveBranch === "全部" || record.branch === archiveBranch;
    return matchesQuery && matchesBranch;
  }), [archiveBranch, archiveQuery]);

  const changeView = (view: ViewName) => {
    setActiveView(view);
    setMenuOpen(false);
    const url = new URL(window.location.href);
    view === "overview" ? url.searchParams.delete("view") : url.searchParams.set("view", view);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const notify = (message: string, description?: string) => toast(message, { description });

  const renderOverview = () => <>
    <section className="hero-panel" style={{ backgroundImage: `linear-gradient(90deg, rgba(4, 12, 8, .97) 0%, rgba(4, 12, 8, .86) 44%, rgba(4, 12, 8, .22) 100%), url(${HERO_IMAGE})` }}>
      <div className="hero-copy">
        <div className="eyebrow"><Signal size={14} /> CENTRAL OPERATIONS <span className="blink-dot" /></div>
        <p className="hero-pretitle">SCIPNET // 基金會終端 V2</p>
        <h1>將異常訊號<br /><em>留在可見範圍。</em></h1>
        <p className="hero-description">跨站檔案、戰術指令與多層追蹤，已收斂於同一個受控工作區。身份驗證完成，等待研究員覆核。</p>
        <div className="hero-actions">
          <button className="primary-action" onClick={() => changeView("monitor")}><Radar size={17} />開啟監控序列</button>
          <button className="ghost-action" onClick={() => changeView("archives")}><FileSearch size={16} />檢索授權檔案</button>
        </div>
      </div>
      <div className="hero-side-data">
        <div className="hero-installed-seal"><img src={LOGO_IMAGE} alt="SCIPNET 系統印記" /><div><span>INSTALLED SYSTEM</span><strong>SCIPNET</strong><small>// TERMINAL V2</small></div></div>
        <StatusPill label="連線已驗證" />
        <div className="side-data-time"><span>CN · 現在時間</span><strong>09:44:06</strong></div>
        <div className="hero-side-anchors"><div><span>AUTH /</span><b>CL. 4</b></div><div><span>NODE /</span><b>CN-19-B</b></div></div>
        <div className="side-data-line"><span>LINK</span><span className="secure-word">SECURE</span></div>
      </div>
      <div className="hero-footer"><span>NETWORK: CN-ROUTED</span><span>ENCRYPTION: LEVEL 4</span><span>UPTIME: 99.984%</span></div>
    </section>

    <section className="metrics-bar reveal-stagger">
      <Metric label="全球節點" value="287" detail="+3 節點已接入" />
      <Metric label="活躍異常" value="046" detail="監控序列執行中" />
      <Metric label="警戒指數" value="02" detail="低風險 · 需覆核" tone="amber" />
      <Metric label="加密通訊" value="2" detail="未讀優先訊息" tone="red" />
    </section>

    <section className="overview-grid">
      <div className="focus-column">
        <SectionKicker>優先行動</SectionKicker>
        <article className="mission-card">
          <div className="mission-header"><span className="mission-id">OP / B-14</span><StatusPill label="窗口開啟" tone="warn" /></div>
          <h2>圍欄完整性下降</h2>
          <p>Site-CN-19 的 B-14 區域偵測到非標準回聲。部署窗口將於 <strong>00:14:29</strong> 後關閉，建議啟動具內部收容協議的戰術分隊。</p>
          <div className="mission-timing"><Timer size={15} /><span>回應序列已送交特遣指揮</span><span className="pulse-line" /></div>
          <ActionLink onClick={() => changeView("command")}>載入行動簡報</ActionLink>
        </article>

        <SectionKicker>即時事件流</SectionKicker>
        <div className="event-stack">
          {eventFeed.map((event) => <button key={event.code} className="event-row" onClick={() => changeView("monitor")}>
            <span className={`event-severity ${event.tone}`} />
            <span className="event-main"><strong>{event.title}</strong><small>{event.code}</small></span>
            <span className="event-meta"><span>{event.time}</span><b>{event.severity}</b></span>
            <ArrowUpRight size={16} />
          </button>)}
        </div>
      </div>

      <div className="quick-column">
        <SectionKicker>快速存取</SectionKicker>
        <div className="quick-grid">
          <button className="quick-card archive-q" onClick={() => changeView("archives")}><Archive size={20} /><span className="quick-code">ARC / CN-01</span><strong>CN 分站檔案</strong><small>4,218 已索引文檔</small><ArrowUpRight size={15} /></button>
          <button className="quick-card command-q" onClick={() => changeView("command")}><Command size={20} /><span className="quick-code">OPS / MTF-03</span><strong>特遣隊指揮</strong><small>03 支單位在線</small><ArrowUpRight size={15} /></button>
          <button className="quick-card monitor-q" onClick={() => changeView("monitor")}><Crosshair size={20} /><span className="quick-code">TRK / B-14</span><strong>監控追蹤</strong><small>01 項即時覆核</small><ArrowUpRight size={15} /></button>
          <button className="quick-card comms-q" onClick={() => changeView("comms")}><RadioTower size={20} /><span className="quick-code">COM / L4</span><strong>頻道通訊</strong><small>雲端同步受控中</small><ArrowUpRight size={15} /></button>
        </div>
        <div className="archive-teaser" style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 14, 9, .92), rgba(5, 14, 9, .18)), url(${ARCHIVE_IMAGE})` }}>
          <div><span>PRIORITY ARCHIVE</span><h3>SCP-CN-1769<br />上海舊影</h3><p>已偵測到新的街景回聲。</p></div>
          <ActionLink onClick={() => changeView("archives")}>展開摘要</ActionLink>
        </div>
      </div>
    </section>
  </>;

  const renderArchives = () => <>
    <section className="view-heading archives-heading">
      <div><div className="eyebrow"><Archive size={14} /> CN BRANCH // ARCHIVE ACCESS</div><h1>授權檔案 <span>／CN 分站</span></h1><p>全球分站異常項目索引庫。每份摘要皆保留原始編號、分級與受控閱讀狀態。</p></div>
      <div className="clearance-display"><span>目前許可</span><strong>CL. 4</strong><small>已驗證</small></div>
    </section>
    <section className="branch-entry-grid">
      {[{ code: "SCP-CN", label: "中國分部", desc: "中文分站 · SCP-CN 系列 I–V", count: "282" }, { code: "SCP-ZH", label: "繁中分部", desc: "繁中分站 · SCP-ZH 系列檔案", count: "992" }, { code: "SCP-JP", label: "日本分部", desc: "日本分站 · SCP-JP 系列 I–V / Lost", count: "089" }, { code: "SCP-EN", label: "主站", desc: "English Main Site · SCP Series 1–10 / Lost", count: "1999" }].map((branch) => <button className="branch-entry" key={branch.code} onClick={() => { setArchiveBranch(branch.code === "SCP-CN" ? "CN" : "全部"); notify(`${branch.label}入口已選取`, `可讀索引：${branch.count} 筆`); }}><span>{branch.code}</span><strong>{branch.label}</strong><small>{branch.desc}</small><b>{branch.count} <ArrowUpRight size={14} /></b></button>)}
    </section>
    <section className="archive-controls">
      <div className="search-box"><Search size={17} /><input aria-label="搜尋檔案" value={archiveQuery} onChange={(event) => setArchiveQuery(event.target.value)} placeholder="檢索編號、項目或分級" /><kbd>⌘ K</kbd></div>
      <div className="filter-row"><span><SlidersHorizontal size={15} />索引篩選</span>{["全部", "CN", "ZH", "JP", "EN"].map((filter) => <button key={filter} onClick={() => setArchiveBranch(filter)} className={archiveBranch === filter ? "selected" : ""}>{filter === "全部" ? "全部 5357" : `${filter} ${filter === "CN" ? "282" : filter === "ZH" ? "992" : filter === "JP" ? "89" : "1999"}`}</button>)}</div>
    </section>
    <SectionKicker>授權文檔 <span className="result-count">{records.length} RECORDS</span></SectionKicker>
    <section className="document-list">
      {records.map((record) => <article className="document-card" key={record.id}>
        <div className="document-index"><span>{record.id}</span><b className={`level-badge ${record.levelTone}`}>{record.level}</b></div>
        <div className="document-copy"><h2>{record.title}</h2><p>{record.summary}</p></div>
        <div className="document-meta"><span>狀態：<b>{record.state}</b></span><time>{record.time}</time><ActionLink onClick={() => notify(`${record.id} 已加入受控佇列`, "此為展示型本地索引，不連線至受控原文。")}>讀取摘要</ActionLink></div>
      </article>)}
      {!records.length && <div className="no-results"><FileSearch size={30} /><strong>沒有符合目前篩選的授權文檔</strong><button onClick={() => { setArchiveQuery(""); setArchiveBranch("全部"); }}>重設檢索條件</button></div>}
    </section>
  </>;

  const renderCommand = () => <>
    <section className="view-heading command-heading">
      <div><div className="eyebrow"><Command size={14} /> COMMAND // MTF NETWORK</div><h1>特遣指揮 <span>／3 UNITS</span></h1><p>將受控任務、可部署人員與單位整備度維持在單一行動視野中。</p></div>
      <div className="command-code"><span>活動任務</span><strong>B-14</strong><small>WINDOW OPEN</small></div>
    </section>
    <section className="command-brief">
      <div className="brief-gridline" />
      <div className="brief-copy"><span>行動簡報</span><h2>B-14 圍欄完整性下降</h2><p>分派窗口將在 <strong>00:14:29</strong> 後關閉。建議部署具備內部收容協議的戰術分隊。</p><ActionLink onClick={() => notify("行動簡報已載入", "B-14 受控分派窗口仍在開啟中。")}>載入行動簡報</ActionLink></div>
      <div className="command-metrics"><Metric label="可部署人員" value="38" detail="跨單位可調度" /><Metric label="行動中" value="11" detail="當前任務佔用" /><Metric label="待命載具" value="06" detail="地面與空中" tone="amber" /></div>
    </section>
    <SectionKicker>戰術單位狀態</SectionKicker>
    <section className="unit-stack">{units.map((unit) => <article className="unit-card" key={unit.code}>
      <div className="unit-mark"><ShieldCheck size={22} /><span>{unit.code}</span></div>
      <div className="unit-copy"><h2>{unit.name}</h2><p>{unit.role}</p></div>
      <StatusPill label={unit.state} tone={unit.tone} />
      <div className="readiness"><div><span>READY</span><strong>{unit.ready}%</strong></div><div className="progress-track"><span className={unit.tone} style={{ width: `${unit.ready}%` }} /></div><small>有效人員 {unit.members}</small></div>
      <ActionLink onClick={() => notify(`已開啟 ${unit.code} 頻道`, "頻道為展示環境，未建立實際通訊連線。")}>開啟頻道</ActionLink>
    </article>)}</section>
    <button className="command-cta" onClick={() => changeView("comms")}><RadioTower size={20} /><span><strong>建立緊急指揮頻道</strong><small>所有分派與變更均會寫入受控事件記錄</small></span><ArrowUpRight size={18} /></button>
  </>;

  const renderMonitor = () => <>
    <section className="view-heading monitor-heading">
      <div><div className="eyebrow"><MonitorDot size={14} /> OBSERVATION // MULTI-LAYER GRID</div><h1>監控追蹤 <span>／LIVE 2.5s</span></h1><p>CN GRID 已接入實體遙測、圍欄事件與低軌定位資料。</p></div>
      <StatusPill label="連線穩定" />
    </section>
    <section className="monitor-tabs"><button className="active"><Radar size={16} />監控追蹤</button><button onClick={() => notify("維度與時間層已鎖定", "此展示環境不啟用時間線調閱。")}>維度與時間</button></section>
    <section className="radar-frame" style={{ backgroundImage: `linear-gradient(90deg, rgba(4, 16, 10, .84), rgba(4, 16, 10, .30)), url(${TELEMETRY_IMAGE})` }}>
      <div className="radar-head"><div><span>CN GRID / ENTITY TELEMETRY</span><h2>實時異常位置</h2></div><StatusPill label="5 TARGETS" /></div>
      <div className="grid-lines" /><div className="radar-orbit orbit-a" /><div className="radar-orbit orbit-b" />
      <button className="radar-target trk-231" onClick={() => notify("TRK-231 已選取", "訊號不穩定，等待座標回報。")}><CircleDot size={17} /><span>TRK-231</span></button>
      <button className="radar-target trk-044" onClick={() => notify("TRK-044 已選取")}><CircleDot size={17} /><span>TRK-044</span></button>
      <button className="radar-target trk-019 alert" onClick={() => notify("TRK-019 已選取", "目前對應 SCP-CN-1769。") }><CircleDot size={18} /><span>TRK-019</span></button>
      <button className="radar-target trk-108" onClick={() => notify("TRK-108 已選取")}><CircleDot size={17} /><span>TRK-108</span></button>
      <button className="radar-target trk-302" onClick={() => notify("TRK-302 已選取")}><CircleDot size={17} /><span>TRK-302</span></button>
      <div className="radar-coordinates"><span>N 31°</span><span>E 118°</span><strong>LATENCY 048ms · ENCRYPTED</strong></div>
    </section>
    <section className="monitor-filters">{["全部", "警戒", "追蹤中", "已隔離"].map((filter) => <button key={filter} onClick={() => setMonitorFilter(filter)} className={monitorFilter === filter ? "active" : ""}>{filter}</button>)}</section>
    <section className="monitor-summary"><Metric label="在線節點" value="287" detail="CN GRID 正常" /><Metric label="跟蹤目標" value="05" detail="座標已加密" /><Metric label="高優先級" value="01" detail="需要立刻覆核" tone="amber" /></section>
    <section className="selected-target"><div className="target-label"><Crosshair size={19} /><span>SELECTED TARGET / TRK-019</span></div><div className="target-main"><h2>SCP-CN-1769</h2><StatusPill label="警戒" tone="critical" /></div><p>Site-CN-19 / B-14 · 實體 · 97.4 MHz</p><p className="target-description">非標準街景回聲正在圍欄內移動；建議保持三重敘事隔離。</p><div className="target-footer"><span>LAST SEEN <strong>00:00:14 前</strong></span><ActionLink onClick={() => notify("TRK-019 鎖定請求已寫入佇列")}>鎖定目標</ActionLink></div></section>
    <SectionKicker>異常事件隊列</SectionKicker><div className="event-stack monitor-events">{eventFeed.map((event) => <div className="event-row" key={event.code}><span className={`event-severity ${event.tone}`} /><span className="event-main"><strong>{event.title}</strong><small>{event.code}</small></span><span className="event-meta"><span>{event.time}</span><b>{event.severity}</b></span></div>)}</div>
  </>;

  const renderComms = () => <>
    <section className="view-heading comms-heading"><div><div className="eyebrow"><RadioTower size={14} /> SCIPNET // SECURE COMMS</div><h1>安全通訊 <span>／SYNC: LIVE</span></h1><p>雲端同步、多裝置即時交流。所有工作頻道採端到端加密與等級 4 保留策略。</p></div><StatusPill label="SYNC: LIVE" /></section>
    <section className="comms-layout">
      <aside className="channel-rail"><div className="rail-head"><span>頻道 / CHANNELS</span><button onClick={() => notify("頻道管理已鎖定", "目前帳號僅能讀取既有工作頻道。")}>＋</button></div>{["# cn-ops-b14", "# observation-1769", "# archive-index", "# temporal-lab"].map((channel, index) => <button key={channel} className={index === 0 ? "active" : ""} onClick={() => notify(`${channel} 已選取`, "這是本地展示工作區。")}>{channel}<span>{index === 0 ? "3" : ""}</span></button>)}<div className="channel-security"><LockKeyhole size={16} /><span>所有頻道皆已加密</span></div></aside>
      <div className="message-stage"><div className="stage-heading"><div><span>頻道：CN-OPS-B14</span><h2>圍欄監測協調</h2></div><StatusPill label="4 成員" /></div><div className="message-thread"><div className="message system"><span>系統</span><p>通訊鏈路已建立。訊息保存策略已套用。</p></div><div className="message"><span>site-cn19.ops</span><p>維修機器人已進入 B-14 外圍，等待觀測指令。</p><time>09:41</time></div><div className="message self"><span>研究員 / 05-ALPHA</span><p>維持三重敘事隔離。持續回報頻譜變化。</p><time>09:43</time></div></div><div className="compose-box"><input placeholder="發送至 # cn-ops-b14" aria-label="撰寫訊息" /><button onClick={() => notify("訊息已加密並排入傳送佇列", "展示環境不會送出實際訊息。")}><Send size={17} /></button></div></div>
      <aside className="inbox-rail"><div className="inbox-head"><span><Inbox size={17} />內部信箱</span><b>2 UNREAD</b></div>{inbox.map((mail) => <button key={mail.sender} className="mail-preview" onClick={() => notify(mail.subject, mail.copy)}><div><span>{mail.sender}</span><time>{mail.time}</time></div><strong>{mail.subject}</strong><p>{mail.copy}</p><small>{mail.tag}</small>{mail.unread && <i />}</button>)}<ActionLink onClick={() => notify("撰寫加密訊息", "此展示版僅顯示工作流程。")}>撰寫加密訊息</ActionLink></aside>
    </section>
  </>;

  const renderIdentity = () => <>
    <section className="view-heading identity-heading"><div><div className="eyebrow"><Fingerprint size={14} /> IDENTITY // SECURE CREDENTIALS</div><h1>身分憑證 <span>／NFC ID 卡</span></h1><p>基金會人員身分憑證與本地近場識別終端。所有讀取動作均需在受控硬體上完成。</p></div><div className="identity-status"><LockKeyhole size={18} /><span>HARDWARE READY</span></div></section>
    <section className="identity-layout"><div className="credential-card"><div className="credential-top"><span>SCP FOUNDATION</span><span className="card-chip"><i /><i /><i /></span></div><div className="credential-ring"><img src={LOGO_IMAGE} alt="SCIPNET 品牌符號" /></div><div className="credential-person"><span>RESEARCHER /</span><strong>05-ALPHA</strong><small>O5 COUNCIL · CLASS A</small></div><div className="credential-divider" /><div className="credential-bottom"><div><span>IDENTITY UID</span><strong>SCN-05-A7F2-19C4</strong></div><div><span>VALID FOR</span><strong>SCIPNET / CN BRANCH</strong></div><b>NFC</b></div></div>
      <div className="credential-info"><SectionKicker>本地驗證</SectionKicker><article className="scan-card"><div className={`scan-emitter ${isLocked ? "locked" : "unlocked"}`}><Fingerprint size={48} /><span className="scan-line" /></div><div><StatusPill label={isLocked ? "等待掃描" : "憑證已驗證"} tone={isLocked ? "neutral" : "safe"} /><h2>{isLocked ? "保持 NFC ID 卡接近裝置" : "本地憑證已通過"}</h2><p>{isLocked ? "使用受控讀取器完成本地驗證，系統將在不暴露憑證原文的情況下回傳授權狀態。" : "SCN-05-A7F2-19C4 已與 CN Branch 安全區段成功交握。"}</p></div></article><button className="primary-action scan-action" onClick={() => { setIsLocked(!isLocked); notify(isLocked ? "NFC 辨識成功" : "NFC 讀取器已重設", isLocked ? "本地授權狀態：CLASS A" : "憑證狀態回復鎖定。") }}><Fingerprint size={18} />{isLocked ? "開始 NFC 識別" : "重設 NFC 讀取器"}</button><div className="credential-facts"><div><LockKeyhole size={17} /><span>憑證資料<br /><b>不可匯出</b></span></div><div><ShieldCheck size={17} /><span>授權層級<br /><b>O5 COUNCIL · CLASS A</b></span></div><div><Network size={17} /><span>最後交握<br /><b>CN GRID · 09:44:06</b></span></div></div></div></section>
  </>;

  const viewMap: Record<ViewName, () => React.ReactNode> = { overview: renderOverview, archives: renderArchives, command: renderCommand, monitor: renderMonitor, comms: renderComms, identity: renderIdentity };

  return <div className="terminal-app">
    <aside className={`side-nav ${menuOpen ? "open" : ""}`}>
      <div className="brand-lockup"><img src={LOGO_IMAGE} alt="SCIPNET 系統印記" /><div><span>CN CONTAINMENT NETWORK</span><strong>SCIPNET</strong><span>// TERMINAL V2</span></div><button className="close-nav" onClick={() => setMenuOpen(false)} aria-label="關閉選單"><X size={18} /></button></div>
      <div className="nav-installation"><div><span>INSTALL SEAL</span><b>SCIPNET // TERMINAL</b></div><div><span>NODE ID</span><b>CN-19-B</b></div><div><span>AUTHORIZATION</span><b className="verified">CLASS 4 VERIFIED</b></div></div>
      <div className="nav-caption">受控工作區</div>
      <nav>{navigation.map((item) => { const Icon = item.icon; return <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => changeView(item.id)}><span className="nav-code">{item.code}</span><Icon size={17} /><span>{item.label}</span><ChevronRight size={14} /></button>; })}</nav>
      <div className="nav-bottom"><div className="nav-network"><span className="network-light" /><div><small>NETWORK LINK</small><b>CN / SECURE</b></div></div><button onClick={() => notify("系統狀態：正常", "最後自我檢測：09:44:06")}>SYSTEM STATUS <Activity size={14} /></button></div>
    </aside>
    <div className="mobile-scrim" onClick={() => setMenuOpen(false)} />
    <main className="main-stage">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="開啟選單"><Menu size={19} /></button><span className="topbar-route">CN / {navigation.find((item) => item.id === activeView)?.label}</span><span className="route-slash">//</span><span className="topbar-node">NODE: 19-B</span></div><div className="topbar-right"><span className="topbar-uptime"><span className="tiny-pulse" />SYSTEM NOMINAL</span><button onClick={() => changeView("identity")} className="operator-chip"><span>05</span><b>ALPHA</b></button></div></header>
      <div className="content-shell">{viewMap[activeView]()}</div>
    </main>
    <nav className="mobile-bottom-nav">{navigation.slice(0, 5).map((item) => { const Icon = item.icon; return <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => changeView(item.id)}><Icon size={18} /><span>{item.label.slice(0, 2)}</span></button>; })}</nav>
  </div>;
}
