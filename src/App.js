import React, { Component, PureComponent } from 'react';
import {BrowserRouter as Router,Route,Switch,Link} from 'react-router-dom'
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
    {products.map((pr,i)=><Product key={i} product={pr} history={history}/>)}
  </div>

const ProductPage = ({ ATC, history, product: {description,price,name,image} }) =>
    <div className="Product">
      <img className="Product-image"  src={images[image.text]}/>
      <div className="Product-bar">
        <div className="Product-name">{name.text}</div>
        <div className="Product-price">${price.text}</div>
      </div>
      <div className="Add-to-cart" onClick={()=>{ATC({description,price,name,image});history.push('/cart')}}>add to cart</div>
      <div className="Product-description">{description.text}</div>
    </div>

class Counter extends Component{
  constructor(props){
    super(props)
    this.state={num:this.props.quantity}
  }
  editQuantity(name,quantity){
    this.props.modifyCart(name,quantity)
    this.setState({num:quantity})
  }
  render(){
    const {name} = this.props
    const {num} = this.state
    return(
      <div style={{display:'flex',flexDirection:'row'}}>
        <div className='Cart-remove-x' onClick={()=>this.editQuantity(name,num+1)}>+</div>
          <div>quantity : {this.state.num} </div>
        <div className='Cart-remove-x' onClick={()=>this.editQuantity(name,num-1)}>-</div>
      </div>
    );
  }
}

const CartLine = ({item:{name,image,price,quantity},modifyCart}) =>
  <div className='Cart-line' key={id++}>
    <img className='Cart-item-image' src={images[image]}/>
    <div className='Cart-item-name'>{name}</div>
    <Counter modifyCart={modifyCart} quantity={quantity} name={name} />
    {/* <div className='Cart-remove-x' onClick={()=>modifyCart(name,quantity+1)}>+</div>
    <div>quantity : {quantity} </div>
    <div className='Cart-remove-x' onClick={()=>quantity>1 && modifyCart(name,quantity-1)}>-</div> */}
    <div className='Cart-item-price'>${price}</div>
    <div className='Cart-remove-x' onClick={()=>modifyCart(name,0)}>x</div>
  </div>

const Cart = ({modifyCart,cart,history}) => 
      <div className='Cart-container'>
        <div className='Cart-back' onClick={()=>history.push('/')} >continue shopping</div>
        <div className='Items-container'>
          {cart.filter(p=>p.quantity>0).map((item,i) => <CartLine item={item} modifyCart={modifyCart}/>)}
        </div>
        <div className='Cart-footer'>
          {/* <span className='Cart-footer-total'>TOTAL : ${getTotal(this)}</span> */}
          <span className='Cart-footer-checkout' onClick={()=>history.push('/checkout')}>checkout</span>
        </div>
      </div>


class App extends Component {
  constructor(props){
    super(props)
    this.state={
      cart:[]
    }
    // products.forEach(p=>this.cart[p.name.text]={name:p.name.text,image:p.image.text,price:p.price.text,quantity:0})
  }
  render() {
    return (
      <Router>
        <div className="App">
          <div className="Container">
            <Switch>
              <Route exact path='/' render={p=> <Home {...p} cart={this.state.cart}/>} />
              <Route path='/cart'     render={p=>{
                return(
                  <div className='Cart-container'>
                    <Link to='/'><div className='Cart-back' >continue shopping</div></Link>
                    <div className='Items-container'>
                      {this.state.cart.map((item,i) => {
                        const {name,price,image,quantity} = item
                        return(
                          <div className='Cart-line'>
                            <img className='Cart-item-image' src={images[image.text]}/>
                            <div className='Cart-item-name'>{name.text}</div>
                            <div className='Cart-remove-x' onClick={()=>{this.modCart(i,quantity+1)}}>+</div>
                            <div>quantity : {item.quantity} </div>
                            <div className='Cart-remove-x' onClick={()=>{this.modCart(i,quantity-1)}}>-</div>
                            <div className='Cart-item-price'>${price.text}</div>
                            <div className='Cart-remove-x' onClick={()=>{this.RFC(i)}}>x</div>
                          </div>
                      )})}
                    </div>
                    <div className='Cart-footer'>
                      <span className='Cart-footer-total'>TOTAL : ${this.getTotal()}</span>
                      <Link to='/checkout'><span className='Cart-footer-checkout'>checkout</span></Link>
                    </div>
                  </div>
                )}} />
              
              <Route path='/checkout' render={p=> <Checkout ref={i=>this.checkout=i} {...p} />} />
              {products.map(pr=>
                <Route key={id++} path={'/'+u(pr.name.text)} render={p=> <ProductPage {...p} ATC={this.ATC} product={pr} />} />)}
              <Route render={p=> <Home {...p} cart={Object.values(this.cart)}/>} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
  ATC=item=>{
    console.log(item)
    const _item = {...item,quantity:1}
    this.setState(s=>({cart:s.cart.concat([_item])}))
  }
  RFC=i=>{
    var {cart}= this.state
    cart=cart.slice(0,i).concat(cart.slice(i+1))
    this.setState({cart})
  }
  modCart=(index,quantity)=>{
    var {cart} = this.state
    cart[index].quantity=quantity
    this.setState({cart})
  }
  getTotal=()=>{
    const {cart} = this.state
    var total = 0
    cart.forEach(p=>total+=p.price.text * p.quantity)
    return total
  }
}

const CartIcon = ({cart,history}) => 
  <div className='Cart-icon' onClick={()=>history.push('/cart')}>
    {cart.reduce((acc,cur)=>acc+cur.quantity,0)}
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