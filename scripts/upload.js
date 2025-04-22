const fileUploadURL = "https://server-resume-optimizer.onrender.com/uploadfile/"; // Request URL for my server
const fileMIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // MIME for docx files

// Site elements
var fileButtonElement = document.getElementById("resume-file");
var submitButtonElement = document.getElementById("file-submit");

/*********** Upload Resume to Server **********/

function onSubmit() {
    let resume = fileButtonElement.files[0];
    // Validate file exists and file type is docx
    if (!resume || (!resume.type.match(fileMIME))){
        alert("Please upload a valid resume file (.docx)");
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