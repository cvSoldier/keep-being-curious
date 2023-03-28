---
title: LeetCode.28 实现 strStr (JS sunday算法)
date: 2020-07-26
---

### 题目 ###
[实现 strStr()：](https://leetcode-cn.com/problems/implement-strstr/)
>给定一个 haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从0开始)。如果不存在，则返回  -1。
>
>**示例**
输入: haystack = "hello", needle = "ll"
输出: 2

>输入: haystack = "aaaaa", needle = "bba"
输出: -1

>说明:
当 needle 是空字符串时，我们应当返回什么值呢？这是一个在面试中很好的问题。
对于本题而言，当 needle 是空字符串时我们应当返回 0 。这与C语言的 strstr() 以及 Java的 indexOf() 定义相符。
### 解 ###
先来一个暴力解法
```
var strStr = function(haystack, needle) {
  if (needle == "") return 0;
  let j = 0;
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle[j]) {
      if (j == needle.length - 1) return i-j;
      j++;
    }
    else {
      i -= j, j = 0;
    }
  }
  return -1;
};
```
时间复杂度O(mn), 就是两层循环。这种解法低效的原因在于有很多不必要的匹配尝试。很多高效的字符串匹配算法，它们的核心思想都是一样样的，想办法利用已有信息，减少不必要的尝试。像经典的KMP算法使用next数组来存储模式串信息来减少匹配，或者bm的好后缀坏字符规则，下面要介绍的sunday比前两者都要更简单易懂，在某些情况下也更高效。

sunday算法在匹配失败时关注的是主串中参加匹配的最末位字符的下一位字符。
如果该字符没有在模式串中出现则直接跳过，即移动位数 = 模式串长度 + 1；
否则，使模式串中最后出现的该字符与其对其，即移动位数 = 模式串长度 - 该字符最右出现的位置(以0开始) = 模式串中该字符最右出现的位置到尾部的距离 + 1。
下面以主串'substring searching'，模式串'search'为例  

![image.png](https://segmentfault.com/img/bVbKeTH)  
不匹配，主串参与匹配的最末尾字符的下一个字符，也就是 i 没有出现在模式串中，那么模式串直接移动到 i 的下一位  
![image.png](https://segmentfault.com/img/bVbKeTs)  
移动之后不匹配，主串参与匹配的最末尾字符的下一个字符，也就是 r 出现在模式串中，且**最靠后**的位置是 3，那么模式串移动 6 - 3 = 3  
![image.png](https://segmentfault.com/img/bVbKeVt)  
匹配成功。

复杂度方面，平均是O(n)。最坏的情况，每次都往后跳一，而且都是比对到模式串尾才不匹配，这样和暴力差不多，都是O(mn)，比如 'bbbbbbbbbbbbbb'和'bbcb',最好的情况，每次都跳模式串长度 + 1，每次对比都是第一个就不匹配，比如 'abcdefghijklmn'和'xyz',这样是O(m/n)

代码
```
var strStr = function(haystack, needle) {
  if (needle == '') return 0

  const map = {}
  const len = needle.length
  for(let i = 0; i < len; i++) {
    map[needle[i]] = i
  }
  let j = 0
  for(let i = 0; i < haystack.length;) {
    if (haystack[i + j] == needle[j]) {
      if (j == len - 1) return i;
      j++;
    } else {
      let index = map[haystack[i + len]]
      if(index === undefined) {
        i += len + 1
      } else {
        i += len - index
      }
      j = 0
    }
  }
  return -1
};
```
