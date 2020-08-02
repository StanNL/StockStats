<template>
	<div>
		<h1>Mijn profiel</h1>
		Hier komt ooit een profiel-pagina.
		<br>
		{{ JSON.stringify(user) }}
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