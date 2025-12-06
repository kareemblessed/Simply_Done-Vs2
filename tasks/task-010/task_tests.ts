
import { db } from '../../src/server/db/jsonDatabase';
import { Task, Priority } from '../../src/shared/types/task.types';

let passCount = 0;
let failCount = 0;

async function assert(condition: boolean | Promise<boolean>, message: string) {
  try {
    if (await condition) {
      console.log(`✅ ${message}`);
      passCount++;
    } else {
      console.error(`❌ ${message}`);
      failCount++;
    }
  } catch (e) {
    console.error(`❌ ${message} (Exception: ${e})`);
    failCount++;
  }
}

console.log('\n=== Task-010 Tests: Serialization & Storage ===\n');

async function runTests() {
  // Test 1: Serializer interface exists and works
  try {
    const data = { foo: "bar", num: 123 };
    // @ts-ignore - Accessing private/protected serializer for testing if exposed or via public methods
    const encoded = db['serializer'].encode(data);
    // @ts-ignore
    const decoded: any = db['serializer'].decode(encoded);
    await assert(decoded.foo === "bar" && decoded.num === 123, 'Serializer interface with encode/decode exists');
  } catch (e) { console.error(e); failCount++; }

  // Test 2: Complex Task objects serialize
  try {
    const complexTask: Task = {
      id: 'complex-1',
      text: 'Nested',
      priority: Priority.HIGH,
      isCompleted: false,
      subtasks: [{ id: 's1', text: 'Sub 1', isCompleted: true }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.writeTasks([complexTask]);
    const tasks = await db.readTasks();
    await assert(
      tasks.length > 0 && 
      tasks.find(t => t.id === 'complex-1')?.subtasks[0].text === 'Sub 1', 
      'Complex Task objects serialize to JSON'
    );
  } catch (e) { console.error(e); failCount++; }

  // Test 3: Circular references
  try {
    const circular: any = { name: 'Loop' };
    circular.self = circular;
    
    // We test this via writeLog since Task type is strict, but logs accept 'context: any'
    await db.writeLog({
      id: 'log-1',
      level: 'INFO',
      message: 'Circular Test',
      timestamp: Date.now(),
      context: circular
    });
    
    const logs = await db.readLogs();
    const logContext = logs.find(l => l.id === 'log-1')?.context;
    
    await assert(
      logContext && logContext.self === '[Circular]', 
      'Circular references are detected properly'
    );
  } catch (e) { console.error(e); failCount++; }

  // Test 4: Date serialization
  try {
    const dateObj = new Date('2025-01-01T00:00:00.000Z');
    await db.writeLog({
      id: 'date-log',
      level: 'INFO',
      message: 'Date Test',
      timestamp: Date.now(),
      context: { myDate: dateObj }
    });
    
    const logs = await db.readLogs();
    const ctx = logs.find(l => l.id === 'date-log')?.context;
    
    // The serializer should restore it as a Date object or compatible string
    const isDateMatch = new Date(ctx.myDate).getTime() === dateObj.getTime();
    
    await assert(isDateMatch, 'Date fields deserialize with correct precision');
  } catch (e) { console.error(e); failCount++; }

  // Test 5: Type Validation on Deserialization
  try {
    // Inject invalid data directly into storage (mocking corruption)
    // @ts-ignore
    db.setItem('simplydone_tasks_v3', JSON.stringify([{ id: 'bad', text: 555 }])); 
    
    const tasks = await db.readTasks();
    // Should filter out invalid tasks or return empty if validation fails
    // @ts-ignore
    const isValid = tasks.every(t => typeof t.text === 'string');
    
    await assert(isValid, 'Deserialized objects maintain Task type');
  } catch (e) { console.error(e); failCount++; }

  // Test 6: Compression & Large Dataset (Simulated)
  try {
    const largeData = Array(1000).fill(null).map((_, i) => ({
      id: `task-${i}`,
      text: `Task Number ${i} with some repeatable text content to ensure compression works well`,
      priority: Priority.LOW,
      isCompleted: false,
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    
    await db.writeTasks(largeData);
    const readBack = await db.readTasks();
    
    await assert(
      readBack.length === 1000 && readBack[0].text.includes('Task Number 0'), 
      'Large datasets store and retrieve correctly (Compression/IndexedDB fallback)'
    );
  } catch (e) { console.error(e); failCount++; }

  console.log(`\n${passCount}/${passCount + failCount} passed\n`);
  if (failCount > 0) (process as any).exit(1);
}

runTests();
