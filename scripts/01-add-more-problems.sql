-- Add more problems to the database
INSERT INTO problems (title, difficulty, category, description, examples, constraints, starter_code, test_cases, acceptance_rate) VALUES
(
  'Maximum Subarray',
  'medium',
  'Dynamic Programming',
  'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
  '[{"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "The subarray [4,-1,2,1] has the largest sum = 6."}]'::jsonb,
  ARRAY['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
  '{
    "javascript": "function maxSubArray(nums) {\n    // Your code here\n    \n}",
    "python": "def max_sub_array(nums):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[-2,1,-3,4,-1,2,1,-5,4]], "expected": 6}, {"input": [[1]], "expected": 1}, {"input": [[5,4,-1,7,8]], "expected": 23}]'::jsonb,
  47.8
),
(
  'Climbing Stairs',
  'easy',
  'Dynamic Programming',
  'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
  '[{"input": "n = 2", "output": "2", "explanation": "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps"}]'::jsonb,
  ARRAY['1 ≤ n ≤ 45'],
  '{
    "javascript": "function climbStairs(n) {\n    // Your code here\n    \n}",
    "python": "def climb_stairs(n):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [2], "expected": 2}, {"input": [3], "expected": 3}, {"input": [4], "expected": 5}]'::jsonb,
  51.2
),
(
  'Binary Tree Inorder Traversal',
  'easy',
  'Tree',
  'Given the root of a binary tree, return the inorder traversal of its nodes values.',
  '[{"input": "root = [1,null,2,3]", "output": "[1,3,2]"}]'::jsonb,
  ARRAY['The number of nodes in the tree is in the range [0, 100].', '-100 ≤ Node.val ≤ 100'],
  '{
    "javascript": "function inorderTraversal(root) {\n    // Your code here\n    \n}",
    "python": "def inorder_traversal(root):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <vector>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[1,null,2,3]], "expected": [1,3,2]}, {"input": [[]], "expected": []}, {"input": [[1]], "expected": [1]}]'::jsonb,
  74.4
),
(
  'Validate Binary Search Tree',
  'medium',
  'Tree',
  'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
  '[{"input": "root = [2,1,3]", "output": "true"}]'::jsonb,
  ARRAY['The number of nodes in the tree is in the range [1, 10⁴].', '-2³¹ ≤ Node.val ≤ 2³¹ - 1'],
  '{
    "javascript": "function isValidBST(root) {\n    // Your code here\n    \n}",
    "python": "def is_valid_bst(root):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public boolean isValidBST(TreeNode root) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <climits>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[2,1,3]], "expected": true}, {"input": [[5,1,4,null,null,3,6]], "expected": false}]'::jsonb,
  31.5
),
(
  'Same Tree',
  'easy',
  'Tree',
  'Given the roots of two binary trees p and q, write a function to check if they are the same or not.',
  '[{"input": "p = [1,2,3], q = [1,2,3]", "output": "true"}]'::jsonb,
  ARRAY['The number of nodes in both trees is in the range [0, 100].', '-10⁴ ≤ Node.val ≤ 10⁴'],
  '{
    "javascript": "function isSameTree(p, q) {\n    // Your code here\n    \n}",
    "python": "def is_same_tree(p, q):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <iostream>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\nclass Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[1,2,3], [1,2,3]], "expected": true}, {"input": [[1,2], [1,null,2]], "expected": false}]'::jsonb,
  57.9
);
