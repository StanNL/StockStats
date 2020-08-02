<template>
	<div>	
		<h1>Homepagina</h1>
		<div class="row">
			<div
				class="col s12 m6 l3"
				v-for="(stock, index) in stocks"
				:key="index"
			>
				<div class="card teal">
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
						<router-link :to="'/stockInfo/' + stock.stockID">Meer info</router-link>
					</div>
				</div>
			</div>
			<div v-if="!stocks.length">
				Nog geen aandelen gevonden!
				<br>
				<router-link
					class="waves-effect waves-light btn"
					to="/editPortfolio"
				>
					<i class="material-icons left">add</i>
					Aandelen toevoegen
				</router-link>
			</div>
		</div>
	</div>
</template>

<script>
import firebaseMixin from '../js/firebase.js';

export default {
	name: "HomePage",
	mixins: [firebaseMixin],
	data: function(){
		return {
			user: {},
			stocks: []
		}
	}
}
</script>

<style lang="scss">
.stockCardTable {
	&, & *{
		border: none!important;
	}
}

.card-action a {
	color: white !important;
	cursor: pointer;
}
</style>