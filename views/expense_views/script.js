function buy_premium(event){
    fetch('http://13.201.104.73:3000/user/purchase-premium',{
        method: 'GET',
        contentType: 'application/json',
        headers: {'Authorization': localStorage.getItem('token')}
    }).then(response=>{
        if(response.status==201){
            return response.json()
        }
    }).then(response=>{
        let options = {
            'key': response.key_id,
            'order_id': response.order.id,
            'handler': function(response){
                axios.post('http://13.201.104.73:3000/user/update-transaction-status',{
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id,
                },{headers: {'Authorization': localStorage.getItem('token')}
                })
                .then(result=>{
                    //console.log(result,'now premium')
                    alert("You are now a Premium User")
                    let premium_btn = document.getElementById('premium_btn')
                    premium_btn.remove()
                }).catch(err=>{
                    console.log(err)
                })
            }
        }

        let razor = new Razorpay(options)
        
        razor.open()
        event.preventDefault()
        razor.on('payment.failed',function(response){
            console.log("r",response)
        })
    })
    .catch(err=>{
        console.log(err)
    })
}

function show_leaderboard(event){
    event.preventDefault()
    let leaderboard_div = document.getElementById('leaderboard_div')
    let leaderboard_h = document.createElement('h4')
    leaderboard_h.innerHTML = 'Leaderboard'
    leaderboard_div.prepend(leaderboard_h)
    let leaderboard_btn = document.getElementById('leaderboard_btn')
    leaderboard_btn.remove()

    axios.get('http://13.201.104.73:3000/premium/leaderboard')
    .then(response=>{
        for(let user_expense of response.data){
            let list_item = document.createElement('li')
            if(user_expense.total_expenses){
                list_item.innerHTML = 'Name: '+user_expense.username+', Total Expenses: '+user_expense.total_expenses
            }else{
                list_item.innerHTML = 'Name: '+user_expense.username+', Total Expenses: '+0
            }
            let leaderboard_list = leaderboard_div.querySelector('ul')
            leaderboard_list.appendChild(list_item)
        }
    }).catch(err=>{
        console.log(err)
    })
}

function show_income_expense_chart(event){
    event.preventDefault()
    
    let income_expense_chart_btn = document.getElementById('income_expense_chart_btn')
    income_expense_chart_btn.remove()
    
    window.open('income_expense_chart.html', '_blank')
}