---
title: LeetCode.11 盛最多水的容器(JS)
date: 2019-07-18
---

## 一、题目 ##
[盛最多水的容器：](https://leetcode-cn.com/problems/container-with-most-water/)
>给定 n 个非负整数 a1，a2，...，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0)。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。

>说明：你不能倾斜容器，且 n 的值至少为 2。

![图片描述][1]
>图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。

## 二、我的答案 ##
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;首先分析一下题目，与[接雨水][2]那道题不同的是，本题所求为“找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水”, 也就是说[6,7,6]这样的数组，最多接水的两条线的下标为0和2。同时也可以看出这道题与最大值无关，计算公式应该是`Math.min(height[head], height[tail]) * (tail - head)`,head和tail都出来，双指针不要太明显
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因为每次接水面积的高是两个指针中指向的值较小的那个，所以为了求最大值，我们每次向中间移动的指针也应该是辣一个，思路理清，代码如下
```
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
  let tail = height.length - 1, head = 0;
  let container = 0, temp;
  while(head < tail) {
    temp = (tail - head) * Math.min(height[head], height[tail])
    container < temp ? container = temp : null
    if(height[head] < height[tail]) {
      head++
    } else {
      tail--
    }
  }
  return container
};
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;


##三、优秀答案##

```
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
  let i = 0;
  let j = height.length - 1;
  let max = 0
  while(i<j) {
    let min = Math.min(height[i], height[j])
    max = Math.max(((j-i) * min), max)
    if (height[i] > height[j]) {
      j--
    } else {
      i++
    }
  }
  return max
};
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;取最大值使用`max = Math.max((j - i) * min), max)`还是非常秀的


  [1]: https://segmentfault.com/img/bVbfnQP?w=801&h=383
  [2]: https://leetcode-cn.com/problems/trapping-rain-water/