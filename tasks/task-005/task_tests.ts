
import { taskService, tagService } from '../../src/server/services/taskService';
import { filterService } from '../../src/server/services/filterService';
import { Priority, FilterOperator } from '../../src/shared/types/task.types';

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

console.log('\n=== Task-005 Tests: Advanced Filtering (task.test.ts) ===\n');

// Clear DB before starting
if (typeof localStorage !== 'undefined') localStorage.clear();

// Test 1: FilterQuery logic (AND)
test('Test 1: FilterQuery AND logic works', () => {
  // Create test data
  const t1 = taskService.create({ text: 'Alpha Task', priority: Priority.HIGH });
  const t2 = taskService.create({ text: 'Beta Task', priority: Priority.LOW });
  // Unused t3 to ensure filtering works
  taskService.create({ text: 'Alpha Beta', priority: Priority.LOW });

  const query = filterService.buildQuery([
    { id: '1', field: 'text', operator: FilterOperator.CONTAINS, value: 'Alpha' },
    { id: '2', field: 'priority', operator: FilterOperator.EQUALS, value: Priority.HIGH }
  ], 'AND');

  const results = taskService.filterTasksByQuery(query);
  
  if (results.length !== 1) throw new Error(`Expected 1 result, got ${results.length}`);
  if (results[0].id !== t1.id) throw new Error('Wrong task returned');
});

// Test 2: FilterQuery logic (OR)
test('Test 2: FilterQuery OR logic works', () => {
  // Clear previous
  if (typeof localStorage !== 'undefined') localStorage.clear();
  
  const t1 = taskService.create({ text: 'Important Work', priority: Priority.HIGH });
  const t2 = taskService.create({ text: 'Grocery', priority: Priority.LOW });
  const t3 = taskService.create({ text: 'Relax', priority: Priority.LOW });

  const query = filterService.buildQuery([
    { id: '1', field: 'text', operator: FilterOperator.CONTAINS, value: 'Work' },
    { id: '2', field: 'priority', operator: FilterOperator.EQUALS, value: Priority.LOW }
  ], 'OR');

  const results = taskService.filterTasksByQuery(query);
  // Should match t1 (Work) OR t2 (Low) OR t3 (Low) = 3 tasks
  // Wait, t2 and t3 are Low. t1 is High but contains Work. 
  // Result should be 3.
  
  if (results.length !== 3) throw new Error(`Expected 3 results, got ${results.length}`);
});

// Test 3: Tag Filtering (Virtual Field)
test('Test 3: Can filter by Tag Name', () => {
  if (typeof localStorage !== 'undefined') localStorage.clear();

  const tag = tagService.create({ name: 'Urgent', color: 'red' });
  
  const t1 = taskService.create({ text: 'Task 1', priority: Priority.MEDIUM, tagIds: [tag.id] });
  const t2 = taskService.create({ text: 'Task 2', priority: Priority.MEDIUM });

  const query = filterService.buildQuery([
    { id: '1', field: 'tag', operator: FilterOperator.CONTAINS, value: 'Urgent' }
  ], 'AND');

  const results = taskService.filterTasksByQuery(query);

  if (results.length !== 1) throw new Error(`Expected 1 result, got ${results.length}`);
  if (results[0].id !== t1.id) throw new Error('Failed to filter by tag name');
});

// Test 4: Status Filtering (Boolean)
test('Test 4: Can filter by isCompleted status', () => {
  if (typeof localStorage !== 'undefined') localStorage.clear();

  const t1 = taskService.create({ text: 'Done Task', priority: Priority.LOW });
  taskService.update(t1.id, { isCompleted: true });
  
  const t2 = taskService.create({ text: 'Active Task', priority: Priority.LOW });

  const query = filterService.buildQuery([
    { id: '1', field: 'isCompleted', operator: FilterOperator.EQUALS, value: true }
  ], 'AND');

  const results = taskService.filterTasksByQuery(query);
  
  if (results.length !== 1) throw new Error(`Expected 1 result, got ${results.length}`);
  if (results[0].text !== 'Done Task') throw new Error('Wrong task returned for boolean filter');
});

// Test 5: Filter Presets Persistence
test('Test 5: Can save and load Filter Presets', () => {
  if (typeof localStorage !== 'undefined') localStorage.clear();

  const query = filterService.buildQuery([
    { id: '1', field: 'text', operator: FilterOperator.CONTAINS, value: 'Test' }
  ], 'AND');

  filterService.savePreset('My Test Filter', query);

  const presets = filterService.getPresets();
  if (presets.length !== 1) throw new Error('Preset not saved');
  if (presets[0].name !== 'My Test Filter') throw new Error('Wrong preset name');
  if (presets[0].query.logic !== 'AND') throw new Error('Wrong query logic in preset');
});

// Test 6: Empty Query returns all
test('Test 6: Empty query returns all tasks', () => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
  
  taskService.create({ text: 'A', priority: Priority.LOW });
  taskService.create({ text: 'B', priority: Priority.LOW });

  const query = filterService.buildQuery([], 'AND');
  const results = taskService.filterTasksByQuery(query);

  if (results.length !== 2) throw new Error('Should return all tasks for empty query');
});

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
