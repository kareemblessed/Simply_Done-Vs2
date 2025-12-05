import { taskService } from '../../src/server/services/taskService';
import { cacheService } from '../../src/server/services/cacheService';
import { CacheMiddleware } from '../../src/client/middleware/cacheMiddleware';
import { Priority } from '../../src/shared/types/task.types';

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

function test(name: string, fn: () => Promise<void> | void) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`✅ ${name}`);
        passCount++;
      }).catch(e => {
        console.error(`❌ ${name}: ${e.message}`);
        failCount++;
      });
    } else {
      console.log(`✅ ${name}`);
      passCount++;
    }
  } catch (e: any) {
    console.error(`❌ ${name}: ${e.message}`);
    failCount++;
  }
}

console.log('\n=== Task-006 Tests: Cache Strategy ===\n');

// --- Unit Tests: CacheService ---

test('Test 1: Server Cache stores and retrieves data', () => {
  cacheService.flush();
  cacheService.set('test_key', { foo: 'bar' }, 1000);
  const data = cacheService.get<{foo: string}>('test_key');
  
  if (!data || data.foo !== 'bar') throw new Error('Cache retrieval failed');
});

test('Test 2: Server Cache expires data', async () => {
  cacheService.flush();
  cacheService.set('expired_key', 'data', -1); // Immediately expired
  
  const data = cacheService.get('expired_key');
  if (data !== null) throw new Error('Cache should return null for expired items');
});

test('Test 3: Server Cache invalidation works', () => {
  cacheService.flush();
  cacheService.set('task:1', 'a');
  cacheService.set('task:2', 'b');
  
  cacheService.invalidate('task:');
  
  if (cacheService.get('task:1') !== null) throw new Error('Invalidation failed');
  if (cacheService.get('task:2') !== null) throw new Error('Invalidation failed');
});

// --- Unit Tests: Client Middleware ---

test('Test 4: Client Middleware caches promises', async () => {
  const middleware = CacheMiddleware.getInstance();
  middleware.clear();
  
  let callCount = 0;
  const fetcher = async () => {
    callCount++;
    return 'response';
  };
  
  await middleware.execute('req_1', fetcher);
  await middleware.execute('req_1', fetcher);
  
  if (callCount !== 1) throw new Error(`Middleware should cache requests. Count: ${callCount}`);
});

test('Test 5: Client Middleware invalidates', async () => {
  const middleware = CacheMiddleware.getInstance();
  middleware.clear();
  
  let callCount = 0;
  const fetcher = async () => { callCount++; return 'fresh'; };
  
  await middleware.execute('req_2', fetcher); // count = 1
  middleware.invalidate('req_2');
  await middleware.execute('req_2', fetcher); // count = 2
  
  if (callCount !== 2) throw new Error(`Should refetch after invalidation. Count: ${callCount}`);
});

// --- Integration Tests: TaskService ---

test('Test 6: Task Creation Invalidates Service Cache', () => {
  localStorage.clear();
  cacheService.flush();
  
  // 1. Prime cache
  taskService.getAll(); 
  if (!cacheService.get('task_service:all_tasks')) throw new Error('Cache should be primed after read');

  // 2. Create task
  taskService.create({ text: 'New Task', priority: Priority.MEDIUM });

  // 3. Verify cache cleared
  if (cacheService.get('task_service:all_tasks') !== null) throw new Error('Cache should be invalidated after mutation');
});

// Wait for async tests
setTimeout(() => {
  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
}, 100);