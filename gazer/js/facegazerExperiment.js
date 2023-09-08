const config = {
  experiment_name: 'gazer',
  experiment_version: '0.3',
  trialDuration: 5000, // Duration in milliseconds
  hideCursorDuringTrials: true //show the red dot over eyes?
  
  // ... other config properties
};
class EyeTrackingExperiment extends Experiment {


  constructor() {
    super();
    
    
    this.experimentName = config.experiment_name;

    // Experiment setup
    this.instructionEl = document.getElementById('instructions');
    this.closeButtonEl = document.getElementById('closeButton');
    this.tracker = document.getElementById('tracker');    
    this.recordData = false;

    // Faces
    this.faces = ["face001.png", "face002.jpg", "face003.jpg"];
    this.calibrationClicksPerLocation = 3;
    this.calibrationLocations = 8;
    this.currentCalibrationClicks = 0;
    this.currentCalibrationLocation = 0;

    
    // Calibration
    this.calibrationLocations = [ { left: '90%', top: '10%' },
                                  { left: '30%', top: '10%' },
                                  { left: '50%', top: '50%' },
                                  { left: '10%', top: '90%' },
                                  { left: '90%', top: '90%' },
                                  { left: '30%', top: '30%' },
                                  { left: '70%', top: '70%' },
                                  { left: '50%', top: '80%' },
                                  { left: '40%', top: '20%' },
                                  { left: '20%', top: '40%' }];
    
    //this.calibrationLocations = [ { left: '90%', top: '10%' } ];
    this.gazeData = [];

    this.session = {
      version: config.experiment_version,
      startTime: new Date().toISOString(),
      calibrtaionPoints: this.calibrationLocations.length
    };
  }

  

  generateTrials() {
   
    this.faces = shuffle(this.faces);
    this.images = [];

    // Load and check each face in the shuffled array
    this.faces.forEach(face => {
      let img = new Image();
      img.src = `./img/${face}`;

      img.onload = () => {
        
        this.images.push({
          imageName: face,
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        console.log(`Image ${face} could not be loaded`);
      };
});

  }

  async start() {

    this.webgazerInstance = await webgazer.setRegression('ridge') 
      .setTracker('TFFacemesh')
      .begin();
  
    this.webgazerInstance.showVideoPreview(true) 
      .showPredictionPoints(true) 
      .applyKalmanFilter(true); 
  
    webgazer.setGazeListener(this.gazeListener.bind(this));
  
    await this.calibrate();
    await this.runTrials();

  }

  async runTrials() {
    for (const [index, trial] of this.images.entries()) {
      await this.startTrial(index);
    }
  }

  gazeListener(data, elapsedTime) {
    if (data == null) {
        return;
    }

    if (this.recordData) {
      this.gazeData.push({x: parseFloat(data.x.toFixed(2)), y: parseFloat(data.y.toFixed(2))});
    }
    
  }

  async startTrial(trialIndex) {
    // Display face
    let faceContainer = document.getElementById('faceContainer');
    console.log(`Starting trial ${trialIndex}`);
    // Add new face
    let img = document.createElement('img');
    img.src = "img/"+this.images[trialIndex].imageName;

    faceContainer.appendChild(img);
  
    // Deselect any selected element
    window.getSelection().removeAllRanges();

    // Initialize an empty array for the current trial's gaze data
    let gazeData = [];
    this.recordData = true;

    await this.endTrial(trialIndex);
  }
  
  async endTrial(trialIndex) {
    await new Promise(resolve => setTimeout(resolve, config.trialDuration));
    this.recordData = false;
    
    // Remove any previous face
    let faceContainer = document.getElementById('faceContainer');
    let imgRect, windowScrollX, windowScrollY, windowWidth, windowHeight;

    if (faceContainer.firstChild) {
      imgRect = faceContainer.firstChild.getBoundingClientRect();
      windowScrollX = window.scrollX;
      windowScrollY = window.scrollY;
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;

      while (faceContainer.firstChild) {
        faceContainer.removeChild(faceContainer.firstChild);
      }
    }
    
    
    this.saveTrialData({
      trial: trialIndex,
      image: this.images[trialIndex],
      gazeData: this.gazeData,
      layout: {
        imgRect,
        windowScroll: { x: windowScrollX, y: windowScrollY },
        windowSize: { width: windowWidth, height: windowHeight }
      }
    });

    this.gazeData = []; //Clear it out.
  }

  end() {
    // End WebGazer
    this.session.endTime = new Date().toISOString();

    // Save all data
    this.saveData(); 
  }

  calibrate() {
    return new Promise((resolve, reject) => {
      // Reset current calibration location
      this.currentCalibrationLocation = 0;
  
      // Initialize calibrationButton if needed
      const calibrationButton = document.getElementById('calibrationButton');
  
      // Start at the first location
      calibrationButton.style.left = this.calibrationLocations[0].left;
      calibrationButton.style.top = this.calibrationLocations[0].top;
      calibrationButton.style.display = 'block';
      this.currentCalibrationClicks = 0;
      
      const calibrationClick = () => {
        webgazer.showVideoPreview(false);
        this.currentCalibrationClicks++;
        if (this.currentCalibrationClicks >= this.calibrationClicksPerLocation) {
          this.currentCalibrationClicks = 0;
          this.currentCalibrationLocation++;
          if (this.currentCalibrationLocation >=  this.calibrationLocations.length) {
              // All calibration done, hide button and remove event listener
              calibrationButton.style.display = 'none';
              calibrationButton.removeEventListener('click', this.calibrationClick);
              
              this.webgazerInstance.showPredictionPoints(!config.hideCursorDuringTrials);
              resolve();
          } else {
              // Move to the next location
              calibrationButton.style.left = this.calibrationLocations[this.currentCalibrationLocation].left;
              calibrationButton.style.top = this.calibrationLocations[this.currentCalibrationLocation].top;
          }
        }
      };
  
      calibrationButton.addEventListener('click', calibrationClick);
    });
  }

}

