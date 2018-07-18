
<template>
  <div style="margin:40px;">

    <div class="row">
      <div class="col-md-3">
        <ul>
          <li>
            #POSTS 
          </li>
          <li>
            #Total Engagement
          </li>
          <li>
            #Reactions
          </li>
          <li>
            #Comments
          </li>
          <li>
            #Shares
          </li>
        </ul>
      </div>
      <div class="col-md-8">
        <section class="charts">
          <vue-highcharts :options="columnOptions" ref="barCharts"></vue-highcharts>
        </section>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6"></div>
      <div class="col-md-3">
        <section class="charts">
          <vue-highcharts :options="pieOptions" ref="pieCharts"></vue-highcharts>
        </section>
      </div>
      <div class="col-md-3">
        <section class="charts">
          <vue-highcharts :options="pieOptions" ref="pieCharts"></vue-highcharts>
        </section>
      </div>
    </div>
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
