# Response Interception Plugin

## Install

### Automatic installation

[https://greasyfork.org/zh-CN/scripts/441275-response-interception-plugin](https://greasyfork.org/zh-CN/scripts/441275-response-interception-plugin)

### Manual installation

1. click `Create a new script...`

2. paste `main.js` code

## Usage

### Use console

set `window.responseMiddle` function

**Example**

```js
window.responseMiddle = function (res, origin) {
  let result = res
  if (/www.baidu.com/g.test(origin.requestURL)) {
    result = '{ message: "this is change data" }'
  }
  return result
}
```

### Use control menu

1. click `拦截` button

2. click `添加规则` button

3. input match and method callback function

> callback function name must be `fn`

4. click `保存规则` button