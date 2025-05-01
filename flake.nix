{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.05";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages."${system}";
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [
          bash
          coreutils
          curl
          jq
          nodePackages.prettier
        ];
      };
    });
}
