# AGENTS.md — 产品宣传片制作手册

> 本文件是本仓库的唯一操作手册。所有 agent / 协作者开工前先读完；用户最新的明确指令优先，冲突时更新本文件并在 `docs/decisions.md` 记录。
>
> 本片对象：**桌面软件**（只有截图，没有可运行的 Web 页面）；成片 **≥3 分钟**、简体中文、1920×1080 / 30fps。

---

## 0. 一句话路线

**HTML/CSS 1:1 复刻软件界面 → Remotion 逐帧驱动 → three.js 只做 3D / 粒子 / 着色器 → video-shotcraft 提供镜头配方和转场语法。**

画面代码仍然是 HTML/CSS（JSX 只是写法），不是用 three.js 重画整个 UI；Remotion 负责在无头 Chrome 里逐帧求出画面并编码成 MP4。

### 为什么不是“纯 HTML 播放 + 录屏”

- 3 分钟 = 5400 帧（30fps）。实时播放会掉帧、音画漂移、重跑不可复现。
- Remotion 每一帧按 `frame` 求值：可复现、可并行、可单帧验收。
- video-shotcraft 的 150 个镜头本身就是 Remotion/React 组件，直接复用比手工移植省一个数量级的调校成本。

---

## 1. 已定决策（不要再问，除非用户明确推翻）

| 项 | 决策 |
|---|---|
| 产品形态 | 桌面软件，只有截图；不做真实页面抓取 |
| 项目性质 | 个人公益产品；不涉及商业授权；Remotion 按个人免费许可使用 |
| 成片时长 | ≥3:00；默认目标 3:12–3:15（约 5760–5850f @30fps）；上限 3:30 |
| 画幅 / 帧率 | 1920×1080，30fps，逐行 |
| 编码 | H.264 High / yuv420p / CRF 18；AAC 48kHz 320kbps |
| 语言 | 简体中文；技术名词保留英文 |
| 渲染 | Remotion（React/TSX），帧驱动，确定性 |
| 画面 | DOM/CSS 复刻；three.js 用 `@remotion/three` 的 `<ThreeCanvas>` |
| 镜头库 | video-shotcraft 只读参考，pin commit `43bd349a136651865ecfa6ea1cf012f6e957d304` |
| 转场 | `@remotion/transitions` 标准转场 + 移植 3 个签名转场；一个接缝只用一式 |
| 声音 | BGM + SFX；交付带 BGM / 无 BGM 两版 |
| 交付 | MP4 ×2、封面、静帧与 QA 报告、源码 |

**渲染路线已定：Remotion。** 用户 2026-10-28 确认本项目为个人公益产品，不涉及商业授权；按 Remotion 个人免费许可使用。若后续商业化，再复核许可。字体、图标、音频、第三方 logo 的授权不受此影响，仍按 §8 / §11 逐项记录。

---

## 2. 先回答：要不要拆成多个 HTML？

**不要按页面拆。一个 composition、一条时间线、场景拆成模块。**

原因：

1. **转场需要两景同帧**：flash-cut / whip-pan / portal-wipe 都要在接缝处同时拿到前后两景；拆成两个 HTML 页面无法在同一帧直接合成（要靠 iframe/canvas 桥接，复杂且易糊）。
2. **一个全局时钟**：字幕、SFX、BGM 卡点、镜头边界都用同一个 `frame`；多页面会引入多套时钟。
3. **3 分钟不是运行时长度**：Remotion 每帧独立求值，`<Sequence>` 只在区间内挂载场景；内存不随片长线性增长。
4. **并行渲染已经内建**：`--concurrency` 会把帧分到多个浏览器实例；拆页面不会更快，只会增加拼接和音画同步成本。
5. **视觉一致性**：3 分钟里 tokens、窗口 chrome、字体、阴影必须共享；多页面容易漂移。

**什么时候才隔离：**

- 某个场景必须嵌入真实外部 Web 应用 → 用 `<Iframe>` / `<Sequence>` 隔离组件，时间线仍是一条。
- 单个 WebGL 场景导致整片渲染不稳定 → 先把该场景做成独立 composition 单独渲，再在主时间线用 `<OffthreadVideo>` 贴回。这是故障隔离，不是常规架构。

---

## 3. 3 分钟怎么排

### 3.1 默认骨架（8 场；内容窗口合计 5850f；转场重叠后约 3:12，仍 ≥3:00）

| # | 段落 | 时长 | 帧区间（默认） | 任务 | 镜头语法示例 |
|---|---|---|---|---|---|
| S01 | 冷开场 / 品牌 | 14s | 0–420 | 一个主角、一条完整动作弧；产品名出现 | `text-as-mask` / `brand-ink-open` |
| S02 | 问题与承诺 | 22s | 420–1080 | 2–3 个痛点卡片，落一句承诺 | `card-stack` / `list-stack-press` |
| S03 | 核心功能 A | 30s | 1080–1980 | 一次真实交互，观众能跟着做 | `spotlight-hero-card` / `type-and-filter` |
| S04 | 核心功能 B | 30s | 1980–2880 | 第二个支柱，换一种运动语法 | `exploded-view` / `depth-layer-moves` |
| S05 | 核心功能 C | 30s | 2880–3780 | 第三个支柱，第三次换语法 | `palette-theme-ripple` / `row-embed` |
| S06 | 端到端工作流 | 30s | 3780–4680 | 把 A/B/C 串成一条流程 | `timeline-travel` / `bezier-source-converge-merge` |
| S07 | 证据 / 指标 | 20s | 4680–5280 | 数字、集成、客户证据（需授权） | `axis-rescale-shock` / `odometer-digit-roll` |
| S08 | 收尾 / CTA | 19s | 5280–5850 | 元素合影 → 字标落定 ≥1s → URL | `outro-group-photo-launch` |

> 帧区间是默认排布，**唯一事实源是 `src/promo/timeline.ts`**。转场重叠由 helper 计算，不要在多处手写绝对帧。功能数量变化时只调 Act II 的场景数，总长保持 ≥3:00，目标 3:12–3:15；若转场重叠后不足 3:00，加长 S07/S08 或尾帧，不缩水。

### 3.2 硬规则

- 场景 14–30s；最短不少于 10s；超过 35s 必须拆。
- 每场只讲一个主动效；同一手法全片只当一次主角。
- 开场主体动作弧 ≥3s（90f）；品牌字标落定 hold ≥1s（30f）；批量入场收尾 ≥0.5s（15f）；关键信息落定 ≥24f 再切。
- 交互演示按真人速度：移动 0.6–1.2s、点击 0.15–0.25s、响应 0.3–0.6s；不要瞬移。
- 8 场之间约 7 个接缝；签名转场 2–3 个；其余硬切 / 闪白；全画面级冲击 ≤3 处；转场不叠加。
- **3 分钟是下限，不是目标**。内容不够时加“真实工作流 / 证据 / 生态”段，不用慢镜头灌水。

### 3.3 字卡与字幕

- 字卡 1.5–2.5s，4–6 张，放在功能段之间当呼吸位；一张只讲一句。
- 字幕只在需要解释时出现；底部安全区；最多 2 行；主字幕 ≥56px；辅助文字 ≥32px（按最终渲染像素量，不按代码里的 `fontSize`）。
- 同一句 tagline 全片最多出现 2 次（开场 / 收尾），不要每段重复。

### 3.4 能量曲线

低（开场）→ 中（问题 / 功能 A）→ 中高（功能 B/C）→ 低（字卡呼吸）→ 高（工作流 / 证据）→ 峰值（收尾合影）。

收尾必须是全片能量最高点；品牌字标落定后至少静止 1s。

---

## 4. 技术栈与目录

### 4.1 依赖（pin 精确版本）

| 包 | 用途 |
|---|---|
| `remotion` / `@remotion/cli` | 帧驱动、预览、渲染 |
| `@remotion/transitions` | `<TransitionSeries>` 与标准转场 |
| `@remotion/three` / `three` / `@react-three/fiber` | `<ThreeCanvas>` 3D 图层 |
| `react` / `react-dom` / `typescript` | 组件与类型 |
| `pixelmatch` / `pngjs` | 复刻像素 diff（dev） |
| `librosa`（Python，可选） | BGM 节拍分析；不是 Node 依赖 |
| `ffmpeg` / `ffprobe` | Remotion compositor 自带精简版（`node_modules/@remotion/compositor-<platform>/`）；`qa:media` 用自带 ffprobe。contact sheet / blackdetect 需要完整版 ffmpeg（可选安装） |

### 4.2 目标目录

```text
.
├─ AGENTS.md
├─ README.md
├─ package.json
├─ package-lock.json
├─ remotion.config.ts
├─ tsconfig.json
├─ .nvmrc
├─ public/
│  ├─ refs/                    # 用户截图，只读，永不修改
│  │  └─ S03/
│  │     ├─ default@2x.png
│  │     └─ menu-open@2x.png
│  ├─ textures/                # 从截图裁出的贴片 + manifest.json
│  │  └─ S03/hero-card@2x.png
│  ├─ fonts/
│  ├─ icons/
│  └─ audio/
│     ├─ bgm/
│     └─ sfx/
├─ src/
│  ├─ index.ts                 # registerRoot
│  ├─ Root.tsx                 # <Composition id="ProductPromo" ...>
│  └─ promo/
│     ├─ Main.tsx              # 时间线编排
│     ├─ timeline.ts           # 唯一事实源
│     ├─ theme/
│     │  ├─ tokens.ts          # 颜色 / 字体 / 间距 / 圆角 / 阴影
│     │  └─ motion.ts          # easing / spring / 时长 tokens
│     ├─ scenes/
│     │  ├─ S01Hook.tsx
│     │  ├─ S02Problem.tsx
│     │  └─ ...
│     ├─ ui/                   # 复刻组件：AppWindow / Sidebar / Toolbar ...
│     ├─ shots/                # 从 video-shotcraft 适配的镜头
│     ├─ transitions/          # 签名转场
│     └─ three/                # ThreeCanvas 图层
├─ scripts/
│  ├─ diff-refs.mjs            # 参考图 vs 静帧
│  ├─ qa-media.mjs             # ffprobe 媒体检查
│  └─ contact-sheet.sh
├─ docs/
│  ├─ brief.md                 # 产品简报、功能清单、CTA
│  ├─ design-spec.md           # tokens + 动效 tokens + 分镜 + 镜头卡映射
│  ├─ decisions.md             # 例外、授权、pin 的 commit
│  └─ audio-licenses.md        # 音频来源与许可证
├─ vendor/
│  └─ video-shotcraft/         # 只读参考，gitignore；记录 commit
└─ out/
   ├─ qa/                      # 静帧、diff、contact sheet
   └─ final/                   # 成片
```

---

## 5. 时间线：单一事实源

`src/promo/timeline.ts` 只允许有一份时间表。示例（内容 durations 之和 − 转场重叠 + 尾帧 = 总帧数）：

```ts
export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

export type TransitionKind =
  | 'cut'
  | 'flash-cut'
  | 'whip-pan'
  | 'portal-wipe'
  | 'fade'
  | 'wipe';

export type SceneSpec = {
  id: string;
  title: string;
  durationInFrames: number;
  transitionAfter?: { kind: TransitionKind; durationInFrames: number };
  cards: string[];              // video-shotcraft 卡名
  styles?: string[];            // style-key；与卡名不同名时必填
  acceptanceFrames: number[];   // 相对本场起点的静帧验收帧
};

export const SCENES: SceneSpec[] = [
  {
    id: 'S01',
    title: '冷开场 / 品牌',
    durationInFrames: sec(14),
    transitionAfter: { kind: 'flash-cut', durationInFrames: 10 },
    cards: ['text-as-mask'],
    acceptanceFrames: [sec(2), sec(7), sec(13)],
  },
  // S02 ... S08
];

const overlapBefore = (i: number) =>
  SCENES.slice(0, i).reduce((n, s) => n + (s.transitionAfter?.durationInFrames ?? 0), 0);

export const sceneStart = (i: number) =>
  SCENES.slice(0, i).reduce((n, s) => n + s.durationInFrames, 0) - overlapBefore(i);

export const TOTAL_FRAMES =
  SCENES.reduce((n, s) => n + s.durationInFrames, 0) -
  overlapBefore(SCENES.length) +
  sec(1); // 片尾安全尾帧
```

规则：

- 接缝只由**前一场**的 `transitionAfter` 描述；最后一场不设 `transitionAfter`。
- 字幕、SFX、验收帧全部用 `sceneStart(i) + offset` 计算，不手写绝对帧。
- 增删场景只改 `SCENES`；不要同时改多份数组。
- `<TransitionSeries>` 的 sequence 时长用 `durationInFrames`；转场 duration 由 `transitionAfter` 传入，重叠由库计算。
- `TOTAL_FRAMES` 必须与 `<Composition durationInFrames>` 一致；改完跑一次 `npx remotion compositions src/index.ts` 核对。

### 5.1 转场参数

| 转场 | 典型时长 | 用法 | 来源 |
|---|---|---|---|
| `cut` | 0f | 默认；信息密集处直接切 | — |
| `flash-cut` | 10–12f | 白闪只盖硬切，两侧各 5f；不当装饰光效 | video-shotcraft `shot-transitions` A 式 |
| `whip-pan` | 48–72f | 起点 hold ≥20f → 前 70% 路程用 30% 时间 → 后 30% 路程 ease-out 长尾 ~48f；糊段才加方向性模糊；两景同一水平线；长尾 >60f 会偷走后镜，宁短勿长 | `WhipBrakeReal.tsx` |
| `portal-wipe` | 48f | 目标卡抬起 → 窗 40f `bezier(0.7,0,0.3,1)` → 窗内 0.42→1 反向补偿；只 2 层视差；穿完 8f 缓停 + ≥30f hold | `PortalWipeV2.tsx` |
| `fade` | 12–18f | 只用于暗场 / 抽象段；UI 段慎用 | `@remotion/transitions` |
| `wipe` | 18–24f | 语义化分区；不要和 flash 叠加 | `@remotion/transitions` |

**硬规则**：一个接缝只用一式；全画面级冲击（整画面 scale 泵 / 震屏 / 闪帧 / 负片）全片 ≤3 处；相邻两处间隔 ≥16 拍。

---

## 6. UI 1:1 复刻

### 6.1 收到截图后的顺序

1. **建档**：写 `docs/brief.md`（产品定位、受众、功能清单、差异点、CTA）和 `docs/design-spec.md`（tokens、分镜、镜头卡）。
2. **静态复刻**：先做 S03（或最能代表产品的 hero 屏）的 `SxxStatic`，不做任何动画。
3. **像素 diff**：出静帧对照参考图，过 §6.4 门槛。
4. **分镜放行**：静态复刻通过后再排动效；不要在错误的复刻上做动画。
5. **逐场动效**：每场完成即出静帧自检，不留到最后。

### 6.2 两种区域：live zone 与 texture zone

| 区域 | 做法 | 典型内容 |
|---|---|---|
| Live zone | DOM/CSS，可动画、可换文案 | 标题、按钮、菜单、输入框、光标、选中态、需要动的图表条 |
| Texture zone | 从截图裁出的 PNG 贴片（2x/4x），可做 2.5D 视差 | 照片、复杂图表、3D 视口、渐变、插画、复杂阴影 |
| 窗口 chrome | 简单则 DOM，复杂则贴片；全片统一 | 标题栏、红绿灯、工具栏 |

**原则**：文字和需要变化的控件必须 live；复杂静态美术用贴片。两者拼成一个“舞台”，接缝不可见即可。不要为了“纯 HTML”把照片/复杂图表硬搓成 DOM。

### 6.3 先静后动

- 每场先写 `SxxStatic`（无动画的完整舞台）；动效用外层 wrapper 驱动，不改舞台内部布局。
- 静帧验收帧：入场中、动作峰值、落定后各一张。
- 只有静态 diff 通过，才允许加位移 / 缩放 / 遮罩 / 3D 相机。

### 6.4 像素级验收（1:1 的定义）

“1:1”指**镜头里出现的画面**与参考截图对齐，不要求复刻整个软件、不要求复刻未出镜的页面。

| 项 | 门槛 |
|---|---|
| 画布 | 1920×1080；参考图归一化到同一画布 |
| 布局 | 关键元素 bbox 偏差 ≤2px；文字基线 ±1px |
| 颜色 | 纯色区域 ΔE2000 ≤3 |
| 全局 | ΔE2000 >5 的像素 ≤1.5%；无结构性偏移 >2px |
| 字体替代 | 文字区域可豁免，但必须在 `docs/decisions.md` 记录并经用户确认；用最接近的度量兼容字体，禁止系统默认字体糊弄 |

- 工具：颜色差按 ΔE2000 计算（`odiff` 或自写脚本）；`pixelmatch` 的 perceptual threshold 只能作为近似，脚本里要固定口径。脚本：`scripts/diff-refs.mjs`。
- 产物：`out/qa/diff/Sxx-fNNNN.png`（并排 + 差异热区），进 QA 报告。
- 参考图含敏感数据时，先在复刻里换成假数据，再 diff；不要把原图打进 diff 产物。

### 6.5 缩放与清晰度

- 布局级放大用 CSS `zoom`，不要用 `transform: scale`：Chromium 对 3D 合成层按布局尺寸栅格化再放大，文字会糊。
- 3D / 透视里的 UI 纹理按显示尺寸 2–4 倍栅格化；hero 元素尽量 4x。
- 优先整数倍缩放；文字避免落在小数像素上。
- 软件窗口小于 1080p 时，放在设计好的舞台背景上按整数倍展示；不要拉伸。

### 6.6 字体 / 图标 / 颜色

- 本地 `@font-face`；`document.fonts.ready` + `delayRender()`，避免 FOUT。
- Logo 用官方 SVG；图标优先 SVG；只有 PNG 时用 2x/4x 裁切，不重画。
- 颜色从截图取样，写入 `theme/tokens.ts`；禁止散落 ad-hoc hex。
- 阴影 / 模糊 / 圆角按截图量；`backdrop-filter` 先在目标渲染机验证，再决定是否预烘焙。

### 6.7 数据与文案

- 假数据要像真的：表格铺满、列宽/截断/空状态真实；禁止 lorem ipsum。
- 禁止真实客户名、邮箱、头像、内部 URL、密钥、token、数据库名、文件路径。
- 不发明功能、指标、集成、认证；每条 claim 必须能追溯到 `docs/brief.md` 或用户确认。
- UI 文案与产品一致；截图看不清的字，问或删，不要猜。

### 6.8 窗口与光标

- 全片只用一种窗口 chrome；不要混 macOS 和 Windows。
- 光标用自绘 `<Cursor>`：路径关键帧 + 点击波纹 + hover 态；按真人速度。
- 截图带系统标题栏时，决定“保留全书桌”或“裁到内容区”；全片一致。

---

## 7. 动效与镜头

### 7.1 video-shotcraft 用法

它是 Remotion 镜头配方库，不是 npm 运行时依赖。

- Clone 到 `vendor/video-shotcraft`，pin `43bd349a136651865ecfa6ea1cf012f6e957d304`；`vendor/` 进 `.gitignore`；commit hash 写进 `docs/decisions.md`：

  ```bash
  git clone https://github.com/Vincentwei1021/video-shotcraft.git vendor/video-shotcraft
  git -C vendor/video-shotcraft checkout 43bd349a136651865ecfa6ea1cf012f6e957d304
  ```
- 用 `gallery/api/library.json` 校验卡名与 `style-key`。
- 每张卡：读卡全文 → 读“参考实现”指向的 demo TSX 全文 → 只复制用到的组件 / helper 到 `src/promo/shots/`。
- 在 `docs/design-spec.md` 记录：卡名、style-key、源文件、用在哪一场、改了哪些参数、为什么。
- **禁止凭卡名自由发挥**：demo TSX 里的缓动、时值配比、摘罩时机、已知坑才是调校真相。
- 只借运动语法，不借视觉皮肤：颜色、字体、圆角、阴影必须换成产品的 tokens。
- 桌面软件没有真实页面：把 `PageCam` 这类“真实页面”技法适配成“重建舞台 + 2.5D 相机 / 贴片”，不要假装有 live DOM。
- 转场只取 `shot-transitions` 的三式（flash-cut / whip-pan / portal-wipe）里适合本片的 2–3 个；不要 19 种全上。

### 7.2 动效 tokens

先从截图判断品牌性格（能量轴：沉稳 ↔ 运动；调性轴：严肃 ↔ 活泼），选一个预设，再微调：

| 预设 | 入场时长 @30fps | easing | 过冲 | 适用 |
|---|---|---|---|---|
| 专业信赖 | ~21f | `cubic-bezier(0,0,0.2,1)` | 1.00 | fintech / enterprise / B2B |
| 精致高端 | ~48f | `cubic-bezier(0.4,0,0.6,1)` | ≤1.02 | 奢侈品 / 时尚 / 高端工具 |
| 活力大胆 | ~18f | `cubic-bezier(0.16,1,0.3,1)` | 1.12 | 体育 / 游戏 / startup |
| 活泼愉悦 | ~27f | `cubic-bezier(0.34,1.56,0.64,1)` | 1.08 | 消费 / 社交 |
| 平静关怀 | ~42f | `ease-in-out` | 1.00 | 健康 / 教育 |
| 亲和友好 | ~26f | `cubic-bezier(0.25,0.46,0.45,0.94)` | 1.04 | 小微 / 社区 |

硬规则：

- 一个品牌一种动效嗓音；全片共用 `theme/motion.ts`，禁止两套系统混用。
- 所有时长写帧，不写毫秒；用 `sec()` helper。
- 禁止 CSS `transition` / `@keyframes` 驱动场景动画；禁止 `requestAnimationFrame`；禁止 `Date.now()` / `Math.random()`。
- 只用 `useCurrentFrame()`、`interpolate()`、`spring()`、`random(seed)`；伪随机种子从场景 index 派生。
- 同一手法全片只当一次主角；重复即返工信号。

### 7.3 审美检查表（每场必过）

| # | 规则 | 自检 |
|---|---|---|
| R1 | 关键信息落定后呼吸：品牌字标 ≥30f，批量入场 ≥15f，关键画面 ≥24f | 想让观众记住的画面，有没有完整静止？ |
| R2 | 速度感来自加速度，不来自匀速；群体运动挂物理隐喻（发牌 / 堆叠） | 有没有元素在匀速直线运动？批量入场是否越来越快、末尾静止？ |
| R3 | 宁慢勿快：开场动作弧 ≥3s；交互按真人速度 | 第一次看能看清吗？能跟着操作一遍吗？ |
| R4 | 全画面级冲击 ≤3 处；其余拍点只动元素层 | 连续 8 拍里整画面是否在逐拍脉冲？ |
| Q1 | 复刻既有页面优先真实素材；本项目例外见 D1，用像素 diff 兜底 | 每个贴片/重建区域都过 diff 了吗？ |
| Q4 | 高光/扫光不群发；一个镜头最多给主角一次，裁进圆角 | 全片 glint/sweep 是否超过“主角一次”？ |
| Q5 | 开场只给一个主角、一条完整动作弧 | 开场有几个“想让观众看”的东西？ |
| Q6 | 机位服务可读性：信息密集镜头正视；文字特写侧向水平 | 这个倾斜的理由是什么？文字还读得清吗？ |
| Q9 | 飞入元素落进真实布局槽位，不悬浮在页面上方 | 落定后有真实坐标吗？ |
| Q10 | 文档/表格 mock 要出版级：原生排版、文字铺满、完整版式 | 暂停任意一帧，内容像真的吗？ |
| Q11 | 要读的文字有最低字高：字幕 ≥56px，辅助 ≥32px；否则当纹理虚化 | 缩到 480px 宽还读得清吗？ |
| S1 | 声音用电影系词汇（whoosh/impact/riser/sparkle/transition），禁游戏 UI 提示音 | 这个音像真实物件，还是像游戏反馈？ |

有意识违反任一条时，写进 `docs/decisions.md`：违反哪条、为什么、用户是否确认。

### 7.4 three.js 边界

- 用 `@remotion/three` 的 `<ThreeCanvas>`；所有运动由 `useCurrentFrame()` 驱动。
- 禁止 `useFrame()` 实时循环、`OrbitControls` 自动旋转、真实时钟。
- 用途：3D 设备/窗口、爆炸视图、粒子、着色器背景/转场、纵深视差。
- **不用于**：UI 文字、表格、菜单、按钮。文字永远留在 DOM；3D 里的 UI 纹理按 2–4x 栅格化，验证字边缘。
- 确定性：固定种子、固定相机、预计算缓冲；卸载时 dispose geometry/material/texture。
- 着色器转场只用于“两边都是贴图/抽象层”的接缝；不要把两个 live DOM 场景栅格化进 WebGL 做 UI→UI 转场（文字会糊、布局会错位）。UI 转场用 CSS mask/clip-path/2.5D transform。
- 无头 WebGL 渲染失败时，先试 `--gl=angle`，再试 `--gl=swangle`；把可用参数写进 `package.json` scripts 和 `docs/decisions.md`。

---

## 8. 声音

- **BGM**：tech-house / 电子底、强鼓点、110–126 BPM；先分析 BPM 与相位，再排镜头。场景接缝锚到拍号；最强 hit 留给 2–3 个大 slam；breakdown 当品牌呼吸位。
- **SFX**：whoosh（运镜）、impact（落地）、riser（铺垫）、sparkle（光效）、transition（转场）；真实点击/打字用拟音，不用游戏提示音。
- **授权**：`docs/audio-licenses.md` 逐条记录文件、来源、许可证、URL。来源无法反查的文件不得进交付母版；优先用有明确 URL 的 Mixkit 素材。video-shotcraft 的音频授权记录见其 `assets/audio/ATTRIBUTION.md`。
- **响度**：成片 −14 LUFS integrated，true peak ≤ −1 dBTP；用 `ffmpeg loudnorm` 两遍法检测。
- **两版交付**：带 BGM 版 + 无 BGM 版（保留 SFX）。用 `bgm` input prop 从同一时间线渲出；Windows 下用 `--props=props-nobgm.json`，不要内联 JSON（会被 shell 剥引号）。
- **混音**：BGM 压在 SFX 下方；SFX 峰值约 −6 dB；不削波。有旁白时 BGM 再降 12 dB。
- **验收**：渲后抽音轨，比对切点与节拍网格，误差 ≤3f。

---

## 9. 渲染与验收

### 9.1 常用命令

`package.json` 的 scripts 固定为下面这套（`npm run render` 与 QA 清单里的命令一一对应）：

```json
{
  "scripts": {
    "dev": "remotion studio src/index.ts",
    "render": "remotion render src/index.ts ProductPromo out/final/promo-bgm.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k",
    "render:nobgm": "remotion render src/index.ts ProductPromo out/final/promo-nobgm.mp4 --props=props-nobgm.json --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k",
    "qa:media": "node scripts/qa-media.mjs"
  }
}
```

> 首次运行 Remotion 会下载 Chrome Headless Shell（约 120MB）。下载慢时可加 `--browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"` 改用本机 Chrome。

```bash
# 首次安装（生成 package-lock.json 后改用 npm ci）
npm install

# 预览
npx remotion studio src/index.ts

# 单帧验收（示例：S03 中段 1140f）
npx remotion still src/index.ts ProductPromo out/qa/S03-f1140.png --frame=1140

# 单场试渲（示例：S03 内容窗口 1080–1980f；实际帧号以 timeline.ts 为准）
npx remotion render src/index.ts ProductPromo out/qa/S03.mp4 --frames=1080-1980 --concurrency=4

# 终渲（带 BGM）
npx remotion render src/index.ts ProductPromo out/final/promo-bgm.mp4 \
  --codec=h264 --crf=18 --pixel-format=yuv420p \
  --audio-codec=aac --audio-bitrate=320k --concurrency=4

# 终渲（无 BGM，保留 SFX）
npx remotion render src/index.ts ProductPromo out/final/promo-nobgm.mp4 \
  --props=props-nobgm.json \
  --codec=h264 --crf=18 --pixel-format=yuv420p \
  --audio-codec=aac --audio-bitrate=320k --concurrency=4

# 媒体检查（用 Remotion 自带的 ffprobe）
npm run qa:media -- out/final/promo-bgm.mp4

# 以下两条需要完整版 ffmpeg；Remotion 自带精简版不含 tile/fps/blackdetect
# ffmpeg -y -i out/final/promo-bgm.mp4 -vf "fps=1/5,scale=480:-1,tile=5x8" -frames:v 1 out/qa/contact.png
# ffmpeg -i out/final/promo-bgm.mp4 -vf "blackdetect=d=0.1:pix_th=0.10" -an -f null -
```

### 9.2 QA 清单

- [ ] 时长 ≥180s；目标 3:12–3:15；无意外黑帧 / 冻结帧。
- [ ] 1920×1080、30fps、H.264/yuv420p、AAC 48kHz；Windows / macOS / 手机均可播放。
- [ ] 每场静帧：入场中、动作峰值、落定后；与参考图并排看。
- [ ] 复刻 diff：每个有参考图的场景都过 §6.4 门槛；diff 图归档。
- [ ] 文字：字幕 ≥56px、辅助 ≥32px；480px 宽缩略图仍可读；无截断/溢出。
- [ ] 节奏：品牌 hold ≥1s；批量收尾 ≥0.5s；开场动作弧 ≥3s；无匀速运动。
- [ ] 手法不重复；转场不叠加；全画面冲击 ≤3。
- [ ] 无真实客户/个人信息；无未授权第三方 logo；无内部 URL/密钥。
- [ ] 音频：授权齐全；−14 LUFS；TP ≤ −1 dBTP；带 BGM / 无 BGM 两版都存在。
- [ ] 可复现：`npm ci && npm run render` 从干净环境可重跑；无网络依赖、无缺失素材。
- [ ] Remotion 授权状态已记录（个人公益，无需商业授权）。

### 9.3 独立终检

交付前派一个**干净上下文**的 subagent 做独立审查（制作者有确认偏差，首检不能交给用户）。

输入：成片、关键静帧、`docs/brief.md`、`docs/design-spec.md`、分镜表、镜头卡清单、diff 报告。

输出：逐条带帧号证据的报告；问题按阻塞 / 非阻塞分级；阻塞项修完重渲。

---

## 10. Agent 工作规则

- 开工前读：本文件 → `docs/brief.md` → `src/promo/timeline.ts` → `docs/design-spec.md`。
- 一次只改一个场景；不要顺手重构无关场景；改全局 tokens 必须全片复查。
- 声明“完成”必须附证据：静帧路径 + 帧号 + diff 结果；禁止“看起来应该对”。
- 截图缺失 / 状态不明时先问；不要发明 UI、功能、数据或指标。
- 新增依赖要说明理由、pin 版本；不要引入重型动画库替代 Remotion 的帧驱动。
- 代码注释只写“为什么”，不写“做了什么”；不要多段注释块。
- Git：不提交 `node_modules/`、`out/`、`vendor/`、`.workbuddy/`；不执行破坏性命令；不主动 push。
- 改了 `timeline.ts`：同步字幕 / SFX / 验收帧，跑全片 QA。
- 改了 `theme/tokens.ts`：全片静帧复查，防止某场颜色/字体漂移。
- 新增场景：加 `SCENES`、加静帧验收帧、更新 `docs/design-spec.md` 的分镜表。
- 移植镜头卡：记录卡名、commit、源文件、改动点；不要静默改参数。
- 交付前清理临时实验文件；保留可复现的脚本和文档。

---

## 11. 输入清单（用户提供）

| 素材 | 要求 | 缺失时 |
|---|---|---|
| 产品简报 | 名称、一句话定位、目标用户、3 个核心功能、差异点、CTA/URL | 先问；不要猜 |
| 界面截图 | 每个出镜状态：原始分辨率 / 2x、完整窗口、默认/hover/菜单展开/弹窗/空态/满载 | 缺的状态先问；推断的要标注并确认 |
| 字体 | TTF/OTF/woff2 + 授权 | 用最接近的度量兼容字体 + diff 例外记录 |
| Logo / 图标 | SVG 优先；PNG 至少 2x/4x | 不要重画；先要原始文件 |
| 品牌色 | hex / oklch；没有就从截图取样 | 取样后写进 tokens |
| 文案 | 功能名、tagline、CTA、免责声明 | 先问；不要编 |
| 数据 | 假数据或已授权数据；敏感信息先脱敏 | 默认全部虚构 |
| 音频 | BGM / SFX 文件 + 许可证；或授权使用 Mixkit | 只用有明确 URL 的素材，记录授权 |
| 法务 | 商标、第三方 logo、免责声明 | 先问；未授权不出现 |

### 11.1 脚本分工

- **用户不需要写完整脚本**。只需提供事实与拍板项：定位、目标用户、必展功能、可公开的证据/数字、CTA、语气、旁白形式。
- **Agent 负责**：30 秒 treatment → 场景表 → 完整分镜（画面/文案/动效/转场/SFX）→ 字卡与字幕稿 → 旁白稿（如需要）。
- **用户拍板**：定位、必展功能、claim/数据、CTA、旁白形式；其余由 Agent 起草。
- 用户已有脚本时：按 8 场骨架改编，不照搬；脚本里的功能/数字必须能追溯到截图或用户确认。
- 旁白三选一：真人旁白（3 分钟推荐，信息承载最强）/ 纯字幕 + 音乐（制作最快）/ 无旁白纯音乐（最克制的品牌片）。选择写进 `docs/brief.md`。

用户只需填这张表，剩下的 Agent 写：

```text
产品名：
一句话定位：
目标用户：
必须展示的 3 个功能：
每个功能的一句话价值：
可公开的证据 / 数字：
CTA（网址 / 下载方式 / 捐赠入口）：
语气（专业 / 亲和 / 热血 / 平静）：
旁白（真人 / 字幕 / 无）：
```

---

## 12. 决策记录与例外

写进 `docs/decisions.md`，每条含：决定、理由、日期、确认人、影响范围。

- **D1 桌面软件用 HTML 重建**：上游 video-shotcraft 的 Q1 要求“复刻既有页面必须真实截图”；本项目只有桌面截图、没有可运行 Web 页面，因此按截图在 HTML/CSS 中重建舞台，用 §6.4 像素 diff 作为保真兜底。这是明确例外，不是默认做法。
- **D2 Remotion 授权（已解决）**：用户 2026-10-28 确认本项目为个人公益产品，不涉及商业授权；按 Remotion 个人免费许可使用。若后续商业化再复核。字体/音频/第三方 logo 的授权不受此影响，仍逐项记录。
- **D3 3 分钟下限**：内容不足时加工作流 / 证据段，不用慢镜头灌水。
- **D4 音频来源**：无法反查来源的音频不进交付母版。
- **D5 镜头库 pin**：video-shotcraft 只读参考，pin `43bd349`；只复制用到的组件并标注来源。
- **D6 字体替代**：任何字体替代都要记录并让用户确认；文字区域 diff 豁免不等于可以糊弄。

---

## 13. 参考

- video-shotcraft 仓库：https://github.com/Vincentwei1021/video-shotcraft （pin `43bd349`）
- 镜头画廊：https://vincentwei1021.github.io/video-shotcraft/
- 制作流水线：`vendor/video-shotcraft/references/pipeline.md`
- 审美准则：`vendor/video-shotcraft/references/aesthetic-rules.md`
- 镜头转场三式：`vendor/video-shotcraft/references/shots/transition/shot-transitions.md`
- 成片模板：`vendor/video-shotcraft/template/TEMPLATE.md`
- 音频授权：`vendor/video-shotcraft/assets/audio/ATTRIBUTION.md`
- Remotion 转场：https://www.remotion.dev/docs/transitions
- Remotion three：https://www.remotion.dev/docs/three
- Remotion 渲染参数：https://www.remotion.dev/docs/cli/render
- Remotion 许可：https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
