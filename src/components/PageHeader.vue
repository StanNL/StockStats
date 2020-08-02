<template>
	<div>
		<nav class="teal">
			<div class="nav-wrapper">
				<router-link
					to="/"
					class="brand-logo"
				>
					Stans Stock Stats
				</router-link>
				<a
					href="#"
					data-target="mobile-demo"
					class="sidenav-trigger"
				>
					<i class="material-icons">
						menu
					</i>
				</a>
				<ul id='navurls' class="right hide-on-med-and-down">
					<li>
						<a @click="openLink('/')">
							Home
						</a>
					</li>
					<li v-if="user && user.uid">
						<a @click="openLink('../logout')">
							Uitloggen
						</a>
					</li>
					<li v-if="user && user.uid">
						<a @click="openLink('../profile')">
							Mijn profiel ({{ user.displayName }})
						</a>
					</li>
					<li v-if="user && user.uid">
						<a @click="openLink('../changeStocks')">
							Aandelen wijzigen
						</a>
					</li>
					<li v-else>
						<a @click="openLink('../login')">
							Inloggen
						</a>
					</li>
				</ul>
			</div>
		</nav>

		<ul
			class="sidenav"
			id="mobile-demo"
		>
			<li>
				<a @click="openLink('/')">
					Home
				</a>
			</li>
			<li v-if="user && user.uid">
				<a @click="openLink('../logout')">
					Uitloggen
				</a>
			</li>
			<li v-if="user && user.uid">
				<a @click="openLink('../profile')">
					Mijn profiel ({{ user.displayName }})
				</a>
			</li>
			<li v-if="user && user.uid">
				<a @click="openLink('../changeStocks')">
					Aandelen wijzigen
				</a>
			</li>
			<li v-else>
				<a @click="openLink('../login')">
					Inloggen
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
const M = require('materialize-css');

export default {
	name: "PageHeader",
	props: {
		user: Object,
		firebase: Object
	},
	mounted: function () {
		var elems = document.querySelectorAll('.sidenav');
		M.Sidenav.init(elems, {});
	},
	methods: {
		logOut: function () {
			this.firebase.auth().signOut();
			this.closeSideNav();
		},
		openLink: function (link) {
			if (this.$route.path != link.substr(2)) {
				this.$router.push(link);
			}
			this.closeSideNav();
		},
		closeSideNav: function () {
			M.Sidenav.getInstance(document.querySelector(".sidenav")).close();
		}
	}
}
</script>


<style lang="scss">
.sidenav a, .nav-wrapper a {
	cursor: pointer;
}
.brand-logo {
    width: 100%;
	left: 0px;
	z-index: 1;
}

#navurls{
	position: relative;
	z-index: 2;
}
</style>