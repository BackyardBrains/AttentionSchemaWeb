import { Experiment } from './baseExperiment.js'; // Adjust the path as necessary

class StarExperiment extends Experiment {
    constructor() {
        super();
        this.canvas = document.getElementById('stimulusCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.numDots = 100;
        this.dots = [];
        this.coherence = 0.2; // Fraction of dots moving in the coherent direction
    }

    generateTrials() {

        this.trialtypes = [];
        for(let dotDirection of ['left', 'right']) {
            for(let faceSide of ['left', 'right']) {
                for(let faceType of ['sighted', 'blindfold']) {
                    this.trialtypes.push({tubeTypeIndex: i, dotDirection: dotDirection, faceSide: faceSide, faceType: faceType });
                }
            }
        }
   
    }

    startTrial() {
        super.startTrial();
        const trial = this.trials[this.currentTrialIndex];
        this.initializeDots(trial.direction);
    }

    initializeDots(direction) {
        this.dots = [];
        for (let i = 0; i < this.numDots; i++) {
            this.dots.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                coherent: Math.random() < this.coherence,
                direction: direction === 'left' ? Math.PI : 0 // Left or right
            });
        }
    }

    updateDots() {
        for (let dot of this.dots) {
            if (dot.coherent) {
                dot.x += Math.cos(dot.direction) * 2; // Move in the coherent direction
                dot.y += Math.sin(dot.direction) * 2;
            } else {
                dot.x += Math.cos(Math.random() * 2 * Math.PI) * 2; // Move in a random direction
                dot.y += Math.sin(Math.random() * 2 * Math.PI) * 2;
            }

            // Wrap around logic
            if (dot.x < 0) dot.x = this.canvas.width;
            if (dot.x > this.canvas.width) dot.x = 0;
            if (dot.y < 0) dot.y = this.canvas.height;
            if (dot.y > this.canvas.height) dot.y = 0;
        }
    }

    drawDots() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let dot of this.dots) {
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, 2, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    animate() {
        this.updateDots();
        this.drawDots();
        requestAnimationFrame(this.animate.bind(this));
    }

    endTrial() {
        console.log("Trial ended");
        // Handle trial end logic
    }

    saveTrialData(trialData) {
        super.saveTrialData(trialData);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const starExperiment = new StarExperiment();
    starExperiment.generateTrials();
    starExperiment.startTrial();
    starExperiment.animate();
});

