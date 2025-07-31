# Agent Instructions

Before running `dotnet build` or `dotnet test`, ensure the git submodules required by the solution are initialized:

```bash
git submodule update --init --recursive
```

The projects `signature-detection` and `sigver` live in these submodules. Without them the solution will not build.
