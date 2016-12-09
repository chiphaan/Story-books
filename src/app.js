
var app = angular.module('MyApp', ['ngRoute', 'ngMaterial', 'ngMessages']);

app.service('BookService', function ($http, $filter, $rootScope) {
	var books = undefined,
		commands = [];

	$http.get('books.json').then(function (data) {
		books = data.data;
		callCommands();
	})

	function callCommands() {
		angular.forEach(commands, function (callbacks) {
			callbacks();
		})
	}

	return {
		whenLoaded: function (callback) {
			if (typeof books === "undefined") {
				commands.push(callback);
			} else {
				callback();
			}
		},

		searchBooks: function (term) {
			return $filter('filter')(books, {name: term});
		},

		getBook: function (id) {
			return $filter('filter')(books, {id: id})[0];
		},

		getTopBooks: function (howMany) {
			var filtered = this.searchBooks($rootScope.searchTerm);
			howMany = howMany || 4;
			return filtered.slice(0, howMany);
		},

		getAllBooks: function () {
			return books;
		},

		newBook: function (book) {
			return books.push(book);
		},

		removeBook: function (book) {
			var index = books.indexOf(book);
			return books.splice(index, 1);
		}
	}
})

app.controller('AppController', function ($rootScope, BookService) {
	var ctrl = this;

	BookService.whenLoaded(function () {
		$rootScope.books = BookService.searchBooks($rootScope.searchTerm);
	});

	ctrl.search = function (text) {
		BookService.whenLoaded(function () {
			$rootScope.books =  BookService.searchBooks(text);
		});
	}
}); 

app.controller('HomeController', function ($rootScope, BookService, $location) {
	var ctrl = this;

	BookService.whenLoaded(function () {
		$rootScope.books = BookService.getTopBooks(4);
	});

    ctrl.edit = function (book) {
    	$location.path('/books/' + book.id + '/edit');
    }
});

app.controller('BooksController', function ($rootScope, BookService, $location) {
	var ctrl = this;

	BookService.whenLoaded(function () {
		$rootScope.books = BookService.getTopBooks(4);
	});

    ctrl.confirm = function ($mdOpenMenu, $event) {
        $mdOpenMenu($event);
    };

    ctrl.remove = function (book) {
    	BookService.whenLoaded(function () {
			BookService.removeBook(book);
			$rootScope.books = BookService.searchBooks($rootScope.searchTerm);
		});
    }

    ctrl.edit = function (book) {
    	$location.path('/books/' + book.id + '/edit');
    }
});

app.controller('AddBooksController', function ($rootScope, BookService, $location) {
	var ctrl = this;

    ctrl.book = {};

    ctrl.save = function (book) {
    	BookService.whenLoaded(function () {
	    	BookService.newBook(book);
	    	$location.path('/books');
		});
    }
});

app.controller('EditBooksController', function ($rootScope, $routeParams, BookService) {
	var ctrl = this;

    ctrl.book = BookService.getBook($routeParams.id);
});

app.config(function ($routeProvider, $mdThemingProvider) {
	$routeProvider

		.when('/home', {
			templateUrl: 'views/home.html',
			controller: 'HomeController as ctrl'
		})
		.when('/books', {
			templateUrl: 'views/books.html',
			controller: 'BooksController as ctrl'
		})
		.when('/books/add', {
			templateUrl: 'views/form.html',
			controller: 'AddBooksController as ctrl'
		})
		.when('/books/:id/edit', {
			templateUrl: 'views/form.html',
			controller: 'EditBooksController as ctrl'
		})
		.otherwise('/home');

	$mdThemingProvider.theme('default')
		.primaryPalette('green')
		.accentPalette('red');
});