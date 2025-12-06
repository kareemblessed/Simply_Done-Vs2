SimplyDone - Task Management Application
A production-grade, browser-based task management application built with React 19 and TypeScript. Features a simulated full-stack architecture with N-tier separation of concerns, operating entirely client-side for maximum privacy and offline capability.
Quick Start
Prerequisites

Node.js (v18+)
npm or yarn
Docker (for validation)

Installation
bash# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

Project Structure
SimplyDone/
├── src/
│   ├── client/
│   │   ├── App.tsx              # Main application container
│   │   ├── services/
│   │   │   └── apiService.ts    # API bridge layer
│   │   └── components/
│   │       ├── TaskForm.tsx
│   │       ├── TaskList.tsx
│   │       ├── TaskItem.tsx
│   │       ├── FilterBar.tsx
│   │       └── StatsCard.tsx
│   ├── server/
│   │   ├── controllers/
│   │   │   └── taskController.ts
│   │   ├── services/
│   │   │   └── taskService.ts
│   │   ├── validators/
│   │   │   └── taskValidator.ts
│   │   └── db/
│   │       └── jsonDatabase.ts
│   └── shared/
│       ├── types/
│       │   └── task.types.ts
│       ├── constants.ts
│       └── utils/
│           └── helpers.ts
├── tasks/               # Project Puzzle task definitions
│   ├── task-001/
│   ├── task-002/
│   ├── ...
│   └── task-010/
├── Dockerfile
├── docker-compose.yaml
├── run_tests.sh
└── package.json
Architecture
N-Tier Architecture

Frontend: React components with Tailwind CSS
API Layer: apiService.ts bridges UI and backend
Backend Controller: taskController.ts handles routing
Business Logic: taskService.ts implements core logic
Validation: taskValidator.ts ensures data integrity
Persistence: jsonDatabase.ts localStorage adapter

Task Management Workflow
Creating a Task Solution
Step 1: Copy Required Files
bash# Copy docker-compose.yaml to task folder
cp docker-compose.yaml tasks/task-007/

# Copy run_tests.sh to task folder
cp run-tests.sh tasks/task-007/

# Make run_tests.sh executable
chmod +x tasks/task-007/run-tests.sh
Step 2: Implement Solution

Modify the required existing files (as specified in task description)
Implement tests in tasks/task-XXX/task_test.ts
Test locally: ./run-tests.sh task-007

Step 3: Create Solution Diff
bash# Generate diff (excludes tasks folder)
git diff -- . ':!tasks/' > tasks/task-007/task_diff.txt

# Verify diff has content
cat tasks/task-007/task_diff.txt
Step 4: Commit and Reset
bash# Stage the diff file
git add tasks/task-007/task_diff.txt

# Commit with clear message
git commit -m "Add task-007 solution diff"

# Reset working directory to clean state (no caret!)
git reset --hard HEAD
Step 5: Verify Diff Works
bash# Apply diff to test it
git apply tasks/task-007/task_diff.txt

# Run tests to verify solution
./run-tests.sh task-007

# Reset back to clean
git reset --hard HEAD
Testing
Run Tests Locally
bash# Test specific task
./run-tests.sh task-007

# Test all tasks
for i in {001..010}; do ./run_tests.sh task-$i; done
Apply and Test a Diff
bash# Apply solution from diff
git apply tasks/task-007/task_diff.txt

# Run the tests
./run-tests.sh task-007

# Reset after testing
git reset --hard HEAD
Docker Build
Build Docker Image
bash# Build the image
docker build -t puzzle/simplydone:latest .

# Verify build
docker images | grep simplydone
Clean Build
bash# Remove node_modules
rm -rf node_modules/

# Verify deletion
ls -la | grep node_modules

# Rebuild
npm install
docker build -t puzzle/simplydone:latest