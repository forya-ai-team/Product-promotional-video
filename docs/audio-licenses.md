# 音频授权与来源

本片音频全部为**原创合成**，不含任何第三方采样、循环包或曲库素材；生成脚本与参数在仓库内可复现。

## BGM

| 文件 | 来源 | 许可证 | 生成方式 |
|---|---|---|---|
| `public/audio/bgm/apple-score-bgm.wav` | 本源代码仓库，`scripts/score.py` | 原创作品，归项目所有者；无第三方权利 | 120 BPM / A 大调（I–vi–IV–V）；numpy + scipy 合成（正弦/锯齿振荡器、噪声、FFT 卷积混响）；固定随机种子 `20261029` |

- 时长 91.70s（2751 帧 @30fps），48kHz 立体声 float32。
- 结构：0–13.47s 品牌开场（pad → 逐小节叠加底鼓/镲/开镲/stab/拍手）→ 13.47–17.37s S02 满编 groove 与四拍选择 → 17.37–49.83s S03/S04 律动 + pluck 主音 → 49.83–62.87s S05 加速与属和弦延长（军鼓滚奏）→ 63.833s drop（唯一爆点）→ 67.30–67.58s 灯灭真静默 → 67.58–73.03s 聚光灯无鼓 pad → 73.03–84.7s 工作流 groove → 85.1s 报告卡（鼓停后的和弦）→ 88.70s 终止和弦 → 91.70s 淡出。
- 响度：分轨峰值 BGM −7.3 dBFS / SFX −4.4 dBFS（同一系数缩放）；成片经两遍 ffmpeg `loudnorm`（I=−14、TP 目标 −2）归一，主版 **−13.93 LUFS / −1.83 dBTP**、无 BGM 版 **−15.20 LUFS / −1.77 dBTP**（见 `docs/decisions.md` D44 与 `docs/design-spec.md` §20.2）。

## SFX

| 文件 | 来源 | 许可证 | 生成方式 |
|---|---|---|---|
| `public/audio/sfx/apple-score-sfx.wav` | 本源代码仓库，`scripts/score.py` | 原创作品，归项目所有者；无第三方权利 | 同 BGM 脚本，独立总线：UI 拟音、portal whoosh、sub drop、S05 impact、灯亮 sparkle、报告/尾卡 sparkle |

- 时长 91.70s，48kHz 立体声 float32。
- SFX 与 BGM 分轨：无 BGM 版（`--props=props-nobgm.json`）保留 SFX。

## 复现

```bash
python scripts/score.py
```

脚本是确定性的（固定种子）；重跑会覆盖两个 WAV。改动 `timeline.ts` 的帧长或接缝时，需要同步更新 `scripts/score.py` 顶部的 cue 常量并重跑。

## 交付口径

- 带 BGM 版：`out/final/promo-bgm.mp4`（H.264 CRF18 / yuv420p / AAC 320k）。
- 无 BGM 版：`out/final/promo-nobgm.mp4`（保留 SFX）。
- 两版共用同一时间线与同一组 SFX。**两版各自走一遍两遍法 `loudnorm`**（不再给无 BGM 版套主版的固定增益）：SFX 分轨峰值 −3.96 dBFS，主版所需的 +5.5 dB 会把它顶到 +1.5 dBFS 削波；改走 loudnorm 后由 −2 dBTP 上限把增益压到 +4.8 dB，无 BGM 版落在 −15.2 LUFS。
