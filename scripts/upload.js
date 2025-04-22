// Request URL for my server
const fileUploadURL = "https://server-resume-optimizer.onrender.com/uploadfile/"

// Site elements
var fileButtonElement = document.getElementById("resume-file");
var submitButtonElement = document.getElementById("file-submit");

/*********** Upload Resume to Server **********/

function onSubmit() {
    // Check for a file
    let resume = fileButtonElement.files[0];
    if (!resume){
        alert("Please upload a valid resume file (docx or pdf)");
        return;
    }
    // Create data
    let formData = new FormData();
    formData.append('file', resume);
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