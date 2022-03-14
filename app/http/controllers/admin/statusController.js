const Order = require('../../../models/order')

function statusController() {

    return {
        update_first(req,res) {
          
            Order.updateMany({_id: req.body.orderId}, { status: req.body.status},(err,data)=>{

                if (err) {
                    res.status(400).json({   error: err });
                   
                   
                }
                //Emit event

                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status:req.body.status})

                return res.redirect('/admin/orders')
            })
           
            
            
            
        },
        update_second(req,res) {
          
            
            Order.updateOne({_id: req.body.orderId}, { payment_status: req.body.payment_status}, (err,data)=>{

                if (err) {
                    res.status(400).json({   error: err });
                  
                   
                }

                 //Emit event

                 const eventEmitter = req.app.get('eventEmitter')
                 eventEmitter.emit('paymentUpdated', { id: req.body.orderId, payment_status: req.body.payment_status})
 
               
                    return res.redirect('/admin/orders')
                
            })
            
            
            
        }


    }
}

module.exports = statusController