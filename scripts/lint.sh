#!/usr/bin/env bash


show_help() {
    echo "Usage: ./scripts/lint.sh -ban word_to_ban"
    echo ""
    echo "-ban (optional)"
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../"

echo "====== Parallel lint ====="

concurrently "npm run lint-lib || exit 1" "npm run stylelint || exit 1" "npm run spellcheck || exit " "ng lint dev || exit 1" "npm run lint-e2e || exit 1"

echo "====== exclude-word ====="

if grep "envalfresco" . -R --exclude-dir={node_modules,.history,.idea,scripts}; then
    echo not permitted word
    exit 1
fi
