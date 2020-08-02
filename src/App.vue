<template>
	<div id="app">
		<link
			href="https://fonts.googleapis.com/icon?family=Material+Icons"
			rel="stylesheet"
		>
		<div v-if="!isLoggedIn">
			<h1>
				Welkom bij Stans Stock Stats!
			</h1>
			<button
				class="waves-effect waves-light btn"
				@click="firebaseGoogleSignIn"
			>
				Inloggen met Google
			</button>
		</div>
		<div v-else>
			Je bent ingelogd!
			<br>
			<br>
			<button 
				class="btn waves-effect waves-light"
				@click="firebase.auth().signOut()">
				Uitloggen
			</button>
			<br>
			<br>
			<div v-if="user.uid">
				E-mailadres: {{ user.email }} <br>
				UID: {{ user.uid }}
				<br>
				<br>
				<div v-if="wijzigAandelen">
					<h1>Aandelen</h1>
					<edit-stocks-view
						:firebase="firebase"
						@home="wijzigAandelen = false"
						@stocksUpdated="uploadUserData($event.data)"
						v-model="stocks"/>
				</div>
				<div v-if="!wijzigAandelen && !stockView">
					<h1>Homepagina</h1>
					<br>
					<br>
					<div class="row">
						<div
							class="col s12 m6 l3"
							v-for="(stock, index) in stocks"
							:key="index"
						>
							<div class="card teal darken-1">
								<div class="card-content white-text">
									<span class="card-title">{{ stock.description }}</span>
									<table class="stockCardTable">
										<tr>
											<td>
												Aankoopprijs:
											</td>
											<td>
												{{ stock.purchasePrice.toFixed(2) }} {{stock.currency}}
											</td>
										</tr>
										<tr v-if="stock.salePrice">
											<td>
												Verkoopprijs:
											</td>
											<td>
												{{ stock.salePrice.toFixed(2) }} {{stock.currency}}
											</td>
										</tr>
										<tr v-if="stock.salePrice">
											<td>
												Rendement:
											</td>
											<td>
												{{ (stock.salePrice - stock.purchasePrice).toFixed(2) }} {{stock.currency}}
											</td>
										</tr>
										<tr v-if="stock.salePrice">
											<td>
												Rendement (percentage):
											</td>
											<td>
												{{ (100 * (stock.salePrice - stock.purchasePrice)/(stock.purchasePrice)).toFixed(1) }}%
											</td>
										</tr>
									</table>
								</div>
								<div class="card-action">
									<a @click="getStockData(stock)">Meer info</a>
								</div>
							</div>
						</div>
					</div>
					<button
						class="waves-effect waves-light btn"
						style="margin-top: 18px;"
						@click="wijzigAandelen = true"
					>
						<i class="material-icons left">edit</i>
						Wijzig aandelen
					</button>
				</div>
				<div
					v-if="stockView">
					<stock-view
						:stock="viewedStock"/>
					<br>
					<button
						class="waves-effect waves-light btn"
						style="margin-top: 18px;"
						@click="stockView = false"
					>
						<i class="material-icons left">arrow_back</i>
						Terug
					</button>
				</div>
			</div>
			<div v-else>Laden...</div>
		</div>
	</div>
</template>

<script>
import firebaseMixin from './js/firebase.js'
import EditStocksView from './components/EditStocksView.vue'
import StockView from './components/StockView.vue'


export default {
	name: 'App',
	components: {
		EditStocksView,
		StockView
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
	mounted: function () {
		let self = this;
		this.firebase.auth().onAuthStateChanged(function (user) {
			if (user != null) {
				self.isLoggedIn = true;
				self.initUserData();
			} else {
				self.isLoggedIn = false;
			}
		});
	},
	methods: {
		refreshUserData: function () {
			this.user = this.firebase.auth().currentUser;
		},
		uploadUserData: function (data, callback) {
			if (!this.user.uid) alert("niet ingelogd, idioot");
			this.db.collection("users").doc(this.user.uid).set(data, { merge: true }).catch(function (error) {
				console.log(error);
			}).then(callback || (() => { }));
		},
		initUserData: function () {
			this.refreshUserData();
			if (!this.user.uid) return;
			let self = this;
			this.db.collection("users").doc(this.user.uid).get().then(function (doc) {
				if (doc.exists) {
					let data = doc.data();
					if (data.stocks) {
						self.stocks = data.stocks;
					}
				} else {
					console.log("Nog geen user data!");
				}
			}).catch(function (error) {
				console.log("Error getting document:", error);
			});
		},
		getStockData: function (stock) {
			this.viewedStock = stock;
			this.stockView = true;
		},
	}
}
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	padding: 48px 24px;
}

.card-action a {
	color: white !important;
	cursor: pointer;
}

#editStockTable {
	max-width: 800px;
	width: 80% !important;
	left: 10%;
	position: relative;
	@media only screen and (min-width: 1000px) {
		left: calc(50% - 400px);
	}
}

thead * {
	font-weight: bold;
	text-align: center !important;
}

#overlay {
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	position: absolute;
	transition-duration: 750ms;
	display: none;
	z-index: 40;

	&.shown1 {
		display: block;
	}

	@supports (backdrop-filter: blur(8px)) {
		backdrop-filter: blur(0px);
		&.shown2 {
			background-color: rgba(0, 0, 0, 0.2);
			backdrop-filter: blur(8px);
		}
	}
	@supports not (backdrop-filter: blur(8px)) {
		background-color: rgba(0, 0, 0, 0);
		&.shown2 {
			background-color: rgba(0, 0, 0, 0.45);
		}
	}
}

#addStockModal {
	position: absolute;
	width: 75%;
	left: 12.5%;
	max-width: 600px;
	background: white;
	height: 400px;
	top: 100px;
	border-radius: 14px;
	box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.4);
	overflow-y: scroll;
	padding: 4px 24px;
	opacity: 0;
	transition-duration: 500ms;

	a {
		cursor: pointer;
	}

	&.shown {
		opacity: 1;
	}

	h1 {
		border-bottom: solid 4px #ddd;
		padding-bottom: 12px;
	}
}

.errorMessage {
	color: red;
	font-weight: bold;
	font-size: 1.2rem;
}

.stockCardTable {
	&, & *{
		border: none!important;
	}
}
</style>
