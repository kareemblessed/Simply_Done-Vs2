
import { taskService } from '../../src/server/services/taskService';
import { TaskObserver, TaskEvent, Priority } from '../../src/shared/types/task.types';

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

console.log('\n=== Task-009 Tests: Observer Pattern ===\n');

// Mock Observer
class MockObserver implements TaskObserver {
  public eventLog: TaskEvent[] = [];
  update(event: TaskEvent) {
    this.eventLog.push(event);
  }
}

// Test 1: TaskObserver interface exists and subscribes
try {
  const observer = new MockObserver();
  if (typeof taskService.subscribe !== 'function') throw new Error('subscribe method missing');
  taskService.subscribe(observer);
  assert(true, 'TaskObserver subscribes to taskService');
} catch (e) { console.error(e); failCount++; }

// Test 2: Create operation notifies observers
try {
  const observer = new MockObserver();
  taskService.subscribe(observer);
  taskService.create({ text: 'Observed Task', priority: Priority.MEDIUM });
  
  const hasEvent = observer.eventLog.some(e => e.type === 'CREATE');
  assert(hasEvent, 'Create operation notifies observer');
  taskService.unsubscribe(observer);
} catch (e) { console.error(e); failCount++; }

// Test 3: Update operation notifies observers
try {
  const task = taskService.create({ text: 'To Update', priority: Priority.LOW });
  const observer = new MockObserver();
  taskService.subscribe(observer);
  
  taskService.update(task.id, { text: 'Updated' });
  
  const event = observer.eventLog.find(e => e.type === 'UPDATE');
  assert(event !== undefined && event.payload.taskId === task.id, 'Update operation notifies observer with ID');
  taskService.unsubscribe(observer);
} catch (e) { console.error(e); failCount++; }

// Test 4: Delete operation notifies observers
try {
  const task = taskService.create({ text: 'To Delete', priority: Priority.LOW });
  const observer = new MockObserver();
  taskService.subscribe(observer);
  
  taskService.delete(task.id);
  
  const event = observer.eventLog.find(e => e.type === 'DELETE');
  assert(event !== undefined, 'Delete operation notifies observer');
  taskService.unsubscribe(observer);
} catch (e) { console.error(e); failCount++; }

// Test 5: Multiple observers receive notifications
try {
  const obs1 = new MockObserver();
  const obs2 = new MockObserver();
  taskService.subscribe(obs1);
  taskService.subscribe(obs2);
  
  taskService.create({ text: 'Multi', priority: Priority.HIGH });
  
  assert(obs1.eventLog.length > 0 && obs2.eventLog.length > 0, 'Multiple observers notified');
  taskService.unsubscribe(obs1);
  taskService.unsubscribe(obs2);
} catch (e) { console.error(e); failCount++; }

// Test 6: Unsubscribe stops notifications
try {
  const observer = new MockObserver();
  taskService.subscribe(observer);
  taskService.unsubscribe(observer);
  
  taskService.create({ text: 'Ghost', priority: Priority.LOW });
  
  assert(observer.eventLog.length === 0, 'Unsubscribe prevents notifications');
} catch (e) { console.error(e); failCount++; }

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
