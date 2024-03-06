---
author: Zup
pubDatetime: 2024-03-06T04:48:31.544Z
title: DIY React Popup
slug: hand-made-iso-style-react-popup
featured: false
draft: false
tags:
  - webtech
  - reactjs
description: "從頭開始，復刻React Popup"
---

我很愛使用`reactjs-popup`這個套件，幾乎有需要彈出視窗都會用到它。不過總是依賴這個套件也不太好，因此我打算重頭開始，想辦法從頭把popup做出來。

## Table of contents

## 設定環境

### vite + react

因為只是要做Popup而已，也不用大費周章使用權端框架了。`create-react-app`效能不彰，所以決定使用`vite`來建立我們的專案。

```bash
pnpm create vite@latest
```

輸入之後選擇react、typescript，專案就建立完成了。先來安裝package，之後就可以開啟dev server，進行今天的任務。

```bash
pnpm i
pnpm run dev
```

### tailwind

雖然預期code base應該很小，不過為了可以快速修改網頁外觀，以及使用它那方便的顏色集，還是來安裝一下TailwindCSS。

根據[官網](https://tailwindcss.com/docs/guides/vite)的說明，應該幾個步驟就能完成

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

接著去tailwind.config.js，在content新增檔案路徑

```javascript
export default {
  content: [
    "./index.html",               // 新增這行
    "./src/**/*.{js,ts,jsx,tsx}", // 和這行
  ],
  ...
}
```

接著，在index.css新增三行文字

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

重開dev server，tailwind 應該就能啟用了。

之後的css都會寫成tailwind class，大部分都很直觀，如果有看不懂的可以到[官方文件](https://tailwindcss.com/docs)去查詢對應的css 標示。

## 基本畫面

理想上，我希望在按下按鈕後，彈出視窗可以畫面下方飛進來。所以主畫面應該要先設定為`overflow-hidden`，並且為了主視窗不要任意縮放，也將大小固定為`h-screen w-screen`。

因為Popup要飛進飛出，並且是根據container來決定相對位置，因此也要加入`relative` class，[不然畫面會出問題](#without-relative)，因此最後我們的主畫面layout會變成

```tsx
export default function App() {
  return (
    <>
      <main
        className={`relative flex h-screen flex-col items-center justify-center overflow-hidden bg-slate-700 text-white`}
      >
        <button className="rounded-lg bg-black px-4 py-3 text-white transition-all hover:bg-gray-900">
          Open Popup
        </button>
      </main>
    </>
  );
}
```

我還多加了flex等元素，目的是讓`<button>`能夠在畫面置中。這樣子基本的layout就設定好了。

## \<Popup\>

我想要如`reactjs-popup`套件一樣，匯入一個component就可以直接使用，因此把他獨立成一個檔案。

一個最簡單，浮在最上層的彈出視窗

```tsx
export default function Popup() {
  return (
    <>
      <div
        className={`absolute z-10 flex h-5/6 max-h-[50rem] w-5/6 max-w-[50rem] flex-col items-center justify-center rounded-lg bg-gray-100 text-black`}
      >
        Popup
      </div>
    </>
  );
}
```

可是可是，Popup應該要能夠控制才對，不是應該按一個按鈕就要開始，點一下關閉就會消失嗎。你想得沒錯，所以來新增一個useState狀態

```ts
const [open, setOpen] = useState(false);
```

想一下上面這行應該要放在哪一個檔案中，是最上層的`<App/>`還是`<Popup />`？

因為打開Popup的按鈕在上曾，放在`<App/>`裡面比較合理（不過如果用state manager，像是jotai、redux，因為是把狀態丟到global，所以不用擔心層序的問題）

```tsx
function Popup({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <div
        {/* tailwind utility class 先不寫了，太佔空間 */}
        className={`${open ? "" : " translate-y-[100vh]"}`}>
        <button
          onClick={function () {setOpen(false);}}
          className="border-[1px] px-3 py-2 rounded bg-gray-200"
        >
          close
        </button>
      </div>
    </>
  );
}
```

看起來長這樣

![popup比較](https://github.com/xup60521/xup60521.github.io/blob/asset/hand-made-reactjs-popup/popup-demo.png?raw=true)

## Animation

做到這裡，我突然想到Ipad上面的彈出視窗，不僅僅有過場動畫，而且後面還有一個backdrop，讓後景變暗。

當開啟時，我希望會從螢幕下方滑上來，關閉時則會滑回去。把他做成兩個className

（另外因為要改成動畫，所以前面寫的`${open ? "" : " translate-y-[100vh]"}`就先刪掉了，避免衝突）

```tsx
<div className={`${open ? "popup_open" : "popup_close"}`}>
  {" "}
  //一樣省略其他utility class ...
</div>
```

之後來新增一個`popup.css`

```css
.popup_close {
  animation: closePopup 0.75s cubic-bezier(0.075, 0.82, 0.165, 1) forwards;
}

.popup_open {
  animation: openPopup 0.5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards;
}

@keyframes closePopup {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100vh);
  }
}

@keyframes openPopup {
  from {
    transform: translateY(100vh);
  }
  to {
    transform: translateY(0);
  }
}
```

在開啟Popup時，觸發`.popup_open`，其對應的keyframes `openPopup`描述一開始先從往下偏移100vh處，到達最後的y方向偏移0，讓Popup顯示在正確的位置。

關閉時，`.popup_close`對應的@keyframes `closePopup`則相反，從一開始的地方轉換到往下100v處，達成出場的效果。

<video autoplay loop lazy>
  <source src="https://github.com/xup60521/xup60521.github.io/raw/asset/hand-made-reactjs-popup/2024-03-06%2014-25-49.webm" type="video/webm"  />
</video>

不過，一旦你重新整理頁面，就會發現一開始Popup居然是沒收好的，那要怎麼辦。

因為只有一開始會發生，那就限定最初強制收回，這樣不就解決了。

```tsx
export default function Popup({ open, setOpen }: Prop) {
  const tw_class =
    "bg-gray-100 text-black max-w-[50rem] w-5/6 flex flex-col items-center justify-center absolute rounded-lg h-5/6 max-h-[50rem] z-10";
  const [init, setInit] = useState(true);
  useEffect(() => {
    if (open) {
      setInit(false);
    }
  }, [open]);
  return (
    <>
      <div
        className={`${
          init ? "-bottom-[100vh]" : `${open ? "popup_open" : "popup_close"}`
        } ${tw_class}`}
      >
        <button
          onClick={function () {
            setOpen(false);
          }}
          className="rounded border-[1px] bg-gray-200 px-3 py-2"
        >
          close
        </button>
      </div>
    </>
  );
}
```

這樣，重新整理頁面時Popup也不會隨便跑出來了。

## Backdrop

Backdrop比較簡單，只要在Popup開啟時出現，之後關掉就好了。

一個簡單的backdrop div

```tsx
<div
  className={`${
    open ? "opacity-50" : "backdrop_close opacity-0"
  } absolute left-0 top-[-10vh] h-[110vh] w-screen bg-black transition-all`}
></div>
```

不過這裡的問題是，因為也希望它有過場的慢慢變淡，最後變成完全透明，可是這麼一來他就會常駐在畫面上，變成要點什麼都會卡住。

因此也要利用css來解決這個問題

```css
.backdrop_close {
  animation: closeBackdrop 2s forwards;
}

@keyframes closeBackdrop {
  0%,
  99.9% {
    display: block;
  }
  100% {
    transform: translateY(200vh);
  }
}
```

因為只有關閉時才會有這個問題。因此設定一段時間，在完全消失之後立刻平一到畫面外面，這樣就解決了。

不過這方法也不是沒有缺點，就和Popup那邊類似，一旦重新整理頁面，backdrop不會一開始就在畫面外，而是花上面animation定義兩秒的時間移動過去。不過者裡的問題也沒有那麼誇張，因為此時他已經是完全透明，所以除非重新整理後立刻按按鈕，不然沒有人會發現這個設計漏洞的。

再加入一點IOS style

```tsx
import { useEffect, useRef, useState } from "react";
import "./Popup.css";
import { IoShareOutline } from "react-icons/io5";

function Popup({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [init, setInit] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setInit(false);
    }
  }, [open]);

  return (
    <>
      <div
        className={`${
          open ? "backdrop_open opacity-50" : "backdrop_close opacity-0"
        } absolute left-0 top-[-10vh] h-[110vh] w-screen bg-black transition-all`}
      ></div>
      <div
        ref={popupRef}
        className={`${
          init ? "-bottom-[100vh]" : `${open ? "popup_open" : "popup_close"}`
        } absolute z-10 flex h-5/6 max-h-[50rem] w-5/6 max-w-[50rem] flex-col items-center justify-center rounded-lg bg-gray-100 text-black`}
      >
        <div className="flex w-full items-center justify-between rounded-t-lg border-b-[1px] border-gray-300 bg-white p-2 text-sky-600">
          <button
            className="rounded-full p-1 px-2 transition-all hover:bg-slate-100"
            onClick={function () {
              setOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            className="rounded-full p-1 px-2 transition-all hover:bg-slate-100"
            onClick={function () {
              setOpen(false);
            }}
          >
            確認
          </button>
        </div>
        <div className="w-full flex-grow overflow-scroll"></div>
        <div className="flex w-full items-center justify-end rounded-b-lg border-t-[1px] border-gray-300 bg-white p-2 text-sky-600">
          <button className="rounded-full p-1 px-2 text-lg transition-all hover:bg-slate-100">
            <IoShareOutline />
          </button>
        </div>
        {/* <button className="border-[1px] px-3 py-2 rounded bg-gray-200" onClick={()=>setOpen(false)}>close</button> */}
      </div>
    </>
  );
}

export default Popup;
```

有Ipad風格的彈出視窗就完成了

<video autoplay loop>
  <source src="https://github.com/xup60521/xup60521.github.io/raw/asset/hand-made-reactjs-popup/popup-final.webm" type="video/webm" />
</video>

## without relative

如果把最前的relative取消，Popup會直接滿出來

![without relative](https://github.com/xup60521/xup60521.github.io/blob/asset/hand-made-reactjs-popup/without-relative.png?raw=true)

## 結尾

雖然實際上我還是會使用`reactjs-popup`，但了解這些原理也是滿有趣的。

...雖然有很多方法根本是亂來，像是backdrop移動到畫面外，但這樣可以達成效果，就別計較太多了。
