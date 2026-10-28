# VIBCODING-CV-2.

李沿睿 Yanrui Li 的个人作品集网站 —— Apple 式科技留白 × 杂志拼贴风。

纯静态站点（HTML / CSS / 原生 JS），无需构建，直接打开 `index.html` 或任意静态服务器即可：

```bash
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## 页面结构

| 区块 | 内容 |
| --- | --- |
| 01 封面 Hero | 杂志感封面文件夹、大标题、桌面文件夹快捷入口、玻璃导航栏 |
| 02 精华案例 | 5 个可逐一展开的档案文件夹（娇兰新春 / 福莱希乐 / Chi Bodycare / Park Lands / 经纬教育） |
| 03 履历简述 | 头像拍立得、教育背景、工作时间线、项目数据、团队协作 |
| 04 AI 能力强化 | 4 个分隔文件夹：AI+营销洞察 / AI 视觉制作 / AI 文案创作 / AI 产品协作 |
| 05 联系方式 | 打开的文件夹跨页：电话、邮件、微信（一键复制）与合作结语 |

## 自定义

- **头像**：把照片放到 `assets/avatar.jpg`，会自动替换拍立得里的 “YR” 占位。
- **微信号**：在 `index.html` 中搜索 `WECHAT`，修改显示文字与 `data-copy` 的值。
- **文案 / 案例**：都在 `index.html` 对应的 `<section>` 中，样式在 `css/style.css`，交互在 `js/main.js`。
