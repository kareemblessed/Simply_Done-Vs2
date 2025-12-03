#!/bin/bash

# Accept task ID as parameter
TASK_ID=$1

# Check if task ID was provided
if [ -z "$TASK_ID" ]; then
    echo "Error: No task ID provided"
    echo "Usage: ./run_tests.sh <task-id>"
    exit 1
fi

# Path to the task test file
TASK_DIR="tasks/${TASK_ID}"
TEST_FILE="${TASK_DIR}/task_tests.js"

# Check if task directory exists
if [ ! -d "$TASK_DIR" ]; then
    echo "Error: Task directory not found: $TASK_DIR"
    exit 1
fi

# Check if test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo "Error: Test file not found: $TEST_FILE"
    exit 1
fi

echo "Running tests for ${TASK_ID}..."

# Run the tests using Node.js
node "$TEST_FILE"

# Capture exit code
EXIT_CODE=$?

# Return the exit code
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed for ${TASK_ID}"
else
    echo "❌ Tests failed for ${TASK_ID}"
fi

exit $EXIT_CODE