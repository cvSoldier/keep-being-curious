const debounce = (fn, delayTime, immediate) => {
  var timeId
  return function() {
    var context = this, args = arguments
    if(immediate) {
      var callNow = !timeId
      if(callNow) {
        fn.apply(this, args)
      }
    }
    timeId && clearTimeout(timeId)
    timeId = setTimeout(() => {
      fn.apply(context, args)
    }, delayTime)
  }
}

const throttle = (fn, delayTime) => {
  var flag, _start = 0
  return function() {
    var context = this,
        args = arguments,
        _now = Date.now(),
        remainTime = delayTime - (_now - _start)
    if(remainTime <= 0 || remainTime > delayTime) {
      if(flag) {
        clearTimeout(flag)
        flag = null
      }
      _start = _now
      fn.apply(context, args)
      if(!flag) {
        context = args = null
      }
    } else if(!flag) {
      flag = setTimeout(() => {
        fn.apply(context, args)
        flag = null
      }, remainTime)
    }
  }
}