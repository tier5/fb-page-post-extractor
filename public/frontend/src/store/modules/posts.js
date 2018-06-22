import Vue from 'vue';

const state = {
    pages : [
        {fb_page_url : '', data: '', error : false, filename:"post.csv"}
    ] 
}
const getters = {
    pages : state => state.pages
}

const mutations = {
    addPage:(state) => {
        if (state.pages.length !== 7){
            state.pages.push({
                fb_page_url : '', 
                data: '', 
                error : false, 
                filename:"post.csv"
           }) 
        }
    },
    removePage:(state, index) => {
        if (state.pages.length !== 1){
            state.pages.splice(index, 1);
        }
    },
    updatePage:(state,payload) => {
        state.pages[payload.index].data = payload.data;
        state.pages[payload.index].error = payload.error;
    }
}
const actions = {
    getCvs:({commit},payload) => {
        Vue.http.post('posts',payload)
          .then(
            (res)=>{
              if (res.status){
                var csvContent = "data:text/csv;charset=utf-8," + res.data.csv;
                var encodedUri = encodeURI(csvContent)
                  let updatePage ={
                      index : payload.index,
                      data : encodedUri,
                      error : false
                  }
                  commit('updatePage')
              }
            },
            (err) => {
                let updatePage = {
                    index : payload.index,
                    data : '',
                    error : true
                }
                commit('updatePage')
            }
          )
      }
}


export default { state, getters, mutations, actions }
