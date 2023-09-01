let headerElement;
let timeElement;
let instructionElement;
let existingArrowIndicator;
let experiment; 
let keyboard;
let currentTime, timerInterval;
let startTime;   
let keydownListener;

document.addEventListener("DOMContentLoaded", function() {
   headerElement = document.getElementById('header');
   timeElement = document.getElementById('time');
   instructionElement = document.getElementById('instruction');
   keyboard = document.getElementById('keyboard');
   

   // Create an instance of ReactionTimeExperiment
  experiment = new ReactionTimeExperiment();
   
});


class ReactionTimeExperiment extends Experiment {

  constructor() {
    super(); 
    this.keys = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';']; 
    
    this.leftKeys = ['A', 'S', 'D', 'F'];
    this.rightKeys = ['J', 'K', 'L', ';'];
      
    this.UUID = generateUUID(); // Replace with a function call when in an app.
    this.experimentName = 'rt';
    this.currentTarget = '';
  }


  start() {

    //for (let key of this.keys) {
     // keyboard.innerHTML += `<div class="key d-inline-block text-center border m-2 p-4" id="${key}">${key}</div>`;
    //} 

    this.leftKeys.forEach((key) => {
      const keyElement = document.createElement('div');
      keyElement.className = 'key left-hand d-inline-block text-center border m-2 p-4';
      keyElement.textContent = key;
      keyElement.id = key;
      keyboard.appendChild(keyElement);
    });
    
    this.rightKeys.forEach((key) => {
      const keyElement = document.createElement('div');
      keyElement.className = 'key right-hand d-inline-block text-center border m-2 p-4';
      keyElement.textContent = key;
      keyElement.id = key;
      keyboard.appendChild(keyElement);
     
    });

  

  }

  generateTrials(numTrials) {

    const trials = [];
    
    // Generate keys
    for(let i = 0; i < numTrials; i++) {
      const key = this.keys[Math.floor(Math.random() * this.keys.length)];
      trials.push({key});
    }
  
    // Mark first half as uncued
    for(let i = 0; i < numTrials/2; i++) {
      trials[i].condition = 'uncued';
    }
  
    // Mark second half as cued
    for(let i = numTrials/2; i < numTrials; i++) {
      trials[i].condition = 'cued';
    }
  
    return trials;
  
  }

  startTrial(condition, key) {
    this.currentTarget = key
    console.log(condition + " - " + this.currentTarget)
    instructionElement.textContent = "";

    if (condition == "uncued") {
      headerElement.textContent = "Part 1: Press the fashing key as fast as you can!";
      setTimeout(() => {
      document.getElementById(key).classList.add('highlight');
     
      startTime = new Date();
      timerInterval = setInterval(() => {
            currentTime = new Date();
            timeElement.textContent = `Time: ${(currentTime - startTime)/ 1000} seconds`;
          }, 100);
        },2000);
    } else {
      // 'cued'
      headerElement.textContent = "Part 2: Now focus only on the key indicated.";
        
      setTimeout(() => {
        
        //const arrowIndicator = document.createElement('span');
        //arrowIndicator.classList.add('arrow-up');
        document.getElementById(key).classList.add('arrow-up');
        //document.getElementById(key).appendChild(arrowIndicator);

        setTimeout(() => {
            document.getElementById(key).classList.add('highlight');
            startTime = new Date();
            timerInterval = setInterval(() => {
                currentTime = new Date();
                timeElement.textContent = `Time: ${(currentTime - startTime)/ 1000} seconds`;
  
                    }, 100);
                }, 3000);
            }, 2000);
    }
 

    return new Promise(resolve => {

      document.removeEventListener('keydown', keydownListener);     

      keydownListener = function (event) {

        key = experiment.currentTarget
        console.log(key + " was pressed")
        if (!document.querySelector('.highlight')) {
          instructionElement.textContent = "Wait for a key to flash.";
          return; 
        }

          if (event.key.toUpperCase() == key) {
            
            let endTime = Date.now();
            let reactionTime = endTime - startTime;
            clearInterval(timerInterval); 
         
            for (let key of experiment.keys) {
              document.getElementById(key).classList.remove('highlight');
            }

            existingArrowIndicator = document.querySelector('.arrow-up');
            if (existingArrowIndicator) existingArrowIndicator.classList.remove('arrow-up');
      
            resolve(reactionTime);

          }
        } 

        document.addEventListener('keydown', keydownListener);     

    });

 } 
 
  saveData() {
    // save trial data
    let data = {session: this.session, 
        trials: this.trials };
    sendDataToServer(data, this.UUID, this.experimentName); 
    this.endGame();
  }

  endGame() {
    headerElement.style.display = 'none';
    timeElement.style.display = 'none';
    keyboard.style.display = 'none';
    instructionElement.textContent = "Game over! Here are your average reaction times:";
    document.getElementById('chart').classList.remove('d-none');
    document.removeEventListener('keydown', keydownListener);     

    const cuedTrials = this.trials.filter(trial => trial.condition === 'cued');
    const uncuedTrials = this.trials.filter(trial => trial.condition === 'uncued');
  
    const averageCued = cuedTrials.reduce((acc, trial) => acc + trial.rt, 0) / cuedTrials.length;
    const averageUncued = uncuedTrials.reduce((acc, trial) => acc + trial.rt, 0) / uncuedTrials.length;
  
    let averageTimes = [averageUncued, averageCued];
  
    let ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Uncued (Without attention)', 'Cued (With attention)'],
            datasets: [{
                label: 'Average reaction time (ms)',
                data: averageTimes,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
  }

}
