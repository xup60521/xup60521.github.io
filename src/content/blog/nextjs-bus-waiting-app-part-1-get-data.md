---
author: Zup
pubDatetime: 2024-03-04T07:26:15.535Z
title: 串接交通部API，用Next.js做一個等公車網頁－Part.1 取得資料
slug: nextjs-bus-waiting-app-part-1-get-data
featured: false
draft: false
tags:
  - web-tech
  - nextjs
  - transportation
description: "現有的等公車程式都有些缺憾，於是決定自己做一個出來。先串好API再說。"
---

公車是全台灣最密集的大眾運輸工具，只不過我每次要搭公車時，都在想要做哪一班車、怎麼轉程才會到目的地。雖然Google Map可以幫你規劃，但我希望達成如捷運路線圖，一眼看過去就能知道要搭哪班車的境界。

不過全部顯示會讓人眼花撩亂，像之前去台南時拍的公車路線圖，反而沒辦法一眼看出轉乘的順序。如果用手動將路線加上去，想必會有更好的效果。

![台南車站附近公車路網圖](https://github.com/xup60521/xup60521.github.io/blob/asset/nextjs-taiwan-bus/tainan-station-bus-route-map.jpg?raw=true)

用Next.js寫一個等公車的網站，預計的功能要有：

1. 可以選擇公車，顯示行經站牌的預估到站時間外，並於地圖上劃出路線
2. 可依據站牌選擇經過的路線，並顯示各路線到站預估時間
3. 能夠將公車路線長駐在地圖上，根據使用者的需求形成路網圖
4. 在不同縣市都能運作

先來解決取得資料的問題，之後再來煩惱UI怎麼寫。

## Table of contents

## 規劃

我希望地圖站至少一半以上，這樣子才能凸顯路線圖的功能。另外為了滿足上面的要求，我想把他們做成不同的「面板」，並能夠從控制區切換顯示。

- 公車面板

選擇一個公車路線，顯示所有經過的站牌與到站預估時間（定期更新），也要能切換不同的方向。點擊站牌後地圖會移動到該位置，並顯示詳細資訊。另外也要可以直接從公車面板切換到站牌面板，例如台北基隆路幹線有經過捷運公館站，則應該要可以從「顯示基隆路幹線的公車面板」直接切換到「顯示捷運公館站的站牌面板」。

另外，可以選擇要不要把該路線「疊加」到地圖，就算切換選取的公車，疊加的路線仍然長駐在地圖上。

- 站牌面板

選擇並顯示該站牌有停靠的所有公車，無論順向還是逆向，並顯示他們預估到站時間（也要定期更新）。與公車面板類似，要能夠從「顯示捷運公館站的站牌面板」切換到「顯示基隆路幹線的公車面板」。

此外，也可以選擇要不要將路線疊加至地圖。

- 疊加面板

這裡會顯示所有長駐「疊加」的路線，可以選擇刪除，或是切換到顯示該路線的公車面板。

---

至於地圖，主要當然是顯示路線與站牌位置。其他關於路線、站牌...blablabla的操作都會在面板中完成，地圖只負責顯示而已。

## create-t3-app

因為會用到tRPC，與其自己設定半天，不如直接用現成的模板，省去很多麻煩。另外也使用TailwindCSS作為style solution，不為什麼，單純這樣子會比較有效率。

當然用原生的`create-next-app`也行，只是要自己設定就是了。另外因為會使用到一些新功能，所以會使用App Router來進行，記得不要選錯了。

雖然基本上已經成為標配了，不過整個專案都會使用Typescript，可以有效減少因型別問題而產生的錯誤。

## Data Flow & State Management

### TDX & env

這裡全部的資料都是透過交通部[TDX](https://tdx.transportdata.tw)所提供，要先申請一個帳號，取得`client_id`與`client_secret`後才能開始用API（不用其實也可以，但就會有流量限制）。

把id和secret小心翼翼地收到`.env`後，每次都用`process.env.client_id`說實在不太安全，沒有型別提示很容易會不小心打錯，又要花一堆時間debug。

因此我們來新增一個`env.ts`，使用zod來減輕打錯字整組壞掉的焦慮（t3-app有可以直接修改的範本，不過還是重新帶一次）

安裝zod

```bash
npm i zod
```

設定`env.ts`

```ts
import { z } from "zod";

const EnvSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

export const env = EnvSchema.parse({
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
});
```

如果之後後端要使用，就從這個檔案匯入env就好了。

不過id和secret並不能直接使用，要先經過認證、回傳access_token才行。把這個過程獨立成一個檔案`get_access_token.ts`

```ts
import { env } from "~/env";

export async function get_access_token() {
  const res = await fetch(
    "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: env.client_id,
        client_secret: env.client_secret,
      }),
    }
  );

  return (await res.json()) as {
    access_token: string;
  };
}
```

接下來就可以拿著這個`access_token`來去呼叫TDX API了。

### Fetch Data

根據[需求](#table-of-contents)，我們會需要API做幾件事情

#### 會用到的OData語法

這些語法是透過URL SearchParams來傳遞的。例如我只要取得公車的路線名稱

```js
fetch(
  `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/Taipei?&$select=RouteName,SubRoutes&$format=JSON`
);
```

在`/City/Taipei`的後面加了`?&$select=RouteName&$format=JSON`。?代表後面開始是SearchParams。&代表連接不同的變數，放在最前面沒有特別意義。而$select、$format則是變數名稱。

所以`$select=RouteName,SubRoutes`代表選擇RouteName與SubRoutes這兩個欄位。而`$format=JSON`代表回傳的資料格式為JSON。

若要過濾，則要使用$filter來輸入邏輯。如果要指定找尋中文名稱為'羅斯福路幹線'公車的話，要在後面加上`$filter=RouteName/Zh_tw eq '羅斯福路幹線'`，這樣子TDX就會回傳過濾後的資料了。

另外過濾也有不同的用法，例如要找到「名稱包含幹線」的公車，則語法為`$filter=contains(RouteName/Zh_tw,'幹線')`，TDX API就會回傳正確的資料。

[TDX Gitbook](https://motc-traffic.gitbook.io/traffic/api-te-se/odata)也有使用說明。

#### 取得所有公車資料

因為不同縣市的路線都不同，從TDX拿取資料最方便。另外我也不希望API的使用次數、流量爆炸，所以限制存取一些欄位就好，剩下的就不用管了。

最基礎的寫法如下

```ts
const access_token_res = await get_access_token();
const access_token = access_token_res.access_token;
const res = fetch(
  `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/Taipei?&$select=SubRoutes,RouteName`,
  {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }
);
const data = (await res.json()) as BusList[];
```

因為從網路上抓下來的資料並不包含型別，所以這裡要手動指派。方法也很簡單，先用Postman之類的軟體抓一次資料，再去[quicktype.io](https://quicktype.io/)這類型的網站自動生成型別，之後手動指派給抓下來的資料就好了。

當然，不指派型別也行，之後要使用時就不會有提示，出錯機率很高。時間應該要花在有意義的地方，花點幾分鐘設定型別資料，可以省下之後debug的時間。

---

你有發現一件事嗎，就是上面的code其實只有在後端（或是React Server Component）才能運行，因為環境變數沒有前綴NEXT_PUBLIC，執行`get_access_token()`時會爆出錯誤。

當然這也不是說你要把`client_id`與`client_secret`都暴露到前端，而是我們要繞一下路，利用Server Action，讓前端碰不到變數的同時也能取得資料。詳細的原理可以參考[這篇文章](https://ithelp.ithome.com.tw/m/articles/10326639)。

原則上把邏輯都寫進Server Action函數裡面，就不會有洩漏的問題。因此前面取得所有公車資料的寫法變成：

`getAllBus.ts`

```ts
"use server";

import { get_access_token } from "./get_access_token";
import { type BusList } from "./../type/bus";

export async function getAllBus(city?: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const initBusList_res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/${
      city ?? "Taichung"
    }?&$select=SubRoutes,RouteName`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      next: { revalidate: 43200 }, // 顯示所有路線的資料不需要常常更新，所以間隔可以設長一點
    }
  ).then(res => res);
  const initBusList = (await initBusList_res.json()) as BusList[];
  return initBusList;
}
```

#### 取得路線站牌資料

`getBusStops.ts`

```ts
"use server";

import { get_access_token } from "~/server/api/routers/bus";
import { type BusStops } from "~/type/bus";

export async function getBusStops(bus: string, city: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/StopOfRoute/City/${city}/${bus}?$select=RouteName,Direction,Stops&$filter=RouteName/Zh_tw eq '${bus}'&$format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      next: { revalidate: 43200 },
    }
  ).then(res => {
    return res;
  });
  const data = (await res.json()) as BusStops[];
  return data;
}
```

#### 取得公車路線圖資

`getBusShape.ts`

```ts
"use server";

import { get_access_token } from "~/server/api/routers/bus";
import { type BusGeo } from "~/type/bus";

export async function getBusShape(bus: string, city: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/Shape/City/${city}/${bus}?$select=Direction,RouteName,Geometry&$filter=RouteName/Zh_tw eq '${bus}'&$format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      next: { revalidate: 43200 },
    }
  ).then(res => {
    return res;
  });
  const data = (await res.json()) as BusGeo[];
  return data;
}
```

#### 搜尋站牌

`searchStop.ts`

```ts
"use server";

import { get_access_token } from "~/server/api/routers/bus";
import { type BusStopSearchResult } from "~/type/bus";

export async function searchStop(q: string, city: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/Stop/City/${city}?%24top=30&%24format=JSON&$filter=contains(StopName/Zh_tw,'${q}')&$select=StopName`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      next: { revalidate: 43200 },
    }
  ).then(res => {
    return res;
  });
  const data = (await res.json()) as BusStopSearchResult[];
  return data;
}
```

#### 取得預估時間

這時tRPC就要出場了，作為連接前後端的橋樑，它很適合做「取得預估時間」這種需要常常更新的資料。

如果你沒有使用`create-t3-app`，那可能要花一點時間去把所有的檔案設定好，如果你還不熟悉這個工具的話，過程可能會有些痛苦。照著[官網](https://trpc.io/docs/quickstart)設定就好了。

一樣先來看需求：

- 一個公車路線行經站牌的預估時間
- 一個站牌，顯示不同路線到站預估時間

所以會有兩種搜尋方式。為求方便寫成兩個不同的方法：

```ts
import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"; //看你怎麼設定，import路徑可能會不同
import type { BusEst, BusRoutePassBy } from "~/type/bus"; //匯入自定義的type

export const busRouter = createTRPCRouter({
  getBusEst: publicProcedure
    .input(
      z.object({
        bus: z.string(),
        city: z.string(),
      })
    )
    .query(async ({ input }) => {
      const access_token_res = await get_access_token();
      const access_token = access_token_res.access_token;
      const res = await fetch(
        `https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/${input.city}/${input.bus}?$select=RouteName,StopName,Direction,NextBusTime,StopStatus,StopSequence,EstimateTime&$filter=RouteName/Zh_tw eq '${input.bus}'&$format=JSON`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      ).then(res => {
        return res;
      });
      const data = (await res.json()) as BusEst[];
      return data;
    }),
  getRoutePassBy: publicProcedure
    .input(
      z.object({
        stopName: z.string(),
        city: z.string(),
      })
    )
    .query(async ({ input }) => {
      const access_token_res = await get_access_token();
      const access_token = access_token_res.access_token;
      const res = await fetch(
        `https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/${input.city}?$filter=StopName/Zh_tw eq '${input.stopName}'&$select=Direction,RouteName,NextBusTime,EstimateTime&$format=JSON`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      ).then(res => {
        return res;
      });
      const data = (await res.json()) as BusRoutePassBy[];
      return data;
    }),
});
```

tRPC的細節就不多說了，總之現在後端都設定完成了，包含`get_access_token.ts`、`getAllBus.ts`、`getBusStops.ts`、`getBusShape.ts`、`searchStop.ts`五個Server Action，還有在tRPC Router定義的`getBusEst`、`getRoutePassBy`兩個函式。後端都完成了，接下來可以專注在前端了。

### Jotai

慢著，即使現在有了資料傳輸的方法，但前端要把他們存起來，才可以好好利用。更不用說有些資料是需要共享的，例如站牌資料不只公車面板需要，地圖也要存取各站點的經緯度以放置圖標。

用`useState`雖然可以，但太多層的資料傳遞會極度麻煩。而Context API雖然也能解決這個問題，但`<Provider>`下面所有的元件都會一起rerender，效能上不太行。因此使用一個外部的解決方案就變得必要了。

Jotai解決了上述的問題。

要開始使用，我的習慣是到獨立的資料夾新增atom，之後在不同元件中，只要用useAtom hook就可以正常瀏覽資料，而不用擔心rerender與provider上下層級的關係。

新增一個atom

```ts
import { atom } from "jotai";
import type { BusStops } from "~/type/bus";
export const busStopsAtom = atom<BusStops[] | null>(null);
```

存取atom

```tsx
"use client";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { busStopsAtom } from "~/state/bus.ts"

export default function Page() {
  const [data, setData] = useAtom(busStopsAtom) // 功能和useState一模一樣

  const readOnly = useAtomValue(busStopsAtom)
  const setOnly = useSetAtom(busStopsAtom)

  return (
    ...
  )
}
```

## 小節

到這裡發現筆電快沒電了，而且也已經寫很多了。現在主要的架構、最重要的資料流都處理好了，接下來剩下

- 地圖與各種圖標、路線
- 卡片UI與功能

這系列不知道會分成幾篇，To be continued...
