
<template>
  <div>
    <section class="charts">
      <vue-highcharts :options="columnOptions" ref="barCharts"></vue-highcharts>
    </section>

    <section class="charts">
      <vue-highcharts :options="pieOptions" ref="pieCharts"></vue-highcharts>
    </section>

    <section class="charts">
      <vue-highcharts :options="pieOptions" ref="pieCharts"></vue-highcharts>
    </section>
  </div>
</template>
<script>

import VueHighcharts from '../../src/VueHighcharts.vue'
import Highcharts from 'highcharts'
import * as data from '../../src/data/data'

export default {
  components: {
    VueHighcharts,
  },
  data() {
    return {
      columnOptions: data.ColumnData,
      pieOptions: data.PieData,
    }
  }
}
</script>
