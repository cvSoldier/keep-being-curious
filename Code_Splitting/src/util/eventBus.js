class eventBus {
  constructor () {
    this.eventList = {}
  }
  on (e, fn) {
    let eventList = this.eventList[e]
    eventList ? eventList.push(fn) : this.eventList[e] = [fn]
  }
  emit (e, ...args) {
    this.eventList[e] && this.eventList[e].forEach(fn => {
      fn(...args)
    })
  }
}
const eventbus = new eventBus()

export default eventbus
