angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('GeoLocation', function($cordovaGeolocation, $http, $q, $log) {
  var API_KEY = "AIzaSyAZVavLEgDEwXa-iOwRu_hmnco7X-YbNBI";
  var GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json?";
  var GOOGLE_TIMEZONE_API = "https://maps.googleapis.com/maps/api/timezone/json?"
  var self = this;

  self.getTimezone = function(latitude, longitude, timestamp) {
    var q = $q.defer();
    $http.get(GOOGLE_TIMEZONE_API+'location='+latitude+','+longitude+'&timestamp='+timestamp+'&key='+API_KEY).then(function(result){
      $log.debug("GeoLocation.getTimezone by latitude: and longitude:", result);
      q.resolve(result);
    }, function(err) {
      $log.error("GeoLocation.getTimezone by latitude: and longitude:", err);  
      q.reject(err);
    }); 
    return q.promise;
  }

  self.getCurrentPosition = function() {
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    var q = $q.defer();
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      $log.debug("GeoLocation.getCurrentPosition: ",position);
      q.resolve(position);
    }, function(err) {
      $log.error("GeoLocation.getCurrentPosition: ",err);
      q.reject(err);
    });
    return q.promise;
  }

  self.getGeoInformation = function(latitude, longitude) {
    var q = $q.defer();
    $http.get(GOOGLE_API+'latlng='+latitude+','+longitude+'&sensor=true&key='+API_KEY).then(function(result){
      $log.debug("GeoLocation.getGeoInformation by latitude: and longitude:", result);
      q.resolve(result);
    }, function(err) {
      $log.error("GeoLocation.getGeoInformation by latitude: and longitude:", err);  
      q.reject(err);
    }); 
    return q.promise;
  }

  self.getLocationByName = function(address) {
   var q = $q.defer();
    $http.get(GOOGLE_API+'address='+address).then(function(result){
      $log.debug("GeoLocation.getLocationByName:", result);
      q.resolve(result);
    }, function(err) {
      $log.error("GeoLocation.getLocationByName", err);  
      q.reject(err);
    }); 
    return q.promise; 
  }

  return self;
})

.factory('Lookup', function(){

  var methods = [
    {code:'MWL', description:'Muslim World League', default:true},
    {code:'ISNA', description:'Islamic Society of North America', default:false},
    {code:'Egypt', description:'Egyptian General Authority of Survey', default:false},
    {code:'Makkah', description:'Umm al-Qura University, Makkah', default:false},
    {code:'Karachi', description:'University of Islamic Sciences, Karachi', default:false},
    {code:'Tehran', description:'Institute of Geophysics, University of Tehran', default:false},
    {code:'Jafari', description:'Shia Ithna Ashari (Ja`fari)', default:false},
  ];

  var asrMethods = [
    {code:'Standard', description:'Shafii, Maliki, Jafari and Hanbali', default:true},
    {code:'Hanafi', description:'Hanafi', default:false},
  ];

  var hijrimonths = [
    'Muharam',
    'Safar',
    'Rabi Al-Awwal',
    'Rabi Al-Thani',
    'Jumada Al-Awwal',
    'Jumada Al-Thani',
    'Rajab',
    'Shaban',
    'Ramadhan',
    'Shawwal',
    'Dhul Qaidah',
    'Dhul Hijjah'
  ];
  
  var praynames = [
    'Fajr',
    'Dhuhr',
    'Asr',
    'Maghrib',
    'Isha'
  ];

  var sounds = [
    {code:'Adzan', description:'Adzan'}
  ];

  var timeremainders = [
    {code: '5', description:'5 Minutes'},
    {code: '10', description:'10 Minutes'},
    {code: '15', description:'15 Minutes'},
    {code: '30', description:'30 Minutes'},
  ];

  return {
    getMethods: function() {
      return methods;
    },

    getHijriMonths: function() {
      return hijrimonths;
    },

    getPrayNames: function() {
      return praynames;
    },
    getAsrMethods: function() {
      return asrMethods;
    },
    getSounds: function() {
      return sounds;
    },
    getTimeRemainders: function() {
      return timeremainders;
    }
  }

})

.factory('LocalStorage', function($window){
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
})

.factory('Configuration', function(LocalStorage){
  
  var defaultSetting = {
    method: "MWL",
    asrmethod: "Standard"
  }

  var defaultPosition = {
      latitude: 0,
      longitude: 0,
      district: '',
      city: '',
      address: '',
      country: ''
    };

  return {

    setPrayer: function(prayer) {
      LocalStorage.setObject('prayer', prayer);
    },

    getPrayer: function(prayer) {
      var prayer = LocalStorage.getObject('prayer');  
      if (prayer === undefined  || prayer.today === undefined) {
        var prayer = new Prayer();
        LocalStorage.setObject('prayer', prayer);  
      }
      var date = new Date();
      var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      var today = new Date(utc + (1000*prayer.location.rawoffset));
      var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      prayer.today = today;
      prayer.tomorrow = tomorrow;
      prayer.yesterday = yesterday;
      return prayer;
    },

    setSettings: function(settings) {
      LocalStorage.setObject('settings', settings);
    },

    getSettings: function() {
      var config;
      try {
        config = LocalStorage.getObject('settings');  
      } catch(err) {
        LocalStorage.setObject('settings', defaultSetting);
        config = defaultSetting;  
      }
      
      return  config;
    },

    setPosition: function(location) {
      LocalStorage.setObject("currentLocation", location);
    },

    getPosition: function() {
      var position;
      try {
        position = LocalStorage.getObject('currentLocation');  
      } catch(err) {
        LocalStorage.setObject('currentLocation', defaultPosition);
        position = defaultPosition;  
      }
      
      return  position;
    }
  }
});