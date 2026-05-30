---
layout: ../../layouts/BaseLayout.astro
title: 方向探索
breadcrumbs:
  - href: /index.html
    label: ホーム
  - href: /competitive-programming.html
    label: 競技プログラミング
---

## 概要
マスの隣接するマスを探索する際の方法を紹介する．

## 8方向
8方向の探索をし，有効なマスの配列を返す関数．

```rust
fn neighbors8(i: usize, j: usize, h: usize, w: usize) -> Vec<(usize, usize)> {
  let dir = [
    (1, 0),
    (1, 1),
    (0, 1),
    (!0, 1),
    (!0, 0),
    (!0, !0),
    (0, !0),
    (1, !0),
  ];
  let mut res = Vec::new();
  for (di, dj) in dir {
    let (ni, nj) = (i.wrapping_add(di), j.wrapping_add(dj));
    if ni < h && nj < w {
      res.push((ni, nj));
    }
  }
  res
}
```