function Prayer() {

	this.today = new Date();
	this.tomorrow = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
  	this.yesterday = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);
  	this.newposition = {};
  	this.query = "";
    this.location = {
      latitude: 0,
      longitude: 0,
      district: "",
      country: "",
      address: "",
      timezone: 0,
      localdate: undefined,
      rawoffset: 25200
    };
    this.dateinfo = {
      masehidate: undefined,
      hijridate: undefined,
      currenttimestring: ""
    };
    this.praytime = {
      imsak: {
        name:"", 
        time:"",
        notification: {
          beforepray:"",
          beforepraytime:"",
          beforepraysound:"",
          onpray:"",
          onpraysound:""
        }
      },
      fajr: {
        name:"", 
        time:"",
        notification: {
          beforepray:"",
          beforepraytime:"",
          beforepraysound:"",
          onpray:"",
          onpraysound:""
        }
      },
      dhuhr: {
        name:"", 
        time:"",
        notification: {
          beforepray:"",
          beforepraytime:"",
          beforepraysound:"",
          onpray:"",
          onpraysound:""
        }
      },
      asr: {
        name:"", 
        time:"",
        notification: {
          beforepray:"",
          beforepraytime:"",
          beforepraysound:"",
          onpray:"",
          onpraysound:""
        }
      },
      maghrib: {
        name:"", 
        time:"",
        notification: {
          beforepray:"",
          beforepraytime:"",
          beforepraysound:"",
          onpray:"",
          onpraysound:""
        }
      },
      isha: {
        name:"", 
        time:"",
        notification: {
          beforepray:"",
          beforepraytime:"",
          beforepraysound:"",
          onpray:"",
          onpraysound:""
        }
      }
    };
    this.prayinfo = {
      currentpray:"",
      currentpraytime:"",
      nextpray: "",
      nextpraytime: "",
      nextpraydatetime: ""
    };
    this.setting = {
    	mthod:"",
    	asrmethod:""
    }

}