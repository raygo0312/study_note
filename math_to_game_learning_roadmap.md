# 数学からゲームまで --- 理解を目的とした長期学習ロードマップ

## 0. このロードマップの目的

最終目標は、単にゲームを完成させることではない。

**「ゲームが動くまでに積み重なっている数学・物理・計算機科学・ソフトウェア・表現技術を、下から上まで自分の言葉で説明できるようになる」**ことを目標とする。

実物を自作すること自体は目的ではない。理解の確認に有効なら実装するが、コード上のシミュレーション、既存ライブラリ、エミュレータなどを積極的に使う。

基本方針は次の通り。

-   物理層は「現実にどう実現されるか」を理解できればよい。
-   数学的背景は可能な限り省略せず、定義・構造・理論まで辿る。
-   既知の分野は復習に時間を使いすぎず、Web資料として整理することで確認する。
-   実装は「理解できたかを検証する実験」と考える。
-   一度理解した下位層はブラックボックスに戻してよい。
-   高度な数学も、必要性が現れた時点で寄り道する。
-   各段階で「何を意図的に抽象化しているか」を明示する。
-   最終的には学習内容をWebサイト上の体系的な資料へまとめる。

------------------------------------------------------------------------

# Part I --- 数学・論理・計算とは何か

## 1. 数理論理学と Boolean 代数

### 目的

デジタル回路を「電気回路」としてではなく、まず論理体系として捉える。

### 学ぶこと

-   命題論理
-   論理結合子
-   真理値割当
-   構文と意味論
-   恒真式・充足可能性
-   論理的帰結
-   CNF / DNF
-   Boolean algebra
-   Boolean function
-   関数完全性
-   NAND / NOR の完全性
-   論理式と論理回路の対応
-   最小化
    -   Karnaugh map は道具として軽く
    -   Quine--McCluskey
    -   より一般的な論理最適化の存在

### 数学側の寄り道候補

-   束論
-   Boolean algebra を代数系として見る
-   Stone の表現定理（興味があれば）
-   SAT
-   証明論との関係

### 理解確認

Boolean 関数から論理式と論理回路を相互に構成できれば十分。

既に理解している部分は、学習よりWebサイトへの整理を優先する。

------------------------------------------------------------------------

## 2. 計算の数学的モデル

### 目的

CPUを作る前に、そもそも「計算する」とは何なのかを知る。

### 学ぶこと

-   集合・写像・関係
-   有限状態機械
-   オートマトン
-   形式言語
-   正規言語
-   文脈自由言語
-   Turing machine
-   lambda calculus
-   recursive function
-   Church--Turing thesis
-   decidability / undecidability
-   halting problem
-   computational complexity の入口

### 数学側

-   離散数学
-   帰納法
-   再帰
-   グラフ
-   組合せ論
-   代数的構造

### 深掘り候補

計算可能性と複雑性理論は別の大きな枝として後から戻ってよい。

------------------------------------------------------------------------

# Part II --- 数学から物理的な計算機へ

## 3. 情報を物理世界で表現する

### 目的

0/1という数学的対象が、現実の機械でどう存在できるのかを知る。

### 学ぶこと

-   電圧を論理値として扱うという抽象化
-   noise margin
-   digital / analog の境界
-   transistor をスイッチとして見るモデル
-   MOSFET
-   CMOS inverter
-   NAND / NOR
-   propagation delay
-   power consumption の存在
-   fan-out
-   metastability の存在

### 物理側の背景

必要に応じて以下を確認する。

-   電磁気学
-   量子力学の入口
-   固体物理
-   band theory
-   semiconductor
-   doping
-   PN junction
-   MOS structure

化学を本格的に履修すること自体は前提としない。必要になった場合には、物理化学・量子化学・材料科学へ枝を伸ばす。

### 卒業条件

「MOSFETを単なる魔法のスイッチとしてではなく、そのモデルがどこから来ていて、どこを省略しているか」を説明できればよい。

半導体製造そのものを実践する必要はない。

------------------------------------------------------------------------

## 4. 現実のCPUが製造されるまで

### 目的

HDL上の論理回路と、シリコン上のCPUの間に何があるかを知る。

### 学ぶこと

-   HDL
-   RTL
-   logic synthesis
-   gate-level netlist
-   standard cell
-   timing analysis
-   place and route
-   clock tree
-   physical layout
-   fabrication の概観
-   verification
-   FPGA と ASIC の違い

### 実装

必須ではない。

小さな Verilog / SystemVerilog
回路を書き、シミュレーションと論理合成結果を見る程度で十分。

------------------------------------------------------------------------

# Part III --- デジタル回路

## 5. 組み合わせ回路

### 学ぶこと

-   gate
-   multiplexer
-   demultiplexer
-   decoder / encoder
-   comparator
-   half adder
-   full adder
-   ripple-carry adder
-   carry lookahead 等の高速化思想
-   subtractor
-   shifter
-   ALU

### 数学背景

-   Boolean algebra
-   binary representation
-   modular arithmetic
-   two's complement
-   finite bit-width arithmetic

### 実装

HDLでも通常のプログラミング言語でもよい。

重要なのは「+ 演算子を使わずに加算器を構成した経験」を一度持つこと。

------------------------------------------------------------------------

## 6. 状態を持つ回路

### 目的

「入力から出力を計算するだけの装置」から「時間と状態を持つ機械」へ進む。

### 学ぶこと

-   feedback
-   latch
-   flip-flop
-   register
-   clock
-   synchronous circuit
-   counter
-   finite-state machine
-   memory の基本構造

### 数学背景

-   状態遷移系
-   finite automata
-   recurrence
-   discrete dynamical system の入口

### 理解確認

小さなFSM、register、program counterを実装する。

------------------------------------------------------------------------

# Part IV --- CPU

## 7. 最小CPUを設計する

### 目的

命令を実行する機械を、自分で再構成できるようになる。

### 自分で決めるもの

-   word size
-   register
-   instruction format
-   opcode
-   addressing
-   memory model

### CPUの構成

-   register file
-   ALU
-   program counter
-   instruction register
-   datapath
-   control unit
-   memory interface

### 命令

最初は以下程度でよい。

-   LOAD
-   STORE
-   MOV
-   ADD
-   SUB
-   AND / OR / XOR
-   JMP
-   conditional branch
-   HALT

### 実装方法

物理回路は不要。

候補：

-   Verilog/SystemVerilog
-   C/C++等によるcycle-level simulator
-   独自の小さなHDL

### ゴール

自作ISAの機械語プログラムが動き、

**fetch → decode → execute**

をクロック単位で説明できること。

------------------------------------------------------------------------

## 8. CPUアーキテクチャを現代CPUへ拡張する

最小CPUを作った後、「なぜ現代CPUが複雑なのか」を追う。

### 学ぶ順序

-   single-cycle
-   multi-cycle
-   pipeline
-   pipeline hazard
-   forwarding
-   branch prediction
-   cache
-   memory hierarchy
-   virtual memory
-   TLB
-   superscalar
-   out-of-order execution
-   register renaming
-   speculative execution
-   SIMD
-   multicore
-   memory consistency / memory model

### 数学・理論

必要に応じて、

-   queueing
-   probability
-   information theory
-   parallel computation
-   graph theory

などへ寄り道する。

すべてを実装する必要はない。

------------------------------------------------------------------------

# Part V --- ISAからプログラミング言語へ

## 9. Assembly / ABI / Machine Code

### 学ぶこと

-   machine code
-   assembly
-   stack
-   calling convention
-   ABI
-   function call
-   stack frame
-   linker
-   object file
-   executable format
-   dynamic linking

### 実装

自作CPU用assemblerを作る。

既に十分理解できているなら短く通過する。

------------------------------------------------------------------------

## 10. Programming Language Theory

ここは実装より理論を重視する。

### 構文

-   alphabet
-   formal language
-   grammar
-   regular expression
-   CFG
-   lexer
-   parser
-   AST

### 意味論

-   operational semantics
-   denotational semantics
-   axiomatic semantics

### lambda calculus

-   untyped lambda calculus
-   alpha / beta reduction
-   substitution
-   evaluation strategy
-   Church encoding

### 型理論

-   simply typed lambda calculus
-   type safety
-   progress / preservation
-   polymorphism
-   System F
-   algebraic data types
-   subtyping
-   dependent types の入口

### 論理との接続

-   Curry--Howard correspondence
-   propositions as types
-   proofs as programs

### 必要になれば圏論

圏論は最初から必修にしない。

以下の概念が自然に必要になった段階で学ぶ。

-   category
-   morphism
-   functor
-   natural transformation
-   universal property
-   product / coproduct
-   adjunction
-   monad

「プログラミングでMonadを使うため」だけではなく、なぜその構造が現れるのかを理解する。

------------------------------------------------------------------------

## 11. Compiler / Interpreter / Runtime

### 学ぶこと

-   interpreter
-   compiler
-   IR
-   SSA
-   optimization
-   code generation
-   register allocation
-   runtime
-   memory allocation
-   garbage collection
-   JIT

### 実装

既に可能な「assembly →
基本的なC相当」の処理系を、理論と対応づけながら整理する。

必要なら小さな言語を一つ設計する。

------------------------------------------------------------------------

# Part VI --- OS

## 12. OSは何を抽象化しているのか

### 最初に理解すること

OSを機能一覧として覚えるのではなく、

**「ハードウェアを複数のプログラムから安全かつ便利に利用するための抽象化」**

として理解する。

### 学ぶこと

-   privilege level
-   interrupt
-   exception
-   system call
-   process
-   thread
-   context switch
-   scheduler
-   synchronization
-   mutex / semaphore
-   deadlock
-   virtual memory
-   page table
-   allocator
-   file
-   file system
-   device
-   driver
-   IPC

### 数学・理論

-   concurrency theory
-   partial order
-   state machine
-   graph theory
-   scheduling theory
-   formal verification の入口

### 実装

フルOSは不要。

エミュレータ上で、

-   boot
-   interrupt
-   simple allocator
-   task switching
-   basic syscall

など、理解したい箇所だけ実装する。

------------------------------------------------------------------------

# Part VII --- コンピュータが外界と接続する

## 13. Input / Display / Audio / Storage

### 学ぶこと

-   memory-mapped I/O
-   interrupt
-   DMA
-   keyboard / controller
-   display
-   framebuffer
-   storage
-   audio device

ここからゲームに必要なI/Oへ接続する。

------------------------------------------------------------------------

# Part VIII --- Computer Graphics

## 14. 数学

CGでは数学をしっかりやる。

### 線形代数

-   vector space
-   linear map
-   basis
-   matrix representation
-   determinant
-   eigenvalue / eigenvector
-   inner product
-   orthogonality

### 幾何

-   affine space
-   affine transformation
-   homogeneous coordinate
-   projective geometry
-   quaternion
-   rotation

### 解析

-   calculus
-   multivariable calculus
-   interpolation
-   numerical methods

### 確率

レンダリングまで進むなら、

-   probability space
-   random variable
-   expectation
-   variance
-   Monte Carlo method
-   importance sampling

を学ぶ。

------------------------------------------------------------------------

## 15. Rasterization

### 学ぶこと

-   vertex
-   triangle
-   coordinate transformation
-   camera
-   projection
-   clipping
-   rasterization
-   depth buffer
-   texture
-   interpolation
-   shader

### 実装

一度はGPU APIを使わず、CPU上で小さなsoftware rasterizerを作る。

三角形が表示できれば第一段階。

その後GPU APIへ移る。

------------------------------------------------------------------------

## 16. GPU

### 学ぶこと

-   GPU architecture
-   massive parallelism
-   shader execution
-   graphics pipeline
-   compute shader
-   memory hierarchy
-   synchronization

現代GPUの物理実装を完全に追う必要はない。

------------------------------------------------------------------------

## 17. Rendering

### 発展

-   lighting
-   BRDF
-   rendering equation
-   shadow
-   PBR
-   ray tracing
-   path tracing
-   global illumination

### 数学

-   radiometry
-   probability
-   Monte Carlo integration
-   numerical analysis

------------------------------------------------------------------------

# Part IX --- Physics / Simulation

## 18. ゲーム物理

### 数学

-   calculus
-   differential equation
-   numerical integration
-   vector calculus
-   linear algebra
-   optimization

### 物理

-   Newtonian mechanics
-   rigid body
-   momentum
-   angular momentum
-   collision
-   constraint

### 実装

簡単な2D physics engineを作る程度でよい。

------------------------------------------------------------------------

# Part X --- Digital Audio と音楽

## 19. 音を計算機で扱う

### 数学

-   trigonometric functions
-   complex numbers
-   Fourier series
-   Fourier transform
-   discrete Fourier transform
-   convolution
-   sampling theorem

### 信号処理

-   sampling
-   aliasing
-   filter
-   FFT
-   digital signal processing

### 実装

-   waveform generation
-   simple synthesizer
-   filter
-   mixer

------------------------------------------------------------------------

## 20. 音楽そのもの

技術とは別に表現として学ぶ。

-   music theory
-   rhythm
-   harmony
-   melody
-   arrangement
-   orchestration
-   composition
-   sound design

最終的にはゲーム用の短い曲と効果音を自作する。

------------------------------------------------------------------------

# Part XI --- Game Engine

## 21. 最小ゲームエンジン

既存エンジンの模倣ではなく、「ゲームに共通する処理をなぜ抽象化するのか」を理解する。

### Core

-   game loop
-   time
-   input
-   window
-   event

### World

-   entity
-   component
-   scene
-   hierarchy
-   transform

### Rendering

-   renderer
-   material
-   texture
-   camera
-   shader

### Assets

-   resource management
-   serialization
-   asset pipeline

### Simulation

-   collision
-   physics
-   animation

### Audio

-   playback
-   mixing
-   spatial audio

### Tooling

-   editor
-   inspector
-   hot reload
-   debugging
-   profiling

### 設計理論

-   abstraction
-   data-oriented design
-   ECS
-   cache locality
-   dependency management
-   concurrency

### 実装

まず小さな2D engine。

必要になったら3Dへ。

------------------------------------------------------------------------

# Part XII --- ゲームそのもの

## 22. Game Programming

-   gameplay architecture
-   state management
-   AI
-   path finding
-   save/load
-   UI
-   networking（必要なら）

### 数学

-   graph theory
-   probability
-   statistics
-   optimization
-   computational geometry
-   AI関連数学

------------------------------------------------------------------------

## 23. Game Design

プログラミングとは別分野として学ぶ。

-   rule
-   mechanics
-   dynamics
-   feedback
-   difficulty
-   balance
-   progression
-   level design
-   player psychology
-   UX

ゲームを「ソフトウェア」ではなく「遊びの体系」として理解する。

------------------------------------------------------------------------

# Part XIII --- Visual Art

## 24. 2D Art

-   drawing fundamentals
-   shape
-   perspective
-   anatomy
-   composition
-   value
-   color
-   lighting
-   pixel art（必要なら）
-   concept art
-   UI art

数学的背景として射影幾何や色空間との接続も調べる。

------------------------------------------------------------------------

## 25. 3D

-   modeling
-   topology
-   UV
-   texture
-   material
-   rigging
-   skinning
-   animation
-   procedural modeling

### 数学との接続

-   differential geometry の入口
-   spline
-   Bézier curve
-   B-spline
-   quaternion
-   interpolation

------------------------------------------------------------------------

## 26. Animation / VFX

-   keyframe animation
-   skeletal animation
-   inverse kinematics
-   particle
-   shader effects
-   procedural animation

必要に応じて、

-   optimization
-   differential equation
-   stochastic process

などへ寄り道する。

------------------------------------------------------------------------

# Part XIV --- 一本のゲームへ統合する

## 27. 最終プロジェクト

ここまで学んだものを全部「自作技術」で作る必要はない。

むしろ理解済みの層は既存技術へ戻す。

例：

-   CPU → 市販CPU
-   OS → Windows / Linux
-   graphics → GPU API
-   engine → 自作engineまたはUnity/Unreal
-   art → 自作
-   music → 自作
-   game design → 自作
-   gameplay → 自作

重要なのは、

**既存技術を使ったとき、その下で何が起きているかを以前より深く説明できること。**

------------------------------------------------------------------------

# Part XV --- Webサイトへの体系化

## 28. 学習と執筆を同時に進める

各テーマについて以下のテンプレートで記事化する。

### 1. この概念は何か

定義。

### 2. なぜ必要なのか

問題設定。

### 3. 数学的背景

必要な数学を定義から説明する。

### 4. 理論

概念そのものを説明する。

### 5. 現実にはどう実現されるか

実際のコンピュータとの対応。

### 6. 最小実装

理解確認のコードや実験。

### 7. どこを抽象化したか

この記事で意図的にブラックボックスにした部分。

### 8. 次の階層との接続

次の記事へつなぐ。

------------------------------------------------------------------------

# 数学の横断ロードマップ

技術ロードマップとは別に、必要になった数学を追跡する。

## 基礎

-   集合論
-   数理論理学
-   証明
-   関係・写像
-   離散数学

## 代数

-   線形代数
-   群
-   環
-   体
-   Boolean algebra
-   必要なら抽象代数学をさらに進む

## 解析

-   微積分
-   多変数解析
-   微分方程式
-   数値解析
-   Fourier解析

## 幾何

-   Euclidean geometry
-   affine geometry
-   projective geometry
-   differential geometry

## 確率・統計

-   probability theory
-   stochastic process
-   statistics
-   Monte Carlo method

## CSに近い数学

-   graph theory
-   combinatorics
-   automata theory
-   formal language
-   computability
-   complexity theory
-   information theory
-   optimization

## 論理・PLを深掘りするとき

-   proof theory
-   model theory
-   type theory
-   lambda calculus

## 必要になったら

-   category theory
-   topology
-   measure theory
-   functional analysis
-   abstract algebra のより高度な領域

「難しいから避ける」ことはしないが、「使うかもしれないから先に全部学ぶ」こともしない。

**必要性が見えた地点で、その数学へ潜る。**

------------------------------------------------------------------------

# 推奨する最初の実行順序

この巨大なロードマップを最初から順番に全部履修しない。

最初の一本は以下とする。

1.  Boolean回路の既知事項を短く整理する。
2.  sequential circuit / FSM を確認する。
3.  小さなCPUのISAを自分で設計する。
4.  CPUをコードまたはHDLで実装する。
5.  assemblerを書く。
6.  小さなプログラムを動かす。
7.  pipeline / cache / virtual memoryなどを学び、現代CPUへの橋を架ける。
8.  programming language theoryを体系的に学ぶ。
9.  compiler/runtimeとの対応を整理する。
10. OSへ進む。
11. OSからgraphics/audio/inputへ進む。
12. graphicsのために線形代数・幾何・解析を深掘りする。
13. software rendererを作る。
14. GPU/modern renderingへ進む。
15. digital audioと音楽へ進む。
16. physics/simulationへ進む。
17. 小さなgame engineを作る。
18. art / 3D / animation / VFX / music / game designを並行して学ぶ。
19. 一本の小さなゲームを完成させる。
20. その経験を使って、本当に作りたいゲームへ進む。

------------------------------------------------------------------------

# 学習の判断基準

各テーマについて、次の質問に答えられたら先へ進んでよい。

> それは何か？

> なぜ必要なのか？

> 数学的にはどう表現されるか？

> 下の階層ではどう実現されるか？

> 上の階層からはどう見えるか？

> どの部分を意図的にブラックボックス化しているか？

> 必要なら、自分で最小版を再構成できるか？

すべてを暗記する必要はない。

**構造を理解し、必要なときに再び掘れる地図を頭の中に作ること**を目標とする。

------------------------------------------------------------------------

# 最終的なゴール

ゲーム完成だけをゴールにしない。

最終的には、

**論理 → 計算 → 物理的計算機 → CPU → 言語 → OS → Graphics / Audio /
Simulation → Game Engine → Game → Art / Music**

という巨大な抽象化の連鎖を、自分の言葉で説明できる状態を目指す。

そして、その理解そのものをWebサイトとして残す。

ゲームは、この長い旅の終着点であると同時に、数学・計算機科学・物理・芸術を一つに統合する題材として扱う。
