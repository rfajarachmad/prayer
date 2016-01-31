function PrayerUtil(prayer) {

	this.prayer = prayer;

	this.setPrayer = function(prayer) {
		this.prayer = prayer;
	}

	this.setToday = function(date) {
    	this.prayer.today = date;
    }

    this.setCurrentPosition = function(position) {
    	this.prayer.location.latitude = position.coords.latitude;
    	this.prayer.location.longitude = position.coords.longitude;
    }

    this.setRawOffset = function(rawOffset) {
    	this.prayer.location.rawoffset = rawOffset;
    }

    this.setTimezone = function(timezone) {
    	this.prayer.location.timezone = timezone;
    }

	this.calculate= function() {

	    prayTimes.setMethod(this.prayer.setting.method);
	    var adjustment = {asr: this.prayer.setting.asrmethod}
	    prayTimes.adjust(adjustment);

	    var praytime = prayTimes.getTimes(this.prayer.today, [this.prayer.location.latitude, this.prayer.location.longitude], this.prayer.location.timezone);
	    
	    this.prayer.praytime.imsak.time = praytime.imsak;
	    this.prayer.praytime.fajr.time = praytime.fajr;
	    this.prayer.praytime.dhuhr.time = praytime.dhuhr;
	    this.prayer.praytime.asr.time = praytime.asr;
	    this.prayer.praytime.maghrib.time = praytime.maghrib;
	    this.prayer.praytime.isha.time = praytime.isha;

	}

	this.hijridate = function(hijrimonths) {
		var hijriCal = new UQCal(this.prayer.today).convert();
    	var hijrimonth = hijriCal.Hmonth - 1;
    	var hijridate = hijriCal.Hday+" "+hijrimonths[hijrimonth]+" "+hijriCal.Hyear;

    	this.prayer.dateinfo.masehidate = dateutil.format(new Date(this.prayer.today), 'l d F Y');
    	this.prayer.dateinfo.hijridate = hijriCal.Hday+" "+hijrimonths[hijrimonth]+" "+hijriCal.Hyear;
	}


	this.calculateCurrentPray = function(praynames) {

	    var times = [
	      this.prayer.praytime.fajr.time,
	      this.prayer.praytime.dhuhr.time,
	      this.prayer.praytime.asr.time,
	      this.prayer.praytime.maghrib.time,
	      this.prayer.praytime.isha.time
	    ];
    	var today = new Date(this.prayer.today);
    	var tomorrow = new Date(this.prayer.tomorrow);
    	var yesterday = new Date(this.prayer.yesterday);
    	var currentTime = dateutil.format(today,'Y-m-d')+" "+('0'+today.getHours()).slice(-2)+":"+('0'+today.getMinutes()).slice(-2)+":00";
    	var curtime = Date.parse(currentTime);
    	var isSolved = false;
    	var dateFrom;
	    var dateTo;
	    var dateFromDate;
	    var dateToDate;


	    for (var i = 0; i < times.length-1; i++) {
	      
	      dateFromDate = dateutil.format(today,'Y-m-d')+" "+times[i]+':00';
	      dateToDate = dateutil.format(today,'Y-m-d')+" "+times[i+1]+':00';

	      dateFrom = Date.parse(dateFromDate);
	      dateTo = Date.parse(dateToDate);
	      

	      if (curtime > dateFrom && curtime < dateTo) {
	        this.prayer.prayinfo.currentpray = praynames[i];
	        this.prayer.prayinfo.currentpraytime = times[i];  
	        this.prayer.prayinfo.nextpray = praynames[i+1];
	        this.prayer.prayinfo.nextpraytime = times[i+1];  
	        this.prayer.prayinfo.nextpraydatetime = dateutil.format(today,'Y-m-d')+" "+times[i+1];    
	        isSolved = true;
	      }
	    }

	    if (!isSolved) {
	     

	      dateFromDate = dateutil.format(yesterday,'Y-m-d')+" "+times[times.length-1]+':00';
	      dateToDate = dateutil.format(today,'Y-m-d')+" "+times[0]+':00';
	      dateFrom = Date.parse(dateFromDate);
	      dateTo = Date.parse(dateToDate);
	     
	      if (curtime > dateFrom && curtime < dateTo) {
	        this.prayer.prayinfo.currentpray = praynames[i];
	        this.prayer.prayinfo.currentpraytime = times[i];     
	        this.prayer.prayinfo.nextpray = praynames[0];
	        this.prayer.prayinfo.nextpraytime = times[0];  
	        this.prayer.prayinfo.nextpraydatetime = dateutil.format(tomorrow,'Y-m-d')+" "+times[0];     
	        isSolved = true;
	      } else {

	        this.prayer.prayinfo.currentpray = praynames[i];
	        this.prayer.prayinfo.currentpraytime = times[i];     
	        this.prayer.prayinfo.nextpray = praynames[0];
	        this.prayer.prayinfo.nextpraytime = times[0];  
	        this.prayer.prayinfo.nextpraydatetime = dateutil.format(tomorrow,'Y-m-d')+" "+times[0];     
	        isSolved = true;


	      }
	    }
	  }
}