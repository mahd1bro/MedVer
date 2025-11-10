#!/bin/bash

# VerMed Linting Script
# Runs ESLint on all workspaces

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo -e "${BLUE}🔍 Linting VerMed Codebase${NC}"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from project root."
    exit 1
fi

# Lint root configurations
print_status "Linting root configuration files..."
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    npx eslint .eslintrc.* --config .eslintrc.js --no-eslintrc --ignore-path .gitignore || true
    print_success "Root configurations linted"
else
    print_warning "No ESLint configuration found in root"
fi

# Lint API
if [ -d "api" ]; then
    print_status "Linting API..."
    cd api
    
    if [ -f "package.json" ]; then
        # Check if ESLint is available
        if npm list eslint &> /dev/null || [ -d "node_modules/eslint" ]; then
            npm run lint
            print_success "API linted successfully"
        else
            print_warning "ESLint not available for API, skipping..."
        fi
    else
        print_warning "No package.json found in api, skipping..."
    fi
    
    cd ..
else
    print_warning "API directory not found, skipping..."
fi

# Lint mobile app
if [ -d "app" ]; then
    print_status "Linting mobile app..."
    cd app
    
    if [ -f "package.json" ]; then
        # Check if ESLint is available
        if npm list eslint &> /dev/null || [ -d "node_modules/eslint" ]; then
            npm run lint
            print_success "Mobile app linted successfully"
        else
            print_warning "ESLint not available for mobile app, skipping..."
        fi
    else
        print_warning "No package.json found in app, skipping..."
    fi
    
    cd ..
else
    print_warning "App directory not found, skipping..."
fi

# Check for common linting issues
print_status "Checking for common issues..."

# Check for console.log statements
if grep -r "console\.log" app/src/ api/src/ --exclude-dir=node_modules --exclude="*.test.*" 2>/dev/null; then
    print_warning "Found console.log statements. Consider removing for production."
fi

# Check for TODO comments without issue numbers
if grep -r "TODO" app/src/ api/src/ --exclude-dir=node_modules --exclude="*.test.*" 2>/dev/null; then
    print_warning "Found TODO comments. Consider creating issues for tracking."
fi

# Check for hardcoded secrets
if grep -r -i "password\|secret\|token\|key.*=" app/src/ api/src/ --exclude-dir=node_modules --exclude="*.test.*" 2>/dev/null; then
    print_error "Potential hardcoded secrets found! Please review."
fi

echo ""
print_success "🎉 Linting completed!"
echo ""
echo "Tips:"
echo "- Fix any errors found above"
echo "- Consider using 'npm run lint:fix' if available"
echo "- Check .eslintrc.js for rule configurations"