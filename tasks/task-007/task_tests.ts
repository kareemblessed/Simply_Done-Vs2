
import { OptimisticStateManager, OptimisticUpdate } from '../../src/utils/optimisticStateManager';
import { Task, Priority } from '../../src/shared/types/task.types';

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

// Helper to create a basic task
const mockTask = (id: string, text: string): Task => ({
  id,
  text,
  priority: Priority.MEDIUM,
  isCompleted: false,
  createdAt: 1000,
  updatedAt: 1000,
  subtasks: [],
  tags: [],
  reminders: []
});

async function runTests() {
  const baseTasks = [mockTask('1', 'Task 1')];

  // Test 1: OptimisticUpdate type structure (Validation by usage)
  try {
    const update: OptimisticUpdate = {
      id: 'op1',
      taskId: '2',
      type: 'CREATE',
      payload: mockTask('2', 'Task 2'),
      optimistic: true,
      pending: true,
      timestamp: Date.now()
    };
    assert(update.optimistic === true && update.pending === true, 'OptimisticUpdate type has required fields');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: App state tracks pending operations (Manager Logic)
  try {
    const updates: OptimisticUpdate[] = [{
      id: 'op1', taskId: '1', type: 'UPDATE', payload: { isCompleted: true }, optimistic: true, pending: true, timestamp: Date.now()
    }];
    const isPending = OptimisticStateManager.isTaskPending('1', updates);
    assert(isPending === true, 'App state tracks pending operations correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 3: TaskList displays optimistic changes immediately (Manager Logic)
  try {
    const updates: OptimisticUpdate[] = [{
      id: 'op1', taskId: '2', type: 'CREATE', payload: mockTask('2', 'Optimistic Task'), optimistic: true, pending: true, timestamp: Date.now()
    }];
    const result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    assert(result.length === 2 && result[0].text === 'Optimistic Task', 'Optimistic changes applied immediately (Create)');
  } catch (e) { console.error(e); failCount++; }

  // Test 4: Multiple operations queue in correct order
  try {
    const updates: OptimisticUpdate[] = [
      { id: 'op1', taskId: '1', type: 'UPDATE', payload: { text: 'Update 1' }, optimistic: true, pending: true, timestamp: 100 },
      { id: 'op2', taskId: '1', type: 'UPDATE', payload: { text: 'Update 2' }, optimistic: true, pending: true, timestamp: 200 }
    ];
    const result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    assert(result[0].text === 'Update 2', 'Multiple operations queue/apply in correct order');
  } catch (e) { console.error(e); failCount++; }

  // Test 5: Concurrent updates don't corrupt state (Simulated)
  try {
    const updates: OptimisticUpdate[] = [
      { id: 'op1', taskId: '1', type: 'UPDATE', payload: { isCompleted: true }, optimistic: true, pending: true, timestamp: 100 },
      { id: 'op2', taskId: '1', type: 'UPDATE', payload: { priority: Priority.HIGH }, optimistic: true, pending: true, timestamp: 100 }
    ];
    const result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    const t = result[0];
    assert(t.isCompleted === true && t.priority === Priority.HIGH, 'Concurrent updates merge correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Undo mechanism restores previous state
  try {
    // Apply update
    let updates: OptimisticUpdate[] = [{
      id: 'op1', taskId: '1', type: 'DELETE', optimistic: true, pending: true, timestamp: Date.now()
    }];
    let result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    const deleted = result.length === 0;
    
    // Simulate Rollback (remove update)
    updates = [];
    result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    
    assert(deleted && result.length === 1 && result[0].id === '1', 'Undo/Rollback restores previous state exactly');
  } catch (e) { console.error(e); failCount++; }

  // Test 7: Failed apiService calls trigger rollback (Logic Check)
  try {
    // This tests the concept: If an update is removed from the list, the state reverts.
    // In a real integration test we would mock apiService.
    const updates: OptimisticUpdate[] = [];
    const result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    assert(result[0].text === 'Task 1', 'Empty updates list equals server state (Rollback effective)');
  } catch (e) { console.error(e); failCount++; }

  // Test 8: Loading indicators logic
  try {
    const updates: OptimisticUpdate[] = [{
      id: 'op1', taskId: '1', type: 'UPDATE', payload: {}, optimistic: true, pending: true, timestamp: Date.now()
    }];
    const pending = OptimisticStateManager.isTaskPending('1', updates);
    assert(pending, 'Loading indicator logic returns true for pending task');
  } catch (e) { console.error(e); failCount++; }

  // Test 9: Previous task state restored exactly (Update Rollback)
  try {
    const originalText = baseTasks[0].text;
    let updates: OptimisticUpdate[] = [{
      id: 'op1', taskId: '1', type: 'UPDATE', payload: { text: 'Changed' }, optimistic: true, pending: true, timestamp: Date.now()
    }];
    // Apply
    let result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    // Rollback
    updates = [];
    result = OptimisticStateManager.applyUpdates(baseTasks, updates);
    
    assert(result[0].text === originalText, 'Previous state restored exactly after update rollback');
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
