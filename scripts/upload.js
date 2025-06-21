import { Message } from "./messages.js";

// Constants
const requestURL = "https://server-resume-optimizer.onrender.com"
//const requestURL = "http://127.0.0.1:8000" // local server for testing
const fileUploadURL = `${requestURL}/uploadfile/`; // Request URL for my server
const optimizeURL = `${requestURL}/optimize/`; // Optimize URL for my server
const fileMIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // MIME for docx files
const maxFileSize = 2 * 10e5; // Maximum size (in bytes) for resume file
const minJobDescriptionLength = 100; // Minimum character count for job description input
const maxJobDescriptionLength = 2000; // Maximum character count for job description input

// Accessibility
const altText = { // Class name to alt text
    "resume-img": "a simple resume with the outline of a portrait in the corner",
    "server-img": "a simple illustration of 4 servers stacked ontop of eachother",
    "box-img": "an open cardboard box",
}

// Site elements
var fileHintElement = document.getElementById("file-hint")
var fileButtonElement = document.getElementById("resume-file");
var submitButtonElement = document.getElementById("file-submit");
var jobDescriptionElement = document.getElementById("job-description");
var characterCountElement = document.getElementById("character-count");
var uploadAnimationDivElement = document.getElementById("upload-animation");
var uploadAnimationElements = uploadAnimationDivElement.getElementsByClassName("animated");

// State
var processingRequest = false;

// Manipulated
var fileSubmitTextElement;

/*************** Job Description **************/

function updateCharacterCount() {
    // Update length
    characterCountElement.innerText = `${jobDescriptionElement.value.length}/${maxJobDescriptionLength}`;
}

// Input field attributes
jobDescriptionElement.setAttribute("minlength", minJobDescriptionLength);
jobDescriptionElement.setAttribute("maxlength", maxJobDescriptionLength);
jobDescriptionElement.setAttribute("placeholder", `Paste job description here (Maximum ${maxJobDescriptionLength} Characters)`);

// Update character count on key up
jobDescriptionElement.addEventListener("keyup", updateCharacterCount);
updateCharacterCount();

/**************** Upload Hint *****************/

function validateFile() {
    // Check for file
    let file = fileButtonElement.files[0];
    if (file){
        // Check file size
        if (file.size > maxFileSize) {
            new Message("File cannot exceed maximum size of 2mb", true);
            return false;
        }
        // Check file type
        if (!file.type.match(fileMIME)) {
            new Message("File type must be .docx", true);
            return false;
        }
        // Update upload hint
        fileHintElement.innerText = `${file.name}`;
        return true;
    }
    new Message("No file uploaded", true);
    return false;
}

fileButtonElement.addEventListener("change", validateFile)

/********** Process Optimized Resume **********/

function onOptimizeSucess(optimizeResponse) {
    // Convert response to json
    optimizeResponse.json().then(responseJson => {
        // Log json data for debugging purposes
        console.log(responseJson);
    }).catch(error => {
        // Log errors
        console.log('Error:', error)
    })
}

/************ Get Optimized Resume ************/

function onUploadSuccess(uploadResponse) {
    // Convert response to formData
    uploadResponse.json().then(responseFormData => {
            // Log json data for debugging purposes
            console.log(responseFormData);
            // Get resume UUID
            let resumeId = responseFormData.file_id;
            // Update submit text
            fileSubmitTextElement.innerHTML = 'Optimizing <p class="small-text">Analyzing your resume</p>';
            // Get results
            fetch(`${optimizeURL}${resumeId}`)
                .then(optimizeResponse => {
                    // Log success, invoke optimize callback
                    console.log('Success:', optimizeResponse)
                    onOptimizeSucess(optimizeResponse)
                }).catch(error => {
                    // Log errors
                    console.log('Error:', error)
                });
        }
    ).catch(error => {
        // Log errors
        console.log('Error:', error)
    })
}

/*********** Upload Resume to Server **********/

function playUploadAnimation(){
    // Show upload animation object
    uploadAnimationDivElement.style.opacity = "100";
    uploadAnimationDivElement.style.display = "flex";
    // Disable hover for form input buttons
    let formInputButtons = submitButtonElement.parentElement.querySelectorAll(".white-hover");
    Array.prototype.forEach.call(formInputButtons, function(buttonElement) {
        // Check if this is for the submit button
        if (buttonElement.htmlFor === "file-submit") {
            // Update submit text
            buttonElement.innerHTML = 'Processing <p class="small-text">Uploading your resume to the server</p>';
            // Update submit text variable
            fileSubmitTextElement = buttonElement;
        }
        buttonElement.classList.remove("white-hover");
        buttonElement.classList.add("disabled-input");
    })
    // Disable input buttons
    fileButtonElement.disabled = true;
    submitButtonElement.disabled = true;
    jobDescriptionElement.disabled = true;
    // Play animations
    for (let animationElement of uploadAnimationElements) {
        for (let animation of animationElement.getAnimations()) {
            animation.play();
        }
    }
}

function onSubmit() {
    // Check if request is processing already
    if (!processingRequest){
        // Validate resume file
        if (!validateFile()) {
            return false;
        }
        // Validate job description exists
        let jobDescription = jobDescriptionElement.value;
        if (jobDescription.length < minJobDescriptionLength){
            new Message("Paste at least 100 characters from the job posting", true);
            return;
        }
        processingRequest = true
        // Play upload animation
        playUploadAnimation();
        // Create data
        let formData = new FormData();
        formData.append('file', fileButtonElement.files[0]);
        formData.append('job_description', jobDescription);
        // Send post request
        fetch(fileUploadURL, {
            method: 'POST',
            mode: 'cors',
            body: formData
        }).then(uploadResponse => {
            // Log success, invoke upload callback
            console.log('Success:', uploadResponse)
            onUploadSuccess(uploadResponse)
        }).catch(error => {
            // Log errors
            console.log('Error:', error)
        });
    }
}

// Set file filter for upload button
fileButtonElement.setAttribute("accept", fileMIME);

// Listen for click
submitButtonElement.addEventListener("click", onSubmit);

/**************** Accessibility ***************/

for (let [className, text] of Object.entries(altText)) {
    let classElements = document.getElementsByClassName(className);
    for (let element of classElements) {
        element.setAttribute("alt", text)
    }
}