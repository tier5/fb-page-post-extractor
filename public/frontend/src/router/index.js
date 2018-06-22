import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '../components/Dashboard'
import Login from '../components/Login.vue'
import AuthGaurd from './gaurds/auth-gaurd';
import NotAuthGaurd from './gaurds/not-auth-gaurd';


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,beforeEnter: AuthGaurd
    },
    {
      path: '/login',
      name: 'Login',
      beforeEnter:NotAuthGaurd,
      component: Login
    },
    { path: '*', redirect: '/dashboard' }
    
  ]
})
