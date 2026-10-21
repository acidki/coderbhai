import { ArenaChallenge } from '../types';

export const NEETCODE_PROBLEMS: ArenaChallenge[] = [
  {
    id: 'nc-contains-duplicate',
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `Given an integer array \`nums\`, print \`true\` if any value appears **at least twice** in the array, and print \`false\` if every element is distinct.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    sampleCases: [
      {
        id: 'cd-s1',
        input: '4\n1 2 3 1',
        output: 'true',
        explanation: '1 appears twice at indices 0 and 3.'
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
        output: 'true'
      },
      {
        id: 'cd-h2',
        input: '1\n99',
        output: 'false'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
nums = list(map(int, input().split()))

# Write your solution below to print "true" or "false":

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below to print "true" or "false":

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (std::cin >> n) {
        // Write your solution below to print "true" or "false":

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

        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`
    },
    hints: [
      'Can you record elements you have already seen in a data structure with fast lookups?',
      'Using a hash set allows checking if a number was already seen in O(1) time.'
    ],
    solutions: {
      python: `n = int(input().strip())
nums = list(map(int, input().split()))

seen = set()
dup = False
for x in nums:
    if x in seen:
        dup = True
        break
    seen.add(x)

print("true" if dup else "false")
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) {
      console.log("true");
      return;
    }
    seen.add(x);
  }
  console.log("false");
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>

int main() {
    int n;
    if (std::cin >> n) {
        std::unordered_set<int> seen;
        bool dup = false;
        for (int i = 0; i < n; ++i) {
            int x; std::cin >> x;
            if (seen.count(x)) dup = true;
            seen.insert(x);
        }
        std::cout << (dup ? "true" : "false") << std::endl;
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

        int dup = 0;
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                if (nums[i] == nums[j]) {
                    dup = 1;
                    break;
                }
            }
            if (dup) break;
        }
        printf("%s\\n", dup ? "true" : "false");
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-valid-anagram',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `Given two strings \`s\` and \`t\`, print \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.'
    ],
    sampleCases: [
      {
        id: 'va-s1',
        input: 'anagram\nnagaram',
        output: 'true',
        explanation: 'Both contain 3 a\'s, 1 g, 1 m, 1 n, 1 r.'
      },
      {
        id: 'va-s2',
        input: 'rat\ncar',
        output: 'false',
        explanation: '"rat" and "car" have different letters.'
      }
    ],
    hiddenCases: [
      {
        id: 'va-h1',
        input: 'listen\nsilent',
        output: 'true'
      },
      {
        id: 'va-h2',
        input: 'a\nab',
        output: 'false'
      }
    ],
    starterTemplates: {
      python: `s = input().strip()
t = input().strip()
# Write your solution below to print "true" or "false":

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const s = lines[0].trim();
  const t = lines[1].trim();
  // Write your solution below to print "true" or "false":

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    std::string s, t;
    if (std::cin >> s >> t) {
        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1024], t[1024];
    if (scanf("%s %s", s, t) == 2) {
        // Write your solution below to print "true" or "false":

    }
    return 0;
}
`
    },
    hints: [
      'Two strings are anagrams if their sorted characters are identical.',
      'You can also count the occurrences of each character using a frequency table.'
    ],
    solutions: {
      python: `s = input().strip()
t = input().strip()
print("true" if sorted(s) == sorted(t) else "false")
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const s = lines[0].trim();
  const t = lines[1].trim();
  const sSorted = s.split('').sort().join('');
  const tSorted = t.split('').sort().join('');
  console.log(sSorted === tSorted ? "true" : "false");
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

int main() {
    std::string s, t;
    if (std::cin >> s >> t) {
        std::sort(s.begin(), s.end());
        std::sort(t.begin(), t.end());
        std::cout << (s == t ? "true" : "false") << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1024], t[1024];
    if (scanf("%s %s", s, t) == 2) {
        int count[256] = {0};
        int lenS = strlen(s), lenT = strlen(t);
        if (lenS != lenT) {
            printf("false\\n");
            return 0;
        }
        for (int i = 0; i < lenS; ++i) {
            count[(unsigned char)s[i]]++;
            count[(unsigned char)t[i]]--;
        }
        int ok = 1;
        for (int i = 0; i < 256; ++i) {
            if (count[i] != 0) { ok = 0; break; }
        }
        printf("%s\\n", ok ? "true" : "false");
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'easy',
    category: 'Sliding Window',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Print the maximum profit you can achieve. If you cannot achieve any profit, print \`0\`.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    sampleCases: [
      {
        id: 'stock-s1',
        input: '6\n7 1 5 3 6 4',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.'
      },
      {
        id: 'stock-s2',
        input: '5\n7 6 4 3 1',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    hiddenCases: [
      {
        id: 'stock-h1',
        input: '2\n2 4',
        output: '2'
      },
      {
        id: 'stock-h2',
        input: '4\n3 2 6 50',
        output: '48'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
prices = list(map(int, input().split()))

# Write your solution below to print the maximum profit:

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const prices = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below to print the maximum profit:

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> prices(n);
        for (int i = 0; i < n; ++i) std::cin >> prices[i];

        // Write your solution below to print the maximum profit:

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int prices[1000];
        for (int i = 0; i < n; ++i) scanf("%d", &prices[i]);

        // Write your solution below to print the maximum profit:

    }
    return 0;
}
`
    },
    hints: [
      'Keep track of the minimum price encountered so far as you iterate through the days.',
      'At each day, the potential profit is prices[i] - min_price. Update max_profit accordingly.'
    ],
    solutions: {
      python: `n = int(input().strip())
prices = list(map(int, input().split()))

min_price = float('inf')
max_profit = 0

for p in prices:
    if p < min_price:
        min_price = p
    elif p - min_price > max_profit:
        max_profit = p - min_price

print(max_profit)
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const prices = lines[1].trim().split(/\\s+/).map(Number);

  let minPrice = Infinity;
  let maxProfit = 0;

  for (const p of prices) {
    if (p < minPrice) minPrice = p;
    else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
  }
  console.log(maxProfit);
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n;
    if (std::cin >> n) {
        int minPrice = 1e9, maxProfit = 0;
        for (int i = 0; i < n; ++i) {
            int p; std::cin >> p;
            if (p < minPrice) minPrice = p;
            else maxProfit = std::max(maxProfit, p - minPrice);
        }
        std::cout << maxProfit << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int minPrice = 1000000000, maxProfit = 0;
        for (int i = 0; i < n; ++i) {
            int p; scanf("%d", &p);
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        printf("%d\\n", maxProfit);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-longest-substring-k',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'medium',
    category: 'Sliding Window',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters and print its length.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    sampleCases: [
      {
        id: 'ls-s1',
        input: 'abcabcbb',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        id: 'ls-s2',
        input: 'bbbbb',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    hiddenCases: [
      {
        id: 'ls-h1',
        input: 'pwwkew',
        output: '3'
      },
      {
        id: 'ls-h2',
        input: 'au',
        output: '2'
      }
    ],
    starterTemplates: {
      python: `s = input().strip()
# Write your solution below to print the length of the longest substring without repeating characters:

`,
      javascript: `function solve(input) {
  const s = input.trim();
  // Write your solution below to print the length of the longest substring without repeating characters:

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>

int main() {
    std::string s;
    if (std::cin >> s) {
        // Write your solution below to print the length of the longest substring without repeating characters:

    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1024];
    if (scanf("%s", s) == 1) {
        // Write your solution below to print the length of the longest substring without repeating characters:

    }
    return 0;
}
`
    },
    hints: [
      'Use a sliding window with two pointers (left and right) and a hash map tracking character positions.',
      'When you see a repeated character, slide the left pointer past its previous occurrence.'
    ],
    solutions: {
      python: `s = input().strip()
char_map = {}
left = 0
max_len = 0

for right, ch in enumerate(s):
    if ch in char_map and char_map[ch] >= left:
        left = char_map[ch] + 1
    char_map[ch] = right
    max_len = max(max_len, right - left + 1)

print(max_len)
`,
      javascript: `function solve(input) {
  const s = input.trim();
  const map = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  console.log(maxLen);
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

int main() {
    std::string s;
    if (std::cin >> s) {
        std::unordered_map<char, int> map;
        int left = 0, maxLen = 0;
        for (int right = 0; right < (int)s.length(); ++right) {
            char c = s[right];
            if (map.count(c) && map[c] >= left) {
                left = map[c] + 1;
            }
            map[c] = right;
            maxLen = std::max(maxLen, right - left + 1);
        }
        std::cout << maxLen << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[1024];
    if (scanf("%s", s) == 1) {
        int last[256];
        for (int i = 0; i < 256; ++i) last[i] = -1;
        int left = 0, maxLen = 0;
        int len = strlen(s);

        for (int right = 0; right < len; ++right) {
            unsigned char c = (unsigned char)s[right];
            if (last[c] >= left) {
                left = last[c] + 1;
            }
            last[c] = right;
            int curLen = right - left + 1;
            if (curLen > maxLen) maxLen = curLen;
        }
        printf("%d\\n", maxLen);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-container-with-most-water',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'medium',
    category: 'Two Pointers',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Print the maximum amount of water a container can store.`,
    constraints: [
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    sampleCases: [
      {
        id: 'water-s1',
        input: '9\n1 8 6 2 5 4 8 3 7',
        output: '49',
        explanation: 'Vertical lines at index 1 (height 8) and index 8 (height 7) hold area 7 * 7 = 49.'
      },
      {
        id: 'water-s2',
        input: '2\n1 1',
        output: '1',
        explanation: 'Width 1, height 1 -> 1 * 1 = 1.'
      }
    ],
    hiddenCases: [
      {
        id: 'water-h1',
        input: '5\n4 3 2 1 4',
        output: '16'
      },
      {
        id: 'water-h2',
        input: '3\n1 2 1',
        output: '2'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
h = list(map(int, input().split()))

# Write your solution below to print the maximum area:

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const h = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below to print the maximum area:

}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> h(n);
        for (int i = 0; i < n; ++i) std::cin >> h[i];

        // Write your solution below to print the maximum area:

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int h[1000];
        for (int i = 0; i < n; ++i) scanf("%d", &h[i]);

        // Write your solution below to print the maximum area:

    }
    return 0;
}
`
    },
    hints: [
      'Use two pointers starting at both ends of the array.',
      'The area is limited by the shorter line: min(h[left], h[right]) * (right - left). Move the shorter pointer inward.'
    ],
    solutions: {
      python: `n = int(input().strip())
h = list(map(int, input().split()))

left, right = 0, n - 1
max_area = 0

while left < right:
    area = min(h[left], h[right]) * (right - left)
    max_area = max(max_area, area)
    if h[left] < h[right]:
        left += 1
    else:
        right -= 1

print(max_area)
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const h = lines[1].trim().split(/\\s+/).map(Number);

  let left = 0, right = n - 1;
  let maxArea = 0;

  while (left < right) {
    const area = Math.min(h[left], h[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (h[left] < h[right]) left++;
    else right--;
  }
  console.log(maxArea);
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> h(n);
        for (int i = 0; i < n; ++i) std::cin >> h[i];

        int left = 0, right = n - 1, maxArea = 0;
        while (left < right) {
            int area = std::min(h[left], h[right]) * (right - left);
            maxArea = std::max(maxArea, area);
            if (h[left] < h[right]) left++;
            else right--;
        }
        std::cout << maxArea << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int h[1000];
        for (int i = 0; i < n; ++i) scanf("%d", &h[i]);

        int left = 0, right = n - 1, maxArea = 0;
        while (left < right) {
            int minH = h[left] < h[right] ? h[left] : h[right];
            int area = minH * (right - left);
            if (area > maxArea) maxArea = area;
            if (h[left] < h[right]) left++;
            else right--;
        }
        printf("%d\\n", maxArea);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-climbing-stairs',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'easy',
    category: '1-D Dynamic Programming',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top? Print the total number of ways.`,
    constraints: [
      '1 <= n <= 45'
    ],
    sampleCases: [
      {
        id: 'cs-s1',
        input: '2',
        output: '2',
        explanation: 'There are two ways: 1 step + 1 step, or 2 steps.'
      },
      {
        id: 'cs-s2',
        input: '3',
        output: '3',
        explanation: 'Three ways: 1+1+1, 1+2, 2+1.'
      }
    ],
    hiddenCases: [
      {
        id: 'cs-h1',
        input: '4',
        output: '5'
      },
      {
        id: 'cs-h2',
        input: '5',
        output: '8'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
# Write your solution below to print the number of distinct ways to climb to the top:

`,
      javascript: `function solve(input) {
  const n = parseInt(input.trim(), 10);
  // Write your solution below to print the number of distinct ways to climb to the top:

}
solve(stdin);
`,
      cpp: `#include <iostream>

int main() {
    int n;
    if (std::cin >> n) {
        // Write your solution below to print the number of distinct ways to climb to the top:

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        // Write your solution below to print the number of distinct ways to climb to the top:

    }
    return 0;
}
`
    },
    hints: [
      'To reach step n, you can either step from n - 1 or jump from n - 2.',
      'This yields the recurrence relation ways(n) = ways(n - 1) + ways(n - 2), which is equivalent to Fibonacci numbers.'
    ],
    solutions: {
      python: `n = int(input().strip())
if n <= 2:
    print(n)
else:
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    print(b)
`,
      javascript: `function solve(input) {
  const n = parseInt(input.trim(), 10);
  if (n <= 2) {
    console.log(n);
    return;
  }
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
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
        if (n <= 2) {
            std::cout << n << std::endl;
            return 0;
        }
        int a = 1, b = 2;
        for (int i = 3; i <= n; ++i) {
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
        if (n <= 2) {
            printf("%d\\n", n);
            return 0;
        }
        int a = 1, b = 2;
        for (int i = 3; i <= n; ++i) {
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
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-product-of-array-except-self',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'medium',
    category: 'Arrays & Hashing',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

You must write an algorithm that runs in **O(n)** time and without using the division operation. Print the output numbers separated by a space.`,
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix of nums fits in a 32-bit integer.'
    ],
    sampleCases: [
      {
        id: 'pes-s1',
        input: '4\n1 2 3 4',
        output: '24 12 8 6',
        explanation: '2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6.'
      },
      {
        id: 'pes-s2',
        input: '5\n-1 1 0 -3 3',
        output: '0 0 9 0 0',
        explanation: 'Product except 0 is -1 * 1 * -3 * 3 = 9.'
      }
    ],
    hiddenCases: [
      {
        id: 'pes-h1',
        input: '2\n5 10',
        output: '10 5'
      },
      {
        id: 'pes-h2',
        input: '3\n2 3 5',
        output: '15 10 6'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
nums = list(map(int, input().split()))

# Write your solution below to print the space-separated products:

`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  // Write your solution below to print the space-separated products:

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

        // Write your solution below to print the space-separated products:

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

        // Write your solution below to print the space-separated products:

    }
    return 0;
}
`
    },
    hints: [
      'Think about computing prefix products from left to right, and postfix products from right to left.',
      'You can construct the result array in two passes without any division.'
    ],
    solutions: {
      python: `n = int(input().strip())
nums = list(map(int, input().split()))

res = [1] * n
prefix = 1
for i in range(n):
    res[i] = prefix
    prefix *= nums[i]

postfix = 1
for i in range(n - 1, -1, -1):
    res[i] *= postfix
    postfix *= nums[i]

print(" ".join(map(str, res)))
`,
      javascript: `function solve(input) {
  const lines = input.trim().split('\\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);

  const res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    res[i] = prefix;
    prefix *= nums[i];
  }

  let postfix = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= postfix;
    postfix *= nums[i];
  }

  console.log(res.join(' '));
}
solve(stdin);
`,
      cpp: `#include <iostream>
#include <vector>

int main() {
    int n;
    if (std::cin >> n) {
        std::vector<int> nums(n), res(n, 1);
        for (int i = 0; i < n; ++i) std::cin >> nums[i];

        int prefix = 1;
        for (int i = 0; i < n; ++i) {
            res[i] = prefix;
            prefix *= nums[i];
        }

        int postfix = 1;
        for (int i = n - 1; i >= 0; --i) {
            res[i] *= postfix;
            postfix *= nums[i];
        }

        for (int i = 0; i < n; ++i) {
            std::cout << res[i] << (i < n - 1 ? " " : "");
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
        int nums[1000], res[1000];
        for (int i = 0; i < n; ++i) {
            scanf("%d", &nums[i]);
            res[i] = 1;
        }

        int prefix = 1;
        for (int i = 0; i < n; ++i) {
            res[i] = prefix;
            prefix *= nums[i];
        }

        int postfix = 1;
        for (int i = n - 1; i >= 0; --i) {
            res[i] *= postfix;
            postfix *= nums[i];
        }

        for (int i = 0; i < n; ++i) {
            printf("%d%s", res[i], i < n - 1 ? " " : "");
        }
        printf("\\n");
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'nc-number-of-1-bits',
    title: 'Number of 1 Bits (Hamming Weight)',
    slug: 'number-of-1-bits',
    difficulty: 'easy',
    category: 'Bit Manipulation',
    authorName: 'NeetCode',
    sheets: ['neetcode75', 'neetcode150'],
    description: `Given a positive integer \`n\`, write a program that prints the number of set bits (1s) it has (also known as the Hamming weight).`,
    constraints: [
      '1 <= n <= 2^31 - 1'
    ],
    sampleCases: [
      {
        id: 'nb-s1',
        input: '11',
        output: '3',
        explanation: '11 in binary is 1011, which has three 1 bits.'
      },
      {
        id: 'nb-s2',
        input: '128',
        output: '1',
        explanation: '128 in binary is 10000000, which has one 1 bit.'
      }
    ],
    hiddenCases: [
      {
        id: 'nb-h1',
        input: '2147483645',
        output: '30'
      },
      {
        id: 'nb-h2',
        input: '7',
        output: '3'
      }
    ],
    starterTemplates: {
      python: `n = int(input().strip())
# Write your solution below to print the number of 1 bits:

`,
      javascript: `function solve(input) {
  let n = parseInt(input.trim(), 10);
  // Write your solution below to print the number of 1 bits:

}
solve(stdin);
`,
      cpp: `#include <iostream>

int main() {
    unsigned int n;
    if (std::cin >> n) {
        // Write your solution below to print the number of 1 bits:

    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    unsigned int n;
    if (scanf("%u", &n) == 1) {
        // Write your solution below to print the number of 1 bits:

    }
    return 0;
}
`
    },
    hints: [
      'You can inspect the lowest bit using n & 1, then shift right with n >>= 1.',
      'Alternatively, Brian Kernighan\'s algorithm n = n & (n - 1) clears the lowest set bit in each step.'
    ],
    solutions: {
      python: `n = int(input().strip())
count = 0
while n > 0:
    count += n & 1
    n >>= 1
print(count)
`,
      javascript: `function solve(input) {
  let n = parseInt(input.trim(), 10);
  let count = 0;
  while (n > 0) {
    count += (n & 1);
    n = Math.floor(n / 2);
  }
  console.log(count);
}
solve(stdin);
`,
      cpp: `#include <iostream>

int main() {
    unsigned int n;
    if (std::cin >> n) {
        int count = 0;
        while (n > 0) {
            count += (n & 1);
            n >>= 1;
        }
        std::cout << count << std::endl;
    }
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    unsigned int n;
    if (scanf("%u", &n) == 1) {
        int count = 0;
        while (n > 0) {
            count += (n & 1);
            n >>= 1;
        }
        printf("%d\\n", count);
    }
    return 0;
}
`
    },
    status: 'approved',
    createdAt: '2026-01-10T00:00:00.000Z'
  }
];
