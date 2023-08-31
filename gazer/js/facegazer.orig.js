document.addEventListener("DOMContentLoaded", function() {
  // DOM element references
  const instructions = document.getElementById("instructions");
  const closeButton = document.getElementById("closeButton");
  const calibrationButton = document.getElementById('calibrationButton');
  const faceContainer = document.getElementById('faceContainer');
  const tracker = document.getElementById('tracker');

  // Global settings
  window.saveDataAcrossSessions = false;

  // Define faces data
  const faces = ["face001.png", "face002.jpg", "face003.jpg"];
  let faceIndex = 0;
  const hideCursorDuringTrials = 1;

  // Define trials data
  const trialsData = [];

  // Calibration settings
  const calibrationClicksPerLocation = 3;
  const calibrationLocations = 8;
  let currentCalibrationClicks = 0;
  let currentCalibrationLocation = 0;

  // Calibration locations
  const locations = [
      { left: '30%', top: '10%' },
      { left: '90%', top: '10%' },
      { left: '50%', top: '50%' },
      { left: '10%', top: '90%' },
      { left: '90%', top: '90%' },
      { left: '30%', top: '30%' },
      { left: '70%', top: '70%' },
      { left: '50%', top: '80%' },
      { left: '40%', top: '20%' },
      { left: '20%', top: '40%' }   
  ];

  // Event Handlers
  closeButton.onclick = function() {
    instructions.style.display = "none";
    // Continue with the rest of your JavaScript initialization
    initializeWebGazer();
  }
  instructions.style.display = "block";

  // Application start
  async function initializeWebGazer() {
    let showCursor = 1;

    const webgazerInstance = await webgazer.setRegression('ridge') 
      .setTracker('TFFacemesh')
      .begin();

    webgazerInstance.showVideoPreview(true) 
      .showPredictionPoints(false) 
      .applyKalmanFilter(true); 

    webgazer.setGazeListener(gazeListener);
  
    await runCalibration();
    displayFace();
  }

  calibrationButton.addEventListener('click', function() {
      handleCalibrationClick();
  });

  // Functions
  function handleCalibrationClick() {
    currentCalibrationClicks++;
    if (currentCalibrationClicks >= calibrationClicksPerLocation) {
        currentCalibrationClicks = 0;
        currentCalibrationLocation++;
        if (currentCalibrationLocation >= calibrationLocations) {
            calibrationButton.style.display = 'none';
        } else {
            calibrationButton.style.left = locations[currentCalibrationLocation].left;
            calibrationButton.style.top = locations[currentCalibrationLocation].top;
        }
    }
  }
  window.onbeforeunload = function() {
    localforage.clear();
  
    // Display the trials data as a JSON string in the console when the session ends
    console.log(JSON.stringify(trialsData));
  
    // Prepare the data for download
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trialsData));
    
    // Tried to create a download link and click it programatically.  Didnt work.   [TODO]
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "trialsData.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function displayFace() {
    let faceContainer = document.getElementById('faceContainer');

    // Remove previous face
     while (faceContainer.firstChild) {
      faceContainer.removeChild(faceContainer.firstChild);
    }
  
    // If all images have been shown, end the session
    if (faceIndex >= faces.length) {
      webgazer.end();
      return;
    }
  
  
    // Add new face
    let img = document.createElement('img');
    img.src = "img/"+faces[faceIndex % faces.length];
    faceContainer.appendChild(img);
  
    // Deselect any selected element
    window.getSelection().removeAllRanges();

    // Initialize an empty array for the current trial's gaze data
    let gazeData = [];
  
    webgazer.setGazeListener(function(data, elapsedTime) {
      if (data == null) {
          return;
      }
      // Push only the x and y coordinates of gaze data
      gazeData.push({x: data.x, y: data.y}); 
  
      var tracker = document.getElementById('tracker');     
      if (showcursor==1) {
        // Move the tracker to follow the gaze
        tracker.style.left = data.x + 'px';
        tracker.style.top = data.y + 'px';
      } else {
  
        tracker.style.visibility = 'hidden';
      }
    });
  
    // Meta data for the trial
    let trialMetaData = {
      image: faces[faceIndex % faces.length],
      boundingBox: img.getBoundingClientRect(),
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      gazeData: gazeData
    };
  
    // Push the current trial's data to the trialsData array
    trialsData.push(trialMetaData);
  
    // Log the trialsData to the console
    console.log(JSON.stringify(trialsData));
  
  
    // Cycle to the next face
    faceIndex += 1;
  
    // Hide the face container
    faceContainer.style.display = 'none';
    
    // Wait for 1 second
    await sleep(1000);
    
    // Show the face container
    faceContainer.style.display = 'flex';
  
    // Wait for 5 seconds, then show the next face
    setTimeout(displayFace, 5000);
  }

  function gazeListener(data, clock) {
    if(!data) return;

    tracker.style.left = data.x + 'px';
    tracker.style.top = data.y + 'px';
  }

  function runCalibration() {
    return new Promise((resolve, reject) => {

        // Reset current calibration location
        currentCalibrationLocation = 0;
        
        
        // Function to handle calibration click
        function calibrationClick() {
          webgazer.showVideoPreview(false);
          currentCalibrationClicks++;
          if (currentCalibrationClicks >= calibrationClicksPerLocation) {
            currentCalibrationClicks = 0;
            currentCalibrationLocation++;
            if (currentCalibrationLocation >= calibrationLocations) {
              // All calibration done, hide button and remove event listener
              calibrationButton.style.display = 'none';
              calibrationButton.removeEventListener('click', calibrationClick);
              // Resolve the promise
              showcursor = !(hideCursorDuringTrials);
              resolve();
            } else {
              // Move to the next location
              calibrationButton.style.left = locations[currentCalibrationLocation].left;
              calibrationButton.style.top = locations[currentCalibrationLocation].top;
            }
          }
        }
    
        // Start at the first location
        calibrationButton.style.left = locations[0].left;
        calibrationButton.style.top = locations[0].top;
        calibrationButton.style.display = 'block';
        currentCalibrationClicks = 0;
        
        // Add click event listener to calibration button
        calibrationButton.addEventListener('click', calibrationClick);
      });
  }
});
