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
      <h3>A free tool with <span class="heart">&hearts;</span> by <a href="https://www.facebook.com/king.jon.vaughn" target="_blank">Jon Vaughn</a> and <a href="https://www.facebook.com/EliasYD" target="_blank">Elias Benjelloun</a></h3>
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
            <div class="row" v-for="(page,index) in pages" :key="index">
              <div style="margin:5px;">
                <div class="col-md-6">
                  <input type="text" class="form-control" placeholder="Facebook Page URL" v-model="page.fb_page_url">
                </div>
                <div class="col-md-1">
                  <button type="button" @click.prevent="removePage(index)" ><i class="fa fa-remove"></i></button>
                </div>
                <div class="col-md-2" >
                  <!-- <a :href="page.data" class="btn btn-success" v-if="page.data" :download="page.filename">Download CSV</a> -->
                  <download-excel
                    class   = "btn btn-success"
                    :data   = "page.data"
                    :fields = "json_fields"
                      name    = "page.xls" v-if="page.data">

	                  Download Excel

                  </download-excel>
                </div>
                <div class="col-md-2" >
                  <a href="javascript:void(0)" class="btn btn-danger" v-if="page.error">Download Failed</a>
                </div>
              </div>
            </div>
            <br>
            <div class="col-md-3">
                <button class="btn btn default" type="button" @click.prevent="addPage">Add More Pages</button>
            </div>
            <div class="col-md-3">  
              <button type="submit"  class="btn btn-success" @click.prevent="getCsv" :disabled="$v.fbPostUrl.$invalid || $v.pages.$invalid">Get Posts</button>
            </div>
            <!-- <div class="col-md-3">
                <a class="btn btn-success" type="button" :href="encodedAlldata" download="alldata.csv" v-if="showall">Download Combine CSV</a>
            </div> -->
            <download-excel
              class   = "btn btn-success"
              :data   = "json_data"
              :fields = "json_fields"
              name    = "allpagedata.xls" v-if="showall">

	            Download Excel

            </download-excel>
            <div class="row">

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
  import JsonExcel from 'vue-json-excel'
  export default {
    data () {
      return {
        showall:false,
        fbPostUrl:{
          page_access_token:'',
        },
        cvs_data:'',
        response: 0,
        alldata:'',
        encodedAlldata: '',
        json_fields:{
          "Page": "page_name",
          "Message ": "message",
          "Link": "link",
          "Permanent Url": "permalink_url",
          "Created Time": "created_time",
          "Type": "type",
          "Id": "id",
          "Comments Total Count": "comments.summary.total_count",
          "Reaction Total Count" : "reactions.summary.total_count",
          "Shares Total Count": "shares_count",
        }, 
        json_data:[]
      }
    },
    components:{
    },
    methods:{
      getCsv(){
        this.$store.commit('changeLoading', true);
        this.response = this.pages.length;
        this.encodedAlldata = ''
        this.showall = false;
        this.json_data = [];
        this.pages.forEach(element => {
          element.data = '';
          element.error = false;
          this.$store.commit('changeLoading', true);
          this.pageCall({page_access_token : this.fbPostUrl.page_access_token , fb_page_url: element.fb_page_url, token: this.token }).then(data=>{
            element.data = data;  
            this.response -= 1 
          }).catch(err=> {

            this.response -= 1 
            element.error = true;
            if (err.response){
              if (err.response.status && err.response.status === 401){
                this.$store.commit('changeLoading', false);
                this.logout();
              }
            }
          });
        });
        
      },
      logout(){
        this.$store.dispatch('userSignOut');
      },
      addPage(){
        this.$store.commit('addPage');
      },
      removePage(index){
        this.$store.commit('removePage',index)
      },
      pageCall(postData){
        return new Promise ((resolve,reject)=>{
          axios.post("/api/posts",postData).then(response => {
          // this.alldata += response.data.csv;
          this.json_data = [...this.json_data,...response.data.posts]
          // var csvContent = "data:text/csv;charset=utf-8," + response.data.csv;
          // var encodedUri = encodeURI(csvContent);
            resolve(response.data.posts)
          }).catch(err => {
            //console.log(err.response)
            console.log(err);
            reject(err)
          })
        })
      }
    },
    computed: {
        // mix the getters into computed with object spread operator
        ...mapGetters([
            'token',
            'pages'
        ])
    },
    watch:{
      response: function(val){
        if (val === 0){
          this.$store.commit('changeLoading', false);

          if (this.json_data.length){
              //this.encodedAlldata = encodeURI( "data:text/csv;charset=utf-8," + this.alldata);
              this.showall = true;
          } else {
              this.showall = false;
          }
        }
      }
    },
    validations: {
      fbPostUrl:{
        page_access_token:{
          required
        }
      },
      pages:{
        $each:{
          fb_page_url :{
            required
          }
        }
      }
    },
    components:{
      'downloadExcel': JsonExcel
    }
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
