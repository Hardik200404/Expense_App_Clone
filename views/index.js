function handle_signup(event){
    event.preventDefault()

    let user_details={
        username: event.target.username.value,
        email: event.target.email.value,
        password: event.target.password.value
    }
    fetch('http://localhost:3000/user/signup',{
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

    fetch('http://localhost:3000/user/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_details)
    }).then(response=>{
        let dynamic_div = document.getElementById('dynamic')
        if(response.status==401){
            //wrong password
            dynamic_div.innerHTML = "Wrong Password, Error Code: " + response.status
        }else if(response.status==404){
            dynamic_div.innerHTML = "User Not Found, Error Code: " + response.status
        }else if(response.status==200){
            dynamic_div.innerHTML = "Logged In Successfully"
        }
    }).catch(err=>{
        console.log(err)
    })
}