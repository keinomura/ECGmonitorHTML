
//open subWindow, keep subWindow Element as sub_win
var sub_win;

//set initial spO2 value, after HTML loaded
var iniSpO2= 95;var iniHR = 95
window.onload = function() {
  document.getElementById('spO2').innerText = iniSpO2;
  openSubWin();
};

//open subWindow function
function openSubWin(){
  sub_win = window.open('dispWin.html', 'disp window', 'width=1280,height=1024,scrollbars=1,resizable=1');
  return false;
  sub_win = null;
};

///////////////////////
// BP mesure button
///////////////////////
function mesureBP(){
  //if (monitorOn){
  if (onoffBool){
    var main_SBP=document.getElementById('sBP').value;
    var main_DBP=document.getElementById('dBP').value;
    var displayBP=main_SBP + ' / ' + main_DBP;

  ///////BP display Blink///////
    var count = 0;
    var timerID= setInterval(function(){
        setTimeout(function(){

        displayVal('bPsmall', '--- / ---');
        }, 500);

        setTimeout(function(){
        displayVal('bPsmall', '');

        }, 999);
      count ++;
      if(count > 2){
        clearInterval(timerID);
        count = null;
      }
    }, 1000); //call timerID() each 1sec

  //finally show BP
    setTimeout(function(){
      displayVal('bPsmall', main_SBP +' / '+ main_DBP);
      main_DBP = null;
      main_SBP = null;
      displayBP = null;
      timerID = null;
    },4500);
  }

}//func


///////////////////////
// slider & Box
///////////////////////

function changeSliderBox(aDom){
  //get spO2 value of ,main_Window
  var itemName = aDom.id.split("Slider", 1);
  var mainItem = itemName[0];
  var subItem = mainItem + '2';
  var smallMonitorItem = mainItem + 'small';
  var theOther;

  if (mainItem == 'bP'){
    var aSBPVal = aDom.value;
    document.getElementById('sBP').value = aSBPVal;
    var aDBPVal = parseInt((40/60) * aSBPVal) -13 ;
    document.getElementById('dBP').value = aDBPVal;
    aSBPVal =null;
    aDBPVal = null;
  } else { // HR or SpO2
    if (aDom.type == "range"){  //slider
      theOther = document.getElementById(mainItem + "SliderSide");
    } else { // Box
      theOther = document.getElementById(mainItem + "Slider");
    }

    var aVal = aDom.value;
    theOther.value = aVal;
    
    document.getElementById(mainItem).innerText = aVal;
    if (onoffBool){

    displayVal(smallMonitorItem, aVal);
    }
  }
  itemName =null;
  mainItem = null;
  smallMonitorItem = null;
  theOther = null;
  aVal = null;
}


///////////////////////////////////////////////////////////////////////////////////////////
// START button
// 1. start hr sound
// 2. show BP and HR values
///////////////////////////////////////////////////////////////////////////////////////////

// sound play function
//var ringfunc;

//monitor on-off bool
var timeoutid = null; //need to global var to clearTimeout
var timeoutid2 = null;
var onoffBool = false;

function ring(){  //start drawing, ringing, 
// clearTimeout
  clearTimeout(timeoutid);
  clearTimeout(timeoutid2);

// start ecg drawing
  window.requestAnimationFrame(draw);
  window.requestAnimationFrame(spO2draw);
  window.requestAnimationFrame(respdraw);

 var checkedValue = null; 

  checkedValue = document.getElementById('onSW').checked;
  console.log ('onSW is',checkedValue);

  onoffBool = (checkedValue);
  checkedValue = null;

  if (!onoffBool){
    displayVal('bPsmall', '--- / ---');
    var aAry = ['hRsmall', 'spO2small', 'bPsmall', 'rRsmall'];
    for (i=0; i<aAry.length; i++){
    displayVal(aAry[i], '--'); }
  }


////////////////////////////////////////////////
//create hR rhythms and sound play//////////////
////////////////////////////////////////////////
  var hRArray=[]; //get hR average
  var ringfunc = function(){
    fire(); //ecg p-qrs-t wave start!

  //sound play
    var dinum = document.getElementById('spO2').innerText;
    //not to delay, read wav files directry
    var dinumplus = "wav/" + dinum + ".wav";
    var sound = new Audio(dinumplus);
    sound.volume = document.getElementById('volControl').value;
    sound.play();
    dinum = null;
    dinumplus = null;
    sound = null;
    //document.getElementById(dinum).play();  //this handler makes some delay


  //create next hR rhythm time
    var ahRtext = document.getElementById('hR').innerText;
    if (!sinusECGRhythmBool){
      var ahR = ahRtext * 1 - 10 + Math.random() * 20;  
    } else if (sinusECGRhythmBool){
      var ahR = ahRtext * 1;
    }
   ahRtext = null;
   
  // display average hR
    hRArray.push(ahR);

    if (hRArray.length == 3){
      var aveHR = (hRArray[0] + hRArray[1] + hRArray[2])/3;
      displayVal('hRsmall', parseInt(aveHR));
      aveHR = null;
      var tempspO2 = document.getElementById('spO2').innerText;
      displayVal('spO2small', tempspO2);
      hRArray.length = 0;
      tempspO2 = null;
    }

    var hRtime = (60000 / ahR); // time to next fire()
    ahR = null;
    timeoutid = setTimeout(ringfunc, hRtime);
    hRtime = null;
  }
////////////////////////////////////////////////
////////////////////////////////////////////////


////////////////////////////////////////////////
//create resp rhythms //////////////////////////
////////////////////////////////////////////////
  var rRArray=[]; 
  var respfunc = function(){
    respfire(); //resp wave start!
  
  //create resp rhythm
    var aRRVal = document.getElementById('rRSlider').value;
    if (normalRRRhythmBool){
      var aRR = aRRVal * 1;
      respataxicfire();
    } else {
      var aRR = aRRVal * 1 - 2 + Math.random() * 4;
    }
    aRRVal = null;
  // display average hR    
    rRArray.push(aRR);
    if (rRArray.length == 2){
      var aveRR = (rRArray[0] + rRArray[1])/2;
      displayVal('rRsmall', parseInt(aveRR));
    // reset array
      rRArray.length = 0;
    }
    var rRtime = (60000 / aRR)*1; // time to next fire() 
    aRR = null;
    timeoutid2 = setTimeout(respfunc,rRtime);
    rRtime = null;
  }
////////////////////////////////////////////////
////////////////////////////////////////////////


  if (onoffBool){
    ringfunc(); //run only 'start'
    respfunc();
  }
}
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////
// ECG animation JS
///////////////////////////////////////////////////////////////////////////////////////////

  var xVal = 0, yVal;
  var xIntervalperSec;
  var baseLineVal = 85;
  var fireBool = false;
  var firexVal = 0;
  var pwCount, qRSCount, tCount;
  var dataBefore = 120;
  var fireTiming = true;
  var sinusECGRhythmBool = true;
  var randomCoefficient;
  var pWStT, qRSStT, tWStT, hRCheck;
  var i=0;

  function draw(){
  //set canvas drawing
    var aCanvas = document.getElementById('hRCanvas');
    var ctx = aCanvas.getContext('2d'); //draw on canvas
    var ctx_sub = sub_win.document.getElementById('hRCanvas2').getContext('2d'); // draw sub_win
  
  //set point x
    xIntervalperSec = 1;// x point move val interval as 1 frame 
    var xValm = xVal%(aCanvas.width);// xVal as loop in canvas width

  //set point y baseLine
    var yValBase, nofireLine;
    if (sinusECGRhythmBool){ //sinus rhythm
      randomCoefficient = 0.8;
      yValBase = baseLineVal+ Math.random() * randomCoefficient;// baseLine with fractuate voltage
      nofireLine = yValBase;
    } else { //Af
      randomCoefficient = 8;
      fireTiming = !(fireTiming);  // too fine randam wave when each 1 frame draw, so set 2 frame
      yValBase = baseLineVal+ Math.random() * randomCoefficient;
      if (fireTiming == true){
        nofireLine = yValBase
        // baseLine with fractuate voltage
      } else {
        nofireLine = dataBefore;
      }
    }
////////////////////////////////////////////////////////////////////////////
  // when fire on pqrs wave start
    if (fireBool == true) {
  // set each wave parameters    
      [pWStT, qRSStT, tWStT, pqDur, tDur, hRCheck] = 
        (!sinusECGRhythmBool)? [0,7,14,4,8, 'af']
      :(hRSlider.value <= 80)? [2,12,20,4,16, '-80']
      :(hRSlider.value <= 100)? [1,9,17,4,13, '-100']
      : [0,7,14,4,8, '120'];

      // firexVal is a wave timing, reset when fire() wave start;
      if (firexVal <= (tWStT + tDur)){  //p wave
        if (sinusECGRhythmBool) {
          var pwaveVal = createPQRSTwave(pWStT, pqDur, 3, 1, 0, 'p');
        } else {
          var pwaveVal = 0;
        }
      //qrs, t waves
        var qrswaveVal = createPQRSTwave(qRSStT, pqDur, 15, 3/2, 5,'q');
        var twaveVal = createPQRSTwave(tWStT, tDur, 10, 1, 0,'t');
      //all waves
        yVal = yValBase + pwaveVal + qrswaveVal + twaveVal;
      } 
      
      //end of wave, fireBool = false
      if (firexVal == (tWStT + tDur)) { // fireBool reset when tWave is end.
        fireBool = false;
      } 
      
  // no wave period
    } else {
      yVal = nofireLine;
    }

    firexVal += 1;

    var setColor = 'lightgreen';
    drawOrder(ctx, ctx_sub,xValm, xIntervalperSec, dataBefore, yVal, setColor, aCanvas);
    dataBefore = yVal; //set aVal for next line.
    xVal += xIntervalperSec;

    if (!onoffBool){

      ctx.clearRect(0, 0, aCanvas.width, aCanvas.height);
      ctx_sub.clearRect(0, 0, aCanvas.width, aCanvas.height);
      dataBefore = null;

      return;
    } else {
        window.requestAnimationFrame(draw);
    }
    xValm = null;
    ctx = null;
    ctx_sub = null;
    aCanvas = null;

  }  
    

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// draw SpO2 curve
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
var spyVal, spdataBefore;
var wav1st,wav1dur, wav2st, wav2dur, wav1Count, wav2Count, wavflat, spPowVal;
var intVar;

function spO2draw(){
  var aCanvas = document.getElementById('spO2Canvas');
  var ctx = aCanvas.getContext('2d'); //draw on canvas
  var subCanvas = sub_win.document.getElementById('spO2Canvas2')
  var ctx_sub = subCanvas.getContext('2d');


  var xValm = xVal%(document.getElementById('spO2Canvas').width);// xVal as loop in canvas width
  var spyValBase;
  var sprandomCoefficient = 0.8;
  spyValBase = baseLineVal - 20 + Math.random() * sprandomCoefficient;// baseLine with fractuate voltage

  [wav1st,wav1dur, wav2st, wav2dur, spPowVal] = 
     (!sinusECGRhythmBool)? [10,10,13,8,40]
    :(hRSlider.value <= 80)? [14,15,20,13,35]
    :(hRSlider.value <= 100)? [10,13,16,13,40]
    : [10,10,13,8,40];
    
  if (firexVal < wav1st){ //before wave start
    spyVal = spdataBefore + spPowVal*Math.pow(3/15, (wavflat + 10)/10);

    if (spyVal >= 149){spyVal = 149;}

  } else if (firexVal <= (wav2st + wav2dur)){ //wave start
    //wav1, wav2 wave
    var wav1 = createPQRSTwave(wav1st, wav1dur, 30, 1, 0,'w1');
    var wav2 = createPQRSTwave(wav2st, wav2dur, 15, 1, 0,'w2');
    //all waves
    spyVal = spyValBase + wav1 + wav2;

  } else {
    spyVal = spdataBefore + spPowVal*Math.pow(3/15, (wavflat + 10)/10); 
    if (spyVal >= 149){spyVal = 149;}
    wavflat += 1;
  }

  if (firexVal == (wav2st + wav2dur)) { 
    wavflat = 0;
  }
  console.log ('spyVal is', spyVal);
  var setColor = 'lightskyblue';
  drawOrder(ctx, ctx_sub,xValm, xIntervalperSec, spdataBefore, spyVal, setColor, aCanvas);
  spdataBefore = null;
  spdataBefore = spyVal; //set aVal for next line.

    if (!onoffBool){
    ctx.clearRect(0, 0, aCanvas.width, aCanvas.height);
    ctx_sub.clearRect(0, 0, subCanvas.width, subCanvas.height);
    spdataBefore = null;
    return;
  } else {
    window.requestAnimationFrame(spO2draw);
  }
  xValm = null;
  ctx = null;
  ctx_sub = null;
  aCanvas = null;
  spyVal = null;
}  

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// RESP curve
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

var respyVal, respdataBefore;
var respWav1st,respWav1dur, respWav2st, respWav2dur, respWav1Count = 0, respWav2Count = 0, respWavflat, respPowVal, respTimer;
var respRhythm;
var respfirexVal;
var resptimeoutid;
var respfireBool = false;
var normalRRRhythmBool = true;
var respataxictime;
var wavCount;

function respdraw(){
  clearTimeout(resptimeoutid);

  var aCanvas = document.getElementById('respCanvas');
  var ctx = aCanvas.getContext('2d'); //draw on canvas
    
  var subCanvas = sub_win.document.getElementById('respCanvas2')
  var ctx_sub = subCanvas.getContext('2d');
    
  var xValm = xVal%(document.getElementById('respCanvas').width*2)/2;// xVal as loop in canvas width
  var respyValBase;
  var resprandomCoefficient = 0;

  respyValBase = 120;

  if (respfireBool) {  //respfire
  //respWav2dur is kyuuki duration
    var aRR = (document.getElementById('rR').innerText);
    respWav2dur = parseInt(-1 * (4/3) * aRR + 88);
    respWav1st = 0;
    respWav2st = 0;
    respWav1dur = parseInt(respWav2dur * 0.8);
    aRR = null;
    //max 30/min 1:1.5 timer:every 2sec     
    //min 6/min 2sec:3sec timer every 10sec
    //ave 12/min 1.5sec:2.3sec timer every 5sec 
    //1sec = 60 frame

    if (respfirexVal <= respWav2dur){
      var wav1 = createPQRSTwave(0, respWav1dur, 50, 1, 0,'rr');
      var wav2 = createPQRSTwave(0, respWav2dur, 30, 1, 0,'rr');
      //all waves
      respyVal = respyValBase + wav1 + wav2;
    } else {
      respyVal = 120;//respyValBase;
    }

    if (respfirexVal == respWav2dur) {
      respfireBool = false;
    }
  } else {
    respyVal = 120;//respyValBase;
  }

  if (!normalRRRhythmBool){
    var wav3 = createPQRSTwave(ataxicWavArray[1], ataxicWavArray[0], ataxicWavArray[2], 1, 0, 'rr');
    var wav4 = createPQRSTwave(ataxicWavArray[4], ataxicWavArray[3], ataxicWavArray[5], 1, 0, 'rr');
    var wav5 = createPQRSTwave(ataxicWavArray[7], ataxicWavArray[6], ataxicWavArray[8], 1, 0, 'rr');
    var wav6 = createPQRSTwave(ataxicWavArray[10], ataxicWavArray[9], ataxicWavArray[11], 1, 0, 'rr');
    var wav7 = createPQRSTwave(ataxicWavArray[13], ataxicWavArray[12], ataxicWavArray[14], 1, 0, 'rr');
    var ataxicrr = wav3 + wav4 + wav5 + wav6 + wav7;
  
    respyVal = respyVal + ataxicrr;

} 

  var setColor = 'white';
  console.log(ctx, ctx_sub,xValm, xIntervalperSec/2, respdataBefore, respyVal, setColor, aCanvas);
  drawOrder(ctx, ctx_sub,xValm, xIntervalperSec/2, respdataBefore, respyVal, setColor, aCanvas);
  respdataBefore = respyVal; //set aVal for next line.
  respfirexVal += 1;
  
  if (!onoffBool){

    ctx.clearRect(0, 0, aCanvas.width, aCanvas.height);
    ctx_sub.clearRect(0, 0, subCanvas.width, subCanvas.height);
    respdataBefore = null;
    return;
  } else {
    window.requestAnimationFrame(respdraw);
  }
  xValm = null;
  ctx = null;
  ctx_sub = null;
  aCanvas = null;
  subCanvas = null;
}  



function fire(){
  if (fireBool){
    return;
  } else {
    fireBool = true;
    firexVal = 0;
    pwCount = 0;
    qRSCount = 0;
    tCount =0;
    wav1Count = 0;
    wav2Count = 0;
  }  
}

function respfire(){
    if (respfireBool){
      return;
    } else {
      respfireBool = true;
      respfirexVal = 0;
      respWav1Count = 0;
      respWav2Count = 0;
    }  
  }

var ataxicWavArray = [];
function respataxicfire(){
  respataxictime = 0;
  wavCount = 0;

  ataxicWavArray.length = 0;
  for (i=0; i<5; i++){
    var durTimeFrame = Math.floor(Math.random()*30) + 30; // 30-60 frame
    var startTimeFrame = Math.floor(Math.random()*840) + 60; // 60-900 frame
    var strongHeight = Math.floor(Math.random()*10) + 20; // 20-30 times
    ataxicWavArray.push(durTimeFrame, startTimeFrame, strongHeight);
  }
}  


function hRRhythmChangeSW(){
var checkedValue = null; 
checkedValue = document.getElementById('hRcheck').checked;

  sinusECGRhythmBool = (!checkedValue);//sinus true, Af false
  console.log ('ecG is ',checkedValue);
    optionColorChange('optionalValaf', checkedValue);

  checkedValue = null;
}

function rRRhythmChangeSW(){
  var checkedValue = null; 
  checkedValue = document.getElementById('rRcheck').checked;
  console.log ('checkBAl  rr is',checkedValue);


  normalRRRhythmBool = (!checkedValue);

  optionColorChange('optionalValrR', checkedValue);

  checkedValue = null;
}

function displayVal(aId, aText){
  var subId = (aId == 'bPsmall')? 'sub_BPDisplay'
  : (aId == 'hRsmall')? 'hR2'
  : (aId == 'spO2small')? 'spO22'
  : (aId == 'rRsmall')? 'rR2'
  : '';

document.getElementById(aId).textContent = aText;
sub_win.document.getElementById(subId).textContent = aText;

}

function drawOrder(ctx, ctx_sub,xValm, xIntervalperSec, dataBefore, yVal, setColor, aCanvas){
    //draw on sub_win
    ctx_sub.beginPath();
    ctx_sub.moveTo(xValm - xIntervalperSec, dataBefore);//line start point, the point before this.
    ctx_sub.lineTo(xValm, yVal);//lineTo
    ctx_sub.strokeStyle = setColor;
    ctx_sub.stroke();
    //draw on small opWin
    ctx.beginPath();
    ctx.moveTo(xValm - xIntervalperSec, dataBefore);//line start point, the point before this.
    ctx.lineTo(xValm, yVal);//lineTo
    ctx.strokeStyle = setColor;
    ctx.stroke();
    if (xValm == 1) {
      ctx_sub.clearRect(0, 0, 30, aCanvas.height);
      ctx.clearRect(0, 0, 30, aCanvas.height);
    } else {
    ctx_sub.clearRect(xValm + 1, 0, 30, aCanvas.height);
    ctx.clearRect(xValm + 1, 0, 30, aCanvas.height);
    }

}


function createPQRSTwave(StT, durationtime, strongHeight, pow, qsVal, waveform){
  if (waveform == 'rr'){
    var wavCount = respfirexVal - StT;
    var ffirexVal = respfirexVal;
  } else {
    var wavCount = firexVal - StT;
    var ffirexVal = firexVal;
  }

  if (StT <= ffirexVal && ffirexVal <= (StT + durationtime)){
    var wavVal =  qsVal - Math.pow(Math.abs(strongHeight*Math.sin(Math.PI/(durationtime)*wavCount)),pow);
    } else {
      var wavVal = 0;
    }

  return wavVal;
}

function optionColorChange(targetId, aBool){
 var target = document.getElementById(targetId);
 if (aBool){
 target.style.color = "blue";
 } else {
   target.style.color = "lightgray";
 }
 target = null;
}
