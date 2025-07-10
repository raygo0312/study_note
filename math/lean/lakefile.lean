import Lake
open Lake DSL

package «math»

lean_lib ZFCAxioms

@[default_target]
lean_exe «math» where
  root := `Main
