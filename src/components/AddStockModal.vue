<template>
	<div
		:class="(value.showModal1?'shown1 ':'') + (value.showModal2?'shown2':'')"
		id="overlay"
	>
		<div
			:class="value.showModal3?'shown':''"
			id="addStockModal"
		>
			<h1>Aandeel toevoegen</h1>
			<div class="content">
				<div v-if="value.selectedSymbol && (value.selectedSymbol.symbol == null || value.forceStep1)">
					<div class="row">
						<div class="col s6">
							<div class="input-field">
								<label for="exchange">Exchange</label>
								<input
									autocomplete="off"
									type="text"
									id="exchange"
									@keyup="addStockExchangeInput"
									v-model="value.exchange"
								>
							</div>
							<ul>
								<li
									style="text-align: left;"
									v-for="(suggestion, index) in value.exchangeSuggestions"
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
									:disabled="value.selectedExchange.name == null"
									v-model="value.symbol"
								>
							</div>
							<ul>
								<li
									style="text-align: left;"
									v-for="(suggestion, index) in value.symbolSuggestions"
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
							Gekozen aandeel: {{ value.selectedSymbol.description }}
						</p>
						<div class="col s6">
							<div class="input-field">
								<label for="purchaseDate">Aankoopdatum</label>
								<input
									type="text"
									autocomplete="off"
									@input="value.error = null"
									id="purchaseDate"
									v-model="value.purchaseDate"
								>
							</div>
						</div>
						<div class="col s6">
							<div class="input-field">
								<label for="purchasePrice">Aankoopprijs ({{ value.selectedSymbol.currency }})</label>
								<input
									type="text"
									autocomplete="off"
									id="purchasePrice"
									@input="value.error = null"
									@keyup="priceInput"
									v-model="value.purchasePrice"
								>
							</div>
						</div>
					</div>
					<p class="errorMessage">{{ value.error }}</p>
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
			<button
				style='margin-top: 16px;'
				class="waves-effect waves-light btn"
				@click="closeSelf()"
			>
				<i class="material-icons left">close</i>
				Sluiten
			</button>
		</div>
	</div>
</template>

<script>
const request = require('request');
import { exchangeList } from '../data/exchangeList.js'
import firebaseMixin from '../js/firebase.js';

export default {
	name: "AddStockModal",
	data: function(){
		return {
			exchangeList: exchangeList
		}
	},
	mixins: [firebaseMixin],
	props: {
		value: Object
	},
	methods: {
		addStockExchangeInput: function (event) {
			if (event.keyCode === 13 && this.value.exchangeSuggestions.length >= 1) {
				this.chooseExchange(this.value.exchangeSuggestions[0]);
				return;
			}
			let query = event.target.value.toLowerCase();
			this.value.selectedExchange = {};
			this.value.symbol = '';
			this.value.exchangeSuggestions = []
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
						this.value.exchangeSuggestions.push(el);
						return;
					}
				}
				if (symbol.startsWith(query)) {
					let el = element;
					el.preMatch = el.name + " (";
					el.match = el.symbol.substring(0, query.length);
					el.postMatch = el.symbol.substring(query.length) + ")";
					this.value.exchangeSuggestions.push(el);
					return;
				}
			});
		},
		addStockSymbolInput: function (event) {
			if (event.keyCode === 13 && this.value.symbolSuggestions.length >= 1) {
				this.chooseSymbol(this.value.symbolSuggestions[0]);
				return;
			}
			let query = event.target.value.toLowerCase();
			this.value.selectedSymbol = {};
			this.value.symbolSuggestions = []
			if (query.length === 0) return;
			this.value.symbolOptions.forEach(element => {
				let symbol = element.symbol.toLowerCase();
				let name = element.description.toLowerCase();

				for (let start = 0; start < name.length; start++) {
					let subName = name.substring(start);
					if (subName.startsWith(query)) {
						let el = element;
						el.preMatch = el.description.substr(0, start);
						el.match = el.description.substr(start, query.length);
						el.postMatch = el.description.substr(start + query.length) + " (" + el.symbol + ")";
						this.value.symbolSuggestions.push(el);
						return;
					}
				}
				if (symbol.startsWith(query)) {
					let el = element;
					el.preMatch = el.description + " (";
					el.match = el.symbol.substring(0, query.length);
					el.postMatch = el.symbol.substring(query.length) + ")";
					this.value.symbolSuggestions.push(el);
					return;
				}
			});
		},
		chooseExchange: function (suggestion) {
			this.value.selectedExchange = suggestion;
			this.value.exchangeSuggestions = [];
			this.value.exchange = (suggestion.name.split(" - ").length > 1 && !suggestion.name.split(" - ")[1].startsWith("ALL")) ? suggestion.name.split(" - ")[1] : suggestion.name;
			request('https://finnhub.io/api/v1/stock/symbol?exchange=' + this.value.selectedExchange.symbol + '&token=bsirugvrh5rc8orbo4kg', { json: true }, (a, b, data) => {
				a;
				b;
				this.value.symbolOptions = data.filter(function (el) {
					return el.type == 'EQS' || el.type == 'ETF';
				});
			});
		},
		chooseSymbol: function (symbol) {
			this.value.selectedSymbol = symbol;
			this.value.forceStep1 = false;
		},
		saveAddStock: function () {
			if (!this.value.purchaseDate) {
				this.value.error = "Voer eerst de datum in waarop je dit aandeel hebt gekocht.";
				this.$forceUpdate();
				return;
			}
			if (!this.value.purchasePrice) {
				this.value.error = "Voer eerst de prijs in waarvoor je dit aandeel hebt gekocht.";
				this.$forceUpdate();
				return;
			}
			let d = this.valiDate(this.value.purchaseDate);
			if (d.error) {
				this.value.error = d.error;
				this.$forceUpdate();
				return;
			}
			d = d.date;

			if (isNaN(this.value.purchasePrice)) {
				if (isNaN(this.value.purchasePrice.replace(",", "."))) {
					this.value.error = "Ongeldige aankoopprijs! Enkel getallen, zonder munteenheid-symbolen, zijn toegestaan";
					this.$forceUpdate();
					return;
				}
			}

			this.value.purchaseDate = this.prependZero(d.getDate()) + "-" + this.prependZero(d.getMonth() + 1) + "-" + d.getFullYear();
			this.value.purchasePrice = +this.value.purchasePrice;
			delete this.value.selectedSymbol.match;
			delete this.value.selectedSymbol.preMatch;
			delete this.value.selectedSymbol.postMatch;
			this.value.selectedSymbol.purchaseDate = this.value.purchaseDate;
			this.value.selectedSymbol.purchasePrice = this.value.purchasePrice;
			this.value.newStock = this.value.selectedSymbol;
			this.value.newStock.stockID = this.generateStockID();

			this.$emit("close");

			this.closeSelf();
		},
		closeSelf: function(){
			this.value.showModal3 = false;
			let self = this;
			setTimeout(function () {
				self.value.showModal2 = false;
				setTimeout(() => {
					self.value.showModal1 = false;
				}, 450);
			}, 200);
		},
		valiDate: function (d) {
			if (d.split("/").length === 3) {
				if (d.split("-").length === 1) {
					d = d.replace(/\//g, "-")
				} else {
					return {
						error: "Ongeldige datum! Noteer als dd-mm-yyyy"
					}
				}
			}

			let split = d.split("-");
			if (split.length === 3 && split[0].length < 3 && split[0].length >= 1 && split[1].length < 3 && split[1].length >= 1 && split[2].length === 4) {
				let date = split[0];
				let month = split[1];
				let year = split[2];
				let americanDate = month + "-" + date + "-" + year;
				d = new Date(americanDate);

				if (d == "Invalid Date") {
					return {
						error: "Ongeldige datum! Noteer als dd-mm-yyyy"
					}
				}else {
					let testDate = new Date();
					testDate.setDate(date);
					testDate.setMonth(month-1);
					testDate.setFullYear(year);
					if(testDate.getDate() != date || testDate.getMonth() != (month-1) || testDate.getFullYear() != year){
						return {
							error: "Ongeldige datum! Noteer als dd-mm-yyyy"
						}
					}
				}
			} else {
				return {
					error: "Ongeldige datum! Noteer als dd-mm-yyyy"
				}
			}

			return {
				date: d
			}
		},
		generateStockID: function(){
			let notFound = true;
			let str = this.randomString();
			while(notFound){
				let unsuitable = false;
				for (let i = 0; i < this.stocks.length; i++) {
					if(this.stocks[i].stockID === str){
						unsuitable = true;
					}
				}
				if(!unsuitable) notFound = false;
				else str = this.randomString();
			}

			return str;
		},
		randomString: function() {
			return require("uuid").v4().substr(0, 16);
		},
		prependZero: function (n) {
			return (n < 10) ? ("0" + n) : n;
		},
		backAddStock: function () {
			this.value.forceStep1 = true;
		},
		priceInput: function(event){
			if (event.keyCode === 13) {
				this.saveAddStock();
				return;
			}
		}
	}
}
</script>

<style lang="scss">

#overlay {
	top: 0px;
	left: 0px;
	width: 100vw;
	height: 100vh;
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
	width: 85%;
	left: 7.5%;
	@media only screen and (min-width: 941px){
		left: calc(50% - 400px);
	}
	max-width: 800px;
	background: white;
	height: 500px;
	top: 80px;
	border-radius: 14px;
	box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.4);
	padding: 4px 24px;
	opacity: 0;
	transition-duration: 500ms;

	.content {
		overflow-y: auto;
		height: 280px;
	}
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
</style>