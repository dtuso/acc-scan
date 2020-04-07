try {
  var chalk       = require('chalk');
  var fs          = require('fs');
  var _           = require('underscore')

} catch (e) {
  console.log(e.toString());
  console.log('\n\nPlease run `npm install`\n');
  process.exit(1);
}

var 
  carName = 'ferrari_488_gt3',
  trackNames = ['Barcelona','brands_hatch','Hungaroring','Kyalami','Laguna_Seca','misano','mount_panorama','nurburgring','Paul_Ricard','Silverstone','Spa','Suzuka','Zandvoort','Zolder'], 
  colNames = "'track','setup','tyre lf','tyre rf','tyre lr','tyre rr','cam lf','cam rf','cam lr','cam rr','toe fl','toe fr','toe lr','toe rr','cas lf','cas rf','steer','tc1','tc2','abs','ecu','mix','fuel','pad f','pad r','roll f','roll r','spring lf','spring rf','spring lr','spring rr','bsup lf','bsup rf','bsup lr','bsup rr','bsdn lf','bsdn rf','bsdn lr','bsdn rr','bsw lf','bsw rf','bsw lr','bsw rr','bias','bs lf','bs rf','bs lr','bs rr','bf lf','bf rf','bf lr','bf rr','rs lf','rs rf','rs lr','rs rr','rf lf','rf rf','rf lr','rf rr','rh lf','rh rf','rh lr','rh rr','wing','duc f','duc r','preload','fuelPerLap','20m'", 
  trackFolder= "..\\..\\Documents\\Assetto Corsa Competizione\\Setups\\" + carName,
  reportCsv = "chart_" + carName + ".csv";

consoleGreen(reportCsv);

fs.writeFileSync(reportCsv, colNames, {encoding:"UTF8"});

_.each(trackNames, function(trackName){
  consoleGreen("track " + trackName);
  var trackFolderName = trackFolder + "\\" + trackName;
  var setupNames = fs.readdirSync(trackFolderName);
  _.each(setupNames, function(setupName) {
  consoleGreen("--> setup " + setupName);
    var fileName = trackFolderName + "\\" + setupName;
    var setup = getJSON(fileName);
    var row = '\n';
    row = addColumn(row, trackName );
    row = addColumn(row, setupName );

    row = addColumns(row, setup.basicSetup.types.tyrePressure, 4);

    row = addColumns(row, setup.basicSetup.alignment.camber , 4);
    row = addColumns(row, setup.basicSetup.alignment.toe , 4);
    row = addColumn(row, setup.basicSetup.alignment.casterLF );
    row = addColumn(row, setup.basicSetup.alignment.casterRF );
    row = addColumn(row, setup.basicSetup.alignment.steerRatio );

    row = addColumn(row, setup.basicSetup.electronics.tC1 );
    row = addColumn(row, setup.basicSetup.electronics.tC2 );
    row = addColumn(row, setup.basicSetup.electronics.abs );
    row = addColumn(row, setup.basicSetup.electronics.eCUMap );
    row = addColumn(row, setup.basicSetup.electronics.fuelMix );

    row = addColumn(row, setup.basicSetup.strategy.fuel );
    row = addColumn(row, setup.basicSetup.strategy.frontBrakePadCompound );
    row = addColumn(row, setup.basicSetup.strategy.rearBrakePadCompound );

    row = addColumn(row, setup.advancedSetup.mechanicalBalance.aRBFront );
    row = addColumn(row, setup.advancedSetup.mechanicalBalance.aRBRear );
    row = addColumns(row, setup.advancedSetup.mechanicalBalance.wheelRate, 4 );
    row = addColumns(row, setup.advancedSetup.mechanicalBalance.bumpStopRateUp, 4 );
    row = addColumns(row, setup.advancedSetup.mechanicalBalance.bumpStopRateDn, 4 );
    row = addColumns(row, setup.advancedSetup.mechanicalBalance.bumpStopWindow, 4 );
    row = addColumn(row, setup.advancedSetup.mechanicalBalance.brakeBias );

    row = addColumns(row, setup.advancedSetup.dampers.bumpSlow, 4 );
    row = addColumns(row, setup.advancedSetup.dampers.bumpFast, 4 );
    row = addColumns(row, setup.advancedSetup.dampers.reboundSlow, 4 );
    row = addColumns(row, setup.advancedSetup.dampers.reboundFast, 4 );

    row = addColumns(row, setup.advancedSetup.aeroBalance.rideHeight, 4 );
    row = addColumn(row, setup.advancedSetup.aeroBalance.rearWing );
    row = addColumns(row, setup.advancedSetup.aeroBalance.brakeDuct,2 );
    row = addColumn(row, setup.advancedSetup.drivetrain.preload );

    row = addColumn(row, '' );
    row = addColumn(row, '' );

    fs.appendFileSync(reportCsv,row);
  });
});

return;

function addColumns(row, item, qty) {
  for(var i=0; i< qty; i++){
    row = addColumn(row, item[i]);
  }
  return row + "," + item;
}
function addColumn(row, item) {
  return row + "," + item;
}

function getJSON(fileName) {
  var fileContents = fs.readFileSync(fileName,{encoding:"UTF8"});
  if(!fileContents || fileContents.length ==0) fileContents = "{}";
  var stuff = JSON.parse(fileContents);
  return stuff;
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
function removeLinebreaks(str) {return str.replace( /[\r\n]+/gm, "");}
function consoleGreen(str) {console.log(chalk.green( getDateTime() + ": " + str));}
function consoleRed(str) {console.log(chalk.red( getDateTime() + ": " + str));}
function consoleYellow(str) {console.log(chalk.yellow( getDateTime() + ": " + str));}
function consoleWhite(str) {console.log(chalk.white( getDateTime() + ": " + str));}