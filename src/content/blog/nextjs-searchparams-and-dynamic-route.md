---
author: Zup
pubDatetime: 2024-02-06T08:28:43.881Z
title: Next.js App Router 取得 dynamic route, searchParams 參數
slug: nextjs-app-router-searchparams-and-dynamic-route
featured: false
draft: false
tags:
  - next.js
  - web-tech
description: "Next.js App Router 取得dynamic route, searchParams參數"
---

我曾花了很多時間去查詢Next.js Dynamic Route與 URL SearchParams的運作方式，不過我常常忘記實際要怎麼用。

所以整理出一些平常會用到的模式，這樣如果又忘記了，也不用再去Google查詢各種零散的文章、Stack Overflow問答了。

## Table of contents

## Next.js Dynamic Route

根據資料夾命名方式不同，會有不同的結果。若現有檔案結構如下

```tsx
src/
├─ app/
│  ├─ page.tsx
│  ├─ [slug]/
│  │  ├─ page.tsx
│  ├─ test/
│  │  ├─ page.tsx
```

若假設網址為http://localhost:3000 (Next.js 預設dev server)，若進入`localhost:3000`則會顯示`app/page.tsx`的畫面；`localhost:3000/123`會顯示`app/[slug]/page.tsx`的畫面。

這邊資料夾命名為`[slug]`，Next.js 就會幫我們建立Dynamic Route，所以無論是進入`localhost:3000/123`或是`localhost:3000/WhateverYouWant`一樣都會顯示`app/[slug]/page.tsx` 的畫面，接下來的問題是，要怎麼在檔案中知道這些參數？

### React Server Component

修改`/app/[slug]/page.tsx`，這邊`slug`可以是任何字串，像是`id`之類的，下面的程式碼一起改就行了。

```tsx
export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div>
      <p>{params.slug}</p>
    </div>
  );
}
```

### Client Component

一樣修改`/app/[slug]/page.tsx`，也一樣`slug`可以改成任何字串。

#### 與Server Component相同的方法

```tsx
"use client";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div>
      <p>{params.slug}</p>
    </div>
  );
}
```

#### 使用`useParams()` hook （只有Client Component能夠使用）

```tsx
"use client";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  return (
    <div>
      <p>{params.slug}</p>
    </div>
  );
}
```

無論是Server Component或是Client Component兩種寫法，都可以得到相同的畫面。

`localhost:3000/whateverYouWant`

![server component and client component dynamic route test](/src/assets/blogImage/nextjs-app-router-searchparams-and-dynamic-route/dynamic-route.png)

### API Route

與Server Component類似的手法

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  return new NextResponse(params.slug);
}
// POST, GET, DELETE...等方法都適用
```

用Postman測試一下

![Postman test API Route](/src/assets/blogImage/nextjs-app-router-searchparams-and-dynamic-route/dynamic-route-api.png)

## URL Search Parameters

假設有一個網址`localhost:3000/test?id=001&color=black`會開啟`/app/test/page.tsx`的頁面(當然這裡也可以用[dynamic route](#nextjs-dynamic-route))

後面這一串`?id=001&color=black`就是searchParams，可以標記多個變數，像是這部影片的網址是`https://www.youtube.com/watch?v=_mKUuTwmKSg`

<iframe width="560" height="315" src="https://www.youtube.com/embed/_mKUuTwmKSg?si=vRZSoAf98TS-IRja&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

由`?`後面算。

回到`localhost:3000/test?id=001&color=black`，這傳遞了兩個資訊

- `id=001`

- `color=black`

  (中間用`&`連結)

可以透過一些方法，來讓我們的code取得這些資訊。

### Server Component

將`searchParams`用類似`params`的方式傳入

```tsx
export default function Page({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  return (
    <div>
      <p>{searchParams?.id ?? ""}</p>
    </div>
  );
}
```

### Client Component

#### 與Server Component相同的方法

```tsx
"use client";

export default function Page({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  return (
    <div>
      <p>{searchParams?.id ?? ""}</p>
    </div>
  );
}
```

#### 使用`useSearchParams()` hook

```tsx
"use client";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  return (
    <div>
      <p>{searchParams.get("id") ?? ""}</p>
    </div>
  );
}
```

1+2種方法，都可以獲得一樣的效果。

`localhost:3000/test?id=test_search_params`

![searchparams outcome](/src/assets/blogImage/nextjs-app-router-searchparams-and-dynamic-route/searchparams.png)

### API Route

與[前面](#api-route)不同的是，這次不是用`{searchParams}`傳入，而是透過`req.nexturl.searchParams`

```ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchparams = req.nextUrl.searchParams;
  return new NextResponse(searchparams.get("id") ?? "Nothing");
}
```

用Postman測試也會得到

![postman test api route (search parameters)](/src/assets/blogImage/nextjs-app-router-searchparams-and-dynamic-route/searchparams-api.png)

## 總結

我記得當初在上[網路服務程式設計](https://course.ntu.edu.tw/courses/90c890fe-54c1-4135-8c46-29d8960847e1)時，為了從後端拿資料折磨了很久，因為當初不熟悉，並且在Server Component, Client Component, API Route Handler的寫法都不完全相同，常常搞混，浪費很多時間重新Google各自的用法。

如果你和我一樣一直忘記這些用法，希望這篇文章可以幫助到你。
