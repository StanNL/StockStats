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
	</div>
</template>

<script>
const request = require('request');
import { exchangeList } from '../data/exchangeList.js'


export default {
	name: "AddStockModal",
	data: function(){
		return {
			exchangeList: exchangeList
		}
	},
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
				this.value.error = "Voer eerst de prisj in waarvoor je dit aandeel hebt gekocht.";
				this.$forceUpdate();
				return;
			}
			let d = this.valiDate(this.value.purchaseDate);
			if (d.error) {
				this.value.error = d.error;
				this.$forceUpdate();
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

			this.$emit("close");

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