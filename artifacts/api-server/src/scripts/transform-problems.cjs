const fs = require('fs');
const path = '/home/roshan-raj/project_100/Algorace/artifacts/api-server/src/scripts/problems-data.ts';
let content = fs.readFileSync(path, 'utf8');

const sigMap = {
  "Two Sum": { fn: "twoSum", ret: "int[]", params: [["nums","int[]"],["target","int"]] },
  "Valid Parentheses": { fn: "isValid", ret: "bool", params: [["s","string"]] },
  "Palindrome Check": { fn: "isPalindrome", ret: "bool", params: [["s","string"]] },
  "Binary Search": { fn: "search", ret: "int", params: [["nums","int[]"],["target","int"]] },
  "Climbing Stairs": { fn: "climbStairs", ret: "int", params: [["n","int"]] },
  "Best Time to Buy and Sell Stock": { fn: "maxProfit", ret: "int", params: [["prices","int[]"]] },
  "Reverse String": { fn: "reverseString", ret: "string", params: [["s","string"]] },
  "Maximum Subarray": { fn: "maxSubArray", ret: "int", params: [["nums","int[]"]] },
  "Single Number": { fn: "singleNumber", ret: "int", params: [["nums","int[]"]] },
  "Move Zeroes": { fn: "moveZeroes", ret: "int[]", params: [["nums","int[]"]] },
  "Contains Duplicate": { fn: "containsDuplicate", ret: "bool", params: [["nums","int[]"]] },
  "Plus One": { fn: "plusOne", ret: "int[]", params: [["digits","int[]"]] },
  "Merge Sorted Array": { fn: "merge", ret: "int[]", params: [["nums1","int[]"],["nums2","int[]"]] },
  "Roman to Integer": { fn: "romanToInt", ret: "int", params: [["s","string"]] },
  "Length of Last Word": { fn: "lengthOfLastWord", ret: "int", params: [["s","string"]] },
  "FizzBuzz": { fn: "fizzBuzz", ret: "string[]", params: [["n","int"]] },
  "Reverse Integer": { fn: "reverse", ret: "int", params: [["x","int"]] },
  "Valid Anagram": { fn: "isAnagram", ret: "bool", params: [["s","string"],["t","string"]] },
  "First Unique Character": { fn: "firstUniqChar", ret: "int", params: [["s","string"]] },
  "Squares of Sorted Array": { fn: "sortedSquares", ret: "int[]", params: [["nums","int[]"]] },
  "Intersection of Two Arrays": { fn: "intersection", ret: "int[]", params: [["nums1","int[]"],["nums2","int[]"]] },
  "Power of Two": { fn: "isPowerOfTwo", ret: "bool", params: [["n","int"]] },
  "Missing Number": { fn: "missingNumber", ret: "int", params: [["nums","int[]"]] },
  "Majority Element": { fn: "majorityElement", ret: "int", params: [["nums","int[]"]] },
  "Remove Duplicates": { fn: "removeDuplicates", ret: "int[]", params: [["nums","int[]"]] },
  "Merge Two Sorted Lists": { fn: "mergeTwoLists", ret: "int[]", params: [["list1","int[]"],["list2","int[]"]] },
  "Container With Most Water": { fn: "maxArea", ret: "int", params: [["height","int[]"]] },
  "3Sum": { fn: "threeSum", ret: "int[][]", params: [["nums","int[]"]] },
  "Longest Substring Without Repeating": { fn: "lengthOfLongest", ret: "int", params: [["s","string"]] },
  "Group Anagrams": { fn: "groupAnagrams", ret: "string[]", params: [["strs","string[]"]] },
  "Product Except Self": { fn: "productExceptSelf", ret: "int[]", params: [["nums","int[]"]] },
  "Top K Frequent": { fn: "topKFrequent", ret: "int[]", params: [["nums","int[]"],["k","int"]] },
  "Search in Rotated Sorted Array": { fn: "searchRotated", ret: "int", params: [["nums","int[]"],["target","int"]] },
  "Find Minimum in Rotated Sorted Array": { fn: "findMin", ret: "int", params: [["nums","int[]"]] },
  "Coin Change": { fn: "coinChange", ret: "int", params: [["coins","int[]"],["amount","int"]] },
  "House Robber": { fn: "rob", ret: "int", params: [["nums","int[]"]] },
};

const defaultSig = (title) => {
  const fn = title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  return { fn, ret: "int", params: [["nums", "int[]"]] };
};

const lines = content.split('\n');
const newLines = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const m = line.match(/^\s*p\("([^"]+)"/);
  if (m) {
    const title = m[1];
    const sig = sigMap[title] || defaultSig(title);
    const sigStr = `{fn:"${sig.fn}",ret:"${sig.ret}",params:[${sig.params.map(([n,t])=>`{name:"${n}",type:"${t}"}`).join(',')}]}`;
    
    const oldArgMatch = line.match(/,\s*"[^"]*"\s*,\s*$/);
    if (oldArgMatch) {
      const newLine = line.replace(/,\s*"[^"]*"\s*,\s*$/, `, ${sigStr},`);
      newLines.push(newLine);
    } else {
      const newLine = line.replace(/,\s*"[^"]*",$/, `, ${sigStr},`);
      newLines.push(newLine);
    }
  } else if (line.match(/^`string solution\(stringstream/) || line.match(/^`public String solution\(String/)) {
    while (i < lines.length && !lines[i].match(/^\s*\)/)) {
      i++;
    }
    i--;
  } else {
    newLines.push(line);
  }
  i++;
}

fs.writeFileSync(path, newLines.join('\n'));
console.log('Done. Processed', newLines.length, 'lines');
