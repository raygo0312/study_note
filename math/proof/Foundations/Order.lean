import Mathlib.Data.Set.Basic

open Set

example {α : Type*} (A B : Set α) (x : α) : Prop :=
  x ∈ (A ∪ B) ∧ x ∉ (∅ : Set α) ∧ (A ⊆ B)
