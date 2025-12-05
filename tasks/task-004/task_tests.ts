
import { taskService } from '../../src/server/services/taskService';
import { reminderService } from '../../src/server/services/reminderService';
import { Priority, TaskReminder } from '../../src/shared/types/task.types';

// Mock localStorage if not available (Node environment)
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; }
  };
} else {
  localStorage.clear();
}

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passCount++;
  } catch (e: any) {
    console.error(`❌ ${name}: ${e.message}`);
    failCount++;
  }
}

console.log('\n=== Task-004 Tests: Task Reminders ===\n');

// Test 1: TaskReminder type exists and defaults
test('Test 1: TaskReminder type and default task structure', () => {
  const task = taskService.create({ 
    text: 'Test Reminder Structure', 
    priority: Priority.MEDIUM 
  });
  
  if (!Array.isArray(task.reminders)) throw new Error('Task should have reminders array');
  if (task.reminders.length !== 0) throw new Error('New task reminders should be empty');
});

// Test 2: reminderService.createReminder functionality
test('Test 2: Create a new reminder', () => {
  const time = Date.now() + 86400000; // Tomorrow
  const reminder = reminderService.create({ time, message: 'Do it now' });
  
  if (!reminder.id) throw new Error('Reminder ID missing');
  if (reminder.message !== 'Do it now') throw new Error('Reminder message mismatch');
  if (reminder.time !== time) throw new Error('Reminder time mismatch');
  
  const fetched = reminderService.getById(reminder.id);
  if (!fetched) throw new Error('Could not retrieve created reminder');
});

// Test 3: Add reminder to task
test('Test 3: taskService.addReminderToTask', () => {
  const task = taskService.create({ text: 'Remind Me', priority: Priority.LOW });
  const reminder = reminderService.create({ time: Date.now(), message: 'Urgent' });
  
  const updatedTask = taskService.addReminderToTask(task.id, reminder.id);
  
  if (!updatedTask) throw new Error('Returned null from addReminderToTask');
  if (updatedTask.reminders.length !== 1) throw new Error('Reminder count mismatch');
  if (updatedTask.reminders[0].id !== reminder.id) throw new Error('Added wrong reminder');
  
  // Test duplicate prevention
  const dupTask = taskService.addReminderToTask(task.id, reminder.id);
  if (dupTask && dupTask.reminders.length !== 1) throw new Error('Duplicate reminder added');
});

// Test 4: Remove reminder from task
test('Test 4: taskService.removeReminderFromTask', () => {
  const task = taskService.create({ text: 'Forget Me', priority: Priority.LOW });
  const reminder = reminderService.create({ time: Date.now(), message: 'Later' });
  
  taskService.addReminderToTask(task.id, reminder.id);
  const result = taskService.removeReminderFromTask(task.id, reminder.id);
  
  if (!result) throw new Error('Returned null from removeReminderFromTask');
  if (result.reminders.length !== 0) throw new Error('Reminder was not removed');
});

// Test 5: Initialize task with reminders
test('Test 5: Create task with initial reminders', () => {
  const r1 = reminderService.create({ time: Date.now(), message: 'R1' });
  const r2 = reminderService.create({ time: Date.now(), message: 'R2' });
  
  const task = taskService.create({ 
    text: 'Pre-reminded', 
    priority: Priority.HIGH, 
    reminderIds: [r1.id, r2.id] 
  });
  
  if (task.reminders.length !== 2) throw new Error('Initial reminders not applied');
  if (!task.reminders.find(r => r.message === 'R1')) throw new Error('Reminder 1 missing');
});

// Test 6: Cascade delete (Deleting reminder removes it from tasks)
test('Test 6: Deleting a reminder removes it from associated tasks', () => {
  const remToDelete = reminderService.create({ time: Date.now(), message: 'Delete Me' });
  const remToKeep = reminderService.create({ time: Date.now(), message: 'Keep Me' });
  
  const task1 = taskService.create({ text: 'T1', priority: Priority.LOW });
  const task2 = taskService.create({ text: 'T2', priority: Priority.LOW });
  
  taskService.addReminderToTask(task1.id, remToDelete.id);
  taskService.addReminderToTask(task2.id, remToDelete.id);
  taskService.addReminderToTask(task2.id, remToKeep.id);
  
  // Verify setup
  if (taskService.getById(task1.id)?.reminders.length !== 1) throw new Error('Setup failed T1');
  if (taskService.getById(task2.id)?.reminders.length !== 2) throw new Error('Setup failed T2');
  
  // Perform global delete
  taskService.removeReminderGlobally(remToDelete.id);
  reminderService.delete(remToDelete.id);
  
  const t1Post = taskService.getById(task1.id);
  const t2Post = taskService.getById(task2.id);
  
  if (t1Post?.reminders.length !== 0) throw new Error('Reminder not removed from T1');
  if (t2Post?.reminders.length !== 1) throw new Error('Reminder not removed from T2');
  if (t2Post?.reminders[0].id !== remToKeep.id) throw new Error('Wrong reminder removed from T2');
});

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
if (failCount > 0) (process as any).exit(1);
(process as any).exit(0);
