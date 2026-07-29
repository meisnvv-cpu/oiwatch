# OiWatch

高端腕表精品展示网站第一版。项目采用 React + Vite，包含原创写实腕表视觉、响应式布局、中英双语、产品详情、私人询价和社媒扩展入口。

## 本地运行

项目已包含一套位于 `work/tools` 的专用 Node.js 24 LTS 环境。在 PowerShell
中可以直接运行：

```powershell
.\start-site.ps1
```

默认访问地址为 `http://localhost:5173`。

也可以使用系统自行安装的 Node.js 20 或更高版本：

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 后续扩展

- `src/main.jsx` 中的 `watches` 可替换为 CMS / 商品 API 数据。
- 询价表单目前提供前端成功反馈，可接入 CRM、邮件或无服务器表单端点。
- WhatsApp / Instagram 区域已预留，可接入实际账号链接。
- 双语结构可平滑迁移至 i18n 方案，支持更多语言与独立 URL。
- 页面已包含基础标题、描述、语义化结构与图片替代文本，可继续补充结构化数据、站点地图和 Open Graph。
