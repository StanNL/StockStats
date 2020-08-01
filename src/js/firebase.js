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
    methods: {
		firebaseGoogleSignIn: function(){
			let self = this;
			var provider = new this.firebase.auth.GoogleAuthProvider();
			
			this.firebase.auth().setPersistence(this.firebase.auth.Auth.Persistence.LOCAL).then(function(){
				self.firebase.auth().signInWithPopup(provider);
			});
		}
	}
}