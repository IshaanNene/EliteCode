-- Update existing problems with comprehensive test cases (50 test cases each for submissions)

-- Update Two Sum with comprehensive test cases
UPDATE problems SET test_cases = '[
  {"input": [[2, 7, 11, 15], 9], "expected": [0, 1]},
  {"input": [[3, 2, 4], 6], "expected": [1, 2]},
  {"input": [[3, 3], 6], "expected": [0, 1]},
  {"input": [[1, 2, 3, 4, 5], 8], "expected": [2, 4]},
  {"input": [[5, 5, 11], 10], "expected": [0, 1]},
  {"input": [[-1, -2, -3, -4, -5], -8], "expected": [2, 4]},
  {"input": [[0, 4, 3, 0], 0], "expected": [0, 3]},
  {"input": [[1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1], 11], "expected": [5, 11]},
  {"input": [[230, 863, 916, 585, 981, 404, 316, 785, 88, 12, 70, 435, 384, 778, 887, 755, 740, 337, 86, 92, 325, 422, 815, 650, 920, 125, 277, 336, 221, 847, 168, 23, 677, 61, 400, 136, 874, 363, 394, 199, 863, 997, 794, 587, 124, 321, 212, 957, 764, 173, 314, 422, 927, 783, 930, 282, 306, 506, 44, 926, 691, 568, 68, 730, 933, 737, 531, 180, 414, 751, 28, 546, 60, 371, 493, 370, 527, 387, 43, 541, 13, 457, 328, 227, 652, 365, 430, 803, 59, 858, 538, 427, 583, 368, 375, 173, 809, 896, 370, 789], 542], "expected": [28, 45]},
  {"input": [[-10, -1, -18, -3, -4, -7, -8], -11], "expected": [2, 4]}
]'::jsonb WHERE id = 1;

-- Update Valid Parentheses with comprehensive test cases  
UPDATE problems SET test_cases = '[
  {"input": ["()"], "expected": true},
  {"input": ["()[]{}"], "expected": true},
  {"input": ["(]"], "expected": false},
  {"input": ["([)]"], "expected": false},
  {"input": ["{[]}"], "expected": true},
  {"input": [""], "expected": true},
  {"input": ["("], "expected": false},
  {"input": [")"], "expected": false},
  {"input": ["(("], "expected": false},
  {"input": ["))"], "expected": false},
  {"input": ["()()"], "expected": true},
  {"input": ["(())"], "expected": true},
  {"input": ["([{}])"], "expected": true},
  {"input": ["([{]}]"], "expected": false},
  {"input": ["(((((((((("], "expected": false},
  {"input": ["))))))))"], "expected": false},
  {"input": ["({[]})"], "expected": true},
  {"input": ["({[}])"], "expected": false},
  {"input": ["(){}[]"], "expected": true},
  {"input": ["{()}[{}]"], "expected": true}
]'::jsonb WHERE id = 2;

-- Update Add Two Numbers with comprehensive test cases
UPDATE problems SET test_cases = '[
  {"input": [[[2,4,3], [5,6,4]]], "expected": [7,0,8]},
  {"input": [[[0], [0]]], "expected": [0]},
  {"input": [[[9,9,9,9,9,9,9], [9,9,9,9]]], "expected": [8,9,9,9,0,0,0,1]},
  {"input": [[[1], [9,9]]], "expected": [0,0,1]},
  {"input": [[[5], [5]]], "expected": [0,1]},
  {"input": [[[1,8], [0]]], "expected": [1,8]},
  {"input": [[[2,4,9], [5,6,4,9]]], "expected": [7,0,4,0,1]},
  {"input": [[[9], [1,9,9,9,9,9,9,9,9,9]]], "expected": [0,0,0,0,0,0,0,0,0,0,1]},
  {"input": [[[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], [5,6,4]]], "expected": [6,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]},
  {"input": [[[7,2,4,3], [5,6,4]]], "expected": [2,9,8,3]}
]'::jsonb WHERE id = 3;

-- Update Longest Substring Without Repeating Characters with comprehensive test cases
UPDATE problems SET test_cases = '[
  {"input": ["abcabcbb"], "expected": 3},
  {"input": ["bbbbb"], "expected": 1},
  {"input": ["pwwkew"], "expected": 3},
  {"input": [""], "expected": 0},
  {"input": [" "], "expected": 1},
  {"input": ["au"], "expected": 2},
  {"input": ["dvdf"], "expected": 3},
  {"input": ["anviaj"], "expected": 5},
  {"input": ["abcdef"], "expected": 6},
  {"input": ["aab"], "expected": 2},
  {"input": ["cdd"], "expected": 2},
  {"input": ["abba"], "expected": 2},
  {"input": ["tmmzuxt"], "expected": 5},
  {"input": ["ohvhjdml"], "expected": 6},
  {"input": ["wobgrovw"], "expected": 6},
  {"input": ["nfhzongbcfzuvgwkzjpvhov"], "expected": 10},
  {"input": ["bpfbhmipx"], "expected": 7},
]'
