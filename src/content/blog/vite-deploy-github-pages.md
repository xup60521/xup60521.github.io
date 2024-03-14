---
author: Zup
pubDatetime: 2024-03-14T07:32:57.336Z
title: Vite Deploy to Github Pages
slug: vite-deploy-github-pages
featured: false
draft: false
tags:
  - vite
  - web-tech
  - github
description: 利用gh-pages套件，將vite app網頁託管到Github Pages
---

## Table of contents

## Create vite

我是使用pnpm，但不管是npm、yarn、bun，都可以用類似的方式建立vite app

```bash
pnpm create vite@latest
```

建立完成後，把套件安裝一下，接著就可以打開dev server，看一下成品了。

```bash
pnpm i
pnpm run dev
```

選擇react之後會有的畫面

![create vite](https://github.com/xup60521/xup60521.github.io/blob/asset/vite-deploy-github-pages/vite.png?raw=true)

## Deploy

在那之前，先來初始化git，並且將檔案更新上去。

```bash
git init
git add .
git commit -m "寫上你的commit comment"
git checkout -b main
```

接著要去Github 新增一個Repository，接著將它與local的Git儲藏庫連接

```bash
git remote add origin https://github.com/<your user name>/<repo name>.git
```

```bash
git push -u origin main
```

這樣子，去到你的Github專案頁面，應該就能看到所有檔案了。

接著安裝一個套件

```bash
pnpm add -D gh-pages
```

我們要用這個套件來幫助將網頁推到Github Pages上面。

不過在這之前要來設定`vite.config.ts` (如果沒有使用Typescript，那後面應該是.js)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/<repo name>",
});
```

因為推上去的網址會呈現`https://<user name>.github.io/<repo name>`，所以要設定base，最後deploy上去時頁面才不會跑掉。

接著來到`package.json`，在scripts的地方新增一條deploy

```json
"scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "deploy": "vite build && gh-pages -d dist"
  },
```

這串指令的意思是，當執行`pnpm run deploy`時，先把成果build出來，接著再讓`gh-pages`套件把成果deploy上去。

最後回到專案的Github Repository，到Settings > Pages並找到Build and deployment的欄位，接著就可以選擇Build Source為`Deploy from a branch`，並在branch選擇`gh-pages`，旁邊資料夾預設為(root)就不要動它，這樣子就完成了。

頁面上方有標示Your site is live at `一串網址`，點進去就是你的網站了！
