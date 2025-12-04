
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Protocol

Each dataset must contain the following required files and directories:

```
dataset/
├── Dockerfile                         # Container definition for the task environment
├── docker-compose.yaml                # Docker compose configuration (or compose.yaml, docker-compose.yml)
├── run_tests.sh                       # Test execution script
└── tasks/                             # Task definitions directory
    ├── task-name-1/
    │   ├── task_description.txt        # Task description and instructions
    │   ├── task_diff.txt               # Golden solution diff (for oracle mode)
    │   ├── task_tests.*                # Task/language-specific test file
    │   ├── run-tests.sh                # Task-specific test runner script
    │   └── docker-compose.yaml         # Task-specific container configuration
    ├── task-name-2/
    │   ├── task_description.txt
    │   ├── task_diff.txt
    │   ├── task_tests.*
    │   ├── run-tests.sh
    │   └── docker-compose.yaml
    └── ...
```

## Available Agent Tools

The harness agent has access to the following IDE-like tools when solving tasks:

1. **codebase_search** - Search for code snippets using text-based keyword matching (lexical search using grep/ripgrep)
2. **read_file** - Read file contents with optional line range specification
3. **run_terminal_cmd** - Execute terminal commands in the Docker container environment
4. **list_dir** - List directory contents for exploration
5. **grep_search** - Perform regex-based searches across files using ripgrep
6. **edit_file** - Edit files using structured line-based operations (insert, replace, delete)
7. **file_search** - Search for files using fuzzy path matching
8. **delete_file** - Delete files from the workspace
