# 📱 微积分地牢：手机App打包指南

## 项目说明

这是一个基于 Capacitor 的 Android App 工程，已经把网页游戏封装成了原生应用。

---

## 🚀 方案一：GitHub Actions 自动打包（推荐！零安装）

**优点**：不需要安装 Android Studio，不需要配置开发环境，上传代码后自动出APK

### 步骤

1. **注册 GitHub 账号**（如果还没有）
   - 打开 https://github.com/signup
   - 用邮箱注册，免费

2. **创建新仓库**
   - 登录后点右上角 `+` → `New repository`
   - 仓库名填 `calculus-dungeon`
   - 选择 `Public`（公开）
   - 点 `Create repository`

3. **上传本项目代码**

   在本项目文件夹里，打开命令提示符（CMD），依次执行：

   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/calculus-dungeon.git
   git push -u origin main
   ```

4. **等待自动构建**
   - 推送完成后，打开你的GitHub仓库页面
   - 点顶部的 `Actions` 标签
   - 你会看到 `Build Android APK` 工作流正在运行
   - 等待约 3-5 分钟

5. **下载APK**
   - Actions 运行完成后，点进去
   - 页面底部有 `Artifacts` 区域
   - 点击 `calculus-dungeon-apk` 下载 zip 文件
   - 解压后得到 `app-debug.apk`
   - 发送到手机安装即可！

---

## 🔧 方案二：本地打包（需要 Android Studio）

**优点**：可以自定义签名、生成 release 版本、随时调试

### 需要安装

1. **Android Studio**（约 1GB）
   - 下载：https://developer.android.com/studio
   - 安装时选择 `Standard` 配置即可

2. **Java JDK 17**（Android Studio 自带，无需单独安装）

### 打包步骤

1. 打开 Android Studio
2. 选择 `Open` → 找到本项目下的 `android` 文件夹
3. 等待 Gradle 同步完成（第一次需要下载依赖，约5-10分钟）
4. 点菜单栏 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
5. 构建完成后，右下角会提示APK位置
6. 默认路径：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📋 项目文件结构

```
微积分地牢-史诗版/
├── android/              ← Android 原生工程
│   ├── app/              ← App 代码和资源
│   ├── gradlew           ← Gradle 构建脚本
│   └── ...
├── www/                  ← 网页游戏文件
│   ├── index.html        ← 游戏主文件
│   ├── manifest.json     ← PWA配置
│   └── service-worker.js ← 离线缓存
├── node_modules/         ← Node.js依赖
├── .github/workflows/    ← GitHub Actions配置
│   └── build-apk.yml
├── package.json          ← 项目配置
├── capacitor.config.json ← Capacitor配置
├── launcher.py           ← Python启动器
└── 微积分地牢-史诗版.html  ← 单文件版（可直接双击玩）
```

---

## ❓ 常见问题

**Q: GitHub Actions 构建失败了怎么办？**
A: 点 Actions 页面的构建记录，查看错误日志。通常是因为网络问题导致依赖下载失败，重新运行即可。

**Q: 安装APK时提示"未知来源"？**
A: 去手机设置 → 安全 → 允许安装未知来源应用 → 允许浏览器/文件管理器安装。

**Q: 游戏存档会丢失吗？**
A: 不会。App使用WebView的localStorage保存存档，卸载App才会丢失。建议游戏内定期导出存档备份。

**Q: 可以发布到应用商店吗？**
A: 可以！但需要生成签名版APK（release build），并遵守各商店的审核规则。

**Q: iPhone能用吗？**
A: 这个工程是Android的。iPhone需要用Capacitor添加iOS平台（需要Mac电脑），或者直接用Safari打开网页"添加到主屏幕"。

---

## 🎮 游戏特色

- 6位可选角色（欧拉、高斯、洛必达、黎曼、柯西、拉格朗日）
- 36+张卡牌，丰富的策略组合
- 16种敌人，5种BOSS
- 完整的剧情模式与多结局
- 30+个成就
- 内置音效与粒子特效
- 数学答题系统，边玩边学微积分

---

祝你游戏愉快！
