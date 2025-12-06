
import { TaskValidator } from '../../src/server/validators/taskValidator';
import { apiService } from '../../src/client/services/apiService';
import { Priority } from '../../src/shared/types/task.types';

// We can't easily test React component internal state in this environment without JSDOM/Enzyme.
// However, we can test the Validation Logic and the API Service safeguards which are the backbone.

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

console.log('\n=== Task-008 Tests: Form Validation ===\n');

// Test 1: TaskValidator detects empty text
try {
  const result = TaskValidator.validateTitle('');
  assert(result !== null && result.includes('required'), 'TaskValidator: Detects empty text');
} catch (e) { console.error(e); failCount++; }

// Test 2: TaskValidator detects long text
try {
  const longText = 'a'.repeat(101);
  const result = TaskValidator.validateTitle(longText);
  assert(result !== null && result.includes('exceed'), 'TaskValidator: Detects long text');
} catch (e) { console.error(e); failCount++; }

// Test 3: TaskValidator detects long description
try {
  const longDesc = 'a'.repeat(501);
  const result = TaskValidator.validateDescription(longDesc);
  assert(result !== null && result.includes('exceed'), 'TaskValidator: Detects long description');
} catch (e) { console.error(e); failCount++; }

// Test 4: TaskValidator validates Priority
try {
  // @ts-ignore
  const result = TaskValidator.validatePriority('TcEst');
  assert(result !== null, 'TaskValidator: Detects invalid priority');
} catch (e) { console.error(e); failCount++; }

// Test 5: apiService rejects invalid creation
try {
  await apiService.createTask('', Priority.MEDIUM)
    .then(() => {
      console.error('❌ apiService: Should have thrown error for empty text');
      failCount++;
    })
    .catch((e) => {
      assert(true, 'apiService: Rejects invalid submission');
    });
} catch (e) { console.error(e); failCount++; }

// Test 6: TaskValidator accepts valid data
try {
  const result = TaskValidator.validateCreate({
    text: 'Valid Task',
    priority: Priority.HIGH,
    description: 'Valid Desc'
  });
  assert(result === null, 'TaskValidator: Accepts valid data');
} catch (e) { console.error(e); failCount++; }

console.log(`\n${passCount}/${passCount + failCount} passed\n`);
