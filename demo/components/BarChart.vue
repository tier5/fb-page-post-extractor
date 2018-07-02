<template>
  <section class="charts">
        <vue-highcharts :options="options" ref="barCharts"></vue-highcharts>
    </section>
</template>
<script>

import VueHighcharts from '../../src/VueHighcharts.vue'
import Highcharts from 'highcharts'

const data = {
  chart: {
        type: 'column'
    },
    title: {
        text: ''
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: [
            '2011',
            '2012',
            '2013',
            '2014',
            '2016',
            '2017',
            '2018'
        ],
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
    },
    plotOptions: {
        series: {
            borderWidth: 0,
        }
    },
    colors: [
        '#4285F4',
        '#DB4437',
        '#F4B400',
        '#0F9D58'
    ],
    legend: {
      layout: 'horizontal',
            floating: true,
            backgroundColor: '#FFFFFF',
            align: 'top',
            verticalAlign: 'top',
            x: 150,
            y: -15
          },
    series: [{
        name: '# Reactions',
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6]

    }, {
        name: '# Shares',
        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0]

    }, {
        name: '# Comments',
        data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0]

    }, {
        name: '# Posts',
        data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4]

    }]
}
export default {
  components: {
    VueHighcharts,
  },
  data() {
    return {
      options: data,
    }
  }
}
</script>