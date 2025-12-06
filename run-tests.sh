#!/bin/bash

TASK_ID=$1

if [ -z "$TASK_ID" ]; then
    echo "Error: No task ID provided"
    echo "Usage: ./run-tests.sh <task-id>"
    exit 1
fi

TASK_DIR="tasks/${TASK_ID}"
TEST_FILE="${TASK_DIR}/task_tests.ts"    # Changed from .js to .ts

if [ ! -d "$TASK_DIR" ]; then
    echo "Error: Task directory not found: $TASK_DIR"
    exit 1
fi

if [ ! -f "$TEST_FILE" ]; then
    echo "Error: Test file not found: $TEST_FILE"
    exit 1
fi

echo "Running tests for ${TASK_ID}..."

# Use tsx to run TypeScript
npx tsx "$TEST_FILE"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed for ${TASK_ID}"
else
    echo "❌ Tests failed for ${TASK_ID}"
fi

exit $EXIT_CODE