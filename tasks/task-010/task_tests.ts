
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
const mockIndexedDB: Record<string, any> = {};

// Setup Mocks
(globalThis as any).window = {
  localStorage: {
    getItem: (k: string) => mockLocalStorage[k] || null,
    setItem: (k: string, v: string) => {
      // Simulate quota exceeded for large data
      if (v.length > 5000) throw new Error('QuotaExceededError');
      mockLocalStorage[k] = v;
    },
    removeItem: (k: string) => delete mockLocalStorage[k],
    clear: () => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }
  },
  indexedDB: {
    open: () => ({
      result: {
        createObjectStore: () => {},
        transaction: () => ({
          objectStore: () => ({
            put: (val: any, key: any) => { mockIndexedDB[key] = val; return { onsuccess: null }; },
            get: (key: any) => { 
              const req = { result: mockIndexedDB[key], onsuccess: null }; 
              setTimeout(() => req.onsuccess && (req as any).onsuccess(), 10);
              return req;
            }
          })
        })
      },
      onsuccess: null,
      onupgradeneeded: null,
    })
  }
};

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
    const hugeTask: Task = { 
      id: 'huge', text: 'Huge'.repeat(2000), isCompleted: false, priority: Priority.LOW,
      subtasks: [], createdAt: Date.now(), updatedAt: Date.now()
    };
    
    await db.writeTasks([hugeTask]);
    
    // Should be in mockIndexedDB because mockLocalStorage throws on > 5000 chars
    const inIdb = mockIndexedDB['simplydone_tasks_v3'];
    assert(!!inIdb, 'IndexedDB fallback triggers appropriately for large data');
  } catch (e) { console.error(e); failCount++; }

  // Test 7: Retrieval from IndexedDB
  try {
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
