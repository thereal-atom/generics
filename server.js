if(process.env.NODE_ENV !== 'production') require('dotenv').config();
const stripeSecret = process.env.STRIPE_SECRET;
const stripePublic = process.env.STRIPE_PUBLIC;

const express = require("express");
const app = express();
const fs = require('fs')
const stripe = require('stripe')(stripeSecret)

app.set('viewengine', 'ejs');
app.use(express.json())
app.use(express.static('public'));

app.get('/store', (req, res) => {
    fs.readFile('./public/items.json', (err, data) => {
        if(err){
            console.log(err)
            res.status(500).end()
        }else{
            res.render('store.ejs', {
                items: JSON.parse(data),
                stripePublic: stripePublic,
            })
        }
    })
})
app.post('/purchase', (req, res) => {
    fs.readFile('./public/items.json', (error, data) => {
        if (error) {
            res.status(500).end()
          } else {
            const itemsJson = JSON.parse(data)
            const itemsArray = itemsJson.music.concat(itemsJson.merch)
            let total = 0
            req.body.items.forEach(function(item) {
              const itemJson = itemsArray.find(function(i) {
                return i.id == item.id
              })
              total = total + itemJson.price * item.quantity
            })
      
            stripe.charges.create({
              amount: total,
              source: req.body.stripeTokenId,
              currency: 'usd'
            }).then(function() {
              console.log('Charge Successful')
              res.json({ message: 'Successfully purchased items' })
            }).catch(function() {
              console.log('Charge Fail')
              res.status(500).end()
            })
          }
    })
})

app.listen(3000)
console.log('Listening on port 3000')