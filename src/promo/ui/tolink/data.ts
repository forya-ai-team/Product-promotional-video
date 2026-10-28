export type ConfigRow = {
  name: string;
  ip: string;
  port: number;
};

// IPs are TEST-NET documentation ranges; the reference screenshot's live
// proxy endpoints are deliberately not reproduced (see docs/decisions.md D7).
export const REFERENCE_ROWS: ConfigRow[] = [
  { name: '美国241', ip: '203.0.113.209', port: 7129 },
  { name: '美国103', ip: '198.51.100.109', port: 7571 },
  { name: '云手机9', ip: '192.0.2.63', port: 6819 },
  { name: '美国132', ip: '198.51.100.35', port: 7571 },
  { name: '美国1', ip: '203.0.113.205', port: 6935 },
  { name: 'au12', ip: '198.51.100.10', port: 7571 },
  { name: '云手机22', ip: '203.0.113.209', port: 7129 },
  { name: 'w13', ip: '203.0.113.209', port: 7129 },
  { name: 'dream4', ip: '203.0.113.209', port: 7129 },
  { name: '云手机75', ip: '203.0.113.209', port: 7129 },
  { name: '美国30', ip: '192.0.2.223', port: 7416 },
  { name: 'dream2', ip: '192.0.2.89', port: 6819 },
  { name: 'dream5', ip: '192.0.2.142', port: 6819 },
  { name: 'dream1', ip: '198.51.100.216', port: 7173 },
  { name: '云手机83', ip: '198.51.100.71', port: 60088 },
  { name: '云手机76', ip: '192.0.2.122', port: 6819 },
  { name: '美国197', ip: '192.0.2.180', port: 7416 },
  { name: 'AU10', ip: '203.0.113.89', port: 6728 },
  { name: '美国198', ip: '198.51.100.198', port: 7416 },
  { name: '云手机84', ip: '203.0.113.84', port: 6819 },
  { name: 'dream6', ip: '192.0.2.66', port: 6819 },
  { name: '美国199', ip: '198.51.100.199', port: 7416 },
  { name: 'w15', ip: '203.0.113.15', port: 7129 },
  { name: '云手机85', ip: '198.51.100.85', port: 60088 },
  { name: 'au14', ip: '192.0.2.14', port: 7571 },
  { name: '美国200', ip: '203.0.113.200', port: 7416 },
  { name: 'dream7', ip: '198.51.100.77', port: 6819 },
  { name: '云手机86', ip: '192.0.2.86', port: 6819 },
  { name: '美国201', ip: '203.0.113.201', port: 7416 },
  { name: 'AU11', ip: '198.51.100.11', port: 6728 },
];

const EXTRA_NAMES: Array<[string, number]> = [
  ['美国202', 7416],
  ['云手机87', 6819],
  ['dream8', 7129],
  ['w16', 7129],
  ['au15', 7571],
  ['美国203', 7416],
  ['云手机88', 60088],
  ['dream9', 6819],
  ['美国204', 7416],
  ['AU12', 6728],
  ['云手机89', 6819],
  ['w17', 7129],
  ['dream10', 7129],
  ['美国205', 7416],
  ['au16', 7571],
  ['云手机90', 6819],
  ['美国206', 7416],
  ['dream11', 6819],
  ['w18', 7129],
  ['AU13', 6728],
  ['云手机91', 6819],
  ['美国207', 7416],
  ['dream12', 7129],
  ['au17', 7571],
  ['云手机92', 6819],
  ['美国208', 7416],
  ['w19', 7129],
  ['dream13', 6819],
  ['美国209', 7416],
  ['AU14', 6728],
  ['云手机93', 6819],
  ['dream14', 7129],
  ['美国210', 7416],
  ['au18', 7571],
  ['云手机94', 6819],
  ['w20', 7129],
  ['dream15', 7129],
  ['美国211', 7416],
  ['AU15', 6728],
  ['云手机95', 6819],
  ['dream16', 6819],
  ['美国212', 7416],
  ['au19', 7571],
  ['云手机96', 6819],
  ['dream17', 7129],
  ['美国213', 7416],
  ['w21', 7129],
  ['云手机97', 6819],
  ['AU16', 6728],
  ['dream18', 6819],
  ['美国214', 7416],
  ['au20', 7571],
  ['云手机98', 6819],
  ['dream19', 7129],
  ['美国215', 7416],
  ['w22', 7129],
  ['云手机99', 6819],
  ['AU17', 6728],
  ['dream20', 7129],
  ['美国216', 7416],
];

const SUBNETS = ['203.0.113', '198.51.100', '192.0.2'];

const EXTRA_ROWS: ConfigRow[] = EXTRA_NAMES.map(([name, port], index) => ({
  name,
  ip: `${SUBNETS[index % SUBNETS.length]}.${31 + index}`,
  port,
}));

export const CONFIG_ROWS: ConfigRow[] = [...REFERENCE_ROWS, ...EXTRA_ROWS];

export type RailItem = {
  label: string;
  icon: string;
  iconLeft: number;
  iconTop: number;
  iconWidth: number;
  iconHeight: number;
  labelTop: number;
};

// Measured against public/refs/S03/default@2x.png (coordinates are 1x, rail-relative).
export const RAIL_ITEMS: RailItem[] = [
  { label: '粉丝信息', icon: 'nav-icon-1', iconLeft: 19, iconTop: 64.5, iconWidth: 30, iconHeight: 24, labelTop: 94 },
  { label: '对话管理', icon: 'nav-icon-2', iconLeft: 20, iconTop: 129, iconWidth: 29, iconHeight: 23, labelTop: 157.5 },
  { label: '快捷回复', icon: 'nav-icon-3', iconLeft: 18, iconTop: 191, iconWidth: 32, iconHeight: 24, labelTop: 220.5 },
  { label: '群发消息', icon: 'nav-icon-4', iconLeft: 18, iconTop: 253, iconWidth: 32, iconHeight: 28, labelTop: 283.5 },
  { label: '粉丝统计', icon: 'nav-icon-5', iconLeft: 19, iconTop: 315.5, iconWidth: 30, iconHeight: 27.5, labelTop: 347 },
  { label: '翻译', icon: 'nav-icon-6', iconLeft: 18, iconTop: 378.5, iconWidth: 32, iconHeight: 28, labelTop: 410 },
  { label: 'AI应答', icon: 'nav-icon-7', iconLeft: 17, iconTop: 441.5, iconWidth: 34, iconHeight: 27, labelTop: 473 },
  { label: 'TK脚本', icon: 'nav-icon-8', iconLeft: 18, iconTop: 503, iconWidth: 32, iconHeight: 31, labelTop: 536 },
  { label: 'Coze设置', icon: 'nav-icon-9', iconLeft: 17.5, iconTop: 567, iconWidth: 33, iconHeight: 29, labelTop: 599.5 },
];
