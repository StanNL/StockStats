<template>
	<div style="text-align: left;">
		<ul class="collection with-header">
			<li class="collection-header">
				<h4>Portfolio aandelen</h4>
			</li>
			<li
				v-for="(stock, index) in stocks"
				:key="index"
				class="collection-item"
			>
				<b>{{ stock.symbol }}:</b> {{ (+((stock.weekStart||{})['1. open']||0)).toFixed(2) }} {{ stock.currency }} op {{ (stock.weekStart||{}).date }}
			</li>
		</ul>
	</div>
</template>
<script>
const request = require("request");
import firebaseMixin from '../js/firebase.js';

export default {
	name: "PortfolioView",
	data: function () {
		return {
			stocks: []
		}
	},
	mixins: [firebaseMixin],
	watch: {
		stocks: function () {
			let weekStart = new Date();
			weekStart.setDate(new Date().getDate() - this.mod((new Date().getDay() - 1), 7));
			weekStart.setHours(0);
			weekStart.setMinutes(0);
			let doneSymbols = [];
			let self = this;
			for (let i = 0; i < this.stocks.length; i++) {
				if (doneSymbols.indexOf(this.stocks[i].symbol) > -1) continue;
				doneSymbols.push(this.stocks[i].symbol);
				request("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + this.stocks[i].symbol + "&apikey=K2RAV5JYMOOVLZMB", { json: true }, function (a, b, quotes) {
					a;
					b;
					let quoteKey = "";
					let symbol = "";
					Object.keys(quotes).forEach(function (key) {
						if (key.split("Time Series").length > 1) {
							quoteKey = key;
						}
						if (key.split("Meta").length > 1) {
							symbol = quotes[key]['2. Symbol'];
						}
					});

					if (!symbol || !quoteKey) {
						console.log("paniek!", quotes, symbol, quoteKey);
						return;
					}

					let timeQuotes = quotes[quoteKey];

					let dates = Object.keys(timeQuotes);
					let dddRecord = Infinity;
					let closestDate = null;
					for (let i = 0; i < dates.length; i++) {
						const date = dates[i];
						let dd = new Date(date);
						let ddd = dd - weekStart;
						if (Math.abs(ddd) < dddRecord) {
							dddRecord = Math.abs(ddd);
							closestDate = date;
						}
					}

					if (!closestDate) {
						console.log("paniek!", quotes);
						return;
					}

					for (let i = 0; i < self.stocks.length; i++) {
						if (self.stocks[i].symbol === symbol) {
							self.stocks[i].quotes = quotes[quoteKey];
							self.stocks[i].weekStart = quotes[quoteKey][closestDate];
							self.stocks[i].weekStart.date = closestDate;
							self.$forceUpdate();
							break;
						}
					}
				})
			}
		},
	},
	methods: {
		mod: function (a, b) { //a mod b taking into account a < 0
			return (a < 0) ? ((b + a) % b) : (a % b);
		}
	}
}
</script>