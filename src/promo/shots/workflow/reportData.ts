// Report payloads re-typeset from the customer screenshots. The hero card is
// the complete profile report the user supplied on 2026-10-30
// (screenshot/用户信息卡.jpg); every wall entry below is invented data in the
// same shape — no real nicknames, IDs or accounts.

export type ReportTone = 'new' | 'existing';

export type ReportRow =
  | { t: 'pair'; a: Kv; b: Kv }
  | { t: 'kv'; icon: string; label: string; value: string }
  | { t: 'txt'; icon: string; text: string }
  | { t: 'src'; icon: string; label: string; value: string; note: string }
  | { t: 'heat'; icon: string; label: string; value: string }
  | { t: 'sum'; icon: string; label: string; text: string }
  | { t: 'gap' }
  | { t: 'section'; icon: string; title: string; accent?: 'green' }
  | { t: 'bullet'; icon?: string; label: string; text: string }
  | { t: 'note'; icon: string; label: string; code: string };

type Kv = { icon: string; label: string; value: string };

export type SectionSpan = { icon: string; title: string; accent?: 'green'; from: number; to: number };

export type Report = {
  key: string;
  tone: ReportTone;
  name: string;
  serial: string;
  rows: ReportRow[];
  sections?: SectionSpan[];
  // The complete card is typeset denser than the feed tiles so it can sit in
  // one 3D pose on screen; every metric below is derived from this factor.
  typeScale?: number;
};

export const CARD_W = 838;

export const CARD_BG = '#FFFFFF';
export const INK = '#1D2129';
export const MUTED = '#8A9099';
export const REPORT_SHADOW = '0 44px 130px rgba(0,0,0,0.62), 0 0 0 1px rgba(0,0,0,0.06)';

export const TONE = {
  existing: {
    headBg: '#FCEDEA',
    headLine: '#F3D8D3',
    title: '#C0271E',
    glow: 'rgba(192,39,30,0.30)',
  },
  new: {
    headBg: 'linear-gradient(90deg,#D8F6D6 0%,#E2F8E1 48%,#E8F9E7 100%)',
    headLine: '#D3EBD2',
    title: '#1F7D33',
    glow: 'rgba(31,125,51,0.30)',
  },
} as const;

// --- layout ----------------------------------------------------------------

export type Metrics = {
  width: number;
  padX: number;
  padTop: number;
  padBottom: number;
  headFont: number;
  headH: number;
  body: number;
  line: number;
  rowH: number;
  gapH: number;
  secFont: number;
  secH: number;
  bulletLead: number;
};

export const metrics = (typeScale = 1, width = CARD_W): Metrics => ({
  width,
  padX: 30 * typeScale,
  padTop: 22 * typeScale,
  padBottom: 26 * typeScale,
  headFont: 33 * typeScale,
  headH: 89 * typeScale,
  body: 30 * typeScale,
  line: 40 * typeScale,
  rowH: 40 * typeScale,
  gapH: 18 * typeScale,
  secFont: 30 * typeScale,
  secH: 56 * typeScale,
  bulletLead: 24 * typeScale,
});

const wide = (cp: number) =>
  (cp >= 0x2e80 && cp <= 0x9fff) ||
  (cp >= 0x3000 && cp <= 0x303f) ||
  (cp >= 0xff00 && cp <= 0xffef) ||
  (cp >= 0x1f000 && cp <= 0x1faff);

// Deterministic stand-in for the browser's line breaking: CJK glyphs are one em
// wide, Latin runs a little over half. The 0.97 safety keeps a row's declared
// height at or above what the font actually wraps to.
const advance = (ch: string, fs: number) => {
  const cp = ch.codePointAt(0) ?? 0;
  if (ch === ' ') return fs * 0.3;
  if (wide(cp)) return fs;
  if (/[A-Z0-9%@#&]/.test(ch)) return fs * 0.64;
  return fs * 0.53;
};

export const wrapLines = (text: string, fs: number, width: number) => {
  let lines = 1;
  let w = 0;
  for (const ch of text) {
    const a = advance(ch, fs);
    if (w + a > width * 0.97) {
      lines += 1;
      w = a;
    } else {
      w += a;
    }
  }
  return lines;
};

const bulletText = (row: Extract<ReportRow, { t: 'bullet' }>) =>
  `${row.icon ? `${row.icon} ` : ''}${row.label} ${row.text}`;

export const rowHeight = (row: ReportRow, m: Metrics): number => {
  const iconCol = 38 * (m.body / 30) + 10 * (m.body / 30);
  const textW = m.width - 2 * m.padX;
  switch (row.t) {
    case 'gap':
      return m.gapH;
    case 'section':
      return m.secH;
    case 'bullet':
      return wrapLines(bulletText(row), m.body, textW - m.bulletLead) * m.line;
    case 'note':
      return m.line;
    case 'sum':
      return wrapLines(`${row.label} ${row.text}`, m.body, textW - iconCol) * m.line;
    default:
      return m.rowH;
  }
};

export const reportHeight = (r: Report) => {
  const m = metrics(r.typeScale ?? 1);
  return Math.round(m.headH + m.padTop + m.padBottom + r.rows.reduce((n, row) => n + rowHeight(row, m), 0));
};

export type SectionBox = SectionSpan & { top: number; height: number };

export const sectionBoxes = (r: Report): SectionBox[] => {
  const m = metrics(r.typeScale ?? 1);
  const tops: number[] = [];
  let y = m.headH + m.padTop;
  for (const row of r.rows) {
    tops.push(y);
    y += rowHeight(row, m);
  }
  return (r.sections ?? []).map((s) => {
    let h = 0;
    for (let i = s.from; i <= s.to; i++) h += rowHeight(r.rows[i], m);
    return { ...s, top: tops[s.from], height: h };
  });
};

// --- hero cards ------------------------------------------------------------

export const HERO_FULL: Report = {
  key: 'serien',
  tone: 'new',
  name: 'Serien',
  serial: '8362',
  typeScale: 0.72,
  rows: [
    ...IDENTITY('2596715', '未识别', 'BigBearRick75', 'android/samsung SM-S906U', '2026/10/29 22:50:37'),
    { t: 'gap' },
    { t: 'kv', icon: '🚀', label: '发现新用户', value: '(未注册)' },
    { t: 'txt', icon: '✨', text: '此用户暂无归属，建议立即跟进!' },
    SOURCE('Ysan'),
    { t: 'gap' },
    HEAT('7'),
    SUM('一位来自加州圣何塞的市政排水行业男性从业者，性格直接务实、略带被动，主动表达交友意愿并配合完成了平台迁移。'),
    { t: 'gap' },
    { t: 'section', icon: '👤', title: '基础信息' },
    BULLET('姓名:', 'Rick'),
    BULLET(
      '年龄:',
      '30-45岁（用词完整正式、回答简短务实，不像年轻网生代的重度俚语使用者，推测为成年职场人）',
    ),
    BULLET('地区:', '美国加州圣何塞（San Jose, California）'),
    BULLET('职业:', '市政部门排水/下水道系统从业人员（公共服务/蓝领技术岗）'),
    { t: 'gap' },
    { t: 'section', icon: '💗', title: '心理与意图' },
    BULLET('性格标签:', '务实直率，礼貌克制，好奇心强，配合度高，偏被动'),
    BULLET(
      '兴趣爱好:',
      '纹身话题（表现出兴趣并追问），本职工作相关（愿意主动说明职业），线上社交/聊天',
    ),
    BULLET(
      '沟通风格:',
      '简短直接、实话实说，多用完整句子和句号，不擅长也不热衷调侃打趣；会主动反问（"And you?" "Where are you located?"）来表达关心，但对对方抛出的玩笑话（如纹身恶搞图）反应较平淡，更偏向配合执行而非热烈回应。',
    ),
    BULLET(
      '交友意图:',
      '以交友/闲聊为切入，但主动示好并全程配合迁移到私聊平台，带有发展进一步亲密关系（约会或暧昧）的潜在意图，尚不能确定是否认真长期。',
    ),
    BULLET(
      '吸引点:',
      '对方热情活泼、会开玩笑的氛围，以及"想给你看纹身图"这种制造私密分享感的钩子；整体被对方的主动搭话和持续追问所吸引。',
    ),
    { t: 'gap' },
    { t: 'section', icon: '⚠️', title: '风险评估（等级: 低）' },
    BULLET(
      '风险提示:',
      '无。用户全程礼貌、无骚扰、无索取财物或隐私信息的行为。需注意: 他对平台迁移指令配合度极高、防备心较低，属于容易被引导的类型，后续应避免让其产生被套路感。',
    ),
    { t: 'gap' },
    { t: 'section', icon: '💡', title: '运营跟进建议', accent: 'green' },
    BULLET(
      '建议语气:',
      '真诚自然、亲切随和，偏正常聊天而非过度撒娇或高强度网感俚语；适度主动提问以带动节奏，因为他本人话少、偏被动。',
    ),
    BULLET(
      '破冰建议:',
      '"嗨 Rick，我是 Mary～终于把你加上啦！刚忙完一点事，抱歉让你等。你在圣何塞那边上班通勤远吗？还有你之前说的排水那摊子活儿，是不是每天都在跟各种奇葩状况打交道哈哈。"',
      '💬',
    ),
    { t: 'note', icon: '🆔', label: 'Note / 会话ID:', code: '6951130561449542661_GZO2EJLGZB' },
  ],
  sections: [],
};

// Section spans are derived once so the scan never has to search the row list.
// Trailing gaps belong to no section: the highlight box and the lifted panel
// both have to sit tight against the last line of copy.
HERO_FULL.sections = (() => {
  const out: SectionSpan[] = [];
  HERO_FULL.rows.forEach((row, i) => {
    if (row.t !== 'section') return;
    if (out.length) out[out.length - 1].to = i - 1;
    out.push({ icon: row.icon, title: row.title, accent: row.accent, from: i, to: i });
  });
  if (out.length) out[out.length - 1].to = HERO_FULL.rows.length - 1;
  for (const s of out) {
    while (s.to > s.from && HERO_FULL.rows[s.to].t === 'gap') s.to -= 1;
  }
  return out;
})();

// The lifted panel re-typesets one section at a size meant to be read, so it
// gets its own metrics rather than a scaled copy of the card.
export const PANEL_W = 800;
export const PANEL_PAD = 32;
export const PANEL_STRIP = 56;

// The lifted panel is the only text in S066 meant to be read; 32px body keeps
// it on §7.3 Q11's floor while the card itself stays a document at 21.6px.
export const panelMetrics = (width = PANEL_W): Metrics => ({
  width,
  padX: 34,
  padTop: 0,
  padBottom: 0,
  headFont: 0,
  headH: 0,
  body: 32,
  line: 42,
  rowH: 42,
  gapH: 18,
  secFont: 36,
  secH: 0,
  bulletLead: 30,
});

export const sectionPanelHeight = (r: Report, s: SectionSpan, width = PANEL_W) => {
  const m = panelMetrics(width);
  const body = r.rows
    .slice(s.from + 1, s.to + 1)
    .filter((row) => row.t !== 'gap')
    .reduce((n, row) => n + rowHeight(row, m), 0);
  return Math.round(PANEL_PAD * 2 + PANEL_STRIP + body);
};

export const HERO_NEW: Report = {
  key: 'shawn',
  tone: 'new',
  name: 'Shawn',
  serial: '8363',
  rows: [
    ...IDENTITY('2593190', '未识别', 'lGary Pritchett', 'android/motorola moto g play - 2023', '2026/10/29 17:01:47'),
    { t: 'gap' },
    { t: 'kv', icon: '🚀', label: '发现新用户', value: '(未注册)' },
    { t: 'txt', icon: '✨', text: '此用户暂无归属，建议立即跟进!' },
    SOURCE('Natalie'),
    { t: 'gap' },
    HEAT('7'),
    SUM(
      '一位来自北卡罗来纳州夏洛特、原籍萨凡纳的60岁左右男性，性格直率但多疑，不擅长使用新应用，渴望陪伴和聊天，最终在耐心引导下给出了Oumi ID。',
    ),
    { t: 'gap' },
    { t: 'section', icon: '👤', title: '基础信息' },
    BULLET('姓名:', 'Shawn'),
    BULLET('年龄:', '55-65岁（对新应用明显陌生、话题围绕陪伴，推测为年长用户）'),
    BULLET('地区:', '美国北卡罗来纳州夏洛特（Charlotte, North Carolina），原籍萨凡纳'),
    BULLET('职业:', '退休人员（日常空闲时间多，白天在线）'),
    { t: 'gap' },
    { t: 'section', icon: '💗', title: '心理与意图' },
    BULLET('性格标签:', '直率但多疑，对陌生应用戒备心强，渴望陪伴和聊天'),
    BULLET('兴趣爱好:', '日常闲聊与陪伴话题（愿意反复确认对方身份），线上社交/聊天'),
    BULLET('沟通风格:', '用词老派、句子完整；不擅长使用新应用，需要一步步引导操作。'),
    BULLET('交友意图:', '以找人说话解闷为切入，情感需求明确；在耐心引导下最终给出了Oumi ID。'),
    { t: 'gap' },
    { t: 'section', icon: '⚠️', title: '风险评估（等级: 低）' },
    BULLET('风险提示:', '无。用户的警惕来自陌生感而非恶意；引导流程放慢后配合度明显提升。'),
    { t: 'gap' },
    { t: 'section', icon: '💡', title: '运营跟进建议', accent: 'green' },
    BULLET('建议语气:', '耐心安抚、放慢节奏；多用完整句子给足安全感，避免一次性抛多个问题。'),
    BULLET('破冰建议:', '"嗨 Shawn，我是 Mary～不着急，一步一步来就好。你平时都喜欢聊些什么呀？"', '💬'),
    { t: 'note', icon: '🆔', label: 'Note / 会话ID:', code: '6951130561449549277_QW3RMTAC' },
  ],
};

function IDENTITY(id: string, level: string, nick: string, device: string, time: string): ReportRow[] {
  return [
    {
      t: 'pair',
      a: { icon: '📱', label: 'Oumi ID:', value: id },
      b: { icon: '💎', label: 'TikTok等级:', value: level },
    },
    { t: 'kv', icon: '👤', label: 'Tk昵称:', value: nick },
    { t: 'kv', icon: '💻', label: '设备型号:', value: device },
    { t: 'kv', icon: '⏰', label: '收集时间:', value: time },
  ];
}

function SOURCE(account: string): ReportRow {
  return {
    t: 'src',
    icon: '📋',
    label: '用户画像分析报告',
    value: account,
    note: '(未在映射表中找到)',
  };
}

function HEAT(value: string): ReportRow {
  return { t: 'heat', icon: '🔥', label: '客户热度:', value };
}

function SUM(text: string): ReportRow {
  return { t: 'sum', icon: '📝', label: '画像摘要:', text };
}

function BULLET(label: string, text: string, icon?: string): ReportRow {
  return { t: 'bullet', icon, label, text };
}

// --- long-form tail ---------------------------------------------------------
// The feed wall renders the same long report as the hero card (user's
// screenshot/用户信息卡.jpg): identity header plus the four profile sections.
// Everything below is deterministic pool sampling over invented data — no real
// nicknames, IDs or accounts.

const h01 = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const pick = <T,>(pool: readonly T[], n: number) => pool[Math.floor(h01(n) * pool.length) % pool.length];

const AGE = [
  '18-24岁（学生口吻明显，夜间活跃，推测为在校学生）',
  '20-28岁（用词随意、俚语多，推测为年轻网生代用户）',
  '25-35岁（回复节奏稳定，推测为已经工作的年轻人）',
  '30-45岁（用词完整正式、回答简短务实，推测为成年职场人）',
  '35-50岁（话题围绕家庭与收入，推测为中年用户）',
] as const;
const REGION = [
  '尼日利亚拉各斯（Lagos, Nigeria）',
  '尼日利亚伊巴丹（Ibadan, Nigeria）',
  '尼日利亚阿布贾（Abuja, Nigeria）',
  '尼日利亚阿比亚州（Abia, Nigeria）',
  '加纳阿克拉（Accra, Ghana）',
  '南非约翰内斯堡（Johannesburg, South Africa）',
] as const;
const JOB = [
  '市场摊贩（个体经营/日结收入）',
  '网约车司机（蓝领技术岗）',
  '在校学生（无固定收入）',
  '理发师（社区门店/手艺人）',
  '仓库分拣员（物流/体力岗）',
  '自由职业者（线上接单/收入不稳定）',
] as const;
const TRAIT = [
  '热情外向，回复快，好奇心强，配合度高',
  '务实直率，礼貌克制，好奇心强，偏被动',
  '谨慎多疑，提问多、表态慢，需要安抚',
  '急热型，开场就问有没有真人回复，掉线也快',
  '话少被动，但话题对上后回复长度明显增加',
] as const;
const HOBBY = [
  '音乐话题（表现出兴趣并追问），线上社交/聊天',
  '足球话题（主动追问联赛赛果），线上社交/聊天',
  '工作与收入话题（愿意主动说明职业），线上社交/聊天',
  '拍照分享话题（主动发生活照），线上社交/聊天',
  '家庭话题（聊到家人时明显更活跃），线上社交/聊天',
] as const;
const STYLE = [
  '简短直接、多用短句，不擅长调侃打趣；对玩笑反应平淡，更偏向配合执行。',
  '回复快但内容短，多用省略句；对方追问时才展开，需要提问式引导。',
  '用词完整正式、回答简短务实；不主动开启新话题，跟随对方节奏。',
  '语气随意、爱用表情包；对玩笑话反应热烈，容易聊偏，需要适时拉回主题。',
] as const;
const INTENT = [
  '以交友/闲聊为切入，配合度高，带有发展进一步亲密关系的潜在意图，尚不能确定是否认真长期。',
  '主要想找真人聊天解闷，对平台功能兴趣一般，留存依赖持续在线感。',
  '以交友为切入但对价格敏感，反复确认收费后犹豫，转化需要优惠钩子。',
  '主动示好并愿意分享日常，情感需求明确，但回复窗口集中在夜间。',
] as const;
const HOOK = [
  '对方热情活泼、会开玩笑的氛围；整体被对方的主动搭话和持续追问所吸引。',
  '"想给你看照片"这类制造私密分享感的钩子；被对方的关注和夸赞所吸引。',
  '被"有真人在乎"的感觉吸引；对及时回复和点名问候反应最好。',
  '对共同话题（工作/足球/音乐）产生共鸣；被对方的耐心追问所吸引。',
] as const;
const RISK_LOW = [
  '无。用户全程礼貌、无骚扰、无索取财物或隐私信息的行为，属于容易引导的类型，后续应避免让其产生被套路感。',
  '无。用户配合度高、防备心较低；需注意其对平台指令的配合度，避免过度承诺。',
] as const;
const RISK_MID = [
  '中。用户对收费话题敏感、曾两次试探性询问价格；后续应先建立信任再谈充值，避免催促。',
  '中。用户活跃时间不规律、多次掉线；跟进节奏应放缓，避免连续追问引发反感。',
] as const;
const TONE_ADVICE = [
  '真诚自然、亲切随和，偏正常聊天而非过度撒娇或高强度网感俚语；适度主动提问以带动节奏。',
  '轻松幽默、多用表情包；先接住对方的玩笑再拉回主题，节奏可以快一点。',
  '耐心安抚、放慢节奏；多用完整句子给足安全感，避免一次性抛多个问题。',
  '直接务实、少绕弯子；明确告知下一步动作，配合其务实的沟通习惯。',
] as const;
const ice = (first: string) =>
  [
    `"嗨 ${first}，我是 Mary～终于把你加上啦！刚忙完一点事，抱歉让你等。今天过得怎么样？"`,
    `"嗨 ${first}，我是 Mary～刚看到你在线就过来打个招呼。最近都在忙些什么呀？"`,
    `"嗨 ${first}，我是 Mary～不着急慢慢聊。你平时这个点都这么精神吗？"`,
    `"嗨 ${first}，我是 Mary～很高兴加上你！你那边今天天气怎么样？"`,
  ] as const;

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const noteCode = (seed: number) => {
  const digits = `${Math.floor(h01(seed * 41.3) * 1e9)}${Math.floor(h01(seed * 67.9) * 1e9)}`
    .padStart(17, '0')
    .slice(0, 17);
  let suf = '';
  for (let i = 0; i < 8; i++) suf += ALPHA[Math.floor(h01(seed * 7.31 + i * 3.77) * 26) % 26];
  return `${digits}_${suf}`;
};

// Appends the four profile sections + session note so a feed tile carries the
// same long-form shape as the hero card.
const longTail = (first: string, seed: number): ReportRow[] => {
  const mid = h01(seed * 3.3) > 0.5;
  return [
    { t: 'gap' },
    { t: 'section', icon: '👤', title: '基础信息' },
    BULLET('姓名:', first),
    BULLET('年龄:', pick(AGE, seed * 3.1)),
    BULLET('地区:', pick(REGION, seed * 5.9)),
    BULLET('职业:', pick(JOB, seed * 8.3)),
    { t: 'gap' },
    { t: 'section', icon: '💗', title: '心理与意图' },
    BULLET('性格标签:', pick(TRAIT, seed * 11.3)),
    BULLET('兴趣爱好:', pick(HOBBY, seed * 13.7)),
    BULLET('沟通风格:', pick(STYLE, seed * 17.1)),
    BULLET('交友意图:', pick(INTENT, seed * 19.9)),
    BULLET('吸引点:', pick(HOOK, seed * 23.3)),
    { t: 'gap' },
    { t: 'section', icon: '⚠️', title: `风险评估（等级: ${mid ? '中' : '低'}）` },
    BULLET('风险提示:', mid ? pick(RISK_MID, seed * 29.7) : pick(RISK_LOW, seed * 31.1)),
    { t: 'gap' },
    { t: 'section', icon: '💡', title: '运营跟进建议', accent: 'green' },
    BULLET('建议语气:', pick(TONE_ADVICE, seed * 37.3)),
    BULLET('破冰建议:', pick(ice(first), seed * 41.9), '💬'),
    { t: 'note', icon: '🆔', label: 'Note / 会话ID:', code: noteCode(seed) },
  ];
};

// --- wall entries -----------------------------------------------------------

type Spec = [
  name: string,
  serial: string,
  id: string,
  nick: string,
  device: string,
  time: string,
  tone: ReportTone,
  owner: string,
  charge: string,
  heat: string,
  summary?: string,
];

const SPECS: Spec[] = [
  ['Blessing Uche', '8338', '2588104', 'Blessing U.', 'android/tecno SPARK 20C', '2026/10/29 16:41:02', 'new', '', '', '6/10'],
  ['Daniel Okafor', '8339', '2588137', 'Big D.', 'App Store/iPhone 12', '2026/10/29 16:41:55', 'existing', 'carter', '$42.10', '5/10'],
  ['Amaka Peters', '8340', '2588201', 'Amaka P.', 'android/itel S661L', '2026/10/29 16:42:38', 'new', '', '', '8/10', '拉斐尔州来的年轻用户，开场就问有没有真人回复，愿意交换联系方式，注册卡在验证码一步。'],
  ['Tunde Bakare', '8341', '2588266', 'Tunde B', 'android/samsung Galaxy A14', '2026/10/29 16:43:20', 'existing', 'noah', '$218.40', '7/10'],
  ['Grace Effiom', '8342', '2588312', 'Grace E.', 'android/innjoi 20', '2026/10/29 16:44:07', 'new', '', '', '9/10'],
  ['Chidi Nwosu', '8343', '2588378', 'Chidi N.', 'App Store/iPhone 11', '2026/10/29 16:45:12', 'existing', 'mia', '$9.99', '4/10', '只关心能不能视频，问了三次价格后沉默，属于比价型用户，建议给首充优惠再试一轮。'],
  ['Zainab Aliyu', '8344', '2588440', 'Zainab A', 'android/nokia C32', '2026/10/29 16:46:03', 'new', '', '', '7/10'],
  ['Kemi Adeyemi', '8345', '2588507', 'Mama Kemi', 'android/tecno POP 8', '2026/10/29 16:46:58', 'existing', 'leo', '$76.25', '6/10'],
  ['Kelvin Ojiko', '8346', '2588562', 'Kelvin Oji', 'android/redmi Note 12', '2026/10/29 16:47:44', 'new', '', '', '5/10', '拉各斯的在校学生，语气随意、回复慢，主要想要免费礼物码，转化窗口在考试季之后。'],
  ['Ifunanya Bell', '8347', '2588618', 'Ify Beauty', 'App Store/iPhone XR', '2026/10/29 16:48:31', 'existing', 'carter', '$133.70', '8/10'],
  ['Yusuf Aisha', '8348', '2588675', 'Aisha Y.', 'android/huawei Y7 Prime', '2026/10/29 16:49:19', 'new', '', '', '6/10'],
  ['Emeka Vaugh', '8349', '2588731', 'Emeka V.', 'android/motorola moto e13', '2026/10/29 16:50:06', 'existing', 'noah', '$27.00', '5/10'],
  ['Nneka Obi', '8350', '2588788', 'Nneka I.', 'android/gree H970', '2026/10/29 16:50:52', 'new', '', '', '7/10', 'Abia 州用户，白天不在线、只在晚上九点后回复，聊家庭话题时明显更活跃。'],
  ['Sunny Eze', '8351', '2588844', 'Sunny E.', 'App Store/iPhone 14 Pro', '2026/10/29 16:51:40', 'existing', 'mia', '$512.30', '9/10'],
  ['Bola Salami', '8352', '2588901', 'Bola S.', 'android/oppo A16k', '2026/10/29 16:52:27', 'new', '', '', '4/10'],
  ['Nonso Okeke', '8353', '2588957', 'Nonso O.', 'android/vivo Y21', '2026/10/29 16:53:15', 'existing', 'leo', '$61.80', '6/10'],
  ['Yewande Ade', '8354', '2589013', 'Yewande A', 'android/tecno CAMON 20', '2026/10/29 16:54:03', 'new', '', '', '8/10'],
  ['Obi Patrick', '8355', '2589068', 'Papi Obi', 'App Store/iPhone SE (2nd generation)', '2026/10/29 16:54:50', 'existing', 'carter', '$18.50', '5/10'],
  ['Femi Dogbe', '8356', '2589124', 'Femi D.', 'android/samsung Galaxy A05', '2026/10/29 16:55:38', 'new', '', '', '7/10', '阿克拉用户，主要用语音消息，说话直接、要求尽快见面，属于高意向但需要人工接手。'],
  ['Jayden Korma', '8357', '2589181', 'Jayden K.', 'android/itel A49', '2026/10/29 16:56:25', 'existing', 'noah', '$95.40', '6/10'],
  ['Uche Kalu', '8358', '2589238', 'Uche K.', 'android/infinix HOT 30i', '2026/10/29 16:57:12', 'new', '', '', '9/10'],
  ['Damilare Ayo', '8359', '2589294', 'Dami A.', 'App Store/iPhone 13 Pro Max', '2026/10/29 16:58:00', 'existing', 'mia', '$244.60', '8/10'],
  ['Tobi Fisher', '8360', '2589351', 'Tobi F.', 'android/nokia 2.4', '2026/10/29 16:58:48', 'new', '', '', '5/10'],
  ['Lola Martins', '8361', '2589407', 'Lola M.', 'android/realme C30', '2026/10/29 16:59:35', 'existing', 'leo', '$37.90', '6/10'],
  ['Tolu Ogun', '8362', '2589463', 'Tolu O.', 'android/honor X7', '2026/10/29 17:00:23', 'new', '', '', '7/10', '拉各斯岛上的自由职业者，白天在线但不回长消息，短句+语音的组合回复率最高。'],
  ['Segun Ilesanmi', '8364', '2593216', 'Segun I.', 'android/oneplus Nord', '2026/10/29 17:02:36', 'existing', 'carter', '$156.20', '8/10'],
  ['Funke Adeoti', '8365', '2593272', 'Funke A.', 'App Store/iPhone 15', '2026/10/29 17:03:24', 'new', '', '', '9/10', '伊巴丹的用户，主动问注册时间有没有活动，对新手引导需求强，适合安排人工首聊。'],
  ['Blessing Uche', '8366', '2593329', 'Blessing U.', 'android/tecno SPARK 10', '2026/10/29 17:04:11', 'existing', 'noah', '$71.35', '6/10'],
];

const build = (s: Spec, i: number): Report => {
  const [name, serial, id, nick, device, time, tone, owner, charge, heat, summary] = s;
  const rows: ReportRow[] = [...IDENTITY(id, '未识别', nick, device, time), { t: 'gap' }];
  if (tone === 'new') {
    rows.push(
      { t: 'kv', icon: '🚀', label: '发现新用户', value: '(未注册)' },
      { t: 'txt', icon: '✨', text: '此用户暂无归属，建议立即跟进!' },
      SOURCE('Natalie'),
    );
  } else {
    rows.push(
      { t: 'kv', icon: '🚫', label: '撞单警告:', value: '已存在的老用户' },
      { t: 'kv', icon: '👤', label: '归属运营:', value: owner },
      { t: 'kv', icon: '💰', label: '累计充值:', value: charge },
      SOURCE('Karri'),
    );
  }
  rows.push({ t: 'gap' }, HEAT(heat));
  if (summary) rows.push(SUM(summary));
  rows.push(...longTail(name.split(' ')[0], i + 101));
  return { key: `w${i}`, tone, name, serial, rows };
};

export const WALL_REPORTS: Report[] = SPECS.map(build);

// --- generated wall entries -------------------------------------------------
// The far half of the feed renders as ghosts (texture zone, §6.2), so only the
// near tiles ever need hand-written copy. Everything is deterministic pool
// sampling — no Math.random, no real nicknames or accounts.

const FIRST = [
  'Blessing', 'Daniel', 'Amaka', 'Tunde', 'Grace', 'Chidi', 'Zainab', 'Kemi', 'Kelvin', 'Ifunanya',
  'Yusuf', 'Emeka', 'Nneka', 'Sunny', 'Bola', 'Nonso', 'Yewande', 'Obi', 'Femi', 'Jayden',
  'Uche', 'Damilare', 'Tobi', 'Lola', 'Tolu', 'Segun', 'Funke', 'Ebere', 'Chuka', 'Halima',
] as const;
const LAST = [
  'Uche', 'Okafor', 'Peters', 'Bakare', 'Effiom', 'Nwosu', 'Aliyu', 'Adeyemi', 'Ojiko', 'Bell',
  'Aisha', 'Vaugh', 'Obi', 'Eze', 'Salami', 'Okeke', 'Ade', 'Patrick', 'Dogbe', 'Korma',
  'Kalu', 'Ayo', 'Fisher', 'Martins', 'Ogun', 'Ilesanmi', 'Adeoti', 'Bello', 'Sanni', 'Nwake',
] as const;
const NICK = [
  'Wisdom prego', 'Big D.', 'Amaka P.', 'Tunde B', 'Grace E.', 'Chidi N.', 'Zainab A', 'Mama Kemi',
  'Kelvin Oji', 'Ify Beauty', 'Aisha Y.', 'Emeka V.', 'Nneka I.', 'Sunny E.', 'Bola S.', 'Nonso O.',
  'Yewande A', 'Papi Obi', 'Femi D.', 'Jayden K.', 'Uche K.', 'Dami A.', 'Tobi F.', 'Lola M.',
  'Tolu O.', 'Segun I.', 'Funke A.', 'Ebere N.', 'Chuka B.', 'Halima S.',
] as const;
const DEVICE = [
  'android/tecno SPARK 20C', 'android/itel S661L', 'App Store/iPhone 12', 'android/samsung Galaxy A14',
  'android/innjoi 20', 'android/nokia C32', 'android/tecno POP 8', 'App Store/iPhone 11',
  'android/redmi Note 12', 'android/huawei Y7 Prime', 'android/motorola moto e13', 'android/gree H970',
  'App Store/iPhone XR', 'android/oppo A16k', 'android/vivo Y21', 'android/tecno CAMON 20',
  'android/samsung Galaxy A05', 'App Store/iPhone 14 Pro', 'android/itel A49', 'android/infinix HOT 30i',
  'android/nokia 2.4', 'App Store/iPhone 13 Pro Max', 'android/realme C30', 'android/honor X7',
  'android/oneplus Nord', 'App Store/iPhone SE (2nd generation)',
] as const;
const OWNER = ['carter', 'noah', 'mia', 'leo', 'ivy', 'rex'] as const;
const SOURCE_ACCT = ['Natalie', 'Karri', 'Vera', 'Mona', 'Ivy', 'Rosa', 'Tessa', 'Bree'] as const;
const CHARGE = ['$9.99', '$18.50', '$27.00', '$37.90', '$42.10', '$61.80', '$76.25', '$95.40', '$133.70', '$218.40', '$244.60', '$512.30'] as const;
const HEAT_POOL = ['4/10', '5/10', '6/10', '7/10', '8/10', '9/10'] as const;
const SUMMARY = [
  '拉斐尔州来的年轻用户，开场就问有没有真人回复，愿意交换联系方式，注册卡在验证码一步。',
  '只关心能不能视频，问了三次价格后沉默，属于比价型用户，建议给首充优惠再试一轮。',
  '拉各斯的在校学生，语气随意、回复慢，主要想要免费礼物码，转化窗口在考试季之后。',
  'Abia 州用户，白天不在线、只在晚上九点后回复，聊家庭话题时明显更活跃。',
  '阿克拉用户，主要用语音消息，说话直接、要求尽快见面，属于高意向但需要人工接手。',
  '伊巴丹的用户，主动问注册时间有没有活动，对新手引导需求强，适合安排人工首聊。',
  '第一次使用这类应用，反复确认是不是本人，需要两三轮安抚后才肯聊日常。',
  '在南非打工，时差导致回复集中在凌晨，话题围绕汇款和家里孩子。',
  '开场就发联系方式，属于急热型，掉线也快，建议当天二次触达。',
  '对充值有明确顾虑，反复问能不能不花钱，适合走免费任务线。',
  '分享了自己的工作照后明显放开，聊到周末计划时主动追问有没有本地用户。',
  '从另一个账号撞单过来，两个号的昵称和设备都不同，需要人工确认归属。',
  '只发语音不打字，转文字后内容很短，需要提问式引导才能延续会话。',
  '问过平台是否收费后消失四天，回来第一句是还在不在，留存靠的是持续在线感。',
  '对游戏代练话题感兴趣，聊到装备时回复长度翻倍，可以当共同话题固定下来。',
  '注册流程走到一半放弃，设备存储不足导致下载失败，属于可挽回的技术流失。',
] as const;

const TIME_BASE = 16 * 3600 + 41 * 60 + 2;
const stamp = (secOfDay: number) => {
  const s = Math.floor(secOfDay) % 86400;
  const p = (n: number) => String(n).padStart(2, '0');
  return `2026/10/29 ${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
};

export const genReport = (seed: number): Report => {
  const isNew = h01(seed * 3.7) > 0.46;
  const nick = pick(NICK, seed * 5.1);
  const rows: ReportRow[] = [
    ...IDENTITY(
      String(2400000 + ((seed * 7919) % 480000)),
      '未识别',
      nick,
      pick(DEVICE, seed * 9.3),
      stamp(TIME_BASE + seed * 19),
    ),
    { t: 'gap' },
  ];
  if (isNew) {
    rows.push(
      { t: 'kv', icon: '🚀', label: '发现新用户', value: '(未注册)' },
      { t: 'txt', icon: '✨', text: '此用户暂无归属，建议立即跟进!' },
      { t: 'src', icon: '📋', label: '用户画像分析报告', value: pick(SOURCE_ACCT, seed * 11.9), note: '(未在映射表中找到)' },
    );
  } else {
    rows.push(
      { t: 'kv', icon: '🚫', label: '撞单警告:', value: '已存在的老用户' },
      { t: 'kv', icon: '👤', label: '归属运营:', value: pick(OWNER, seed * 13.3) },
      { t: 'kv', icon: '💰', label: '累计充值:', value: pick(CHARGE, seed * 17.7) },
      { t: 'src', icon: '📋', label: '用户画像分析报告', value: pick(SOURCE_ACCT, seed * 19.1), note: '(未在映射表中找到)' },
    );
  }
  rows.push({ t: 'gap' }, HEAT(pick(HEAT_POOL, seed * 23.9)));
  if (h01(seed * 29.3) > 0.63) rows.push(SUM(pick(SUMMARY, seed * 31.7)));
  const first = pick(FIRST, seed * 2.3);
  rows.push(...longTail(first, seed));
  return {
    key: `g${seed}`,
    tone: isNew ? 'new' : 'existing',
    name: `${first} ${pick(LAST, seed * 7.7)}`,
    serial: String(8100 + (seed % 940)),
    rows,
  };
};
