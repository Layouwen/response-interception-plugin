// ==UserScript==
// @name         response-interception-plugin
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Custom response interception plugin for the browser
// @author       Avan
// @include *
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gitee.com
// @grant        none
// ==/UserScript==

;(function () {
  const metaData = {
    rules: [],
  }

  startInterception()
  initUi()

  function initUi() {
    initBox()
    initControl()
    useRule()
  }

  function useRule() {
    const delTempMethodName = []
    const methods = metaData.rules.reduce((arr, cur) => {
      const name = Math.random()
      let str = cur.method
      str += `window[name] = fn`
      eval(str)
      delTempMethodName.push(name)
      return [...arr, window[name]]
    }, [])

    clearWindowMethod(delTempMethodName)

    window.responseMiddle = function (res, origin) {
      if (methods.length > 0) {
        const newRes = methods.reduce((pre, fn) => {
          return fn(pre, origin)
        }, res)
        return newRes
      }
      return res
    }
  }

  function clearWindowMethod(names) {
    if (names.length === 0) return
    names.forEach(name => {
      delete window[name]
    })
  }

  function initBox() {
    const html = `<div class="rip-box">拦截</div>`
    const css = `
    .rip-box {
      position: fixed;
      right: 5%;
      bottom: 20%;
      z-index: 99999;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: gray;
    }
  `
    const $css = document.createElement('style')
    $css.innerHTML = css
    document.head.appendChild($css)
    const $ripBox = document.createElement('div')
    $ripBox.innerHTML = html
    document.querySelector('body').appendChild($ripBox)

    $ripBox.addEventListener('click', () => {
      const $control = document.querySelector('.rip-control')
      $control.classList.toggle('rip-control-show')
    })
  }

  function initControl() {
    const html = `
      <div class="rip-control">
        ${getItemHtml(metaData.rules)}
        <button class="rip-add">添加规则</button>
        <button class="rip-confirm">应用规则</button>
      </div>
    `

    const css = `
    .rip-control {
      display: none;
      position: fixed;
      right: 50%;
      bottom: 50%;
      transform: translate(50%, 50%);
      z-index: 99999;
      padding: 30px;
      width: 250px;
      border: 1px solid gray;
      background: white;
    }
    .rip-control.rip-control-show {
      display: block;
    }

    .rip-control-item {
      margin-bottom: 10px;
    }
    .rip-control-item > label {
      display: flex;
    }
  `
    const $css = document.createElement('style')
    $css.innerHTML = css
    document.head.appendChild($css)
    const $control = document.createElement('div')
    $control.innerHTML = html
    document.querySelector('body').appendChild($control)

    function getItemHtml(rules) {
      const result = rules.reduce((pre, cur) => (pre += createItemStr(cur)), '')
      return result

      function createItemStr(rule) {
        return `<div class="rip-control-item">
          <label class="rip-control-item-url"><span style="width: 54px">url：</span><input type="text" value="${rule.url}"/></label>
          <label class="rip-control-item-method"><span style="width: 54px">method：</span><textarea>${rule.method}</textarea></label>
        </div>`
      }
    }
  }

  function startInterception() {
    const origin = XMLHttpRequest.prototype.open

    XMLHttpRequest.prototype.open = function (...args) {
      this.responseMiddle = function (res) {
        const _responseMiddle = window.responseMiddle
        let result = _responseMiddle?.(res, this)
        return result ? result : res
      }
      return origin.apply(this, args)
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
  }

  function responseGetHandle(accessor) {
    return function () {
      let response = accessor.get.call(this)
      if (this.responseMiddle) {
        response = this.responseMiddle(response)
      }
      return response
    }
  }

  function responseSetHandle(accessor) {
    return function (str) {
      return accessor.set.call(this, str)
    }
  }
})()
