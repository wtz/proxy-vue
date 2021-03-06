import createData from './data.js'
import directive from './directive.js'
import Dom from './dom.js'

class Vue {
  constructor(config) {
    this._config = config
    this._ticks = []
    // 用来存储指令
    this.initData(config.data)
    this.bindVM()
    this.appendDom()

    return this._vm
  }

  /**
   * 初始化data为observable
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  initData (data) {
    Object.assign(this, data())
    this._vm = createData(this, this.appendDom.bind(this))
  }

  /**
   * render函数
   * 后续需要进行diff操作，不整个更新dom
   */
  appendDom () {
    const { render, el } = this._config
    const targetEl = document.querySelector(el)
    const renderDom = render()

    // 为节点渲染绑定vm
    const dom = new Dom(this._vm)
    const result = renderDom(dom)

    // 替换节点
    targetEl.replaceChild(result, this._oldDom || targetEl.childNodes[0])
    this._oldDom = result

    // 出发nextTick的回调
    this._triggerTicks()
  }

  /**
   * 为所有的函数绑定this
   */
  bindVM () {
    const { _config } = this

    for(let key of Object.keys(_config)) {
      const val = _config[key]
      if (typeof(val) === 'function') {
        _config[key] = val.bind(this._vm)
      }
    }
  }

  /**
   * 添加dom更新后的回调
   */
  nextTick (fn) {
    this._ticks.push(fn)
  }

  /**
   * 执行dom更新后的回调
   */
  _triggerTicks () {
    setTimeout(_ => {
      this._ticks.forEach(fn => {
        typeof(fn) === 'function' && fn()
      })

      this._ticks = []
    }, 0)
  }
}


Vue._directors = new Map()
Vue.directive = directive

export default Vue
