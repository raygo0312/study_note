axiom Set : Type
-- Lean4の標準ライブラリには=の定義があるため、ここの定理は使わない
namespace equal
-- 等号関係の定義
axiom equality : Set → Set → Prop
-- 等号関係の反射律
axiom reflexivity_of_equality : ∀ x : Set, equality x x
-- 等号関係の代入原理
axiom substitution_principle (F : Set → Prop): ∀ x y : Set, equality x y → (F x ↔ F y)
-- 等号関係の対称律
theorem symmetric_of_equality : ∀ (x y : Set), equality x y → equality y x := by
  intros x y h
  have h1 : (equality x x) ↔ (equality y x) := substitution_principle (fun z => equality z x) x y h
  exact h1.mp (reflexivity_of_equality x)
-- 等号関係の推移律
theorem equal_transitive : ∀ (x y z : Set), equality x y ∧ equality y z → equality x z := by
  intros x y z h
  have h1 : (equality x z) ↔ (equality y z) := substitution_principle (fun w => equality w z) x y h.left
  exact h1.mpr h.right
end equal

theorem deMorgan_andnot_to_notor {A B : Prop} (h₁ : ¬(A ∧ B)) : ¬A ∨ ¬B := by
  by_cases h1 : A
  . apply Or.inr
    intro hb
    apply h₁
    exact ⟨h1, hb⟩
  . apply Or.inl
    exact h1

namespace ZFC
-- 集合に定められた述語(帰属関係)
axiom member : Set → Set → Prop
infix:50 " ∈ " => member
def not_member (a b : Set) : Prop := ¬ (a ∈ b)
infix:50 " ∉ " => not_member
-- 部分集合
def subset (a b : Set) : Prop := ∀ (x : Set), x ∈ a → x ∈ b
infix:50 " ⊂ " => subset
def supset (a b : Set) : Prop := b ⊂ a
infix:50 " ⊃ " => supset
-- 真部分集合
def subset_neq (a b : Set) : Prop := a ⊂ b ∧ a ≠ b
infix:50 " ⊊ " => subset_neq
-- 部分集合の性質
theorem element_containment (a b c : Set) (h₁ : a ∈ b) (h₂ : b ⊂ c) : a ∈ c := by
  rw [subset] at h₂
  exact h₂ a h₁
-- 部分集合の反射律
theorem reflexivity_of_subset (a : Set) : a ⊂ a := by
  intros x h
  exact h
-- 部分集合の推移律
theorem transitivity_of_subset (a b c : Set) (h₁ : a ⊂ b) (h₂ : b ⊂ c) : a ⊂ c := by
  intros x h1
  have h2 := element_containment x a b h1 h₁
  exact element_containment x b c h2 h₂
-- 外延性公理
axiom axiom_of_extensionality : ∀ (x y : Set), (∀ z : Set, z ∈ x ↔ z ∈ y) → x = y
-- 空集合
axiom emptyset : Set
notation "∅" => emptyset
axiom emptyset_is_empty : ∀ x : Set, ¬ (x ∈ ∅)
-- 空集合の一意性
theorem uniqueness_of_emptyset (a1 a2 : Set) (h₁ : ∀ x : Set, ¬ (x ∈ a1)) (h₂ : ∀ x : Set, ¬ (x ∈ a2)) : a1 = a2 := by
  apply axiom_of_extensionality
  intro x
  constructor
  . intro
    have h₁ := h₁ x
    contradiction
  . intro
    have h₂ := h₂ x
    contradiction
-- 対
axiom pairing (a b : Set) : Set
notation "{" a ", " b "}" => pairing a b
axiom pairing_is_pair (a b : Set) : ∀ x : Set, x ∈ pairing a b ↔ x = a ∨ x = b
-- 対の交換則
theorem commutativity_of_pairing (a b : Set) : pairing a b = pairing b a := by
  apply axiom_of_extensionality
  intro x
  constructor
  . intro h
    rw [pairing_is_pair, Or.comm, ←pairing_is_pair] at h
    exact h
  . intro h
    rw [pairing_is_pair, Or.comm, ←pairing_is_pair] at h
    exact h
-- 対の左
theorem pairing_left (a b : Set) : a ∈ pairing a b := by
  rw [pairing_is_pair]
  apply Or.inl
  exact rfl
-- 対の右
theorem pairing_right (a b : Set) : b ∈ pairing a b := by
  rw [pairing_is_pair]
  apply Or.inr
  exact rfl
-- 対の等号性
theorem pairing_eq_of_eq (a b c : Set) (h₁ : pairing a b = pairing a c) : b = c := by
  have h1 := pairing_right a b
  have h2 := pairing_right a c
  rw [h₁] at h1
  rw [←h₁] at h2
  rw [pairing_is_pair] at h1
  cases h1 with
  | inl h1 =>
    rw [←h1] at h2
    rw [pairing_is_pair] at h2
    rw [or_self, eq_comm] at h2
    exact h2
  | inr h1 =>
    exact h1
-- 1元集合
noncomputable def singleton (a : Set) := pairing a a
notation "{" a "}" => singleton a
-- 1元集合の元
theorem singleton_element (a : Set) : a ∈ singleton a := by
  rw [singleton, pairing_is_pair, or_self]
-- 1元集合と対の等号性
theorem singleton_eq_pairing_of_eq (a b c : Set) (h₁: singleton a = pairing b c) : a = b ∧ b = c := by
  have h2 : a ∈ singleton a := singleton_element a
  rw [h₁, pairing_is_pair] at h2
  cases h2 with
  | inl h2 =>
    rw [h2, singleton] at h₁
    have h₁ := pairing_eq_of_eq b b c h₁
    exact ⟨h2, h₁⟩
  | inr h2 =>
    rw [h2, singleton] at h₁
    rw [commutativity_of_pairing b c] at h₁
    have h₁ := pairing_eq_of_eq c c b h₁
    rw [h₁] at h2
    rw [eq_comm] at h₁
    exact ⟨h2, h₁⟩
-- 1元集合の等号性
theorem singleton_eq_of_eq (a b : Set) (h₁ : singleton a = singleton b) : a = b := by
  rw [singleton, eq_comm] at h₁
  have h₁ := singleton_eq_pairing_of_eq b a a h₁
  have h₁ := h₁.left
  rw [eq_comm] at h₁
  exact h₁
-- 順序対
noncomputable def ordered_pair (a b : Set) := pairing (singleton a) (pairing a b)
notation "( " a ", " b " )" => ordered_pair a b
-- 順序対の等号性
theorem ordered_pair_eq_of_eq (a b a' b' : Set) (h₁ : ordered_pair a b = ordered_pair a' b') : a = a' ∧ b = b' := by
  have ha : a = a' := by
    have h1 : singleton a ∈ ordered_pair a b := pairing_left (singleton a) (pairing a b)
    rw [h₁, ordered_pair, pairing_is_pair] at h1
    cases h1 with
    | inl h1 =>
      exact singleton_eq_of_eq a a' h1
    | inr h1 =>
      have h1 := singleton_eq_pairing_of_eq a a' b' h1
      exact h1.left
  constructor
  . exact ha
  . have h1 : pairing a b ∈ ordered_pair a b := by
      rw [ordered_pair]
      exact pairing_right (singleton a) (pairing a b)
    rw [←ha] at h₁
    rw [h₁, ordered_pair, pairing_is_pair] at h1
    cases h1 with
    | inl h1 =>
      rw [eq_comm] at h1
      have h1 := singleton_eq_pairing_of_eq a a b h1
      have h1 := h1.right
      rw [←h1, ordered_pair, ordered_pair] at h₁
      have h₁ := pairing_eq_of_eq (singleton a) (pairing a a) (pairing a b') h₁
      have h₁ := pairing_eq_of_eq a a b' h₁
      rw [h1] at h₁
      exact h₁
    | inr h1 =>
      have h1 := pairing_eq_of_eq a b b' h1
      exact h1
-- 和集合
axiom unionset (a : Set) : Set
notation "⋃" a => unionset a
axiom unionset_is_union (a : Set) (x : Set) : x ∈ unionset a ↔ ∃ y : Set, x ∈ y ∧ y ∈ a
noncomputable def union (a b : Set) := unionset (pairing a b)
infix:60 " ∪ " => union
-- 冪集合
axiom powerset (a : Set) : Set
notation "𝒫" a => powerset a
axiom powerset_is_power (a : Set) (x : Set) : x ∈ powerset a ↔ x ⊂ a
-- 冪和同一性
theorem powerset_union_identity (a : Set) : unionset (powerset a) = a := by
  apply axiom_of_extensionality
  intro x
  constructor
  . intro h1
    rw [unionset_is_union] at h1
    obtain ⟨y, h1_1, h1_2⟩ := h1
    rw [powerset_is_power] at h1_2
    exact element_containment x y a h1_1 h1_2
  . intro h1
    rw [unionset_is_union]
    apply Exists.intro (singleton x)
    constructor
    . exact singleton_element x
    . rw [powerset_is_power]
      intro y h2
      rw [singleton, pairing_is_pair, or_self] at h2
      rw [←h2] at h1
      exact h1
-- 正則性公理
axiom axiom_of_regularity (x : Set) (h₁ : x ≠ ∅) : ∃ y : Set, y ∈ x ∧ ∀ z : Set, z ∈ y → z ∉ x
-- 帰属関係の非反射性
theorem non_reflexivity_of_member (x : Set) : x ∉ x := by
  intro h1
  have h2 : singleton x ≠ ∅ := by
    intro h2
    have h3 := emptyset_is_empty x
    have h4 := singleton_element x
    rw [h2] at h4
    contradiction
  have h2 := axiom_of_regularity (singleton x) h2
  obtain ⟨y, h2_1, h2_2⟩ := h2
  rw [singleton, pairing_is_pair, or_self] at h2_1
  rw [h2_1] at h2_2
  have h3 := h2_2 x h1
  have h4 := singleton_element x
  contradiction
-- 帰属関係の非対称性
theorem asymmetry_of_member (x y : Set) : x ∉ y ∨ y ∉ x := by
  apply deMorgan_andnot_to_notor
  intro h1
  have h2 := pairing_left x y
  have h3 : pairing x y ≠ ∅ := by
    intro h3
    have h4 := emptyset_is_empty x
    rw [h3] at h2
    contradiction
  have h3 := axiom_of_regularity (pairing x y) h3
  obtain ⟨z, h3_1, h3_2⟩ := h3
  rw [pairing_is_pair] at h3_1
  cases h3_1 with
  | inl h3_1 =>
    rw [h3_1] at h3_2
    have h3_2 := h3_2 y h1.right
    have h4 := pairing_right x y
    contradiction
  | inr h3_1 =>
    rw [h3_1] at h3_2
    have h3_2 := h3_2 x h1.left
    have h4 := pairing_left x y
    contradiction
-- 宇宙の非存在性
theorem universe_not_exists : ¬ ∃ x : Set, ∀ y : Set, y ∈ x := by
  intro h1
  obtain ⟨u, h1⟩ := h1
  have h1 := h1 u
  have h2 := non_reflexivity_of_member u
  contradiction
end ZFC
