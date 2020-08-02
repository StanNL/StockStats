module.exports = {
	publicPath: process.env.NODE_ENV === 'production'
		? '/StockStats/'
		: '/',
	css: {
		loaderOptions: {
			sass: {
				additionalData: `@import "@/scss/global.scss"; @import "https://fonts.googleapis.com/icon?family=Material+Icons";`
			}
		}
	},
	runtimeCompiler: true
}