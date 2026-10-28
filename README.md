# Product-promotional-video

3 分钟产品宣传片工程：Remotion + HTML/CSS + three.js，镜头配方参考 video-shotcraft。

## 快速开始

```bash
npm install
npm run dev
```

- 制作手册：[AGENTS.md](./AGENTS.md)
- 列出 composition：`npm run compositions`
- 类型检查：`npm run typecheck`
- 终渲：`npm run render`
- 无 BGM 版：`npm run render:nobgm`

当前 `ProductPromo` 是 8 场占位骨架（SCAFFOLD），等截图、字体与文案接入后替换。
`S03Static` 是截图 1 的 1:1 静态复刻（供像素 diff），`S03` 是当前揭示动效场景；
`ThreeProbe` 是 WebGL 冒烟测试 composition，可在真实 3D 场景接入后删除。

之后的新截图放 `screenshots/`（原始图本地保留，不入库）。

首次运行 Remotion 会下载 Chrome Headless Shell；下载慢时给任意 Remotion 命令加
`--browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"` 改用本机 Chrome。
