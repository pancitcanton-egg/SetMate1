import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getDatabase, ref, set, get, child} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js';

var config = {
     apiKey: "AIzaSyCeZUvEpuKFgftbgmJqkQtS06D08zg6RXg",
     authDomain: "setmate-db.firebaseapp.com",
     databaseURL: "https://setmate-db-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "setmate-db",
     storageBucket: "setmate-db.appspot.com",
     messagingSenderId: "881886028562",
     appId: "1:881886028562:web:370c16302f11e98d5409cb",
     measurementId: "G-6S8GH3JE25"
};

const app = initializeApp(config);
const database = getDatabase(app);
const storage = getStorage(app);

var problemsRef = ref(database, 'proofTasks');

document.addEventListener("DOMContentLoaded", function () {
  const problemContainer = document.querySelector(".problem-container");
  const firstPart = document.querySelector(".first-part");
  const proofSolution = document.querySelector(".proof-solution");
  const justSolution = document.querySelector(".just-solution");
  const backBtn = document.querySelector(".backBtn");
  const proving = document.querySelector(".proving");

  const keyboard = document.querySelector(".keyboard-container");
  const proof =document.querySelector(".proof");
  const just =document.querySelector(".just");
  const done =document.querySelector(".done");
  const buttons = document.querySelectorAll(".btn");
  const deleteBtn = document.querySelector(".delete");
  const spaceBtn = document.querySelector(".space");
  const checkAnswer = document.querySelector(".check-answer");
  const showAnswers = document.querySelector(".show-answers");

  let chars = [];
  let area = "";
  let numberOfSteps = "";
  let currentStep = 0;

  const problem = localStorage.getItem('problem');

  if (problem) {
    var divided = problem.split('=');
    var first = divided[0];
    getJustifications(problem, function(justifications,steps) {
      numberOfSteps = parseInt(steps);
      problemContainer.innerHTML = `<h1>${problem}</h1>
                                    <p>Note: Use ${justifications} to prove the claim above.</p>`;
    
      firstPart.innerHTML += `<h3>${first}</h3>`
      console.log(numberOfSteps);
    });
  } else {
    window.location.href = 'index.html';
  }

  backBtn.addEventListener("click", function() {
    proving.style.display= "block";
  checkAnswer.style.display= "block";
    window.location.href = 'landing-page.html';
  });

proof.addEventListener("click", function(){
    keyboard.style.display = "block";
    proof.style.border= "1px solid #004d4d"
    just.style.border= "none"
    area = "proof";
})
just.addEventListener("click", function(){
  keyboard.style.display = "block";
  proof.style.border= "none"
  just.style.border= "1px solid #004d4d"
  area = "just";

})
done.addEventListener("click", function(){
  keyboard.style.display = "none";
    proof.style.border= "none"
    just.style.border= "none"
})

buttons.forEach(btn => {
    btn.addEventListener("click", function (){
      if (area == "proof") {
        proof.value += btn.innerText
        chars = proof.value.split('');
      } else {
        just.value += btn.innerText
        chars = just.value.split('');
      }
        
    })
})

checkAnswer.addEventListener("click", function(){
  let proofValue = proof.value;
  let justValue = just.value;
  currentStep++;
  getCorrectAnswer(problem,currentStep, function(stepNow, justifOfStep) {
    var submittedProof = proofValue.split(' ').join('');
    var submittedJust = justValue.split(' ').join('');
    
    if ((submittedProof === null || submittedProof.trim() === "") && (submittedJust === null || submittedJust.trim() === "")) {
      console.log('Both are null or empty');
      currentStep--;
    } else if (submittedProof === null || submittedProof.trim() === "") {
      console.log('Proof is null or empty');
      currentStep--;
    } else if (submittedJust === null || submittedJust.trim() === "") {
      console.log('Justification is null or empty');
      currentStep--;
    } else {
      console.log('Both have values');
      console.log(proofValue, justValue);
      console.log(stepNow, justifOfStep);

       if (compareAns(proofValue,stepNow) && compareAns(justValue,justifOfStep)) {
         console.log('Both values match the current step');
         proofSolution.innerHTML += `<br><h4>=${stepNow}<h4>`;
         justSolution.innerHTML+= `<br><h4>${justifOfStep}<h4>`;

         proof.value= "";
         just.value = "";
       } else if (compareAns(proofValue,stepNow)) {
        currentStep--;
         console.log('Proof matches the current step, but justification does not');
       } else if (compareAns(justValue,justifOfStep)) {
        currentStep--;
        console.log('Justification matches the current step, but proof does not');
       } else {
        currentStep--;
         console.log('Neither proof nor justification matches the current step');
       }
    }
  })
})

deleteBtn.addEventListener("click", () =>{
    chars.pop();
    if (area == "proof") {
      proof.value = chars.join('');
    } else {
      just.value = chars.join('');
    }
    
});

spaceBtn.addEventListener("click", () => {
    chars.push(' ');
    if (area == "proof") {
      proof.value = chars.join('');
    } else {
      just.value = chars.join('');
    }
});

showAnswers.addEventListener("click", () => {
  proofSolution.innerHTML ='';
  justSolution.innerHTML= '';

  problemContainer.innerHTML = `<h1>${problem}</h1>`;
  proving.style.display= "none";
  checkAnswer.style.display= "none";
  
  for (let n = 0; n < numberOfSteps; n++) {
    getAllAnswer(problem,n+1, function(proofAns, justAns){
      proofSolution.innerHTML += `<br><h4>= ${proofAns}<h4>`;
      justSolution.innerHTML+= `<br><h4>${justAns}<h4>`;
    })
  }
});

});

function getJustifications(problemId, callback) {
  // Reference to a specific problem by its ID
  var specificProblemRef = child(problemsRef, problemId);

  // Fetch the data for the specific problem using get function
  get(child(specificProblemRef, '/')).then((snapshot) => {
    if (snapshot.exists()) {
      // Declare 'justifications' within this block
      var justifications = snapshot.val().justifications;
      var steps = snapshot.val().steps;

      // Invoke the callback function with the justifications
      callback(justifications,steps);
    } else {
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });
}

function getCorrectAnswer(problemId,stepNumber ,callback ){

  var specificProblemRef = child(problemsRef, problemId)

  get(child(specificProblemRef,'/')).then((snapshot)=>{
    if(snapshot.exists()){
      const justifPropertyName = "step"+stepNumber+"justif";
      const stepReal = "step"+stepNumber;

      var stepNow = snapshot.val()[stepReal];
      var justifOfStep = snapshot.val()[justifPropertyName];

      callback(stepNow, justifOfStep);
    } else{
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });

}

function getAllAnswer(problemId,stepNumber, callback){
  var specificProblemRef = child(problemsRef, problemId)

  get(child(specificProblemRef,'/')).then((snapshot)=>{
    if(snapshot.exists()){
      const justifPropertyName = "step"+stepNumber+"justif";
      const stepReal = "step"+stepNumber;
      
      var proofAns = snapshot.val()[stepReal];
      var justAns = snapshot.val()[justifPropertyName];

      callback(proofAns,justAns);
    } else{
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });
}

function compareAns(str1,str2){
  const trimmed1 = str1.trim().toLowerCase();
  const trimmed2 = str2.trim().toLowerCase();

  return trimmed1 === trimmed2;
}
