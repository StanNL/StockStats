var firebase = require("firebase/app");
// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
require("firebase/analytics");

var firebaseConfig = {
	apiKey: "AIzaSyCMtBkQvkBXNJgn1wBrq2Qp7N8nFqs9Akc",
	authDomain: "stock-stats-2d6cb.firebaseapp.com",
	databaseURL: "https://stock-stats-2d6cb.firebaseio.com",
	projectId: "stock-stats-2d6cb",
	storageBucket: "stock-stats-2d6cb.appspot.com",
	messagingSenderId: "995534270172",
	appId: "1:995534270172:web:df68dca6b34788759d8e19",
	measurementId: "G-0SZ8LZ2897"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default {
	data() {
		return {
			firebase: firebase,
			db: firebase.firestore()
		}
	},
	mounted: function () {
		let self = this;
		this.firebase.auth().onAuthStateChanged(function (user) {
			if (user != null) {
				self.isLoggedIn = true;
				self.initUserData();
				if(self.$route.path === '/login'){
					self.$router.push("/");
				}
			} else {
				self.user = {};
				self.isLoggedIn = false;
				if(self.$route.path != '/login'){
					self.$router.push("/login");
				}
			}
		});
	},
	methods: {
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
		refreshUserData: function () {
			this.user = this.firebase.auth().currentUser;
		},
		uploadUserData: function (data, callback) {
			if (!this.user.uid) alert("niet ingelogd, idioot");
			this.db.collection("users").doc(this.user.uid).set(data, { merge: true }).catch(function (error) {
				console.log(error);
			}).then(callback || (() => { }));
		},
	}
}