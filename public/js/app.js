//app.js
var Logger = (function () {
    var Logger = {
        log: function (message) {
            if (window.console && typeof console.log === "function") {
                console.log(message);
            }
        }
    };

    return Logger;
}());



//app controller is the main controller for site (routes)
var app = angular.module('app',['ngAnimate', 'ngFileUpload', 'ngRoute', 'ngSanitize', 'ngDialog']);
 //student vs admin view
var admin;

app.config(function($routeProvider) {

    if (sessionStorage.adminAuth=="true") {
        $routeProvider
        // route for the home page
            .when('/', {
                templateUrl: '../html/pages/home.html',
                controller: 'mainController'
            })
            // route for the cards page
            .when('/card', {
                templateUrl: '../html/pages/card.html',
                controller: 'flashcardController',
                resolve: 'flashcardController.resolve'
            })
            // route for the abouts page
            .when('/about', {
                templateUrl: '../html/pages/about.html',
                controller: 'aboutController'
            })
            // route for the contact page
            .when('/test', {
                templateUrl: '../html/pages/test.html',
                controller: 'testController'
            })
            .when('/signin', {
                templateUrl: '../html/pages/admin.html',
                controller: 'adminController'
            })
            .when('/viewCardsInDeck', {
                templateUrl: '../html/pages/viewCards.html',
                controller: 'viewCardController'
            })
            .when('/cardQuiz', {
                templateUrl: '../html/pages/cardQuiz.html',
                controller: 'viewCardController'
            });
    } else {
        console.log("called student panel");
        $routeProvider
        // route for the home page
            .when('/', {
                templateUrl: '../html/pages/home.html',
                controller: 'mainController'
            })
            // route for the cards page
            .when('/card', {
                templateUrl: '../html/pages/card.html',
                controller: 'flashcardController',
                resolve: 'flashcardController.resolve'
            })
            // route for the abouts page
            .when('/about', {
                templateUrl: '../html/pages/about.html',
                controller: 'aboutController'
            })
            // route for the contact page
            .when('/test', {
                templateUrl: '../html/pages/test.html',
                controller: 'testController'
            })
            .when('/signin', {
                templateUrl: '../html/pages/admin.html',
                controller: 'adminController'
            })
            .when('/viewCardsInDeck', {
                templateUrl: '../html/pages/cardQuiz.html',
                controller: 'quizController'
            });
    }
});

app.controller('appController', ['$scope','$http', 'Upload', function ($scope, $http, Upload) {

    $scope.getAllCards = function(){
        //Gets all the cards from the server
            //Usage: Check API.md for URL needed
        $http({
            method: 'GET',
            url: '/card/'
        }).then(function(success){
        }, function(error){
            console.log(error)
        });
   }

    $scope.getCard = function(cardID){
            //Gets all the cards from the server
        //Usage: Check API.md for URL needed
        card_url = '/card/' + cardID
        $http({
            method: 'GET',
            url: card_url
        }).then(function(success){

        }, function(error){
            console.log(error)
        });
   }

    //Give card to server
    $scope.sendCard = function(){
        //make a cardID here?
        card_url = '/card/' + cardID
        $http({
            method: 'POST',
            url: card_url
        }).then(function(success){

        }, function(error){
            console.log(error)
        });
    };

}]);

//A service to send data from main controller to flashcard controller
    //so = if a card is clicked, show its server data, otherwise blank
app.service("isLegitCard", function($http){
    console.log("service call");
    var card = {};
    var deck = {};
    $http({
        method: 'GET',
        url: '/user'
    }).then(function (success) {
        console.log(success);
        if(success.data!="") {
            if(sessionStorage.adminAuth != String(success.data[0].admin)) {
                sessionStorage.adminAuth = success.data[0].admin;
                location.reload();
            }
        }
    }, function (error) {
        Logger.log(error)
    });
    return {
        getCard: function(){
            return sessionStorage.cardid;
        },
        sendCard: function(val){
            card = val;
            sessionStorage.cardid = val;
        },
        getDeck: function(){
            return sessionStorage.deckid;

        },
        sendDeck: function(val){
            deck = val;
            sessionStorage.deckid = val;
        }
    };
});



app.directive('loadCards', function ($http, $compile, isLegitCard) {
  return {
    restrict: 'AE',
    replace: true,
    link: function (scope, ele, attrs) {
        //Get Deck ID
        var deckID = isLegitCard.getDeck()
        if(deckID == 0){
            //Making a new deck, server won't respond
            return;
        }

        //Dynamically show all cards in this deck
        scope.$watch('onloadVar' , function(){
            $http({
            method: 'GET',
            url: '/deck/' + deckID
        }).then(function(success){

            var div = ""
            //Loop through the cards in the deck
            for(var i=0; i<success.data.length; i++){
                var html = '<div class="col-sm-4 col-lg-4 col-md-4">';
                html += '<div class="thumbnail">';

                var imageFound = false
                //loop through card sides to find valid image
                for(var j=0; j<success.data[i].media.length; ++j){

                    //find an image side on the card to view
                    if(success.data[i].media[j].url){
                        html += '<img src="' + success.data[i].media[j].url + '" alt="https://placehold.it/320x150">';
                        imageFound = true;
                        break; //break out of for loop, only 1 image needed
                    }
                }

                if(!imageFound){
                    //replace image with default
                    html += '<img src="https://placehold.it/320x150" alt="">';
                }


                html += '<div class="caption">';
                html += '<h4><a href="#!card" ng-click="toCard(&quot;' + success.data[i]._id.toString() + '&quot;)">' + success.data[i].title + '</a>';
                html += '</h4>';
                html += '<p>' + success.data[i].description + '</p>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                div += html;
            }
            html = div

            ele.html((typeof(html) === 'string') ? html : html.data);
            $compile(ele.contents())(scope);

            }, function(error){
                console.log(error)
            });
        });


      }
    }
  })

app.directive('loadDecks', function ($http, $compile) {

    return {
    restrict: 'AE',
    replace: true,
    link: function (scope, ele, attrs) {
                //Gets all the cards from the server
            //Usage: Check API.md for URL needed
        scope.$watch('onloadDeckVar' , function(){
            $http({
            method: 'GET',
            url: '/deck'
        }).then(function(success){

            var div = ""
            for(var i=0; i<success.data.length; i++){
                var html = '<div class="col-sm-4 col-lg-4 col-md-4">';
                html += '<div class="thumbnail">';

                //Use stored image in deck
                if(success.data[i].imageUrl && success.data[i].imageUrl!=""){
                    html += '<img src="' + success.data[i].imageUrl + '" alt="">'
                }
                else{
                    //replace image with default
                    html += '<img src="https://placehold.it/320x150" alt="">';
                }

                html += '<div class="caption">';
                html += '<h4><a href="#!viewCardsInDeck" ng-click="toCard(&quot;' + success.data[i]._id.toString() + '&quot;)">' + success.data[i].title + '</a>';
                html += '</h4>';
                html += '<p>' + success.data[i].desc + '</p>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                div += html;
            }
            html = div

            ele.html((typeof(html) === 'string') ? html : html.data);
            $compile(ele.contents())(scope);

            }, function(error){
                console.log(error)
            });
        });


      }
    }
});

//http://stackoverflow.com/questions/27549134/angularjs-ng-src-condition-if-not-found-via-url
app.directive('errSrc', function () {
  return {
        link: function(scope, element, attrs){
            element.bind('error', function(){
                if(attrs.src!=attrs.errSrc){
                    attrs.$set('src', attrs.errSrc)
                }
            })
        }
    }
});

