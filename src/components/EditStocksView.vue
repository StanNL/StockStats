<template>
	<div>
		<div class='row'>
			<div class="col s12" style='overflow-x: auto;'>
				<table id="editStockTable" style="table-layout: fixed;" class='striped highlight'>
					<thead>
						<tr>
							<td>
								Symbool
							</td>
							<td>
								Aankoopprijs
							</td>
							<td>
								Aankoopdatum
							</td>
							<td>
								Verkoopprijs (optioneel)
							</td>
							<td>
								Verkoopdatum (optioneel)
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
								{{ stock.purchasePrice.toFixed(2) }} {{stock.currency}}
							</td>
							<td>
								{{ stock.purchaseDate }}
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
								<input
									v-if="stock.saleDate == null"
									v-model="stock.newSaleDate"
								>
								<span v-else>
									{{ stock.saleDate }}
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
			</div>
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
		</div>
		<add-stock-modal
			@close="aandeelToevoegen"
			v-model="addStock"/>
	</div>
</template>


<script>
import AddStockModal from './AddStockModal.vue';
import firebaseMixin from '../js/firebase.js';

export default {
	name: "EditStocksView",
	components: {
		AddStockModal
	},
	mixins: [firebaseMixin],
	data: function(){
		return {
			addStock: this.emptyAddStock(),
			stocks: [],
			editStocksError: ""
		}
	},
	methods: {
		emptyAddStock: function(){
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
		deleteStock: function (index) {
			if (confirm("Weet je zeker dat je dit aandeel wilt verwijderen?")) {
				this.stocks.splice(index, 1);
				this.saveStocks();
			}
		},
		saveStocks: function () {
			this.editStocksError = '';
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
			});
		},
		aandeelToevoegen: function(){
			this.stocks.push(this.addStock.newStock);
			this.saveStocks();
		}
	}
}
</script>

<style lang="scss">
#editStockTable {
	max-width: 1000px;
	width: 80% !important;
	min-width: 675px;
	left: 10%;
	position: relative;
	@media only screen and (min-width: 1000px) {
		left: calc(50% - 400px);
	}
	@media only screen and (max-width: 720px) {
		left: 0!important;
		width: 100%!important;
	}
}
</style>