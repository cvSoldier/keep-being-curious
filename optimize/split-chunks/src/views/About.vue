<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  created() {
    console.log('chart in About', echarts)
  }
}
</script>