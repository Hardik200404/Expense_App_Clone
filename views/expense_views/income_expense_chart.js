document.addEventListener('DOMContentLoaded', () => {

    const style = document.createElement('style')
    style.innerHTML = `
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        
        th {
            background-color: #f2f2f2;
            text-align: left;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        tr:hover {
            background-color: #f1f1f1;
        }
    `;

    // Append the style element to the document head
    document.head.appendChild(style)

    let body_tag = document.getElementsByTagName('body')
    let table = document.createElement('table')
    let heading_row = document.createElement('tr')

    let date_heading = document.createElement('th')
    date_heading.innerHTML = 'Date'
    let description_heading = document.createElement('th')
    description_heading.innerHTML = 'Description'
    let category_heading = document.createElement('th')
    category_heading.innerHTML = 'Category'
    let income_heading = document.createElement('th')
    income_heading.innerHTML = 'Income'
    let expense_heading = document.createElement('th')
    expense_heading.innerHTML = 'Expense'

    heading_row.appendChild(date_heading)
    heading_row.appendChild(description_heading)
    heading_row.appendChild(category_heading)
    heading_row.appendChild(income_heading)
    heading_row.appendChild(expense_heading)

    table.appendChild(heading_row)

    axios.get('http://13.201.73.46:3000/expense/get-chart',{
        headers: {'Authorization': localStorage.getItem('token')}
    }).then(response=>{
        for(let record of response.data.db_res){
            let data_row = document.createElement('tr')

            let date = document.createElement('td')
            date.innerHTML = record.created_at
            let description = document.createElement('td')
            description.innerHTML = record.description
            let category = document.createElement('td')
            category.innerHTML = record.category
            let income = document.createElement('td')
            income.innerHTML = 0
            let expense = document.createElement('td')
            expense.innerHTML = record.expense_cost

            data_row.appendChild(date)
            data_row.appendChild(description)
            data_row.appendChild(category)
            data_row.appendChild(income)
            data_row.appendChild(expense)

            table.appendChild(data_row)
        }
        body_tag[0].appendChild(table)
        
        let download_btn = document.createElement('button')
        download_btn.id = 'download_btn'
        download_btn.type = 'button'
        download_btn.innerHTML = 'Download As CSV'
        download_btn.setAttribute('onclick','download_csv(event)')
        
        body_tag[0].appendChild(download_btn)
        
        let hidden_file_id = document.createElement('input')
        hidden_file_id.type = 'hidden'
        hidden_file_id.id = 'hidden-id'
        hidden_file_id.value = response.data.file_id

        body_tag[0].appendChild(hidden_file_id)

    }).catch(err=>{
        console.log(err)
    })
})

function download_csv(event){
    event.preventDefault()

    let file_id = document.getElementById('hidden-id').value

    axios.post('http://13.201.73.46:3000/expense/download-csv',
        {file_id: file_id},
        {headers: {'Authorization': localStorage.getItem('token')}
    }).then(response=>{
        if(response.status==200){
            let a = document.createElement('a')
            a.href = response.data.file_url
            a.download = 'My_Income_Expense.csv'
            a.click()
        }
    }).catch(err=>{
        console.log(err)
    })
}