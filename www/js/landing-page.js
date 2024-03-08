import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getDatabase, ref, set, get, child, push, remove, onValue} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
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
 const popup = document.querySelector(".popup");
 const problemNotFound = document.querySelector(".problemNotFound");
 const historyList = document.querySelector(".history-list")


document.addEventListener("DOMContentLoaded", function () {
    const sideBar = document.querySelector(".side-bar");
    const menuBtn = document.querySelector(".menu-btn");
    const closeBtn = document.querySelector(".close");
    const keyboard = document.querySelector(".keyboard-container");
    const textArea =document.querySelector(".text-area");
    const done =document.querySelector(".done");
    const checkBtn = document.querySelector(".check-btn");
    const continueBtn = document.querySelector(".continue");
    const edit = document.querySelector(".edit");
    const historyBtn = document.querySelector(".historyBtn");
    const history = document.querySelector(".history-tab");
    const closeHistory = document.querySelector(".close-history");
    const helpBtn = document.querySelector(".help-btn");
    const help = document.querySelector(".help-tab");
    const closeHelp = document.querySelector(".close-help");
    const lessonBtn = document.querySelector(".lesson-btn");
    const lesson = document.querySelector(".lesson-tab");
    const closeLesson = document.querySelector(".close-lesson");
    const logo =  document.querySelector(".logo");
    
    const buttons = document.querySelectorAll(".btn");
    const deleteBtn = document.querySelector(".delete");
    const spaceBtn = document.querySelector(".space");

    var inputProblem = document.getElementById('input');

    let chars = [];
    var problem;
    const userUID = localStorage.getItem('userUID');

    fetchHistory(userUID);

checkBtn.addEventListener("click", function(){
    keyboard.style.bottom = "-300px";
    problem = inputProblem.value;

    localStorage.setItem('problem',problem);
    getProblemData(problem);
})
continueBtn.addEventListener("click", function () {
  if (problem) { // Check if the problem variable has a value
    pushHistory(userUID, problem);
    window.location.href = 'proving.html';
} else {
    console.log("No problem value available.");
}
});
edit.addEventListener("click", function () {
  problemNotFound.style.visibility="hidden";
});

historyBtn.addEventListener("click", function () {
  history.style.bottom="0";
});
closeHistory.addEventListener("click", function () {
  history.style.bottom="-1000px";
});

helpBtn.addEventListener("click", function () {
  help.style.right="0";
});
closeHelp.addEventListener("click", function () {
  help.style.right="-1000px";
});

lessonBtn.addEventListener("click", function () {
  lesson.style.right="0";
});
closeLesson.addEventListener("click", function () {
  lesson.style.right="-1000px";
});


    // Open side-bar when clicking the menu button
    menuBtn.addEventListener("click", function () {
        sideBar.style.left = "0";
        menuBtn.style.display="none";
        getUsernameByUID(userUID)
        .then((userData) => {
          // Use the retrieved user data here
          if (userData) {
              const username = userData.username;
              logo.innerHTML = `<h1>Hi ${username}!</h1>`
          }
      })
      .catch((error) => {
          // Handle errors if needed
      });
    });

    // Close side-bar when clicking the close button
    closeBtn.addEventListener("click", function () {
        sideBar.style.left = "-1000px";
        setTimeout(function () {
            menuBtn.style.display = "";
        }, 500);
    });

    textArea.addEventListener("click", function(){
        keyboard.style.bottom = "0"
    })
    done.addEventListener("click", function(){
        keyboard.style.bottom = "-300px";
    })

    buttons.forEach(btn => {
        btn.addEventListener("click", function (){
            textArea.value += btn.innerText
            chars = textArea.value.split('');
        })
    });

    deleteBtn.addEventListener("click", () =>{
        chars.pop();
        textArea.value = chars.join('');
    });

    spaceBtn.addEventListener("click", () => {
        chars.push(' ');
        textArea.value = chars.join('');
    });

});

function getProblemData(problemId) {
  // Reference to a specific problem by its ID
  var specificProblemRef = child(problemsRef, problemId);

  // Fetch the data for the specific problem using get function
  get(child(specificProblemRef, '/')).then((snapshot) => {
    if (snapshot.exists()) {
      console.log('Problem Data:', snapshot.val());
      popup.style.visibility="visible";
    } else {
      problemNotFound.style.visibility="visible";
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });
}

function getUsernameByUID(userUID) {
  const userRef = ref(database, 'users/' + userUID);

  return get(userRef)
      .then((snapshot) => {
          if (snapshot.exists()) {
              // User data exists, you can access it using snapshot.val()
              const userData = snapshot.val();
              console.log('User Data:', userData);

              return userData; // Return the user data if needed
          } else {
              console.log('User data not found.');
              return null; // Return null or handle accordingly if data doesn't exist
          }
      })
      .catch((error) => {
          console.error('Error fetching user data:', error);
          throw error; // Propagate the error for handling elsewhere if needed
      });
}

function pushHistory(userUID, problem) {
  const userHistoryRef = ref(database, `users/${userUID}/history`);

  // Fetch the existing entries in the user's history
  get(userHistoryRef).then((snapshot) => {
    if (snapshot.exists()) {
      const historyData = snapshot.val();

      // Iterate over existing entries to check for the same value
      Object.entries(historyData).forEach(([key, value]) => {
        if (value === problem) {
          // Problem already exists, remove the previous entry
          remove(child(userHistoryRef, key)).then(() => {
            console.log('Previous entry removed.');
          }).catch((error) => {
            console.error('Error removing previous entry:', error);
          });
        }
      });
    }

    // Add the new entry to the user's history
     push(userHistoryRef, problem).then(() => {
       console.log('New entry added to history.');
     }).catch((error) => {
       console.error('Error adding new entry to history:', error);
     });
  }).catch((error) => {
    console.error('Error fetching user history:', error);
  });
}



function fetchHistory(userUID){
  const userHistoryRef = ref(database, `users/${userUID}/history`);
  
  onValue(userHistoryRef, function(snapshot) {
    if (snapshot.exists()) {
        let historyArray = Object.entries(snapshot.val())
    
        clearHistoryList();
        
        for (let i = 0; i < historyArray.length; i++) {
            let currentItem = historyArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendHistoryToList(currentItem);
        }    
    } else {
        historyList.innerHTML = "No items here... yet"
    }
  })
}

function clearHistoryList(){
  historyList.innerHTML="";
}
function appendHistoryToList(item) {
  let itemID = item[0];
  let itemValue = item[1];
    
  let newEl = document.createElement("li");
    
  newEl.textContent = itemValue;
  historyList.append(newEl);
}
