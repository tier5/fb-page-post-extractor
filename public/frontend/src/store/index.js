import Vue from 'vue'
import Vuex from 'vuex'
import Auth from './modules/auth';;
import Loader from './modules/loader';
import Posts from './modules/posts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    Auth,
    Loader,
    Posts
  }
})
