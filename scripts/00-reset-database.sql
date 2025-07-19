-- Complete database reset and setup for EliteCode
-- This script will drop everything and recreate from scratch

-- Drop all existing tables, functions, and triggers
DROP TRIGGER IF EXISTS trigger_update_user_stats ON submissions;
DROP FUNCTION IF EXISTS update_user_stats() CASCADE;
DROP FUNCTION IF EXISTS update_user_ranks() CASCADE;

DROP TABLE IF EXISTS contest_participants CASCADE;
DROP TABLE IF EXISTS user_problem_attempts CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all required columns
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  problems_solved INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create problems table with JSONB starter_code and category column
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  examples JSONB NOT NULL,
  constraints TEXT[] NOT NULL,
  starter_code JSONB NOT NULL,
  test_cases JSONB NOT NULL,
  acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contests table
CREATE TABLE contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  problems INTEGER[] NOT NULL,
  participants INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'time_limit', 'runtime_error')),
  runtime INTEGER,
  memory INTEGER,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contest participants table
CREATE TABLE contest_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  finish_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Create user problem attempts table
CREATE TABLE user_problem_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  attempts INTEGER DEFAULT 1,
  solved BOOLEAN DEFAULT FALSE,
  best_score INTEGER DEFAULT 0,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  solved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, problem_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_total_score ON users(total_score DESC);
CREATE INDEX idx_users_rank ON users(rank ASC);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_contest_id ON submissions(contest_id);
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_start_time ON contests(start_time);
CREATE INDEX idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX idx_contest_participants_score ON contest_participants(score DESC);
CREATE INDEX idx_user_problem_attempts_user_id ON user_problem_attempts(user_id);
CREATE INDEX idx_user_problem_attempts_problem_id ON user_problem_attempts(problem_id);

-- Function to update user rank
CREATE OR REPLACE FUNCTION update_user_ranks()
RETURNS VOID AS $$
BEGIN
  WITH ranked_users AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_score DESC, problems_solved DESC) as new_rank
    FROM users
    WHERE total_score > 0
  )
  UPDATE users 
  SET rank = ranked_users.new_rank
  FROM ranked_users
  WHERE users.id = ranked_users.id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update user stats when submission is made
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    -- Update user problem attempts
    INSERT INTO user_problem_attempts (user_id, problem_id, solved, solved_at, best_score)
    VALUES (NEW.user_id, NEW.problem_id, TRUE, NEW.created_at, COALESCE(NEW.score, 0))
    ON CONFLICT (user_id, problem_id) 
    DO UPDATE SET 
      solved = TRUE,
      solved_at = CASE WHEN user_problem_attempts.solved = FALSE THEN NEW.created_at ELSE user_problem_attempts.solved_at END,
      best_score = GREATEST(user_problem_attempts.best_score, COALESCE(NEW.score, 0)),
      attempts = user_problem_attempts.attempts + 1;

    -- Update user stats
    UPDATE users SET 
      problems_solved = (
        SELECT COUNT(*) FROM user_problem_attempts 
        WHERE user_id = NEW.user_id AND solved = TRUE
      ),
      total_score = (
        SELECT COALESCE(SUM(best_score), 0) FROM user_problem_attempts 
        WHERE user_id = NEW.user_id AND solved = TRUE
      ),
      updated_at = NOW()
    WHERE id = NEW.user_id;

    -- Update ranks
    PERFORM update_user_ranks();
  ELSE
    -- Just update attempts count
    INSERT INTO user_problem_attempts (user_id, problem_id, attempts)
    VALUES (NEW.user_id, NEW.problem_id, 1)
    ON CONFLICT (user_id, problem_id) 
    DO UPDATE SET attempts = user_problem_attempts.attempts + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Insert problems with multi-language starter_code
INSERT INTO problems (title, difficulty, category, description, examples, constraints, starter_code, test_cases, acceptance_rate) VALUES
(
  'Two Sum',
  'easy',
  'Array',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."}]'::jsonb,
  ARRAY['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', '-10⁹ ≤ target ≤ 10⁹', 'Only one valid answer exists.'],
  '{
    "javascript": "function twoSum(nums, target) {\n    // Your code here\n    \n}",
    "python": "def two_sum(nums, target):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[2, 7, 11, 15], 9], "expected": [0, 1]}, {"input": [[3, 2, 4], 6], "expected": [1, 2]}, {"input": [[3, 3], 6], "expected": [0, 1]}]'::jsonb,
  49.2
),
(
  'Valid Parentheses',
  'easy',
  'Stack',
  'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
  '[{"input": "s = \"()\"", "output": "true"}, {"input": "s = \"()[]{}\"", "output": "true"}, {"input": "s = \"(]\"", "output": "false"}]'::jsonb,
  ARRAY['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only ''()[]{}''.'],
  '{
    "javascript": "function isValid(s) {\n    // Your code here\n    \n}",
    "python": "def is_valid(s):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": ["()"], "expected": true}, {"input": ["()[]{}"], "expected": true}, {"input": ["(]"], "expected": false}]'::jsonb,
  40.7
),
(
  'Add Two Numbers',
  'medium',
  'Linked List',
  'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
  '[{"input": "l1 = [2,4,3], l2 = [5,6,4]", "output": "[7,0,8]", "explanation": "342 + 465 = 807."}]'::jsonb,
  ARRAY['The number of nodes in each linked list is in the range [1, 100].', '0 ≤ Node.val ≤ 9', 'It is guaranteed that the list represents a number that does not have leading zeros.'],
  '{
    "javascript": "function addTwoNumbers(l1, l2) {\n    // Your code here\n    \n}",
    "python": "def add_two_numbers(l1, l2):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[[2,4,3], [5,6,4]]], "expected": [7,0,8]}]'::jsonb,
  37.8
),
(
  'Longest Substring Without Repeating Characters',
  'medium',
  'String',
  'Given a string s, find the length of the longest substring without repeating characters.',
  '[{"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."}]'::jsonb,
  ARRAY['0 ≤ s.length ≤ 5 * 10⁴', 's consists of English letters, digits, symbols and spaces.'],
  '{
    "javascript": "function lengthOfLongestSubstring(s) {\n    // Your code here\n    \n}",
    "python": "def length_of_longest_substring(s):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <string>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": ["abcabcbb"], "expected": 3}, {"input": ["bbbbb"], "expected": 1}, {"input": ["pwwkew"], "expected": 3}]'::jsonb,
  33.1
),
(
  'Merge Two Sorted Lists',
  'easy',
  'Linked List',
  'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.',
  '[{"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"}]'::jsonb,
  ARRAY['The number of nodes in both lists is in the range [0, 50].', '-100 ≤ Node.val ≤ 100', 'Both list1 and list2 are sorted in non-decreasing order.'],
  '{
    "javascript": "function mergeTwoLists(list1, list2) {\n    // Your code here\n    \n}",
    "python": "def merge_two_lists(list1, list2):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[1,2,4], [1,3,4]], "expected": [1,1,2,3,4,4]}]'::jsonb,
  62.1
),
(
  'Best Time to Buy and Sell Stock',
  'easy',
  'Array',
  'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
  '[{"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."}]'::jsonb,
  ARRAY['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
  '{
    "javascript": "function maxProfit(prices) {\n    // Your code here\n    \n}",
    "python": "def max_profit(prices):\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        \n    }\n}",
    "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n        \n    }\n};"
  }'::jsonb,
  '[{"input": [[7,1,5,3,6,4]], "expected": 5}, {"input": [[7,6,4,3,1]], "expected": 0}]'::jsonb,
  54.3
),
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

-- Insert sample users for leaderboard
INSERT INTO users (email, name, bio, problems_solved, total_score, rank) VALUES
('alex@elitecode.com', 'Alex Chen', 'Full-stack developer passionate about algorithms', 127, 9850, 1),
('sarah@elitecode.com', 'Sarah Johnson', 'CS student at MIT, loves competitive programming', 115, 9420, 2),
('mike@elitecode.com', 'Mike Rodriguez', 'Software engineer at Google, algorithm enthusiast', 108, 9180, 3),
('emily@elitecode.com', 'Emily Davis', 'Data scientist with a love for problem solving', 95, 8750, 4),
('david@elitecode.com', 'David Kim', 'Backend developer, graph theory specialist', 89, 8420, 5),
('lisa@elitecode.com', 'Lisa Wang', 'Frontend developer learning algorithms', 82, 8100, 6),
('james@elitecode.com', 'James Wilson', 'DevOps engineer, enjoys coding challenges', 76, 7850, 7),
('anna@elitecode.com', 'Anna Martinez', 'Mobile developer, dynamic programming fan', 71, 7620, 8),
('tom@elitecode.com', 'Tom Brown', 'Game developer, loves optimization problems', 68, 7400, 9),
('sophie@elitecode.com', 'Sophie Lee', 'AI researcher, machine learning enthusiast', 63, 7180, 10);

-- Insert sample contests
INSERT INTO contests (title, description, start_time, end_time, duration, problems, participants, status) VALUES
(
  'EliteCode Weekly Challenge #47',
  'Test your skills with algorithmic problems focusing on dynamic programming and graph theory.',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
  120,
  ARRAY[1, 2, 3, 4],
  1247,
  'upcoming'
),
(
  'Speed Coding Sprint',
  'Fast-paced contest with easy to medium problems. Perfect for beginners!',
  NOW() - INTERVAL '30 minutes',
  NOW() + INTERVAL '90 minutes',
  120,
  ARRAY[1, 2, 6],
  892,
  'active'
),
(
  'Algorithm Masters Cup',
  'Advanced contest featuring complex algorithmic challenges. For experienced coders only.',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
  180,
  ARRAY[3, 4, 5, 6],
  2156,
  'ended'
);

-- Update user ranks after inserting data
SELECT update_user_ranks();
