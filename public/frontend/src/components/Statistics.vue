
<template>
  <div style="margin:40px;">

    <div class="row">
      <div class="col-md-3">
       
          <div class="col-md-3">
            <div>
              <label>#POSTS</label>
              <div class="count">
                  {{pageOverAllData.posts}}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div>
              <label>#Total Engagement</label>
              <div class="count">
                {{pageOverAllData.comments + pageOverAllData.reactions + pageOverAllData.likes}}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div>
              <label>#Reactions</label>
              <div class="count">
                {{pageOverAllData.reactions}}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div>
              <label>#Comments</label>
              <div class="count">
                {{pageOverAllData.comments}}
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-8">
        <section class="charts" v-if= "pageDataOverYear.length">
          <vue-highcharts :options="columnData" ref="barCharts"></vue-highcharts>
        </section>
      </div>
    </div>
    <!-- <div class="row">
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
    </div> -->
  </div>
</template>
<script>

import VueHighcharts from '../../src/VueHighcharts.vue';
import Highcharts from 'highcharts';
import * as data from '../../src/data/data';
import { mapGetters } from 'vuex';

export default {
  components: {
    VueHighcharts,
  },
  data() {
    return {
      columnOptions: data.ColumnData,
      pieOptions: data.PieData,
      columnData : {
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
              categories: [],
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
          series: [
            { name : "# Reactions" , data : []},
            { name : "# Likes" , data : []},
            { name : "# Comments" , data : []},
          ]
            }
    }
  },
  created : function () {
    this.$store.dispatch("getPageOverAllData", {pageurl : "testingdata21"})
    this.$store.dispatch("pageDataOverYear", {year : true})
  },
  computed: {
    ...mapGetters([
      "pageOverAllData",
      "pageDataOverYear",
    ])
  },
  watch : {
    pageDataOverYear : function(val){
      if (val.length){
        val.forEach(element => {
            if (element.year !==  "Invalid date") {
                this.columnData.xAxis.categories.push(element.year)
              if (element.total_reactions){
                  this.columnData.series[0].data.push(element.total_reactions)
                  this.columnData.series[1].data.push(element.total_likes)
                  this.columnData.series[2].data.push(element.total_comments)
              }
            }
            
        });
        console.log(this.columnData);
      }
    }
  }
}
</script>

<style>


</style>
