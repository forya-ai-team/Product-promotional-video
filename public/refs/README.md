# 参考截图（本地只读，不入库）

`Sxx/` 下存放用户提供的原始截图，仅本地用于复刻与像素 diff。

- 原图可能含真实 IP、账号、内部 URL，**不要提交到仓库**（见 decisions.md D15）。
- 仓库只提交复刻后的假数据、贴片与文档。
- 复现 `npm run qa:diff` 时需先把 `default@2x.png` 放回 `public/refs/S03/`。
