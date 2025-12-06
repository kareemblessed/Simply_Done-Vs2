
import { taskReducer, initialState, TaskState, OptimisticAction } from '../../src/client/App';
import { Task, Priority } from '../../src/shared/types/task.types';

// Helper to create mock task
const mockTask = (id: string, text: string): Task => ({
  id,
  text,
  priority: Priority.MEDIUM,
  isCompleted: false,
  subtasks: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ ${message}`);
    passCount++;
  } else {
    console.error(`❌ ${message}`);
    failCount++;
  }
}

console.log('\n=== Task-007 Tests: Optimistic Updates ===\n');

// Test 1: Optimistic Create
try {
  const task = mockTask('temp-1', 'New Task');
  const action: OptimisticAction = { 
    type: 'ADD_TASK_OPTIMISTIC', 
    payload: { tempId: 'temp-1', task } 
  };
  const newState = taskReducer(initialState, action);
  
  assert(newState.tasks.length === 1 && newState.tasks[0].id === 'temp-1', 'Optimistic Create: Task added immediately');
  assert(newState.pendingActions.length === 1 && newState.pendingActions[0].type === 'CREATE', 'Optimistic Create: Action queued');
} catch (e) { console.error(e); failCount++; }

// Test 2: Optimistic Update
try {
  const original = mockTask('1', 'Original');
  const startState: TaskState = { ...initialState, tasks: [original] };
  
  const action: OptimisticAction = { 
    type: 'UPDATE_TASK_OPTIMISTIC', 
    payload: { id: '1', updates: { text: 'Updated' }, original, actionId: 'act-1' } 
  };
  const newState = taskReducer(startState, action);
  
  assert(newState.tasks[0].text === 'Updated', 'Optimistic Update: State updated immediately');
  assert(newState.pendingActions[0].previousState?.text === 'Original', 'Optimistic Update: Previous state preserved');
  assert(newState.pendingActions[0].id === 'act-1', 'Optimistic Update: Action ID tracked');
} catch (e) { console.error(e); failCount++; }

// Test 3: Rollback Update
try {
  const original = mockTask('1', 'Original');
  // Simulate state where update happened
  const pendingOp = { id: 'act-1', type: 'UPDATE' as const, taskId: '1', previousState: original };
  const startState: TaskState = { 
    tasks: [{ ...original, text: 'Updated' }], 
    pendingActions: [pendingOp], 
    error: null 
  };
  
  const action: OptimisticAction = { 
    type: 'ROLLBACK_ACTION', 
    payload: { actionId: 'act-1', error: 'Failed' } 
  };
  const newState = taskReducer(startState, action);
  
  assert(newState.tasks[0].text === 'Original', 'Rollback Update: State reverted correctly');
  assert(newState.pendingActions.length === 0, 'Rollback Update: Pending action removed');
  assert(newState.error !== null, 'Rollback Update: Error set');
} catch (e) { console.error(e); failCount++; }

// Test 4: Optimistic Delete
try {
  const t1 = mockTask('1', 'Delete Me');
  const startState: TaskState = { ...initialState, tasks: [t1] };
  
  const action: OptimisticAction = { 
    type: 'DELETE_TASK_OPTIMISTIC', 
    payload: { id: '1', original: t1, actionId: 'act-del' } 
  };
  const newState = taskReducer(startState, action);
  
  assert(newState.tasks.length === 0, 'Optimistic Delete: Task removed immediately');
  assert(newState.pendingActions[0].type === 'DELETE', 'Optimistic Delete: Action queued');
} catch (e) { console.error(e); failCount++; }

// Test 5: Rollback Delete
try {
  const t1 = mockTask('1', 'Delete Me');
  const pendingOp = { id: 'act-del', type: 'DELETE' as const, taskId: '1', previousState: t1 };
  const startState: TaskState = { 
    tasks: [], 
    pendingActions: [pendingOp], 
    error: null 
  };
  
  const action: OptimisticAction = { 
    type: 'ROLLBACK_ACTION', 
    payload: { actionId: 'act-del', error: 'Delete Failed' } 
  };
  const newState = taskReducer(startState, action);
  
  assert(newState.tasks.length === 1 && newState.tasks[0].id === '1', 'Rollback Delete: Task restored');
} catch (e) { console.error(e); failCount++; }

// Test 6: Commit Action
try {
  const t1 = mockTask('temp-1', 'New Task');
  const finalTask = { ...t1, id: 'real-1' };
  const pendingOp = { id: 'temp-1', type: 'CREATE' as const, taskId: 'temp-1' };
  
  const startState: TaskState = { 
    tasks: [t1], 
    pendingActions: [pendingOp], 
    error: null 
  };
  
  const action: OptimisticAction = { 
    type: 'COMMIT_ACTION', 
    payload: { tempId: 'temp-1', finalTask, actionId: 'temp-1' } 
  };
  const newState = taskReducer(startState, action);
  
  assert(newState.tasks[0].id === 'real-1', 'Commit: Temp ID replaced with Real ID');
  assert(newState.pendingActions.length === 0, 'Commit: Pending action removed');
} catch (e) { console.error(e); failCount++; }

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
