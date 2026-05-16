import { generateStarterCpp, generateStarterJava } from "../services/piston";

type Sig = { fn: string; ret: string; params: { name: string; type: string }[] };

type Problem = {
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  description: string;
  constraints: string;
  examples: { input: string; output: string; explanation: string | null }[];
  testCases: { input: string; expectedOutput: string }[];
  signature: Sig;
  starterCodeCpp: string;
  starterCodeJava: string;
};

function p(
  title: string,
  difficulty: "easy" | "medium" | "hard",
  tags: string[],
  sig: Sig,
  description: string,
  constraints: string,
  cases: [string, string, string?][],
): Problem {
  return {
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    difficulty,
    tags,
    description,
    constraints,
    examples: cases.slice(0, 2).map(([input, output, explanation]) => ({ input, output, explanation: explanation ?? null })),
    testCases: cases.map(([input, expectedOutput]) => ({ input, expectedOutput })),
    signature: sig,
    starterCodeCpp: generateStarterCpp(sig),
    starterCodeJava: generateStarterJava(sig),
  };
}

export const problems: Problem[] = [
  p("Two Sum", "easy", ["array","hash table"], {fn:"twoSum",ret:"int[]",params:[{name:"nums",type:"int[]"},{name:"target",type:"int"}]},
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    [
    ["[2,7,11,15], 9", "[0,1]", "Because nums[0] + nums[1] == 9, we return [0, 1]."],
    ["[3,2,4], 6", "[1,2]", "nums[1] + nums[2] == 6."],
    ["[3,3], 6", "[0,1]"],
    ["[1,2,3,4,5], 9", "[3,4]"],
    ["[5,75,25], 100", "[1,2]"]
  ],
  ),
  p("Valid Parentheses", "easy", ["string","stack"], {fn:"isValid",ret:"bool",params:[{name:"s",type:"string"}]},
    "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: (1) Open brackets must be closed by the same type of brackets. (2) Open brackets must be closed in the correct order. (3) Every close bracket has a corresponding open bracket of the same type.",
    "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    [
    ["\"()\"", "true", "Single pair of matching parentheses."],
    ["\"()[]{}\"", "true", "All bracket types properly opened and closed."],
    ["\"(]\"", "false"],
    ["\"([)]\"", "false"],
    ["\"{[]}\"", "true"]
  ],
  ),
  p("Palindrome Check", "easy", ["string","two pointers"], {fn:"isPalindrome",ret:"bool",params:[{name:"s",type:"string"}]},
    "Given a string s, return true if it is a palindrome, and false otherwise. A string is a palindrome if it reads the same forward and backward.",
    "1 <= s.length <= 2*10^5\ns consists of printable ASCII characters.",
    [
    ["\"racecar\"", "true", "'racecar' reads the same forwards and backwards."],
    ["\"hello\"", "false", "'hello' reversed is 'olleh', which is different."],
    ["\"abba\"", "true"],
    ["\"a\"", "true"],
    ["\"ab\"", "false"]
  ],
  ),
  p("Binary Search", "easy", ["array","binary search"], {fn:"search",ret:"int",params:[{name:"nums",type:"int[]"},{name:"target",type:"int"}]},
    "Given an array of integers nums sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll values of nums are unique.\nnums is sorted in ascending order.",
    [
    ["[-1,0,3,5,9,12], 9", "4", "9 exists in nums and its index is 4."],
    ["[-1,0,3,5,9,12], 2", "-1", "2 does not exist in nums so return -1."],
    ["[1,3,5,7,9], 7", "3"],
    ["[1], 1", "0"],
    ["[1,2], 2", "1"]
  ],
  ),
  p("Climbing Stairs", "easy", ["dp","math"], {fn:"climbStairs",ret:"int",params:[{name:"n",type:"int"}]},
    "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "1 <= n <= 45",
    [
    ["2", "2", "There are two ways: 1+1 and 2."],
    ["3", "3", "There are three ways: 1+1+1, 1+2, and 2+1."],
    ["5", "8"],
    ["10", "89"],
    ["1", "1"]
  ],
  ),
  p("Best Time to Buy and Sell Stock", "easy", ["array","dp"], {fn:"maxProfit",ret:"int",params:[{name:"prices",type:"int[]"}]},
    "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    [
    ["[7,1,5,3,6,4]", "5", "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."],
    ["[7,6,4,3,1]", "0", "No transactions yield a positive profit, so max profit is 0."],
    ["[1,2]", "1"],
    ["[2,4,1]", "2"],
    ["[3,2,6,5,0,3]", "4"]
  ],
  ),
  p("Reverse String", "easy", ["string","two pointers"], {fn:"reverseString",ret:"string",params:[{name:"s",type:"string"}]},
    "Write a function that reverses a string. The input string is given as a string s. Return the reversed string.",
    "1 <= s.length <= 10^5\ns consists of printable ASCII characters.",
    [
    ["\"hello\"", "\"olleh\"", "The reverse of 'hello' is 'olleh'."],
    ["\"world\"", "\"dlrow\"", "The reverse of 'world' is 'dlrow'."],
    ["\"a\"", "\"a\""],
    ["\"\"", "\"\""],
    ["\"abcd\"", "\"dcba\""]
  ],
  ),
  p("Maximum Subarray", "easy", ["array","dp"], {fn:"maxSubArray",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.",
    "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    [
    ["[-2,1,-3,4,-1,2,1,-5,4]", "6", "The subarray [4,-1,2,1] has the largest sum 6."],
    ["[1]", "1", "The subarray [1] has the largest sum 1."],
    ["[5,4,-1,7,8]", "23"],
    ["[-1]", "-1"],
    ["[-2,-1]", "-1"]
  ],
  ),
  p("Single Number", "easy", ["array","bit manipulation"], {fn:"singleNumber",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with linear runtime complexity and use only constant extra space.",
    "1 <= nums.length <= 3*10^4\n-3*10^4 <= nums[i] <= 3*10^4\nEach element appears twice except for one element which appears once.",
    [
    ["[2,2,1]", "1", "1 is the only element that appears once."],
    ["[4,1,2,1,2]", "4", "4 is the only element that appears once."],
    ["[1]", "1"],
    ["[7,3,3]", "7"],
    ["[5,5,9]", "9"]
  ],
  ),
  p("Move Zeroes", "easy", ["array","two pointers"], {fn:"moveZeroes",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements. Return the modified array. Note that you must do this in-place without making a copy of the array.",
    "1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
    [
    ["[0,1,0,3,12]", "[1,3,12,0,0]", "After moving zeroes to the end, the non-zero elements maintain their order."],
    ["[0]", "[0]", "The only element is already 0."],
    ["[1,2,3]", "[1,2,3]"],
    ["[0,0,1]", "[1,0,0]"],
    ["[4,0,5,0,6]", "[4,5,6,0,0]"]
  ],
  ),
  p("Contains Duplicate", "easy", ["array","hash table"], {fn:"containsDuplicate",ret:"bool",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    [
    ["[1,2,3,1]", "true", "1 appears at indices 0 and 3."],
    ["[1,2,3,4]", "false", "All elements are distinct."],
    ["[1,1,1,3,3,4,3,2,4,2]", "true"],
    ["[0]", "false"],
    ["[5,5]", "true"]
  ]),
  p("Plus One", "easy", ["array","math"], {fn:"plusOne",ret:"int[]",params:[{name:"digits",type:"int[]"}]},
    "You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's. Increment the large integer by one and return the resulting array of digits.",
    "1 <= digits.length <= 100\n0 <= digits[i] <= 9\ndigits does not contain any leading 0's.",
    [
    ["[1,2,3]", "[1,2,4]", "The array represents the integer 123. Incrementing by one gives 124."],
    ["[4,3,2,1]", "[4,3,2,2]", "The array represents the integer 4321. Incrementing gives 4322."],
    ["[9]", "[1,0]"],
    ["[9,9]", "[1,0,0]"],
    ["[0]", "[1]"]
  ]),
  p("Merge Sorted Array", "easy", ["array","two pointers"], {fn:"merge",ret:"int[]",params:[{name:"nums1",type:"int[]"},{name:"nums2",type:"int[]"}]},
    "Given two sorted integer arrays `nums1` and `nums2`, return a single sorted array containing all elements.",
    "0 <= nums1.length, nums2.length <= 200",
    [
    ["[1,2,3], [4,5,6]", "[1,2,3,4,5,6]"],
    ["[1,3,5], [2,4,6]", "[1,2,3,4,5,6]"],
    ["[], [1]", "[1]"],
    ["[1], []", "[1]"],
    ["[1,5,9], [2,3,7]", "[1,2,3,5,7,9]"]
  ]),
  p("Roman to Integer", "easy", ["string","math"], {fn:"romanToInt",ret:"int",params:[{name:"s",type:"string"}]},
    "Roman numerals are represented by seven symbols: I (1), V (5), X (10), L (50), C (100), D (500), M (1000). For example, 2 is written as II, and 12 is written as XII. The number 4 is written as IV (I before V means 5 - 1 = 4). Given a roman numeral string, convert it to an integer.",
    "1 <= s.length <= 15\ns contains only the characters 'I', 'V', 'X', 'L', 'C', 'D', 'M'.\nIt is guaranteed that s is a valid roman numeral in the range [1, 3999].",
    [
    ["\"III\"", "3", "III = 1 + 1 + 1 = 3."],
    ["\"LVIII\"", "58", "L = 50, V = 5, III = 3. Total = 58."],
    ["\"MCMXCIV\"", "1994"],
    ["\"IV\"", "4"],
    ["\"IX\"", "9"]
  ]),
  p("Length of Last Word", "easy", ["string"], {fn:"lengthOfLastWord",ret:"int",params:[{name:"s",type:"string"}]},
    "Given a string `s` of words separated by spaces, return the length of the last word.",
    "1 <= s.length <= 10^4",
    [
    ["\"Hello World\"", "5"],
    ["\"   fly me   to   the moon  \"", "4"],
    ["\"a\"", "1"],
    ["\"abc\"", "3"],
    ["\"hello world programming\"", "11"]
  ]),
  p("FizzBuzz", "easy", ["array","math","string"], {fn:"fizzBuzz",ret:"string[]",params:[{name:"n",type:"int"}]},
    "Given an integer n, return a string array answer (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, answer[i] == 'Fizz' if i is divisible by 3, answer[i] == 'Buzz' if i is divisible by 5, and answer[i] == i (as a string) if none of the above conditions are true.",
    "1 <= n <= 10^4",
    [
    ["3", "[\"1\",\"2\",\"Fizz\"]", "1 and 2 are neither divisible by 3 nor 5. 3 is divisible by 3."],
    ["5", "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]", "5 is divisible by 5."],
    ["1", "[\"1\"]"],
    ["6", "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\"]"],
    ["15", "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]"]
  ]),
  p("Reverse Integer", "easy", ["math"], {fn:"reverse",ret:"int",params:[{name:"x",type:"int"}]},
    "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0. Assume the environment does not allow you to store 64-bit integers.",
    "-2^31 <= x <= 2^31 - 1",
    [
    ["123", "321", "Reversing 123 gives 321."],
    ["-123", "-321", "Reversing -123 gives -321 (sign is preserved)."],
    ["120", "21"],
    ["0", "0"],
    ["1534236469", "0"]
  ]),
  p("Valid Anagram", "easy", ["string","hash table","sorting"], {fn:"isAnagram",ret:"bool",params:[{name:"s",type:"string"},{name:"t",type:"string"}]},
    "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "1 <= s.length, t.length <= 5*10^4\ns and t consist of lowercase English letters.",
    [
    ["\"anagram\", \"nagaram\"", "true", "'nagaram' is a rearrangement of 'anagram'."],
    ["\"rat\", \"car\"", "false", "'car' cannot be rearranged to form 'rat'."],
    ["\"a\", \"a\"", "true"],
    ["\"ab\", \"ba\"", "true"],
    ["\"aa\", \"ab\"", "false"]
  ]),
  p("First Unique Character", "easy", ["string","hash table"], {fn:"firstUniqChar",ret:"int",params:[{name:"s",type:"string"}]},
    "Given a string `s`, return the index of the first non-repeating character. If none exists, return -1.",
    "1 <= s.length <= 10^5",
    [
    ["\"leetcode\"", "0"],
    ["\"loveleetcode\"", "2"],
    ["\"aabb\"", "-1"],
    ["\"z\"", "0"],
    ["\"aabbcc\"", "-1"]
  ]),
  p("Squares of Sorted Array", "easy", ["array","two pointers"], {fn:"sortedSquares",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number, also sorted in non-decreasing order.",
    "1 <= nums.length <= 10^4",
    [
    ["[-4,-1,0,3,10]", "[0,1,9,16,100]"],
    ["[-7,-3,2,3,11]", "[4,9,9,49,121]"],
    ["[1,2,3]", "[1,4,9]"],
    ["[-5,-3,-1]", "[1,9,25]"],
    ["[0]", "[0]"]
  ]),
  p("Intersection of Two Arrays", "easy", ["array","hash table"], {fn:"intersection",ret:"int[]",params:[{name:"nums1",type:"int[]"},{name:"nums2",type:"int[]"}]},
    "Given two integer arrays `nums1` and `nums2`, return their intersection as an array of unique values, sorted ascending.",
    "1 <= nums1.length, nums2.length <= 1000",
    [
    ["[1,2,2,1], [2,2]", "[2]"],
    ["[4,9,5], [9,4,9,8,4]", "[4,9]"],
    ["[1,2,3], [4,5,6]", "[]"],
    ["[1,1], [1]", "[1]"],
    ["[3,1,2], [2,3,4]", "[2,3]"]
  ]),
  p("Power of Two", "easy", ["math","bit manipulation"], {fn:"isPowerOfTwo",ret:"bool",params:[{name:"n",type:"int"}]},
    "Given an integer `n`, return `true` if it is a power of two.",
    "-2^31 <= n <= 2^31 - 1",
    [
    ["1", "true"],
    ["16", "true"],
    ["3", "false"],
    ["1024", "true"],
    ["0", "false"]
  ]),
  p("Missing Number", "easy", ["array","math"], {fn:"missingNumber",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an array `nums` containing `n` distinct numbers in [0, n], return the only number missing from the range.",
    "1 <= n <= 10^4",
    [
    ["[3,0,1]", "2"],
    ["[0,1]", "2"],
    ["[9,6,4,2,3,5,7,0,1]", "8"],
    ["[0]", "1"],
    ["[1]", "0"]
  ]),
  p("Happy Number", "easy", ["math","hash table"], {fn:"isHappy",ret:"bool",params:[{name:"n",type:"int"}]},
    "A number is happy if repeatedly replacing it with the sum of squares of its digits eventually reaches 1. Return `true` if `n` is happy.",
    "1 <= n <= 2^31 - 1",
    [
    ["19", "true"],
    ["2", "false"],
    ["1", "true"],
    ["7", "true"],
    ["20", "false"]
  ]),
  p("Excel Column Number", "easy", ["string","math"], {fn:"titleToNumber",ret:"int",params:[{name:"columnTitle",type:"string"}]},
    "Given a string `columnTitle` representing an Excel sheet column (A=1, B=2, ..., Z=26, AA=27, ...), return its corresponding column number.",
    "1 <= columnTitle.length <= 7",
    [
    ["\"A\"", "1"],
    ["\"AB\"", "28"],
    ["\"ZY\"", "701"],
    ["\"AA\"", "27"],
    ["\"BA\"", "53"]
  ]),
  p("Add Binary", "easy", ["string","math"], {fn:"addBinary",ret:"string",params:[{name:"a",type:"string"},{name:"b",type:"string"}]},
    "Given two binary strings `a` and `b`, return their sum as a binary string.",
    "1 <= a.length, b.length <= 10^4",
    [
    ["\"11\", \"1\"", "\"100\""],
    ["\"1010\", \"1011\"", "\"10101\""],
    ["\"0\", \"0\"", "\"0\""],
    ["\"1\", \"1\"", "\"10\""],
    ["\"100\", \"110010\"", "\"110110\""]
  ]),
  p("Sqrt Integer", "easy", ["math","binary search"], {fn:"mySqrt",ret:"int",params:[{name:"x",type:"int"}]},
    "Given a non-negative integer `x`, return the floor of its square root.",
    "0 <= x <= 2^31 - 1",
    [
    ["4", "2"],
    ["8", "2"],
    ["0", "0"],
    ["1", "1"],
    ["100", "10"]
  ]),
  p("Pascal Triangle Row", "easy", ["array","dp"], {fn:"getRow",ret:"int[]",params:[{name:"rowIndex",type:"int"}]},
    "Given an integer `rowIndex`, return the row at that index of Pascal's triangle (0-indexed).",
    "0 <= rowIndex <= 33",
    [
    ["3", "[1,3,3,1]"],
    ["0", "[1]"],
    ["1", "[1,1]"],
    ["4", "[1,4,6,4,1]"],
    ["5", "[1,5,10,10,5,1]"]
  ]),
  p("Fibonacci Number", "easy", ["math","dp"], {fn:"fib",ret:"int",params:[{name:"n",type:"int"}]},
    "Return the n-th Fibonacci number where F(0)=0, F(1)=1 and F(n)=F(n-1)+F(n-2).",
    "0 <= n <= 30",
    [
    ["2", "1"],
    ["3", "2"],
    ["4", "3"],
    ["10", "55"],
    ["0", "0"]
  ]),
  p("Number of 1 Bits", "easy", ["bit manipulation"], {fn:"hammingWeight",ret:"int",params:[{name:"n",type:"int"}]},
    "Given an unsigned integer `n`, return the number of 1 bits in its binary representation.",
    "0 <= n <= 2^31 - 1",
    [
    ["11", "3"],
    ["128", "1"],
    ["0", "0"],
    ["255", "8"],
    ["1", "1"]
  ]),
  p("Majority Element", "easy", ["array","hash table"], {fn:"majorityElement",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an array `nums` of length n, return the element that appears more than n/2 times. The majority element always exists.",
    "1 <= nums.length <= 5*10^4",
    [
    ["[3,2,3]", "3"],
    ["[2,2,1,1,1,2,2]", "2"],
    ["[1]", "1"],
    ["[6,6,6,7,7]", "6"],
    ["[5,5,1,1,5]", "5"]
  ]),
  p("Numbers With Even Digits", "easy", ["array","math"], {fn:"numbersWithEvenDigits",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums`, return how many of the numbers contain an even number of digits.",
    "1 <= nums.length <= 500",
    [
    ["[12,345,2,6,7896]", "2"],
    ["[555,901,482,1771]", "1"],
    ["[10,100,1000]", "2"],
    ["[1,22,333,4444]", "2"],
    ["[99,9999]", "2"]
  ]),
  p("Defang IP Address", "easy", ["string"], {fn:"defangIPaddr",ret:"string",params:[{name:"address",type:"string"}]},
    "Given a valid (IPv4) IP address, return a defanged version where every period '.' is replaced by '[.]'.",
    "address consists of digits and three dots",
    [
    ["\"1.1.1.1\"", "\"1[.]1[.]1[.]1\""],
    ["\"255.100.50.0\"", "\"255[.]100[.]50[.]0\""],
    ["\"0.0.0.0\"", "\"0[.]0[.]0[.]0\""],
    ["\"192.168.1.1\"", "\"192[.]168[.]1[.]1\""],
    ["\"10.0.0.255\"", "\"10[.]0[.]0[.]255\""]
  ]),
  p("Running Sum", "easy", ["array","prefix sum"], {fn:"runningSum",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an array `nums`, return its running sum: result[i] = nums[0]+nums[1]+...+nums[i].",
    "1 <= nums.length <= 1000",
    [
    ["[1,2,3,4]", "[1,3,6,10]"],
    ["[1,1,1,1,1]", "[1,2,3,4,5]"],
    ["[3,1,2,10,1]", "[3,4,6,16,17]"],
    ["[5]", "[5]"],
    ["[0,0,0]", "[0,0,0]"]
  ]),
  p("Shuffle The Array", "easy", ["array"], {fn:"shuffle",ret:"int[]",params:[{name:"nums",type:"int[]"},{name:"n",type:"int"}]},
    "Given an array `nums` of length 2n containing [x1,x2,...,xn,y1,y2,...,yn], return [x1,y1,x2,y2,...,xn,yn].",
    "1 <= n <= 500",
    [
    ["[2,5,1,3,4,7], 3", "[2,3,5,4,1,7]"],
    ["[1,2,3,4,4,3,2,1], 4", "[1,4,2,3,3,2,4,1]"],
    ["[1,1,2,2], 2", "[1,2,1,2]"],
    ["[10,20], 1", "[10,20]"],
    ["[1,2,3,11,12,13], 3", "[1,11,2,12,3,13]"]
  ]),
  p("Group Anagrams", "medium", ["array","string","hash table"], {fn:"groupAnagrams",ret:"string[][]",params:[{name:"strs",type:"string[]"}]},
    "Given an array of strings `strs`, group anagrams together. Return groups sorted by their first member; within each group, keep input order.",
    "1 <= strs.length <= 10^4",
    [
    ["[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "[[\"bat\"],[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"]]"],
    ["[\"\"]", "[[\"\"]]"],
    ["[\"a\"]", "[[\"a\"]]"],
    ["[\"abc\",\"cba\",\"bac\"]", "[[\"abc\",\"cba\",\"bac\"]]"],
    ["[\"x\",\"y\",\"x\"]", "[[\"x\",\"x\"],[\"y\"]]"]
  ]),
  p("Longest Substring Without Repeating", "medium", ["string","sliding window"], {fn:"lengthOfLongestSubstring",ret:"int",params:[{name:"s",type:"string"}]},
    "Given a string `s`, return the length of the longest substring without repeating characters.",
    "0 <= s.length <= 5*10^4",
    [
    ["\"abcabcbb\"", "3"],
    ["\"bbbbb\"", "1"],
    ["\"pwwkew\"", "3"],
    ["\"\"", "0"],
    ["\"dvdf\"", "3"]
  ]),
  p("Longest Palindromic Substring", "medium", ["string","dp"], {fn:"longestPalindrome",ret:"string",params:[{name:"s",type:"string"}]},
    "Given a string `s`, return the longest palindromic substring in `s` (any if tied).",
    "1 <= s.length <= 1000",
    [
    ["\"babad\"", "\"bab\""],
    ["\"cbbd\"", "\"bb\""],
    ["\"a\"", "\"a\""],
    ["\"ac\"", "\"a\""],
    ["\"racecar\"", "\"racecar\""]
  ]),
  p("Rotate Array", "medium", ["array","math"], {fn:"rotate",ret:"int[]",params:[{name:"nums",type:"int[]"},{name:"k",type:"int"}]},
    "Rotate the array `nums` to the right by `k` steps and return the result.",
    "1 <= nums.length <= 10^5",
    [
    ["[1,2,3,4,5,6,7], 3", "[5,6,7,1,2,3,4]"],
    ["[-1,-100,3,99], 2", "[3,99,-1,-100]"],
    ["[1,2], 1", "[2,1]"],
    ["[1], 5", "[1]"],
    ["[1,2,3], 0", "[1,2,3]"]
  ]),
  p("Product of Array Except Self", "medium", ["array","prefix"], {fn:"productExceptSelf",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums`, return an array `answer` such that `answer[i]` equals the product of all elements of `nums` except `nums[i]`.",
    "2 <= nums.length <= 10^5",
    [
    ["[1,2,3,4]", "[24,12,8,6]"],
    ["[-1,1,0,-3,3]", "[0,0,9,0,0]"],
    ["[2,3]", "[3,2]"],
    ["[1,1,1]", "[1,1,1]"],
    ["[5,2,4]", "[8,20,10]"]
  ]),
  p("Container With Most Water", "medium", ["array","two pointers"], {fn:"maxArea",ret:"int",params:[{name:"height",type:"int[]"}]},
    "Given n non-negative integers representing heights, find two lines that together with the x-axis form a container holding the most water. Return the max area.",
    "2 <= height.length <= 10^5",
    [
    ["[1,8,6,2,5,4,8,3,7]", "49"],
    ["[1,1]", "1"],
    ["[4,3,2,1,4]", "16"],
    ["[1,2,1]", "2"],
    ["[2,3,4,5,18,17,6]", "17"]
  ]),
  p("3Sum", "medium", ["array","two pointers"], {fn:"threeSum",ret:"int[][]",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums`, return all unique triplets [a,b,c] such that a+b+c=0. Triplets sorted ascending; outer list sorted lex by [a,b,c].",
    "3 <= nums.length <= 3000",
    [
    ["[-1,0,1,2,-1,-4]", "[[-1,-1,2],[-1,0,1]]"],
    ["[0,1,1]", "[]"],
    ["[0,0,0]", "[[0,0,0]]"],
    ["[-2,0,1,1,2]", "[[-2,0,2],[-2,1,1]]"],
    ["[1,2,-2,-1]", "[]"]
  ]),
  p("Set Matrix Zeroes", "medium", ["matrix","array"], {fn:"setZeroes",ret:"int[][]",params:[{name:"matrix",type:"int[][]"}]},
    "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. Return the resulting matrix.",
    "1 <= m, n <= 200",
    [
    ["[[1,1,1],[1,0,1],[1,1,1]]", "[[1,0,1],[0,0,0],[1,0,1]]"],
    ["[[0,1,2,0],[3,4,5,2],[1,3,1,5]]", "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]"],
    ["[[1]]", "[[1]]"],
    ["[[0]]", "[[0]]"],
    ["[[1,2],[3,4]]", "[[1,2],[3,4]]"]
  ]),
  p("Spiral Matrix", "medium", ["matrix","array"], {fn:"spiralOrder",ret:"int[]",params:[{name:"matrix",type:"int[][]"}]},
    "Given an m x n matrix, return all elements in spiral order (clockwise starting from top-left).",
    "1 <= m, n <= 10",
    [
    ["[[1,2,3],[4,5,6],[7,8,9]]", "[1,2,3,6,9,8,7,4,5]"],
    ["[[1,2,3,4],[5,6,7,8],[9,10,11,12]]", "[1,2,3,4,8,12,11,10,9,5,6,7]"],
    ["[[1]]", "[1]"],
    ["[[1,2],[3,4]]", "[1,2,4,3]"],
    ["[[1],[2],[3]]", "[1,2,3]"]
  ]),
  p("Rotate Image", "medium", ["matrix","array"], {fn:"rotateImage",ret:"int[][]",params:[{name:"matrix",type:"int[][]"}]},
    "Given an n x n matrix, rotate it 90 degrees clockwise in place and return the rotated matrix.",
    "1 <= n <= 20",
    [
    ["[[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]"],
    ["[[1,2],[3,4]]", "[[3,1],[4,2]]"],
    ["[[1]]", "[[1]]"],
    ["[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]"],
    ["[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]", "[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]"]
  ]),
  p("Word Break", "medium", ["string","dp"], {fn:"wordBreak",ret:"bool",params:[{name:"s",type:"string"},{name:"wordDict",type:"string[]"}]},
    "Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of dictionary words.",
    "1 <= s.length <= 300",
    [
    ["\"leetcode\", [\"leet\",\"code\"]", "true"],
    ["\"applepenapple\", [\"apple\",\"pen\"]", "true"],
    ["\"catsandog\", [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]", "false"],
    ["\"a\", [\"a\"]", "true"],
    ["\"abcd\", [\"a\",\"abc\",\"b\",\"cd\"]", "true"]
  ]),
  p("Coin Change", "medium", ["dp","array"], {fn:"coinChange",ret:"int",params:[{name:"coins",type:"int[]"},{name:"amount",type:"int"}]},
    "Given coins of different denominations and an `amount`, return the fewest number of coins needed to make up that amount. Return -1 if impossible.",
    "1 <= coins.length <= 12",
    [
    ["[1,2,5], 11", "3"],
    ["[2], 3", "-1"],
    ["[1], 0", "0"],
    ["[1,2,5], 100", "20"],
    ["[2,5,10,1], 27", "4"]
  ]),
  p("House Robber", "medium", ["dp"], {fn:"rob",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums` of house values, return the maximum sum you can rob without robbing two adjacent houses.",
    "1 <= nums.length <= 100",
    [
    ["[1,2,3,1]", "4"],
    ["[2,7,9,3,1]", "12"],
    ["[2,1,1,2]", "4"],
    ["[5]", "5"],
    ["[10,1,10,1,10]", "30"]
  ]),
  p("Unique Paths", "medium", ["dp","math"], {fn:"uniquePaths",ret:"int",params:[{name:"m",type:"int"},{name:"n",type:"int"}]},
    "A robot starts at top-left of an m x n grid. It can only move right or down. Return the number of unique paths to bottom-right.",
    "1 <= m, n <= 100",
    [
    ["3, 7", "28"],
    ["3, 2", "3"],
    ["7, 3", "28"],
    ["1, 1", "1"],
    ["2, 2", "2"]
  ]),
  p("Maximum Product Subarray", "medium", ["array","dp"], {fn:"maxProduct",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums`, find the contiguous subarray with the largest product and return that product.",
    "1 <= nums.length <= 2*10^4",
    [
    ["[2,3,-2,4]", "6"],
    ["[-2,0,-1]", "0"],
    ["[-2,3,-4]", "24"],
    ["[0,2]", "2"],
    ["[-2]", "-2"]
  ]),
  p("Number of Islands", "medium", ["matrix","dfs"], {fn:"numIslands",ret:"int",params:[{name:"grid",type:"string[][]"}]},
    "Given an m x n 2D grid of '1' (land) and '0' (water) characters, return the number of islands. An island is connected horizontally/vertically.",
    "1 <= m, n <= 300",
    [
    ["[[\"1\",\"1\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\"],[\"0\",\"0\",\"0\",\"1\"]]", "3"],
    ["[[\"1\",\"1\",\"1\"],[\"0\",\"1\",\"0\"],[\"1\",\"1\",\"1\"]]", "1"],
    ["[[\"0\"]]", "0"],
    ["[[\"1\"]]", "1"],
    ["[[\"1\",\"0\",\"1\"],[\"0\",\"0\",\"0\"],[\"1\",\"0\",\"1\"]]", "4"]
  ]),
  p("Find Minimum in Rotated Sorted", "medium", ["array","binary search"], {fn:"findMin",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given a sorted array `nums` rotated between 1 and n times, return the minimum element.",
    "1 <= nums.length <= 5000",
    [
    ["[3,4,5,1,2]", "1"],
    ["[4,5,6,7,0,1,2]", "0"],
    ["[11,13,15,17]", "11"],
    ["[2,1]", "1"],
    ["[5,1,2,3,4]", "1"]
  ]),
  p("Search in Rotated Sorted", "medium", ["array","binary search"], {fn:"search",ret:"int",params:[{name:"nums",type:"int[]"},{name:"target",type:"int"}]},
    "Given a rotated sorted array `nums` and an integer `target`, return the index of `target` or -1 if not found.",
    "1 <= nums.length <= 5000",
    [
    ["[4,5,6,7,0,1,2], 0", "4"],
    ["[4,5,6,7,0,1,2], 3", "-1"],
    ["[1], 0", "-1"],
    ["[1,3], 3", "1"],
    ["[5,1,3], 3", "2"]
  ]),
  p("Top K Frequent", "medium", ["array","hash table","heap"], {fn:"topKFrequent",ret:"int[]",params:[{name:"nums",type:"int[]"},{name:"k",type:"int"}]},
    "Given an integer array `nums` and integer `k`, return the `k` most frequent elements sorted descending by frequency (ties by value ascending).",
    "1 <= nums.length <= 10^5",
    [
    ["[1,1,1,2,2,3], 2", "[1,2]"],
    ["[1], 1", "[1]"],
    ["[4,1,-1,2,-1,2,3], 2", "[-1,2]"],
    ["[5,5,5,9,9,1], 1", "[5]"],
    ["[1,2,3], 3", "[1,2,3]"]
  ]),
  p("Sort Colors", "medium", ["array","two pointers","sorting"], {fn:"sortColors",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an array `nums` with values 0, 1, or 2 (representing red/white/blue), sort them in place and return the array.",
    "1 <= nums.length <= 300",
    [
    ["[2,0,2,1,1,0]", "[0,0,1,1,2,2]"],
    ["[2,0,1]", "[0,1,2]"],
    ["[0]", "[0]"],
    ["[1,2,0]", "[0,1,2]"],
    ["[2,2,2,1,1,0]", "[0,1,1,2,2,2]"]
  ]),
  p("Subsets", "medium", ["array","backtracking"], {fn:"subsets",ret:"int[][]",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums` of unique elements, return all possible subsets sorted lexicographically (each subset sorted ascending; outer list sorted by length then lex).",
    "1 <= nums.length <= 10",
    [
    ["[1,2,3]", "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]"],
    ["[0]", "[[],[0]]"],
    ["[1,2]", "[[],[1],[2],[1,2]]"],
    ["[1]", "[[],[1]]"],
    ["[5,6]", "[[],[5],[6],[5,6]]"]
  ]),
  p("Permutations", "medium", ["array","backtracking"], {fn:"permute",ret:"int[][]",params:[{name:"nums",type:"int[]"}]},
    "Given an array `nums` of distinct integers, return all possible permutations in lexicographic order (input is treated as set).",
    "1 <= nums.length <= 6",
    [
    ["[1,2,3]", "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"],
    ["[0,1]", "[[0,1],[1,0]]"],
    ["[1]", "[[1]]"],
    ["[1,2]", "[[1,2],[2,1]]"],
    ["[3,1,2]", "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"]
  ]),
  p("Combination Sum", "medium", ["array","backtracking"], {fn:"combinationSum",ret:"int[][]",params:[{name:"candidates",type:"int[]"},{name:"target",type:"int"}]},
    "Given an array of distinct integers `candidates` and a `target`, return all unique combinations of `candidates` (each used unlimited times) summing to `target`. Each combination ascending; result lex.",
    "1 <= candidates.length <= 30",
    [
    ["[2,3,6,7], 7", "[[2,2,3],[7]]"],
    ["[2,3,5], 8", "[[2,2,2,2],[2,3,3],[3,5]]"],
    ["[2], 1", "[]"],
    ["[1], 2", "[[1,1]]"],
    ["[3,5], 8", "[[3,5]]"]
  ]),
  p("Generate Parentheses", "medium", ["string","backtracking"], {fn:"generateParenthesis",ret:"string[]",params:[{name:"n",type:"int"}]},
    "Given `n` pairs of parentheses, return all combinations of well-formed parentheses, sorted lexicographically.",
    "1 <= n <= 8",
    [
    ["3", "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]"],
    ["1", "[\"()\"]"],
    ["2", "[\"(())\",\"()()\"]"],
    ["4", "[\"(((())))\",\"((()()))\",\"((())())\",\"((()))()\",\"(()(()))\",\"(()()())\",\"(()())()\",\"(())(())\",\"(())()()\",\"()((()))\",\"()(()())\",\"()(())()\",\"()()(())\",\"()()()()\"]"],
    ["0", "[\"\"]"]
  ]),
  p("Letter Combinations", "medium", ["string","backtracking"], {fn:"letterCombinations",ret:"string[]",params:[{name:"digits",type:"string"}]},
    "Given a string of digits 2-9, return all possible letter combinations that the number could represent on a phone (2->abc, 3->def, ..., 9->wxyz). Sorted lex.",
    "0 <= digits.length <= 4",
    [
    ["\"23\"", "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]"],
    ["\"\"", "[]"],
    ["\"2\"", "[\"a\",\"b\",\"c\"]"],
    ["\"7\"", "[\"p\",\"q\",\"r\",\"s\"]"],
    ["\"9\"", "[\"w\",\"x\",\"y\",\"z\"]"]
  ]),
  p("Decode Ways", "medium", ["string","dp"], {fn:"numDecodings",ret:"int",params:[{name:"s",type:"string"}]},
    "A digit string can be decoded as letters via 'A'=1 ... 'Z'=26. Given `s`, return the number of distinct decodings.",
    "1 <= s.length <= 100",
    [
    ["\"12\"", "2"],
    ["\"226\"", "3"],
    ["\"06\"", "0"],
    ["\"11106\"", "2"],
    ["\"10\"", "1"]
  ]),
  p("Decode String", "medium", ["string","stack"], {fn:"decodeString",ret:"string",params:[{name:"s",type:"string"}]},
    "Given an encoded string of the form k[encoded_string] (repeat encoded_string k times, can nest), return its decoded string.",
    "1 <= s.length <= 30",
    [
    ["\"3[a]2[bc]\"", "\"aaabcbc\""],
    ["\"3[a2[c]]\"", "\"accaccacc\""],
    ["\"2[abc]3[cd]ef\"", "\"abcabccdcdcdef\""],
    ["\"abc\"", "\"abc\""],
    ["\"2[2[a]]\"", "\"aaaa\""]
  ]),
  p("Daily Temperatures", "medium", ["array","stack"], {fn:"dailyTemperatures",ret:"int[]",params:[{name:"temperatures",type:"int[]"}]},
    "Given an array of daily temperatures, return an array such that `answer[i]` is the number of days until a warmer day, or 0 if none.",
    "1 <= temperatures.length <= 10^5",
    [
    ["[73,74,75,71,69,72,76,73]", "[1,1,4,2,1,1,0,0]"],
    ["[30,40,50,60]", "[1,1,1,0]"],
    ["[30,60,90]", "[1,1,0]"],
    ["[100,90,80]", "[0,0,0]"],
    ["[55]", "[0]"]
  ]),
  p("Subarray Sum Equals K", "medium", ["array","prefix sum","hash"], {fn:"subarraySum",ret:"int",params:[{name:"nums",type:"int[]"},{name:"k",type:"int"}]},
    "Given an integer array `nums` and integer `k`, return the number of contiguous subarrays whose sum equals `k`.",
    "1 <= nums.length <= 2*10^4",
    [
    ["[1,1,1], 2", "2"],
    ["[1,2,3], 3", "2"],
    ["[1], 0", "0"],
    ["[3,4,7,2,-3,1,4,2], 7", "4"],
    ["[-1,-1,1], 0", "1"]
  ]),
  p("Find Duplicates In Array", "medium", ["array"], {fn:"findDuplicates",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an array `nums` of length n where 1<=nums[i]<=n and at most one duplicate exists, return the duplicates sorted ascending.",
    "1 <= nums.length <= 10^5",
    [
    ["[4,3,2,7,8,2,3,1]", "[2,3]"],
    ["[1,1,2]", "[1]"],
    ["[1]", "[]"],
    ["[5,4,6,5,7,4]", "[4,5]"],
    ["[2,2]", "[2]"]
  ]),
  p("Longest Consecutive Sequence", "medium", ["array","hash"], {fn:"longestConsecutive",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an unsorted array `nums`, return the length of the longest consecutive elements sequence.",
    "0 <= nums.length <= 10^5",
    [
    ["[100,4,200,1,3,2]", "4"],
    ["[0,3,7,2,5,8,4,6,0,1]", "9"],
    ["[]", "0"],
    ["[1]", "1"],
    ["[1,2,0,1]", "3"]
  ]),
  p("Word Pattern", "medium", ["string","hash"], {fn:"wordPattern",ret:"bool",params:[{name:"pattern",type:"string"},{name:"s",type:"string"}]},
    "Given a `pattern` and a string `s`, return `true` if `s` follows the same pattern (one-to-one mapping of letters to space-separated words).",
    "1 <= pattern.length <= 300",
    [
    ["\"abba\", \"dog cat cat dog\"", "true"],
    ["\"abba\", \"dog cat cat fish\"", "false"],
    ["\"aaaa\", \"dog cat cat dog\"", "false"],
    ["\"abc\", \"x y z\"", "true"],
    ["\"ab\", \"x x\"", "false"]
  ]),
  p("Pow X N", "medium", ["math"], {fn:"myPow",ret:"double",params:[{name:"x",type:"double"},{name:"n",type:"int"}]},
    "Implement pow(x, n) computing x raised to the integer power n. Return the result rounded to 5 decimals.",
    "-100.0 < x < 100.0; -2^31 <= n <= 2^31-1",
    [
    ["2, 10", "1024"],
    ["2, -2", "0.25"],
    ["3, 0", "1"],
    ["1.5, 3", "3.375"],
    ["10, 2", "100"]
  ]),
  p("Count And Say", "medium", ["string"], {fn:"countAndSay",ret:"string",params:[{name:"n",type:"int"}]},
    "The count-and-say sequence: '1', '11', '21', '1211', '111221', ... where each term describes the previous. Return the n-th term.",
    "1 <= n <= 30",
    [
    ["1", "\"1\""],
    ["4", "\"1211\""],
    ["5", "\"111221\""],
    ["6", "\"312211\""],
    ["3", "\"21\""]
  ]),
  p("Multiply Strings", "medium", ["string","math"], {fn:"multiply",ret:"string",params:[{name:"num1",type:"string"},{name:"num2",type:"string"}]},
    "Given two non-negative integers `num1` and `num2` represented as strings, return their product as a string.",
    "1 <= num1.length, num2.length <= 200",
    [
    ["\"2\", \"3\"", "\"6\""],
    ["\"123\", \"456\"", "\"56088\""],
    ["\"0\", \"999\"", "\"0\""],
    ["\"99\", \"99\"", "\"9801\""],
    ["\"12\", \"10\"", "\"120\""]
  ]),
  p("Insert Interval", "medium", ["array","intervals"], {fn:"insert",ret:"int[][]",params:[{name:"intervals",type:"int[][]"},{name:"newInterval",type:"int[]"}]},
    "Given non-overlapping `intervals` sorted by start, insert `newInterval` and merge if necessary. Return the resulting list.",
    "0 <= intervals.length <= 10^4",
    [
    ["[[1,3],[6,9]], [2,5]", "[[1,5],[6,9]]"],
    ["[[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]", "[[1,2],[3,10],[12,16]]"],
    ["[], [5,7]", "[[5,7]]"],
    ["[[1,5]], [2,3]", "[[1,5]]"],
    ["[[1,5]], [6,8]", "[[1,5],[6,8]]"]
  ]),
  p("Merge Intervals", "medium", ["array","intervals","sorting"], {fn:"merge",ret:"int[][]",params:[{name:"intervals",type:"int[][]"}]},
    "Given an array of `intervals` where intervals[i]=[start,end], merge all overlapping intervals and return them sorted by start.",
    "1 <= intervals.length <= 10^4",
    [
    ["[[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]"],
    ["[[1,4],[4,5]]", "[[1,5]]"],
    ["[[1,4],[2,3]]", "[[1,4]]"],
    ["[[1,4],[5,6]]", "[[1,4],[5,6]]"],
    ["[[1,10],[2,3],[4,5]]", "[[1,10]]"]
  ]),
  p("Non Overlapping Intervals", "medium", ["array","intervals","greedy"], {fn:"eraseOverlapIntervals",ret:"int",params:[{name:"intervals",type:"int[][]"}]},
    "Given a set of `intervals`, return the minimum number to remove so the rest are non-overlapping.",
    "1 <= intervals.length <= 10^5",
    [
    ["[[1,2],[2,3],[3,4],[1,3]]", "1"],
    ["[[1,2],[1,2],[1,2]]", "2"],
    ["[[1,2],[2,3]]", "0"],
    ["[[1,100],[11,22],[1,11],[2,12]]", "2"],
    ["[[1,2]]", "0"]
  ]),
  p("Jump Game", "medium", ["array","greedy"], {fn:"canJump",ret:"bool",params:[{name:"nums",type:"int[]"}]},
    "Given an array of non-negative integers `nums` where each element is your max jump length, determine if you can reach the last index.",
    "1 <= nums.length <= 10^4",
    [
    ["[2,3,1,1,4]", "true"],
    ["[3,2,1,0,4]", "false"],
    ["[0]", "true"],
    ["[1,0,1]", "false"],
    ["[2,0,0]", "true"]
  ]),
  p("Sum of Two Integers", "medium", ["math","bit manipulation"], {fn:"getSum",ret:"int",params:[{name:"a",type:"int"},{name:"b",type:"int"}]},
    "Given two integers `a` and `b`, return their sum without using `+` or `-` operators.",
    "-1000 <= a, b <= 1000",
    [
    ["1, 2", "3"],
    ["2, 3", "5"],
    ["-1, 1", "0"],
    ["100, 200", "300"],
    ["-5, -10", "-15"]
  ]),
  p("Find Peak Element", "medium", ["array","binary search"], {fn:"findPeakElement",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "A peak element is greater than its neighbors. Given `nums` (nums[-1]=nums[n]=-Infinity, no equal adjacent), return the index of any peak.",
    "1 <= nums.length <= 1000",
    [
    ["[1,2,3,1]", "2"],
    ["[1,2,1,3,5,6,4]", "5"],
    ["[1]", "0"],
    ["[1,2]", "1"],
    ["[5,4,3,2,1]", "0"]
  ]),
  p("Kth Largest Element", "medium", ["array","sorting","heap"], {fn:"findKthLargest",ret:"int",params:[{name:"nums",type:"int[]"},{name:"k",type:"int"}]},
    "Given an array `nums` and integer `k`, return the kth largest element in the array.",
    "1 <= k <= nums.length <= 10^5",
    [
    ["[3,2,1,5,6,4], 2", "5"],
    ["[3,2,3,1,2,4,5,5,6], 4", "4"],
    ["[1], 1", "1"],
    ["[7,10,4,3,20,15], 3", "10"],
    ["[2,1], 1", "2"]
  ]),
  p("Median of Two Sorted Arrays", "hard", ["array","binary search"], {fn:"findMedianSortedArrays",ret:"double",params:[{name:"nums1",type:"int[]"},{name:"nums2",type:"int[]"}]},
    "Given two sorted arrays `nums1` and `nums2`, return the median of the merged sorted array.",
    "0 <= nums1.length, nums2.length <= 1000",
    [
    ["[1,3], [2]", "2"],
    ["[1,2], [3,4]", "2.5"],
    ["[0,0], [0,0]", "0"],
    ["[1], [2,3,4]", "2.5"],
    ["[1,2,3,4,5], []", "3"]
  ]),
  p("Trapping Rain Water", "hard", ["array","two pointers","stack"], {fn:"trap",ret:"int",params:[{name:"height",type:"int[]"}]},
    "Given n non-negative integers representing an elevation map, compute how much rainwater can be trapped between bars.",
    "1 <= height.length <= 2*10^4",
    [
    ["[0,1,0,2,1,0,1,3,2,1,2,1]", "6"],
    ["[4,2,0,3,2,5]", "9"],
    ["[1]", "0"],
    ["[3,0,2,0,4]", "7"],
    ["[5,4,1,2]", "1"]
  ]),
  p("Largest Rectangle Histogram", "hard", ["array","stack"], {fn:"largestRectangleArea",ret:"int",params:[{name:"heights",type:"int[]"}]},
    "Given heights of histogram bars (each width 1), return the area of the largest rectangle that fits inside.",
    "1 <= heights.length <= 10^5",
    [
    ["[2,1,5,6,2,3]", "10"],
    ["[2,4]", "4"],
    ["[1]", "1"],
    ["[6,2,5,4,5,1,6]", "12"],
    ["[2,1,2]", "3"]
  ]),
  p("Sliding Window Maximum", "hard", ["array","deque","sliding window"], {fn:"maxSlidingWindow",ret:"int[]",params:[{name:"nums",type:"int[]"},{name:"k",type:"int"}]},
    "Given an array `nums` and integer `k`, return the max of each sliding window of size `k`.",
    "1 <= nums.length <= 10^5",
    [
    ["[1,3,-1,-3,5,3,6,7], 3", "[3,3,5,5,6,7]"],
    ["[1], 1", "[1]"],
    ["[1,-1], 1", "[1,-1]"],
    ["[9,11], 2", "[11]"],
    ["[4,-2,5,3,6], 3", "[5,5,6]"]
  ]),
  p("First Missing Positive", "hard", ["array"], {fn:"firstMissingPositive",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an unsorted integer array `nums`, return the smallest positive integer that does not appear.",
    "1 <= nums.length <= 10^5",
    [
    ["[1,2,0]", "3"],
    ["[3,4,-1,1]", "2"],
    ["[7,8,9,11,12]", "1"],
    ["[1]", "2"],
    ["[2]", "1"]
  ]),
  p("N Queens Count", "hard", ["backtracking"], {fn:"totalNQueens",ret:"int",params:[{name:"n",type:"int"}]},
    "Given an integer `n`, return the number of distinct solutions to the n-queens puzzle.",
    "1 <= n <= 9",
    [
    ["4", "2"],
    ["1", "1"],
    ["8", "92"],
    ["5", "10"],
    ["6", "4"]
  ]),
  p("Word Ladder", "hard", ["bfs","string"], {fn:"ladderLength",ret:"int",params:[{name:"beginWord",type:"string"},{name:"endWord",type:"string"},{name:"wordList",type:"string[]"}]},
    "Given two words `beginWord` and `endWord`, and a `wordList`, return the length of the shortest transformation sequence from `beginWord` to `endWord` (changing one letter at a time, each step must be in wordList; endWord must be in list). Return 0 if no such sequence.",
    "1 <= wordList.length <= 5000",
    [
    ["\"hit\", \"cog\", [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", "5"],
    ["\"hit\", \"cog\", [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]", "0"],
    ["\"a\", \"c\", [\"a\",\"b\",\"c\"]", "2"],
    ["\"hot\", \"dog\", [\"hot\",\"dog\"]", "0"],
    ["\"hot\", \"dog\", [\"hot\",\"dog\",\"dot\"]", "3"]
  ]),
  p("Edit Distance", "hard", ["dp","string"], {fn:"minDistance",ret:"int",params:[{name:"word1",type:"string"},{name:"word2",type:"string"}]},
    "Given two strings `word1` and `word2`, return the minimum number of operations (insert, delete, replace) to convert word1 to word2.",
    "0 <= word1.length, word2.length <= 500",
    [
    ["\"horse\", \"ros\"", "3"],
    ["\"intention\", \"execution\"", "5"],
    ["\"\", \"abc\"", "3"],
    ["\"abc\", \"\"", "3"],
    ["\"abc\", \"abc\"", "0"]
  ]),
  p("Regular Expression Matching", "hard", ["dp","string"], {fn:"isMatch",ret:"bool",params:[{name:"s",type:"string"},{name:"p",type:"string"}]},
    "Implement regex matching for `.` (any single char) and `*` (0+ of preceding). Match must cover the entire string `s`.",
    "1 <= s.length <= 20",
    [
    ["\"aa\", \"a\"", "false"],
    ["\"aa\", \"a*\"", "true"],
    ["\"ab\", \".*\"", "true"],
    ["\"aab\", \"c*a*b\"", "true"],
    ["\"mississippi\", \"mis*is*p*.\"", "false"]
  ]),
  p("Wildcard Matching", "hard", ["dp","string"], {fn:"isMatch",ret:"bool",params:[{name:"s",type:"string"},{name:"p",type:"string"}]},
    "Implement wildcard matching: `?` matches any single char, `*` matches any sequence (including empty). Match must cover entire `s`.",
    "0 <= s.length <= 200",
    [
    ["\"aa\", \"a\"", "false"],
    ["\"aa\", \"*\"", "true"],
    ["\"cb\", \"?a\"", "false"],
    ["\"adceb\", \"*a*b\"", "true"],
    ["\"acdcb\", \"a*c?b\"", "false"]
  ]),
  p("Longest Valid Parentheses", "hard", ["string","dp","stack"], {fn:"longestValidParentheses",ret:"int",params:[{name:"s",type:"string"}]},
    "Given a string of '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    "0 <= s.length <= 3*10^4",
    [
    ["\"(()\"", "2"],
    ["\")()())\"", "4"],
    ["\"\"", "0"],
    ["\"()(()\"", "2"],
    ["\"((()))\"", "6"]
  ]),
  p("Burst Balloons", "hard", ["dp","array"], {fn:"burstBalloons",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given balloons with values `nums`, bursting balloon i gives nums[i-1]*nums[i]*nums[i+1] coins (treat out-of-range as 1). Return the max coins.",
    "1 <= nums.length <= 100",
    [
    ["[3,1,5,8]", "167"],
    ["[1,5]", "10"],
    ["[5]", "5"],
    ["[1,2,3]", "12"],
    ["[7,9,8,0,7,1,3,5,5,2]", "1654"]
  ]),
  p("Minimum Window Substring", "hard", ["string","sliding window"], {fn:"minWindow",ret:"string",params:[{name:"s",type:"string"},{name:"t",type:"string"}]},
    "Given strings `s` and `t`, return the smallest substring of `s` that contains every character of `t` (with multiplicity). Return \"\" if no such window.",
    "1 <= s.length, t.length <= 10^5",
    [
    ["\"ADOBECODEBANC\", \"ABC\"", "\"BANC\""],
    ["\"a\", \"a\"", "\"a\""],
    ["\"a\", \"aa\"", "\"\""],
    ["\"ab\", \"b\"", "\"b\""],
    ["\"aa\", \"aa\"", "\"aa\""]
  ]),
  p("Palindrome Partitioning Min Cuts", "hard", ["string","dp"], {fn:"minCut",ret:"int",params:[{name:"s",type:"string"}]},
    "Given a string `s`, return the minimum number of cuts needed to partition `s` such that every substring is a palindrome.",
    "1 <= s.length <= 2000",
    [
    ["\"aab\"", "1"],
    ["\"a\"", "0"],
    ["\"ab\"", "1"],
    ["\"abc\"", "2"],
    ["\"abacdef\"", "4"]
  ]),
  p("Distinct Subsequences", "hard", ["dp","string"], {fn:"numDistinct",ret:"int",params:[{name:"s",type:"string"},{name:"t",type:"string"}]},
    "Given strings `s` and `t`, return the number of distinct subsequences of `s` that equal `t`.",
    "1 <= s.length, t.length <= 1000",
    [
    ["\"rabbbit\", \"rabbit\"", "3"],
    ["\"babgbag\", \"bag\"", "5"],
    ["\"abc\", \"\"", "1"],
    ["\"abc\", \"abc\"", "1"],
    ["\"a\", \"b\"", "0"]
  ]),
  p("Maximal Rectangle", "hard", ["matrix","dp","stack"], {fn:"maximalRectangle",ret:"int",params:[{name:"matrix",type:"string[][]"}]},
    "Given a binary matrix of '0' and '1', return the area of the largest rectangle containing only 1s.",
    "1 <= rows, cols <= 200",
    [
    ["[[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]", "6"],
    ["[[\"0\"]]", "0"],
    ["[[\"1\"]]", "1"],
    ["[[\"1\",\"1\"],[\"1\",\"1\"]]", "4"],
    ["[[\"1\",\"0\"],[\"1\",\"1\"]]", "2"]
  ]),
  p("Longest Increasing Path", "hard", ["matrix","dfs","dp"], {fn:"longestIncreasingPath",ret:"int",params:[{name:"matrix",type:"int[][]"}]},
    "Given an m x n integer matrix, return the length of the longest strictly increasing path. From any cell, move to 4 neighbors.",
    "1 <= m, n <= 200",
    [
    ["[[9,9,4],[6,6,8],[2,1,1]]", "4"],
    ["[[3,4,5],[3,2,6],[2,2,1]]", "4"],
    ["[[1]]", "1"],
    ["[[1,2]]", "2"],
    ["[[7,8,9],[9,7,6],[7,2,3]]", "6"]
  ]),
  p("Word Search II", "hard", ["matrix","trie","dfs"], {fn:"findWords",ret:"string[]",params:[{name:"board",type:"string[][]"},{name:"words",type:"string[]"}]},
    "Given an m x n `board` and list of `words`, return all words present in the board (formed by adjacent letters horizontally/vertically, no cell reused per word). Sorted ascending.",
    "1 <= m, n <= 12",
    [
    ["[[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]], [\"oath\",\"pea\",\"eat\",\"rain\"]", "[\"eat\",\"oath\"]"],
    ["[[\"a\",\"b\"],[\"c\",\"d\"]], [\"abcb\"]", "[]"],
    ["[[\"a\"]], [\"a\"]", "[\"a\"]"],
    ["[[\"a\",\"b\"],[\"c\",\"d\"]], [\"ab\",\"cd\",\"ac\",\"db\"]", "[\"ab\",\"ac\",\"cd\",\"db\"]"],
    ["[[\"a\",\"a\"]], [\"aaa\"]", "[]"]
  ]),
  p("Find Median From Stream", "hard", ["heap","design"], {fn:"medianStream",ret:"double[]",params:[{name:"nums",type:"int[]"}]},
    "Given a stream of integers `nums`, return the array of medians after each insertion. The median of a stream of even length is the average of the two middle values.",
    "1 <= nums.length <= 10^4",
    [
    ["[1,2,3]", "[1,1.5,2]"],
    ["[5,15,1,3]", "[5,10,5,4]"],
    ["[1]", "[1]"],
    ["[2,2,2,2]", "[2,2,2,2]"],
    ["[1,3,5,7,9]", "[1,2,3,4,5]"]
  ]),
  p("Russian Doll Envelopes", "hard", ["dp","binary search"], {fn:"maxEnvelopes",ret:"int",params:[{name:"envelopes",type:"int[][]"}]},
    "Given a 2D array of `envelopes` [w,h], return the maximum number of envelopes you can nest (one fits in another if both w and h are strictly smaller).",
    "1 <= envelopes.length <= 10^5",
    [
    ["[[5,4],[6,4],[6,7],[2,3]]", "3"],
    ["[[1,1],[1,1],[1,1]]", "1"],
    ["[[1,2],[2,3],[3,4]]", "3"],
    ["[[4,5],[4,6],[6,7],[2,3],[1,1]]", "4"],
    ["[[2,100],[3,200],[4,300],[5,500],[5,400],[5,250],[6,370],[6,360],[7,380]]", "5"]
  ]),
  p("Longest Substring K Distinct", "hard", ["string","sliding window","hash"], {fn:"lengthOfLongestSubstringKDistinct",ret:"int",params:[{name:"s",type:"string"},{name:"k",type:"int"}]},
    "Given a string `s` and integer `k`, return the length of the longest substring containing at most `k` distinct characters.",
    "1 <= s.length <= 5*10^4",
    [
    ["\"eceba\", 2", "3"],
    ["\"aa\", 1", "2"],
    ["\"a\", 0", "0"],
    ["\"abcabcabc\", 2", "2"],
    ["\"abaccc\", 2", "4"]
  ]),
  p("Maximum Profit Three Transactions", "hard", ["array","dp"], {fn:"maxProfit",ret:"int",params:[{name:"prices",type:"int[]"}]},
    "Given an array `prices`, find the maximum profit from at most three buy/sell transactions (must sell before buying again).",
    "1 <= prices.length <= 10^5",
    [
    ["[3,3,5,0,0,3,1,4]", "8"],
    ["[1,2,3,4,5]", "4"],
    ["[7,6,4,3,1]", "0"],
    ["[1]", "0"],
    ["[6,1,3,2,4,7]", "9"]
  ]),
  p("Recover BST Inorder", "hard", ["array","tree"], {fn:"recoverTree",ret:"int[]",params:[{name:"inorder",type:"int[]"}]},
    "Two values in a sorted (BST inorder traversal) array `inorder` were swapped. Recover the sorted array (in place) and return it.",
    "2 <= inorder.length <= 1000",
    [
    ["[1,3,2,4]", "[1,2,3,4]"],
    ["[3,2,1]", "[1,2,3]"],
    ["[1,2,3]", "[1,2,3]"],
    ["[5,1,3,4,2]", "[1,2,3,4,5]"],
    ["[1,4,3,2,5]", "[1,2,3,4,5]"]
  ]),
  p("Count Smaller After Self", "hard", ["array","merge sort"], {fn:"countSmaller",ret:"int[]",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums`, return an array `counts` where counts[i] is the number of smaller elements to the right of nums[i].",
    "1 <= nums.length <= 10^5",
    [
    ["[5,2,6,1]", "[2,1,1,0]"],
    ["[-1]", "[0]"],
    ["[-1,-1]", "[0,0]"],
    ["[2,0,1]", "[2,0,0]"],
    ["[1,2,3,4]", "[0,0,0,0]"]
  ]),
  p("Reverse Pairs", "hard", ["array","merge sort"], {fn:"reversePairs",ret:"int",params:[{name:"nums",type:"int[]"}]},
    "Given an integer array `nums`, return the number of pairs (i, j) where i < j and nums[i] > 2 * nums[j].",
    "1 <= nums.length <= 5*10^4",
    [
    ["[1,3,2,3,1]", "2"],
    ["[2,4,3,5,1]", "3"],
    ["[1,2,3]", "0"],
    ["[5,4,3,2,1]", "4"],
    ["[10,1,1,1]", "3"]
  ]),
];
