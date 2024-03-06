---
author: Zup
pubDatetime: 2024-03-03T15:11:54.557Z
title: 【悲劇】Remix新手嘗試做一個等公車網頁
slug: failed-bus-app-with-remixjs
featured: false
draft: true
tags:
  - web-tech
  - remixjs
  - reactjs
description: "平常都用Nextjs的我，心血來潮來用Remix來做等公車的網頁"
---

有一天起床時，突然覺得自己之前都是用Next.js來做一些自己的專案，卻好像都忽略同為React生態系的Remix。要不要來用用看？決定了，我拿一個現成的side-project改造成Remix App吧！

![remix-website](https://github.com/xup60521/xup60521.github.io/blob/asset/failed-bus-app-with-remix/remix-website.png?raw=true)

## Table of contents

## 我與react-router-dom

看了一下官網，它基於React-Router，看起來對於切換不同面板有不錯的體驗。我最初在學網頁前端時，還不知道有Next.js、Remix這類前端框架，最一開始用`create-react-app`來開始專案，後來進階一點開始用`vite`來建立SPA專案，還曾用它來寫過部落格。

SPA要怎麼寫部落格？我當初也在想這個問題，於是我就上Google查詢`react multipage`，最後搜尋引擎推薦我使用`react-router-dom`，於是我就自信滿滿地開始寫網頁。

一開始還好，在學習基本用法後的確有寫出一些東西，也能夠使用`<BrowserRouter>`成功換頁（因為我不喜歡`<HashRouter>`的#符號）。但天真的我在把網頁放上Github Page後，發現一個超重大的Bug。

我在點進去一個連接時，舉例從根目錄`/`換到所有文章頁面`/blogs`好了，在網頁上操作都是順利的，可是當我重新整理時，Github Page卻顯示404 Page Not Found。

這時我才理解，Single Page Application (SPA) 其實就只有一個頁面，哪在瀏覽器網址欄看到的目錄變化都是Javascript做的，實際上那個目錄沒有網頁。所以重新整理時，瀏覽器往實際上不存在的位置存取網頁，自然什麼都沒有找到。

## Remix：好像很適合

不過機會來了，現在我知道有Remix這全端框架，之前在SPA犯的錯，那絕望的404終於不會再出現了。不過確實，我現在也知道有Astro這類靜態網站生成框架，這個部落格就是基於Astro-paper模板做成的，實在有點難利用Remix框架的特性。

照官網看來，有不同動態頁面切換的網頁最適合這個框架。剛好我之前用Next.js做了一個[等公車的小網頁](https://t3-taiwan-bus.vercel.app)，雖然有成功做出來，但感覺怪怪的，不同面板的網址應該要不同，而不是靠醜醜的URL SearchParams來切換。不同動態面板切換的情境好像很適合用Remix來解決，決定Give it a shot，看最後結果如何。

![t3-taiwan-bus](https://github.com/xup60521/xup60521.github.io/blob/asset/failed-bus-app-with-remix/t3-taiwan-bus.png?raw=true)

## Remix Basic Setup

### TailwindCSS

因為`create-remix` CLI沒有提供預安裝TailwindCSS的選項，因此新增好專案後的第一步就是安裝Tailwind。

根據[官網](https://tailwindcss.com/docs/guides/remix)的說明，用npm安裝之後，要去新增`app/tailwind.css`並將檔案匯入到跟目錄中。但我在這裡犯了很大的錯，沒有照著教學走，最後導致[shadcn/ui](https://ui.shadcn.com/)的元件全部都沒有Apply Tailwind Style，最後強制重新開始。

話說之前又有TailwindCSS的Drama了，我以前也覺得沒有必要用Tailwind，主要是要重新記className的關係。後來因緣際會開始用之後，就再也回不去了，可以不用切換視窗的感覺真棒，有什麼問題就直接些改就好，不用再找class在哪裡了，為開發體驗加超多分。

### shadcn/ui

這是我在原本的專案就有用的UI library，安裝過程也是照著[官網](https://ui.shadcn.com/docs/installation/remix)步驟做就行了。

## Remix File Name Route

預設模式下，所有的page檔案都放在`app/routes`資料夾裡面，透過不同的命名來表示網址。

專案的file structure 如下：

```
app/routes
├── _index.tsx
├── $city._index.tsx
├── $city.$bus.tsx
├── $city.note.tsx
├── $city.overlay.tsx
├── $city.resource.ts
├── $city.station._index.tsx
├── $city.station.$stationname.tsx
└── $city.tsx
```

預設port=3000。

因此進入localhost:3000時，會顯示`_index.tsx`的路徑。

至於前面有$代表Dynamic Route，可以在檔案裡面透過一些方法來取得params。這等等會談到。

官網的示意圖：

![remix-example](https://github.com/xup60521/xup60521.github.io/blob/asset/failed-bus-app-with-remix/remix-example.png?raw=true)

要達成類似這樣的效果，首先要到`$city.tsx`建立模板，在其中定義後面願見要放進去的位置。

```tsx
import { Outlet } from "@remix-run/react";

export default function Page() {
  return (
    <main>
      <nav>// some layout</nav>
      <Outlet /> //後面的內容會放在這裡
    </main>
  );
}
```

諸如此類。而進入localhost:3000/Taichung 時，`<Outlet />`則會渲染`$city._index.tsx`的內容，其他的以此類推。

UI建立好之後，就可以開始處理真正的內容了。

## 不適應：Data Flow

從Next.js（尤其是App Router）跳過來Remix最大的衝擊就是處理資訊流，之前我會使用Server Action來讓Next.js自動生成API Endpoint，這樣子在前端Client Component fetch資料時就能有比較好的體驗（外加上Typesafe，赚爛）。

可是在Remix不是這回事，除了沒有剛推出時被罵翻天的Server Action以外，它的API Route (Resource Route)也不太直覺。

如果要在網頁一開始載入資料的話，Remix會要你在component file export async function loader() {...}，Dynamic Route Params、SearchParams、初始資料都是透過這個loader來達成。前端再使用`useLoaderData` Hook來存取資料。

如果有需要類似API Endpoint的需求，Remix可以做得到，但是也是使用loader來處理。透過新增加一個沒有匯出component的檔案，匯出loader function並return資料，再fetch那個位置的網址來存取後端的資料。

正常情況下這個模式還可以應付，但對於每次fetch都一大堆的公車資料來說真的不太理想，一開始的資料透過loader處理完後再渲染，每一次切換到公車預估到站時間頁面都要lag很久才會出現，完全稱不上是好的體驗。

到了這種程度，坦白說我對Remix的耐心也已經耗盡了。如果不透過loader來處理的話，又會回到之前用`useEffect`在初始渲染時fetch資料（通常會比在server存取還要慢），不過也會喪失remix的最大特性，也就是在頁面切換時，不重新整理頁面而從backend直接傳送新component的資料回來，這情況下，使用Remix變得可有可無，實在是可惜了。

## 結語：情境不適合

我花了大約兩天從頭學習Remix，後來卻發現使用的時機並不適當，感覺並不太好。

然而正如上一節所總結的，這並全然是Remix的問題，是因為資料量太大，傳遞所造成的延遲降低了使用者體驗。如果像是官網示範的那樣，一個Dashboard不同的分頁，那可能才是Remix發揮架構優勢的空間。
