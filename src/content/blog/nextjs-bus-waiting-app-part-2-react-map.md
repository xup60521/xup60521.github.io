---
author: Zup
pubDatetime: 2024-03-05T04:56:35.957Z
title: 用Next.js做一個等公車網頁－Part.2 地圖
slug: nextjs-bus-waiting-app-part-2-react-map
featured: false
draft: false
tags:
  - web-tech
  - nextjs
  - transportation
  - leaflet
  - reactjs
description: "上一篇串了TDX API，現在要來把地圖做進網頁去"
---

上一篇串好了TDX API，現在來把我認為最重要的地圖做進去網頁中。

## Table of contents

## 顯示地圖

這次使用`react-leaflet`與OpenStreetMap (OSM) 來把地圖放入我們的網頁裡面。

首先來安裝套件

```bash
npm i react-leaflet leaflet
npm i -D @types/leaflet
```

最基礎的使用方法（記得要匯入leaflet.css）

```tsx
"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css"; //一定要匯入這個css，不然地圖會顯示錯誤

export default function Map() {
  // {緯度, 經度}，這裡用台中市的座標為例

  return (
    <MapContainer
      center={position}
      scrollWheelZoom={true} // 使可以用滑鼠滾輪來縮放地圖
      className="z-0 h-full w-full" // 要定義地圖大小，才可以正常顯示
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        className="absolute right-0"
      />
    </MapContainer>
  );
}
```

## window is not defined

你可能會在終端機看到這個問題，原理是在一般模式下，Nextjs、Remix這類的全端框架會先在server跑一遍，生成html並與javascript綁定，最後再一起回傳給瀏覽器。也被稱為hydration。

但leaflet會使用到瀏覽器特有的功能，而在後端server是沒有這些東西的，所以會出錯，build也會失敗。因此要解決這個問題，只有阻止它在server上運行這一條路。

### Nextjs dynamic import

Next.js有內建動態匯入的功能，可以解決window is not defined的問題。

```tsx
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./_components/map"));

export default function App() {
  return (
    <div>
      ...
      <Map />
      ...
    </div>
  );
}
```

### Remix client-only

既然上面都提到Remix了，也稍微寫一下在這個框架下要怎麼解決。

官方文件直接了當地寫明，透過一些「技巧」讓hydration的時候不會渲染，等到送至瀏覽器時才會render。

新增一個`client-only.tsx`元件

```tsx
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

type Props = {
  children(): ReactNode;
  fallback?: ReactNode;
};

let hydrating = true;

export function ClientOnly({ children, fallback = null }: Props) {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated ? <>{children()}</> : <>{fallback}</>;
}
```

之後要使用時，就可以把元件包裹在`<ClientOnly>`裡面，達成只在瀏覽器渲染的目標。

```tsx
import ClientOnly from "./client-only";
import Map from "./map";
export function App() {
  return (
    <ClientOnly fallback={<div>loading...</div>}>{() => <Map />}</ClientOnly>
  );
}
```

## 顯示圖標、Tooltip、Popup與Polyline

React-Leaflet [官網](https://react-leaflet.js.org/docs/example-popup-marker/)有許多範例，而今天要做的網頁需要使用幾個功能

### Marker

一個最基本的圖標需要幾個元素

- position
- icon

position照字面上的意思，就是表示圖標的位置。icon是圖示，需要特別用leaflet的Icon元件來定義。

```tsx
'use client'
import { Icon } from "leaflet"
import {
  MapContainer,
  TileLayer,
  Marker,
} from "react-leaflet";
export function Map() {

  const position = { lat: 24.137396608878987, lng: 120.68692065044608 };
  const icon = new Icon({
    iconUrl: "pin3.png", //icon圖示檔案放在public資料夾就行了
    iconSize: [16, 16],
  });

  return (
    <MapContainer ... >
      <TileLayer ... />
      <Marker position={position} icon={icon} />
    </MapContainer>
  )
}
```

一個最簡單的Marker就完成了

### Tooltip & Popup

這兩個元件都可以與Marker和Polyline綁定，只需要包裹在`<Marker>`裡面就行

```tsx
<Marker ... >
  <Popup> //點一下圖標會出現
    <div>
      <p>Probably a description</p>
    </div>
  </Popup>
  <Tooltip
    direction="bottom" //方向可自己設定
  >  {/* 滑鼠停在圖標上，就會顯示tooltip */}
    <div>
      <p>Tooltip</p>
    </div>
  </Tooltip>
</Marker>
```

我自己的習慣是建立一個新的component，並把Marker、Popup、Tooltip全部包進去，這樣只要呼叫一個元件就能達成所有的事情了。

```tsx
"use client";
import { Marker, Tooltip, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import type Item from "~/type/item";

export default function DisplayMarker({ item }: { item: Item }) {
  const icon = new Icon({
    iconUrl: "pin_inv.png",
    iconSize: [16, 48],
  });
  return (
    <Marker icon={icon} position={item.position}>
      <Popup>
        <div>
          <p>{item.popup}</p>
        </div>
      </Popup>
      <Tooltip permanent direction="bottom">
        <div>
          <p>{item.tooltip}</p>
        </div>
      </Tooltip>
    </Marker>
  );
}
```

這裡的Item型別只是示範，之後處理公車路線資料的時候會比這個複雜。

## Useful Trick

到這裡可以發現，不論在地圖上新增Marker，還是在Marker裡面增加Popup、Tooltip，其實都會遵循特定的hierarchy。

因此，我們可以把要顯示的資料抽出來，會比較好辦事。

```tsx
'use client'
import ... from "..."//就不重複寫了
import DisplayMarker from "./display_marker"
export default function Map() {
  return <MapContainer ... >
      <TileLayer ... />

    </MapContainer>
}

function ShowMarkers() {
  const list = useData() //假裝可以從這個hook存取資料
  return <>
    {list.map(item => {
      return <DisplayMarker item={item} key={item.id} />
    })}
  </>
}

```

諸如此類。當然全部寫在一起也行，會很亂就是了。

## 小結

到這裡，網頁上應該就有地圖了。之後再來看從TDX拿到的資料要怎麼運用、怎麼展開。
