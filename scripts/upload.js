import { Message } from "./messages.js";
import { InterpolateColor } from "./interpolateColor.js";

// Constants
const requestURL = "https://server-resume-optimizer.vercel.app";
//const requestURL = "http://127.0.0.1:8000"; // local server for testing
const fileUploadURL = `${requestURL}/uploadfile/`; // Request URL for my server
const optimizeURL = `${requestURL}/optimize/`; // Optimize URL for my server
const fileMIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // MIME for docx files
const maxFileSize = 2 * 10e5; // Maximum size (in bytes) for resume file
const requestDelay = 1500; // Minimum time between steps
const minJobDescriptionLength = 100; // Minimum character count for job description input
const maxJobDescriptionLength = 2000; // Maximum character count for job description input

// Accessibility
const altText = { // Class name to alt text
    "resume-img": "a simple resume with the outline of a portrait in the corner",
    "server-img": "a simple illustration of 4 servers stacked ontop of eachother",
    "box-img": "an open cardboard box",
};

// Site elements
var fileHintElement = document.getElementById("file-hint");
var fileButtonElement = document.getElementById("resume-file");
var submitButtonElement = document.getElementById("file-submit");
var jobDescriptionElement = document.getElementById("job-description");
var characterCountElement = document.getElementById("character-count");
var uploadAnimationDivElement = document.getElementById("upload-animation");
var analysisAnimationDivElement = document.getElementById("analysis-animation");

var feedbackSectionElement = document.getElementById("feedback");
var uploadFilesSectionElement = document.getElementById("upload-files");

var feedbackAtsPercentageElement = document.getElementById("ats-percentage");
var feedbackUnderusedTableElement = document.getElementById("underused-words");
var feedbackMatchPercentageElement = document.getElementById("match-percentage");
var feedbackFoundSectionTableElement = document.getElementById("found-sections");
var feedbackMissedSectionTableElement = document.getElementById("missed-sections");

// State
var processingRequest = false;

// Manipulated
var matchColor = new InterpolateColor('rgb(255, 100, 100)', 'rgb(100, 255, 100)');
var atsColor = new InterpolateColor('rgb(255, 100, 100)', 'rgb(100, 255, 100)');
var fileSubmitTextElement;

/**************** Animations ***************/

function playAnimation(divElement) {
    // Show animation object
    divElement.style.display = "flex";
    // Get elements
    let animationElements = divElement.getElementsByClassName("animated");
    // Play animations
    for (let animationElement of animationElements) {
        for (let animation of animationElement.getAnimations()) {
            animation.play();
        }
    }
}

function stopAnimation(divElement) {
    // Hide animation object
    divElement.style.display = "none";
    // Get elements
    let animationElements = divElement.getElementsByClassName("animated");
    // Stop animations
    for (let animationElement of animationElements) {
        for (let animation of animationElement.getAnimations()) {
            animation.cancel();
        }
    }
}

/******************* Utility ******************/

function createTableHTML(dict, valueSymbol) {
    // Initialize HTML for table body
    let tableHTML = "<tbody>\n";
    // Iterate over underused words
    for (let key in dict) {
        // Create row
        tableHTML += `
            <tr>
                <td class="table-left">${key}</td>
                <td class="table-right">${valueSymbol}${dict[key]}</td>
            </tr>\n`
    }
    // Close table body
    tableHTML += "\n</tbody>";
    // Return final table
    return tableHTML;
}

function toggleSubmit(enabled) {
    // Toggle hover for form input buttons
    let formInputButtons = submitButtonElement.parentElement.querySelectorAll(".white-hover");
    Array.prototype.forEach.call(formInputButtons, function(buttonElement) {
        // Check if this is for the submit button
        if (buttonElement.htmlFor === "file-submit") {
            // Update submit text variable
            fileSubmitTextElement = buttonElement;
        }
        // Check toggle
        if (enabled === true) {
            buttonElement.classList.add("white-hover");
            buttonElement.classList.remove("disabled-input");
        } else {
            buttonElement.classList.remove("white-hover");
            buttonElement.classList.add("disabled-input");
        }
    })
    // Update input buttons
    fileButtonElement.disabled = !enabled;
    submitButtonElement.disabled = !enabled;
    jobDescriptionElement.disabled = !enabled;
}

function delayInvoke(timeStarted, callback, ...args) {
    // Get elapsed time
    let elapsed = Date.now() - timeStarted;
    // Check if minimum delay has passed
    if (elapsed >= requestDelay) {
        // Invoke callback
        callback(...args);
    } else {
        setTimeout(() => {callback(...args);}, requestDelay - elapsed);
    }
}

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

function displayResults(matchPercentage, underused, parsingResults) {
    // Calculate ATS percentage
    let atsPercentage = parsingResults.parsing_score/parsingResults.max_score;

    // Initialize match percentage text
    let matchPercentageText = `Description Match: ${Math.round(matchPercentage * 100)}%`;
    let atsPercentageText = `ATS Readability: ${Math.round(atsPercentage * 100)}%`;
    // Update match color
    matchColor.update(matchPercentage);
    atsColor.update(atsPercentage)

    // Create underused words table HTML
    feedbackUnderusedTableElement.innerHTML += createTableHTML(underused, "+");
    feedbackUnderusedTableElement.innerHTML += `<p class="small-text">Increase means how many MORE times you should add the word</p>`;

    // Mapping function to create table from section
    let convertToSectionsTable = (element, valueSymbol, sectionsJSON) => {
        let sectionDict = {};
        let total = 0;
        for (let sectionName in sectionsJSON) {
            // Get nested dict
            let nestedDict = sectionsJSON[sectionName];
            // Initialize identifiers
            let identifiers = ""
            for (let id of nestedDict.identifiers) {
                // Capitalize, add comma
                identifiers += id.charAt(0).toUpperCase() + id.slice(1) + " / ";
            }
            total += nestedDict.value;
            sectionDict[identifiers] = nestedDict.value;
        }
        // Check if total is > 0 
        if (total > 0) {
            // Set inner HTML
            element.innerHTML += createTableHTML(sectionDict, valueSymbol);
            element.innerHTML += `\n<p class="small-text">Total: ${valueSymbol}${total}</p>`
        } else {
            // Hide table
            element.style.display = "none";
        }
    };
    // Update HTML of section tables
    convertToSectionsTable(feedbackMissedSectionTableElement, "-", parsingResults.missed_sections);
    convertToSectionsTable(feedbackFoundSectionTableElement, "+", parsingResults.found_sections);

    // Set match percentage
    feedbackMatchPercentageElement.innerText = matchPercentageText;
    feedbackMatchPercentageElement.style.color = matchColor.currentColor;
    // Set ATS percentage
    feedbackAtsPercentageElement.innerText = atsPercentageText;
    feedbackAtsPercentageElement.style.color = atsColor.currentColor;
    // Show feedback section
    feedbackSectionElement.style.width = "75%";
    feedbackSectionElement.style.visibility = "visible";
    // Hide upload section
    uploadFilesSectionElement.style.display = "none";
}

function onOptimizeSucess(optimizeResponse) {    
    // Convert response to json
    optimizeResponse.json().then(responseJson => {
        // Log json data for debugging purposes
        console.log(responseJson);
        // Update submit text
        fileSubmitTextElement.innerHTML = 'Finished <p class="small-text">Your resume is ready</p>';
        // Stop analysis animation
        stopAnimation(analysisAnimationDivElement);
        // Get raw data from response
        let matchPercentage = responseJson.match_percentage;
        let underused = responseJson.underused;
        let parsingResults = responseJson.parsing_results;
        // Display results
        displayResults(matchPercentage, underused, parsingResults);
    }).catch(error => {
        // Log errors
        console.log('Error:', error);
    })
}



/************ Get Optimized Resume ************/

function onUploadSuccess(uploadResponse) {
    // Convert response to formData
    uploadResponse.json().then(responseJson => {
        // Log json data for debugging purposes
        console.log(responseJson);
        // Get resume UUID
        let resumeId = responseJson.file_id;
        // Update submit text
        fileSubmitTextElement.innerHTML = 'Optimizing <p class="small-text">Analyzing your resume</p>';
        // Stop upload animation, play analysis animation
        stopAnimation(uploadAnimationDivElement);
        playAnimation(analysisAnimationDivElement);
        // Record time
        let timeStart = Date.now();
        // Get results
        fetch(`${optimizeURL}${resumeId}`)
            .then(optimizeResponse => {
                // Log success, invoke optimize callback
                console.log('Success:', optimizeResponse)
                delayInvoke(timeStart, onOptimizeSucess, optimizeResponse);
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
        processingRequest = true;
        // Disable form submission
        toggleSubmit(false);
        // Update submit text
        fileSubmitTextElement.innerHTML = 'Processing <p class="small-text">Uploading your resume to the server</p>';
        // Play upload animation
        playAnimation(uploadAnimationDivElement);
        // Create data
        let formData = new FormData();
        formData.append('file', fileButtonElement.files[0]);
        formData.append('job_description', jobDescription);
        // Record time
        let timeStart = Date.now();
        // Send post request
        fetch(fileUploadURL, {
            method: 'POST',
            mode: 'cors',
            body: formData
        }).then(uploadResponse => {
            // Log success, invoke upload callback
            console.log('Success:', uploadResponse);
            delayInvoke(timeStart, onUploadSuccess, uploadResponse);
        }).catch(error => {
            // Log errors
            console.log('Error:', error);
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

