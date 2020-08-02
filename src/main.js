import Vue from 'vue'
import VueRouter from 'vue-router';
import PageHeader from './components/PageHeader.vue'
import firebaseMixin from './js/firebase.js'
import LoginPage from './components/LoginPage.vue'
import LogoutPage from './components/LogoutPage.vue'
import ProfilePage from './components/ProfilePage.vue'
import PortfolioView from './components/PortfolioView.vue'
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
    path: '/editPortfolio',
    component: EditStocksView
  },
  {
    path: '/logout',
    component: LogoutPage
  },
  {
    path: '/profile',
    component: ProfilePage
  },
  {
    path: '/portfolio',
    component: PortfolioView
  },
  {
    path: "/404",
    component: NotFoundPage
  },
  {
    path: '*',
    redirect: '/404'
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  base: (location.hostname === 'stannl.github.io' ? '/StockStats':'')
});


new Vue({
  router,
  components: {
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
