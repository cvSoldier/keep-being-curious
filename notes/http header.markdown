### Strict-Transport-Security ###
一个网站接受一个HTTP的请求，然后跳转到HTTPS，用户可能在开始跳转前，通过没有加密的方式和服务器对话，比如，用户输入http://foo.com或者直接foo.com。这样存在中间人攻击潜在威胁，跳转过程可能被恶意网站利用来直接接触用户信息，而不是原来的加密信息。网站通过HTTP Strict Transport Security通知浏览器，这个网站禁止使用HTTP方式加载，浏览器应该**自动**把所有尝试使用HTTP的请求自动替换为HTTPS请求。
### HSTS ###
HSTS(HTTP Strict Transport Security)是国际互联网工程组织IETF发布的一种互联网安全策略机制。采用HSTS策略的网站将保证浏览器始终连接到该网站的HTTPS加密版本，不需要用户手动在URL地址栏中输入加密地址，以减少会话劫持风险。

### HSTS响应头格式 ###

max-age，单位是秒，用来告诉浏览器在指定时间内，这个网站必须通过HTTPS协议来访问。也就是对于这个网站的HTTP地址，浏览器需要先在本地替换为HTTPS之后再发送请求。

includeSubDomains，可选参数，如果指定这个参数，表明这个网站所有子域名也必须通过HTTPS协议来访问。

preload，可选参数，一个浏览器内置的使用HTTPS的域名列表。