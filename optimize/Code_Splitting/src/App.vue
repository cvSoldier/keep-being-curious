<template>
  <div id="app" ref="app">
    <img @click="goBlog" src="./assets/logo.png">
  </div>
</template>

<script>
import component from './util/extend'
import eventBus from '@/util/eventBus'

export default {
  name: 'App',
  mounted () {
    console.log('app mounted')
    eventBus.on('mounted', (dom) => {
      this.$refs.app.appendChild(dom)
    })
    import('./components/Wrapper').then(_ => {
      this.$refs.app.appendChild(component(_.default).$mount().$el)
    })
  },
  methods: {
    goBlog () {
      window.location.href = '/blog'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
