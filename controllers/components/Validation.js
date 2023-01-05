//Validation email
function isEmail(email) {
    // var emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) { return true; }
    else{
        return false;
    }
}

const isPassword = (password)=>{
    var passwordFormat = /^[a-zA-Z0-9]{6,20}[!@#$%^&*?]{2,20}/
    if(password != "" && password.match(passwordFormat) ) return true
    else return false
}

module.exports = {
    isEmail,
    isPassword
}