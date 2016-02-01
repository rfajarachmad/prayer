angular.module('starter.controllers', [])

.controller('PrayTimeCtrl', function($ionicLoading, $rootScope, $log, $scope, $interval, $ionicModal, GeoLocation, Configuration, Lookup) {
  
  //var geocoder = new google.maps.Geocoder();
  

  getLocalyityPosition = function(results) {
    var positions = [];
    results.forEach(function(result){
      if (result.types.indexOf('locality') != -1) {
        positions.push(result);
      }
    });
    return positions;
  }

  setLocalityPosition = function(data) {
    data.every(function(value, index, _data){ 
        if (value.types.indexOf('locality') != -1) { 
          value.address_components.forEach(function(ac){
            if (ac.types.indexOf('locality') != -1) {
              prayer.location.district = ac.long_name;       
            }
            if (ac.types.indexOf('country') != -1) {
              prayer.location.country = ac.long_name;       
            }
          })
          prayer.location.latitude = value.geometry.location.lat;
          prayer.location.longitude = value.geometry.location.lng;
          prayer.location.address = prayer.location.district+', '+prayer.location.country;
          return false;
        }
        return true;
      })
  }

  //Get geo information

  showItIsTimeToPray = function() {

  }

  getTimeRemaining = function() {
    var deadline = prayer.prayinfo.nextpraydatetime;
    var date = new Date();
    var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    var today = new Date(utc + (1000*prayer.location.rawoffset));

    var t = Date.parse(deadline) - Date.parse(today);
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    var hours = Math.floor( (t/(1000*60*60)) % 24 );
    var days = Math.floor( t/(1000*60*60*24) );
    if (hours === 0 && minutes === 0 && seconds === 0) {
      $interval.cancel(stop);
      showItIsTimeToPray();
    }
    $scope.hrsmin = ('0'+hours).slice(-2) + ":" + ('0'+minutes).slice(-2);
    $scope.sec = ('0'+seconds).slice(-2);
  }

  updateClock = function() {
    var currentTime = new Date (prayer.today);

    var currentHours = currentTime.getHours ( );
    var currentMinutes = currentTime.getMinutes ( );
    var currentSeconds = currentTime.getSeconds ( );

    // Pad the minutes and seconds with leading zeros, if required
    currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
    currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

    // Choose either "AM" or "PM" as appropriate
    var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

    // Convert the hours component to 12-hour format if needed
    currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

    // Convert an hours component of "0" to "12"
    currentHours = ( currentHours == 0 ) ? 12 : currentHours;

    // Compose the string for display
    var currentTimeString = currentHours + ":" + currentMinutes + " " + timeOfDay;
    $scope.prayer.dateinfo.currenttimestring = currentTimeString;
  }

  //main
  //Get current date
  

  $ionicModal.fromTemplateUrl('templates/modal-set-location.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/modal-set-notification.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalnotification = modal;
  });

  
  $scope.openModalNotification = function(prayname) {
    $scope.prayname = prayname;
    $scope.sounds = Lookup.getSounds();
    $scope.timeReminders = Lookup.getTimeRemainders();
    prayer = Configuration.getPrayer();
    switch (prayname) {
      case 'Imsak':
        $scope.notification = prayer.praytime.imsak.notification;
        $log.debug("Opening modal for imsak", prayer.praytime.imsak.notification);
        break;
      case 'Fajr':
        $scope.notification = prayer.praytime.fajr.notification;
        $log.debug("Opening modal for fajr", prayer.praytime.fajr.notification);
        break;
      case 'Dhuhr':
        $scope.notification = prayer.praytime.dhuhr.notification;
        $log.debug("Opening modal for dhuhr", prayer.praytime.dhuhr.notification);
        break;
      case 'Asr':
        $scope.notification = prayer.praytime.asr.notification;
        $log.debug("Opening modal for asr", prayer.praytime.asr.notification);
        break;
      case 'Maghrib':
        $scope.notification = prayer.praytime.maghrib.notification;
        $log.debug("Opening modal for maghrib", prayer.praytime.maghrib.notification);
        break;
      case 'Isha':
        $scope.notification = prayer.praytime.isha.notification;
        $log.debug("Opening modal for isha", prayer.praytime.isha.notification);
        break;
    }

    $scope.modalnotification.show();
  };


  $scope.notificationChanged = function(prayname) {
    $log.debug("notificationChanged-prayname", prayname);
    $log.debug("notificationChanged", $scope.notification);
    prayer = Configuration.getPrayer();

    switch (prayname) {
      case 'Imsak':    
        prayer.praytime.imsak.notification = $scope.notification;    
        break;
      case 'Fajr':    
        prayer.praytime.fajr.notification = $scope.notification;
        break;
      case 'Dhuhr':    
        prayer.praytime.dhuhr.notification = $scope.notification;
        break;
      case 'Asr':    
        prayer.praytime.asr.notification = $scope.notification;
        break;
      case 'Maghrib':    
        prayer.praytime.maghrib.notification = $scope.notification;
        break;
      case 'Isha':    
        prayer.praytime.isha.notification = $scope.notification;
        break;
    }

    Configuration.setPrayer(prayer); 
    $log.debug("Saving prayer", prayer);
  }

  $scope.closeModalNotification = function() {
    $scope.modalnotification.hide();
  };  

  $scope.openModalLocation = function() {
    $scope.positions = [];
    $scope.prayer.query = "";  
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.positions = [];
    $scope.modal.hide();
  };

  $scope.applyNewPosition = function() {
    if ($scope.prayer.newposition != undefined) {
      /*$scope.model.position = getLocalityPosition([$scope.model.newposition]);*/
      $log.debug("Applying new position ",$scope.prayer.newposition);
      
      var position = {
        coords: {
          latitude: $scope.prayer.newposition.geometry.location.lat,
          longitude: $scope.prayer.newposition.geometry.location.lng
        }
      }

      prayerUtil.setCurrentPosition(position);
      $rootScope.$broadcast("currentPositionChanged");     
      
      $scope.positions = [];
      $scope.prayer.query = "";  
    }
    
    $scope.modal.hide();
  }

  $scope.findLocationByName = function (){
    if (prayer.query.length >= 3) {
      
      GeoLocation.getLocationByName(prayer.query).then(function(result){
        $scope.positions = getLocalyityPosition(result.data.results);                                               
      })

    }
    
  }

  $scope.findCurrentLocation = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });

    var positions = [];

    navigator.geolocation.getCurrentPosition(function (position) {


      GeoLocation.getGeoInformation(position.coords.latitude, position.coords.longitude).then(function(result){
        result.data.results.forEach(function(value){ 
          if (value.types.indexOf('locality') != -1) { 
            positions.push(value);
          }
        });

      }, function(err){
        $log.error(err.message);
        $ionicLoading.hide();
      })

      $scope.positions = positions;
      $ionicLoading.hide();
    }, function (error) {
      $ionicLoading.hide();
    });
  }

  $scope.changePraySchedule = function(index) {
    if (index == 0) {
      setPrayTime(today, false);
    } else {
      setPrayTime(tomorrow, false);
    }
  }

  //var prayer = Prayer.getInstance();

  getLocationName = function(latitude, longitude) {
    
      GeoLocation.getGeoInformation(latitude, longitude).then(function(result){
        setLocalityPosition(result.data.results);
      }, function(err){
        $log.error(err.message);
        $rootScope.$broadcast("useDefaultLocation");
      })
  }

  getTimezone = function(latitude, longitude, date) {
    date = new Date(date);
    GeoLocation.getTimezone(latitude, longitude, Math.floor(date.getTime() / 1000)).then(function(tz){
        $log.debug("Getting timezone", tz.data);

        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        
        prayerUtil.setToday(new Date(utc + (1000*tz.data.rawOffset)));
        prayerUtil.setRawOffset(tz.data.rawOffset);
        prayerUtil.setTimezone(tz.data.rawOffset/60/60);
        
        $rootScope.$broadcast("timezoneChanged");        

      }, function(err){
        $log.error(err.message);
        $rootScope.$broadcast("useDefaultLocation");
      })
  }

  getCurrentPosition = function() {
    navigator.geolocation.getCurrentPosition(function (position) {  
      prayerUtil.setCurrentPosition(position);
      $rootScope.$broadcast("currentPositionChanged");      
    }, function (err) {
      $log.error(err.message);
      $rootScope.$broadcast("useDefaultLocation");
    });
  }

  $scope.$on('configurationChanged', function(){
    $log.debug("Configuration has changed");
    prayer = Configuration.getPrayer();
    prayerUtil.setPrayer(prayer);
    prayerUtil.calculate();
    prayerUtil.calculateCurrentPray(Lookup.getPrayNames());
  });

  $scope.$on('timezoneChanged', function(){
    $log.debug("Timezone has changed");
    prayerUtil.calculate();
    prayerUtil.calculateCurrentPray(Lookup.getPrayNames());
    prayerUtil.hijridate(Lookup.getHijriMonths());
    $log.debug("save prayer", prayer);
    stop = $interval(getTimeRemaining, 1000);
    $interval(updateClock(), 60000);
    prayerUtil.setPrayer(prayer);
    Configuration.setPrayer(prayer);
    $ionicLoading.hide();
  });

  $scope.$on('currentPositionChanged', function(){
    $log.debug("Current position has changed");
    getTimezone(prayer.location.latitude, prayer.location.longitude, new Date());
    getLocationName(prayer.location.latitude, prayer.location.longitude);  
  });

  $scope.$on('useDefaultLocation', function(){
    $log.debug("Use default location");
    prayerUtil.calculate();
    prayerUtil.calculateCurrentPray(Lookup.getPrayNames());
    prayerUtil.hijridate(Lookup.getHijriMonths());
    $interval(updateClock(), 60000);
    stop = $interval(getTimeRemaining, 1000);
    $ionicLoading.hide();
  });


  //MAIN
  $ionicLoading.show({
      template: 'Loading...'
  });
  var prayer = Configuration.getPrayer();
  var prayerUtil = new PrayerUtil(prayer);
  var newposition = {};
  var query = "";

  getCurrentPosition();
  
  
  var stop = undefined;

  $scope.prayer = prayer;
  $scope.query = query;

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

$scope.chats = Chats.all();
$scope.remove = function(chat) {
  Chats.remove(chat);
};
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('SettingsCtrl', function($scope, $rootScope, $log, Configuration, Lookup) {
  
  var prayer = Configuration.getPrayer();

  $scope.changedValue = function() {
    prayer = Configuration.getPrayer();
    prayer.setting = $scope.settings;
    $log.debug("Saving prayer", prayer);
    Configuration.setPrayer(prayer);
    $rootScope.$broadcast('configurationChanged');
  }

  $scope.settings = {
    method:  Configuration.getSettings().method,
    asrmethod: Configuration.getSettings().asrmethod
  };

  $scope.methods = Lookup.getMethods();
  $scope.asrmethods = Lookup.getAsrMethods();

});
