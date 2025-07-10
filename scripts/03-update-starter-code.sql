-- Update starter code to use proper function names for each language
UPDATE problems SET starter_code = '{
  "javascript": "function twoSum(nums, target) {\n    // Your code here\n    \n}",
  "python": "def twoSum(nums, target):\n    # Your code here\n    pass",
  "java": "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        \n    }\n}",
  "cpp": "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};"
}'::jsonb WHERE id = 1;

UPDATE problems SET starter_code = '{
  "javascript": "function isValid(s) {\n    // Your code here\n    \n}",
  "python": "def isValid(s):\n    // Your code here\n    pass",
  "java": "public class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        \n    }\n}",
  "cpp": "#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        \n    }\n};"
}'::jsonb WHERE id = 2;

UPDATE problems SET starter_code = '{
  "javascript": "function addTwoNumbers(l1, l2) {\n    // Your code here\n    \n}",
  "python": "def add_two_numbers(l1, l2):\n    # Your code here\n    pass",
  "java": "public class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        // Your code here\n        \n    }\n}",
  "cpp": "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        // Your code here\n        \n    }\n};"
}'::jsonb WHERE id = 3;

UPDATE problems SET starter_code = '{
  "javascript": "function lengthOfLongestSubstring(s) {\n    // Your code here\n    \n}",
  "python": "def length_of_longest_substring(s):\n    # Your code here\n    pass",
  "java": "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        \n    }\n}",
  "cpp": "#include <string>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        \n    }\n};"
}'::jsonb WHERE id = 4;

UPDATE problems SET starter_code = '{
  "javascript": "function mergeTwoLists(list1, list2) {\n    // Your code here\n    \n}",
  "python": "def merge_two_lists(list1, list2):\n    // Your code here\n    pass",
  "java": "public class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n        \n    }\n}",
  "cpp": "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your code here\n        \n    }\n};"
}'::jsonb WHERE id = 5;

UPDATE problems SET starter_code = '{
  "javascript": "function maxProfit(prices) {\n    // Your code here\n    \n}",
  "python": "def max_profit(prices):\n    // Your code here\n    pass",
  "java": "public class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        \n    }\n}",
  "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n        \n    }\n};"
}'::jsonb WHERE id = 6;
