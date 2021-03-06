'use strict';

app.controller('UserCtrl', function ($scope, $window, $routeParams, AuthFactory, ConnectFactory) {

	// Number of Users Online
	ConnectFactory.fbPresenceDb.on('value', (x) => {
		$scope.$evalAsync(() => {
			$scope.usersOnline = x.numChildren();
		});
	});
	
	$scope.isLoggedIn = false;

	$scope.logout = () => {
		AuthFactory.logoutUser().then((data) => {
			$window.location.url = '#!/login';
			$scope.isLoggedIn = false;
		});
	};

	// Onload - Ensure all User's are Logged Out
	if (AuthFactory.isAuthenticated()) { $scope.logout(); }

	$scope.demoAnon = () => {
		firebase.auth().signInAnonymously().then( (result) => {
			let uid = 'anonymous-123456';

			ConnectFactory.fbUserDb.child(uid).once('value').then((x) => {
					ConnectFactory.fbUserDb.child(uid).set({
						name: 'Anonymous User',
						email: 'notreal@digitalmarshmellow.com',
						photo: 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg',
						uid: 'anonymous-123456',
						description: 'This information is overwrote on the next login'
					});
					ConnectFactory.fbGroupsDb.child(uid).set({
						groupOwner: uid
					});
					ConnectFactory.fbMessagesDb.child(uid).remove();
					ConnectFactory.fbImagesDb.child(uid).remove();
					ConnectFactory.fbStatusUpdatesDb.child(uid).remove();
					ConnectFactory.fbRelationshipsDb.child(uid).remove();
			});

	    	$scope.isLoggedIn = true;
	    	$routeParams.profileId = uid;
	    	$window.location.href = '#!/profile/' + $routeParams.profileId;
		});
	};

	$scope.loginGoogle = () => {
		let provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then((result) => {
			let user = result.user; 
			let uid = result.user.uid;

			ConnectFactory.fbUserDb.child(uid).once('value').then((x) => {
				if (!x.exists()) {
					// Initial Set-Up Only - Get Google Profile
					ConnectFactory.fbUserDb.child(uid).set({
						name: user.displayName,
						email: user.email,
						photo: user.photoURL,
						uid: uid
					});
					ConnectFactory.fbGroupsDb.child(uid).set({
						groupOwner: uid
					});
				}
			});

	    	$scope.isLoggedIn = true;
	    	$routeParams.profileId = uid;
	    	$window.location.href = '#!/profile/' + $routeParams.profileId;
		});
	};

});
