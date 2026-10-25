# Between Notes / 笔记之间

React + TypeScript 的纯前端交互演示。固定375×812手机设计视口，使用本地素材；用户记录只保存在各自浏览器的localStorage，无后端与真实AI接口。

## 本地构建

使用Node.js 24和pnpm 11.25.0：

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm preview
```

## GitHub Pages

在新仓库的Settings → Pages中选择GitHub Actions。`.github/workflows/pages.yml`将安装依赖、构建并仅发布dist。CI根据仓库名设置`PAGES_BASE_PATH`，图片统一使用Vite的`BASE_URL`，支持仓库子路径。

这个Demo没有URL路径路由，页面之间采用内存状态切换；入口URL刷新重新显示首页并恢复已保存记录。公开发布为演示，不调用真实小红书服务。

本仓库应只包含应用源码、九张本地素材、入口、锁文件及部署配置；不提交node_modules、dist、环境文件、私密校验记录或浏览器测试数据。
