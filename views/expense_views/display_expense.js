let current_page = 1 // default page
let items_per_page = 10 // default number of records per page

document.addEventListener('DOMContentLoaded', () => {
    //on windows load
    let token = localStorage.getItem('token')

    //set items_per_page in localStorage
    localStorage.setItem('items_per_page', items_per_page)
    
    //fetch all expenses
    fetch_expenses(current_page, items_per_page)

    //check if premium
    fetch('http://13.201.73.46:3000/user/check-premium',{
        method: 'GET',
        contentType: 'application/json',
        headers: {"Authorization": token}
    }).then(response=>{
        if(response.status==200){
            return response.json()
        }
    }).then(response=>{
        //display username
        let name_h = document.createElement('h6')
        name_h.innerHTML = 'Welcome '+response.username
        let body_tag = document.getElementsByTagName('body')
        body_tag[0].prepend(name_h)

        //remove or add preimum button based on is_premium
        if(response.is_premium){
            let premium_btn = document.getElementById('premium_btn')
            if(premium_btn){
                premium_btn.remove()
            }
            //show the user is premium
            let preimum_p = document.createElement('h6')
            preimum_p.innerHTML = 'You Are A Premium User '+ String.fromCodePoint(0x26A1)
            body_tag[0].prepend(preimum_p)

            //show leaderboard feature
            let leaderboard_btn = document.createElement('button')
            leaderboard_btn.id = 'leaderboard_btn'
            leaderboard_btn.innerHTML = 'Show Leaderboard'
            leaderboard_btn.setAttribute('onclick','show_leaderboard(event)')
            body_tag[0].append(leaderboard_btn)

            //show expenses and income chart
            let income_expense_chart_btn = document.createElement('button')
            income_expense_chart_btn.id = 'income_expense_chart_btn'
            income_expense_chart_btn.innerHTML = 'Show Income/Expense Chart'
            income_expense_chart_btn.setAttribute('onclick','show_income_expense_chart(event)')
            body_tag[0].append(income_expense_chart_btn)

        }else{
            let premium_btn = document.createElement('button')
            premium_btn.id = 'premium_btn'
            premium_btn.innerHTML = 'Buy Premium Membership'
            premium_btn.setAttribute('onclick','buy_premium(event)')
            body_tag[0].append(premium_btn)
        }
    }).catch(err=>{
        console.log(err)
    })

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (current_page > 1) {
            current_page--
            fetch_expenses(current_page, items_per_page)
        }
    })

    document.getElementById('next-btn').addEventListener('click', () => {
        current_page++
        fetch_expenses(current_page, items_per_page)
    })

    document.getElementById('items-per-page').addEventListener('change', (event) => {
        //set items per page in localStorage
        localStorage.setItem('items_per_page', parseInt(event.target.value))
        items_per_page = localStorage.getItem('items_per_page')
        current_page = 1  // Reset to the first page
        fetch_expenses(current_page, items_per_page)
    })
})

function fetch_expenses(page, limit) {
    fetch(`http://13.201.73.46:3000/expense/get-expenses-paginated?page=${page}&limit=${limit}`,{
        method: 'GET',
        contentType: 'application/json',
        headers: {'Authorization': localStorage.getItem('token')}
    })
        .then(response => response.json())
        .then(data => {
            display_expenses(data.data)
            update_pagination(data.total_pages, data.current_page)
        })
        .catch(error => console.error('Error fetching expenses:', error))
}

function handle_submit(event){
    event.preventDefault()
    
    const expense_details={
        expense_cost: event.target.expense_cost.value,
        description: event.target.description.value,
        category: event.target.category.value,
        userId: localStorage.getItem('token')
    }

    fetch('http://13.201.73.46:3000/expense/add-expense',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(expense_details),
    }).then((response) => {
        if(response.ok){
            return response.json()
        }else{
            throw new Error('Error submitting the form')
        }
    })
    .then((result) => {
        alert('New Expense Added')
        fetch_expenses(current_page, items_per_page)
    })
    .catch((err) => console.log(err))
    
    // Clearing the input fields
    document.getElementById('expense_cost').value = ''
    document.getElementById('description').value = ''
    document.getElementById('category').value = ''
}

function display_expenses(expenses) {
    const tbody = document.querySelector('#expense-table tbody')
    tbody.innerHTML = ''

    expenses.forEach(expense => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${expense.created_at}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${expense.expense_cost}</td>
            <td>
                <button class="edit-btn" data-id="${expense.id}">Edit</button>
                <button class="delete-btn" data-id="${expense.id}">Delete</button>
            </td>
        `
        tbody.appendChild(row)
    })

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id')
            edit_expense(id)
        })
    })

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id')
            delete_expense(id)
        })
    })
}

function update_pagination(total_pages, current_page) {
    document.getElementById('page-info').textContent = `Page ${current_page} of ${total_pages}`
    
    document.getElementById('prev-btn').classList.toggle('disabled', current_page === 1)
    document.getElementById('next-btn').classList.toggle('disabled', current_page === total_pages)
}


function edit_expense(id){
    //console.log('Edit expense with ID:', id)
}

function delete_expense(id) {
    //console.log('Delete expense with ID:', id)
    fetch(`http://13.201.73.46:3000/expense/delete-expense/${id}`, {
        method: 'DELETE',
        headers: {'Authorization': localStorage.getItem('token')}
    })
    .then(response => {
        alert('Expense Deleted Successfully')
        fetch_expenses(current_page, items_per_page)
    })
    .catch(error => console.error('Error deleting expense:', error))
}
