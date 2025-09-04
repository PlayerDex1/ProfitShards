#!/bin/bash

# ProfitShards Development Workflow Script
# This script helps manage the development workflow between staging and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ProfitShards Development Workflow${NC}"
echo "=================================="

# Function to show current status
show_status() {
    echo -e "\n${YELLOW}📊 Current Status:${NC}"
    echo "Branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --oneline)"
    echo "Uncommitted changes: $(git status --porcelain | wc -l) files"
}

# Function to start new feature
start_feature() {
    echo -e "\n${GREEN}🆕 Starting new feature...${NC}"
    read -p "Feature name (e.g., new-calculator): " feature_name
    
    if [ -z "$feature_name" ]; then
        echo -e "${RED}❌ Feature name cannot be empty${NC}"
        return 1
    fi
    
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$feature_name"
    
    echo -e "${GREEN}✅ Created feature branch: feature/$feature_name${NC}"
    echo -e "${BLUE}💡 Start developing your feature now!${NC}"
}

# Function to test feature
test_feature() {
    echo -e "\n${YELLOW}🧪 Testing feature...${NC}"
    
    # Build and test
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful!${NC}"
        echo -e "${BLUE}💡 Push to develop branch to test on staging${NC}"
    else
        echo -e "${RED}❌ Build failed! Fix errors before continuing${NC}"
        return 1
    fi
}

# Function to merge to develop
merge_to_develop() {
    echo -e "\n${GREEN}🔄 Merging to develop...${NC}"
    
    current_branch=$(git branch --show-current)
    
    if [[ $current_branch == feature/* ]]; then
        git checkout develop
        git pull origin develop
        git merge $current_branch
        git push origin develop
        
        echo -e "${GREEN}✅ Merged to develop!${NC}"
        echo -e "${BLUE}🌐 Staging will be updated at: https://dev.profitshards.online${NC}"
        echo -e "${YELLOW}💡 Test on staging before merging to main${NC}"
    else
        echo -e "${RED}❌ You must be on a feature branch to merge${NC}"
    fi
}

# Function to merge to main
merge_to_main() {
    echo -e "\n${GREEN}🚀 Merging to main (PRODUCTION)...${NC}"
    echo -e "${RED}⚠️  WARNING: This will deploy to production!${NC}"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm == [yY] ]]; then
        git checkout main
        git pull origin main
        git merge develop
        git push origin main
        
        echo -e "${GREEN}✅ Merged to main!${NC}"
        echo -e "${BLUE}🌐 Production will be updated at: https://profitshards.online${NC}"
    else
        echo -e "${YELLOW}❌ Merge cancelled${NC}"
    fi
}

# Function to show help
show_help() {
    echo -e "\n${BLUE}📖 Available Commands:${NC}"
    echo "  status    - Show current git status"
    echo "  start     - Start new feature branch"
    echo "  test      - Test current feature"
    echo "  merge-dev - Merge feature to develop (staging)"
    echo "  merge-prod- Merge develop to main (production)"
    echo "  help      - Show this help"
}

# Main menu
case "${1:-help}" in
    "status")
        show_status
        ;;
    "start")
        start_feature
        ;;
    "test")
        test_feature
        ;;
    "merge-dev")
        merge_to_develop
        ;;
    "merge-prod")
        merge_to_main
        ;;
    "help"|*)
        show_help
        show_status
        ;;
esac