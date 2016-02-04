angular.module('starter.controllers', [])

.controller('PrayTimeCtrl', function(
  $ionicLoading, 
  $rootScope, 
  $log, 
  $scope, 
  $interval, 
  $ionicModal, 
  $ionicPopup,
  $translate,
  GeoLocation, 
  Configuration, 
  Lookup,
  PrayerTimeService) {
  
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
    $log.debug("Set new location");
    prayer = Configuration.getPrayer();
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
          
          $log.debug("new location", prayer.location);

          savePrayer(prayer);

          
          return false;
        }
        return true;
      })
  }

  //Get geo information

  showItIsTimeToPray = function() {
    prayer = Configuration.getPrayer();
    PrayerTimeService.calculate(prayer)
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
    var currentDate = new Date ();
    var utc = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000);
    var currentTime = new Date(utc + (1000 * prayer.location.rawoffset));

    $log.debug("clock updated ",currentTime);

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
    prayer.dateinfo.currenttimestring = currentTimeString;
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
    $scope.prayer = prayer;
    savePrayer(prayer);

    $rootScope.$broadcast("calculatePrayerTime");      
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

      prayer = Configuration.getPrayer();

      prayer.location.latitude = position.coords.latitude;
      prayer.location.longitude = position.coords.longitude;

      savePrayer(prayer);

      $rootScope.$broadcast("currentPositionChanged");     
      
      $scope.positions = [];
      $scope.prayer.query = "";  
    }
    
    $scope.modal.hide();
  }

  $scope.findLocationByName = function (){
    if (prayer.query.length >= 3) {
      $log.debug("Getting location by name", prayer.query);
      GeoLocation.getLocationByName(prayer.query, prayer.setting.language.toLowerCase()).then(function(result){
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


      GeoLocation.getGeoInformation(position.coords.latitude, position.coords.longitude, prayer.setting.language).then(function(result){
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
      $log.error(error);
      $ionicLoading.hide();
      showAlert("Connection Problem","Unable to fetch current location")
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

  showAlert = function(title, message) {
     var alertPopup = $ionicPopup.alert({
       title: title,
       template: message
     });
  }

  getLocationName = function(latitude, longitude, lang) {
    
      GeoLocation.getGeoInformation(latitude, longitude, lang).then(function(result){
        setLocalityPosition(result.data.results);
        $rootScope.$broadcast("calculatePrayerTime");
      }, function(err){
        $log.error(err.message);
        $rootScope.$broadcast("calculatePrayerTime");
      })
  }

  getTimezone = function(latitude, longitude, date) {
    date = new Date(date);
    GeoLocation.getTimezone(latitude, longitude, Math.floor(date.getTime() / 1000)).then(function(tz){
        $log.debug("Getting timezone", tz.data);

        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        
        prayer = Configuration.getPrayer();
        prayer.today = new Date(utc + (1000*tz.data.rawOffset));
        prayer.location.rawoffset = tz.data.rawOffset;
        prayer.location.timezone = tz.data.rawOffset/60/60;
        
        savePrayer(prayer);

        $rootScope.$broadcast("calculatePrayerTime");        

      }, function(err){
        $log.error(err.message);
        $rootScope.$broadcast("calculatePrayerTime");
      })
  }

  getCurrentPosition = function() {
    navigator.geolocation.getCurrentPosition(function (position) {

      prayer = Configuration.getPrayer();

      prayer.location.latitude = position.coords.latitude;
      prayer.location.longitude = position.coords.longitude;
      
      savePrayer(prayer);

      $rootScope.$broadcast("currentPositionChanged");      
    }, function (err) {
      $log.error(err.message);
      $rootScope.$broadcast("calculatePrayerTime");
      showAlert("Connection Problem","Please connect to Internet for more accurate result");
    });
  }

  savePrayer = function(prayer) {
    $log.debug("save prayer", prayer);
    Configuration.setPrayer(prayer);
  }
 
  $scope.$on('calculatePrayerTime', function(){
    $log.debug("Timezone has changed");
    prayer = Configuration.getPrayer();
    prayer = PrayerTimeService.calculate(prayer);
    
    updateClock();

    savePrayer(prayer);
    
    stop = $interval(getTimeRemaining, 1000);
    $interval(updateClock, 30000);
    
    prayer.locationsolved = true;
    $scope.prayer = prayer;
  });

  $scope.$on('currentPositionChanged', function(){
    $log.debug("Current position has changed");
    getTimezone(prayer.location.latitude, prayer.location.longitude, new Date());
    getLocationName(prayer.location.latitude, prayer.location.longitude, prayer.setting.lang);  
  });

 


  //MAIN
  var prayer = Configuration.getPrayer();
  var newposition = {};
  var query = "";
  $log.debug("initializing prayer", prayer);

  prayer.locationsolved = false;

  $translate.use(prayer.setting.language);
  $log.debug("language", $translate.use(prayer.setting.language));  
  updateClock();
  getCurrentPosition();
  
  
  var stop = undefined;

  $scope.prayer = prayer;
  $scope.query = query;

})

.controller('SettingsCtrl', function($scope, $rootScope, $log, $translate, Configuration, Lookup) {
  
  var prayer = Configuration.getPrayer();

  $scope.changedValue = function() {
    prayer = Configuration.getPrayer();
    prayer.setting = $scope.settings;
    $log.debug("Saving prayer", prayer);
    Configuration.setPrayer(prayer);
    $rootScope.$broadcast('calculatePrayerTime');
  }

  $scope.changedLanguage = function() {
    prayer = Configuration.getPrayer();
    prayer.setting = $scope.settings;

    $translate.use(prayer.setting.language);

    $log.debug("Saving prayer", prayer);
    Configuration.setPrayer(prayer);
    $rootScope.$broadcast('languageChanged'); 
    $rootScope.$broadcast('calculatePrayerTime');
  }

  $scope.settings = prayer.setting;
  $scope.methods = Lookup.getMethods();
  $scope.asrmethods = Lookup.getAsrMethods();
  $scope.languages = Lookup.getLanguages();
});
