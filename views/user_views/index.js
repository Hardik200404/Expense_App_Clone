function handle_signup(event){
    event.preventDefault()

    let user_details={
        username: event.target.username.value,
        email: event.target.email.value,
        password: event.target.password.value
    }
    fetch('http://13.201.73.46:3000/user/signup',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_details)
    }).then(response=>{
        console.log(response)
        if(response.status == 403){
            let dynamic_div = document.getElementById('dynamic')
            dynamic_div.innerHTML = "Error: User Already Exists, Error Code: " + response.status
        }else if(response.status == 201){
            window.location.href = "signin.html"
        }
    }).catch(err=>{
        console.log(err)
    })
}

function handle_signin(event){
    event.preventDefault()

    let user_details={
        email: event.target.email.value,
        password: event.target.password.value
    }

    let dynamic_div = document.getElementById('dynamic')

    fetch('http://13.201.73.46:3000/user/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_details)
    }).then(response=>{
        if(response.status==401){
            //wrong password
            dynamic_div.innerHTML = "Wrong Password, Error Code: " + response.status
        }else if(response.status==404){
            dynamic_div.innerHTML = "User Not Found, Error Code: " + response.status
        }else if(response.status==200){
            return response.json()
        }
    }).then(response=>{
        //dynamic_div.innerHTML = "Logged In Successfully"
        localStorage.setItem("token",response.token)
        window.location.href = "../expense_views/expense.html"
    }).catch(err=>{
        console.log(err)
    })
}

function handle_forgot_password(event){
    event.preventDefault()

    axios.post('http://13.201.73.46:3000/password/forgot-password',{
        email: event.target.email.value
    })
    .then(response=>{
        //console.log(response)
        alert('Reset Password Mail Sent')
    }).catch(err=>{
        console.log(err)
    })
}

function handle_reset_password(event){
    event.preventDefault()

    if(event.target.new_password.value!=event.target.confirm_password.value){
        return alert('Password Did Not Match')
    }

    axios.post('http://13.201.73.46:3000/password/reset-new-password',{
        userId: event.target.userId.value,
        new_password: event.target.new_password.value
    })
    .then(response=>{
        //console.log(response)
        alert('Password Reset Successful')
        let reset_div = document.getElementById('reset_div')
        reset_div.innerHTML = 'Password Updated Successfully'
    }).catch(err=>{
        console.log(err)
    })
}