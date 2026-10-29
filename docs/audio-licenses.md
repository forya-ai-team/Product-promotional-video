# 音频授权与来源

本片音频**不含任何第三方素材**：BGM 是项目所有者自己做的曲目（用户 2026-10-29 提供并确认拥有全部权利），SFX 是本仓库脚本原创合成。两者的派生过程都在仓库内可复现。

## BGM（现行）

| 文件 | 来源 | 许可证 | 生成方式 |
|---|---|---|---|
| `public/audio/bgm/user-track-looped.wav` | 派生自 `public/audio/bgm/user-track-source.mp3`（项目所有者自制曲目，原件另存 `screenshot/背景音乐.mp3`） | **原创作品，归项目所有者**；无第三方采样 / 循环包 / 曲库素材 | `node scripts/bgm-loop.mjs` 把 90.421s 的源曲补长到成片长度，再按 −6.07dB 对齐到旧 BGM 分轨的响度位置；103.967s / 3119f / 48kHz 立体声 pcm16 |
| `public/audio/bgm/user-track-source.mp3` | 同上，用户提供的原始文件 | 同上 | 未处理的来源证据；`screenshot/` 在 .gitignore 内，所以复制一份进 `public/audio/bgm/` 保证干净检出可复现派生 |
| `public/audio/bgm/apple-score-bgm.wav` | 本仓 `scripts/score.py` | 原创作品，归项目所有者 | 上一版配乐（120 BPM / A 大调），**已不再是交付素材**；脚本仍会生成它，SFX 分轨也仍由同一脚本产出 |

### 补长做法与实测

源曲 90.421s，成片 103.967s，缺 **13.546s（406f）**。用 `scripts/bgm-loop-search.mjs` 在 50ms 网格上搜「跳回点」：把 [0..j] 播完后跳回 i 再播一次 [i..j]，接缝不可闻的条件是 j 之前与 i 之前的音频相同。最优解

- `r=1`，循环块 **13.546s**，跳接 **84.746s → 71.200s**，波形归一化互相关 **0.909**（次优 `r=3` 只有 0.649）。
- 两处接缝的样本跳变：0.0594 与 0.0276，分别是全曲「每秒最大跳变」中位数 0.1400 的 **0.42× 与 0.20×** —— 接缝比曲子自身的正常过渡还平，无咔哒。
- 两个跳接各叠 25ms 等功率交叉淡入；片尾 1.2s 平方淡出（源曲本身在 89.7s 已收）。

### 响度与电平

| 量 | 旧 BGM 分轨 | 新 BGM 分轨 |
|---|---|---|
| 集成响度 | −20.49 LUFS | **−20.40 LUFS** |
| 真峰值 | −7.35 dBTP | **−7.67 dBTP** |
| BGM+SFX 合并总线 | −19.72 LUFS / −0.93 dBTP | **−19.73 LUFS / −2.92 dBTP** |

分轨电平按 −6.07dB 对齐到旧 BGM 的位置，所以 BGM 压在 SFX 下方约 1 LU 的既有混音关系不变（AGENTS §8），`scripts/normalize-audio.mjs` 的两遍法母版归一化口径也照旧可用；新总线真峰值反而低了 1.99 dB，给 AAC 编码回弹留了更多头。

### 节拍与画面对齐（本轮已知代价）

`node scripts/tempo-scan.mjs` 实测：新曲最佳网格 **≈127.85 BPM**，onset 落格比 3.0% / 全 BPM 均值 1.9% = **1.59×**；对照现行配乐同一算法是 120.00 BPM / 5.2% / 1.8% = **2.88×**。也就是说新曲有脉冲但网格明显更软，且 127.85 BPM 一拍 = **14.12f 不是整数帧**。用户 2026-10-29 拍板「先不动画面」，因此：

- S02 的四次点击仍按 120 BPM / 15f 排（成片 446/461/476/491f），与新曲鼓点逐拍错开，到第四拍累计约 **11f（0.38s）**。
- 旧配乐的锚点（446f groove / 1915f drop / 2191f 工作流 / 2553f 报告卡 / 2661f 尾卡）是按 120 BPM 选的，对新曲不再成立；SFX 分轨仍按画面帧落位，不受影响。
- 若下一轮要重对齐：改 `S02.tsx` 的 `BEAT_LEN` 15f→14f（≈128.6 BPM，与实测差 0.85%、每小节漂 0.5f）即可只重渲 S02；或按新曲相位重排 `scripts/score.py` 的 cue 表并全片重渲。

### 复现

```bash
FF=node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe
$FF -y -i public/audio/bgm/user-track-source.mp3 -ac 2 -ar 48000 -c:a pcm_s16le /tmp/src.wav
node scripts/bgm-loop.mjs /tmp/src.wav public/audio/bgm/user-track-looped.wav 71.200 84.746 -6.07 103.966667
```

换曲或改时长时，先用 `node scripts/beat-grid.mjs <mono.wav>` 与 `node scripts/bgm-loop-search.mjs <mono.wav> <needSeconds>` 重新测脉冲与跳接点，再跑上面两条。

## SFX

| 文件 | 来源 | 许可证 | 生成方式 |
|---|---|---|---|
| `public/audio/sfx/apple-score-sfx.wav` | 本源代码仓库，`scripts/score.py` | 原创作品，归项目所有者；无第三方权利 | 独立总线原创合成：UI 拟音、portal whoosh、sub drop、S05 impact、灯亮 sparkle、报告/尾卡 sparkle。cue 按**画面帧**落位，与 BGM 换曲无关 |

- 时长 94.10s，48kHz 立体声 float32。
- SFX 与 BGM 分轨：无 BGM 版（`--props=props-nobgm.json`）保留 SFX。

## SFX 复现

```bash
python scripts/score.py
```

脚本是确定性的（固定种子）；重跑会覆盖 SFX 分轨**和已弃用的 `apple-score-bgm.wav`**，但不会碰现行 BGM——后者由上面「BGM → 复现」那条命令从 `user-track-source.mp3` 派生。改动 `timeline.ts` 的帧长或接缝时，需要同步更新 `scripts/score.py` 顶部的 cue 常量并重跑。

## 交付口径

- 带 BGM 版：`out/final/promo-bgm.mp4`（H.264 CRF18 / yuv420p / AAC 320k）。
- 无 BGM 版：`out/final/promo-nobgm.mp4`（保留 SFX）。
- 两版共用同一时间线与同一组 SFX。**两版各自走一遍两遍法 `loudnorm`**（不再给无 BGM 版套主版的固定增益）：SFX 分轨峰值 −3.96 dBFS，主版所需的 +5.5 dB 会把它顶到 +1.5 dBFS 削波；改走 loudnorm 后由 −2 dBTP 上限把增益压到 +4.8 dB，无 BGM 版落在 −15.2 LUFS。
