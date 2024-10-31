# Jit

这是一个用 JavaScript 实现的简化版 Git 命令行工具。

> 这是一个学习 Git 原理的玩具项目，实现了 Git 的核心功能。**并非 JIT 即时编译器 **。

## 安装

```bash
npm install jit-cli -g
```

## 支持的命令

Jit 实现了以下 Git 核心命令：

- `jit init` - 初始化一个新的仓库
- `jit add <files...>` - 将文件添加到暂存区
- `jit commit -m <message>` - 提交暂存区的更改
- `jit status` - 查看工作区和暂存区的状态
- `jit log` - 查看提交历史
- `jit clone <repository>` - 克隆远程仓库
- `jit rm-cache <files...>` - 从暂存区移除文件

## 项目结构

```
src/
  ├── commands/     # 命令实现
  └── utils/        # 工具函数
```

## 开发目的

这个项目主要是为了：
- 学习 Git 的核心概念和实现原理
- 实践 Node.js 命令行工具开发
- 好玩 🤪

## License

MIT
