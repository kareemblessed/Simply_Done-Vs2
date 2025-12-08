import { taskService } from '../../src/server/services/taskService';
import { TaskController } from '../../src/server/controllers/taskController';
import { apiService } from '../../src/client/services/apiService';
import { Priority } from '../../src/shared/types/task.types';

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

console.log('\n=== Task-001 Tests ===\n');

async function runTests() {
  // Test 1: New tasks have subtasks array
  try {
    const task = await taskService.create({ text: 'Test Subtasks', priority: Priority.LOW });
    assert(Array.isArray(task.subtasks) && task.subtasks.length === 0, 'New task has empty subtasks array');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: toggleSubtask method exists
  try {
    assert(typeof taskService.toggleSubtask === 'function', 'toggleSubtask method exists');
  } catch (e) { console.error(e); failCount++; }

  // Test 3 & 4: Toggle subtask changes status (Round trip)
  try {
    const task = await taskService.create({ text: 'Main Task', priority: Priority.MEDIUM });
    
    // Manually add a subtask via update
    const updated = await taskService.update(task.id, {
      subtasks: [{ id: 's1', text: 'Sub 1', isCompleted: false }]
    });

    if (updated) {
      // Toggle ON
      const toggled = await taskService.toggleSubtask(task.id, 's1');
      assert(toggled !== null && toggled.subtasks[0].isCompleted === true, 'Toggle changes subtask status to true');
      
      // Toggle OFF
      const toggledBack = await taskService.toggleSubtask(task.id, 's1');
      assert(toggledBack !== null && toggledBack.subtasks[0].isCompleted === false, 'Toggle changes subtask status back to false');
    } else {
      assert(false, 'Setup failed: Could not update task with subtasks');
    }
  } catch (e) { console.error(e); failCount++; }

  // Test 5: Invalid task/subtask IDs
  try {
    const res1 = await taskService.toggleSubtask('invalid-id', 's1');
    assert(res1 === null, 'Invalid task ID returns null');

    const task = await taskService.create({ text: 'Valid', priority: Priority.LOW });
    const res2 = await taskService.toggleSubtask(task.id, 'invalid-sub');
    assert(res2 === null, 'Invalid subtask ID returns null');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Controller Exposure (Requirement Check)
  try {
    const task = await taskService.create({ text: 'Controller Test', priority: Priority.HIGH });
    await taskService.update(task.id, {
      subtasks: [{ id: 'ctrl-1', text: 'Ctrl Sub', isCompleted: false }]
    });

    // Invoke Controller directly
    const response = await TaskController.toggleSubtask(task.id, 'ctrl-1');
    
    assert(
      response.success === true && 
      response.data !== undefined && 
      response.data.subtasks[0].isCompleted === true, 
      'TaskController exposes toggleSubtask correctly'
    );
  } catch (e) { console.error(e); failCount++; }

  // Test 7: ApiService Integration (Full Stack Check)
  try {
    const task = await taskService.create({ text: 'API Test', priority: Priority.MEDIUM });
    await taskService.update(task.id, {
      subtasks: [{ id: 'api-1', text: 'API Sub', isCompleted: false }]
    });

    // Invoke API Service
    const updatedTask = await apiService.toggleSubtask(task.id, 'api-1');
    
    assert(
      updatedTask.subtasks[0].isCompleted === true,
      'apiService exposes toggleSubtask and functions correctly'
    );
  } catch (e) { console.error(e); failCount++; }

  // Test 8: Validator rejects invalid subtasks
  try {
    const task = await taskService.create({ text: 'Validator Test', priority: Priority.LOW });
    // Attempt to update via Controller to trigger validation
    const res = await TaskController.updateTask(task.id, {
      subtasks: [{ id: 'bad', text: '', isCompleted: false }] // Invalid: Empty text
    });
    
    assert(
      res.success === false && 
      typeof res.error === 'string' && 
      res.error.includes('Subtask text'),
      'Validator correctly rejects subtask with empty text'
    );
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();