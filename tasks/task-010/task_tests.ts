
import { SerializationAdapter } from '../../src/server/db/serializationAdapter';
import { db } from '../../src/server/db/jsonDatabase';
import { Task, Priority } from '../../src/shared/types/task.types';

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

console.log('\n=== Task-010 Tests: Serialization & Storage ===\n');

// Mock Environment
const mockLocalStorage: Record<string, string> = {};
const mockIndexedDBStore: Record<string, any> = {};

// Mock Storage Implementation with Quota Limit
const mockStorageImplementation = {
  getItem: (k: string) => mockLocalStorage[k] || null,
  setItem: (k: string, v: string) => {
    // Simulate quota exceeded for large data
    // Threshold set to 1000 chars. LZW compression might reduce size, 
    // so we will send significantly more data in the test.
    if (v.length > 1000) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    mockLocalStorage[k] = v;
  },
  removeItem: (k: string) => delete mockLocalStorage[k],
  clear: () => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }
};

// Setup Advanced Mocks for IndexedDB
const mockIDB = {
  open: (name: string, version: number) => {
    const request: any = { onsuccess: null, result: null, error: null, onupgradeneeded: null };
    
    // Simulate async success
    setTimeout(() => {
      const db = {
        objectStoreNames: { contains: () => true },
        createObjectStore: () => {},
        transaction: (stores: any, mode: any) => {
           const tx: any = { oncomplete: null, onerror: null };
           const objectStore = (storeName: string) => ({
             put: (value: any, key: any) => {
               mockIndexedDBStore[key] = value;
             },
             get: (key: any) => {
               const req: any = { result: mockIndexedDBStore[key], onsuccess: null };
               setTimeout(() => { if(req.onsuccess) req.onsuccess(); }, 5);
               return req;
             }
           });
           
           // Async complete transaction
           setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 10);
           
           return { objectStore };
        }
      };
      request.result = db;
      if (request.onsuccess) request.onsuccess({ target: request });
    }, 10);
    return request;
  }
};

// Apply Mocks to Global Scope
// IMPORTANT: We must mock both window.localStorage AND global.localStorage 
// to satisfy the strict check in JsonDatabase.ts (hasLocalStorage)
(globalThis as any).window = {
  localStorage: mockStorageImplementation,
  indexedDB: mockIDB
};
(globalThis as any).localStorage = mockStorageImplementation;
(globalThis as any).indexedDB = mockIDB;

async function runTests() {

  // Test 1: Serializer interface exists and methods work
  try {
    const data = { foo: 'bar' };
    const encoded = SerializationAdapter.encode(data);
    const decoded = SerializationAdapter.decode<{foo: string}>(encoded);
    assert(decoded.foo === 'bar', 'Serializer encode/decode basic object works');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: Circular reference handling
  try {
    const obj: any = { name: 'Circle' };
    obj.self = obj;
    const encoded = SerializationAdapter.encode(obj);
    const decoded = SerializationAdapter.decode<any>(encoded);
    assert(decoded.self === '[Circular]', 'Circular references detected and handled safe');
  } catch (e) { console.error(e); failCount++; }

  // Test 3: Date object precision
  try {
    const date = new Date('2025-01-01T12:00:00.000Z');
    const obj = { dateField: date };
    const encoded = SerializationAdapter.encode(obj);
    const decoded: any = SerializationAdapter.decode(encoded);
    assert(decoded.dateField instanceof Date && decoded.dateField.toISOString() === date.toISOString(), 'Date fields deserialize with correct precision');
  } catch (e) { console.error(e); failCount++; }

  // Test 4: Compression
  try {
    const largeStr = 'A'.repeat(1000) + 'B'.repeat(1000); // Compressible
    const encoded = SerializationAdapter.encode({ data: largeStr });
    // LZW or similar should make it smaller or at least transform it.
    // Our adapter might mark it as compressed.
    const isCompressed = encoded.startsWith('__CZ__');
    const decoded: any = SerializationAdapter.decode(encoded);
    assert(isCompressed, 'Large data is identified for compression');
    assert(decoded.data === largeStr, 'Compressed data decompresses without corruption');
  } catch (e) { console.error(e); failCount++; }

  // Test 5: Validate Task Type
  try {
    const invalidTask = { id: '1', text: 'No Priority' }; // Missing fields
    const valid = SerializationAdapter.validateTask(invalidTask);
    assert(!valid, 'Validation rejects invalid task structure');
    
    const validTask: Task = { 
      id: '1', text: 'Ok', isCompleted: false, priority: Priority.LOW, 
      subtasks: [], createdAt: Date.now(), updatedAt: Date.now() 
    };
    const validResult = SerializationAdapter.validateTask(validTask);
    assert(validResult, 'Validation accepts valid task structure');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Fallback to IndexedDB on large dataset
  try {
    // Generate large random data to prevent effective compression and trigger quota limit
    // 3000 chars of random alphanumeric data will stay > 1000 chars even with LZW
    const randomStr = Array(3000).fill(0).map(() => Math.random().toString(36).substring(2, 3)).join('');
    
    const hugeTask: Task = { 
      id: 'huge', text: randomStr, isCompleted: false, priority: Priority.LOW,
      subtasks: [], createdAt: Date.now(), updatedAt: Date.now()
    };
    
    // This calls writeTasks -> setItem -> throws QuotaExceeded -> catch -> writeToIndexedDB
    await db.writeTasks([hugeTask]);
    
    // Check IDB Store. Wait for async operations to settle.
    await new Promise(r => setTimeout(r, 50));
    
    const inIdb = mockIndexedDBStore['simplydone_tasks_v3'];
    
    // Debug info if failed
    if (!inIdb) {
        console.log('DEBUG: LocalStorage content:', mockLocalStorage['simplydone_tasks_v3']);
        console.log('DEBUG: Has IDB marker?', mockLocalStorage['simplydone_tasks_v3'] === 'USE_IDB');
    }

    assert(!!inIdb, 'IndexedDB fallback triggers appropriately for large data');
    assert(mockLocalStorage['simplydone_tasks_v3'] === 'USE_IDB', 'LocalStorage set to marker value');
  } catch (e) { console.error('Test 6 Error:', e); failCount++; }

  // Test 7: Retrieval from IndexedDB
  try {
    // Should detect 'USE_IDB' marker in LocalStorage and fetch from IDB map
    const tasks = await db.readTasks();
    assert(tasks.length === 1 && tasks[0].id === 'huge', 'Can retrieve data from IndexedDB fallback');
  } catch (e) { console.error(e); failCount++; }

  // Test 8: All field types preserved (Roundtrip)
  try {
    const complexTask: Task = {
      id: 'complex',
      text: 'Complex',
      priority: Priority.HIGH,
      isCompleted: true,
      subtasks: [{ id: 's1', text: 'sub', isCompleted: false }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: 'Desc'
    };
    const encoded = SerializationAdapter.encode([complexTask]);
    const decoded = SerializationAdapter.decode<Task[]>(encoded);
    assert(JSON.stringify(decoded[0]) === JSON.stringify(complexTask), 'All field types preserved in roundtrip');
  } catch (e) { console.error(e); failCount++; }

  // Test 9: Null/Undefined handling
  try {
    const obj = { nullVal: null, undefVal: undefined }; // JSON stringify removes undefined
    const encoded = SerializationAdapter.encode(obj);
    const decoded: any = SerializationAdapter.decode(encoded);
    assert(decoded.nullVal === null, 'Null values preserved');
    assert(!('undefVal' in decoded), 'Undefined values excluded as per JSON standard');
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
