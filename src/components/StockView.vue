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
		<div v-else>
			Laden...
		</div>
	</div>
</template>
<script>
const request = require('request');

export default {
	name: "StockView",
	data: function(){
		return {
			stockData: {}
		}
	},
	props: {
		stock: Object
	},
	mounted: function(){
		let self = this;
		this.stockData.loaded = false;
		request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&apikey=K2RAV5JYMOOVLZMB&symbol=' + this.stock.symbol + '&outputsize=compact&datatype=json', {json: true}, function(a, b, data){
			a;
			b;
			data = data[Object.keys(data)[0]]
			let keys = Object.keys(data);
			console.log(keys);
			for (let i = 0; i < keys.length; i++) {
				console.log(keys[i]);
				if(keys[i].split("price").length > 1){
					self.stockData.price = +data[keys[i]];
					console.log("prijsgevonden?");
				}
				if(keys[i].split("change percent").length > 1){
					self.stockData.pctChange = +(data[keys[i]].split("%")[0]);
					console.log("pctgevonden?");
				}
			}
			console.log("dus dat wel?");
			self.stockData.loaded = true;
			self.$forceUpdate();
		});
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