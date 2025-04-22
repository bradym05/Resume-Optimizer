const fileUploadURL = "https://server-resume-optimizer.onrender.com/uploadfile/"; // Request URL for my server
const fileMIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // MIME for docx files
const minJobDescriptionLength = 100; // Minimum character count for job description input

// Site elements
var fileButtonElement = document.getElementById("resume-file");
var submitButtonElement = document.getElementById("file-submit");
var jobDescriptionElement = document.getElementById("job-description");

/*********** Upload Resume to Server **********/

function onSubmit() {
    // Validate file exists and file type is docx
    let resume = fileButtonElement.files[0];
    if (!resume || (!resume.type.match(fileMIME))){
        alert("Please upload a valid resume file (.docx)");
        return;
    }
    // Validate job description exists
    let jobDescription = jobDescriptionElement.value;
    console.log(jobDescription.length)
    if (jobDescription.length < minJobDescriptionLength){
        alert("Please paste at least 100 characters from the job posting you are applying to");
        return;
    }
    // Create data
    let formData = new FormData();
    formData.append('file', resume);
    formData.append('job_description', jobDescription)
    // Send post request
    fetch(fileUploadURL, {
        method: 'POST',
        mode: 'cors',
        body: formData
    }).then(data => {
        console.log('Success:', data)
    }).catch(error => {
        console.log('Error:', error)
    });
}

// Listen for click
submitButtonElement.addEventListener("click", onSubmit)