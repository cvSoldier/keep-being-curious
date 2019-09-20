function LazyLoad(els, lazyDistance) {
  this.lazyDistance = lazyDistance
  this.imglist = Array.from(els)
  this.init()
}
LazyLoad.prototype = {
  init: function() {
    this.initHandler()
    this.lazyLoad()
    this.bindEvent()
  },

  load: function(el, index) {
    el.src = el.getAttribute('data-src')
    this.imglist.splice(index, 1)
  },

  lazyLoad: function() {
    for(let i = 0; i < this.imglist.length; i++) {
      this.getBound(this.imglist[i]) && this.load(this.imglist[i], i)
    }
  },

  getBound: function(el) {
    let bound = el.getBoundingClientRect()
    let clientHeight = document.documentElement.clientHeight || document.body.clientHeight
    return bound.top <= clientHeight + this.lazyDistance
  },

  initHandler: function() {
    const fn = throttle(function() {
      if(this.imglist.length > 0) {
        this.lazyLoad()
      } else {
        window.removeEventListener('scroll', this.scrollHander, false)
      }
    }, 1000)
    this.scrollHander = fn.bind(this)
  },
  bindEvent: function() {
    window.addEventListener('scroll', this.scrollHander, false)
  }
}