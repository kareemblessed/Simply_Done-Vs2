
import { taskService } from '../../src/server/services/taskService';
import { TaskController } from '../../src/server/controllers/taskController';
import { apiService } from '../../src/client/services/apiService';
import { Priority, Task } from '../../src/shared/types/task.types';
import { getDaysRemaining, isOverdue } from '../../src/shared/utils/helpers';

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

console.log('\n=== Task-002 Tests: Due Date Functionality ===\n');

async function runTests() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTs = tomorrow.getTime();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTs = yesterday.getTime();

  // Test 1: Task type includes optional dueDate field (implicitly tested by creation)
  try {
    const task = await taskService.create({ 
      text: 'Due Date Task', 
      priority: Priority.MEDIUM,
      dueDate: tomorrowTs 
    });
    assert(task.dueDate === tomorrowTs, 'taskService.create stores dueDate correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: taskService.updateDueDate modifies task date
  try {
    const task = await taskService.create({ text: 'Update Date', priority: Priority.LOW });
    const updated = await taskService.updateDueDate(task.id, yesterdayTs);
    assert(updated !== null && updated.dueDate === yesterdayTs, 'taskService.updateDueDate modifies task date');
  } catch (e) { console.error(e); failCount++; }

  // Test 3: TaskController exposes updateDueDate endpoint
  try {
    const task = await taskService.create({ text: 'Controller Date', priority: Priority.HIGH });
    const response = await TaskController.updateDueDate(task.id, tomorrowTs);
    assert(response.success && response.data?.dueDate === tomorrowTs, 'TaskController exposes updateDueDate endpoint');
  } catch (e) { console.error(e); failCount++; }

  // Test 4: apiService.updateDueDate calls controller correctly
  try {
    const task = await taskService.create({ text: 'API Date', priority: Priority.MEDIUM });
    const updated = await apiService.updateDueDate(task.id, yesterdayTs);
    assert(updated.dueDate === yesterdayTs, 'apiService.updateDueDate calls controller correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 5: Helper calculates days remaining correctly
  try {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const diff = getDaysRemaining(future.getTime());
    // Allow small margin or exact match depending on time of execution, usually 5
    assert(diff === 5 || diff === 4, 'Days remaining calculated correctly (approx 5 days)');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Helper identifies overdue tasks
  try {
    const past = new Date();
    past.setDate(past.getDate() - 2);
    assert(isOverdue(past.getTime()) === true, 'Overdue task identified correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 7: Helper identifies non-overdue tasks
  try {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    assert(isOverdue(future.getTime()) === false, 'Future task is not overdue');
  } catch (e) { console.error(e); failCount++; }

  // Test 8: apiService.createTask accepts due date
  try {
    const task = await apiService.createTask('API Create with Date', Priority.HIGH, 'Desc', tomorrowTs);
    assert(task.dueDate === tomorrowTs, 'apiService.createTask accepts due date');
  } catch (e) { console.error(e); failCount++; }

  // Test 9: Handling invalid date (null removal)
  try {
    const task = await taskService.create({ text: 'Null Date', priority: Priority.LOW, dueDate: tomorrowTs });
    const updated = await taskService.updateDueDate(task.id, null);
    assert(updated?.dueDate === undefined, 'Can remove due date (set to null/undefined)');
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
