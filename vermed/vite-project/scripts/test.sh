#!/bin/bash

# VerMed Testing Script
# Runs tests for all workspaces with coverage reporting

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

echo -e "${BLUE}🧪 Running VerMed Test Suite${NC}"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from project root."
    exit 1
fi

# Track overall success
OVERALL_SUCCESS=true
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to run tests and track results
run_tests() {
    local workspace=$1
    local workspace_path=$2
    
    print_status "Running tests for $workspace..."
    
    if [ -d "$workspace_path" ]; then
        cd "$workspace_path"
        
        if [ -f "package.json" ]; then
            # Check if test script exists
            if npm run test --silent 2>/dev/null; then
                echo "Running: npm test"
                if npm test 2>/dev/null; then
                    print_success "$workspace tests passed"
                    PASSED_TESTS=$((PASSED_TESTS + 1))
                else
                    print_error "$workspace tests failed"
                    OVERALL_SUCCESS=false
                fi
                TOTAL_TESTS=$((TOTAL_TESTS + 1))
            else
                print_warning "No test script found in $workspace"
            fi
        else
            print_warning "No package.json found in $workspace"
        fi
        
        cd ..
    else
        print_warning "$workspace directory not found"
    fi
    
    echo ""
}

# Function to generate coverage report
generate_coverage() {
    local workspace=$1
    local workspace_path=$2
    
    if [ -d "$workspace_path" ]; then
        cd "$workspace_path"
        
        if [ -f "package.json" ]; then
            # Check if coverage script exists
            if npm run test:coverage --silent 2>/dev/null; then
                print_status "Generating coverage for $workspace..."
                npm run test:coverage
                print_success "$workspace coverage generated"
            else
                print_warning "No coverage script found in $workspace"
            fi
        fi
        
        cd ..
    fi
}

# Run tests for each workspace
run_tests "API" "api"
run_tests "Mobile App" "app"

# Generate coverage reports
print_status "Generating coverage reports..."
generate_coverage "API" "api"
generate_coverage "Mobile App" "app"

# Check test configuration
print_status "Checking test configuration..."

# Check for Jest configuration
if [ -f "jest.config.js" ] || [ -f "jest.config.json" ]; then
    print_success "Jest configuration found"
else
    print_warning "No Jest configuration found in root"
fi

if [ -f "api/jest.config.js" ] || [ -f "api/jest.config.json" ]; then
    print_success "API Jest configuration found"
else
    print_warning "No Jest configuration found in api"
fi

if [ -f "app/jest.config.js" ] || [ -f "app/jest.config.json" ]; then
    print_success "Mobile app Jest configuration found"
else
    print_warning "No Jest configuration found in app"
fi

# Check for test files
print_status "Checking for test files..."

API_TEST_FILES=$(find api/src -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
APP_TEST_FILES=$(find app/src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l)

print_status "Test files found:"
echo "  - API: $API_TEST_FILES test files"
echo "  - Mobile App: $APP_TEST_FILES test files"

if [ "$API_TEST_FILES" -eq 0 ] && [ -d "api" ]; then
    print_warning "No test files found in API"
fi

if [ "$APP_TEST_FILES" -eq 0 ] && [ -d "app" ]; then
    print_warning "No test files found in mobile app"
fi

# Check for test utilities
if [ -f "api/src/__tests__/setup.ts" ] || [ -f "app/src/__tests__/setup.ts" ]; then
    print_success "Test setup files found"
else
    print_warning "Consider adding test setup files for common configuration"
fi

# Final results
echo ""
echo "=================================="
echo "Test Results Summary:"
echo "=================================="
echo "Total test suites: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"

if [ "$OVERALL_SUCCESS" = true ]; then
    print_success "🎉 All tests passed!"
    echo ""
    echo "Coverage reports:"
    echo "  - API: api/coverage/lcov-report/index.html"
    echo "  - Mobile App: app/coverage/lcov-report/index.html"
    echo ""
    echo "Tips:"
    echo "- View coverage reports in browser"
    echo "- Aim for >80% code coverage"
    echo "- Add more tests for uncovered lines"
    exit 0
else
    print_error "❌ Some tests failed!"
    echo ""
    echo "Next steps:"
    echo "- Fix failing tests above"
    echo "- Run 'npm test' to re-run all tests"
    echo "- Check coverage reports for gaps"
    exit 1
fi