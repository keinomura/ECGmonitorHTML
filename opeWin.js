
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
};


///////////////////////
// BP mesure button
///////////////////////

function mesureBP(){
  if (monitorOn){
    var main_SBP=document.getElementById('sBP').value;
    var main_DBP=document.getElementById('dBP').value;
    var displayBP=main_SBP + ' / ' + main_DBP;

  ///////BP display Blink///////
    var count = 0;
    var countup = function(){
      console.log(count++);
    }
    var timerID= setInterval(function(){
        setTimeout(function(){
        document.getElementById('bPsmall').textContent = '--- / ---';
        sub_win.document.getElementById('sub_BPDisplay').textContent = '--- / ---';
        }, 500);

        setTimeout(function(){
        document.getElementById('bPsmall').innerText = '';
        sub_win.document.getElementById('sub_BPDisplay').textContent = '';
        }, 999);
      countup();
      if(count > 2){
        clearInterval(timerID);
      }
    }, 1000); //call timerID() each 1sec

  //finally show BP
    setTimeout(function(){
      document.getElementById('bPsmall').innerText = main_SBP +' / '+ main_DBP;
      sub_win.document.getElementById('sub_BPDisplay').innerText = main_SBP +' / '+ main_DBP;
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

    //console.log (aDBPVal);

  } else { // HR or SpO2
    if (aDom.type == "range"){  //slider
      theOther = document.getElementById(mainItem + "SliderSide");
    } else { // Box
      theOther = document.getElementById(mainItem + "Slider");
    }

    var aVal = aDom.value;
    theOther.value = aVal;
    
    document.getElementById(mainItem).innerText = aVal;
    if (monitorOn){
    sub_win.document.getElementById(subItem).innerText = aVal;
    document.getElementById(smallMonitorItem).innerText = aVal;
    }
  }


}






///////////////////////
// START button
// 1. start hr sound
// 2. show BP and HR values
///////////////////////

// sound play function
//var ringfunc;

//monitor on-off bool
var monitorOn = false;
var timeoutid = null; //need to global var to clearTimeout
function ring(){
  // clearTimeout
  clearTimeout(timeoutid);

  // change button text
  var buttonValue = document.getElementById("sButton").value;
  if (buttonValue == "start"){
    document.getElementById("sButton").value = "stop";
    monitorOn = true;
    sub_win.document.getElementById('hR2').innerText = document.getElementById('hR').innerText;
    document.getElementById('hRsmall').innerText = document.getElementById('hR').innerText;
    sub_win.document.getElementById('spO22').innerText = document.getElementById('spO2').innerText;
    document.getElementById('spO2small').innerText = document.getElementById('spO2').innerText;
      } else {
    document.getElementById("sButton").value = "start";
    monitorOn = false;
    sub_win.document.getElementById('hR2').innerText = "--";
    sub_win.document.getElementById('spO22').innerText = "--";
    sub_win.document.getElementById('sub_BPDisplay').innerText = '--- / ---';
    document.getElementById('hRsmall').innerText = "--";
    document.getElementById('spO2small').innerText = "--";
    document.getElementById('bPsmall').textContent = '--- / ---';

  }
 console.log (monitorOn);
  //timeout function
  var ringfunc = function(){
    var dinum = document.getElementById('spO2').innerText;

    //not to delay, read wav files directry
    var dinumplus = "wav/" + dinum + ".wav";
    var sound=new Audio(dinumplus);
    sound.volume = document.getElementById('volControl').value;
    sound.play();
    
    //document.getElementById(dinum).play();  //this handler makes some delay

    //console.log ("ring!")
    var hRtime = (60000 / (document.getElementById('hR').innerText) * 1);
    console.log (hRtime);
    timeoutid = setTimeout(ringfunc, hRtime);
  }
  
  if (buttonValue == "start"){
    ringfunc(); //run only 'start'
  }
}