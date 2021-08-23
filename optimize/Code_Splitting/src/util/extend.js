import Vue from 'vue'

export default function (options) {
  var Component = Vue.extend(options)
  return new Component()
}
