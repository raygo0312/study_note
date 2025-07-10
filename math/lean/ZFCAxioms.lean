
-- Lean4の標準ライブラリには=の定義があるため、ここの定理は使わない
namespace equal
-- 相等関係の定義
axiom equal : Set → Set → Prop
infix:50 " = " => equal
-- 相等関係の反射律
axiom equal_reflexive : ∀ x : Set, equal x x
-- 相等関係の代入原理
axiom equal_substitute (F : Set → Prop): ∀ x y : Set, equal x y → (F x ↔ F y)
-- 相等関係の対称律
theorem equal_symmetric : ∀ (x y : Set), equal x y → equal y x := by
  intros x y h
  have h1 : (equal x x) ↔ (equal y x) := equal_substitute (fun z => equal z x) x y h
  exact h1.mp (equal_reflexive x)
-- 相等関係の推移律
theorem equal_transitive : ∀ (x y z : Set), equal x y ∧ equal y z → equal x z := by
  intros x y z h
  have h1 : (equal x z) ↔ (equal y z) := equal_substitute (fun w => equal w z) x y h.left
  exact h1.mpr h.right
end equal

namespace ZFC

axiom Set : Type
axiom member : Set → Set → Prop
infix:50 " ∈ " => member
def subset (a b : Set) : Prop := ∀ (x : Set), x ∈ a → x ∈ b
infix:50 " ⊆ " => subset
axiom emptySet : Set
notation "∅" => emptySet


end ZFC
