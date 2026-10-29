export type S06Avatar =
  | { kind: 'photo'; src: string }
  | { kind: 'letter'; text: string; bg: string; color?: string }
  | { kind: 'silhouette'; bg: string; fg: string }
  | { kind: 'empty'; bg: string }
  | { kind: 'flag' };

export type S06MessageRow = {
  name: string;
  preview: string;
  time: string;
  avatar: S06Avatar;
  unread?: number;
  verified?: boolean;
  hovered?: boolean;
  selected?: boolean;
};

// Handles, previews and timestamps are transcribed from the reference as mock
// data; the profile avatars are stock photos (D24 / D31), never the real users.
export const S06_CHAT_ROWS: S06MessageRow[] = [
  {
    name: 'Ben Sites',
    preview: 'Message request acc...',
    time: '02:04',
    avatar: { kind: 'empty', bg: '#4F4F4F' },
    hovered: true,
  },
  {
    name: 'robertshannon529',
    preview: 'Message request acc...',
    time: '02:04',
    avatar: { kind: 'photo', src: 'textures/S06/peer.jpg' },
    selected: true,
  },
  {
    name: 'Michael Hughes',
    preview: 'Yo! 💛',
    time: '22:49',
    avatar: { kind: 'letter', text: 'M', bg: '#A93BD1' },
  },
  {
    name: 'rock',
    preview: 'u keep saying whatev...',
    time: '21:05',
    avatar: { kind: 'silhouette', bg: '#6E6E6E', fg: '#FFFFFF' },
    unread: 2,
  },
  {
    name: 'Mark 92',
    preview: "Hi! Hope you're havin...",
    time: '19:56',
    avatar: { kind: 'silhouette', bg: '#6E6E6E', fg: '#FFFFFF' },
  },
  {
    name: 'officialplayboyclub',
    preview: 'Hey! Just saying hi.',
    time: '19:56',
    avatar: { kind: 'photo', src: 'textures/S06/official.jpg' },
    verified: true,
  },
  {
    name: 'willyboy emslie coventr...',
    preview: "Hi! Hope you're havin...",
    time: '19:56',
    avatar: { kind: 'flag' },
  },
  {
    name: 'hammerhead',
    preview: "Hi! Hope you're havin...",
    time: '19:56',
    avatar: { kind: 'letter', text: 'C', bg: '#5A3F33' },
  },
  {
    name: 'Danny Bartlett',
    preview: 'Yo! 💛',
    time: '19:56',
    avatar: { kind: 'letter', text: 'D', bg: '#6E8A9A' },
  },
  {
    name: 'user4267946146943',
    preview: 'Hey! Just saying hi.',
    time: '19:56',
    avatar: { kind: 'silhouette', bg: '#6E6E6E', fg: '#FFFFFF' },
  },
  {
    name: 'stevewright111@hotmail...',
    preview: 'Yo! 💛',
    time: '19:56',
    avatar: { kind: 'silhouette', bg: '#2F6FE0', fg: '#9CC4FF' },
  },
  {
    name: 'paulmissa428',
    preview: 'Hey! Just saying hi.',
    time: '19:55',
    avatar: { kind: 'photo', src: 'textures/S06/paul.jpg' },
  },
  {
    name: 'bobbygrimes10',
    preview: 'Hey! Just saying hi.',
    time: '19:55',
    avatar: { kind: 'letter', text: 'B', bg: '#F1641E' },
  },
];

export const S06_CHAT = {
  peerName: 'robertshannon529',
  peerHandle: '@robertshannon529',
  peerAvatar: 'textures/S06/peer.jpg',
  accountAvatar: 'textures/S06/account.jpg',
  date: 'October 22, 2026 16:53',
  incoming: 'Do you own the company I text',
  incomingTranslated: '你是不是我的那个公司要我发短信',
  timestamp: '02:04',
  outgoing: "Hi! Hope you're having a good day.",
  footer: 'Message request accepted. You can start chatting.',
  placeholder: 'Send a message...',
} as const;

export type ProfileRow = { label: string; value: string; green?: boolean };

export type S06Profile = {
  name: string;
  handle: string;
  badge: string;
  avatar: string;
  rows: ProfileRow[];
  selected?: boolean;
};

// IPs stay inside TEST-NET ranges (D7); the reference's live proxy endpoints
// are not reproduced.
export const S06_PROFILES: S06Profile[] = [
  {
    name: 'luna',
    handle: 'zhqnpexf2a',
    badge: '1384',
    avatar: 'textures/S06/luna.jpg',
    selected: true,
    rows: [
      { label: '备注', value: 'salmon1' },
      { label: '代理', value: '-' },
      { label: '分组', value: 'GZO2EJLGB (矩阵)' },
      { label: 'AI应答', value: '已开启', green: true },
      { label: '平台', value: 'Win32' },
      { label: '地区', value: 'US - Los Angeles' },
      { label: 'IP', value: '203.0.113.71' },
      { label: '协议', value: 'SOCKS5' },
      { label: '状态', value: '已连接', green: true },
    ],
  },
  {
    name: 'Karri',
    handle: 'karri...7575',
    badge: '2191',
    avatar: 'textures/S06/karri.jpg',
    rows: [
      { label: '备注', value: 'salmon3' },
      { label: '代理', value: '-' },
      { label: '分组', value: 'GZO2EJLGB (矩阵)' },
      { label: 'AI应答', value: '已开启', green: true },
      { label: '平台', value: 'Win32' },
      { label: '地区', value: 'US - Los Angeles' },
      { label: 'IP', value: '198.51.100.167' },
      { label: '协议', value: 'SOCKS5' },
      { label: '状态', value: '已连接', green: true },
    ],
  },
  {
    name: 'Marie',
    handle: 'scrafdng7w',
    badge: '4524',
    avatar: 'textures/S06/marie.jpg',
    rows: [
      { label: '备注', value: 'salmon4' },
      { label: '代理', value: '-' },
      { label: '分组', value: 'GZO2EJLGB (矩阵)' },
      { label: 'AI应答', value: '已开启', green: true },
      { label: '平台', value: 'Win32' },
      { label: '地区', value: 'US - Los Angeles' },
      { label: 'IP', value: '192.0.2.87' },
      { label: '协议', value: 'SOCKS5' },
      { label: '状态', value: '已连接', green: true },
    ],
  },
  {
    name: 'salmon',
    handle: 'salmon4',
    badge: '3120',
    avatar: 'textures/S06/salmon.jpg',
    rows: [
      { label: '备注', value: 'salmon4' },
      { label: '代理', value: '-' },
      { label: '分组', value: 'GZO2EJLGB (矩阵)' },
      { label: 'AI应答', value: '已开启', green: true },
      { label: '平台', value: 'Win32' },
      { label: '地区', value: 'US - Los Angeles' },
      { label: 'IP', value: '192.0.2.120' },
      { label: '协议', value: 'SOCKS5' },
      { label: '状态', value: '已连接', green: true },
    ],
  },
];

export const S06_SCRIPT = {
  manualCount: '10',
  intervalFrom: '1',
  intervalTo: '4',
  autoActivate: '关闭',
  dailyLimit: '100',
  deleteHistory: '关闭',
  idleHours: '48',
  excludeInvalid: false,
  excludeWorkflowDone: false,
} as const;
