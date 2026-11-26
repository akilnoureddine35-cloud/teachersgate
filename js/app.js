'use strict';
/* Teachers' Gate web — v1.8.0. Screens, services and look follow the Android app.
   Speed: data is kept on the phone (localStorage) and shown at once; fresh data is loaded in the background. */

// ============================================================ settings
const API_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';   // Web app URL of the Apps Script backend (see GUIDE.md)
const VERSION = '1.8.0';
const CENTERS = {
  ouahsnan: { nameAr: 'مركز وحسنان للتكوين', logo: 'img/logo_ouahsnan.png' },
  green: { nameAr: 'جرين سكول', logo: 'img/logo_green_school.png' },
};
// same screens, titles, subtitles, icons and sections as the Android drawer
const DESTS = [
  { id: 'home', title: 'الرئيسية', sub: 'لوحة التحكم', icon: 'home', section: '' },
  { id: 'attendance', title: 'حصة اليوم', sub: 'الحضور والغياب والنقاط', icon: 'how_to_reg', section: 'الحصص' },
  { id: 'archive', title: 'الأرشيف', sub: 'كل الحصص المسجلة', icon: 'inventory_2', section: 'الحصص' },
  { id: 'timetable', title: 'استعمال الزمن', sub: 'جدولك في كل المراكز', icon: 'calendar_month', section: 'الحصص' },
  { id: 'notes', title: 'ملاحظاتي', sub: 'ملاحظات حول التلاميذ', icon: 'sticky_note_2', section: 'الملاحظات' },
  { id: 'allnotes', title: 'ملاحظات الأساتذة', sub: 'كل ملاحظات تلاميذك', icon: 'forum', section: 'الملاحظات' },
  { id: 'qr', title: 'تسجيل الحضور', sub: 'الدخول والخروج بـ QR', icon: 'qr_code_scanner', section: 'الإدارة' },
  { id: 'requests', title: 'طلب حصة', sub: 'إضافة أو تأجيل حصة', icon: 'event_repeat', section: 'الإدارة' },
  { id: 'complaints', title: 'الشكايات', sub: 'راسل الإدارة', icon: 'campaign', section: 'الإدارة' },
  { id: 'track', title: 'متابعة طلباتي', sub: 'حالة طلباتك وردود الإدارة', icon: 'timeline', section: 'الإدارة' },
  { id: 'library', title: 'طباعة الدروس', sub: 'عدد النسخ للإدارة', icon: 'print', section: 'الإدارة' },
  { id: 'notifications', title: 'الإشعارات', sub: 'رسائل الإدارة', icon: 'notifications', section: 'الإدارة' },
  { id: 'stats', title: 'إحصائياتي', sub: 'أرقام نشاطك', icon: 'bar_chart', section: 'الأداء' },
  { id: 'howto', title: 'كيف تستعمل التطبيق', sub: 'دليل مبسط خطوة بخطوة', icon: 'menu_book', section: 'عام' },
  { id: 'settings', title: 'الإعدادات', sub: 'المظهر وتحديث البيانات', icon: 'settings', section: 'عام' },
];
const DEST = Object.fromEntries(DESTS.map(d => [d.id, d]));
const SECTION_ORDER = ['الحصص', 'الملاحظات', 'الإدارة', 'الأداء', 'عام'];
const TILE_HIDDEN = ['home', 'notifications', 'qr'];          // same as the Android home grid
const NAV = [
  { id: 'home', label: 'الرئيسية', icon: 'home' },
  { id: 'attendance', label: 'الحصة', icon: 'how_to_reg' },
  { id: 'timetable', label: 'الجدول', icon: 'calendar_month' },
  { id: 'archive', label: 'الأرشيف', icon: 'inventory_2' },
  { id: 'menu', label: 'المزيد', icon: 'menu' },
];
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
const DAYS_AR = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const HOWTO = [
  { t: 'تسجيل الدخول', i: 'login', s: ['اكتب اسم المستخدم وكلمة المرور.', 'اختر المركز الذي تعمل فيه.', 'تبقى مسجلاً حتى تضغط «تسجيل الخروج».'] },
  { t: 'الصفحة الرئيسية', i: 'home', s: ['بطاقة «حضورك اليوم» وزر QR في الأعلى.', '«حصص اليوم» لهذا المركز فقط. اضغط الحصة لتسجيل حضور تلاميذها.', 'الخدمات في الأسفل.'] },
  { t: 'تسجيل الحضور', i: 'how_to_reg', s: ['اختر المستوى والمادة، ثم المجموعة إن لزم.', 'تأكد من البداية والنهاية والنوع، واكتب وقت خروج المجموعة.', 'اكتب الرموز أو اضغط الأزرار (A غائب، L متأخر، H واجب، S أُخرج، M مريض، - غير معني).', 'احفظ الحصة. التلميذ الذي لم تكتب له شيئاً يُسجَّل «-».'] },
  { t: 'تنبيه الإدارة', i: 'warning', s: ['تظهر ملاحظة إذا تكرر عند تلميذ الغياب أو التأخر أكثر من 3 مرات في الشهر، أو أُخرج من حصة ولم يدخل بعدها.', 'أرسله إلى الإدارة في أقرب وقت ليبرّر.'] },
  { t: 'الأرشيف (للاطلاع فقط)', i: 'inventory_2', s: ['لا يمكن تعديل أي حصة من الأرشيف.', 'الفلاتر: الحصص، الشهر، التلاميذ والمجموعات.', 'في الأولى والثانية والثالثة إعدادي و دورة اللغات يظهر عمود النقاط.'] },
  { t: 'استعمال الزمن', i: 'calendar_month', s: ['جدول الأسبوع لكل المراكز. الحصة المسجّلة تظهر بعلامة ✓.'] },
  { t: 'الملاحظات', i: 'sticky_note_2', s: ['«ملاحظاتي»: اكتب ملاحظة لكل تلميذ (30 كلمة كحد أقصى).', '«ملاحظات الأساتذة»: اقرأ كل الملاحظات، وعدّل ملاحظاتك أنت فقط.'] },
  { t: 'QR والطلبات', i: 'qr_code_scanner', s: ['تسجيل الدخول والخروج بالرمز الموجود عند المدخل.', 'طلب حصة، والشكايات، ومتابعة كل طلباتك وردود الإدارة.', 'طباعة الدروس: اختر نوع الورق والحجم والعدد والمستوى ثم أرسل التقرير.'] },
  { t: 'الإحصائيات والإشعارات', i: 'bar_chart', s: ['الإحصائيات تخص المركز الذي تعمل فيه.', 'الإشعارات: رسائل الإدارة. أجب عليها أو أكّد استلامها.'] },
];

// ============================================================ helpers
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase().trim();
const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full: keep working */ } };
const ico = (name, cls) => '<span class="material-icons-round' + (cls ? ' ' + cls : '') + '">' + name + '</span>';
const wc = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const timeOk = v => /^\d{1,2}:\d{2}$/.test(v || '');
const monthLabel = key => { const p = key.split('-'); return MONTHS[+p[1] - 1] + ' ' + p[0]; };
const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const unique = a => [...new Set(a)];
function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
function validCode(c) {
  const s = (c || '').toUpperCase().replace(/\s/g, '');
  if (s === '' || s === '-' || s === 'A' || s === 'P') return true;
  if (/^\d{1,2}([.,]\d{1,2})?$/.test(s)) return parseFloat(s.replace(',', '.')) <= 20;
  return /^((H|S|M)(P|\d{1,2})?|L\d{1,2}(\(\d{1,3}\))?)+(\(\d{1,3}\))?$/.test(s);
}
function describe(code) {
  const c = (code || '').toUpperCase();
  if (!c || c === '-') return '';
  if (c === 'A') return 'غائب';
  if (c === 'P') return 'حاضر (P)';
  if (/^[\d.,]+$/.test(c)) return 'نقطة ' + c;
  const p = [];
  if (c.includes('L')) p.push('متأخر');
  if (c.includes('S')) p.push('أُخرج من الحصة');
  if (c.includes('M')) p.push('غادر مريضاً');
  if (c.includes('H')) p.push('بدون واجب');
  return p.join(' + ');
}
function categoryOf(code) {
  const v = (code || '').toUpperCase();
  if (!v || v === '-') return 'none';
  if (v === 'A') return 'absent';
  if (v.includes('L')) return 'late';
  if (/[HSM]/.test(v)) return 'other';
  return 'present';
}
function chipFor(code) {
  const v = (code || '').toUpperCase();
  let cls = 'ok';
  if (!v || v === '-') cls = 'none';
  else if (v === 'A') cls = 'abs';
  else if (v.includes('L')) cls = 'late';
  else if (/[HSM]/.test(v)) cls = 'oth';
  return '<span class="gc ' + cls + '">' + esc(v || '—') + '</span>';
}
const skel = () => '<div class="skeleton"></div>';
const card = (icoName, title, body, tint) =>
  '<div class="card"><div class="row" style="margin-bottom:12px"><div class="iconTile ' + (tint || 'a') + '">' + ico(icoName) + '</div><b class="grow">' + title + '</b></div>' + body + '</div>';
const banner = (icoName, title, sub) =>
  '<div class="banner"><span class="deco1"></span><span class="deco2"></span><div class="row"><div class="ic">' + ico(icoName) + '</div>' +
  '<div class="txt"><h1>' + esc(title) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div></div>' +
  '<div class="wm"><img src="' + CENTERS[S.center].logo + '" alt=""></div></div>';
const levelsOf = () => unique(((S.data['as:' + S.center] || { assignments: [] }).assignments || []).map(x => x.level));
const assignmentsOf = () => (S.data['as:' + S.center] || { assignments: [] }).assignments || [];

// ============================================================ API (one request per action; errors shown as text)
async function api(action, body) {
  if (API_URL.indexOf('PASTE') === 0) throw new Error('لم يتم ضبط رابط الخادم في الملف js/app.js (API_URL).');
  const payload = Object.assign({ action: action }, body || {});
  if (action !== 'login' && S.session) { payload.username = S.session.username; payload.token = S.session.token; }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctl.signal });
    const data = await res.json();
    if (data.error) {
      if (/انتهت الجلسة/.test(data.error)) logout(true);
      throw new Error(data.error);
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('الاتصال بطيء جداً. حاول مرة أخرى.');
    if (e instanceof TypeError) throw new Error('لا يوجد اتصال بالإنترنت. تُعرض آخر بيانات محفوظة.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Stale-while-revalidate: the saved copy is returned at once when it exists, and refreshed in the background. */
async function swr(key, fetcher, maxAgeMs) {
  const k = 'tg.c.' + key;
  const saved = load(k);
  if (saved && saved.v !== undefined) S.data[key] = saved.v;
  const fresh = saved && Date.now() - saved.at < maxAgeMs;
  if (fresh) return saved.v;
  const p = fetcher().then(v => { S.data[key] = v; save(k, { at: Date.now(), v: v }); return v; });
  if (saved) {
    p.then(() => refreshSoon()).catch(() => { /* offline: keep the saved copy */ });
    return saved.v;
  }
  return p;
}

/** Repaints after a background refresh, but never while the teacher is typing in a field. */
function refreshSoon() {
  const a = document.activeElement;
  if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) { S.pending = true; return; }
  paint();
}

/** Loads what a screen needs. Each call returns quickly when the saved copy is recent. */
async function ensure(dest) {
  const c = S.center;
  const jobs = [];
  if (['home', 'attendance', 'timetable'].includes(dest)) jobs.push(swr('tt', () => api('timetable'), 120000));
  if (['home', 'attendance', 'archive', 'notes', 'allnotes'].includes(dest)) jobs.push(swr('as:' + c, () => api('assignments', { center: c }), 900000));
  if (dest === 'home' || dest === 'qr') jobs.push(swr('qr:' + c, () => api('qrToday', { center: c }), dest === 'qr' ? 0 : 60000));
  if (dest === 'library') jobs.push(swr('lib:' + c, () => api('libraryOptions', { center: c }), 86400000));
  if (dest === 'stats') jobs.push(swr('stats:' + c, () => api('stats', { center: c }), 300000));
  if (dest === 'notifications') jobs.push(swr('ads:' + c, () => api('ads', { center: c }), 60000));
  if (dest === 'track') jobs.push(swr('track:' + c, () => api('track', { center: c }), 60000));
  await Promise.all(jobs);
}

// ============================================================ state
const freshAtt = () => ({ assignment: null, group: null, students: [], flags: {}, groups: [], done: [], codes: {}, start: '', end: '', type: '', exits: {}, flagKey: null, flagList: null, busy: false });
const S = {
  session: load('tg.session'),
  center: load('tg.center'),
  dest: 'home',
  drawer: false,
  pending: false,
  data: {},
  form: {},
  ans: {},
  att: freshAtt(),
  arch: { level: null, data: null, mode: 'all', month: '', group: '', q: '' },
  notes: { newKey: null, newLevel: null, newSubject: null, newData: null, draft: {} },
  all: { level: null, data: null, mode: 'all', edit: null, draft: {} },
  cam: null, camTimer: null,
  theme: localStorage.getItem('tg.theme') || 'system',
};

// ============================================================ shell: top bar, drawer, bottom navigation, content
function paint() {
  const app = $('#app');
  S.pending = false;
  if (!S.session) { document.body.dataset.center = ''; app.innerHTML = loginView(); return; }
  if (!S.center) { document.body.dataset.center = ''; app.innerHTML = pickView(); return; }
  document.body.dataset.center = S.center;
  const d = DEST[S.dest] || DEST.home;
  app.innerHTML = topbarHtml(d) + '<main class="content">' + contentOf(S.dest) + '</main>' + bottomNavHtml(d) + drawerHtml() + flagOverlay();
}

function topbarHtml(d) {
  const multi = S.session.teacher.centers.length > 1;
  return '<header class="topbar">' +
    '<button class="ib" data-act="drawer" aria-label="القائمة">' + ico('menu') + '</button>' +
    '<div class="logo-badge"><img src="' + CENTERS[S.center].logo + '" alt=""></div>' +
    '<div class="titles"><b>' + esc(d.title) + '</b><span>' + esc(CENTERS[S.center].nameAr) + '</span></div>' +
    '<button class="ib" data-act="refresh" aria-label="تحديث">' + ico('refresh') + '</button>' +
    '<button class="ib" data-act="go" data-d="notifications" aria-label="الإشعارات">' + ico('notifications') + '</button>' +
    (multi ? '<button class="ib" data-act="swap" aria-label="تبديل المركز">' + ico('swap_horiz') + '</button>' : '') +
    '</header>';
}

function bottomNavHtml(d) {
  return '<nav class="bottomnav">' + NAV.map(n => {
    const on = n.id === 'menu' ? S.drawer : d.id === n.id;
    return '<button class="' + (on ? 'on' : '') + '" data-act="' + (n.id === 'menu' ? 'drawer' : 'go') + '" data-d="' + n.id + '">' +
      '<span class="pill-ic">' + ico(n.icon) + '</span>' + esc(n.label) + '</button>';
  }).join('') + '</nav>';
}

function drawerHtml() {
  const t = S.session.teacher;
  const multi = t.centers.length > 1;
  let items = '';
  const home = DEST.home;
  items += '<button class="ditem ' + (S.dest === 'home' ? 'on' : '') + '" data-act="go" data-d="home">' + ico(home.icon) + esc(home.title) + '</button>';
  SECTION_ORDER.forEach(sec => {
    const list = DESTS.filter(x => x.section === sec);
    if (!list.length) return;
    items += '<div class="drawer-sec">' + esc(sec) + '</div>' + list.map(x =>
      '<button class="ditem ' + (S.dest === x.id ? 'on' : '') + '" data-act="go" data-d="' + x.id + '">' + ico(x.icon) + esc(x.title) + '</button>').join('');
  });
  return '<div class="scrim ' + (S.drawer ? 'open' : '') + '" data-act="closeDrawer"></div>' +
    '<aside class="drawer ' + (S.drawer ? 'open' : '') + '">' +
    '<div class="drawer-head"><div class="logo-badge"><img src="' + CENTERS[S.center].logo + '" alt=""></div>' +
    '<b>' + esc(t.arabicName || t.name) + '</b><span>' + esc(CENTERS[S.center].nameAr) + '</span>' +
    '<div class="chip-version"><span>الإصدار ' + VERSION + '</span><span class="new">جديد ✦</span></div></div>' +
    '<div class="drawer-body">' + items + '</div>' +
    '<div class="drawer-foot">' +
    (multi ? '<button class="ditem" data-act="swap">' + ico('swap_horiz') + 'تبديل المركز</button>' : '') +
    '<button class="ditem danger" data-act="logout">' + ico('logout') + 'تسجيل الخروج</button></div></aside>';
}

function flagOverlay() {
  if (S.dest !== 'attendance' || !S.att.flagList) return '';
  return '<div class="overlay" data-act="closeFlags"><div class="sheet">' +
    '<div class="row" style="margin-bottom:8px">' + ico('warning', 'err') + '<b class="grow" style="font-size:17px">ملاحظة: تلاميذ يجب إرسالهم إلى الإدارة</b></div>' +
    '<div class="muted" style="margin-bottom:10px">أرسل هؤلاء التلاميذ إلى الإدارة في أقرب وقت لتبرير وضعيتهم، قبل تسجيل غياب اليوم. (احتساب شهر ' + esc(monthLabel(todayKey().slice(0, 7))) + ')</div>' +
    S.att.flagList.map(f => '<div style="border-top:1px solid var(--line);padding:10px 0"><b>' + esc(f.name) + '</b><div class="flagtxt">' + esc(f.reasons.join(' • ')) + '</div></div>').join('') +
    '<button class="btn" style="margin-top:8px" data-act="closeFlags">فهمت</button></div></div>';
}

function contentOf(dest) {
  const views = {
    home: viewHome, attendance: viewAttendance, archive: viewArchive, timetable: viewTimetable,
    notes: viewNotes, allnotes: viewAllNotes, qr: viewQr, requests: viewRequests, complaints: viewComplaints,
    track: viewTrack, library: viewLibrary, notifications: viewNotifications, stats: viewStats,
    howto: viewHowTo, settings: viewSettings,
  };
  return (views[dest] || viewHome)();
}

// ============================================================ login and center choice
function loginView() {
  return '<div class="login"><div class="brand">' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-bottom:12px">' +
    '<div class="logo-badge" style="width:84px;height:84px;border-radius:22px"><img src="img/logo_ouahsnan.png" alt=""></div>' +
    '<div class="logo-badge" style="width:84px;height:84px;border-radius:22px"><img src="img/logo_green_school.png" alt=""></div></div>' +
    '<b>Teachers\' Gate</b><span>بوابة الأساتذة</span></div>' +
    '<form data-form="login"><div class="field"><label>اسم المستخدم</label><input class="input" id="lu" autocapitalize="none" autocomplete="username" required></div>' +
    '<div class="field"><label>كلمة المرور</label><input class="input" id="lp" type="password" autocomplete="current-password" required></div>' +
    '<button class="btn" type="submit" id="lbtn">تسجيل الدخول</button></form></div>';
}
function pickView() {
  const t = S.session.teacher;
  return '<header class="topbar"><div class="titles" style="margin-inline-start:12px"><b>اختر المركز</b><span>' + esc(t.arabicName || t.name) + '</span></div>' +
    '<button class="ib" data-act="logout" aria-label="تسجيل الخروج">' + ico('logout') + '</button></header>' +
    '<div class="pick">' + t.centers.map(c =>
      '<button data-act="setCenter" data-c="' + c + '"><div class="logo-badge"><img src="' + CENTERS[c].logo + '" alt=""></div><div><b>' + esc(CENTERS[c].nameAr) + '</b></div></button>').join('') + '</div>';
}

// ============================================================ home (same as the Android home screen)
function clockCard(t) {
  return '<div class="card"><div class="row" style="margin-bottom:10px">' + ico('qr_code_scanner', 'pr') + '<b class="grow">حضورك اليوم</b>' +
    '<button class="btn small-btn" data-act="go" data-d="qr">' + ico('qr_code_scanner') + 'QR</button></div>' +
    (t ? '<div class="clock"><div class="cell"><div class="muted">الدخول</div><b>' + esc(t.clockIn || '—') + '</b></div>' +
      '<div class="cell"><div class="muted">الخروج</div><b>' + esc(t.clockOut || '—') + '</b></div></div>' : skel()) + '</div>';
}
function lessonCard(l, idx) {
  return '<button class="lesson ' + (l.recorded ? 'done' : '') + '" data-act="openTT" data-i="' + idx + '">' +
    '<span class="time">' + esc(l.start) + (l.end ? ' – ' + esc(l.end) : '') + (l.recorded ? '  ✓' : '') + '</span>' +
    '<span class="sub">' + esc(l.subject) + '</span>' +
    '<span class="meta">' + esc(l.level) + (l.group ? ' • ' + esc(l.group) : '') + ' • ' + esc(CENTERS[l.center].nameAr) + '</span>' +
    '<span class="act">' + ico(l.recorded ? 'check_circle' : 'arrow_back', '') + (l.recorded ? 'مسجّلة — تعديل الحضور' : 'تسجيل الحضور') + '</span></button>';
}
function viewHome() {
  const c = S.center;
  const tt = S.data.tt;
  let h = clockCard(S.data['qr:' + c]);
  h += '<div class="sect">حصص اليوم</div>';
  if (!tt) h += skel();
  else {
    const today = todayKey();
    const all = tt.lessons.filter(l => l.date === today);
    const here = all.filter(l => l.center === c);
    const other = all.filter(l => l.center !== c);
    if (!here.length) {
      h += '<div class="card"><div class="row">' + '<div class="iconTile" style="background:var(--surface-variant);color:var(--muted)">' + ico('event_busy') + '</div>' +
        '<div class="grow"><b>اليوم لا توجد لك حصص في هذا المركز.</b><div class="small" style="margin-top:3px">' +
        (other.length ? 'لديك حصص اليوم في ' + esc(CENTERS[other[0].center].nameAr) + '. انتقل إلى ذلك المركز.' : 'اليوم يوم راحة.') + '</div></div></div></div>';
    } else {
      h += '<div class="small">اضغط على الحصة لتسجيل حضور تلاميذها</div><div class="hscroll">' +
        here.map(l => lessonCard(l, tt.lessons.indexOf(l))).join('') + '</div>';
    }
  }
  h += '<div class="sect">الخدمات</div><div class="tiles2">' + DESTS.filter(d => !TILE_HIDDEN.includes(d.id)).map((d, i) =>
    '<button class="tile" data-act="go" data-d="' + d.id + '"><div class="iconTile ' + (i % 2 ? 'b' : 'a') + '">' + ico(d.icon) + '</div>' +
    '<div><b>' + esc(d.title) + '</b><span class="s">' + esc(d.sub) + '</span></div></button>').join('') + '</div>';
  return h;
}

// ============================================================ timetable (all centers, this week)
function viewTimetable() {
  const tt = S.data.tt;
  if (!tt) return skel();
  const html = DAYS_AR.map((dn, dow) => {
    const items = tt.lessons.map((l, i) => ({ l: l, i: i })).filter(x => x.l.dow === dow)
      .sort((a, b) => (a.l.start || '').localeCompare(b.l.start || ''));
    if (!items.length) return '';
    return '<div class="sect">' + dn + '</div>' + items.map(x => lessonCard(x.l, x.i)).join('');
  }).join('');
  return html || '<div class="card muted">لا توجد حصص في جدولك هذا الأسبوع.</div>';
}

// ============================================================ attendance (same rules as the Android screen)
function exitSlots() {
  const g = S.att.group;
  if (g) return [{ n: g.number, label: 'وقت خروج ' + g.name }];
  const map = {};
  S.att.groups.forEach(x => { (map[x.number] = map[x.number] || []).push(x.name); });
  const ns = Object.keys(map).map(Number).sort((a, b) => a - b);
  if (!ns.length) return [{ n: 1, label: 'وقت الخروج' }];
  return ns.map(n => ({ n: n, label: 'وقت خروج ' + map[n].join(' / ') }));
}
function viewAttendance() {
  const data = S.data['as:' + S.center];
  const list = assignmentsOf();
  const types = (data && data.lessonTypes) || [];
  const a = S.att.assignment;
  let h = banner('how_to_reg', 'حصة اليوم', 'الحضور والغياب والنقاط');
  if (!data) return h + skel();
  h += card('school', '1. اختر المستوى والمادة', list.length
    ? '<div class="chips">' + list.map((x, i) => '<button class="chip ' + (a && a.level === x.level && a.subject === x.subject ? 'on' : '') + '" data-act="selAssign" data-i="' + i + '">' + esc(x.level) + ' • ' + esc(x.subject) + '</button>').join('') + '</div>'
    : '<div class="muted">لا توجد مستويات مسندة إليك في هذا المركز.</div>');
  if (!a) return h;
  if (S.att.groups.length) {
    h += card('groups', '2. المجموعة (اختياري)', '<div class="chips">' +
      '<button class="chip ' + (!S.att.group ? 'on' : '') + '" data-act="selGroup" data-i="-1">كل التلاميذ</button>' +
      S.att.groups.map((g, i) => '<button class="chip ' + (S.att.group && S.att.group.name === g.name ? 'on' : '') + '" data-act="selGroup" data-i="' + i + '">' + esc(g.name) + (S.att.done.indexOf(g.number) >= 0 ? ' ✓ مسجّلة' : '') + '</button>').join('') + '</div>', 'b');
  }
  h += card('info', '3. معلومات الحصة',
    '<div class="field" style="gap:12px">' +
    '<div class="row"><div class="grow field"><label>البداية</label><input class="input" type="time" data-field="start" value="' + esc(S.att.start) + '"></div>' +
    '<div class="grow field"><label>النهاية</label><input class="input" type="time" data-field="end" value="' + esc(S.att.end) + '"></div></div>' +
    '<div class="field"><label>نوع الحصة</label><div class="chips">' + types.map(t => '<button class="chip ' + (S.att.type === t ? 'on' : '') + '" data-act="selType" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div></div>' +
    exitSlots().map(s => '<div class="field"><label>' + esc(s.label) + '</label><input class="input" type="time" data-exit="' + s.n + '" value="' + esc(S.att.exits[s.n] || '') + '"></div>').join('') +
    '<div class="hint">إذا تُرك وقت الخروج فارغاً يُستعمل وقت نهاية الحصة.</div></div>', 'b');
  const flagged = S.att.students.filter(s => S.att.flags[s.row]);
  if (flagged.length) {
    h += '<div class="notice warn"><div class="row">' + ico('warning') + '<b>' + flagged.length + ' تلميذ يجب إرساله إلى الإدارة في أقرب وقت للتبرير</b></div>' +
      flagged.map(s => '<div style="margin-top:8px"><b>' + esc(s.name) + '</b><div class="flagtxt">' + esc(S.att.flags[s.row].reasons.join(' • ')) + '</div></div>').join('') + '</div>';
  }
  h += '<div class="row"><div class="grow sect">4. التلاميذ (' + S.att.students.length + ')</div>' +
    '<button class="btn small-btn alt" data-act="fillDash">الفارغ = -</button></div>';
  h += '<details class="card"><summary style="font-weight:800;cursor:pointer">دليل الرموز</summary><div style="margin-top:10px">' +
    legendLine('15', 'var(--primary)', 'النقطة', 'من 0 إلى 20 — P تعني «حاضر»') + legendLine('A', 'var(--err)', 'غائب', 'A') +
    legendLine('L', 'var(--warn)', 'متأخر', 'L + النقطة + (الدقائق) — مثال: L11(2') + legendLine('S', 'var(--primary)', 'طُرد من الحصة', 'S أو S12') +
    legendLine('M', 'var(--primary)', 'غادر مريضاً', 'M أو M10') + legendLine('H', 'var(--secondary)', 'بدون واجب', 'H11') +
    legendLine('-', 'var(--outline)', 'غير معني', 'الخانة الفارغة تُرسل «-»') +
    '<div class="small" style="margin-top:6px">يمكن الجمع بين الرموز: HM ، HL8 ، HL11(5</div></div></details>';
  h += '<div class="tiles4" id="summary">' + summaryHtml() + '</div>';
  h += S.att.students.map((s, i) => studentRow(s, i)).join('');
  h += '<button class="btn" data-act="save" ' + (S.att.busy ? 'disabled' : '') + '>' + (S.att.busy ? '<span class="spin"></span>' : ico('send') + ' حفظ الحصة') + '</button>' +
    '<div class="hint center">إعادة الإرسال في نفس اليوم تُعدّل نفس الحصة. ترك الخانة فارغة يعني «-».</div>';
  return h;
}
function legendLine(k, color, title, rule) {
  return '<div class="legend-line"><div class="k" style="background:color-mix(in srgb,' + color + ' 14%,transparent);color:' + color + '">' + esc(k) + '</div>' +
    '<div class="grow"><b>' + esc(title) + '</b><div class="small">' + esc(rule) + '</div></div></div>';
}
function studentRow(s, i) {
  const code = S.att.codes[s.row] || '';
  return '<div class="srow ' + (S.att.flags[s.row] ? 'flag' : '') + '" data-row="' + s.row + '">' + rowInner(s, i, code) + '</div>';
}
function rowInner(s, i, code) {
  const flag = S.att.flags[s.row];
  const hint = flag ? '<div class="flagtxt">⚠ للإدارة في أقرب وقت: ' + esc(flag.reasons.join(' • ')) + '</div>' : (describe(code) ? '<div class="hint">' + esc(describe(code)) + '</div>' : '');
  return '<div class="top"><span class="idx">' + (i + 1) + '</span><div class="grow"><b>' + esc(s.name) + '</b>' + hint + '</div>' +
    '<input class="code" data-code="' + s.row + '" value="' + esc(code) + '" autocapitalize="characters" placeholder="-"></div>' +
    '<div class="quick">' + quickButtons(s.row) + '</div>';
}
function quickButtons(row) {
  const code = (S.att.codes[row] || '').toUpperCase();
  return ['A', 'L', 'H', 'S', 'M', '-'].map(f => {
    const on = f === 'A' || f === '-' ? code === f : code.includes(f);
    return '<button class="qb ' + f + ' ' + (on ? 'on' : '') + '" data-act="quick" data-row="' + row + '" data-f="' + f + '">' + f + '</button>';
  }).join('');
}
function paintRow(row) {
  const el = document.querySelector('.srow[data-row="' + row + '"]');
  if (!el) return;
  const s = S.att.students.find(x => String(x.row) === String(row));
  const idx = S.att.students.indexOf(s) + 1;
  el.innerHTML = rowInner(s, idx - 1, S.att.codes[row] || '');
}
function summaryHtml() {
  const counts = { present: 0, absent: 0, late: 0, other: 0, none: 0 };
  S.att.students.forEach(s => { counts[categoryOf(S.att.codes[s.row])]++; });
  return [['present', 'حاضر', 'var(--ok)'], ['absent', 'غائب', 'var(--err)'], ['late', 'متأخر', 'var(--warn)'], ['other', 'أخرى', 'var(--blue)'], ['none', 'فارغ / -', 'var(--muted)']]
    .map(x => '<div class="stat" style="color:' + x[2] + '"><b>' + counts[x[0]] + '</b><span>' + x[1] + '</span></div>').join('');
}
function refreshSummary() {
  const el = document.getElementById('summary');
  if (el) el.innerHTML = summaryHtml();
}
async function loadStudents() {
  const a = S.att.assignment;
  const r = await api('students', { center: S.center, level: a.level, subject: a.subject, group: S.att.group ? S.att.group.name : null });
  S.att.students = r.students;
  S.att.flags = r.flags;
  S.att.groups = r.groups;
  S.att.done = r.doneGroups;
}
async function selectAssign(a, lesson) {
  if (!a) return toast('هذه الحصة ليست من مستوياتك في هذا المركز.');
  S.att = freshAtt();
  S.att.assignment = a;
  paint();
  try { await loadStudents(); } catch (e) { toast(e.message); }
  const tt = S.data.tt ? S.data.tt.lessons.filter(l => l.center === S.center && l.date === todayKey() && norm(l.level) === norm(a.level) && norm(l.subject) === norm(a.subject)) : [];
  const l = lesson || tt[0];
  if (l) {
    S.att.start = l.start || ''; S.att.end = l.end || ''; if (l.type) S.att.type = l.type;
    if (l.group) {
      const g = S.att.groups.find(x => norm(x.name) === norm(l.group));
      if (g) { S.att.group = g; await loadStudents(); }
    }
  }
  if (Object.keys(S.att.flags).length) S.att.flagList = Object.values(S.att.flags);
  paint();
}

// ============================================================ archive (read only)
function viewArchive() {
  const levels = levelsOf();
  const a = S.arch;
  let h = banner('inventory_2', 'الأرشيف', 'كل الحصص المسجلة — للاطلاع فقط');
  h += '<div class="scrollchips">' + levels.map(l => '<button class="chip ' + (a.level === l ? 'on' : '') + '" data-act="archLevel" data-l="' + esc(l) + '">' + esc(l) + '</button>').join('') + '</div>';
  if (!a.level) return h + '<div class="card muted">اختر المستوى لعرض حصصه.</div>';
  if (!a.data) return h + skel();
  const d = a.data;
  const months = unique(d.columns.map(c => c.date.slice(0, 7))).sort().reverse();
  const cols = d.columns.filter(c => (a.mode === 'all' || c.owned) && (!a.month || c.date.slice(0, 7) === a.month));
  const group = d.groups.find(g => g.name === a.group);
  const members = group ? group.students.map(norm) : null;
  let students = d.students.filter(s => !members || members.indexOf(norm(s.name)) >= 0);
  const q = norm(a.q);
  let shown = cols;
  if (q) {
    const byName = students.filter(s => norm(s.name).includes(q));
    if (byName.length) students = byName;
    else shown = cols.filter(c => norm(c.header + ' ' + c.subject + ' ' + c.type).includes(q));
  }
  h += '<div class="card"><div class="field" style="gap:12px">' +
    '<div class="field"><label>الحصص</label><div class="scrollchips">' +
    '<button class="chip ' + (a.mode === 'all' ? 'on' : '') + '" data-act="archMode" data-v="all">كل الحصص</button>' +
    '<button class="chip ' + (a.mode === 'mine' ? 'on' : '') + '" data-act="archMode" data-v="mine">حصصي</button></div></div>' +
    '<div class="field"><label>الشهر</label><div class="scrollchips">' +
    '<button class="chip ' + (!a.month ? 'on' : '') + '" data-act="archMonth" data-v="">كل الأشهر</button>' +
    months.map(m => '<button class="chip ' + (a.month === m ? 'on' : '') + '" data-act="archMonth" data-v="' + m + '">' + esc(monthLabel(m)) + '</button>').join('') + '</div></div>' +
    '<div class="field"><label>التلاميذ</label><div class="scrollchips">' +
    '<button class="chip ' + (!a.group ? 'on' : '') + '" data-act="archGroup" data-v="">كل التلاميذ</button>' +
    d.groups.map(g => '<button class="chip ' + (a.group === g.name ? 'on' : '') + '" data-act="archGroup" data-v="' + esc(g.name) + '">' + esc(g.name) + '</button>').join('') + '</div></div>' +
    '<input class="input" data-field="archQ" placeholder="ابحث باسم التلميذ أو بتاريخ الحصة أو المادة" value="' + esc(a.q) + '">' +
    '</div></div>';
  h += '<div class="row small"><span class="pill soft">' + shown.length + ' حصة</span><span class="pill soft">' + students.length + ' تلميذ</span></div>';
  if (!shown.length || !students.length) return h + '<div class="card muted">لا توجد نتائج.</div>';
  h += '<div class="tablewrap"><table class="grid"><thead><tr><th class="nm">التلميذ</th>' + (d.points ? '<th>النقاط</th>' : '') +
    shown.map(c => '<th class="' + (c.owned ? 'mine' : '') + '">' + esc(c.header) + '<small>' + esc(c.subject) + '</small><small>' + esc([c.type, c.start].filter(Boolean).join(' • ')) + '</small></th>').join('') +
    '</tr></thead><tbody>' + students.map((s, i) => '<tr><td class="nm">' + (i + 1) + '. ' + esc(s.name) + '</td>' +
    (d.points ? '<td><b>' + esc(d.points[s.row] || '—') + '</b></td>' : '') +
    shown.map(c => '<td>' + chipFor(c.codes[s.row]) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  return h;
}

// ============================================================ notes (new note)
function viewNotes() {
  const n = S.notes;
  let h = banner('sticky_note_2', 'ملاحظاتي', 'ملاحظات حول التلاميذ');
  h += card('school', 'المستوى والمادة', '<div class="chips">' + assignmentsOf().map((x, i) =>
    '<button class="chip ' + (n.newKey === x.level + '|' + x.subject ? 'on' : '') + '" data-act="notesPick" data-i="' + i + '">' + esc(x.level) + ' • ' + esc(x.subject) + '</button>').join('') + '</div>');
  if (!n.newKey) return h;
  if (!n.newData) return h + skel();
  h += n.newData.students.map((s, i) => '<div class="srow"><div class="top"><span class="idx">' + (i + 1) + '</span><b class="grow">' + esc(s.name) + '</b></div>' +
    '<textarea class="input" data-note="' + s.row + '" placeholder="الملاحظة (30 كلمة كحد أقصى)">' + esc(n.draft[s.row] || '') + '</textarea></div>').join('');
  return h + '<button class="btn" data-act="notesSaveNew">' + ico('save') + ' حفظ الملاحظات</button>';
}

// ============================================================ all notes (read; own notes editable)
function viewAllNotes() {
  const n = S.all;
  let h = banner('forum', 'ملاحظات الأساتذة', 'كل ملاحظات تلاميذك');
  h += '<div class="scrollchips">' + levelsOf().map(l => '<button class="chip ' + (n.level === l ? 'on' : '') + '" data-act="allLevel" data-l="' + esc(l) + '">' + esc(l) + '</button>').join('') + '</div>';
  h += '<div class="scrollchips"><button class="chip ' + (n.mode === 'all' ? 'on' : '') + '" data-act="allMode" data-v="all">كل الملاحظات</button><button class="chip ' + (n.mode === 'mine' ? 'on' : '') + '" data-act="allMode" data-v="mine">ملاحظاتي</button></div>';
  if (!n.level) return h + '<div class="card muted">اختر المستوى.</div>';
  if (!n.data) return h + skel();
  const cols = n.mode === 'mine' ? n.data.columns.filter(c => c.owned) : n.data.columns;
  if (!cols.length) return h + '<div class="card muted">لا توجد ملاحظات في هذا المستوى.</div>';
  return h + cols.map(c => {
    const editing = n.edit === c.index;
    const head = '<div class="row"><b class="grow">' + esc(c.month || '') + ' • ' + esc(c.subject) + '</b>' +
      (c.owned ? '<button class="btn small-btn alt" data-act="allEdit" data-c="' + c.index + '">' + (editing ? 'إلغاء' : 'تعديل') + '</button>' : '') + '</div>' +
      '<div class="small">' + (c.author ? 'الأستاذ: ' + esc(c.author) : '') + '</div>';
    const body = editing
      ? n.data.students.map(s => '<div class="field" style="margin-top:8px"><label>' + esc(s.name) + '</label><textarea class="input" data-note="' + s.row + '">' + esc(n.draft[s.row] || '') + '</textarea></div>').join('') +
        '<button class="btn" style="margin-top:10px" data-act="allSave" data-c="' + c.index + '">حفظ التعديل</button>'
      : n.data.students.filter(s => c.codes[s.row]).map(s => '<div style="border-top:1px solid var(--line);padding:8px 0"><b>' + esc(s.name) + '</b><div style="margin-top:4px;line-height:1.6">' + esc(c.codes[s.row]) + '</div></div>').join('') ||
        '<div class="small" style="margin-top:8px">لا توجد ملاحظات مكتوبة.</div>';
    return '<div class="card">' + head + body + '</div>';
  }).join('');
}

// ============================================================ QR
function viewQr() {
  let h = banner('qr_code_scanner', 'تسجيل الحضور', 'الدخول والخروج بـ QR');
  h += clockCard(S.data['qr:' + S.center]);
  h += card('qr_code_scanner', 'تسجيل الدخول أو الخروج',
    '<div class="field"><label>رمز المركز (QR)</label><input class="input" data-k="qrCode" value="' + esc(S.form.qrCode || '') + '" autocapitalize="characters" placeholder="اكتب الرمز الموجود عند المدخل"></div>' +
    '<button class="btn alt" style="margin-top:12px" data-act="qrCamera">' + ico('photo_camera') + ' مسح الرمز بالكاميرا</button>' +
    '<button class="btn" style="margin-top:10px" data-act="qrSubmit">تسجيل</button>' +
    '<div class="hint" style="margin-top:8px">المسح بالكاميرا يعمل في المتصفحات التي تدعم قارئ الرموز. وإلا اكتب الرمز يدوياً.</div>');
  return h;
}

// ============================================================ requests, complaints, tracking, library
function viewRequests() {
  return banner('event_repeat', 'طلب حصة', 'إضافة أو تأجيل حصة') +
    card('event_repeat', 'نوع الطلب', '<div class="chips">' + ['إضافة حصة', 'تأجيل حصة'].map(t =>
      '<button class="chip ' + (S.form.reqType === t ? 'on' : '') + '" data-act="reqType" data-v="' + t + '">' + t + '</button>').join('') + '</div>' +
      '<div class="field" style="margin-top:12px"><label>التفاصيل</label><textarea class="input" data-k="reqDetails">' + esc(S.form.reqDetails || '') + '</textarea></div>' +
      '<button class="btn" style="margin-top:12px" data-act="sendReq">' + ico('send') + ' إرسال الطلب</button>');
}
function viewComplaints() {
  return banner('campaign', 'الشكايات', 'راسل الإدارة') +
    card('campaign', 'شكاية جديدة',
      '<div class="field"><label>العنوان</label><input class="input" data-k="compTitle" value="' + esc(S.form.compTitle || '') + '"></div>' +
      '<div class="field" style="margin-top:12px"><label>الرسالة</label><textarea class="input" data-k="compMsg">' + esc(S.form.compMsg || '') + '</textarea></div>' +
      '<button class="btn" style="margin-top:12px" data-act="sendComp">' + ico('send') + ' إرسال الشكاية</button>');
}
function viewTrack() {
  let h = banner('timeline', 'متابعة طلباتي', 'حالة طلباتك وردود الإدارة');
  const t = S.data['track:' + S.center];
  if (!t) return h + skel();
  const items = [].concat(t.requests.map(x => Object.assign({ kind: 'طلب' }, x)), t.complaints.map(x => Object.assign({ kind: 'شكاية' }, x)));
  if (!items.length) return h + '<div class="card muted">لا توجد طلبات أو شكايات بعد.</div>';
  return h + items.map(x => '<div class="card"><div class="row"><b class="grow">' + esc(x.kind) + ': ' + esc(x.title) + '</b><span class="pill soft">' + esc(x.status || '—') + '</span></div>' +
    '<div class="small">' + esc(x.date) + '</div>' + (x.details ? '<div style="margin-top:6px;line-height:1.6">' + esc(x.details) + '</div>' : '') +
    (x.reply ? '<div class="notice" style="margin-top:8px"><b>رد الإدارة:</b> ' + esc(x.reply) + '</div>' : '') + '</div>').join('');
}
function viewLibrary() {
  const o = S.data['lib:' + S.center];
  let h = banner('print', 'طباعة الدروس', 'عدد النسخ للإدارة');
  if (!o) return h + skel();
  return h + card('print', 'تقرير طباعة الدروس',
    '<div class="field"><label>نوع الورق</label><input class="input" list="dl-types" data-k="libType" value="' + esc(S.form.libType || '') + '"><datalist id="dl-types">' + o.types.map(t => '<option value="' + esc(t) + '">').join('') + '</datalist></div>' +
    '<div class="field" style="margin-top:12px"><label>حجم الورقة</label><input class="input" list="dl-sizes" data-k="libSize" value="' + esc(S.form.libSize || '') + '"><datalist id="dl-sizes">' + o.sizes.map(t => '<option value="' + esc(t) + '">').join('') + '</datalist></div>' +
    '<div class="field" style="margin-top:12px"><label>عدد النسخ المطبوعة</label><input class="input" type="number" inputmode="numeric" min="1" data-k="libQty" value="' + esc(S.form.libQty || '') + '"></div>' +
    '<div class="field" style="margin-top:12px"><label>المستوى الدراسي</label><div class="chips">' + levelsOf().map(l => '<button class="chip ' + (S.form.libLevel === l ? 'on' : '') + '" data-act="libLevel" data-l="' + esc(l) + '">' + esc(l) + '</button>').join('') + '</div></div>' +
    '<button class="btn" style="margin-top:14px" data-act="sendLib">' + ico('send') + ' إرسال التقرير إلى الإدارة</button>');
}

// ============================================================ notifications, statistics
function viewNotifications() {
  let h = banner('notifications', 'الإشعارات', 'رسائل الإدارة');
  const r = S.data['ads:' + S.center];
  if (!r) return h + skel();
  if (!r.messages.length) return h + '<div class="card muted">لا توجد رسائل من الإدارة.</div>';
  return h + r.messages.map((m, i) => '<div class="card"><div class="small">' + (m.broadcast ? 'إلى جميع الأساتذة' : 'موجّهة إليك') + (m.confirmed ? ' • ✓ تم التأكيد' : '') + '</div>' +
    '<div style="margin:8px 0;font-size:15px;line-height:1.7">' + esc(m.text) + '</div>' +
    (m.needsAnswer
      ? (m.answer ? '<div class="notice" style="margin-bottom:8px"><b>ردّك:</b> ' + esc(m.answer) + '</div>' : '') +
        '<textarea class="input" data-ans="' + m.row + '" placeholder="اكتب ردّك">' + esc(S.ans[m.row] || '') + '</textarea>' +
        '<button class="btn" style="margin-top:8px" data-act="ansMsg" data-i="' + i + '">إرسال الرد</button>'
      : (m.confirmed ? '' : '<button class="btn alt" style="margin-top:8px" data-act="ansMsg" data-i="' + i + '">تأكيد الاستلام</button>')) + '</div>').join('');
}
function viewStats() {
  let h = banner('bar_chart', 'إحصائياتي', CENTERS[S.center].nameAr);
  const s = S.data['stats:' + S.center];
  if (!s) return h + skel();
  const a = s.arrivals, tot = a.early + a.onTime + a.late;
  const pct = n => (tot ? Math.round(n * 100 / tot) : 0);
  h += card('schedule', 'الوصول إلى الحصة', tot
    ? '<div class="tiles4" style="grid-template-columns:repeat(3,1fr)"><div class="stat"><b>' + a.early + '</b><span>قبل الوقت</span></div><div class="stat"><b>' + a.onTime + '</b><span>في الوقت</span></div><div class="stat"><b>' + a.late + '</b><span>متأخر</span></div></div>' +
      '<div class="small" style="margin-top:8px">قبل الوقت ' + pct(a.early) + '٪ • في الوقت ' + pct(a.onTime) + '٪ • متأخر ' + pct(a.late) + '٪</div>'
    : '<div class="muted">لا توجد بيانات بعد.</div>');
  h += card('how_to_reg', 'الحصص المسجّلة', s.lessonRows.length
    ? s.lessonRows.map(r => '<div style="border-top:1px solid var(--line);padding:8px 0"><b>' + esc(r.level) + '</b><div class="small">' + Object.keys(r.counts).map(t => esc(t) + ': ' + r.counts[t]).join(' • ') + '</div></div>').join('')
    : '<div class="muted">لا توجد حصص مسجّلة بعد.</div>', 'b');
  h += card('groups', 'التلاميذ', s.students.map(x => '<div class="row" style="border-top:1px solid var(--line);padding:8px 0"><div class="grow"><b>' + esc(x.level) + '</b><div class="small">' + esc(x.subject) + '</div></div><span class="pill soft">' + x.students + ' تلميذ</span></div>').join(''));
  const rq = Object.keys(s.requests);
  h += card('campaign', 'الطلبات والشكايات', '<div class="small">' + (rq.length ? rq.map(k => esc(k) + ': ' + s.requests[k]).join(' • ') : 'لا توجد طلبات') + '</div>' +
    '<div class="small" style="margin-top:6px">الشكايات: ' + s.complaints + ' (أُجيب على ' + s.complaintsAnswered + ')</div>', 'b');
  h += card('forum', 'الإدارة', '<div class="small">رسائل الإدارة: ' + s.adminMessages + ' • الردود المرسلة: ' + s.answersSent + ' • الملاحظات المكتوبة: ' + s.notesWritten + '</div>');
  return h;
}

// ============================================================ how to use, settings
function viewHowTo() {
  return banner('menu_book', 'كيف تستعمل التطبيق', 'دليل مبسط خطوة بخطوة') +
    HOWTO.map((sec, i) => '<div class="card"><div class="row" style="margin-bottom:8px"><div class="iconTile ' + (i % 2 ? 'b' : 'a') + '">' + ico(sec.i) + '</div><b>' + (i + 1) + '. ' + esc(sec.t) + '</b></div>' +
      sec.s.map(x => '<div class="row" style="align-items:flex-start;margin-top:6px"><span style="width:7px;height:7px;border-radius:50%;background:var(--secondary);margin-top:8px;flex:0 0 auto"></span><span style="line-height:1.7">' + esc(x) + '</span></div>').join('') + '</div>').join('');
}
function viewSettings() {
  const opt = (v, l) => '<button class="chip ' + (S.theme === v ? 'on' : '') + '" data-act="theme" data-v="' + v + '">' + l + '</button>';
  return banner('settings', 'الإعدادات', 'المظهر وتحديث البيانات') +
    card('settings', 'المظهر', '<div class="chips">' + opt('system', 'حسب الجهاز') + opt('light', 'فاتح') + opt('dark', 'داكن') + '</div>') +
    card('refresh', 'البيانات', '<div class="muted">يحمّل من جديد الحصص والأرشيف والطلبات والإحصائيات.</div><button class="btn" style="margin-top:10px" data-act="refresh">' + ico('refresh') + ' تحديث البيانات</button>') +
    card('info', 'التطبيق', '<div class="row"><span class="grow">الإصدار</span><b>' + VERSION + '</b></div><div class="row" style="margin-top:6px"><span class="grow">نسخة</span><b>الويب (iPhone)</b></div>') +
    '<button class="btn danger" style="margin-top:4px" data-act="logout">' + ico('logout') + ' تسجيل الخروج</button>';
}

// ============================================================ actions
const actions = {
  drawer: () => { S.drawer = !S.drawer; paint(); },
  closeDrawer: () => { S.drawer = false; paint(); },
  closeFlags: (d, el, ev) => { if (ev && ev.target !== el && !ev.target.closest('.btn')) return; S.att.flagList = null; paint(); },
  go: async d => {
    S.dest = d.d; S.drawer = false;
    if (S.dest === 'menu') S.dest = 'home';
    paint();
    try { await ensure(S.dest); } catch (e) { toast(e.message); }
    paint();
  },
  refresh: async () => {
    toast('جاري التحديث…');
    S.data = {};
    Object.keys(localStorage).filter(k => k.indexOf('tg.c.') === 0).forEach(k => localStorage.removeItem(k));
    await ensure(S.dest);
    paint();
  },
  swap: () => {
    const cs = S.session.teacher.centers;
    S.center = cs[(cs.indexOf(S.center) + 1) % cs.length];
    save('tg.center', S.center);
    S.att = freshAtt(); S.arch = { level: null, data: null, mode: 'all', month: '', group: '', q: '' }; S.drawer = false;
    actions.go({ d: 'home' });
  },
  setCenter: async d => { S.center = d.c; save('tg.center', S.center); S.dest = 'home'; actions.go({ d: 'home' }); },
  theme: d => { S.theme = d.v; localStorage.setItem('tg.theme', S.theme); applyTheme(); paint(); },
  logout: (d, el, silent) => logout(silent === true),
  openTT: async d => {
    const l = S.data.tt.lessons[+d.i];
    if (l.center !== S.center) return toast('هذه الحصة في ' + CENTERS[l.center].nameAr + '. بدّل المركز أولاً.');
    S.dest = 'attendance'; S.drawer = false;
    paint();
    try { await ensure('attendance'); } catch (e) { toast(e.message); }
    const a = assignmentsOf().find(x => norm(x.level) === norm(l.level) && norm(x.subject) === norm(l.subject));
    await selectAssign(a, l);
  },
  selAssign: async d => { await selectAssign(assignmentsOf()[+d.i], null); },
  selGroup: async d => {
    S.att.group = +d.i < 0 ? null : S.att.groups[+d.i];
    S.att.codes = {}; S.att.exits = {};
    try { await loadStudents(); } catch (e) { toast(e.message); }
    paint();
  },
  selType: d => { S.att.type = d.t; paint(); },
  quick: d => {
    const row = d.row, f = d.f;
    const cur = (S.att.codes[row] || '').toUpperCase();
    let next;
    if (f === 'A' || f === '-') next = cur === f ? '' : f;
    else next = cur.includes(f) ? cur.replace(f, '') : f + cur.replace(/^A|^-/, '');
    S.att.codes[row] = next;
    paintRow(row);
    refreshSummary();
  },
  fillDash: () => { S.att.students.forEach(s => { if (!S.att.codes[s.row]) S.att.codes[s.row] = '-'; }); paint(); },
  save: async () => {
    if (S.att.busy) return;
    const a = S.att.assignment;
    if (!a) return toast('اختر المستوى والمادة.');
    const grades = {}, bad = [];
    S.att.students.forEach(s => {
      const raw = (S.att.codes[s.row] || '').trim().toUpperCase();
      if (!validCode(raw)) bad.push(s.name);
      grades[s.row] = raw === '' ? '-' : raw;
    });
    if (bad.length) return toast('رموز غير صالحة: ' + bad.slice(0, 3).join('، '));
    if (!timeOk(S.att.start)) return toast('أدخل وقت بداية الحصة.');
    if (!S.att.type) return toast('اختر نوع الحصة.');
    const exits = {};
    for (const slot of exitSlots()) {
      const v = (S.att.exits[slot.n] || '').trim() || S.att.end;
      if (!timeOk(v)) return toast('أدخل وقت الخروج لكل مجموعة (أو وقت نهاية الحصة).');
      exits[slot.n] = v;
    }
    S.att.busy = true; paint();
    try {
      const r = await api('save', { center: S.center, level: a.level, subject: a.subject, group: S.att.group ? S.att.group.name : null,
        date: todayKey(), start: S.att.start, type: S.att.type, exits: exits, grades: grades });
      toast(r.overwritten ? 'تم تحديث حصة اليوم' : 'تم حفظ الحصة');
      S.data.tt = null; localStorage.removeItem('tg.c.tt');
      S.att.codes = {};
      await loadStudents();
    } catch (e) { toast(e.message); }
    S.att.busy = false;
    paint();
  },
  archLevel: async d => {
    S.arch.level = d.l; S.arch.data = null; S.arch.group = ''; S.arch.month = ''; paint();
    try { S.arch.data = await swr('ar:' + S.center + ':' + d.l, () => api('archive', { center: S.center, level: d.l }), 300000); }
    catch (e) { toast(e.message); }
    paint();
  },
  archMode: d => { S.arch.mode = d.v; paint(); },
  archMonth: d => { S.arch.month = d.v; paint(); },
  archGroup: d => { S.arch.group = d.v; paint(); },
  notesPick: async d => {
    const a = assignmentsOf()[+d.i];
    Object.assign(S.notes, { newKey: a.level + '|' + a.subject, newLevel: a.level, newSubject: a.subject, newData: null, draft: {} });
    paint();
    try { S.notes.newData = await api('notes', { center: S.center, level: a.level }); } catch (e) { toast(e.message); }
    paint();
  },
  notesSaveNew: async () => {
    const n = S.notes, notes = {};
    Object.keys(n.draft).forEach(r => { const v = (n.draft[r] || '').trim(); if (v) notes[r] = v; });
    if (!Object.keys(notes).length) return toast('اكتب ملاحظة لتلميذ واحد على الأقل.');
    if (Object.keys(notes).some(r => wc(notes[r]) > 30)) return toast('الملاحظة تتجاوز 30 كلمة.');
    try {
      await api('saveNote', { center: S.center, level: n.newLevel, subject: n.newSubject, notes: notes });
      toast('تم حفظ الملاحظات');
      Object.assign(n, { newKey: null, newData: null, draft: {} });
      paint();
    } catch (e) { toast(e.message); }
  },
  allLevel: async d => {
    S.all = { level: d.l, data: null, mode: S.all.mode, edit: null, draft: {} };
    paint();
    try { S.all.data = await api('notes', { center: S.center, level: d.l }); } catch (e) { toast(e.message); }
    paint();
  },
  allMode: d => { S.all.mode = d.v; S.all.edit = null; paint(); },
  allEdit: d => {
    const c = +d.c;
    if (S.all.edit === c) S.all.edit = null;
    else {
      const col = S.all.data.columns.find(x => x.index === c);
      S.all.edit = c;
      S.all.draft = Object.assign({}, col.codes);
    }
    paint();
  },
  allSave: async d => {
    const notes = Object.assign({}, S.all.draft);
    if (Object.keys(notes).some(r => wc(notes[r]) > 30)) return toast('الملاحظة تتجاوز 30 كلمة.');
    try {
      await api('editNote', { center: S.center, level: S.all.level, col: +d.c, notes: notes });
      toast('تم حفظ التعديل');
      S.all.edit = null;
      S.all.data = await api('notes', { center: S.center, level: S.all.level });
      paint();
    } catch (e) { toast(e.message); }
  },
  qrSubmit: async () => {
    const code = (S.form.qrCode || '').trim();
    if (!code) return toast('اكتب الرمز أولاً.');
    try {
      const r = await api('qrScan', { center: S.center, code: code });
      S.form.qrCode = '';
      toast(r.outcome === 'in' ? 'تم تسجيل دخولك إلى المركز' : 'تم تسجيل خروجك من المركز');
      S.data['qr:' + S.center] = await api('qrToday', { center: S.center });
      paint();
    } catch (e) { toast(e.message); }
  },
  qrCamera: () => openCamera(),
  qrCameraStop: () => closeCamera(),
  reqType: d => { S.form.reqType = d.v; paint(); },
  sendReq: async () => {
    const type = S.form.reqType, details = (S.form.reqDetails || '').trim();
    if (!type) return toast('اختر نوع الطلب.');
    try {
      await api('submitRequest', { center: S.center, type: type, details: details });
      S.form.reqType = ''; S.form.reqDetails = '';
      localStorage.removeItem('tg.c.track:' + S.center);
      toast('تم إرسال الطلب'); paint();
    } catch (e) { toast(e.message); }
  },
  sendComp: async () => {
    const title = (S.form.compTitle || '').trim(), message = (S.form.compMsg || '').trim();
    if (!title || !message) return toast('أدخل العنوان والرسالة.');
    try {
      await api('submitComplaint', { center: S.center, title: title, message: message });
      S.form.compTitle = ''; S.form.compMsg = '';
      localStorage.removeItem('tg.c.track:' + S.center);
      toast('تم إرسال الشكاية'); paint();
    } catch (e) { toast(e.message); }
  },
  libLevel: d => { S.form.libLevel = d.l; paint(); },
  sendLib: async () => {
    try {
      await api('submitLibrary', { center: S.center, type: S.form.libType, size: S.form.libSize, quantity: S.form.libQty, level: S.form.libLevel });
      S.form.libQty = '';
      toast('تم إرسال التقرير إلى الإدارة'); paint();
    } catch (e) { toast(e.message); }
  },
  ansMsg: async d => {
    const m = S.data['ads:' + S.center].messages[+d.i];
    const answer = (S.ans[m.row] || '').trim();
    if (m.needsAnswer && !answer) return toast('اكتب ردّك أولاً.');
    try {
      await api('answerAd', { center: S.center, row: m.row, text: m.text, answer: answer });
      toast('تم الإرسال');
      S.data['ads:' + S.center] = await api('ads', { center: S.center });
      paint();
    } catch (e) { toast(e.message); }
  },
};

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.dataset.act === 'closeFlags' && e.target.closest('.sheet') && !e.target.closest('.btn')) return;
  const fn = actions[el.dataset.act];
  if (!fn) return;
  try { await fn(el.dataset, el, e); } catch (err) { toast(err.message || String(err)); }
});

// typing: no repaint (keeps the keyboard and the cursor)
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.code) {
    S.att.codes[t.dataset.code] = t.value.toUpperCase();
    t.value = S.att.codes[t.dataset.code];
    paintRow(t.dataset.code);
    refreshSummary();
  } else if (t.dataset.field === 'start' || t.dataset.field === 'end') S.att[t.dataset.field] = t.value;
  else if (t.dataset.exit) S.att.exits[t.dataset.exit] = t.value;
  else if (t.dataset.k) S.form[t.dataset.k] = t.value;
  else if (t.dataset.note) (S.dest === 'allnotes' ? S.all.draft : S.notes.draft)[t.dataset.note] = t.value;
  else if (t.dataset.ans) S.ans[t.dataset.ans] = t.value;
  else if (t.dataset.field === 'archQ') {
    S.arch.q = t.value;
    const pos = t.selectionStart;
    paint();
    const again = document.querySelector('[data-field="archQ"]');
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  }
});
document.addEventListener('focusout', () => { if (S.pending) setTimeout(() => { if (S.pending) paint(); }, 150); });

document.addEventListener('submit', async (e) => {
  if (e.target.dataset.form !== 'login') return;
  e.preventDefault();
  const btn = $('#lbtn');
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>';
  try {
    const u = $('#lu').value.trim();
    const p = $('#lp').value;
    const r = await api('login', { username: u, password: p });
    S.session = { username: u, token: r.token, teacher: r.teacher };
    save('tg.session', S.session);
    if (r.teacher.centers.length === 1) S.center = r.teacher.centers[0];
    else if (!(S.center && r.teacher.centers.indexOf(S.center) >= 0)) S.center = null;
    save('tg.center', S.center);
    S.dest = 'home';
    if (S.center) await actions.go({ d: 'home' }); else paint();
  } catch (err) {
    toast(err.message);
    btn.disabled = false; btn.textContent = 'تسجيل الدخول';
  }
});

function logout(silent) {
  S.session = null; S.center = null; S.data = {}; S.att = freshAtt(); S.drawer = false; S.dest = 'home';
  localStorage.removeItem('tg.session'); localStorage.removeItem('tg.center');
  Object.keys(localStorage).filter(k => k.indexOf('tg.c.') === 0).forEach(k => localStorage.removeItem(k));
  if (silent) toast('انتهت الجلسة. سجّل الدخول من جديد.');
  paint();
}

// ============================================================ camera scan (only where the browser has a QR reader)
async function openCamera() {
  if (!('BarcodeDetector' in window) || !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    return toast('المسح بالكاميرا غير مدعوم في هذا المتصفح. اكتب الرمز يدوياً.');
  }
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'camov';
  ov.innerHTML = '<div class="sheet" style="text-align:center"><video id="cam" class="video-box" playsinline muted autoplay></video>' +
    '<button class="btn alt" style="margin-top:12px" data-act="qrCameraStop">إغلاق</button></div>';
  document.body.appendChild(ov);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    S.cam = stream;
    const v = document.getElementById('cam');
    v.srcObject = stream;
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const tick = async () => {
      if (!S.cam) return;
      try {
        const found = await detector.detect(v);
        if (found.length) {
          closeCamera();
          S.form.qrCode = found[0].rawValue;
          paint();
          await actions.qrSubmit();
          return;
        }
      } catch (e) { /* keep scanning */ }
      S.camTimer = setTimeout(tick, 400);
    };
    tick();
  } catch (e) {
    closeCamera();
    toast('لا يمكن فتح الكاميرا. اكتب الرمز يدوياً.');
  }
}
function closeCamera() {
  if (S.cam) { S.cam.getTracks().forEach(t => t.stop()); S.cam = null; }
  clearTimeout(S.camTimer);
  const ov = document.getElementById('camov');
  if (ov) ov.remove();
}

// ============================================================ theme and start
function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark', !!dark);
}

(function start() {
  applyTheme();
  if (S.session && S.center) {
    paint();                    // shows at once what is saved on the phone
    actions.go({ d: S.dest });  // then loads what is new
  } else {
    paint();
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
