# Senior Design Team sddec25-01 Website

This repository contains the website for Iowa State University Senior Design Team sddec25-01's project on Machine Learning: Semantic Segmentation Optimization for Eye Tracking in Assistive Technology.

## Project Overview

The website serves as a documentation hub for our senior design project, which focuses on optimizing semantic segmentation algorithms for eye tracking applications. The project aims to improve performance through parallel processing of U-Net neural networks while maintaining high accuracy for assistive technology applications.

## Repository Structure

```
.
├── flake.nix          # Nix flake configuration
├── flake.lock         # Nix flake lock file
└── www/              # Website root directory
    ├── css/          # Stylesheet files
    ├── js/           # JavaScript files
    ├── *.webp        # Team member images
    ├── *.pdf         # Project documentation
    └── index.html    # Main website page
```

## Development Environment

This project uses Nix flakes for reproducible development environments. The development shell includes:

- nixd (Nix language server)
- alejandra (Nix formatter)
- bash
- coreutils
- curl
- jq
- prettier (JavaScript/CSS/HTML formatter)

### Prerequisites

- Nix package manager with flakes enabled

### Setting Up Development Environment

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-directory>
```

2. Enter the development shell:
```bash
nix develop
```

## Website Features

- Responsive design using Bootstrap and custom CSS
- Interactive PDF preview system
- Smooth scrolling navigation
- Team member profiles
- Project timeline visualization
- Documentation sections:
  - Weekly Reports
  - Design Documents
  - Lightning Talks
  - Engineering Standards
  - Testing Documentation

## Building and Deployment

The website is static HTML/CSS/JavaScript and can be served directly from the `www/` directory. No build process is required.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Format code using provided tools:
   - JavaScript/CSS/HTML: `prettier --write .`
   - Nix files: `alejandra .`
4. Submit a pull request

## License

[Your chosen license]

## Team Members

- Tyler Schaefer - ML Algorithm Analyst
- Conner Ohnesorge - ML Integration HWE
- Aidan Perry - Multithreaded Program Developer
- Joey Metzen - Kria Board Manager

## Contact

Email: sddec25-01@iastate.edu

## Acknowledgments

- Faculty Advisor: Dr. Namrata Vaswani
- Client: JR Spidell
- Department of Electrical and Computer Engineering, Iowa State University
