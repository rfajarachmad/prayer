function Prayer() {

	this.today = new Date();
	this.tomorrow = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
  	this.yesterday = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);
  	this.newposition = {};
    this.locationsolved = true;
  	this.query = "";
    this.location = {
      placeid: "ChIJs7AiJOzxaS4RAk1AR_7QoDk",
      latitude: -6.2087634,
      longitude: 106.84559899999999,
      district: "South Jakarta",
      country: "Indonesia",
      address: "South Jakarta, Indonesia",
      timezone: 7,
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
        id: 1,
        name:"Imsak", 
        time:"",
        notification: {
          beforepray: false,
          beforepraytime:"10",
          beforepraysound:"Adzan",
          onpray: false,
          onpraysound:"Adzan"
        }
      },
      fajr: {
        id: 2,
        name:"Fajr", 
        time:"",
        notification: {
          beforepray: false,
          beforepraytime:"10",
          beforepraysound:"Adzan",
          onpray: false,
          onpraysound:"Adzan"
        }
      },
      dhuhr: {
        id: 2,
        name:"Dhuhr", 
        time:"",
        notification: {
          beforepray: false,
          beforepraytime:"10",
          beforepraysound:"Adzan",
          onpray: false,
          onpraysound:"Adzan"
        }
      },
      asr: {
        id: 3,
        name:"Asr", 
        time:"",
        notification: {
          beforepray: false,
          beforepraytime:"10",
          beforepraysound:"Adzan",
          onpray: false,
          onpraysound:"Adzan"
        }
      },
      maghrib: {
        id: 4,
        name:"Maghrib", 
        time:"",
        notification: {
          beforepray: false,
          beforepraytime:"10",
          beforepraysound:"Adzan",
          onpray: false,
          onpraysound:"Adzan"
        }
      },
      isha: {
        id: 5,
        name:"Isha", 
        time:"",
        notification: {
          beforepray: false,
          beforepraytime:"10",
          beforepraysound:"Adzan",
          onpray: false,
          onpraysound:"Adzan"
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
    	method:"MWL",
    	asrmethod:"Standard",
      language:"EN",
      disablenotification: false,
      adjustment: {
        fajr: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0
      }
    }

}