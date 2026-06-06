---
layout: ../../layouts/BaseLayout.astro
title: 可変配列 Vec
breadcrumbs:
  - href: /index.html
    label: ホーム
  - href: /competitive-programming.html
    label: 競技プログラミング
---

Rustにおける，可変配列`Vec`の操作について紹介する．

## 基本的な使い方
### 初期化
Vecは，`Vec::new()`や`vec![]`マクロを使用して宣言・初期化できる．

```rust
let v = Vec::new();
let v = vec![1, 2, 3];
```

### 要素へのアクセス
Vecの要素には，インデックスを使用してアクセスできる．
```rust
let v = vec![1, 2, 3];
assert_eq!(v[0], 1);
```

### Vecの要素の追加，削除
Vecに要素を追加するには，`push`メソッドを使用する．
```rust
let mut v = Vec::new();
v.push(1);
v.push(2);
v.push(3);
assert_eq!(v, vec![1, 2, 3]);
v.pop();
assert_eq!(v, vec![1, 2]);
```

## 便利なメソッド
### concat
Vecを連結するには，`concat`メソッドを使用する．
```rust
let v1 = vec![1, 2];
let v2 = vec![3, 4];
let v3 = vec![5];
let v = [v1, v2, v3].concat();
assert_eq!(v, vec![1, 2, 3, 4, 5]);
```
`v1`と`v2`は所有権を移動することに注意する．
