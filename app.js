const express = require('express')
const app = express()
const dotenv = require('dotenv');
dotenv.config()
const port = process.env.PORT
const axios = require('axios');
const responseTime = require('response-time');
const {promisify} = require('util');



app.use(responseTime());
// const client = redis.createClient({

//     host:'singapore-redis.render.com',
//     password:'red-cfahmc1gp3jsh6f8s98g',
//     port: 6379
// });
const Redis = require('ioredis');


const client = new Redis({
    host: 'redis-16499.c57.us-east-1-4.ec2.cloud.redislabs.com',
    port: 16499,
    password: 'pawitsahare'
});
const GET_AYNC = promisify(client.get).bind(client);
const SET_AYNC = promisify(client.set).bind(client);



app.get('/rocket',async (req,res,next) => {
    
    try {
        const reply = await GET_AYNC('rockets')
    if(reply) {
        console.log('Using cahe . ')
        res.send(JSON.parse(reply))
        return
    }
        const respone = await axios.get('https://api.spacexdata.com/v3/rockets');
        const saveR = await SET_AYNC('rockets', JSON.stringify(respone.data), 'EX',60);
        console.log('New data Cache #', saveR);
        res.send(respone.data);
    } catch (error) {
        res.send(error.message)
    }
});
app.get('/rocket/:rocket_id', async (req,res,next) => {
    try {
        
        const reply = await GET_AYNC(req.params.rocket_id)
    if(reply) {
        console.log('Using cahe . ')
        res.send(JSON.parse(reply))
        return
    }
        const respone = await axios.get(`https://api.spacexdata.com/v3/rockets/${req.params.rocket_id}`);

        const saveR = await SET_AYNC(  req.params.rocket_id, JSON.stringify(respone.data), 'EX',60);
        console.log('New data Cache #', saveR);
        res.send(respone.data);
    } catch (error) {
        res.send(error.message)
    }
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
