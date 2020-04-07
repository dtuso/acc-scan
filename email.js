try {
  var chalk       = require('chalk');
  var fs          = require('fs');


} catch (e) {
  console.log(e.toString());
  console.log('\n\nPlease run `npm install`\n');
  process.exit(1);
}

var emailAddresses = {
    from: "admin@dominicminicoopers.com",
    sms: "6232715020@vzwpix.com",
    monitor: "dominicminicoopers@yahoo.com"
  },
  password = "",
  url = "https://www.seatjunky.com/phx/includes/eventjson.php?d=",
  fillUrl = '',
  fileNames = {
    logging: "data/logging.txt", 
    events: "data/events.json" },
  timerMinutes = 5,
  timerMs = timerMinutes * 60 * 1000,
  aliveCntr = 0,
  errorCntr = 0;

prompt.start();
prompt.get({properties: {
    password: {
      hidden: true,
      required: true,
      description: "Provide password for " + emailAddresses.from
    }
  }}, function(err, result){
    if(err) {
      consoleRed("Password read error: " + err);
      process.exit(1);
    } 
    consoleGreen("Password set. Starting monitor of url");

    password = result.password;

    execWatcher();
  });

function getPreviousEvents() {
  consoleWhite("Reading file: " + fileNames.events);
  var fileContents = fs.readFileSync(fileNames.events,{encoding:"UTF8"});
  if(!fileContents || fileContents.length ==0) fileContents = "{}";
  var events = JSON.parse(fileContents);
  consoleGreen("Loaded events from file.")
  return events;
}

function saveCurrentEvents(eventsObj) {
  consoleWhite("Saving file: " + fileNames.events);
  fs.writeFileSync(fileNames.events, JSON.stringify(eventsObj), {encoding:"UTF8"});
  consoleGreen("Saved events to file.")
}

function setWatcherTimeout() {
  var msRnd = timerMs * getRandom(0.75, 1.25);
  consoleWhite("Setting timeout for " + msRnd + "ms");
  setTimeout(execWatcher, msRnd);
}

function processRequestResponse(body) {

  try {

      if (body == null || body.length < 2) {
          var errMsgSubject = 'Fill body empty or null';
          consoleRed("body error for " + fillUrl + " : " + (body == null ? "" : body));
          sendSmsIfErrorsContinue(errMsgSubject);
          
          setWatcherTimeout();
          return;
      }
      errorCntr = 0;
      consoleGreen('Downloaded events successful.');

      var currentEvents = parseEventDescArr(body);

      var previousEvents = getPreviousEvents(),
      newEvents = findNewEvents(previousEvents, currentEvents);
      var numNewEvents = newEvents.length;
      logEventsRead(currentEvents);
      var shorten = function(str,max){
      var len = Math.min(str.length,max);
      return str.substring(0,len);
    }
      if(numNewEvents > 0 ) {
		var eventsStr = shorten(newEvents[0],25);
		var subject = shorten(newEvents[0],10);
		for(var i=1; i < (numNewEvents-1); i++){
	      eventsStr += "\r\n" + shorten(newEvents[i],25);
	      subject += ", " + shorten(newEvents[i],10);
		}
        consoleYellow("Found new events: " + eventsStr);
        sendEmail(eventsStr, emailAddresses.sms, emailAddresses.monitor, subject);          
      } else {
          consoleYellow("No new events found... :-( ");
      }
      saveCurrentEvents(currentEvents); // save the current events so they become previous events next time around
      
      setWatcherTimeout();
  } catch(e) { 
      var errMsgSubject = 'Fill event processRequestResponse error';
      consoleRed("processRequestResponse error: " + e.toString());
      sendEmail("Error: " + e.toString(), emailAddresses.monitor, null, errMsgSubject);
      sendSmsIfErrorsContinue(errMsgSubject);			
      setWatcherTimeout();
  }
}


function getDateTime() {
	var fixZeros = function(str) {
		str = str + '';
		if (str == '0') return '00';
		return str;
	}
	var currentdate = new Date(),
	  datetime = fixZeros(currentdate.getDate()) + "/"
		+ fixZeros(currentdate.getMonth()+1)  + "/" 
		+ fixZeros(currentdate.getFullYear()) + " "  
		+ fixZeros(currentdate.getHours()) + ":"  
		+ fixZeros(currentdate.getMinutes()) + ":" 
		+ fixZeros(currentdate.getSeconds());
	return datetime;				
}

function logEventsRead(eventsStr) {
  var newText = "\n" + getDateTime() + ": " + eventsStr;
  fs.appendFileSync(fileNames.logging, newText);
  consoleGreen("Logged events: " + eventsStr);
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandom(min, max) {return Math.random() * (max - min) + min;}

function getDateFormatted() {var today = new Date();return today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();}
function removeLinebreaks(str) {return str.replace( /[\r\n]+/gm, "");}

function consoleGreen(str) {console.log(chalk.green( getDateTime() + ": " + str));}
function consoleRed(str) {console.log(chalk.red( getDateTime() + ": " + str));}
function consoleYellow(str) {console.log(chalk.yellow( getDateTime() + ": " + str));}
function consoleWhite(str) {console.log(chalk.white( getDateTime() + ": " + str));}