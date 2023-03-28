---
title: 从浏览器解码看xss
date: 2021-03-11
---
本文将深度`ctrl c` + `ctrl v` 从HTLM解析，JavaScript解析，url解析角度看xss

### HTML解析
HTML词法解析细则在[传送门](https://html.spec.whatwg.org/multipage/parsing.html#tokenization) 下面不会详细介绍所有内容，只会解释HTML解释器这个状态机是如何工作的，
HTML解析器作为一个状态机，它从输入流中获取字符并按照转换规则转换到另一种状态。在解析过程中，任何时候它只要遇到一个<符号（后面没有跟/符号）就会进入“标签开始状态(Tag open state)”。然后转变到“标签名状态(Tag name state)”，“前属性名状态(before attribute name state)”……最后进入“数据状态(Data state)”并释放当前标签的token。当解析器处于“数据状态(Data state)”时，它会继续解析，每当发现一个完整的标签，就会释放出一个token。
![image.png](https://segmentfault.com/img/bVcPsXH)

#### 字符实体
刚做前端的时候,调整位置还用过`&nbsp;`,(然后被师傅一顿骂)这个东西就是字符实体,
>字符实体是一个转义序列，它定义了一般无法在文本内容中输入的单个字符或符号。一个字符实体以一个&符号开始，后面跟着一个预定义的实体的名称，或是一个#符号以及字符的十进制数字。

有三种情况可以容纳字符实体
1 数据状态
2 RCDATA状态
3 属性值状态

在HTML里,像`<`和`>`会识别为标签开始结束,要想显示文本,就要使用对应的字符实体.但是在`<textarea>`里 输入`<`就能正常显示.因为`<textarea>`属于RCDATA元素

HTML中共有五种元素
1 空元素 像`<br/>` 不能容纳任何内容
2 原始文本元素 有`<script>`和`<style>` 可以容纳文本
3 RCDATA元素 有`<textarea>`和`<title>` 可以容纳文本和字符引用
4 外部元素 像 `<svg>` 可以容纳文本,字符引用,CDATA段,其他元素和注释
5 基本元素 除上面之外的元素 可以容纳文本,字符引用,其他元素和注释

因为`textarea`是RCDATA元素,不能容纳其他元素,所以他里面只有`</textarea>`会被识别为标签结束,其他`<`是不会创建元素的. 对比
```html
<!-- 就会弹窗了 -->
<div><script>alert(1)</script></div>
```
再对比
```html
<div>&#60;script&#62;alert(1)&#60;/script&#62;</div>
<!-- 这就不会弹窗, 因为字符实体被解释为文本, 
不会进入“标签开始状态(Tag open state)” -->
```
所以可以利用这种特性来对用户的输入进行转义, 来确保输入的数据只被解释为数据.

因为解析字符实体是在HTML解析阶段,所以在`<script>`标签中使用HTML字符实体是没有用的,例如
```html
<script>alert&#40;'1')</script>
<!-- 不止不会弹窗, 甚至会报一个 Uncaught SyntaxError 的错
因为js的解析不认识HTML字符实体 -->
```
但是
```html
<!-- 这个就会弹窗了, 因为svg 遵循 xml 定义,
在 xml 中除了<![CDATA[和]]>包含的实体, 其他会自动转义,
而且 svg 中可以包含 script 标签, 所以成功弹窗 -->
<svg><script>alert&#40;'1')</script>
```
### url解析
url使用UTF-8编码类型来编码每一个字符.而且不能对协议类型进行任何的编码操作，不然URL解析器会认为它无类型。比如：  
```html
<a href="%6a%61%76%61%73%63%72%69%70%74:%61%6c%65%72%74%28%31%29"></a>
<!-- 不会弹窗 -->
<!-- decodeURI(href) === 'javascript:alert(1)' -->
```
因为URL中被编码的 "javascript" 没有被解码，因此不会被URL解析器识别。该原则对协议后面的":"（冒号）同样适用,比如：
```html
<a href="javascript%3aalert(1)"></a>
<!-- 不会弹窗 -->
```
前文讲过，属性值状态下是可以使用字符实体的，也就是说可以把url协议的部分使用字符实体编码：
```html
<a href="&#x6a;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;:%61%6c%65%72%74%28%31%29"></a>
<!-- 会弹窗 -->
<!-- 把 &#x6a 换成 &#106 是一样的  
parseInt('6a', 16) === 106-->
```

### JavaScript解析
最常用的如\uXXXX这种写法为Unicode转义序列，表示一个字符，其中xxxx表示一个16进制数字，如 `<` 的Unicode编码为\u003c。举个栗子：
```html
<img src="1" onerror=\u0061\u006c\u0065\u0072\u0074\u0028\u0031\u0029>
<!-- decodeURI(listener) === 'alert(1)' -->
<!-- 不会弹窗 -->
```
因为当用Unicode转义序列来表示一个控制字符时，例如单引号、双引号、圆括号等等，它们将不会被解释成控制字符，而仅仅被解码并解析为标识符名称或者字符串常量,我们放开控制字符，应该就可以了吧：
```html
<img src="1" onerror=\u0061\u006c\u0065\u0072\u0074(\u0031)>
<!-- 卜会弹窗 -->
```
需要注意的是，unicode转义序列表示一个字符，`\u0031`被解码为字符串 `1`,所以还需要用引号。
```html
<img src="1" onerror=\u0061\u006c\u0065\u0072\u0074('\u0031')>
<!-- 会弹窗 -->
```
### 解析顺序
当浏览器从网络中获得一段内容后，触发HTML解析器来对这篇文档进行词法解析。在这一步中字符引用被解码。在词法解析完成后，DOM树就被创建好了，JavaScript解析器会介入来对脚本进行解析。在这一步中Unicode转义序列和Hex转义序列被解码。同时，如果浏览器遇到需要URL的上下文，URL解析器也会介入来解码URL内容。在这一步中URL解码操作被完成。由于URL位置不同，URL解析器可能会在JavaScript解析器之前或之后进行解析。比如
```html
<a href="UserInput"></a>
```
HTML解析器将首先开始工作，并对UserInput中的字符引用进行解码。然后URL解析器开始对href值进行URL解码。最后，如果URL资源类型是JavaScript，那么JavaScript解析器会进行Unicode转义序列和Hex转义序列的解码。再之后，解码的脚本会被执行。

### 参考资料
http://bobao.360.cn/learning/detail/292.html  
https://xz.aliyun.com/t/5863
