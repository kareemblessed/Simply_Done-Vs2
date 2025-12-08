
import { taskService } from '../../src/server/services/taskService';
import { cacheService } from '../../src/server/services/cacheService';
import { apiService } from '../../src/client/services/apiService';
import { db } from '../../src/server/db/jsonDatabase';
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

console.log('\n=== Task-006 Tests: Cache Invalidation ===\n');

async function runTests() {
  
  // Clean start
  cacheService.flush();
  
  // Test 1: Cache Types & Config
  try {
    const config = cacheService.getConfig();
    assert(config.ttl > 0 && config.enabled === true, 'CacheConfig has ttl and is enabled');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: Memoization / Cache Set & Get
  try {
    const key = 'test_key';
    const val = { data: 123 };
    cacheService.set(key, val);
    const retrieved = cacheService.get(key);
    assert(JSON.stringify(retrieved) === JSON.stringify(val), 'Cache stores and retrieves data correctly');
  } catch (e) { console.error(e); failCount++; }

  // Test 3: Expiry (TTL)
  try {
    cacheService.set('short_lived', 'value', 10); // 10ms TTL
    await new Promise(r => setTimeout(r, 50));
    const expired = cacheService.get('short_lived');
    assert(expired === null, 'Expired cache entries return null');
  } catch (e) { console.error(e); failCount++; }

  // Test 4: TaskService Memoization (getAll)
  try {
    await taskService.create({ text: 'Cache Task 1', priority: Priority.LOW });
    
    // First call caches it
    const tasks1 = taskService.getAll();
    
    // Modify DB directly to bypass service invalidation (simulate external change not detected if cached)
    // Actually, we want to prove it IS cached.
    // If we call getAll again, it should return the cached result.
    // We can spy on cacheService.get
    
    const originalGet = cacheService.get.bind(cacheService);
    let hitCount = 0;
    cacheService.get = (k) => {
        const res = originalGet(k);
        if (res && k.includes('ALL_TASKS')) hitCount++;
        return res;
    };
    
    taskService.getAll(); // Should hit cache
    taskService.getAll(); // Should hit cache again
    
    assert(hitCount >= 2, 'taskService.getAll uses memoization/caching');
    cacheService.get = originalGet; // Restore
  } catch (e) { console.error(e); failCount++; }

  // Test 5: Invalidation on Create
  try {
    const initialTasks = taskService.getAll(); // Ensure cache is warm
    const newTask = await taskService.create({ text: 'Cache Invalidate Me', priority: Priority.HIGH });
    
    // Cache should be invalidated, so next get returns new list
    const updatedTasks = taskService.getAll();
    assert(updatedTasks.length === initialTasks.length + 1, 'Cache invalidates on task creation');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Invalidation on Update
  try {
    const task = (await taskService.getAll())[0];
    await taskService.update(task.id, { isCompleted: true });
    
    const allTasks = taskService.getAll();
    const updated = allTasks.find(t => t.id === task.id);
    assert(updated?.isCompleted === true, 'Cache invalidates on task update');
  } catch (e) { console.error(e); failCount++; }

  // Test 7: Invalidation on Delete
  try {
    const task = (await taskService.getAll())[0];
    await taskService.delete(task.id);
    const allTasks = taskService.getAll();
    assert(!allTasks.find(t => t.id === task.id), 'Cache invalidates on task deletion');
  } catch (e) { console.error(e); failCount++; }

  // Test 8: ApiService Client Middleware
  try {
    // This is hard to test in integration without mocking fetch, 
    // but we can check if repeated calls are faster or if the method exists.
    const start = Date.now();
    await apiService.fetchTasks();
    const mid = Date.now();
    await apiService.fetchTasks(); // Should be instant due to client cache
    const end = Date.now();
    
    // First call has 300ms delay in controller. Second should be ~0ms.
    // Allow some margin
    assert((end - mid) < 100, 'apiService retrieves cached responses instantly');
  } catch (e) { console.error(e); failCount++; }

  // Test 9: Persistence
  try {
    cacheService.set('persist_me', 'saved');
    const dbData = db.readCache(); // We need to expose this in DB or assume it works if get works after reload simulation
    assert(dbData.some(e => e.key === 'persist_me'), 'jsonDatabase persists cache metadata');
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
