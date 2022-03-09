const origin = XMLHttpRequest.prototype.open

XMLHttpRequest.prototype.open = function (...args) {
  this.responseMiddle = function (res) {
    const _responseMiddle = window.responseMiddle
    let result = _responseMiddle?.(res, this)
    return result ? result : res
  }
  return origin.apply(this, args)
}

const responseGetHandle = accessor =>
  function () {
    let response = accessor.get.call(this)
    if (this.responseMiddle) {
      response = this.responseMiddle(response)
    }
    return response
  }

const responseSetHandle = accessor =>
  function (str) {
    return accessor.set.call(this, str)
  }

const keys = ['responseText', 'response']

keys.forEach(key => {
  const accessor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, key)
  Object.defineProperty(XMLHttpRequest.prototype, key, {
    get: responseGetHandle(accessor),
    set: responseSetHandle(accessor),
    configurable: true,
  })
})
