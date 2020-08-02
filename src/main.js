import Vue from 'vue'
import VueRouter from 'vue-router';
import App from './App.vue';
import PageHeader from './components/PageHeader.vue'
import firebaseMixin from './js/firebase.js'
import LoginPage from './components/LoginPage.vue'
import NotFoundPage from './components/NotFoundPage.vue'
import HomePage from './components/HomePage.vue'
import EditStocksView from './components/EditStocksView.vue'
import StockView from './components/StockView.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

import 'materialize-css';
import 'materialize-css/dist/css/materialize.css'

Vue.use(VueRouter);


const routes = [
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/',
    alias: '/home',
    component: HomePage
  },
  {
    path: '/stockInfo/:stockID',
    component: StockView
  },
  {
    path: '/changeStocks',
    component: EditStocksView
  },
  {
    path: '*',
    component: NotFoundPage
  }
]

const router = new VueRouter({
  routes
});


new Vue({
  router,
  components: {
    App,
		EditStocksView,
		StockView,
		PageHeader,
		HomePage,
		LoginPage,
		LoadingSpinner
	},
	data: function () {
		return {
			user: {},
			stocks: [],
			isLoggedIn: false,
			wijzigAandelen: false,
			stockView: false
		};
	},
	mixins: [firebaseMixin],
	methods: {
		getStockData: function (stock) {
			this.viewedStock = stock;
			this.stockView = true;
		},
	}
}).$mount('#app')
