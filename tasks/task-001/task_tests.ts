
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
} as Storage;

import { taskService } from '../../src/server/services/taskService';
import { Priority } from '../../src/shared/types/task.types';

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passCount++;
  } catch (e) {
    console.error(`❌ ${name}: ${e.message}`);
    failCount++;
  }
}

console.log('\n=== Task-001 Tests ===\n');

// Test 1: New tasks have subtasks array
test('Test 1: New task has empty subtasks', () => {
  const task = taskService.create({ text: 'Test', priority: Priority.LOW });
  if (!Array.isArray(task.subtasks) || task.subtasks.length !== 0) throw new Error('No empty subtasks array');
});

// Test 2: toggleSubtask method exists
test('Test 2: toggleSubtask method exists', () => {
  if (typeof taskService.toggleSubtask !== 'function') throw new Error('Method missing');
});

// Test 3: Toggle subtask changes status
test('Test 3: Toggle changes subtask status', () => {
  const task = taskService.create({ text: 'Main', priority: Priority.MEDIUM });
  
  // FIX: Use update to persist subtasks to the DB so toggleSubtask can find them
  taskService.update(task.id, {
    subtasks: [{ id: 's1', text: 'Sub', isCompleted: false }]
  });

  const updated = taskService.toggleSubtask(task.id, 's1');
  
  if (!updated) throw new Error('Returned null');
  if (updated.subtasks[0].isCompleted !== true) throw new Error('Toggle failed: expected true, got ' + updated.subtasks[0].isCompleted);
});

// Test 4: Toggle works both ways
test('Test 4: Toggle works true to false', () => {
  const task = taskService.create({ text: 'Test', priority: Priority.HIGH });
  
  // FIX: Use update to persist subtasks to the DB
  taskService.update(task.id, {
    subtasks: [{ id: 's1', text: 'Sub', isCompleted: true }]
  });

  const updated = taskService.toggleSubtask(task.id, 's1');
  
  if (!updated) throw new Error('Returned null');
  if (updated.subtasks[0].isCompleted !== false) throw new Error('Reverse toggle failed: expected false, got ' + updated.subtasks[0].isCompleted);
});

// Test 5: Invalid task returns null
test('Test 5: Invalid task ID returns null', () => {
  const result = taskService.toggleSubtask('fake-id', 's1');
  if (result !== null) throw new Error('Should return null');
});

// Test 6: Invalid subtask ID returns null
test('Test 6: Invalid subtask ID returns null', () => {
  const task = taskService.create({ text: 'Test', priority: Priority.LOW });
  const result = taskService.toggleSubtask(task.id, 'fake-sub');
  if (result !== null) throw new Error('Should return null');
});

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
process.exit(failCount === 0 ? 0 : 1);