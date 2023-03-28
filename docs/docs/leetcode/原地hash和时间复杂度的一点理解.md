---
title: 原地hash和时间复杂度的一点理解
date: 2020-12-01
---
## 话不多说直接看题目 ##
[287寻找重复数：](https://leetcode-cn.com/problems/find-the-duplicate-number/)
>给定一个包含 n + 1 个整数的数组 nums，其数字都在 1 到 n 之间（包括 1 和 n），可知至少存在一个重复的整数。假设只有一个重复的整数，找出这个重复的数。
>#####**示例**#####
输入: [1,3,4,2,2]
输出: 2
输入: [3,1,3,4,2]
输出: 3
给你一个未排序的整数数组，请你找出其中没有出现的最小的正整数。

先用hash表来解决
```
var fn = function(nums, target) {
    const map = {};
    for(let i=0; i<nums.length; ++i){
        if(map[nums[i]]) return nums[i]
        map[nums[i]] = 1
    }
};
```
很简单，完美解决，还有其他方式吗
以输入[1,3,4,2,2]为例，我们最终得到的map是
```
{ 1:1, 2:1, 3:1, 4:1 }
```
可以看到这个对象的 keys 是 [1,2,3,4], 就是数组下标+1。也就是说 我们可以把数组下标当作对象的key，来构建这个hashmap。从而把空间复杂度从 O(n) 降到 O(1)。

具体解题思路：循环，如果`nums[i]!== i + 1`, 把 `nums[i]` 放到下标为 `nums[i]- 1`的位置，然后把`nums[i] - 1`位置上原本的数 `a`，放到下标为`a - 1`,并以此循环循环，如果`nums[i] === nums[nums[i] - 1]`则说明这个数出现了两次（被放置到正确的位置过，或者原本就存在）。文字可能说的不清楚，看代码
```
var findDuplicate = function(nums) {
  for(let i = 0, len = nums.length; i < len; ++i) {
    // 如果当前位置不是i + 1, 进循环去换
    while(nums[i] !== i + 1) { 
      if(nums[nums[i] - 1] === nums[i]) {
        return nums[i]
      }
      let temp = nums[nums[i] - 1]
      nums[nums[i] - 1] = nums[i]
      nums[i] = temp
    }
  }
};
```
这样我们使用原本的数组nums来代替map，使空间复杂度降成 O(1)。
需要注意的是，时间复杂度并没有因为两层循环增加为 O(n^2)，因为目标语句（交换数值的部分）执行的次数依然是n，所以时间复杂度依然是 O(n)。
再次重申，这道题的题目要求不能修改原数组，这种解法是不符合要求的，不过因为忽略这个条件的话比较合适举例。下面看一道正统的原地hash题目。
## 第二题 ##
[41缺失的第一个整数：](https://leetcode-cn.com/problems/first-missing-positive/)
>给你一个未排序的整数数组，请你找出其中没有出现的最小的正整数。
>#####**示例**#####
输入: [1,2,0]
输出: 3
输入: [3,4,-1,1]
输出: 2
输入: [7,8,9,11,12]
输出: 1

题目给的提示是你的算法的时间复杂度应为O(n)，并且只能使用常数级别的额外空间。完美符合。
要注意的是，以[7,8,9,11,12]为例，我们不能为了把7放到数组第(7-1)位，而改变数组大小，因为数组length是5那么缺失的数只有可能是1-6，那么大于数组length或者小于0的数就不需要管了，置为0就可以了。代码如下。
```
var firstMissingPositive = function(nums) {
  let len = nums.length
  for(let i = 0; i < len; ++i) {
    while(nums[i] !== i + 1 && nums[i] > 0) {
      if(nums[nums[i] - 1] === nums[i] || nums[i] > nums.length) {
        nums[i] = 0
      } else {
        let mid = nums[nums[i] - 1]
        nums[nums[i] - 1] = nums[i]
        nums[i] = mid
      }
    }
  }
  for(let i = 0; i < nums.length; ++i) {
    if(!(nums[i] > 0)) {
      return i + 1
    }
  }
  return (nums[nums.length - 1] || 0) + 1
};
```

## 第三题 ##
[80删除排序数组中的重复项 II：](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array-ii/)
>给定一个增序排列数组 nums ，你需要在 原地 删除重复出现的元素，使得每个元素最多出现两次，返回移除后数组的新长度。
不要使用额外的数组空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成。

>#####**示例**#####
输入：nums = [1,1,1,2,2,3]
输出：5, nums = [1,1,2,2,3]
解释：函数应返回新长度 length = 5, 并且原数组的前五个元素被修改为 1, 1, 2, 2, 3 。 你不需要考虑数组中超出新长度后面的元素。

>输入：nums = [0,0,1,1,1,1,2,3,3]
输出：7, nums = [0,0,1,1,2,3,3]
解释：函数应返回新长度 length = 7, 并且原数组的前五个元素被修改为 0, 0, 1, 1, 2, 3, 3 。 你不需要考虑数组中超出新长度后面的元素。

先说一下我一开始的思路：两个指针，一个begin指向第一个数，end向后找到第一个与begin不同的数，如果两个指针之间距离大于2， 说明出现了两次以上的相同数字，使用splice删除，然后更新begin和end的位置继续。
```
var removeDuplicates = function(nums) {
  for(let begin = end = 0; begin < nums.length; ++end) {
    if(nums[begin] !== nums[end]) {
      if(end - begin > 2) {
        nums.splice(begin, end - begin - 2)
        begin = end = begin + 2
      } else {
        begin = end
      }
    }
  }
  return nums.length
};
```
我以为复杂度是O(n),但是忽略了调用splice这个api本身的复杂度,如果认为splice是O(n),那么最终复杂度应该是O(n^2)。

然后就是原地hash的解法，不过这次不能单纯的用数组下标来构建了，需要借用一个指针来更新，所以还是两个指针，一个指针begin更新结果，一个指针 i 配合 i-1 向前推进。
如果`nums[i] !== nums[i-1]`说明出现了新的数字，把double置为false，更新nums[begin]
如果`nums[i] === nums[i-1]` 且 `double=false`说明第一次出现相同的数字，更新nums[begin]，把double置为true，意为已经有两个相同的数字了，后面不用理：
```
var removeDuplicates = function(nums) {
  if(nums.length <= 2) return nums.length;
  var begin = 1,
    doubled = false;
  for(var i = 1; i < nums.length; i++) {
    if(nums[i] !== nums[i-1]) {
      doubled = false;
      nums[begin++] = nums[i];
    } else if(!doubled) {
      doubled = true;
      nums[begin++] = nums[i];
    }
  }
  nums.splice(begin);
  return begin;
};
```