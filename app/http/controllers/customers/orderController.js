
const Order = require('../../../models/order');
const moment = require('moment');
const order = require('../../../models/order');


function orderController () {

    return{

        store(req,res) {

            //validate request
        //console.log(req.body)
          const {phone, address} = req.body

            if (!phone || !address ) {

               
               req.flash('error', 'All fields are required')
               return res.redirect('/cart')
            }


            const order = new Order ({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address
            })

           /* order.save().then((order) => {

              req.flash('success','Order placed successfully')
              return res.redirect('/home')
            }).catch( err => {
                req.flash('error','something went wrong')
                return res.redirect('/cart')
            })*/
            order.save().then(result => {
                //Login

                Order.populate(result, { path: 'customerId '}, (err, placedOrder) => {

                
                  //req.flash('success','Order placed successfully')
                  delete req.session.cart
                  //Emit
  
                  const eventEmitter = req.app.get('eventEmitter')
                  eventEmitter.emit('orderPlaced',placedOrder)

                  return res.json({ message : 'Order placed successfully'})
  
                  //return res.redirect('/customers/orders')
                })
               
              }).catch( (err) => {
                res.status(400).json({   error: err });
                return res.redirect('/cart')
              })
              
          
            

        },
        async index(req,res){
           const orders = await Order.find({ customerId:req.user._id}, null, { sort: { 'createdAt': -1}})
           res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,post-check=0, pre-check=0')

           res.render('customers/orders', { orders:orders, moment:moment})
         
        },

       async show(req,res){
          const order = await Order.findById(req.params.id)
          // Authorize User

          if (req.user._id.toString()  === order.customerId.toString()) {
           return res.render('customers/singleOrder', {order: order})
          }else{

            return res.redirect('/home')
          }
        }
    }
}

module.exports = orderController