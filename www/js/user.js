import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getAuth, deleteUser, signOut } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';
import { getDatabase, ref as databaseRef, update, remove} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef, deleteObject } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js';

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
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', function () {
    var uid = localStorage.getItem('uid');
    var username = localStorage.getItem('username');
    var email = localStorage.getItem('email');
    var iconUrl = localStorage.getItem('iconUrl');

    var logoutBtn = document.getElementById('logout');
    var deleteBtn = document.getElementById('delete')

    document.querySelector('.username').textContent = username;
    document.querySelector('.email').textContent = email;

    let icon = document.getElementById('icon');
    icon.src = iconUrl;
    let inputFile = document.getElementById('inputFile');

    inputFile.addEventListener('change', function () {
        var file = inputFile.files[0];
        var fileStorageRef = storageRef(storage, 'images/' + uid + ('-icon'));

        var uploadTask = uploadBytes(fileStorageRef, file);

        uploadTask.then((snapshot) => {
            console.log('Uploaded a blob or file!');
            
            // Directly get the download URL from the snapshot
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                icon.src = downloadURL;

                // Update the iconUrl in the Realtime Database under users/{uid}
                var userDataRef = databaseRef(database, 'users/' + uid);
                update(userDataRef, { iconUrl: downloadURL });
                localStorage.setItem('iconUrl', downloadURL);

            }).catch((error) => {
                console.error('Error getting download URL:', error);
            });
        }).catch((error) => {
            console.error('Upload failed:', error);
        });
    });

    logoutBtn.addEventListener('click', function(){
        logout();
    })

    document.querySelectorAll('.subBtn').forEach(function(subBtn) {
        subBtn.addEventListener('click', function() {
            var subMenu = this.nextElementSibling; // Get the next sibling with class 'subMenu'
            subMenu.style.display = (subMenu.style.display === 'flex') ? 'none' : 'flex';
    
            var dropdownIcon = this.querySelector('.dropdown');
            dropdownIcon.classList.toggle('rotate');
    
            // Add or remove flex-grow style
            var subMenuList = subMenu.querySelector('ul');
            subMenuList.style.flexGrow = (subMenuList.style.flexGrow === '1') ? '0' : '1';
        });
    });

    deleteBtn.addEventListener('click',function(event){
        event.preventDefault();
        deleteAccount()
    })
        
});

function logout(){

    const user = auth.currentUser;

    if (user) {
    // If there's a signed-in user, sign them out
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log('User signed out');
        indexPage();

    }).catch((error) => {
        // An error happened.
        console.error('Error signing out:', error);
    });
    } else {
    // There's no user signed in
    console.log('No user is currently signed in');
    }
}

function indexPage() {

    window.location.href = 'index.html';
}

function deleteAccount() {
    const user = auth.currentUser;

    if (user) {
        deleteUser(user).then(() => {

            var userDataRef = databaseRef(database, 'users/' + user.uid );
            remove(userDataRef)
            .then(function () {

                const storageDataRef = storageRef(storage, 'images/' + user.uid + ('-icon'));
                deleteObject(storageDataRef).then(() => {
                console.log('User data removed from Storage Database.');

            }).catch((error) => {
                console.error('Error removing user data from Storage Database:', error);
            });
            })
            .catch(function (error) {
                console.error('Error removing user data from Realtime Database:', error);
            });
            
            indexPage();
            console.log('User account deleted');
            
          }).catch((error) => {
            console.error('Error account deleting:', error);
          });
      } else {
        // There's no user signed in
        console.log('No user is currently signed in');
      }
}
