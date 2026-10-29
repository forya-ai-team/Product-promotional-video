// Report payloads re-typeset from the customer screenshots. The two hero cards
// are transcribed from what the user supplied (screenshot/S06-…png,
// screenshot/S06.5-信息流绿色图参考.jpg); every wall entry below is invented
// data in the same shape — no real nicknames, IDs or accounts.

export type ReportTone = 'new' | 'existing';

export type ReportRow =
  | { t: 'pair'; a: Kv; b: Kv }
  | { t: 'kv'; icon: string; label: string; value: string }
  | { t: 'txt'; icon: string; text: string }
  | { t: 'src'; icon: string; label: string; value: string; note: string }
  | { t: 'heat'; icon: string; label: string; value: string }
  | { t: 'sum'; icon: string; label: string; text: string; lines: number }
  | { t: 'gap' };

type Kv = { icon: string; label: string; value: string };

export type Report = {
  key: string;
  tone: ReportTone;
  name: string;
  serial: string;
  rows: ReportRow[];
};

export const CARD_W = 838;
export const ROW_H = 40;
export const GAP_H = 18;
const HEADER_H = 89;
const PAD_TOP = 22;
const PAD_BOTTOM = 26;

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

// Content-driven so the wall gets real masonry heights; the S06 hero still
// passes an explicit 748 to stay pixel-identical to the assembled cut.
export const reportHeight = (r: Report) =>
  HEADER_H +
  PAD_TOP +
  PAD_BOTTOM +
  r.rows.reduce(
    (n, row) => n + (row.t === 'gap' ? GAP_H : ROW_H * (row.t === 'sum' ? row.lines : 1)),
    0,
  );

const IDENTITY = (id: string, level: string, nick: string, device: string, time: string): ReportRow[] => [
  {
    t: 'pair',
    a: { icon: '📱', label: 'Oumi ID:', value: id },
    b: { icon: '💎', label: 'TikTok等级:', value: level },
  },
  { t: 'kv', icon: '👤', label: 'Tk昵称:', value: nick },
  { t: 'kv', icon: '💻', label: '设备型号:', value: device },
  { t: 'kv', icon: '⏰', label: '收集时间:', value: time },
];

const SOURCE = (account: string): ReportRow => ({
  t: 'src',
  icon: '📋',
  label: '用户画像分析报告',
  value: account,
  note: '(未在映射表中找到)',
});

const HEAT = (value: string): ReportRow => ({ t: 'heat', icon: '🔥', label: '客户热度:', value });

const SUM = (text: string, lines: number): ReportRow => ({
  t: 'sum',
  icon: '📝',
  label: '画像摘要:',
  text,
  lines,
});

// --- hero cards -------------------------------------------------------------

export const HERO_EXISTING: Report = {
  key: 'salmon',
  tone: 'existing',
  name: 'salmon',
  serial: '8375',
  rows: [
    ...IDENTITY('2194615', '未识别', 'Wisdom prego', 'App Store/iPhone SE (3rd generation)', '2026/10/28 13:54:33'),
    { t: 'gap' },
    { t: 'kv', icon: '🚫', label: '撞单警告:', value: '已存在的老用户' },
    { t: 'kv', icon: '👤', label: '归属运营:', value: 'carter' },
    { t: 'kv', icon: '💰', label: '累计充值:', value: '$170.96' },
    { t: 'kv', icon: '🗓', label: '注册时间:', value: '2026/04/21 13:45:38' },
    { t: 'kv', icon: '🔗', label: '邀请码:', value: '5278' },
    SOURCE('Karri'),
    { t: 'gap' },
    HEAT('8/10'),
    SUM(
      '一位来自尼日利亚、从事手工制作工作的单身用户，沟通简短直接，愿意为继续联系而下载 Oumi 并注册，交友意图较强。',
      3,
    ),
  ],
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
      3,
    ),
  ],
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
  if (summary) rows.push(SUM(summary, 2));
  return { key: `w${i}`, tone, name, serial, rows };
};

export const WALL_REPORTS: Report[] = SPECS.map(build);

// --- generated wall entries -------------------------------------------------
// The far half of the feed renders as ghosts (texture zone, §6.2), so only the
// near tiles ever need hand-written copy. Everything below is deterministic
// pool sampling — no Math.random, no real nicknames or accounts.

const h01 = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const pick = <T,>(pool: readonly T[], n: number) => pool[Math.floor(h01(n) * pool.length) % pool.length];

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
  if (h01(seed * 29.3) > 0.63) rows.push(SUM(pick(SUMMARY, seed * 31.7), 2));
  return {
    key: `g${seed}`,
    tone: isNew ? 'new' : 'existing',
    name: `${pick(FIRST, seed * 2.3)} ${pick(LAST, seed * 7.7)}`,
    serial: String(8100 + (seed % 940)),
    rows,
  };
};
