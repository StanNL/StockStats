<template>
	<div id='profilePage'>
		<h1>Mijn profiel</h1>
		<h3>Gebruiksgegevens</h3>
		<b>Naam: </b> {{ user.displayName }} <br>
		<b>E-mailadres: </b> {{ user.email }} <br>
		<b>Gebruikers-ID: </b> {{ user.uid }} <br>
		<h3>Instellingen</h3>
		Nog in ontwikkeling.
	</div>
</template>

<script>
import firebaseMixin from '../js/firebase.js';

export default {
	name: "LogoutPage",
	data: function(){
		return {
			user: {}
		}
	},
	mixins: [firebaseMixin],
	mounted: function(){
	}
}
</script>

<style lang="scss">
#profilePage {
	text-align: left;
	width: 100%;
	padding: 0 3rem;
}
</style>