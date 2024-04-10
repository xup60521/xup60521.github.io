---
author: Zup
date: 2024-03-17T16:37:23.767Z
title: JS修改Array裡的值
cover: "@/assets/js-array.png"
tags:
  - reactjs
  - js
summary: "修改一個物件Array，可能是比較好的方法"
---

有以下情境

```tsx
import { useState } from "react";
type objType = {
  label: string;
  count: number;
};
export default function Page() {
  const [arr, setArr] = useState<objType[]>([]);
  return (
    <>
      {arr.map(item => {
        return (
          <div key={item.label}>
            <span>{item.label}</span>
            <button>Increment</button>
          </div>
        );
      })}
    </>
  );
}
```

接下來的問題是，要怎麼樣才譨讓按鈕按下去時，確保在正確的地方做出改變。

```tsx
function addCount({ label, count }: { label: string; count: number }) {
  setArr(prev => {
    return prev.map(item => {
      if (item.label === label) {
        item.count = item.count + 1;
        return item;
      }
      return item;
    });
  });
}
```

紀錄一下，確保下次不會想出超奇怪的方法來解決這種問題。
