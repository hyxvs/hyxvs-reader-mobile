# 读者移动端

图书馆管理系统的读者移动端应用，专为移动设备优化。

## 功能特性

- 用户注册/登录/登出
- 首页（热门图书、快捷入口、个人统计）
- 图书查询（搜索、筛选、预约）
- 图书详情
- 我的借阅（当前借阅、历史借阅、续借）
- 我的预约（待处理、已完成、取消预约）
- 个人中心（个人信息、修改密码）

## 技术栈

- Vue 3
- Vant 4 (移动端UI组件库)
- Vue Router
- Pinia
- Axios
- Day.js

## 安装依赖

```bash
cd reader-mobile
npm install
```

## 开发运行

```bash
npm run dev
```

应用将在 http://localhost:3003 启动

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
reader-mobile/
├── src/
│   ├── api/           # API接口
│   ├── layouts/       # 布局组件
│   ├── router/        # 路由配置
│   ├── stores/        # 状态管理
│   ├── utils/         # 工具函数
│   ├── views/         # 页面组件
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── index.html         # HTML模板
├── package.json       # 项目配置
└── vite.config.js     # Vite配置
```

## 主要页面

- `/login` - 登录/注册页面
- `/home` - 首页
- `/books` - 图书查询
- `/books/:id` - 图书详情
- `/borrow` - 我的借阅
- `/reservation` - 我的预约
- `/profile` - 个人中心
