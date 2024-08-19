let { get_leaderboard_service, upgrade_to_premium_service,
    check_premium_service, update_tsc_status_service
                        } = require('../services/premium_services')

let { verify_jwt_token } = require('../util/jwt')

async function get_leaderboard(req,res){
    let results = await get_leaderboard_service()
    if(results.error){
        res.status(500).send(JSON.stringify(results))
    }else{
        res.status(200).send(results)
    }
}

async function upgrade_to_premium(req,res){
    let userId = verify_jwt_token(req.headers.authorization)
    let response = await upgrade_to_premium_service(userId)

    if(response.error){
        res.status(500).send(JSON.stringify(response))
    }else{
        res.status(201).send(JSON.stringify(response))
    }
}

async function update_tsc_status(req,res){
    let userId = verify_jwt_token(req.headers.authorization)
    let response = await update_tsc_status_service(userId,req.body.payment_id,req.body.order_id)

    if(response.error){
        res.status(500).send(JSON.stringify(response))
    }else{
        res.status(201).send(JSON.stringify(response))
    }
}

async function check_premium(req,res){
    let userId = verify_jwt_token(req.headers.authorization)
    let response = await check_premium_service(userId)

    if(response.error){
        res.status(500).send(JSON.stringify(response))
    }else{
        res.status(200).send(JSON.stringify(response))
    }
}

module.exports = { 
    get_leaderboard, upgrade_to_premium, 
    update_tsc_status, check_premium
}