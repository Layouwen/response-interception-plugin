# Response Interception Plugin

## install

### Tampermonkey

1. click `Create a new script...`

2. paste `main.js` code

## Usage

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