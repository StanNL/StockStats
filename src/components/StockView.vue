<template>
	<div>
		<h2>Aandeel info: {{ stock.description }}</h2>
		<h4
			v-if="stockData.loaded">
			{{ stockData.price.toFixed(2) }} {{ stock.currency }}
			<span 
				:class="stockData.pctChange < 0 ? 'negative' : 'positive'">
				{{ stockData.pctChange }}%
			</span>
		</h4>
		<loading-spinner v-else/>
		<br>
		<router-link
			class="waves-effect waves-light btn"
			to="/"
		>
			<i class="material-icons left">arrow_back</i>
			Terug
		</router-link>
	</div>
</template>
<script>
import firebaseMixin from '../js/firebase.js';
import LoadingSpinner from './LoadingSpinner.vue'
const request = require('request');

export default {
	name: "StockView",
	components: {
		LoadingSpinner
	},
	mixins: [firebaseMixin],
	data: function(){
		return {
			user: {},
			stocks: [],
			stock: {},
			stockData: {}
		}
	},
	watch: {
		stocks: function(){
			this.stock = this.stocks[this.$route.params.stockID];
			if(!this.stock) {
				this.$router.push("/404");
				return;
			}
			let self = this;
			this.stockData.loaded = false;
			request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&apikey=K2RAV5JYMOOVLZMB&symbol=' + this.stock.symbol + '&outputsize=compact&datatype=json', {json: true}, function(a, b, data){
				a;
				b;
				data = data[Object.keys(data)[0]]
				let keys = Object.keys(data);
				for (let i = 0; i < keys.length; i++) {
					if(keys[i].split("price").length > 1){
						self.stockData.price = +data[keys[i]];
					}
					if(keys[i].split("change percent").length > 1){
						self.stockData.pctChange = +(data[keys[i]].split("%")[0]);
					}
				}
				self.stockData.loaded = true;
				self.$forceUpdate();
			});
		}
	}
}
</script>

<style lang="scss">
.negative {
	color: red;
	font-weight: bold;
}
.positive {
	color: green;
	font-weight: bold;
}
</style>