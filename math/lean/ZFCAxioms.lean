
-- Lean4の標準ライブラリには=の定義があるため、ここの定理は使わない
namespace equal
-- 相等関係の定義
axiom equality : Set → Set → Prop
infix:50 " = " => equality
-- 相等関係の反射律
axiom reflexivity_of_equality : ∀ x : Set, equality x x
-- 相等関係の代入原理
axiom substitution_principle (F : Set → Prop): ∀ x y : Set, equality x y → (F x ↔ F y)
-- 相等関係の対称律
theorem symmetric_of_equality : ∀ (x y : Set), equality x y → equality y x := by
  intros x y h
  have h1 : (equality x x) ↔ (equality y x) := substitution_principle (fun z => equality z x) x y h
  exact h1.mp (reflexivity_of_equality x)
-- 相等関係の推移律
theorem equal_transitive : ∀ (x y z : Set), equality x y ∧ equality y z → equality x z := by
  intros x y z h
  have h1 : (equality x z) ↔ (equality y z) := substitution_principle (fun w => equality w z) x y h.left
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
