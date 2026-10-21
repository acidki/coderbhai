import { ArenaChallenge } from '../types';

export const INITIAL_QUESTION_BANK: ArenaChallenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    authorName: 'ByteSized Official',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. Print the indices separated by a space in ascending order.`,
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
        output: '0 1'
      },
      {
        id: 'ts-h2',
        input: '5 10\n1 4 5 6 9',
        output: '1 3'
      }
    ],
    starterTemplates: {
      python: `# Input format:
# Line 1: n target
# Line 2: array elements
line1 = input().split()
n = int(line1[0])
target = int(line1[1])
nums = list(map(int, input().split()))

# Write your solution below:
`,
      javascript: `// Input format:
// Line 1: n target
// Line 2: array elements
function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below:
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n, target;
    if (!(std::cin >> n >> target)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];

    // Write your solution below:
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[1000];
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }

    // Write your solution below:
    return 0;
}
`
    },
    hints: [
      'A brute force checks every pair in O(n^2). Can you use a hash map to remember previously seen numbers?',
      'Check if target - nums[i] already exists in your map. If so, you found your pair!'
    ],
    solutions: {
      python: `line1 = input().split()
n = int(line1[0])
target = int(line1[1])
nums = list(map(int, input().split()))

seen = {}
for i, num in enumerate(nums):
    diff = target - num
    if diff in seen:
        print(f"{seen[diff]} {i}")
        break
    seen[num] = i
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
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

int main() {
    int n, target;
    if (!(std::cin >> n >> target)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];

    std::unordered_map<int, int> seen;
    for (int i = 0; i < n; ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) {
            std::cout << seen[diff] << " " << i << std::endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[1000];
    for (int i = 0; i < n; ++i) {
        scanf("%d", &nums[i]);
    }

    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'reverse-string',
    title: 'Reverse String Words',
    slug: 'reverse-string',
    difficulty: 'easy',
    category: 'Strings',
    authorName: 'Ada Lovelace 👧',
    description: `Given a string \`s\`, reverse the characters of the entire string and print the reversed result.`,
    constraints: [
      '1 <= s.length <= 1000',
      's consists of printable ASCII characters.'
    ],
    sampleCases: [
      {
        id: 'rs-s1',
        input: 'hello',
        output: 'olleh',
        explanation: 'Reversing "hello" gives "olleh".'
      },
      {
        id: 'rs-s2',
        input: 'ByteSized',
        output: 'deziSetyB',
        explanation: 'Reversing "ByteSized" gives "deziSetyB".'
      }
    ],
    hiddenCases: [
      {
        id: 'rs-h1',
        input: 'algorithm',
        output: 'mhtirogla'
      },
      {
        id: 'rs-h2',
        input: 'racecar',
        output: 'racecar'
      }
    ],
    starterTemplates: {
      python: `s = input().strip()
# Write your solution below to print the reversed string:

`,
      javascript: `function solve(input) {
  const s = input.trim();
  // Write your solution below to print the reversed string:

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::cin >> s) {
        // Write your solution below to print the reversed string:

    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1024];
    if (scanf("%s", s) == 1) {
        // Write your solution below to print the reversed string:

    }
    return 0;
}
`
    },
    hints: [
      'Iterate backward from the end of the string, or use two pointers at opposite ends.',
      'In Python, string slicing s[::-1] provides an instant reversal.'
    ],
    solutions: {
      python: `s = input().strip()
print(s[::-1])
`,
      javascript: `function solve(input) {
  const s = input.trim();
  console.log(s.split('').reverse().join(''));
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

int main() {
    std::string s;
    if (std::cin >> s) {
        std::reverse(s.begin(), s.end());
        std::cout << s << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1024];
    if (scanf("%s", s) == 1) {
        int len = strlen(s);
        for (int i = len - 1; i >= 0; --i) {
            putchar(s[i]);
        }
        putchar('\\n');
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-02T00:00:00.000Z'
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number Checker',
    slug: 'palindrome-number',
    difficulty: 'easy',
    category: 'Math & Logic',
    authorName: 'ByteSized Official',
    description: `Given an integer \`x\`, print \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward. Negative numbers are never palindromes (e.g. -121 backward is 121-).`,
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
    sampleCases: [
      {
        id: 'pn-s1',
        input: '121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        id: 'pn-s2',
        input: '-121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      }
    ],
    hiddenCases: [
      {
        id: 'pn-h1',
        input: '10',
        output: 'false'
      },
      {
        id: 'pn-h2',
        input: '12321',
        output: 'true'
      }
    ],
    starterTemplates: {
      python: `x = input().strip()
# Write your solution below to print "true" or "false":

`,
      javascript: `function solve(input) {
  const str = input.trim();
  // Write your solution below to print "true" or "false":

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::cin >> s) {
        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    if (scanf("%s", s) == 1) {
        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`
    },
    hints: [
      'Negative numbers cannot be palindromes because the negative sign only appears on the left.',
      'Check whether the string representation reads identically from both ends.'
    ],
    solutions: {
      python: `x = input().strip()
if x.startswith('-'):
    print("false")
else:
    print("true" if x == x[::-1] else "false")
`,
      javascript: `function solve(input) {
  const str = input.trim();
  if (str.startsWith('-')) {
    console.log("false");
    return;
  }
  const rev = str.split('').reverse().join('');
  console.log(str === rev ? "true" : "false");
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

int main() {
    std::string s;
    if (std::cin >> s) {
        if (s[0] == '-') {
            std::cout << "false" << std::endl;
            return 0;
        }
        std::string rev = s;
        std::reverse(rev.begin(), rev.end());
        std::cout << (s == rev ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    if (scanf("%s", s) == 1) {
        if (s[0] == '-') {
            printf("false\\n");
            return 0;
        }
        int len = strlen(s);
        int isPal = 1;
        for (int i = 0; i < len / 2; ++i) {
            if (s[i] != s[len - 1 - i]) {
                isPal = 0;
                break;
            }
        }
        printf("%s\\n", isPal ? "true" : "false");
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-03T00:00:00.000Z'
  },
  {
    id: 'fizzbuzz-supreme',
    title: 'FizzBuzz Supreme',
    slug: 'fizzbuzz-supreme',
    difficulty: 'easy',
    category: 'Logic & Math',
    authorName: 'Lin 🕶️',
    description: `Given an integer \`n\`, print the numbers from 1 to \`n\` space-separated on a single line with the following replacements:
- For multiples of 3, replace the number with \`Fizz\`
- For multiples of 5, replace the number with \`Buzz\`
- For numbers which are multiples of both 3 and 5, replace with \`FizzBuzz\``,
    constraints: [
      '1 <= n <= 100'
    ],
    sampleCases: [
      {
        id: 'fb-s1',
        input: '5',
        output: '1 2 Fizz 4 Buzz',
        explanation: '3 is replaced by Fizz, 5 is replaced by Buzz.'
      },
      {
        id: 'fb-s2',
        input: '15',
        output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz',
        explanation: '15 is a multiple of both 3 and 5, so FizzBuzz is printed.'
      }
    ],
    hiddenCases: [
      {
        id: 'fb-h1',
        input: '3',
        output: '1 2 Fizz'
      },
      {
        id: 'fb-h2',
        input: '6',
        output: '1 2 Fizz 4 Buzz Fizz'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
# Write your solution below:

`,
      javascript: `function solve(input) {
  const n = parseInt(input.trim(), 10);
  // Write your solution below:

}
solve(stdin);
`,
      cpp: `#include <iostream>

int main() {
    int n;
    if (std::cin >> n) {
        // Write your solution below:

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        // Write your solution below:

    }
    return 0;
}
`
    },
    hints: [
      'Test for divisibility by 15 (both 3 and 5) first before testing 3 or 5 alone.',
      'Construct a list of tokens and join them with spaces when outputting.'
    ],
    solutions: {
      python: `n = int(input().strip())
res = []
for i in range(1, n + 1):
    if i % 15 == 0:
        res.append("FizzBuzz")
    elif i % 3 == 0:
        res.append("Fizz")
    elif i % 5 == 0:
        res.append("Buzz")
    else:
        res.append(str(i))
print(" ".join(res))
`,
      javascript: `function solve(input) {
  const n = parseInt(input.trim(), 10);
  const res = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) res.push("FizzBuzz");
    else if (i % 3 === 0) res.push("Fizz");
    else if (i % 5 === 0) res.push("Buzz");
    else res.push(String(i));
  }
  console.log(res.join(' '));
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    int n;
    if (std::cin >> n) {
        for (int i = 1; i <= n; ++i) {
            if (i % 15 == 0) std::cout << "FizzBuzz";
            else if (i % 3 == 0) std::cout << "Fizz";
            else if (i % 5 == 0) std::cout << "Buzz";
            else std::cout << i;
            if (i < n) std::cout << " ";
        }
        std::cout << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        for (int i = 1; i <= n; ++i) {
            if (i % 15 == 0) printf("FizzBuzz");
            else if (i % 3 == 0) printf("Fizz");
            else if (i % 5 == 0) printf("Buzz");
            else printf("%d", i);
            if (i < n) printf(" ");
        }
        printf("\\n");
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-04T00:00:00.000Z'
  },
  {
    id: 'fibonacci-number',
    title: 'N-th Fibonacci Number',
    slug: 'fibonacci-number',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    authorName: 'Alan Turing 🤖',
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`. That is:
- \`F(0) = 0\`, \`F(1) = 1\`
- \`F(n) = F(n - 1) + F(n - 2)\`, for \`n > 1\`.

Given \`n\`, calculate and print \`F(n)\`.`,
    constraints: [
      '0 <= n <= 30'
    ],
    sampleCases: [
      {
        id: 'fib-s1',
        input: '2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.'
      },
      {
        id: 'fib-s2',
        input: '4',
        output: '3',
        explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.'
      }
    ],
    hiddenCases: [
      {
        id: 'fib-h1',
        input: '0',
        output: '0'
      },
      {
        id: 'fib-h2',
        input: '10',
        output: '55'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
# Write your solution below to calculate and print F(n):

`,
      javascript: `function solve(input) {
  const n = parseInt(input.trim(), 10);
  // Write your solution below to calculate and print F(n):

}
solve(stdin);
`,
      cpp: `#include <iostream>

int main() {
    int n;
    if (std::cin >> n) {
        // Write your solution below to calculate and print F(n):

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        // Write your solution below to calculate and print F(n):

    }
    return 0;
}
`
    },
    hints: [
      'The base cases are F(0) = 0 and F(1) = 1.',
      'You can compute F(n) in O(n) time using two variables (a, b) to accumulate the sum.'
    ],
    solutions: {
      python: `n = int(input().strip())
if n <= 1:
    print(n)
else:
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    print(b)
`,
      javascript: `function solve(input) {
  const n = parseInt(input.trim(), 10);
  if (n <= 1) {
    console.log(n);
    return;
  }
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  console.log(b);
}
solve(stdin);
`,
      cpp: `#include <iostream>

int main() {
    int n;
    if (std::cin >> n) {
        if (n <= 1) {
            std::cout << n << std::endl;
            return 0;
        }
        int a = 0, b = 1;
        for (int i = 2; i <= n; ++i) {
            int c = a + b;
            a = b;
            b = c;
        }
        std::cout << b << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        if (n <= 1) {
            printf("%d\\n", n);
            return 0;
        }
        int a = 0, b = 1;
        for (int i = 2; i <= n; ++i) {
            int c = a + b;
            a = b;
            b = c;
        }
        printf("%d\\n", b);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'medium',
    category: 'Stack',
    authorName: 'ByteSized Official',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if valid, else \`false\`.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: ()[]{}'
    ],
    sampleCases: [
      {
        id: 'vp-s1',
        input: '()[]{}',
        output: 'true',
        explanation: 'All brackets match in correct order.'
      },
      {
        id: 'vp-s2',
        input: '(]',
        output: 'false',
        explanation: 'Round bracket cannot be closed by square bracket.'
      }
    ],
    hiddenCases: [
      {
        id: 'vp-h1',
        input: '([{}])',
        output: 'true'
      },
      {
        id: 'vp-h2',
        input: '([)]',
        output: 'false'
      }
    ],
    starterTemplates: {
      python: `s = input().strip()
# Write your solution below to print "true" or "false":

`,
      javascript: `function solve(input) {
  const s = input.trim();
  // Write your solution below to print "true" or "false":

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::cin >> s) {
        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1000];
    if (scanf("%s", s) == 1) {
        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`
    },
    hints: [
      'A Last-In-First-Out (LIFO) stack is well suited for nested bracket structures.',
      'Push open brackets onto the stack. On each closing bracket, pop from the stack and verify that it matches.'
    ],
    solutions: {
      python: `s = input().strip()
stack = []
mapping = {')': '(', '}': '{', ']': '['}

valid = True
for char in s:
    if char in mapping:
        top = stack.pop() if stack else '#'
        if mapping[char] != top:
            valid = False
            break
    else:
        stack.append(char)

if valid and not stack:
    print("true")
else:
    print("false")
`,
      javascript: `function solve(input) {
  const s = input.trim();
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  let valid = true;

  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) {
        valid = false;
        break;
      }
    } else {
      stack.push(char);
    }
  }

  console.log(valid && stack.length === 0 ? "true" : "false");
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>
#include <stack>

int main() {
    std::string s;
    if (std::cin >> s) {
        std::stack<char> st;
        bool valid = true;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) { valid = false; break; }
                char top = st.top(); st.pop();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    valid = false;
                    break;
                }
            }
        }
        std::cout << (valid && st.empty() ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1000];
    if (scanf("%s", s) == 1) {
        char stack[1000];
        int top = -1;
        int valid = 1;
        int len = strlen(s);

        for (int i = 0; i < len; ++i) {
            char c = s[i];
            if (c == '(' || c == '{' || c == '[') {
                stack[++top] = c;
            } else {
                if (top == -1) { valid = 0; break; }
                char t = stack[top--];
                if ((c == ')' && t != '(') ||
                    (c == '}' && t != '{') ||
                    (c == ']' && t != '[')) {
                    valid = 0;
                    break;
                }
            }
        }
        printf("%s\\n", (valid && top == -1) ? "true" : "false");
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-06T00:00:00.000Z'
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane)',
    slug: 'max-subarray',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    authorName: 'Lin 🕶️',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and print its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 <= nums[i] <= 10^4'
    ],
    sampleCases: [
      {
        id: 'ms-s1',
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.'
      },
      {
        id: 'ms-s2',
        input: '1\n1',
        output: '1',
        explanation: 'Single element subarray [1] has sum 1.'
      }
    ],
    hiddenCases: [
      {
        id: 'ms-h1',
        input: '5\n5 4 -1 7 8',
        output: '23'
      },
      {
        id: 'ms-h2',
        input: '3\n-5 -2 -3',
        output: '-2'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
nums = list(map(int, input().split()))

# Write your solution below to find and print the maximum subarray sum:

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below to find and print the maximum subarray sum:

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> nums(n);
        for (int i = 0; i < n; ++i) std::cin >> nums[i];

        // Write your solution below to find and print the maximum subarray sum:

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int nums[1000];
        for (int i = 0; i < n; ++i) scanf("%d", &nums[i]);

        // Write your solution below to find and print the maximum subarray sum:

    }
    return 0;
}
`
    },
    hints: [
      'Kadane\'s algorithm keeps track of the maximum sum ending at the current position.',
      'At each element x, decide whether to add x to the running sum (current + x) or start a new subarray at x.'
    ],
    solutions: {
      python: `n = int(input().strip())
nums = list(map(int, input().split()))

max_sum = nums[0]
current = nums[0]

for x in nums[1:]:
    current = max(x, current + x)
    max_sum = max(max_sum, current)

print(max_sum)
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  let current = nums[0];
  let maxSoFar = nums[0];

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    maxSoFar = Math.max(maxSoFar, current);
  }

  console.log(maxSoFar);
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> nums(n);
        for (int i = 0; i < n; ++i) std::cin >> nums[i];

        int current = nums[0], maxSoFar = nums[0];
        for (size_t i = 1; i < nums.size(); ++i) {
            current = std::max(nums[i], current + nums[i]);
            maxSoFar = std::max(maxSoFar, current);
        }
        std::cout << maxSoFar << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int nums[1000];
        for (int i = 0; i < n; ++i) scanf("%d", &nums[i]);

        int current = nums[0];
        int maxSoFar = nums[0];
        for (int i = 1; i < n; ++i) {
            current = (nums[i] > current + nums[i]) ? nums[i] : (current + nums[i]);
            if (current > maxSoFar) maxSoFar = current;
        }
        printf("%d\\n", maxSoFar);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-07T00:00:00.000Z'
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'easy',
    category: 'Algorithms',
    authorName: 'ByteSized Official',
    description: `Given a sorted array of \`n\` integers and a \`target\` value, search for \`target\` in \`nums\`. If \`target\` exists, print its 0-based index. Otherwise, print \`-1\`.`,
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 <= nums[i], target <= 10^4',
      'nums is sorted in ascending order.'
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
        explanation: '2 does not exist in nums so print -1.'
      }
    ],
    hiddenCases: [
      {
        id: 'bs-h1',
        input: '1 5\n5',
        output: '0'
      },
      {
        id: 'bs-h2',
        input: '5 100\n1 2 3 4 5',
        output: '-1'
      }
    ],
    starterTemplates: {
      python: `line1 = input().split()
n = int(line1[0])
target = int(line1[1])
nums = list(map(int, input().split()))

# Write your solution below to search for target:

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below to search for target:

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n, target;
    if (!(std::cin >> n >> target)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];

    // Write your solution below to search for target:

    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[10000];
    for (int i = 0; i < n; ++i) scanf("%d", &nums[i]);

    // Write your solution below to search for target:

    return 0;
}
`
    },
    hints: [
      'Since the array is sorted, comparing target with the middle element halves your search space.',
      'Compute mid = low + (high - low) // 2 and narrow the range to the left or right half.'
    ],
    solutions: {
      python: `line1 = input().split()
n = int(line1[0])
target = int(line1[1])
nums = list(map(int, input().split()))

left, right = 0, n - 1
ans = -1

while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        ans = mid
        break
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

print(ans)
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const [n, target] = lines[0].trim().split(/\\s+/).map(Number);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  let left = 0, right = n - 1;
  let ans = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      ans = mid;
      break;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  console.log(ans);
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n, target;
    if (std::cin >> n >> target) {
        std::vector<int> nums(n);
        for (int i = 0; i < n; ++i) std::cin >> nums[i];

        int left = 0, right = n - 1;
        int ans = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                ans = mid;
                break;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        std::cout << ans << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) == 2) {
        int nums[1000];
        for (int i = 0; i < n; ++i) scanf("%d", &nums[i]);

        int left = 0, right = n - 1;
        int ans = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                ans = mid;
                break;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        printf("%d\\n", ans);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-08T00:00:00.000Z'
  }
];
