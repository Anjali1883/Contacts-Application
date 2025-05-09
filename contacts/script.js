//document.addEventListener("DOMContentLoaded", () => {

    import {getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc} from " [gstatic link of your project] "

    const db= getFirestore();
    const dbRef= collection(db, "contacts");


//------------------------------------------------//
//                 MOBILE VIEW                    //
//------------------------------------------------//

const leftCol= document.getElementById("left-col");
const backBtn= document.getElementById("back-btn");

backBtn.addEventListener("click", e => {
    leftCol.style.display= "block";
    rightCol.style.display= "none";
});

const toggleLeftAndRightViewsOnMobile= () =>{
    if(document.body.clientWidth <= 600){
        leftCol.style.display= "none";
        rightCol.style.display= "block";
    }
}


//------------------------------------------------//
//                  GET DATA                      //
//------------------------------------------------//
    let contacts = [];


    const getContacts= async () =>{
        try{
           //const docSnap = await getDocs(dbRef); //docSnap is an array object
           await onSnapshot(dbRef, docsSnap =>{

                contacts= [];

                docsSnap.forEach((doc)=>{
                        const contact = doc.data();
                        contact.id= doc.id;
                        contacts.push(contact);

                    // console.log(doc.data());
                    // console.log(doc.id);

                });

                //console.log(contacts);
                showContacts(contacts);
           });
           

        }catch (err) {
            console.log("getContacts= " + err);
        }
        
    }

getContacts();

//------------------------------------------------//
//              SHOW CONTACTS                     //
//------------------------------------------------//

const contactList= document.getElementById("contact-list");


    const showContacts= (contacts) => {

         contactList.innerHTML= "";      
        contacts.forEach(contact => {
            const li= `
            <li class="contact-list-item" id="${contact.id}">
                    <div class="media">
                        <div class="two-letters">AB</div>
                    </div>
                    <div class="content">
                        <div class="title">
                            ${contact.firstname} ${contact.lastname}
                        </div>
                        <div class="subtitle">
                            ${contact.email}
                        </div>
                    </div>
                    <div class="action">
                        <button class="edit-user">Edit</button>
                        <button class="delete-user">Delete</button>
                    </div>
                </li>`;

                contactList.innerHTML +=li;
        })
    }


//------------------------------------------------//
//     CLICK CONTACT LIST UL ELEMENT              //    
//------------------------------------------------//
const contactListPressed = (event) =>{
    const id= event.target.closest("li").getAttribute("id");
    //console.log(id);

    if(event.target.className === "edit-user"){
        editButtonPressed(id);
    }
    else if(event.target.className === "delete-user"){
        deleteButtonPressed(id);
    }
    else{
        displayContactOnDetailsView(id);
        toggleLeftAndRightViewsOnMobile();
    }

}


contactList.addEventListener("click", contactListPressed);

//------------------------------------------------//
//               DELETE DATA                      //    
//------------------------------------------------//

const deleteButtonPressed = async (id) =>{

    const isConfirmed= confirm("Are you sure you want to delete data of selected user?");

    if(isConfirmed){
        try{
        
            const docRef= doc(db, "contacts", id);
            await deleteDoc(docRef);

        }catch(err){
            setErrorMessage("error", "Unable to add user data to the databse. Please try again!");
            console.log(error);
            showErrorMessages();
        }
    }    
}


//------------------------------------------------//
//              EDIT DATA                         //    
//------------------------------------------------//

const editButtonPressed = (id) =>{

    modalOverlay.style.display = "flex";

    const contact= getContact(id);

    firstName.value = contact.firstname;
    lastName.value = contact.lastname;
    age.value = contact.age;
    phone.value = contact.phone;
    email.value = contact.email; 

    modalOverlay.setAttribute("contact-id",contact.id);

}



//------------------------------------------------//
//    DISPLAY DETAILS VIEW ON LIST ITEM CLICK     //    
//------------------------------------------------//

//HELPER FUNCTION 

const rightCol= document.getElementById("right-col");


const getContact= (id) =>{
    return contacts.find(contact => {
        return contact.id === id;
    });
}

const displayContactOnDetailsView= (id) =>{
    const contact= getContact (id);
    console.log(contact);

    const rightColDetail= document.getElementById("right-col-detail");


    rightColDetail.innerHTML= `
    
        <div class="label">Name</div>
        <div class="data">${contact.firstname} ${contact.lastname}</div>            

        <div class="label">Age:</div>
        <div class="data">${contact.age}</div>

        <div class="label">Phone:</div>
        <div class="data">${contact.phone}</div>

        <div class="label">Email:</div>
        <div class="data">${contact.email}</div>
    `;

}


//------------------------------------------------//
//              MODAL                             //
//------------------------------------------------//

    const addBtn= document.querySelector(".add-btn");
    const modalOverlay= document.getElementById("modal-overlay");
    const closeBtn= document.querySelector(".close-btn");
    
    
    const addButtonPressed = () =>{
        modalOverlay.style.display= "flex";
        modalOverlay.removeAttribute("contact-id");
        firstName.value = "";
        lastName.value = "";
        age.value = "";
        phone.value = "";
        email.value = "";
    }

    const closeButtonPressed=() =>{
        modalOverlay.style.display= "none";
    }

    const hideModal= (e)=>{
        // console.log(e.target);           //gives the parent or child element
        // console.log(e.currentTarget);   //gives only parent element

        if(e instanceof Event){
            // when it is used as a callback function of the modal overlay click event
            if(e.target === e.currentTarget){   //checks whether user clicked outside the modal window
                modalOverlay.style.display="none";
            }
        }
        else{
            // calling the hideModal function directly wherever needed in this file
            modalOverlay.style.display="none";
        }
    }

    addBtn.addEventListener("click", addButtonPressed);
    closeBtn.addEventListener("click", closeButtonPressed);
    modalOverlay.addEventListener("click", hideModal)


//------------------------------------------------//
//          FORM VALIDATION & ADD DATA            //
//------------------------------------------------//


    const saveBtn= document.querySelector(".save-btn");
    //empty object
    const error= {};


    const firstName=document.getElementById("firstName"),
          lastName=document.getElementById("lastName"),
          age=document.getElementById("age"),
          phone=document.getElementById("phone"),
          email=document.getElementById("email");

    const saveButtonPressed= async () =>{
        checkRequired([firstName,lastName,age,phone,email]);
        checkEmail(email);
        checkInputLength(age, 2);
        checkInputLength(phone, 10);
        showErrorMessages();

        if(Object.keys(error).length === 0){

            if(modalOverlay.getAttribute("contact-id")){
                //update existing data

                const docRef= doc(db, "contacts", modalOverlay.getAttribute("contact-id"));
                try{

                    await updateDoc(docRef, {
                        firstname: firstName.value,
                        lastname: lastName.value,
                        age: age.value,
                        phone: phone.value,
                        email: email.value
                        
                    });

                    hideModal();

                }   catch(err){
                    setErrorMessage("error", "Unable to add user data to the databse. Please try again!");
                    console.log(error);
                    showErrorMessages();
                }
       
            }
            else{
                //add new data

                try{

                    await addDoc(dbRef, {
                        firstname: firstName.value,
                        lastname: lastName.value,
                        phone: phone.value,
                        age: age.value,
                        email: email.value
                        }
                    );

                    hideModal();

                }   catch(err){
                        setErrorMessage("error", "Unable to add user data to the databse. Please try again!");
                        console.log(error);
                        showErrorMessages();
                }

            }
    
        }
    }


    const checkInputLength = (input,  number) => {
        if(input.value.trim() !== ""){    
            if(input.value.trim().length === number){
                deleteErrorMessage(input);
            }
            else{
                setErrorMessage(input, input.id + " must be " + number + " digits");
            }
        }
    }


    const checkEmail= (input)=>{
        if(input.value.trim() !== ""){
            const re = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;            
            if(re.test(input.value.trim())){
                deleteErrorMessage(input);
            }
            else{
                setErrorMessage(input, input.id+" is invalid");
            }
        }
    }

    const setErrorMessage= (input, message) =>{
        if(input.nodeName === "INPUT"){
            error[input.id]= message;
            input.style.border= "2px solid red";
        }
        else{
            error[input]= message;
        }
        
    }



    const deleteErrorMessage= (input) =>{
        delete error[input.id];
        input.style.border= "2px solid green";
    }

    const checkRequired= (inputArray) =>{
        inputArray.forEach(input => {
            if(input.value.trim()===""){
                setErrorMessage(input, input.id + " is empty");   
            }
            else{
                deleteErrorMessage(input);
            }
        }
        );
        console.log(error);
    }

    const showErrorMessages= () =>{
        const errorlabel= document.getElementById("error-label");
        errorlabel.innerHTML="";
        for(const key in error){
            const li= document.createElement("li");
            li.innerText=error[key];
            li.style.color= "red";
            errorlabel.appendChild(li);
        }
    }

        saveBtn.addEventListener("click", saveButtonPressed);
//});