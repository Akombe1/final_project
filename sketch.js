const WIDTH = 800;
const HEIGHT = 800;
let FR = 480;
let EMA = [];

let table;
let isClicked = false;
let isPressed = false;
let coords = [];
let steps = [];
totalsteps = 0;

// Load the CSV into the p5
function loadTableData(table) {
  let id = float(table.getColumn("ID"));
  let steps = float(table.getColumn("Steps Per day"));

  // get the max steps and id (days since Sep 1 2017) of steps
  maxSteps = max(steps);
  minSteps = min(steps);
  range = maxSteps - minSteps;
  maxID = max(id);
  let sumall = steps.reduce((accumulator, currentValue)=> accumulator + currentValue,0);
  mean=round(sumall/maxID);

  // create a for loop to interpret  all of the data and scale it
  for (let i = 0; i < table.getRowCount(); i++) {
    let r = table.getRow(i);
    let x = map(id[i], 0, maxID, 100, WIDTH - 50);
    let y = map(steps[i], 0, maxSteps, HEIGHT - 200, 100);
    let coord = createVector(x, y);
    coords.push(coord);
  }
}

function preload() {
  table = loadTable("travel2-1.csv", "csv", "header", loadTableData);
}

function setup() {
  createCanvas(WIDTH, HEIGHT);

  // manually manipulating the frame rate to make the graphic interesting
  frameRate(FR);
}

function draw() {
  background("#F5F5DC");

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // Create Y Axis Labels
  push();
  translate(45, 450);
  angleMode(DEGREES);
  rotate(-90);
  fill("black");
  textSize(25);
  noStroke();
  text("Steps per day", 50, -10);
  //text(maxSteps +'Steps Per Day', 0, 0);
  //text('Steps per day (Max =' + ' '+ maxSteps+ ')', 0, 0);
  pop();

  // Create X-Axis Labels
  stroke(0);
  textSize(40);
  textFont("San Francisco");
  fill("yellow");
  //text('Date', 300, 650);

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // September label
  push();
  translate(40, 730);
  angleMode(DEGREES);
  rotate(-60);
  noStroke();
  fill("black");
  textSize(20);
  textFont("San Francisco");
  text("September 2017", 0, 0);
  pop();

  // August 24 label
  push();
  translate(700, 700);
  angleMode(DEGREES);
  rotate(-60);
  noStroke();
  fill("black");
  textSize(20);
  text("August 2024", 0, 0);
  pop();
  
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // Trace the steos taken per day
  noFill();
  stroke(300);
  strokeWeight(1);

  beginShape();
  for (let i = 0; i < coords.length; i++) {
    totalsteps = totalsteps + coords[i];
    stroke(2);
    let coord = coords[i];
    vertex(coord.x, coord.y);
  }

    ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  endShape();
  // Produce the Y-Axis
  strokeWeight(3);
  stroke("grey");
  line(50, 0, 50, 600);

  // Produce the X-Axis
  strokeWeight(3);
  stroke("grey");
  line(50, 600, 800, 600);
  
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // Cumulative average dot
  let sum = 0;
  let current = frameCount % coords.length;
  let currentPosition = coords[current];

  for (let s = 0; s <= current; s++) {
    sum += coords[s].y;
  }

  let cum_avg = sum / (current + 1);
  // Create a marker on the plot
  fill(255, 0, 0);
  circle(coords[current].x, cum_avg, 20);

  //Reverse mapping to og step value range
  let cum_avg_new = map(cum_avg, HEIGHT - 200, 100, 0, maxSteps);
  noStroke();
  fill("black");
  textSize(20);
  text("Cumulative Average: " + round(cum_avg_new), 12, 90);
  
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  //Exponential moving avearge
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // change the day pick to increase or decrease the moving avearge
  daypick = 20;
  EMA[20] = 0;

  let smoothing_factor = 2 / (1 + daypick);

  if (EMA.length < coords.length) {
    EMA = new Array(coords.length).fill(0);
  }
  for (let i = 0; i <= current; i++) {
    if (i === 0) {
      EMA[i] = coords[i].y;
    } else {
      EMA[i] =
        coords[i].y * smoothing_factor + EMA[i - 1] * (1 - smoothing_factor);
    }
  }

  fill(0, 255, 0);
  if (current < EMA.length) {
    circle(coords[current].x, EMA[current], 20);
  }
  let exp_avg_new = map(EMA[current], HEIGHT - 200, 100, 0, maxSteps);

  text("Exponential Moving Average: " + round(exp_avg_new), 90, 150);
  
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  if (isClicked) {
    // create the visual documentation for the statistical summary
    fill(255);
    textSize(18);
    fill("orange");
    noStroke();

    // Draw the other stats on the right hand side
    text("Maximum " + maxSteps + " Steps", 600, 100);
    text("Minimum " + minSteps + " Steps", 600, 150);
    text("Range " + range + " Steps", 600, 200);
    text("Mean " + mean +  "Steps", 600, 250);
  }
}

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

function mousePressed() {
  isClicked = !isClicked;
}
