---
layout: ../../layouts/BaseLayout.astro
title: 整数オーバーフロー
breadcrumbs:
  - href: /index.html
    label: ホーム
  - href: /competitive-programming.html
    label: 競技プログラミング
---

## 概要
Rustにおいて，オーバーフローやアンダーフロー(以下，まとめてオーバーフローと呼ぶ)が発生する可能性のある演算に対し，明示的な挙動を指定できるメソッドを紹介する．
それぞれの処理に対して，各演算が定義されている．

## checked
checkedは，オーバーフロー時にNoneを返すOption型である．

```rust
assert_eq!(16u8.checked_add(16), Some(32));
assert_eq!(16u8.checked_mul(16), None);
```

## wrapping
wrappingは，オーバーフロー時にあふれた桁を無視した結果を返す．

```rust
assert_eq!(0u8.wrapping_sub(1), !0);
assert_eq!(16u8.wrapping_mul(16), 0);
```

## overflowing
overflowingは，wrappingの結果とオーバーフローの有無をタプルで返す．

```rust
assert_eq!(16u8.overflowing_add(16), (32, false));
assert_eq!(0u8.overflowing_sub(1), (!0, true));
assert_eq!(16u8.overflowing_mul(16), (0, true));
```

## saturating
saturatingは，オーバーフロー時に最大値または最小値を返す．

```rust
assert_eq!(0u8.saturating_sub(1), 0);
assert_eq!(16u8.saturating_mul(16), 255);
```
