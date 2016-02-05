angular.module('starter.services', [])

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

  self.getGeoInformation = function(latitude, longitude, lang) {
    var q = $q.defer();
    $http.get(GOOGLE_API+'latlng='+latitude+','+longitude+'&language='+lang+'&sensor=true&key='+API_KEY).then(function(result){
      $log.debug("GeoLocation.getGeoInformation by latitude: and longitude:", result);
      q.resolve(result);
    }, function(err) {
      $log.error("GeoLocation.getGeoInformation by latitude: and longitude:", err);  
      q.reject(err);
    }); 
    return q.promise;
  }

  self.getGeoInformationByPlaceId = function(placeid, lang) {
    var q = $q.defer();
    $http.get(GOOGLE_API+'place_id='+placeid+'&language='+lang+'&sensor=true&key='+API_KEY).then(function(result){
      $log.debug("GeoLocation.getGeoInformation by placeid:", result);
      q.resolve(result);
    }, function(err) {
      $log.error("GeoLocation.getGeoInformation by placeid:", err);  
      q.reject(err);
    }); 
    return q.promise;
  }

  self.getLocationByName = function(address, lang) {
   var q = $q.defer();
    $http.get(GOOGLE_API+'address='+address+'&language='+lang).then(function(result){
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

.factory('Lookup', function($translate){

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

  var sounds = [
    {code:'Adzan', description:'Adzan'}
  ];

  var timeremainders = [
    {code: '5', description:'5 Minutes'},
    {code: '10', description:'10 Minutes'},
    {code: '15', description:'15 Minutes'},
    {code: '30', description:'30 Minutes'},
  ];

  var languages = [
    {code: 'ID', description:'Bahasa'},
    {code: 'EN', description:'English'},
  ];

  return {
    getMethods: function() {
      return methods;
    },

    getHijriMonths: function(lang) {
      return translations[lang].hijrimonths;
    },

    getPrayNames: function(lang) {
      return translations[lang].praynames;;
    },
    getAsrMethods: function() {
      return asrMethods;
    },
    getSounds: function() {
      return sounds;
    },
    getTimeRemainders: function() {
      return timeremainders;
    },
    getLanguages: function() {
      return languages;
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
})

.factory("PrayerTimeService", function($log, $cordovaLocalNotification, Lookup){

  var prayer;

  var getCurrentPrayTime = function(prayer) {

      $log.debug("Getting current prayer time");

      var times = [
        prayer.praytime.fajr.time,
        prayer.praytime.dhuhr.time,
        prayer.praytime.asr.time,
        prayer.praytime.maghrib.time,
        prayer.praytime.isha.time
      ];

      $log.debug("> Times", times);

      var praynames = Lookup.getPrayNames(prayer.setting.language);
      var today = new Date(prayer.today);
      var tomorrow = new Date(prayer.tomorrow);
      var yesterday = new Date(prayer.yesterday);
      var currentTime = dateutil.format(today,'Y-m-d')+" "+('0'+today.getHours()).slice(-2)+":"+('0'+today.getMinutes()).slice(-2)+":00";
      var curtime = Date.parse(currentTime);
      var isSolved = false;
      var dateFrom;
      var dateTo;
      var dateFromDate;
      var dateToDate;

      $log.debug("> praynames", praynames);
      $log.debug("> today", today);
      $log.debug("> tomorrow", tomorrow);
      $log.debug("> yesterday", yesterday);
      $log.debug("> curtime", curtime);      

      for (var i = 0; i < times.length-1; i++) {
        
        dateFromDate = dateutil.format(today,'Y-m-d')+" "+times[i]+':00';
        dateToDate = dateutil.format(today,'Y-m-d')+" "+times[i+1]+':00';

        dateFrom = Date.parse(dateFromDate);
        dateTo = Date.parse(dateToDate);
        

        if (curtime >= dateFrom && curtime <= dateTo) {
          prayer.prayinfo.currentpray = praynames[i];
          prayer.prayinfo.currentpraytime = times[i];  
          prayer.prayinfo.nextpray = praynames[i+1];
          prayer.prayinfo.nextpraytime = times[i+1];  
          prayer.prayinfo.nextpraydatetime = dateutil.format(today,'Y-m-d')+" "+times[i+1];    
          isSolved = true;
        }
      }

      if (!isSolved) {
       

        dateFromDate = dateutil.format(yesterday,'Y-m-d')+" "+times[times.length-1]+':00';
        dateToDate = dateutil.format(today,'Y-m-d')+" "+times[0]+':00';
        dateFrom = Date.parse(dateFromDate);
        dateTo = Date.parse(dateToDate);
       
        if (curtime >= dateFrom && curtime <= dateTo) {
          prayer.prayinfo.currentpray = praynames[i];
          prayer.prayinfo.currentpraytime = times[i];     
          prayer.prayinfo.nextpray = praynames[0];
          prayer.prayinfo.nextpraytime = times[0];  
          prayer.prayinfo.nextpraydatetime = dateutil.format(tomorrow,'Y-m-d')+" "+times[0];     
          isSolved = true;
        } else {

          prayer.prayinfo.currentpray = praynames[i];
          prayer.prayinfo.currentpraytime = times[i];     
          prayer.prayinfo.nextpray = praynames[0];
          prayer.prayinfo.nextpraytime = times[0];  
          prayer.prayinfo.nextpraydatetime = dateutil.format(tomorrow,'Y-m-d')+" "+times[0];     
          isSolved = true;


        }
      }

      $log.debug("Current prayTime result ",prayer.prayinfo);

    }

  var hijridate = function(prayer) {
      var hijrimonths = Lookup.getHijriMonths(prayer.setting.language);
      var hijriCal = new UQCal(prayer.today).convert();
      var hijrimonth = hijriCal.Hmonth - 1;
      var hijridate = hijriCal.Hday+" "+hijrimonths[hijrimonth]+" "+hijriCal.Hyear;

      $log.debug("Getting dateinfo");

      prayer.dateinfo.masehidate = dateutil.format(new Date(prayer.today), 'l d F Y', prayer.setting.language.toLowerCase());
      prayer.dateinfo.hijridate = hijriCal.Hday+" "+hijrimonths[hijrimonth]+" "+hijriCal.Hyear;
      
      $log.debug("Date info result", prayer.dateinfo);      
  }

  var sendNotification = function(prayer) {
    var praytime = prayer.praytime;
    var alarmTime;
    var title = "Prayer Time";
    var message;

    if (praytime.imsak.notification.onpray) {
      cancelNotification(praytime.imsak.id);
      alarmTime = new Date(dateutil.format(prayer.today,'Y-m-d')+" "+praytime.imsak.time);  
      if (Date.parse(alarmTime) > Date.parse(prayer.today)) {
        $log.debug("> setting notification for imsak at ", [alarmTime, prayer.today]);  
        message = "It is time to Imsak";
        addNotification(praytime.imsak.id, alarmTime, title, message);
      }
    }

    if (praytime.fajr.notification.onpray) {
      cancelNotification(praytime.fajr.id);
      alarmTime = new Date(dateutil.format(prayer.today,'Y-m-d')+" "+praytime.fajr.time);  
      if (Date.parse(alarmTime) > Date.parse(prayer.today) && !prayer.setting.disablenotification) {
        $log.debug("> setting notification for fajr at ", [alarmTime, prayer.today]);
        message = "It is time to pray Fajr";
        addNotification(praytime.fajr.id, alarmTime, title, message);
      }
    }

    if (praytime.dhuhr.notification.onpray) {
      cancelNotification(praytime.dhuhr.id);
      alarmTime = new Date(dateutil.format(prayer.today,'Y-m-d')+" "+praytime.dhuhr.time);  
      if (Date.parse(alarmTime) > Date.parse(prayer.today) && !prayer.setting.disablenotification) {
        $log.debug("> setting notification for dhuhr at ", [alarmTime, prayer.today]); 
        message = "It is time to pray Dhuhr";
        addNotification(praytime.dhuhr.id, alarmTime, title, message);
      }
    }

    if (praytime.asr.notification.onpray) {
      cancelNotification(praytime.asr.id);
      alarmTime = new Date(dateutil.format(prayer.today,'Y-m-d')+" "+praytime.asr.time);  
      if (Date.parse(alarmTime) > Date.parse(prayer.today) && !prayer.setting.disablenotification) {
        $log.debug("> setting notification for asr at ", [alarmTime, prayer.today]);  
        message = "It is time to pray Asr";
        addNotification(praytime.asr.id, alarmTime, title, message);
      }
    }

    if (praytime.maghrib.notification.onpray) {
      cancelNotification(praytime.maghrib.id);
      alarmTime = new Date(dateutil.format(prayer.today,'Y-m-d')+" "+praytime.maghrib.time);  
      if (Date.parse(alarmTime) > Date.parse(prayer.today) && !prayer.setting.disablenotification) {
        $log.debug("> setting notification for maghrib at ", [alarmTime, prayer.today]);  
        message = "It is time to pray Maghrib";
        addNotification(praytime.maghrib.id, alarmTime, title, message);
      }
    }

    if (praytime.isha.notification.onpray) {
      cancelNotification(praytime.isha.id);
      alarmTime = new Date(dateutil.format(prayer.today,'Y-m-d')+" "+praytime.isha.time);  
      if (Date.parse(alarmTime) > Date.parse(prayer.today) && !prayer.setting.disablenotification) {
        $log.debug("> setting notification for isha at ", [alarmTime, prayer.today]);  
        message = "It is time to pray Isha";
        addNotification(praytime.isha.id, alarmTime, title, message);
      }
    }

  }

  var cancelNotification = function(id) {
    try {
      $cordovaLocalNotification.cancel(id);  
    } catch (err) {
      $log.warn("Unable to cancel notification");
    }
    
  }

  var addNotification = function(id, alarmTime, title, message) {
    try {
      $cordovaLocalNotification.schedule({
            id: id,
            date: alarmTime,
            message: message,
            title: title,
            autoCancel: true,
            sound: "file://sound/azan1.mp3"
      }).then(function () {
          console.log("The notification has been set");
      });  
    } catch (err) {
      $log.warn("Unable to send notification");
    }
    
  }

  var calculate= function(prayer) {
      
      $log.debug("Start calculating pray time");

      $log.debug("> asrmethod ",prayer.setting.method);      
      prayTimes.setMethod(prayer.setting.method);
      
      var adjustment = {
          asr: prayer.setting.asrmethod
        }
      $log.debug("> adjustment", adjustment);
      prayTimes.adjust(adjustment);

      var tune = {
        fajr: parseInt(prayer.setting.adjustment.fajr),
        dhuhr: parseInt(prayer.setting.adjustment.dhuhr),
        asr: parseInt(prayer.setting.adjustment.asr),
        maghrib: parseInt(prayer.setting.adjustment.maghrib),
        isha: parseInt(prayer.setting.adjustment.isha)
      };
      $log.debug("> tune", tune);
      prayTimes.tune(tune);

      $log.debug("> date", prayer.today);
      $log.debug("> latitude", prayer.location.latitude);
      $log.debug("> longitude", prayer.location.longitude);
      $log.debug("> timezone", prayer.location.timezone);

      var praytime = prayTimes.getTimes(prayer.today, [prayer.location.latitude, prayer.location.longitude], prayer.location.timezone);
      
      prayer.praytime.imsak.time = praytime.imsak;
      prayer.praytime.fajr.time = praytime.fajr;
      prayer.praytime.dhuhr.time = praytime.dhuhr;
      prayer.praytime.asr.time = praytime.asr;
      prayer.praytime.maghrib.time = praytime.maghrib;
      prayer.praytime.isha.time = praytime.isha;

      $log.debug("PrayTime result ", prayer.praytime);

      getCurrentPrayTime(prayer);
      hijridate(prayer);
      sendNotification(prayer);

      return prayer;
  }



  return {
    calculate: function(prayer) {
      return calculate(prayer);
    }
  }

  return self;

});