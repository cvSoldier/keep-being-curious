<template>
  <div class="extra-route">
    <h1>This is a extra route page</h1>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  created() {
    console.log('chart in ExtraRoute', echarts)
  }
}
</script>
