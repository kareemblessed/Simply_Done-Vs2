
import { taskService } from '../../src/server/services/taskService';
import { tagService } from '../../src/server/services/tagService';
import { TaskController } from '../../src/server/controllers/taskController';
import { apiService } from '../../src/client/services/apiService';
import { Priority, Task, TaskTag } from '../../src/shared/types/task.types';

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

console.log('\n=== Task-003 Tests: Task Categorization ===\n');

async function runTests() {
  // Setup: Create a tag
  let createdTag: TaskTag | null = null;
  let createdTask: Task | null = null;

  // Test 1: tagService.createTag creates tag successfully
  try {
    createdTag = await tagService.createTag('Work', '#ff0000');
    assert(createdTag.name === 'Work' && createdTag.color === '#ff0000', 'tagService.createTag creates tag successfully');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: tagService.getAllTags retrieves all tags
  try {
    const tags = await tagService.getAllTags();
    assert(tags.some(t => t.id === createdTag?.id), 'tagService.getAllTags retrieves all tags');
  } catch (e) { console.error(e); failCount++; }

  // Test 3: Task type includes tags array (verified by creation/structure)
  try {
    createdTask = await taskService.create({ text: 'Tag Task', priority: Priority.MEDIUM });
    assert(Array.isArray(createdTask.tags), 'Task type includes tags array');
  } catch (e) { console.error(e); failCount++; }

  // Test 4: taskService.addTagToTask attaches tag to task
  try {
    if (createdTask && createdTag) {
      const updated = await taskService.addTagToTask(createdTask.id, createdTag.id);
      assert(updated?.tags.some(t => t.id === createdTag!.id) === true, 'taskService.addTagToTask attaches tag to task');
      createdTask = updated; // Update local ref
    } else {
      failCount++; console.error('Skipping Test 4 due to setup failure');
    }
  } catch (e) { console.error(e); failCount++; }

  // Test 5: apiService handles tag methods (Integration check)
  try {
    const newTag = await apiService.createTag('API Tag', '#00ff00');
    assert(newTag.name === 'API Tag', 'apiService.createTag works');
    const tags = await apiService.fetchTags();
    assert(tags.length >= 2, 'apiService.fetchTags works');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Multiple tags can be assigned
  try {
    if (createdTask) {
      const tag2 = await tagService.createTag('Urgent', '#0000ff');
      const updated = await taskService.addTagToTask(createdTask.id, tag2.id);
      assert(updated?.tags.length === 2, 'Multiple tags can be assigned to one task');
    }
  } catch (e) { console.error(e); failCount++; }

  // Test 7: taskService.removeTagFromTask removes tag
  try {
    if (createdTask && createdTag) {
      const updated = await taskService.removeTagFromTask(createdTask.id, createdTag.id);
      assert(updated?.tags.some(t => t.id === createdTag!.id) === false, 'taskService.removeTagFromTask removes tag from task');
    }
  } catch (e) { console.error(e); failCount++; }

  // Test 8: tagService.deleteTag removes tag correctly AND from tasks
  try {
    // Create a fresh task and tag for this test
    const tTask = await taskService.create({ text: 'Delete Test', priority: Priority.LOW });
    const tTag = await tagService.createTag('Temporary', '#333');
    await taskService.addTagToTask(tTask.id, tTag.id);
    
    // Delete the tag
    await tagService.deleteTag(tTag.id);
    
    // Verify tag is gone
    const allTags = await tagService.getAllTags();
    const tagExists = allTags.some(t => t.id === tTag.id);
    
    // Verify task no longer has it
    const refreshedTask = await taskService.getById(tTask.id);
    const hasTag = refreshedTask?.tags.some(t => t.id === tTag.id);

    assert(!tagExists && !hasTag, 'tagService.deleteTag removes tag and cleans up tasks');
  } catch (e) { console.error(e); failCount++; }

  // Test 9: Controller exposes endpoints (simple check)
  try {
    const response = await TaskController.getTags();
    assert(response.success && Array.isArray(response.data), 'TaskController exposes getTags endpoint');
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
