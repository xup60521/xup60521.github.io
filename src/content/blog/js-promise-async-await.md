---
author: Zup
date: 2024-04-10T04:38:58.495Z
title: JS在非同步事件使用Promise
cover: "@/assets/js-promise.png"
tags:
  - js
summary: 利用Promise處理非同步事件，另外加上async function/ await的運用
---

超級經典的非同步函式

```javascript
setTimeout(() => {}, 100)
```

問題：要怎麼建構一個`delay()`，讓以下的code可以正常輸出

```javascript
async function main() {
  for (let i; i < 5; i++) {
    await delay()
    console.log(i)
  }
}
main()
```

## Promise

setTimeout的原理是利用瀏覽器的API，在特定時間過後執行callback function。所以在時間到之前，必須阻止for loop執行。

要怎麼做？

利用Promise，時間到之後callback再resolve，就能達成想要的效果。

以一個簡單的例子來說明

```javascript
(
    new Promise(resolve => {
        setTimeout(() => resolve("complete"), 1000)
    })
)
    .then(data => console.log(data))
```

經過1000ms (1s)後，setTimeout的callback function執行`resolve(“complete“)`，Promise結束後，以`.then`接續下去，其中的參數`data`就是resolve的內容，並以`console.log(data)`顯示出來。

寫成function的形式，return一個Promise物件，之後使用`.then`處理callback

```javascript
function delay() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 1000)
  })
}
delay().then(()=>console.log("complete"))
```

一樣會有相同的結果。

亦或是利用async function，使用await，一樣能夠達成.then的效果

```javascript
async function main() {
  await delay() // await a promise to complete
  console.log("complete")
}
```

順帶一提，async function後面也可以加上`.then`，作用和Promise.then相同，都是在處理完之後執行callback function

```javascript
async function main() {
  await delay()
  console.log("complete")
  return "function executed"
}
main().then(data => console.log(data))
// 一秒之後顯示
// complete
// function executed
```


