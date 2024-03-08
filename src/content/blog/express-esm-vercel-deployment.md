---
author: Zup
pubDatetime: 2024-03-08T12:14:41.851Z
title: Express + ESModule + Vercel：Quick Start
slug: express-esm-vercel-deployment
featured: false
draft: false
tags:
  - web-tech
  - expressjs
  - vercel
description: "把express部署到vercel，還順便用了ESModule"
---

## Table of contents

## 初始化專案

```bash
mkdir new-express-project
cd new-express-project
pnpm init
```

用任何套件管理器（npm、yarn、pnpm、bun）都可以，這裡我使用pnpm。

再來，因為想要使用ESModule，所以要去修改初始化專案後自動生成的`package.json`。

插入`"type": "module"`

```json
{
  "name": "new-express-project",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

接著，為了讓vercel認得這個專案，於根目錄在新增一個檔案`vercel.json`

```json
{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

後面的`/api`不要更改，不然vercel會錯亂。

接著到了重頭戲，建立一個express server。首先在根目錄新增一個資料夾`/api`（一樣這個資料夾名稱不要更改），然後在裡面建立`index.js`。我們主要的程式邏輯就放在這裡面。

```javascript
import express from "express"; // esm syntax

const app = express();
app.get("/", async (req, res) => {
  return res.send("Hello, express + esm + vercel");
});

// 注意到了嗎？這裡沒有 app.listen(3000, () => {})
// 因為這些東西vercel cli會自動處理掉。雞婆加進來反而會讓程式crash

export default app; // 與一般的express app不同，需要將app以預設輸出(default export)
// Vercel functions 才會認得這個程式
```

因為都交給vercel cli來處理，所以我們也不需要在`package.json`加入新的script。要開啟dev server，在專案資料夾開啟終端機，輸入

```bash
vercel dev
```

如果之前沒有使用過的話，先用npm全域安裝

```bash
npm i -g vercel
```

雖然說有其他的管理器，但對於全域安裝的套件（像vercel），我會習慣用Node.js預設的npm來安裝，要管理比較方便。

一開始使用會需要登錄等一些瑣碎事項，都完成後基本上只要無腦enter就好了。另外，vercel預設會在你的帳戶中新增一個專案，去[官網](vercel.com)就能看到一個全新的、之前沒出現過的project。

## Deploy to Vercel

在開發時使用的`vercel dev`並不會把code更新上去，因此你可以

1. 手動跑`vercel deploy`來把新的程式碼部署上去

2. 將project與Github（或像是Gitlab這樣的程式碼託管平台）連接

   首先先去Github新增一個Repository，接著把剛才寫好的程式全部push上去。

   接著到vercel.com，點進去剛才執行vercel cli後自動新增的專案，應該就可以看到Connect Git的按鈕，點進去之後選擇Github，並點選剛才新增好的repository，這樣子就能將vercl專案與github repo連結，之後只要有新的commit push上去，vercel就會把程式碼更新上去，就免去跑`vercel deploy`的麻煩。

接著，前往deploy的網址，應該就可以正常運作了。
