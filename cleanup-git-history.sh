#!/bin/bash

# Script to remove .env.local from Git history
# WARNING: This will rewrite Git history. Use with caution!

echo "================================"
echo "Git History Cleanup Script"
echo "Removing .env.local from history"
echo "================================"
echo ""

# Check if .env.local exists in Git history
if git log --all --full-history -- .env.local | grep -q 'commit'; then
    echo "⚠️  WARNING: .env.local found in Git history!"
    echo ""
    echo "This will:"
    echo "  1. Remove .env.local from all commits"
    echo "  2. Rewrite Git history"
    echo "  3. Require force push to remote"
    echo ""
    read -p "Do you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Aborting."
        exit 1
    fi
    
    echo ""
    echo "🔧 Removing .env.local from Git history..."
    
    # Option 1: Using git filter-branch (slower but more compatible)
    git filter-branch --force --index-filter \
        'git rm --cached --ignore-unmatch .env.local' \
        --prune-empty --tag-name-filter cat -- --all
    
    echo ""
    echo "✅ .env.local removed from history!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify the changes: git log --all --full-history -- .env.local"
    echo "  2. Force push to remote: git push origin --force --all"
    echo "  3. Force push tags: git push origin --force --tags"
    echo "  4. Notify team members to re-clone the repository"
    echo ""
    echo "⚠️  IMPORTANT: All secrets in .env.local should still be rotated!"
    
else
    echo "✅ .env.local not found in Git history. No action needed."
fi

echo ""
echo "================================"
echo "Alternative Method (BFG Repo-Cleaner - Faster)"
echo "================================"
echo ""
echo "For large repositories, consider using BFG Repo-Cleaner:"
echo "  1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/"
echo "  2. Run: java -jar bfg.jar --delete-files .env.local"
echo "  3. Run: git reflog expire --expire=now --all && git gc --prune=now --aggressive"
echo "  4. Force push as above"
echo ""
