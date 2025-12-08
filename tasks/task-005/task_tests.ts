
import { taskService } from '../../src/server/services/taskService';
import { filterService } from '../../src/server/services/filterService';
import { Priority, FilterLogic, FilterOperator, TaskField } from '../../src/shared/types/task.types';
import { db } from '../../src/server/db/jsonDatabase';

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

console.log('\n=== Task-005 Tests: Advanced Filtering ===\n');

async function runTests() {
  
  // Setup Data
  const t1 = await taskService.create({ text: 'Buy Groceries', priority: Priority.MEDIUM });
  const t2 = await taskService.create({ text: 'Finish Report', priority: Priority.HIGH });
  const t3 = await taskService.create({ text: 'Call Mom', priority: Priority.LOW });
  
  // Complete one
  await taskService.update(t2.id, { isCompleted: true });

  // Test 1: Type Checking (Runtime check for existence of Types/Enums)
  try {
    assert(FilterLogic.AND === 'AND' && FilterOperator.EQUALS === 'EQUALS', 'Filter types and enums exist');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: filterService.buildQuery
  try {
    const query = filterService.buildQuery(FilterLogic.AND, [
      { id: '1', field: 'priority', operator: FilterOperator.EQUALS, value: 'HIGH' }
    ]);
    assert(query.logic === 'AND' && query.conditions.length === 1, 'filterService.buildQuery constructs correct query object');
  } catch (e) { console.error(e); failCount++; }

  // Test 3: filterService.executeQuery with AND
  try {
    // Find tasks that contain "Buy" AND are MEDIUM priority
    const query = filterService.buildQuery(FilterLogic.AND, [
       { id: '1', field: 'text', operator: FilterOperator.CONTAINS, value: 'Buy' },
       { id: '2', field: 'priority', operator: FilterOperator.EQUALS, value: 'MEDIUM' }
    ]);
    const results = filterService.executeQuery([t1, t2, t3], query);
    assert(results.length === 1 && results[0].id === t1.id, 'filterService.executeQuery filters correctly with AND logic');
  } catch (e) { console.error(e); failCount++; }

  // Test 4: filterService.executeQuery with OR
  try {
    // Find tasks that contain "Mom" OR are HIGH priority
    const query = filterService.buildQuery(FilterLogic.OR, [
       { id: '1', field: 'text', operator: FilterOperator.CONTAINS, value: 'Mom' },
       { id: '2', field: 'priority', operator: FilterOperator.EQUALS, value: 'HIGH' }
    ]);
    const results = filterService.executeQuery([t1, t2, t3], query);
    // Should match Call Mom (contains Mom) and Finish Report (High)
    assert(results.length === 2 && results.some(t => t.id === t3.id) && results.some(t => t.id === t2.id), 'filterService.executeQuery filters correctly with OR logic');
  } catch (e) { console.error(e); failCount++; }

  // Test 5: taskService.filterTasksByQuery
  try {
    const query = filterService.buildQuery(FilterLogic.AND, [
        { id: '1', field: 'isCompleted', operator: FilterOperator.EQUALS, value: 'true' }
    ]);
    const results = taskService.filterTasksByQuery(query);
    assert(results.some(t => t.id === t2.id) && results.length >= 1, 'taskService.filterTasksByQuery chains correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Preset Persistence
  try {
     const query = filterService.buildQuery(FilterLogic.AND, []);
     filterService.savePreset('My Preset', query);
     const presets = filterService.getPresets();
     assert(presets.some(p => p.name === 'My Preset'), 'FilterPreset saves and loads from jsonDatabase');
  } catch (e) { console.error(e); failCount++; }

  // Test 7: Empty condition edge case
  try {
    const query = filterService.buildQuery(FilterLogic.AND, []);
    const results = filterService.executeQuery([t1, t2], query);
    assert(results.length === 2, 'Empty filter conditions return all tasks');
  } catch (e) { console.error(e); failCount++; }

  // Test 8: Complex/Nested Logic Simulation (Flattened)
  try {
     // Text starts with "Call" AND Priority is LOW
     const query = filterService.buildQuery(FilterLogic.AND, [
        { id: '1', field: 'text', operator: FilterOperator.STARTS_WITH, value: 'Call' },
        { id: '2', field: 'priority', operator: FilterOperator.EQUALS, value: 'LOW' }
     ]);
     const results = taskService.filterTasksByQuery(query);
     assert(results.some(t => t.id === t3.id), 'Complex operator logic executes correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 9: Invalid/Mismatch Handling
  try {
    const query = filterService.buildQuery(FilterLogic.AND, [
        { id: '1', field: 'text', operator: FilterOperator.EQUALS, value: 'NON_EXISTENT_TEXT_XYZ' }
    ]);
    const results = taskService.filterTasksByQuery(query);
    assert(results.length === 0, 'No matches returns empty array');
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
