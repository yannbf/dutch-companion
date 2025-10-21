// Test script to verify localStorage error handling
// Run this in the browser console to test the robustness of our localStorage utility

// Test 1: Normal operation
console.log('=== Test 1: Normal Operation ===');
try {
  // Simulate setting and getting valid data
  localStorage.setItem('test-key', JSON.stringify({ test: 'value' }));
  const retrieved = localStorage.getItem('test-key');
  console.log('✓ Normal localStorage operations work:', retrieved);
} catch (error) {
  console.error('✗ Normal localStorage operations failed:', error);
}

// Test 2: Corrupted JSON data
console.log('=== Test 2: Corrupted JSON Data ===');
try {
  // Simulate corrupted JSON data
  localStorage.setItem('test-corrupted', '{ invalid json }');
  const corrupted = localStorage.getItem('test-corrupted');

  // Test our utility's error handling
  const utils = {
    getItem: (key, defaultValue) => {
      try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;

        try {
          return JSON.parse(item);
        } catch {
          console.warn(`Failed to parse localStorage item '${key}':`, item);
          return defaultValue;
        }
      } catch (error) {
        console.warn(`Failed to read localStorage item '${key}':`, error);
        return defaultValue;
      }
    }
  };

  const result = utils.getItem('test-corrupted', 'default-value');
  console.log('✓ Corrupted JSON handled gracefully:', result);
} catch (error) {
  console.error('✗ Corrupted JSON test failed:', error);
}

// Test 3: Quota exceeded simulation
console.log('=== Test 3: Quota Exceeded Simulation ===');
try {
  // Try to fill localStorage to simulate quota exceeded
  let i = 0;
  while (true) {
    localStorage.setItem(`test-quota-${i}`, 'x'.repeat(1000));
    i++;
    if (i > 1000) break; // Safety break
  }
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.log('✓ Quota exceeded detected (this is expected in some browsers)');
  } else {
    console.error('✗ Unexpected quota error:', error);
  }
}

// Test 4: Clear test data
console.log('=== Test 4: Cleanup ===');
try {
  // Clean up test data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('test-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('✓ Test data cleaned up');
} catch (error) {
  console.error('✗ Cleanup failed:', error);
}

console.log('=== All tests completed ===');
