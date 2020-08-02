<template>
	<loading-spinner/>
</template>

<script>
import firebaseMixin from '../js/firebase.js';
import LoadingSpinner from './LoadingSpinner.vue';

export default {
	name: "LogoutPage",
	components: {
		LoadingSpinner
	},
	mixins: [firebaseMixin],
	mounted: function(){
		let self = this;
		this.firebase.auth().signOut().then(function(){
			self.$router.push("/");
			location.reload();
		});
	}
}
</script>