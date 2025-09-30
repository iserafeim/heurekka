#!/bin/bash

echo "======================================"
echo "Authentication Test Suite Verification"
echo "======================================"
echo ""

echo "📁 Checking test files..."
TEST_FILES=(
    "src/test/unit/auth.service.test.ts"
    "src/test/unit/tenant-profile.service.test.ts"
    "src/test/unit/landlord-profile.service.test.ts"
    "src/test/integration/auth.router.test.ts"
    "src/test/e2e/auth-flow.e2e.test.ts"
    "src/test/security/auth-security.test.ts"
    "src/test/fixtures/authFixtures.ts"
)

ALL_FILES_EXIST=true
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        LINES=$(wc -l < "$file" | tr -d ' ')
        echo "✅ $file ($LINES lines)"
    else
        echo "❌ Missing: $file"
        ALL_FILES_EXIST=false
    fi
done

echo ""
echo "📚 Checking documentation..."
DOC_FILES=(
    "AUTHENTICATION_TESTING.md"
    "TEST_DELIVERABLES_SUMMARY.md"
    "QUICK_TEST_REFERENCE.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        echo "✅ $file ($SIZE)"
    else
        echo "❌ Missing: $file"
        ALL_FILES_EXIST=false
    fi
done

echo ""
echo "📊 Test Statistics:"
TOTAL_LINES=$(cat "${TEST_FILES[@]}" 2>/dev/null | wc -l | tr -d ' ')
echo "   Total test code: $TOTAL_LINES lines"

DOC_LINES=$(cat "${DOC_FILES[@]}" 2>/dev/null | wc -l | tr -d ' ')
echo "   Total documentation: $DOC_LINES lines"

echo ""
if [ "$ALL_FILES_EXIST" = true ]; then
    echo "✅ All test files and documentation are present!"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. npm install (if not done)"
    echo "   2. npm test (run all tests)"
    echo "   3. npm run test:coverage (check coverage)"
    echo ""
    exit 0
else
    echo "❌ Some files are missing. Please check the output above."
    exit 1
fi
