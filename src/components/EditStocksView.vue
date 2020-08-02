<template>
	<div>
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
		<router-link
			class="waves-effect waves-light btn"
			style="margin-top: 18px;"
			to='/'
		>
			<i class="material-icons left">home</i>
			Terug naar home
		</router-link>

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
	max-width: 800px;
	width: 80% !important;
	left: 10%;
	position: relative;
	@media only screen and (min-width: 1000px) {
		left: calc(50% - 400px);
	}
}
</style>