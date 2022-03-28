import axios from 'axios';
import noty from 'noty';
import  initAdmin  from './admin'
import moment from 'moment'
import { connect } from 'mongoose';
import { initStripe } from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')


function updateCart(pizza){

  axios.post('/update-cart' , pizza).then(res => {
    cartCounter.innerText = res.data.totalQty

    new noty ({
        type: 'success',
        timeout: 1000,
         text: 'Item added to cart',
         progressBar:false
    }).show();

  }).catch(err => {
    new noty ({
        type: 'error',
        timeout: 2000,
         text: 'Something went wrong',
         progressBar:false
    }).show();

  })

}


addToCart.forEach((btn) =>{
   btn.addEventListener('click',(e) => {

      let pizza = JSON.parse(btn.dataset.pizza);
      updateCart(pizza)
      

   })

})

// Remove alert message after X seconds

const alertMsg = document.querySelector('#success-alert')

if (alertMsg) {

  setTimeout(() => {
    alertMsg.remove()
  }, 2000)
  
}



// Chnage order status
let statuses  =  document.querySelectorAll('.status_line')

let hiddenInput = document.querySelector('#hiddenInput')

let order = hiddenInput ? hiddenInput.value : null

order  = JSON.parse(order)
let time  = document.createElement('small')

function updateStatus(order) {
 

statuses.forEach((status) => {
    
      status.classList.remove('step-completed')
      status.classList.remove('current')
      
  
   
})

/*statuses.forEach((payment_status) => {
  payment_status.classList.remove('step-completed')
  payment_status.classList.remove('current')
})*/

let stepCompleted = true;
statuses.forEach((status) => {
   let dataProp = status.dataset.status
   if(stepCompleted) {
        status.classList.add('step-completed')
   }
   if(dataProp === order.status) {
        stepCompleted = false
        time.innerText = moment(order.updatedAt).format('hh:mm A')
        status.appendChild(time)
       if(status.nextElementSibling) {
        status.nextElementSibling.classList.add('current')
        
       }
   }
})

 
 
  statuses.forEach((payment_status) => {

    let dataProps =  payment_status.dataset.status
 
    if (dataProps === order.payment_status)  {
      payment_status.classList.add('current')

      if (payment_status.nextElementSibling) {
        payment_status.nextElementSibling.classList.add('step-completed')
      }
      if (payment_status.previousElementSibling) {
        payment_status.previousElementSibling.classList.add('step-completed')
      }
      
     }
    
 
   })


}

/*function updateStatuss(order) {
 

  

statuses.forEach((payment_status) => {
  payment_status.classList.remove('step-completed')
  payment_status.classList.remove('current')
})

let stepCompleted = true;


 
 
  statuses.forEach((payment_status) => {

    let dataProps =  payment_status.dataset.status
 
    if (dataProps === order.payment_status)  {
      payment_status.classList.add('current')

      if (payment_status.nextElementSibling) {
        payment_status.nextElementSibling.classList.add('step-completed')
      }
      if (payment_status.previousElementSibling) {
        payment_status.previousElementSibling.classList.add('step-completed')
      }
      
     }
    
 
   })


}*/






updateStatus(order);
//updateStatuss(order)


//ajax call


initStripe()

//  Socket



let socket = io()
initAdmin(socket)

// Join
if (order) {
  socket.emit('join',`order_${order._id}`)

}

let adminAreaPath = window.location.pathname
console.log(adminAreaPath)
if (adminAreaPath.includes('admin')) {
  socket.emit('join','adminRoom')
  
}

socket.on('orderUpdated' ,(data) => {

   const updatedOrder = { ...order }
   updatedOrder.updatedAt = moment().format()
   updatedOrder.status = data.status
   updateStatus(updatedOrder)
   new noty ({
    type: 'success',
    timeout: 1000,
     text: 'Order Updated',
     progressBar:false
}).show();

})

socket.on('paymentUpdated' ,(data) => {

  const updatedPayment = { ...order }

  updatedPayment.payment_status = data.payment_status
  updateStatus(updatedPayment)
  new noty ({
    type: 'success',
    timeout: 1000,
     text: 'Payment Updated',
     progressBar:false
}).show();


})

