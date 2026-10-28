# 用户截图收件箱

之后的软件截图直接放这里（原图，不要修改）。Agent 会从这里取图做复刻与 QA。

## 命名

- 按场景加前缀：`S03-default@2x.png`、`S04-menu-open@2x.png`、`S05-empty@2x.png`
- 还不确定属于哪一场时：`01-描述.png`、`02-描述.png`，归档时再改名
- 同一状态一张图；默认 / hover / 菜单展开 / 弹窗 / 空态 / 满载分别截

## 截图要求

- 原始分辨率，2x / Retina 优先；完整窗口，不要二次压缩或聊天软件转发
- PNG 优先，JPG 可用；不要用截图工具自带的模糊、水印、时间戳
- 图里若含真实 IP、账号、邮箱、内部 URL、密钥，会在进成片前统一换成假数据；**不要把 token / 密码放进来**

## 采用流程

1. 截图放 `screenshots/`（图片本身被 `.gitignore` 忽略，避免真实数据进仓库）
2. 确定采用后，复制原图到 `public/refs/Sxx/`（只读，永不修改），裁出的贴片放 `public/textures/Sxx/`
3. 在 `docs/design-spec.md` 记录尺寸与状态，在 `docs/decisions.md` 记录偏差与假数据替换

> 已归档的参考图示例：`public/refs/S03/default@2x.png`
