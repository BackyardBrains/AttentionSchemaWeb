const config = {
    experiment_name: 'tube',
    experiment_version: '1.3',
    datafile_version: '1.4'
  };

class TubeExperiment extends Experiment {

    constructor() {
        super();
        this.UUID = '';
        this.experimentName = config.experiment_name;
        this.session = '';
        this.trialStartTime = 0;
        this.trials = [];
        this.trialtypes = [];
        this.FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfiziJ_yQ7LLJEejvsMwjNVu7zyCmSQX8qUwC8sB7QDB6LmfQ/viewform?usp=pp_url&entry.766586855='
        this.image_name = 'girl2';
        this.tube = document.getElementById('tube');
        this.line = document.querySelector('line');
        this.arrow = document.getElementById('arrow');
        this.leftface = document.getElementById('leftface');
        this.rightface = document.getElementById('rightface');
        this.game = document.getElementById('gamesection');
        this.formsection = document.getElementById('formsection');
        this.formbutton = document.getElementById('formbutton');
    
        
        this.tubeTypes = [
            {width: '24', height: '130', faceAngle: '-9'}, // normal
            {width: '48', height: '130', faceAngle: '-8'}, // fat
            {width: '24', height: '65', faceAngle: '0'}, // short
            {width: '48', height: '65', faceAngle: '1'}, // short and fat
        ];

        this.button = document.getElementById('button');
        this.buttontext = document.getElementById('buttontext');
        
        
        //removed from HTML
        //    <rect id="button" x="900" y="192" width="100" height="40" fill="green" />
        //    <text id="buttontext" class="no-select" x="915" y="215" fill="white" font-size="15px" >Next</text>

        // Event listener for click event on the button
        //this.button.addEventListener('click', () => tubeExp.endTrial());
        //this.buttontext.addEventListener('click', () => tubeExp.endTrial());
    
    
        this.trialIndex = 0;
        this.tubeTypeIndex, this.arrowDirection, this.faceSide;
        this.currentAngle = 0; // Initialize current angle of line
        this.currentDirection = 'right'; // Initialize current angle of line

        // Event listeners for keydown event to rotate the line
        window.addEventListener('keydown', (event) => {
            
            switch(event.key) {
                case 'ArrowLeft':
                case 'f': 
                this.tube.style.display = 'none'; 
                    this.currentAngle = (this.currentAngle <= -180) ? -180 : this.currentAngle - 1;
                    break;
                case 'ArrowRight':
                case 'j':
                    this.tube.style.display = 'none'; 
                    this.currentAngle = (this.currentAngle >= 180) ? 180 : this.currentAngle + 1;
                    break;
                case ' ':
                    this.endTrial();
                    break;
            }
            this.line.setAttribute('transform', `rotate(${this.currentAngle}, 514, 163)`);
        });
    }
  
    generateTrials() {
        for(let i = 0; i < this.tubeTypes.length; i++) {
            for(let arrowdirection of ['left', 'right']) {
                for(let faceSide of ['left', 'right']) {
                    for(let faceType of ['sighted', 'blindfold']) {
                        this.trialtypes.push({tubeTypeIndex: i, arrowDirection: arrowdirection, faceSide: faceSide, faceType: faceType });
                    }
                }
            }
        }
    
        // Shuffle trials array
        this.trialtypes.sort(() => Math.random() - 0.5);
    }
    
    startTrial() {
        this.tubeTypeIndex = this.trialtypes[this.trialIndex].tubeTypeIndex;
        this.arrowDirection = this.trialtypes[this.trialIndex].arrowDirection;
        this.faceSide = this.trialtypes[this.trialIndex].faceSide;
        this.faceType = this.trialtypes[this.trialIndex].faceType;
    
        this.tube.setAttribute('width', this.tubeTypes[this.tubeTypeIndex].width);
        this.tube.setAttribute('height', this.tubeTypes[this.tubeTypeIndex].height);

        //hide the faces
        this.rightface.style.display = 'none'; 
        this.leftface.style.display = 'none'; 

        if (this.faceSide == 'left') {
            this.leftface.setAttribute("xlink:href", "img/" + this.faceSide + "_" + this.image_name +  "_" + this.faceType + ".png");
            this.leftface.setAttribute('transform', 'rotate(' +  this.tubeTypes[this.tubeTypeIndex].faceAngle + ', 100, 200)');
            this.leftface.style.display = ''; 
        } else {
            this.rightface.setAttribute("xlink:href", "img/" + this.faceSide + "_" + this.image_name +  "_" + this.faceType + ".png");
            //rightface.setAttribute('transform', 'translate(1023, 0) scale(-1, 1) translate(-1023, 0)');
            this.rightface.setAttribute('transform', 'rotate(' +  (-1 * this.tubeTypes[this.tubeTypeIndex].faceAngle).toString() + ', 923, 200)');
            this.rightface.style.display = ''; 
        }
         
        // update tube's x and y position to keep it centered on the platform
        let originalWidth = 24;
        let newWidth = parseInt(this.tube.getAttribute('width'));
        let originalX = 502; // original center of tube
        let newX = originalX - (newWidth - originalWidth) / 2;
        this.tube.setAttribute('x', newX);
    
        let platformY = 160;
        let newHeight = parseInt(this.tube.getAttribute('height'));
        let newY = platformY - newHeight;
        this.tube.setAttribute('y', newY);
    
        this.tube.style.display = ''; 
    
        this.currentAngle = 0; // reset line's angle at the start of each trial
        this.line.setAttribute('transform', `rotate(${this.currentAngle}, 514, 163)`);
        this.arrow.setAttribute('transform', (this.currentDirection != this.arrowDirection) ? 'rotate(180, 523, 210)' : '');
        this.trialStartTime = Date.now();

    }
  
    endTrial() {

        let trialLatency = Date.now() - this.trialStartTime;

        let trialResult = {
            trialIndex: this.trialIndex,
            tubeTypeIndex: this.tubeTypeIndex,
            arrowDirection: this.arrowDirection,
            faceType: this.faceType,
            faceSide: this.faceSide,
            endAngle: this.currentAngle,
            latency: trialLatency
        };
    
        this.trials.push(trialResult);

        if (this.faceSide == 'left') {
            this.leftface.style.display = 'none'; 
            this.leftface.setAttribute('transform', 'rotate(' + (-1 * this.tubeTypes[this.tubeTypeIndex].faceAngle).toString()  + ', 200, 200)');
        } else {
            this.rightface.style.display = 'none'; 
            this.rightface.setAttribute('transform', 'rotate(' + this.tubeTypes[this.tubeTypeIndex].faceAngle + ', 200, 200)');
        }

        this.trialIndex++;
        if (this.trialIndex < this.trialtypes.length) {
            this.startTrial();
        } else {

            this.game.style.display = 'none';
            this.formsection.style.display = ''; 

            this.saveTrialData();

            // Convert trial data to JSON string
            //let trialDataJSON = JSON.stringify(trialData);
            //console.log(trialDataJSON);

                             
            this.formbutton.onclick = () => {
                location.href = this.FORM_URL + this.UUID;
            };

        }
    }
  
    saveTrialData() {
        // save trial data
        let data = {session: this.session, 
            trials: this.trials };
        sendDataToServer(data, this.UUID, 'tube'); 

    }
  
  }

function preloadImages(imageUrls) {
    let loadPromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
    });
    return Promise.all(loadPromises);
}

window.onload = function() {
    const faceImageUrls = [ //Hack.  Sould be auto-generated from variables.
        'img/left_girl2_sighted.png',
        'img/left_girl2_blindfold.png',
        'img/right_girl2_sighted.png',
        'img/right_girl2_blindfold.png'
    ];
    
    preloadImages(faceImageUrls).then(() => {
        const tubeExp = new TubeExperiment();
            
        const sessionGroup = getQueryParam('SG'); // Get session_group from URL

        tubeExp.session = {
            session_group: sessionGroup,
            experiment_version: config.experiment_version,
            file_version: config.datafile_version,
            browserData: getBrowserData(),
            tubeTypes: tubeExp.tubeTypes
        };
        tubeExp.UUID = generateUUID();

        // Generate trials and start the first one
        tubeExp.generateTrials();
        tubeExp.startTrial();
    }).catch(error => {
        console.error("Error loading images: ", error);
        // Handle image loading errors here
    });
    
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
document.addEventListener('DOMContentLoaded', function () {
    const access_control = getQueryParam('AC');
    const passwordSection = document.getElementById('passwordSection');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    const passwordError = document.getElementById('passwordError');

    if (access_control) {
        passwordSection.style.display = 'block';
    }

    submitPassword.addEventListener('click', function() {
        if (passwordInput.value === access_control) {
            // Password is correct, hide the initial instruction section and show the game section
            document.getElementById('passwordSection').style.display = 'none';
            document.getElementById('initialInstructionSection').style.display = 'block';
            //document.getElementById('gamesection').style.display = 'flex';
        } else {
            // Password is incorrect, show an error message
            passwordError.style.display = 'block';
        }
    });
});