
import { taskService } from '../../src/server/services/taskService';
import { tagService } from '../../src/server/services/tagService';
import { Priority, TaskTag } from '../../src/shared/types/task.types';

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

console.log('\n=== Task-003 Tests: Categorization & Tags ===\n');

// Test 1: TaskTag type exists and defaults
test('Test 1: TaskTag type and default task structure', () => {
  const task = taskService.create({ 
    text: 'Test Tag Structure', 
    priority: Priority.MEDIUM 
  });
  
  if (!Array.isArray(task.tags)) throw new Error('Task should have tags array');
  if (task.tags.length !== 0) throw new Error('New task tags should be empty');
});

// Test 2: tagService.createTag functionality
test('Test 2: Create a new tag', () => {
  const tag = tagService.create({ name: 'Work', color: 'bg-red-500' });
  
  if (!tag.id) throw new Error('Tag ID missing');
  if (tag.name !== 'Work') throw new Error('Tag name mismatch');
  if (tag.color !== 'bg-red-500') throw new Error('Tag color mismatch');
  
  const fetched = tagService.getById(tag.id);
  if (!fetched) throw new Error('Could not retrieve created tag');
});

// Test 3: Add tag to task
test('Test 3: taskService.addTagToTask', () => {
  const task = taskService.create({ text: 'Tag Me', priority: Priority.LOW });
  const tag = tagService.create({ name: 'Urgent', color: 'bg-red-500' });
  
  const updatedTask = taskService.addTagToTask(task.id, tag.id);
  
  if (!updatedTask) throw new Error('Returned null from addTagToTask');
  if (updatedTask.tags.length !== 1) throw new Error('Tag count mismatch');
  if (updatedTask.tags[0].id !== tag.id) throw new Error('Added wrong tag');
  
  // Test duplicate prevention
  const dupTask = taskService.addTagToTask(task.id, tag.id);
  if (dupTask && dupTask.tags.length !== 1) throw new Error('Duplicate tag added');
});

// Test 4: Remove tag from task
test('Test 4: taskService.removeTagFromTask', () => {
  const task = taskService.create({ text: 'Untag Me', priority: Priority.LOW });
  const tag = tagService.create({ name: 'Later', color: 'bg-blue-500' });
  
  taskService.addTagToTask(task.id, tag.id);
  const result = taskService.removeTagFromTask(task.id, tag.id);
  
  if (!result) throw new Error('Returned null from removeTagFromTask');
  if (result.tags.length !== 0) throw new Error('Tag was not removed');
});

// Test 5: Initialize task with tags
test('Test 5: Create task with initial tags', () => {
  const tag1 = tagService.create({ name: 'Init1', color: 'c1' });
  const tag2 = tagService.create({ name: 'Init2', color: 'c2' });
  
  const task = taskService.create({ 
    text: 'Pre-tagged', 
    priority: Priority.HIGH, 
    tagIds: [tag1.id, tag2.id] 
  });
  
  if (task.tags.length !== 2) throw new Error('Initial tags not applied');
  if (!task.tags.find(t => t.name === 'Init1')) throw new Error('Tag 1 missing');
});

// Test 6: Cascade delete (Deleting tag removes it from tasks)
test('Test 6: Deleting a tag removes it from associated tasks', () => {
  const tagToDelete = tagService.create({ name: 'Delete Me', color: 'c3' });
  const tagToKeep = tagService.create({ name: 'Keep Me', color: 'c4' });
  
  const task1 = taskService.create({ text: 'T1', priority: Priority.LOW });
  const task2 = taskService.create({ text: 'T2', priority: Priority.LOW });
  
  taskService.addTagToTask(task1.id, tagToDelete.id);
  taskService.addTagToTask(task2.id, tagToDelete.id);
  taskService.addTagToTask(task2.id, tagToKeep.id);
  
  // Verify setup
  if (taskService.getById(task1.id)?.tags.length !== 1) throw new Error('Setup failed T1');
  if (taskService.getById(task2.id)?.tags.length !== 2) throw new Error('Setup failed T2');
  
  // Perform global delete
  taskService.removeTagGlobally(tagToDelete.id);
  tagService.delete(tagToDelete.id);
  
  const t1Post = taskService.getById(task1.id);
  const t2Post = taskService.getById(task2.id);
  
  if (t1Post?.tags.length !== 0) throw new Error('Tag not removed from T1');
  if (t2Post?.tags.length !== 1) throw new Error('Tag not removed from T2');
  if (t2Post?.tags[0].id !== tagToKeep.id) throw new Error('Wrong tag removed from T2');
});

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
if (failCount > 0) (process as any).exit(1);
(process as any).exit(0);
