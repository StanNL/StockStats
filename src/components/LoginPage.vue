<template>
	<div>
		<h1>
			Welkom bij Stans Stock Stats!
		</h1>
		<button
			class="waves-effect waves-light btn"
			@click="firebaseGoogleSignIn"
		>
			Inloggen met Google
		</button>
	</div>
</template>

<script>
import firebaseMixin from '../js/firebase.js'

export default {
	name: "LoginPage",
	mixins: [firebaseMixin],
	data: function(){
		return {
			firebase: {}
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
</script>
