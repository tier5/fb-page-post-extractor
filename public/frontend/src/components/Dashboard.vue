<template>
  <div class="container-fluid">
    <nav class="navbar app__header">
        <div class="container-fluid">
          <div class="navbar-header">
            <a class="navbar-brand" ><router-link to="/dashboard">Page Extractor</router-link></a>
          </div>
          
          <ul class="nav navbar-nav navbar-right">
            <!-- <li><a href="" @click.prevent="customRouterPush('/plans')">Plans</a></li> -->
            <li class="dropdown">
              <a href="#" data-toggle="dropdown" class="dropdown-toggle">
                <span class="glyphicon glyphicon-user"></span>Profile<b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
                <li @click.prevent="logout"><a>Logout</a></li>
                <!-- <li v-if='user.userType=="paid"'><a @click="customRouterPush('/settings')">Setting</a></li> -->
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    <div class="row justify-content-center" style="text-align: center;">
      <h1>Facebook Page Post Extractor</h1>
      <h2>Extract Every Post Ever from Your Competitors’ Facebook Pages</h2>
      <h3>A free tool with <span class="heart">&hearts;</span> by <a href="https://www.facebook.com/king.jon.vaughn" target="_blank">Jon Vaughn</a></h3>
    </div>
    <div class="row">
      <form>
        <div class="col-md-6 col-md-offset-3">
           <div class="form-group">
              <input type="text" 
                    name="page-access-token" 
                    id="page-access-token" 
                    class="form-control" placeholder="Page Access Token" v-model="fbPostUrl.page_access_token">
              <p>Get your access token <a href="https://developers.facebook.com/tools/explorer" target="_blank">here</a></p>              
            </div>
            <div class="form-group">
              <p>A Facebook Page URL generally looks like following</p>
              <ul>
                  <li><span class="empasize-link">https://www.facebook.com/RandomPage</span></li>
                  <li><span class="empasize-link">https://m.facebook.com/random.page</span></li>
                  <li><span class="empasize-link">https://www.facebook.com/Random-Page-24353623</span></li>
              </ul>          
            </div>
            <br>
            <div class="row">
              <div class="col-md-3">
                <button class="btn btn default" type="button" @click.prevent="addPage">Add More Pages</button>
              </div>
            </div>
            <br>
            <div class="row" v-for="(page,index) in pages" :key="index">
              <div style="margin:5px;">
                <div class="col-md-6">
                  <input type="text" class="form-control" placeholder="Facebook Page URL" v-model="fbPostUrl.fb_page_url">
                </div>
                <div class="col-md-1">
                  <button type="button" @click.prevent="removePage(index)"><i class="fa fa-remove"></i></button>
                </div>
                <div class="col-md-2" >
                  <a :href="page.data" class="btn btn-success" v-if="page.data" :download="page.filename">Download CSV</a>
                </div>
              </div>
            </div>
            <br>
            <div class="col-md-3">  
              <button type="submit"  class="btn btn-success" @click.prevent="getCsv">Get Posts</button>
            </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { required} from 'vuelidate/lib/validators';
  import axios from 'axios';
  export default {
    data () {
      return {
        msg: 'Welcome to Your Vue.js App',
        fbPostUrl:{
          page_access_token:'',
        },
        cvs_data:''
      }
    },
    components:{
    },
    methods:{
      getCsv(){
        //this.$store.dispatch("getCvs", this.fbPostUrl);
        this.$store.commit('changeLoading', true);
        let postBody = this.fbPostUrl;
        postBody.token = this.token;
        axios.post("http://localhost:3000/api/posts",this.fbPostUrl).then(response => {
          var csvContent = "data:text/csv;charset=utf-8," + response.data.csv;
          var encodedUri = encodeURI(csvContent)
          this.cvs_data = encodedUri
          
          this.$store.commit('changeLoading', false);
        }).catch(err=>{
          console.log(err);
          this.$store.commit('changeLoading', false);
        })
      },
      logout(){
        this.$store.dispatch('userSignOut');
      },
      addPage(){
        this.$store.commit('addPage');
      },
      removePage(index){
        this.$store.commit('removePage',index)
      }
    },
    computed: {
        // mix the getters into computed with object spread operator
        ...mapGetters([
            'token',
            'pages'
        ])
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
  .body {
    font-family: 'Open Sans', sans-serif;
  }
  .container {
    margin: 50px auto;
  }
  .loader {
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    position: absolute;
    top: 250px;
    z-index: 999;
    display: none;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .card {
    width: 150rem;
  }
  .heart {
    color: #ff0000;
  }
  .empasize-link {
    background: #dfdfdf;
    border-radius: 5px;
    color: #b2004a;
    font-family: 'Source Code Pro', monospace;
    padding: 5px;
  }
  ul > li {
    margin: 10px 0 10px 0;
  }

<style scoped>

</style>
