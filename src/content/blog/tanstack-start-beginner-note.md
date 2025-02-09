---
author: Zup
date: 2025-02-09T09:37:59.706Z
title: TanStack Start 新手上路筆記
# cover:
featured: false
cover: "@/assets/tanstack-start-beginner-note.png"
tags:
    - web-tech
    - reactjs
summary: "新的全端框架 TanStack Start 的新手上路筆記"
---
## TanStack Start 新手上路筆記

官方文件：<https://tanstack.com/start/>

TanStack Router: <https://tanstack.com/router/>

筆記大部分會參考文件中的Build from Scratch，並且加入像是Dynamic Route 、 Search Params以及API route handler的設置。此外，我也會記錄如何設置TailwindCSS，減少之後重複查資料的麻煩。

## Setup

我使用Bun作為運行環境與套件管理器，透過`bun init`來初始化project。

- 設定tsconfig.json

   由於`bun init`生成的tsconfig.json已經很完整，我們只需要做些修改就行

   ```json
   {
     "target": "ES2022", // 將target改成ES2022
     "strictNullChecks": true, // 加入這一項
     }
   ```

- install dependencies

   `bun add @tanstack/start @tanstack/react-router vinxi react react-dom`

   以及

   `bun add -D @vitejs/plugin-react vite-tsconfig-paths typescript @types/react @types/react-dom`

- 加入 script

   打開package.json，可以看見`"type": "module"`不需要再修改。因此，只需要增加`script`即可。

   ```json
   "scripts": {
     "dev": "vinxi dev",
     "build": "vinxi build",
     "start": "vinxi start"
   },
   ```

- 新增 app.config.ts

   類似於vite.config.ts，裡面的設定會左右TanStack Start的行為。

   ```ts
   import { defineConfig } from '@tanstack/start/config'
   import tsConfigPaths from 'vite-tsconfig-paths'
   
   export default defineConfig({
     vite: {
       plugins: [
         tsConfigPaths({
           projects: ['./tsconfig.json'],
         }),
       ],
     },
   })
   ```

## 基本頁面架構

在基礎設定完成後，還需要設定好頁面的configuration，像是Root、Router、Client Entry Point以及Server Entry Point，之後才算全部設定完成。

檔案結構如下

```plain
.
├── app/
│   ├── routes/
│   │   └── `__root.tsx`
│   ├── `client.tsx`
│   ├── `router.tsx`
│   ├── `routeTree.gen.ts`
│   └── `ssr.tsx`
├── `.gitignore`
├── `app.config.ts`
├── `package.json`
└── `tsconfig.json`
```

剛才已經把app/ 以外的部分都處理完了，除了`routeTree.gen.ts`是自動生成以外，其他必須手動設定。

- app/router.tsx

   TanStack Start是基於TanStack Router的全端框架，因此要先對此做些設定。

   ```tsx
   // app/router.tsx
   import { createRouter as createTanStackRouter } from '@tanstack/react-router'
   import { routeTree } from './routeTree.gen'
   
   export function createRouter() {
     const router = createTanStackRouter({
       routeTree,
       scrollRestoration: true,
     })
   
     return router
   }
   
   declare module '@tanstack/react-router' {
     interface Register {
       router: ReturnType<typeof createRouter>
     }
   }
   ```

   由於routeTree.gen還不存在，因此會出現error。不過這個問題在開啟dev server的時候就會解決，現在不用理他。

- app/ssr.tsx

   ```tsx
   // app/ssr.tsx
   import {
     createStartHandler,
     defaultStreamHandler,
   } from '@tanstack/start/server'
   import { getRouterManifest } from '@tanstack/start/router-manifest'
   
   import { createRouter } from './router'
   
   export default createStartHandler({
     createRouter,
     getRouterManifest,
   })(defaultStreamHandler)
   ```

- app/client.tsx

   ```tsx
   // app/client.tsx
   /// <reference types="vinxi/types/client" />
   import { hydrateRoot } from 'react-dom/client'
   import { StartClient } from '@tanstack/start'
   import { createRouter } from './router'
   
   const router = createRouter()
   
   hydrateRoot(document, <StartClient router={router} />)
   ```

- app/routes/\__root.tsx

   metadata、script等，都是在這邊定義並交由框架處理。

   ```tsx
   // app/routes/__root.tsx
   import { Outlet, createRootRoute } from '@tanstack/react-router'
   import { Meta, Scripts } from '@tanstack/start'
   import type { ReactNode } from 'react'
   
   export const Route = createRootRoute({
     head: () => ({
       meta: [
         {
           charSet: 'utf-8',
         },
         {
           name: 'viewport',
           content: 'width=device-width, initial-scale=1',
         },
         {
           title: 'TanStack Start Starter',
         },
       ],
     }),
     component: RootComponent,
   })
   
   function RootComponent() {
     return (
       <RootDocument>
         <Outlet />
       </RootDocument>
     )
   }
   
   function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
     return (
       <html>
         <head>
           <Meta />
         </head>
         <body>
           {children}
           <Scripts />
         </body>
       </html>
     )
   }
   ```

最後，使用`bun run dev`開啟dev server時，routeTree.gen就會自動生成，並且在終端機也會顯示網址。點入後，由於目前沒有創建任何頁面，所以會顯示Not Found，代表找不到對應的route。

## TailwindCSS

- 安裝套件

   ```bash
   bun add tailwindcss @tailwindcss/postcss postcss
   ```

- 設定 postcss.config.ts

   ```ts
   export default {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   }
   ```

- 新增 /app/styles/app.css

   ```css
   @import "tailwindcss" source("../");
   ```

- import css

   ```tsx
   // app/routes/__root.tsx
   import appCss from "@/styles/app.css?url"
   
   export const Route = createRootRoute({
     head: () => ({
       meta: [
         // ...
       ],
       links: [
           {
             rel: "stylesheet",
             href: appCss,
           },
         ],
     })
   })
   ```

- 設定 tsconfig.json

   ```json
   {
     compilerOptions: {
       // ...
       "baseUrl": ".",
       "paths": {
         "@/*": ["./app/*"]
       }
     }
   }
   ```

設定完後重新開啟server，就能完成TailwindCSS的設置。

## 新增不同頁面

TanStack Start很聰明，當我們在routes/ 新增一個.tsx檔案時，便會直接更新其中的內容。

```tsx
// index.tsx
// 以下的內容都是自動生成，不用緊張
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/"!</div>
}
```

回到瀏覽器中，在預設的http://localhost:3000/，可以看見Hello "/"! 的文字。

類似於Next.js，可以透過文件目錄來建立頁面

```plain
.
└── routes/
    ├── index.tsx (/)
    ├── about.tsx (/about) (Catch-all Segments)
    ├── $userid.tsx (/[userid])
    ├── profile/
    │   ├── index.tsx (/profile)
    │   └── setting.tsx (/profile/setting)
    └── post/
        ├── index.tsx (/post)
        └── $id/
            └── index.tsx ((/post/[id]))
```

值得注意的是，上面的about.tsx由於是在最上層，會變成類似Next.js的[Catch-all Segments](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#catch-all-segments)，由`Route.useParams`來存取。其他部分，例如profile/setting就不會有這樣的現象。

```tsx
// about.tsx
function RouteComponent() {
    const param = Route.useParams();
    return (
        <div>
            <p>Hello "/about"!</p>
            <p>{JSON.stringify(param)}</p>
        </div>
    );
}
```

Screenshot

![image.png](@/assets/tanstack-start-link-demo.png)

除了傳統的file-based routing以外，也像Remix一樣，可以透過`.`來定義不同的頁面。舉例來說

- directory

   ```plain
   routes/
     ├── about/
     │   ├── index.tsx
     │   └── me.tsx
   ```

- flat routes

   ```plain
   routes/
     ├── about.index.tsx
     └── about.me.tsx
   ```

兩者會有相同的效果。

## Layout

假設有以下的檔案結構

```plain
post.tsx
post
  index.tsx
  $postid.tsx
```

最上層的post.tsx可以加入`<Outlet />`，產生layout的功能。

```tsx
// post.tsx

function RouteComponent() {
  return <div>Hello post layout <Outlet /></div>
}

// post/index.tsx
function RouteComponent() {
  return <div>Hello "/post/"!</div>
}

// post/$postid.tsx
function RouteComponent() {
  return <div>Hello "/post/$postid"!</div>
}
```

根據不同的網址，結果會呈現

- /post

   Hello post layout

   Hello "/post/"!

- /post/abc

   Hello post layout

   Hello "/post/$postid"!

## Params

有兩種方法可以取得Params

```tsx
// $postid.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/post/$postid')({
  component: RouteComponent,
  async loader(ctx) {
      return { params: ctx.params}
  },
})

function RouteComponent() {
    const { postid } = Route.useParams()
    const { params } = Route.useLoaderData()
  return <div>Hello "/post/{params.postid}"!</div>
}
```

在這個例子中，postid === params.postid，前者是直接使用`useParams` hook，後者則是利用`loader`，主要功能是data loading，但也可以用來取得params。

## SearchParams

這邊一樣有兩個方法：`Route.useSearch`以及`loaderDeps`

```tsx
// useSearch
const search = Route.useSearch()
return <p>{JSON.stringify(search)}</p>
```

能夠透過loaderDeps來取得searchParams，而loaderDeps的結過也會傳入loader當中，因此可以透過`Route.useLoaderDeps`以及`Route.useLoaderData`來取得searchParams

```tsx
// post/$postid.tsx
export const Route = createFileRoute('/post/$postid')({
  component: RouteComponent,
  loaderDeps(opts) {
      return opts.search
  },
  async loader(ctx) {
    // loaderDeps return的結果會等於 ctx.deps
      return {deps: ctx.deps}
  },
})

function RouteComponent() {
    const { deps } = Route.useLoaderData();
    const loaderDeps = Route.useLoaderDeps();
    const search = Route.useSearch();
    return (
        <div>
            <div>
                <p>search</p>
                <p>{JSON.stringify(search)}</p>
            </div>
            <div>
                <p>deps</p>
                <p>{JSON.stringify(deps)}</p>
            </div>
            <div>
                <p>useLoaderDeps</p>
                <p>{JSON.stringify(loaderDeps)}</p>
            </div>
        </div>
    );
}
```

三者會有相同的結果

![image.png](@/assets/tanstack-start-3-ways-to-get-searchparams.png)

## Link

TanStack Router 最大的特點，就是其對於Typescript的完整支持。舉個例子，剛才我們有建立post/$postid.tsx，這時候`<Link />`能夠直接推斷出正確的型別，並提出建議與警告。

```tsx
// go to /post/abc?search=123
<Link
    to="/post/$postid"
    params={{ postid: "abc" }}
    search={{ search: 123 }}
>
```

## API route handler

首先，正如ssr.tsx以及client.tsx，必須先定義Entry handler才能進行下一步。

```ts
// app/api.ts
import {
  createStartAPIHandler,
  defaultAPIFileRouteHandler,
} from '@tanstack/start/api'

export default createStartAPIHandler(defaultAPIFileRouteHandler)
```

如同Directory Route以及Flat Route，有三種方式可以定義API Routes

```plain
├── api/
│   ├── hello.ts (/api/hello)
│   └── hi/
│       └── index.ts (/api/hi)
└── api.world.ts (/api/world)
```

Dynamic Routes的定義方式也和上面相同，TanStack Start一樣會自動生成最簡單的模板

```ts
// api/$id.ts
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/api/$id')({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/$id"!' })
  },
})
```