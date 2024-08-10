const user_model = require('../models/user_model')
const forgot_password_req_model = require('../models/forgot_password_req_model')
const sequelize = require('../util/database')

const Sib = require('sib-api-v3-sdk')
const { v4: uuidv4 } = require('uuid')

require('dotenv').config()

async function signup_service(user){
    try{
        await sequelize.transaction(async(t) => {
            await user_model.create(user)
        })
        return {message: 'User Registered Successfully'}
    }catch(err){
        console.log(err)
        return {error:err}
        
    }
}

async function login_service(user){
    try{
        let db_res = await user_model.findOne({where: { email: user.email}})
        return db_res
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

async function forgot_password_service(email){
    
    //generate uuid for forgot password req
    let uuid = uuidv4()

    //configure email
    const client = Sib.ApiClient.instance
    const api_key_obj = client.authentications['api-key']
    api_key_obj.apiKey = process.env.SIB_API_KEY
    
    const sender = {
        email: process.env.EMAIL,
        name: 'Hardik'
    }
    const receivers = [
        {
            email: email
        }
    ]

    //using the email , find the user, get their userId, then 
    //store the record in forgot_password_req in db
    try{
        //start a transaction
        await sequelize.transaction(async(t) => {
            let user = await user_model.findOne({where:{
                email: email
            }})
            forgot_password_req_model.create({
                id: uuid,
                userId: user.dataValues.id,
            })
        })  

        const email_api = new Sib.TransactionalEmailsApi()
        await email_api.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset Password',
            htmlContent: `<a href='http://13.201.73.46:3000/password/reset-password/${uuid}'>Click Here To Reset Password</a>`
        })
        return {message: 'Email Sent'}
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

async function reset_password_service(uuid){
    //check with forgot_password_req if the uuid exists or not
    try{
        let record = await forgot_password_req_model.findByPk(uuid)
        return record
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

async function reset_new_password_service(new_password, userId){
    try{
        await sequelize.transaction(async(t) => {
            await user_model.update(
                {password: new_password},
                {where: {id: userId}, transaction: t}
            )
            await forgot_password_req_model.update(
                {is_active: false},
                {where: {userId: userId}, transaction: t}
            )
        })
        return {message: 'Password Updated Successfully'}
    }catch(err){
        console.log(err)
        return {error: err}
    }
}

module.exports = { 
    signup_service, login_service, forgot_password_service,
    reset_password_service, reset_new_password_service
}