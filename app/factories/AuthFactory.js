'use strict';

app.factory('AuthFactory', function($q) {

	let currentUser = null;

	let logoutUser = () => { return firebase.auth().signOut(); };

	let isAuthenticated = () => {
		return $q((resolve) => {
			firebase.auth().onAuthStateChanged((user) => {
				if (user) {
					if (user.isAnonymous) {
						currentUser = 'anonymous-123456';
					} else {
						currentUser = user.uid;
					}
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	};

	let getUser = () => {
		return currentUser;
	};

	let provider = new firebase.auth.GoogleAuthProvider();

	let authWithProvider = () => { return firebase.auth().signInWithPopup(provider); };

	return { logoutUser, isAuthenticated, getUser, authWithProvider };

});