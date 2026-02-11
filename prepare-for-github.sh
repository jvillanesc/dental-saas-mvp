#!/bin/bash
# ============================================
# Prepare Repository for GitHub
# Removes unnecessary files before initial commit
# ============================================

echo "🧹 Cleaning repository for GitHub..."
echo ""

# Files to remove
files_to_remove=(
    "build.bat"
    "login.json"
    "login2.json"
    "sdd.rar"
    "package-lock.json"
)

removed_count=0

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ Removed: $file"
        ((removed_count++))
    else
        echo "⏭️  Not found: $file (already removed)"
    fi
done

echo ""
echo "📊 Summary: Removed $removed_count file(s)"
echo ""
echo "✨ Repository is now clean and ready for GitHub!"
echo ""
echo "Next steps:"
echo "  1. git init"
echo "  2. git add ."
echo "  3. git commit -m 'feat: initial commit - Dental SaaS MVP'"
echo "  4. git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "  5. git branch -M main"
echo "  6. git push -u origin main"
echo ""
