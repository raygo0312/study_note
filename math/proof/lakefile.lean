import Lake
open Lake DSL

package proof where
  version := { major := 0, minor := 1, patch := 0 }
  keywords := #["math"]
  leanOptions := #[
    ⟨`pp.unicode.fun, true⟩,
    ⟨`autoImplicit, false⟩
  ]

require mathlib from git
  "https://github.com/leanprover-community/mathlib4.git"

@[default_target]
lean_lib Proof

lean_lib Foundations