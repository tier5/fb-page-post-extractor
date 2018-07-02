<template>
    <div id="app">
      <div class="row charts">
        Facebook Engagement Audit
      </div>
      <div class="row fluid">
        <div class="row">
          <div class="column">
            <router-view></router-view>
          </div>
        </div>

        <div class="row">
          <div class="column" style="background-color:#ccc;">
            <h2>Column 3</h2>
            <p>Some text..</p>
          </div>
          <div class="column" style="background-color:#ddd;">
            <h2>Column 4</h2>
            <p>Some text..</p>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
import * as components from './components'

const list = Object.keys(components)
  .filter(c => components.hasOwnProperty(c))
  .map(c => ({
    to: `/${c}`,
    name: c,
  }))

export default {
  components: {
    ...components,
  },
  data() {
    return {
      list,
    }
  },
}
</script>
<style lang="scss" rel="stylesheet/scss" type="text/css">

/* Create two equal columns that floats next to each other */
.column {
    float: left;
    width: 50%;
    padding: 10px;
}

/* Clear floats after the columns */
.row:after {
    content: "";
    display: table;
    clear: both;
}

$chartWidth: 600px;
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  //background: rgba(37, 37, 37, 0.84);
}

#app {
}

h1 {
  font-family: Dosis, 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
  padding: 2em 0 1em;
  text-align: center;
  a {
    text-decoration: none;
    color: #ccc;
  }
}

h1,
h3 {
  color: #ccc;
  font-weight: 300;
  p {
    font-size: 14px;
    margin: 5px;
  }
}

.charts {
  width: $chartWidth;
  margin: 0 auto;
  padding: 2em 0;
  text-align: center;
  h3 {
    text-align: center;
    margin: 0;
  }
  button {
    padding: 5px 20px;
    background: #fff;
    -webkit-appearance: none;
    border: 1px solid #c5c5c5;
    border-radius: 5px;
    outline: none;
    &:hover {
      background: lightgray;
      color: #333;
    }
  }
}

.highcharts {
  display: inline-block;
  margin: 2em auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 0 45px rgba(0, 0, 0, 0.2);
  padding: 2em 0em;
  background: #fff;
}
.nav {
  padding: 15px 0 0;
  margin: 0 auto;
  text-align: center;
  max-width: 600px;
  a {
    color: #adaba5;
    margin-right: 10px;
    &.active, &:hover{
      color: chocolate;
    }
  }
}
</style>
