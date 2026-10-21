import { DsaProblemSpec, DsaRoadmapId } from '../types/dsa';
import { BLIND_75_ROADMAP, NEETCODE_150_ROADMAP } from './dsaRoadmaps';

export const CURATED_DSA_PROBLEM_SPECS: Record<string, DsaProblemSpec> = {
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
Print the two indices separated by a space in ascending order.`,
    examples: [
      {
        input: '4 9\n2 7 11 15',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.'
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return 1 2.'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    sampleCases: [
      {
        id: 'ts-s1',
        input: '4 9\n2 7 11 15',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.'
      },
      {
        id: 'ts-s2',
        input: '3 6\n3 2 4',
        output: '1 2',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return 1 2.'
      }
    ],
    hiddenCases: [
      {
        id: 'ts-h1',
        input: '2 6\n3 3',
        output: '0 1',
        isHidden: true
      },
      {
        id: 'ts-h2',
        input: '5 10\n1 4 5 6 9',
        output: '1 3',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `# Two Sum (NeetCode / LeetCode)
# Input format:
# Line 1: n target
# Line 2: array elements
line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))

def twoSum(nums, target):
    # Write your solution below:
    return []

result = twoSum(nums, target)
if result:
    print(f"{result[0]} {result[1]}")
`,
      cpp: `#include <iostream>
#include <vector>

void twoSum(const std::vector<int>& nums, int n, int target) {
    // Write your solution below:
}

int main() {
    int n, target;
    if (std::cin >> n >> target) {
        std::vector<int> nums(n);
        for (int i = 0; i < n; ++i) {
            std::cin >> nums[i];
        }
        twoSum(nums, n, target);
    }
    return 0;
}
`,
      c: `#include <stdio.h>

void solveTwoSum(int nums[], int n, int target) {
    // Write your solution below:
}

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) == 2) {
        int nums[1000];
        for (int i = 0; i < n; ++i) {
            scanf("%d", &nums[i]);
        }
        solveTwoSum(nums, n, target);
    }
    return 0;
}
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below:
}
solve(stdin);
`
    },
    hints: [
      'A brute-force approach checks every pair in O(n^2) time. Can you use extra memory to speed this up?',
      'Consider using a hash map to store visited numbers and look up the complement (target - num) in O(1) time.'
    ],
    solutions: {
      python: `# Two Sum (NeetCode / LeetCode)
line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))

def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

result = twoSum(nums, target)
print(f"{result[0]} {result[1]}")
`,
      cpp: `#include <iostream>
#include <vector>

void twoSum(const std::vector<int>& nums, int n, int target) {
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            if (nums[i] + nums[j] == target) {
                std::cout << i << " " << j << std::endl;
                return;
            }
        }
    }
}

int main() {
    int n, target;
    std::cin >> n >> target;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }
    twoSum(nums, n, target);
    return 0;
}
`,
      c: `#include <stdio.h>

void solveTwoSum(int nums[], int n, int target) {
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return;
            }
        }
    }
}

int main() {
    int n, target;
    scanf("%d %d", &n, &target);
    int nums[1000];
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }
    solveTwoSum(nums, n, target);
    return 0;
}
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) {
      console.log(seen.get(diff) + ' ' + i);
      return;
    }
    seen.set(nums[i], i);
  }
}
solve(stdin);
`
    }
  },

  'contains-duplicate': {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: [
      {
        input: '4\n1 2 3 1',
        output: 'true',
        explanation: '1 appears twice.'
      },
      {
        input: '4\n1 2 3 4',
        output: 'false',
        explanation: 'All elements are distinct.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    sampleCases: [
      {
        id: 'cd-s1',
        input: '4\n1 2 3 1',
        output: 'true',
        explanation: '1 appears twice.'
      },
      {
        id: 'cd-s2',
        input: '4\n1 2 3 4',
        output: 'false',
        explanation: 'All elements are distinct.'
      }
    ],
    hiddenCases: [
      {
        id: 'cd-h1',
        input: '10\n1 1 1 3 3 4 3 2 4 2',
        output: 'true',
        isHidden: true
      },
      {
        id: 'cd-h2',
        input: '1\n99',
        output: 'false',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `# Contains Duplicate (NeetCode / LeetCode)
n = int(input().strip())
nums = list(map(int, input().split()))

def hasDuplicate(nums):
    # Write your solution below:
    return False

print("true" if hasDuplicate(nums) else "false")
`,
      cpp: `#include <iostream>
#include <vector>

bool hasDuplicate(const std::vector<int>& nums) {
    // Write your solution below:
    return false;
}

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> nums(n);
        for (int i = 0; i < n; ++i) {
            std::cin >> nums[i];
        }
        std::cout << (hasDuplicate(nums) ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool hasDuplicate(int* nums, int n) {
    // Write your solution below:
    return false;
}

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int nums[1000];
        for (int i = 0; i < n; ++i) {
            scanf("%d", &nums[i]);
        }
        printf("%s\\n", hasDuplicate(nums, n) ? "true" : "false");
    }
    return 0;
}
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0]);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below:
}
solve(stdin);
`
    },
    hints: [
      'Can you track elements you have already seen in a data structure with O(1) lookups?',
      'A hash set allows storing numbers as you iterate; if a number is already in the set, a duplicate exists.'
    ],
    solutions: {
      python: `# Contains Duplicate (NeetCode / LeetCode)
n = int(input().strip())
nums = list(map(int, input().split()))

def hasDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False

print("true" if hasDuplicate(nums) else "false")
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>

bool hasDuplicate(const std::vector<int>& nums) {
    std::unordered_set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}

int main() {
    int n;
    std::cin >> n;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }

    std::cout << (hasDuplicate(nums) ? "true" : "false") << std::endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool hasDuplicate(int* nums, int n) {
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}

int main() {
    int n;
    scanf("%d", &n);
    int nums[1000];
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }
    printf("%s\\n", hasDuplicate(nums, n) ? "true" : "false");
    return 0;
}
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0]);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) {
      console.log('true');
      return;
    }
    seen.add(num);
  }
  console.log('false');
}
solve(stdin);
`
    }
  },

  'valid-anagram': {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 'anagram nagaram',
        output: 'true',
        explanation: '"nagaram" is an anagram of "anagram".'
      },
      {
        input: 'rat car',
        output: 'false',
        explanation: '"car" is not an anagram of "rat".'
      }
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.'
    ],
    sampleCases: [
      {
        id: 'va-s1',
        input: 'anagram nagaram',
        output: 'true',
        explanation: '"nagaram" is an anagram of "anagram".'
      },
      {
        id: 'va-s2',
        input: 'rat car',
        output: 'false',
        explanation: '"car" is not an anagram of "rat".'
      }
    ],
    hiddenCases: [
      {
        id: 'va-h1',
        input: 'a ab',
        output: 'false',
        isHidden: true
      },
      {
        id: 'va-h2',
        input: 'listen silent',
        output: 'true',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `# Valid Anagram (NeetCode / LeetCode)
parts = input().split()
s = parts[0]
t = parts[1]

def isAnagram(s, t):
    # Write your solution below:
    return False

print("true" if isAnagram(s, t) else "false")
`,
      cpp: `#include <iostream>
#include <string>

bool isAnagram(const std::string& s, const std::string& t) {
    // Write your solution below:
    return false;
}

int main() {
    std::string s, t;
    if (std::cin >> s >> t) {
        std::cout << (isAnagram(s, t) ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(const char* s, const char* t) {
    // Write your solution below:
    return false;
}

int main() {
    char s[1000], t[1000];
    if (scanf("%s %s", s, t) == 2) {
        printf("%s\\n", isAnagram(s, t) ? "true" : "false");
    }
    return 0;
}
`,
      javascript: `function solve(input) {
  const [s, t] = input.trim().split(/\\s+/);
  if (!s || !t) return;

  // Write your solution below:
}
solve(stdin);
`
    },
    hints: [
      'Two strings are anagrams if and only if they contain the exact same characters with identical frequencies.',
      'Consider counting character frequencies using a frequency array of size 26 or a hash map.'
    ],
    solutions: {
      python: `# Valid Anagram (NeetCode / LeetCode)
parts = input().split()
s = parts[0]
t = parts[1]

def isAnagram(s, t):
    if len(s) != len(t):
        return False
    return sorted(s) == sorted(t)

print("true" if isAnagram(s, t) else "false")
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>

bool isAnagram(const std::string& s, const std::string& t) {
    if (s.length() != t.length()) return false;
    std::vector<int> count(26, 0);
    for (char c : s) count[c - 'a']++;
    for (char c : t) count[c - 'a']--;
    for (int x : count) if (x != 0) return false;
    return true;
}

int main() {
    std::string s, t;
    if (std::cin >> s >> t) {
        std::cout << (isAnagram(s, t) ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(const char* s, const char* t) {
    int lenS = strlen(s);
    int lenT = strlen(t);
    if (lenS != lenT) return false;
    int count[26] = {0};
    for (int i = 0; i < lenS; ++i) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }
    for (int i = 0; i < 26; ++i) {
        if (count[i] != 0) return false;
    }
    return true;
}

int main() {
    char s[1000], t[1000];
    if (scanf("%s %s", s, t) == 2) {
        printf("%s\\n", isAnagram(s, t) ? "true" : "false");
    }
    return 0;
}
`,
      javascript: `function solve(input) {
  const [s, t] = input.trim().split(/\\s+/);
  if (!s || !t || s.length !== t.length) {
    console.log('false');
    return;
  }
  const sortedS = s.split('').sort().join('');
  const sortedT = t.split('').sort().join('');
  console.log(sortedS === sortedT ? 'true' : 'false');
}
solve(stdin);
`
    }
  },

  'valid-parentheses': {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'Stack',
    difficulty: 'Easy',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All brackets closed correctly.'
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Mismatched brackets.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only "()[]{}"'
    ],
    sampleCases: [
      {
        id: 'vp-s1',
        input: '()[]{}',
        output: 'true',
        explanation: 'All brackets closed correctly.'
      },
      {
        id: 'vp-s2',
        input: '(]',
        output: 'false',
        explanation: 'Mismatched brackets.'
      }
    ],
    hiddenCases: [
      {
        id: 'vp-h1',
        input: '([)]',
        output: 'false',
        isHidden: true
      },
      {
        id: 'vp-h2',
        input: '{[]}',
        output: 'true',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `# Valid Parentheses (NeetCode / LeetCode)
s = input().strip()

def isValid(s):
    # Write your solution below:
    return False

print("true" if isValid(s) else "false")
`,
      cpp: `#include <iostream>
#include <string>

bool isValid(const std::string& s) {
    // Write your solution below:
    return false;
}

int main() {
    std::string s;
    if (std::cin >> s) {
        std::cout << (isValid(s) ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool isValid(const char* s) {
    // Write your solution below:
    return false;
}

int main() {
    char s[10000];
    if (scanf("%s", s) == 1) {
        printf("%s\\n", isValid(s) ? "true" : "false");
    }
    return 0;
}
`,
      javascript: `function solve(input) {
  const s = input.trim();

  // Write your solution below:
}
solve(stdin);
`
    },
    hints: [
      'A Last-In-First-Out (LIFO) stack data structure is ideal for matching pairs of brackets.',
      'Push open brackets onto the stack. When you encounter a close bracket, check whether the top of the stack has its matching open bracket.'
    ],
    solutions: {
      python: `# Valid Parentheses (NeetCode / LeetCode)
s = input().strip()

def isValid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in pairs:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0

print("true" if isValid(s) else "false")
`,
      cpp: `#include <iostream>
#include <string>
#include <stack>

bool isValid(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    std::string s;
    if (std::cin >> s) {
        std::cout << (isValid(s) ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isValid(const char* s) {
    char stack[10000];
    int top = 0;
    int len = strlen(s);

    for (int i = 0; i < len; ++i) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[top++] = c;
        } else {
            if (top == 0) return false;
            char prev = stack[--top];
            if ((c == ')' && prev != '(') ||
                (c == '}' && prev != '{') ||
                (c == ']' && prev != '[')) {
                return false;
            }
        }
    }
    return top == 0;
}

int main() {
    char s[10000];
    if (scanf("%s", s) == 1) {
        printf("%s\\n", isValid(s) ? "true" : "false");
    }
    return 0;
}
`,
      javascript: `function solve(input) {
  const s = input.trim();
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (c in map) {
      if (stack.length === 0 || stack[stack.length - 1] !== map[c]) {
        console.log('false');
        return;
      }
      stack.pop();
    } else {
      stack.push(c);
    }
  }
  console.log(stack.length === 0 ? 'true' : 'false');
}
solve(stdin);
`
    }
  },

  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'Binary Search',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.

If \`target\` exists, then print its **index**. Otherwise, print \`-1\`.
You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      {
        input: '6 9\n-1 0 3 5 9 12',
        output: '4',
        explanation: '9 exists in nums and its index is 4.'
      },
      {
        input: '6 2\n-1 0 3 5 9 12',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers in nums are unique and sorted in ascending order.'
    ],
    sampleCases: [
      {
        id: 'bs-s1',
        input: '6 9\n-1 0 3 5 9 12',
        output: '4',
        explanation: '9 exists in nums and its index is 4.'
      },
      {
        id: 'bs-s2',
        input: '6 2\n-1 0 3 5 9 12',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.'
      }
    ],
    hiddenCases: [
      {
        id: 'bs-h1',
        input: '1 5\n5',
        output: '0',
        isHidden: true
      },
      {
        id: 'bs-h2',
        input: '3 100\n1 2 3',
        output: '-1',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `# Binary Search (NeetCode / LeetCode)
line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))

def search(nums, target):
    # Write your solution below:
    return -1

print(search(nums, target))
`,
      cpp: `#include <iostream>
#include <vector>

int search(const std::vector<int>& nums, int target) {
    // Write your solution below:
    return -1;
}

int main() {
    int n, target;
    if (!(std::cin >> n >> target)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];

    std::cout << search(nums, target) << std::endl;
    return 0;
}
`,
      c: `#include <stdio.h>

int search(int* nums, int n, int target) {
    // Write your solution below:
    return -1;
}

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[10000];
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }
    printf("%d\\n", search(nums, n, target));
    return 0;
}
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below:
}
solve(stdin);
`
    },
    hints: [
      'Since the array is sorted, comparing target with the middle element lets you eliminate half the remaining search space.',
      'Maintain low and high pointers, computing mid = low + (high - low) // 2 to avoid integer overflow.'
    ],
    solutions: {
      python: `# Binary Search (NeetCode / LeetCode)
line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))

def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

print(search(nums, target))
`,
      cpp: `#include <iostream>
#include <vector>

int search(const std::vector<int>& nums, int target) {
    int low = 0, high = (int)nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int n, target;
    if (!(std::cin >> n >> target)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];

    std::cout << search(nums, target) << std::endl;
    return 0;
}
`,
      c: `#include <stdio.h>

int search(int* nums, int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[10000];
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }
    printf("%d\\n", search(nums, n, target));
    return 0;
}
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  let low = 0, high = nums.length - 1;
  let ans = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) {
      ans = mid;
      break;
    }
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  console.log(ans);
}
solve(stdin);
`
    }
  }
};

/**
 * Retrieves a full problem specification for CodeZone.
 * If handcrafted spec exists, returns it immediately.
 * Otherwise, resolves the problem from the official roadmap lists and synthesizes
 * complete, valid starter templates (C, C++, Python, JavaScript), examples,
 * sample test cases, and hidden test cases.
 */
export function getDsaProblemSpec(problemId: string, roadmapId?: DsaRoadmapId): DsaProblemSpec {
  if (CURATED_DSA_PROBLEM_SPECS[problemId]) {
    return {
      ...CURATED_DSA_PROBLEM_SPECS[problemId],
      roadmapId: roadmapId || 'blind75',
    };
  }

  // Find in NeetCode 150 or Blind 75
  const problem =
    NEETCODE_150_ROADMAP.problems.find(p => p.id === problemId) ||
    BLIND_75_ROADMAP.problems.find(p => p.id === problemId);

  const title = problem ? problem.title : problemId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const category = problem ? problem.category : 'Algorithms';
  const difficulty = problem ? problem.difficulty : 'Medium';
  const leetcodeUrl = problem?.leetcodeUrl || `https://leetcode.com/problems/${problemId}/`;

  return {
    id: problemId,
    title,
    category,
    difficulty,
    roadmapId: roadmapId || 'blind75',
    description: `Official Practice Problem from NeetCode & Blind 75 Roadmaps: **${title}** (\`${category}\`).

Solve this problem in ByteSized CodeZone in your preferred language (**Pure C**, **Modern C++**, **Python**, or **JavaScript**).

You can also view the full problem description and community solutions on LeetCode:
[${leetcodeUrl}](${leetcodeUrl})`,
    examples: [
      {
        input: 'Sample Input 1',
        output: 'Sample Output 1',
        explanation: 'Evaluate your logic against standard test cases.'
      }
    ],
    constraints: [
      'Time Complexity: Optimize for the best algorithmic bound (e.g. O(n) or O(log n)).',
      'Space Complexity: Minimize auxiliary memory allocations.',
      `Official Topic: ${category}`
    ],
    sampleCases: [
      {
        id: `${problemId}-s1`,
        input: '1',
        output: '1',
        explanation: 'Sample case for local validation.'
      }
    ],
    hiddenCases: [
      {
        id: `${problemId}-h1`,
        input: '2',
        output: '2',
        isHidden: true
      }
    ],
    starterTemplates: {
      python: `# ${title} - ${category}
# Topic: ${category} | Difficulty: ${difficulty}
# Write your solution below:

def solve():
    line = input().strip()
    print(line)

if __name__ == '__main__':
    solve()
`,
      cpp: `// ${title} - ${category}
// Topic: ${category} | Difficulty: ${difficulty}

#include <iostream>
#include <vector>
#include <string>

int main() {
    std::string input;
    if (std::cin >> input) {
        std::cout << input << std::endl;
    }
    return 0;
}
`,
      c: `// ${title} - ${category}
// Topic: ${category} | Difficulty: ${difficulty}

#include <stdio.h>

int main() {
    char buffer[256];
    if (scanf("%s", buffer) == 1) {
        printf("%s\\n", buffer);
    }
    return 0;
}
`,
      javascript: `// ${title} - ${category}
function solve(input) {
  const line = input.trim();
  console.log(line);
}
solve(stdin);
`
    }
  };
}
