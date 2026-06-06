---
layout: ../../layouts/BaseLayout.astro
title: Union Find
breadcrumbs:
  - href: /index.html
    label: ホーム
  - href: /competitive-programming.html
    label: 競技プログラミング
---

AtCoderライブラリのUnion Find（Disjoint Set Union）についてまとめる．Union Findは、要素をいくつかのグループに分けるデータ構造で、グループの結合や同一グループかの判定などを効率的に行うことができる．

## 基本的な使い方

```rust
use ac_library::Dsu;

fn main() {
    let mut uf = Dsu::new(5);

    uf.merge(0, 1);
    uf.merge(1, 2);

    println!("{}", uf.same(0, 2)); // true
    println!("{}", uf.same(0, 3)); // false

    println!("{}", uf.size(0)); // 3

    println!("{:?}", uf.groups()); // [[0, 1, 2], [3], [4]]
}
```