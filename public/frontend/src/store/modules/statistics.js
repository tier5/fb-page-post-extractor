import Vue from 'vue';
import router from '../../router';
import swal from 'sweetalert2';

const state = {
    pageOverAllData: {},
    pageDataOverYear:[]
}

const getters = {
    pageOverAllData : (state) => state.pageOverAllData,
    pageDataOverYear: (state) => state.pageDataOverYear
}

const mutations = {
    pageOverAllData : (state, payload)=> {
        state.pageOverAllData = payload
    },
    pageDataOverYear :(state, payload) =>{
        state.pageDataOverYear = payload
    }
}

const actions = {
    getPageOverAllData : ({commit}, payload) =>{
        Vue.http.get('posts/stats').then(
            (res) =>{
                commit("pageOverAllData", res.body.data)
            }, 
            (error) =>{
                console.log(error);
            }
        )
    },
    pageDataOverYear : ({commit},payload) => {
        Vue.http.get('posts/stats?year=true').then(
            (res) =>{
                commit("pageDataOverYear", res.body.data)
                console.log(res.body.data);
            }, 
            (error) =>{
                console.log(error);
            }
        )
    }

}

export default { state, getters, mutations, actions}