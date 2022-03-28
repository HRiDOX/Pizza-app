import axios from 'axios';
import noty from 'noty';
import {loadStripe} from '@stripe/stripe-js';

 export async function initStripe() {

    const stripe = await loadStripe('pk_test_51KdKSGI4h31xyBGZWjUaO1uSDXwCitc2Y1iQm8aWbaDJ0bV2pPULPYPGS1p8Mrl6LkH3MRtMthsczsOoNdTejBcU00dOvefjOb');

    const elements = stripe.elements()
    let style = {
             base: {
             color: '#32325d',
             fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
             fontSmoothing: 'antialiased',
             fontSize: '16px',
             '::placeholder': {
                 color: '#aab7c4'
             }
             },
             invalid: {
             color: '#fa755a',
             iconColor: '#fa755a'
             }
         };


  let card =  elements.create('card', { style })
  card.mount('#card-element')


    const paymentType = document.querySelector('#paymentType');

    paymentType.addEventListener('change' , (e)=> {

        console.log(e)

        if (e.target.value === 'card') {

            //Display widget

            
        } else {
            
        }
    })

    //Ajax call
    
    const paymentForm = document.querySelector('#payment-form');
    
    if (paymentForm) {
    
      paymentForm.addEventListener('submit' , (e)=> {
        e.preventDefault();
      
         let formData = new FormData(paymentForm);
      
         let formObject = {}
      
         for(let [key, value] of formData.entries()){
      
          formObject[key] = value
      
         }
         axios.post('/orders', formObject).then((res) => {
           
          new noty ({
            type: 'success',
            timeout: 1000,
             text: res.data.message,
             progressBar:false
        }).show();
    
        setTimeout(() => {
          window.location.href = '/customers/orders'
    
        }, 1000)
          
         
      
         }).catch((err) => {
            
          new noty ({
            type: 'success',
            timeout: 1000,
             text: err.res.data.message,
             progressBar:false
        }).show();
      
         })
      
         console.log(formObject);
      
      })
      
    }
    



}