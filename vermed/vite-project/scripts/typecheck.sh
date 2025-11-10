#!/bin/bash

# VerMed TypeScript Type Checking Script
# Runs TypeScript compiler checks on all workspaces

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

echo -e "${BLUE}🔍 Type Checking VerMed Codebase${NC}"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "tsconfig.json" ]; then
    print_error "tsconfig.json not found. Please run from project root."
    exit 1
fi

# Track overall success
OVERALL_SUCCESS=true

# Type check root configurations
print_status "Type checking root configurations..."
if [ -f "tsconfig.json" ]; then
    if npx tsc --noEmit --project . 2>/dev/null; then
        print_success "Root configurations type checked"
    else
        print_error "Root configuration type check failed"
        OVERALL_SUCCESS=false
    fi
else
    print_warning "No tsconfig.json found in root"
fi

# Type check API
if [ -d "api" ]; then
    print_status "Type checking API..."
    cd api
    
    if [ -f "tsconfig.json" ]; then
        if npx tsc --noEmit 2>/dev/null; then
            print_success "API type checked successfully"
        else
            print_error "API type check failed"
            OVERALL_SUCCESS=false
        fi
    else
        print_warning "No tsconfig.json found in api, skipping..."
    fi
    
    cd ..
else
    print_warning "API directory not found, skipping..."
fi

# Type check mobile app
if [ -d "app" ]; then
    print_status "Type checking mobile app..."
    cd app
    
    if [ -f "tsconfig.json" ]; then
        if npx tsc --noEmit 2>/dev/null; then
            print_success "Mobile app type checked successfully"
        else
            print_error "Mobile app type check failed"
            OVERALL_SUCCESS=false
        fi
    else
        print_warning "No tsconfig.json found in app, skipping..."
    fi
    
    cd ..
else
    print_warning "App directory not found, skipping..."
fi

# Check for TypeScript configuration issues
print_status "Checking TypeScript configuration..."

# Check for strict mode
if grep -r '"strict": true' tsconfig.json app/tsconfig.json api/tsconfig.json 2>/dev/null; then
    print_success "Strict mode enabled in configurations"
else
    print_warning "Consider enabling strict mode for better type safety"
fi

# Check for path mappings
if grep -r '"paths"' tsconfig.json app/tsconfig.json api/tsconfig.json 2>/dev/null; then
    print_success "Path mappings configured"
else
    print_warning "Consider setting up path mappings for cleaner imports"
fi

# Check for exclude patterns
if grep -r '"exclude"' tsconfig.json app/tsconfig.json api/tsconfig.json 2>/dev/null; then
    print_success "Exclude patterns configured"
else
    print_warning "Consider configuring exclude patterns for faster compilation"
fi

echo ""
if [ "$OVERALL_SUCCESS" = true ]; then
    print_success "🎉 All TypeScript checks passed!"
    echo ""
    echo "Type checking summary:"
    echo "✅ Root configurations"
    echo "✅ API (if present)"
    echo "✅ Mobile app (if present)"
    echo ""
    echo "Tips:"
    echo "- All types are properly configured"
    echo "- Consider adding more strict compiler options"
    echo "- Use 'npm run typecheck' for quick checks"
else
    print_error "❌ TypeScript checks failed!"
    echo ""
    echo "Please fix the type errors above and try again."
    echo ""
    echo "Common fixes:"
    echo "- Add missing type annotations"
    echo "- Import missing types"
    echo "- Fix type mismatches"
    echo "- Update type definitions"
    exit 1
fi