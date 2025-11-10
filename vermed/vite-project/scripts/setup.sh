
#!/bin/bash

# VerMed Development Environment Setup Script
# This script sets up the complete development environment for both mobile app and API

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js >= 18.0.0"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js >= 18.0.0"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm >= 9.0.0"
        exit 1
    fi
    
    # Check Expo CLI (optional for API only)
    if ! command -v expo &> /dev/null; then
        print_warning "Expo CLI not found. Install with: npm install -g @expo/cli"
    fi
    
    print_success "Prerequisites check passed"
}

# Install root dependencies
install_root_dependencies() {
    print_status "Installing root dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Root dependencies installed"
    else
        print_error "package.json not found in root directory"
        exit 1
    fi
}

# Setup mobile app
setup_mobile_app() {
    print_status "Setting up mobile app..."
    
    if [ -d "app" ]; then
        cd app
        
        # Install dependencies
        if [ -f "package.json" ]; then
            npm install
            print_success "Mobile app dependencies installed"
        else
            print_error "package.json not found in app directory"
            exit 1
        fi
        
        # Create environment file if not exists
        if [ ! -f ".env" ]; then
            if [ -f ".env.example" ]; then
                cp .env.example .env
                print_success "Created .env file from template"
                print_warning "Please edit app/.env with your configuration"
            else
                print_error ".env.example not found in app directory"
            fi
        fi
        
        cd ..
    else
        print_error "App directory not found"
        exit 1
    fi
}

# Setup API
setup_api() {
    print_status "Setting up API..."
    
    if [ -d "api" ]; then
        cd api
        
        # Install dependencies
        if [ -f "package.json" ]; then
            npm install
            print_success "API dependencies installed"
        else
            print_error "package.json not found in api directory"
            exit 1
        fi
        
        # Create environment file if not exists
        if [ ! -f ".env" ]; then
            if [ -f ".env.example" ]; then
                cp .env.example .env
                print_success "Created .env file from template"
                print_warning "Please edit api/.env with your configuration"
            else
                print_error ".env.example not found in api directory"
            fi
        fi
        
        cd ..
    else
        print_error "API directory not found"
        exit 1
    fi
}

# Run initial build and type check
validate_setup() {
    print_status "Validating setup..."
    
    # Type check root
    if [ -f "tsconfig.json" ]; then
        npm run typecheck
        print_success "TypeScript check passed for root"
    fi
    
    # Type check API
    if [ -d "api" ]; then
        cd api
        if [ -f "tsconfig.json" ]; then
            npm run typecheck
            print_success "TypeScript check passed for API"
        fi
        cd ..
    fi
    
    # Type check app
    if [ -d "app" ]; then
        cd app
        if [ -f "tsconfig.json" ]; then
            npm run typecheck
            print_success "TypeScript check passed for mobile app"
        fi
        cd ..
    fi
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
# Start both API and mobile app in development mode

echo "Starting VerMed development environment..."

# Start API in background
echo "Starting API server..."
cd api && npm run dev &
API_PID=$!
cd ..

# Wait a moment for API to start
sleep 3

# Start mobile app
echo "Starting mobile app..."
cd app && npm start &
APP_PID=$!
cd ..

echo "Development environment started!"
echo "API: http://localhost:3001"
echo "Mobile: http://localhost:8081 (or scan QR code with Expo Go)"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for Ctrl+C
trap "echo 'Stopping services...'; kill $API_PID $APP_PID; exit" INT
wait
EOF

    chmod +x start-dev.sh
    print_success "Created start-dev.sh script"
    
    # Create test script
    cat > run-tests.sh << 'EOF'
#!/bin/bash
# Run all tests for the project

echo "Running VerMed test suite..."

# Run API tests
echo "Running API tests..."
cd api && npm test
API_RESULT=$?
cd ..

# Run mobile app tests
echo "Running mobile app tests..."
cd app && npm test
APP_RESULT=$?
cd ..

# Report results
echo ""
echo "Test Results:"
echo "API Tests: $([ $API_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "App Tests: $([ $APP_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"

if [ $API_RESULT -eq 0 ] && [ $APP_RESULT -eq 0 ]; then
    echo "All tests PASSED!"
    exit 0
else
    echo "Some tests FAILED!"
    exit 1
fi
EOF

    chmod +x run-tests.sh
    print_success "Created run-tests.sh script"
}

# Print next steps
print_next_steps() {
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Edit environment files:"
    echo "   - app/.env (mobile app configuration)"
    echo "   - api/.env (API configuration)"
    echo ""
    echo "2. Start development:"
    echo "   - ./start-dev.sh (both services)"
    echo "   - npm run dev (both services from root)"
    echo "   - cd app && npm start (mobile only)"
    echo "   - cd api && npm run dev (API only)"
    echo ""
    echo "3. Run tests:"
    echo "   - ./run-tests.sh (all tests)"
    echo "   - npm test (all tests from root)"
    echo ""
    echo "4. View documentation:"
    echo "   - docs/README.md (complete documentation)"
    echo "   - README.md (quick start guide)"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🏗️  VerMed Development Environment Setup${NC}"
    echo "=================================="
    echo ""
    
    check_prerequisites
    install_root_dependencies
    setup_mobile_app
    setup_api
    validate_setup
    create_dev_scripts
    print_next_steps
}

# Run main function
main "$@"