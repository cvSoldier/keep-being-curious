<template>
  <div id="app" ref="app">
    <img @click="goBlog" src="./assets/logo.png">
  </div>
</template>

<script>
import component from './util/extend'

export default {
  name: 'App',
  mounted () {
    console.log('app mounted')
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
