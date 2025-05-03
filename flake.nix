{
  inputs = {
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [];
      };
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [
          nixd
          alejandra
          bash
          coreutils
          curl
          jq
          nodePackages.prettier
        ];
      };
    });
}
