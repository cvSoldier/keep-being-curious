---
title: Flex布局语法笔记
date: 2019-05-30
---

>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;网页布局（layout）是 CSS 的一个重点应用。布局的传统解决方案，基于盒状模型，依赖 display 属性 + position属性 + float属性。它对于那些特殊布局非常不方便，比如万恶的垂直居中。
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2009年，W3C 提出了一种新的方案----Flex 布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持，这意味着，现在就能很安全地使用这项功能。(ie 10+支持flex布局，对于我现在的项目，因为使用cors解决跨域，所以对ie的支持也是ie10+，完美契合)
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;嘴上说着支持，但是ie从来不让我们失望，[flex在ie下的bug和解决方法][1]，有需自取。
## 一、基础和术语 ##
### 1、flex布局是啥 ###
Flex 是 Flexible Box 的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。
任何一个容器都可以指定为 Flex 布局。
```
.box{
  display: flex;
}
```
行内元素也可以使用 Flex 布局。
```
.box{
  display: inline-flex;
}
```
Webkit 内核的浏览器，必须加上-webkit前缀。当然如果你也使用了无敌的autoprefixer就不需要这么做了。
```
.box{
  display: -webkit-flex; /* Safari */
  display: flex;
}
```
还有一点需要注意的是设为 Flex 布局以后，子元素的float、clear和vertical-align属性将失效。
### 2、基本概念 ###
采用 Flex 布局的元素，称为 Flex 容器（flex container），简称"容器"。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item），简称"项目"。
![解使各种术语的图片][2]
容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做main start，结束位置叫做main end；交叉轴的开始位置叫做cross start，结束位置叫做cross end。
项目默认沿主轴排列。单个项目占据的主轴空间叫做main size，占据的交叉轴空间叫做cross size。
## 二、属性 ##
### 1、容器的属性 ###
容器可以设置的属性共有以下6个

 - flex-direction
 - flex-wrap
 - flex-flow
 - justify-content
 - align-items
 - align-content
####1.1 flex-direction####
flex-direction属性决定主轴的方向（即项目的排列方向）。
![flex-direction图片描述][3]
```
.box {
  flex-direction: row | row-reverse | column | column-reverse;
}
```
该属性的4个值分别表示：
 - row（默认值）：主轴为水平方向，起点在左端。
 - row-reverse：主轴为水平方向，起点在右端。
 - column：主轴为垂直方向，起点在上沿。
 - column-reverse：主轴为垂直方向，起点在下沿。
#### 1.2 flex-wrap####
默认情况下，项目都排在一条线（又称"轴线"）上。flex-wrap属性定义，如果一条轴线排不下，如何换行。
![flex-wrap的图片描述][4]
```
.box{
  flex-wrap: nowrap | wrap | wrap-reverse;
}
```
该属性的3个值分别表示：
 - nowrap（默认）：不换行。
 - wrap：换行，第一行在上方。
 - wrap-reverse：换行，第一行在下方。
#### 1.3 flex-flow####
flex-flow属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap。
```
.box {
  flex-flow: <flex-direction> || <flex-wrap>;
}
```
#### 1.4 justify-content属性 ####
justify-content属性定义了项目在主轴上的对齐方式。
![justify-content的图片描述][5]
```
.box {
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
}
```
该属性的6个值分别表示（具体对齐方式与轴的方向有关。下面假设主轴为从左到右）：
 - flex-start（默认值）：左对齐
 - flex-end：右对齐
 - center： 居中
 - space-between：两端对齐，项目之间的间隔都相等。
 - space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。
 - space-evenly：每个项目之前的间距以及到边缘的间距相等
#### 1.5 align-items属性 ####
align-items属性定义项目在交叉轴上如何对齐。  
![align-items的图片描述][6]
```
.box {
  align-items: flex-start | flex-end | center | baseline | stretch;
}
```
该属性的5个值分别表示（具体的对齐方式与交叉轴的方向有关，下面假设交叉轴从上到下）：
 - flex-start：交叉轴的起点对齐。
 - flex-end：交叉轴的终点对齐。
 - center：交叉轴的中点对齐。
 - baseline: 项目的第一行文字的基线对齐。
 - stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。
#### 1.6 align-content属性 ####
align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。
![align-content的图片描述][7]
```
.box {
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```
该属性的6个值分别表示:
 - flex-start：与交叉轴的起点对齐。
 - flex-end：与交叉轴的终点对齐。
 - center：与交叉轴的中点对齐。
 - space-between：与交叉轴两端对齐，轴线之间的间隔平均分布。
 - space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
 - stretch（默认值）：轴线占满整个交叉轴。
###2、项目的属性###
项目可以设置的属性同样有6个：
 - order
 - flex-grow
 - flex-shrink
 - flex-basis
 - flex
 - align-self
#### 2.1 order ####
默认情况下，项目按源顺序排列。但是order属性可以控制它们在flex容器中的显示顺序。
![图片描述][8]
```
.item {
  order: <integer>; /* default 0 */
}
```
#### 2.2 flex-grow ####
flex-grow属性定义项目的放大比例，如果所有项目的flex-grow属性都为1，则它们将等分剩余空间（如果有的话）。如果一个项目的flex-grow属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。
![flex-grow的图片描述][9]
```
.item {
  flex-grow: <number>; /* default 0 */
}
```
#### 2.3 flex-shrink ####
与flex-grow想反，flex-shrink属性定义了项目的缩小比例，如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小。
```
.item {
  flex-shrink: <number>; /* default 1 */
}
```
#### 2.4 flex-basis ####
flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。
```
.item {
  flex-basis: <length> | auto; /* default auto */
}
```
它可以设为跟width或height属性一样的值（比如350px），则项目将占据固定空间。
(https://css-tricks.com/snippets/css/a-guide-to-flexbox/ 中讲到这个关键字还没有得到很好的支持，因此很难测试，也很难知道它的兄弟最大内容、最小内容和适合内容做什么。)
#### 2.5 flex ####
flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。
```
.item {
  flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
}
```
该属性有两个快捷值：auto (1 1 auto) 和 none (0 0 auto)。
建议优先使用这个属性，而不是单独写三个分离的属性，因为浏览器会推算相关值。
#### 2.6 align-self ####
align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。
![align-self的图片描述][10]
```
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```
该属性可能取6个值，除了auto，其他都与align-items属性完全一致。
## 三、路漫漫其修远兮 ##
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其实flex布局没什么自己的理解，发这篇文章单纯为了加深印象做个总结，这篇文章大部分copy自[flex布局教程][11]和[A Complete Guide to Flexbox][12]


  [1]: https://www.cnblogs.com/dodocie/p/7137314.html
  [2]: https://segmentfault.com/img/bVbtiL4?w=660&h=310
  [3]: https://segmentfault.com/img/bVbtjh3?w=490&h=225
  [4]: https://segmentfault.com/img/bVbtjlR?w=490&h=255
  [5]: https://segmentfault.com/img/bVbtjqW?w=490&h=820
  [6]: https://segmentfault.com/img/bVbtjr0?w=490&h=650
  [7]: https://segmentfault.com/img/bVbtjAi?w=490&h=662
  [8]: https://segmentfault.com/img/bVbtjAw?w=490&h=445
  [9]: https://segmentfault.com/img/bVbtjBe?w=490&h=230
  [10]: https://segmentfault.com/img/bVbtjE8?w=490&h=280
  [11]: http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html
  [12]: https://css-tricks.com/snippets/css/a-guide-to-flexbox/