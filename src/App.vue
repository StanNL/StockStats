<template>
	<div id="app">
		<link
			href="https://fonts.googleapis.com/icon?family=Material+Icons"
			rel="stylesheet"
		>
		<div v-if="!isLoggedIn">
			<p>
				<img
					alt="Vue logo"
					src="../src/assets/logo.png"
				>
			</p>
			<button
				class="waves-effect waves-light btn"
				@click="firebaseGoogleSignIn"
			>
				Inloggen met Google
			</button>
		</div>
		<div v-else>
			Je bent ingelogd! <br>
			<div v-if="user.uid">
				E-mailadres: {{ user.email }} <br>
				UID: {{ user.uid }}
				<br>
				<br>
				<div v-if="wijzigAandelen">
					<h1>Aandelen</h1>
					<table id="editStockTable" class='striped highlight'>
						<thead>
							<tr>
								<td>
									Symbool
								</td>
								<td>
									Aankoopdatum
								</td>
								<td>
									Aankoopprijs
								</td>
								<td>
									Verkoopdatum (optioneel)
								</td>
								<td>
									Verkoopprijs (optioneel)
								</td>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="(stock, index) in stocks"
								:key="index"
							>
								<td>
									{{ stock.description }}
								</td>
								<td>
									{{ stock.purchaseDate }}
								</td>
								<td>
									{{ stock.purchasePrice.toFixed(2) }} {{stock.currency}}
								</td>
								<td>
									<input
										v-if="stock.saleDate == null"
										v-model="stock.newSaleDate"
									>
									<span v-else>
										{{ stock.saleDate }}
									</span>
								</td>
								<td>
									<input
										v-if="stock.salePrice == null"
										v-model="stock.newSalePrice"
									>
									<span v-else>
										{{ (+stock.salePrice).toFixed(2) }} {{stock.currency}}
									</span>
								</td>
								<td>
									<button
										class="waves-effect waves-light btn"
										@click="deleteStock(index)"
									>
										<i class="material-icons">delete</i>
									</button>
								</td>
							</tr>
						</tbody>
					</table>
					<p class="errorMessage">{{ editStocksError }}</p>
					<br>
					<button
						class="waves-effect waves-light btn"
						style="margin-top: 18px;"
						@click="showAddStockModal()"
					>
						<i class="material-icons left">add</i>
						Nieuw aandeel toevoegen
					</button>
					<br>
					<button
						class="waves-effect waves-light btn"
						style="margin-top: 18px;"
						@click="saveStocks()"
					>
						<i class="material-icons left">save</i>
						Aandelen opslaan
					</button>
					<br>
					<button
						class="waves-effect waves-light btn"
						style="margin-top: 18px;"
						@click="wijzigAandelen = false"
					>
						<i class="material-icons left">home</i>
						Terug naar home
					</button>
				</div>
				<div v-if="!wijzigAandelen && !stockView">
					<h1>Homepagina</h1>
					<br>
					<br>
					<div class="row">
						<div
							class="col s6 m6"
							v-for="(stock, index) in stocks"
							:key="index"
						>
							<div class="card blue-grey darken-1">
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
				<div v-if="stockView">
					<h1>Aandeel info: {{ viewedStock.symbol }}</h1>
					{{ JSON.stringify(viewedStock) }}
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

			<div
				:class="(addStock.showModal1?'shown1 ':'') + (addStock.showModal2?'shown2':'')"
				id="overlay"
			>
				<div
					:class="addStock.showModal3?'shown':''"
					id="addStockModal"
				>
					<h1>Aandeel toevoegen</h1>
					<div v-if="addStock.selectedSymbol.symbol == null || addStock.forceStep1">
						<div class="row">
							<div class="col s6">
								<div class="input-field">
									<label for="exchange">Exchange</label>
									<input
										autocomplete="off"
										type="text"
										id="exchange"
										@keyup="addStockExchangeInput"
										v-model="addStock.exchange"
									>
								</div>
								<ul>
									<li
										style="text-align: left;"
										v-for="(suggestion, index) in addStock.exchangeSuggestions"
										:key="index"
									>
										<a @click="chooseExchange(suggestion)">
											{{ suggestion.preMatch }}<b>{{ suggestion.match }}</b>{{ suggestion.postMatch }}
										</a>
									</li>
								</ul>
							</div>
							<div class="col s6">
								<div class="input-field">
									<label for="symbolChoice">Symbol</label>
									<input
										autocomplete="off"
										type="text"
										id="symbolChoice"
										@keyup="addStockSymbolInput"
										:disabled="addStock.selectedExchange.name == null"
										v-model="addStock.symbol"
									>
								</div>
								<ul>
									<li
										style="text-align: left;"
										v-for="(suggestion, index) in addStock.symbolSuggestions"
										:key="index"
									>
										<a @click="chooseSymbol(suggestion)">
											{{ suggestion.preMatch }}<b>{{ suggestion.match }}</b>{{ suggestion.postMatch }}
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div v-else>
						<div class='row'>
							<p>
								Gekozen aandeel: {{ addStock.selectedSymbol.description }}
							</p>
							<div class="col s6">
								<div class="input-field">
									<label for="purchaseDate">Aankoopdatum</label>
									<input
										type="text"
										autocomplete="off"
										id="purchaseDate"
										v-model="addStock.purchaseDate"
									>
								</div>
							</div>
							<div class="col s6">
								<div class="input-field">
									<label for="purchasePrice">Aankoopprijs ({{ addStock.selectedSymbol.currency }})</label>
									<input
										type="text"
										autocomplete="off"
										id="purchasePrice"
										v-model="addStock.purchasePrice"
									>
								</div>
							</div>
						</div>
						<p class="errorMessage">{{ addStock.error }}</p>
						<button
							class="waves-effect waves-light btn"
							@click="backAddStock"
						>
							<i class="material-icons left">arrow_back</i>
							Terug
						</button>
						<br>
						<br>
						<button
							class="waves-effect waves-light btn"
							@click="saveAddStock"
						>
							<i class="material-icons left">save</i>
							Opslaan
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import firebaseMixin from '../src/js/firebase.js'
import { exchangeList } from '../src/data/exchangeList.js'
const request = require('request');


export default {
	name: 'App',
	data: function () {
		return {
			user: {},
			stocks: [],
			isLoggedIn: false,
			wijzigAandelen: false,
			stockView: false,
			symbols: [],
			exchangeList: exchangeList,
			addStock: this.emptyAddStock(),
			editStocksError: ""
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
		emptyAddStock: function () {
			return {
				showModal1: false,
				showModal2: false,
				showModal3: false,
				symbolSuggestions: [],
				exchangeSuggestions: [],
				symbol: "",
				exchange: "",
				selectedSymbol: {},
				selectedExchange: {},
				symbolOptions: [],
				forceStep1: false
			}
		},
		refreshUserData: function () {
			this.user = this.firebase.auth().currentUser;
		},
		uploadUserData: function (data, callback) {
			if (!this.user.uid) alert("niet ingelogd, idioot");
			this.db.collection("users").doc(this.user.uid).set(data, { merge: true }).catch(function (error) {
				console.log(error);
			}).then(callback || (() => { }));
		},
		saveStocks: function (callback) {
			for (let i = 0; i < this.stocks.length; i++) {
				if (this.stocks[i].newSalePrice) {
					if (isNaN(this.stocks[i].newSalePrice)) {
						this.editStocksError = "Ongeldige verkoopprijs in je " + (i + 1) + "de rij!";
					} else {
						this.editStocksError = "";
						this.stocks[i].salePrice = +this.stocks[i].newSalePrice;
						delete this.stocks[i].newSalePrice;
					}
				}
				if (this.stocks[i].newSaleDate) {
					let validation = this.valiDate(this.stocks[i].newSaleDate);
					if (validation.error) {
						this.editStocksError = validation.error;
						return;
					} else {
						this.editStocksError = "";
						this.stocks[i].saleDate = this.stocks[i].newSaleDate;
						delete this.stocks[i].newSaleDate;
					}
				}
			}

			this.$forceUpdate();

			this.uploadUserData({
				stocks: this.stocks
			}, callback || (() => { }));
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
		deleteStock: function (index) {
			if (confirm("Weet je zeker dat je dit aandeel wilt verwijderen?")) {
				this.stocks.splice(index, 1);
				this.saveStocks();
			}
		},
		getStockData: function (stock) {
			this.viewedStock = stock;
			this.stockView = true;
		},
		addStockExchangeInput: function (event) {
			if (event.keyCode === 13 && this.addStock.exchangeSuggestions.length >= 1) {
				this.chooseExchange(this.addStock.exchangeSuggestions[0]);
				return;
			}
			let query = event.target.value.toLowerCase();
			this.addStock.selectedExchange = {};
			this.addStock.symbol = '';
			this.addStock.exchangeSuggestions = []
			if (query.length === 0) return;
			this.exchangeList.forEach(element => {
				let symbol = element.symbol.toLowerCase();
				let name = element.name.toLowerCase();

				for (let start = 0; start < name.length; start++) {
					let subName = name.substring(start);
					if (subName.startsWith(query)) {
						let el = element;
						el.preMatch = el.name.substr(0, start);
						el.match = el.name.substr(start, query.length);
						el.postMatch = el.name.substr(start + query.length) + " (" + el.symbol + ")";
						this.addStock.exchangeSuggestions.push(el);
						return;
					}
				}
				if (symbol.startsWith(query)) {
					let el = element;
					el.preMatch = el.name + " (";
					el.match = el.symbol.substring(0, query.length);
					el.postMatch = el.symbol.substring(query.length) + ")";
					this.addStock.exchangeSuggestions.push(el);
					return;
				}
			});
		},
		addStockSymbolInput: function (event) {
			if (event.keyCode === 13 && this.addStock.symbolSuggestions.length >= 1) {
				this.chooseSymbol(this.addStock.symbolSuggestions[0]);
				return;
			}
			let query = event.target.value.toLowerCase();
			this.addStock.selectedSymbol = {};
			this.addStock.symbolSuggestions = []
			if (query.length === 0) return;
			this.addStock.symbolOptions.forEach(element => {
				let symbol = element.symbol.toLowerCase();
				let name = element.description.toLowerCase();

				for (let start = 0; start < name.length; start++) {
					let subName = name.substring(start);
					if (subName.startsWith(query)) {
						let el = element;
						el.preMatch = el.description.substr(0, start);
						el.match = el.description.substr(start, query.length);
						el.postMatch = el.description.substr(start + query.length) + " (" + el.symbol + ")";
						this.addStock.symbolSuggestions.push(el);
						return;
					}
				}
				if (symbol.startsWith(query)) {
					let el = element;
					el.preMatch = el.description + " (";
					el.match = el.symbol.substring(0, query.length);
					el.postMatch = el.symbol.substring(query.length) + ")";
					this.addStock.symbolSuggestions.push(el);
					return;
				}
			});
		},
		showAddStockModal: function () {
			this.addStock = this.emptyAddStock();
			this.addStock.showModal1 = true;
			let self = this;
			setTimeout(function () {
				self.addStock.showModal2 = true;
			}, 150);

			setTimeout(function () {
				self.addStock.showModal3 = true;
			}, 450);
		},
		chooseExchange: function (suggestion) {
			this.addStock.selectedExchange = suggestion;
			this.addStock.exchangeSuggestions = [];
			this.addStock.exchange = (suggestion.name.split(" - ").length > 1 && !suggestion.name.split(" - ")[1].startsWith("ALL")) ? suggestion.name.split(" - ")[1] : suggestion.name;
			request('https://finnhub.io/api/v1/stock/symbol?exchange=' + this.addStock.selectedExchange.symbol + '&token=bsirugvrh5rc8orbo4kg', { json: true }, (a, b, data) => {
				a;
				b;
				this.addStock.symbolOptions = data.filter(function (el) {
					return el.type == 'EQS' || el.type == 'ETF';
				});
			});

		},
		chooseSymbol: function (symbol) {
			this.addStock.selectedSymbol = symbol;
			this.addStock.forceStep1 = false;
		},
		saveAddStock: function () {
			if (!this.addStock.purchaseDate) {
				this.addStock.error = "Voer eerst de datum in waarop je dit aandeel hebt gekocht.";
				this.$forceUpdate();
				return;
			}
			if (!this.addStock.purchasePrice) {
				this.addStock.error = "Voer eerst de prisj in waarvoor je dit aandeel hebt gekocht.";
				this.$forceUpdate();
				return;
			}
			let d = this.valiDate(this.addStock.purchaseDate);
			if (d.error) {
				this.addStock.error = d.error;
				this.$forceUpdate();
			}
			d = d.date;

			if (isNaN(this.addStock.purchasePrice)) {
				if (isNaN(this.addStock.purchasePrice.replace(",", "."))) {
					this.addStock.error = "Ongeldige aankoopprijs! Enkel getallen, zonder munteenheid-symbolen, zijn toegestaan";
					this.$forceUpdate();
					return;
				}
			}

			this.addStock.purchaseDate = this.prependZero(d.getDate()) + "-" + this.prependZero(d.getMonth() + 1) + "-" + d.getFullYear();
			this.addStock.purchasePrice = +this.addStock.purchasePrice;
			delete this.addStock.selectedSymbol.match;
			delete this.addStock.selectedSymbol.preMatch;
			delete this.addStock.selectedSymbol.postMatch;
			this.addStock.selectedSymbol.purchaseDate = this.addStock.purchaseDate;
			this.addStock.selectedSymbol.purchasePrice = this.addStock.purchasePrice;
			let newStock = this.addStock.selectedSymbol;

			this.stocks.push(newStock);

			this.saveStocks();

			this.addStock.showModal3 = false;
			let self = this;
			setTimeout(function () {
				self.addStock.showModal2 = false;
				setTimeout(() => {
					self.addStock.showModal1 = false;
				}, 450);
			}, 200);
		},
		valiDate: function (d) {
			if (d.split("/").length === 3) {
				if (d.split("-").length === 1) {
					d = d.replace(/\//g, "-")
				} else {
					return {
						d: null,
						error: "Ongeldige datum! Noteer als dd-mm-yyyy"
					}
				}
			}

			let split = d.split("-");
			if (split.length === 3 && split[0].length < 3 && split[0].length >= 1 && split[1].length < 3 && split[1].length >= 1 && split[2].length === 4) {
				let americanDate = split[1] + "-" + split[0] + "-" + split[2];
				d = new Date(americanDate);
				if (d == "Invalid Date") {
					return {
						d: null,
						error: "Ongeldige datum! Noteer als dd-mm-yyyy"
					}
				}
			} else {
				return {
					date: null,
					error: "Ongeldige datum! Noteer als dd-mm-yyyy"
				}
			}
			return {
				date: d,
				error: null
			}
		},
		prependZero: function (n) {
			return (n < 10) ? ("0" + n) : n;
		},
		backAddStock: function () {
			this.addStock.forceStep1 = true;
		}
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
