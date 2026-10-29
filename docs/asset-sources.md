# 外部素材来源与许可

> 逐条记录进入成片的外部素材；无法追溯来源的素材不进交付母版。

## 1. S05 聊天列表头像（10 张）

来源：Pexels 免费图库（Pexels License：可免费用于商业与非商业项目、无需署名；不得转售未修改素材、不得暗示人物背书）。已统一裁为正方形、去 EXIF、128×128 JPEG。

| 文件 | Pexels photo | 原图 URL |
|---|---|---|
| `public/textures/S05/avatar-1.jpg` | 220453 | https://www.pexels.com/photo/220453/ |
| `public/textures/S05/avatar-2.jpg` | 415829 | https://www.pexels.com/photo/415829/ |
| `public/textures/S05/avatar-3.jpg` | 774909 | https://www.pexels.com/photo/774909/ |
| `public/textures/S05/avatar-4.jpg` | 1222271 | https://www.pexels.com/photo/1222271/ |
| `public/textures/S05/avatar-5.jpg` | 1239291 | https://www.pexels.com/photo/1239291/ |
| `public/textures/S05/avatar-6.jpg` | 1681010 | https://www.pexels.com/photo/1681010/ |
| `public/textures/S05/avatar-7.jpg` | 2379004 | https://www.pexels.com/photo/2379004/ |
| `public/textures/S05/avatar-8.jpg` | 1130626 | https://www.pexels.com/photo/1130626/ |
| `public/textures/S05/avatar-9.jpg` | 614810 | https://www.pexels.com/photo/614810/ |
| `public/textures/S05/avatar-10.jpg` | 91227 | https://www.pexels.com/photo/91227/ |

说明：头像是图库模特，与聊天列表中的用户名称无关联；名称 / 消息为参考截图转写的 mock 数据。

## 2. TikTok 标识

- `public/textures/S05/tiktok-logo@2x.png`：从用户提供的 `screenshot/S05-所有连接成功后展示聊天框.jpg` 裁切（2x）。TikTok 商标归字节跳动所有，仅用于说明产品接入的平台，不暗示官方合作或背书；如法务有异议可替换为纯文字标签。

## 3. 其他

- `public/textures/S04/avatar@2x.png`：从 S04 参考截图裁切的默认头像（圆形 alpha），非真实用户。
- 字体：系统 `Segoe UI`（TikTok 页）/ `Microsoft YaHei`（应用 UI），未内嵌字体文件；参考图的 TikTok 专有字体用 Segoe UI 近似，见 D24。
- 原始参考截图仅本地保留，不入库（D15）。

## 4. 侧栏配置卡社交头像（3 张，S04/S05 共用）

| 文件 | Pexels photo | 原图 URL |
|---|---|---|
| `public/textures/profile/avatar-1.jpg` | 1036623 | https://www.pexels.com/photo/1036623/ |
| `public/textures/profile/avatar-2.jpg` | 1181686 | https://www.pexels.com/photo/1181686/ |
| `public/textures/profile/avatar-3.jpg` | 2182970 | https://www.pexels.com/photo/2182970/ |

Pexels License，同上；128×128 去 EXIF。对应“美国241 / 美国103 / 云手机9”三个浏览器配置，与聊天列表用户无对应关系（D25）。

## 5. S06 静态页素材（9 张头像 + 1 张左导航贴片）

### 5.1 头像（Pexels，Pexels License，同上；128×128 去 EXIF）

| 文件 | Pexels photo | 原图 URL | 角色 |
|---|---|---|---|
| `public/textures/S06/peer.jpg` | 262391 | https://www.pexels.com/photo/262391/ | 聊天对象 robertshannon529（列表 / 头部 / 来讯） |
| `public/textures/S06/official.jpg` | 1183266 | https://www.pexels.com/photo/1183266/ | officialplayboyclub |
| `public/textures/S06/paul.jpg` | 1043471 | https://www.pexels.com/photo/1043471/ | paulmissa428 |
| `public/textures/S06/account.jpg` | 1587009 | https://www.pexels.com/photo/1587009/ | 当前账号（去讯气泡 + 左导航底部） |
| `public/textures/S06/luna.jpg` | 1845163 | https://www.pexels.com/photo/1845163/ | 配置卡 luna |
| `public/textures/S06/karri.jpg` | 3763188 | https://www.pexels.com/photo/3763188/ | 配置卡 Karri |
| `public/textures/S06/marie.jpg` | 774909 | https://www.pexels.com/photo/774909/ | 配置卡 Marie |
| `public/textures/S06/salmon.jpg` | 1239291 | https://www.pexels.com/photo/1239291/ | 配置卡 salmon |
| `public/textures/S06/rail-account.jpg` | 91227 | https://www.pexels.com/photo/91227/ | 左导航的第二个账号头像 |

说明：图库模特与截图中的账号名/消息无关联；账号名/消息为 mock 数据，IP 已换 TEST-NET（D7）。

### 5.2 TikTok 左导航贴片

- `public/textures/S06/tiktok-rail@1.25x.png`：从用户提供的 `screenshot/S06-ai回复消息示例.jpg` 裁切（x 355–440 / y 57–880，源图 1.25×）。仅静态呈现 TikTok 导航图标与通知徽章；两个真实账号头像已被 `account.jpg` / `rail-account.jpg` 覆盖。TikTok 商标归字节跳动所有，仅用于说明接入平台，不暗示官方合作或背书。

### 5.3 字体

- TikTok 私信页用系统 `Segoe UI` 近似 TikTok 专有字体（D24 口径）；应用 UI / TK脚本 抽屉用 `Microsoft YaHei`。两者均未内嵌，渲染机需 Windows 保持字体一致。

### 5.4 S06Spotlight（D34）

- 未新增素材：卡片复用 `ChatPanel`（`public/textures/S06/*` 头像 + 同一套字体），舞台复用 `S06Desktop`，噪声颗粒为运行时 `feTurbulence` 生成的 data URI，体积光/尘埃为纯 CSS/DOM。
- 注记文案“TikTok 私信 / AI 自动应答”是 Agent 草稿，不属于截图可追溯文案，也**不是**产品功能名的正式来源；发布前须按 `docs/brief.md` 的功能名替换或经用户确认（D34）。

