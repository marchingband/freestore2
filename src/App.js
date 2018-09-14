import React, { Component, PureComponent } from 'react';
import {BrowserRouter as Router,Route,Switch,} from 'react-router-dom'
import StripeCheckout from "react-stripe-checkout"
import './App.css';
import {data} from './store.js';
import uuid from 'uuid/v4'
import {PUBLIC_KEY} from './PUBLIC_KEY.js'

// const PUBLIC_KEY = 345657

const {name,products} = JSON.parse(data)
const images = {}
products.forEach(product=>{
  var imageName = product.image.text
  images[imageName]=require('./images/'+imageName)  
})
var id=0;

const totals = (acc,cur) => acc + cur.price * cur.quantity
const remove = (list,i) => list.slice(0,i).concat(list.slice(i+1))
const u = name => name.replace(/\s/g, '');

const Product = ({history, product: {name, image} }) => 
    <div className="Product">
      <img onClick={()=>{history.push('/'+u(name.text))}} className="Product-image"  src={images[image.text]}/>
      <div className="Product-bar">
        <div className="Product-name">{name.text}</div>
      </div>
    </div>

const Home = ({ cart,history }) =>
  <div>
    <div className='Top-bar'>
      <div className='Store-title'>{name.text}</div>
      <CartIcon cart={cart} history={history}/>
    </div>
    {products.map(product=><Product product={product} history={history}/>)}
  </div>

const ProductPage = ({ ATC, history, product: {description,price,name,image} }) =>
    <div className="Product">
      <img className="Product-image"  src={images[image.text]}/>
      <div className="Product-bar">
        <div className="Product-name">{name.text}</div>
        <div className="Product-price">${price.text}</div>
      </div>
      <div className="Add-to-cart" onClick={()=>{ATC(name.text);history.push('/cart')}}>add to cart</div>
      <div className="Product-description">{description.text}</div>
    </div>

const Cart = ({modifyCart,cart,history}) =>
      <div className='Cart-container'>
        <div className='Cart-back' onClick={()=>history.push('/')} >continue shopping</div>
        <div className='Items-container'>
          {cart.filter(p=>p.quantity>0).map(({name,image,price,quantity}) =>
              <div className='Cart-line' key={id++}>
                <img className='Cart-item-image' src={images[image]}/>
                <div className='Cart-item-name'>{name}</div>
                <div className='Cart-remove-x' onClick={()=>modifyCart(name,quantity+1)}>+</div>
                <div>quantity : {quantity} </div>
                <div className='Cart-remove-x' onClick={()=>quantity>1 && modifyCart(name,quantity-1)}>-</div>
                <div className='Cart-item-price'>${price}</div>
                <div className='Cart-remove-x' onClick={()=>modifyCart(name,0)}>x</div>
              </div>
          )}
        </div>
        <div className='Cart-footer'>
          <span className='Cart-footer-total'>TOTAL : ${cart.reduce(totals,0)}</span>
          <span className='Cart-footer-checkout' onClick={()=>history.push('/checkout')}>checkout</span>
        </div>
      </div>
    

class App extends Component {
  constructor(props){
    super(props)
    this.state={}
    products.forEach(p=>this.state[p.name.text]={name:p.name.text,image:p.image.text,price:p.price.text,quantity:0})
  }
  render() {
    return (
      <Router>
        <div className="App">
          <div className="Container">
            <Switch>
              <Route exact path='/'   render={p=> <Home {...p} cart={Array.from(this.state)}/>} />
              <Route path='/cart'     render={p=> <Cart {...p} modifyCart={this.modifyCart} cart={Object.values(this.state)} />} />
              <Route path='/checkout' render={p=> <Checkout {...p} />} />
              {products.map(pr=>
                <Route path={'/'+u(pr.name.text)} render={p=> <ProductPage {...p} ATC={this.ATC} product={pr} />} />)}
              <Route render={p=> <Home {...p} cart={Array.from(this.state)}/>} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
  ATC=name=>{
    const {image,quantity,price} = this.state[name]
    this.setState({ [name]:{name,image,price,quantity:quantity+1} })
  }
  modifyCart=(name,quantity)=>{
    const {image,price} = this.state[name]
    this.setState({ [name]:{name,image,price,quantity} })
  }
}

const CartIcon = ({cart,history}) => 
  <div className='Cart-icon' onClick={()=>history.push('/cart')}>
    {cart.reduce((cur,acc)=>acc+cur.quantity,0)}
  </div>

const fields = ['Name','Street Address','City', 'ZIP code / Postal Code', 'Country']

class Checkout extends Component {
  constructor(props){
    super(props)
    this.state={}
  }
  encodeData=token=>{
    const names = Object.keys(this.state)
    const userDataStrings = names.map(name=>`${name} : ${this.state[name]}`)
    const userData = userDataStrings.join('\n')
    const tokenString = JSON.stringify(token,null,3).replace(/[^\w\s:_@.-]/g,'')
    return`
${userData}

stripe payment meta-data:${tokenString}`
  }
  onToken = token => {
    const data = {
      token:token,
      amount : 111,
      idempotency_key:uuid(),
    }
    console.log(token)
    fetch("/.netlify/functions/purchase", {
      method: "POST",
      body: JSON.stringify(data)
    }).then(response => {
      response.json().then(data => {
        console.log(data)
        if(data.status=='succeeded'){
          alert(`payment was successful`);
          this.submit(this.encodeData(token))
        }
      });
    });
  }
  render(){
    return(
      <div className='container'>
        <form ref={i=>this.infoForm=i}>
          {fields.map((field,index)=>{
            const stateName = field.split(' ').join('').toLowerCase()
            return(
              <Field 
                key={index}
                label={field}
                name={stateName} 
                value={this.state[stateName] || ''} 
                onChange={this.handleChange}/>
          )})}
        </form>
        <StripeCheckout token={this.onToken} stripeKey={PUBLIC_KEY}/>      
        {/* {Object.keys(this.state).map(s=><p>{s} : {this.state[s]}  </p>)} */}
      </div>
    )
  }
  encode = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
  }
  submit = (data) => {
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: this.encode({ "form-name": "purchase", "data":data })
    })
      .then(() => alert("Success!"))
      .catch(error => alert(error));
  };
  handleChange = e => this.setState({ [e.target.name]: e.target.value });
}

const Field = ({label,name,value,onChange}) =>
  <p>
    <label>
      {label} <input type={'text'} name={name} value={value} onChange={onChange} />
    </label>
  </p>

export default App;