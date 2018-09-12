import React, { Component, PureComponent } from 'react';
import StripeCheckout from "react-stripe-checkout"
import './App.css';
import {data} from './store.js';
import uuid from 'uuid/v4'
import {PUBLIC_KEY} from './PUBLIC_KEY.js'

const {name,products} = JSON.parse(data)
const images = {}
products.forEach(product=>{
  var imageName = product.image.text
  images[imageName]=require('./images/'+imageName)  
})
var id=0;

class Product extends PureComponent {
  render(){
    const {onClickAddToCart} = this.props
    const {name,price,description,image} = this.props.data
    
    return(
      <div className="Product">
        <img onClick={()=>{}} className="Product-image"  src={images[image.text]}/>
        <div className="Product-bar">
          <div className="Product-name">{name.text}</div>
          <div className="Product-price">${price.text}</div>
        </div>
        <div 
          onClick={()=>onClickAddToCart(this.props.data)}
          onTouchStart={()=>this.addToCart.style.backgroundColor='white'}
          onTouchEnd={()=>this.addToCart.style.backgroundColor='black'}
          className="Add-to-cart"
          ref={(i)=>this.addToCart = i}>
        add to cart
        </div>
        <div className="Product-description">{description.text}</div>
      </div>
    )
  }
}



class App extends Component {
  constructor(props){
    super(props)
    this.state={
      view:'productList',
      total:0
    }
  }
  componentDidMount(){
    window.setTimeout(()=>this.container.style.opacity=1,100)
  }
  render() {
    return (
      <div className="App">
        <div className="Container" ref={i=>this.container=i}>
          <div className='Top-bar'>
            <div className='Store-title'>{name.text}</div>
            <CartIcon
              ref={i=> this.cartIcon=i}
              toggleCartVisible={this.toggleCartVisible}/>
          </div>
          {this.state.view=='cart' && 
            <Cart 
              removeFromCart={this.cartIcon.removeFromCart} 
              checkOut={this.checkOut} 
              getCart={this.cartIcon.getCart}/>
          }
          {this.state.view=='productList' && 
            <Contents 
              onClickAddToCart={(i)=>this.cartIcon.onClickAddToCart(i)}
              products={products}/>
          }
          {this.state.view=='checkout' && 
            <Checkout total={this.state.total}/>
          }
        </div>
      </div>
    );
  }
  onClickAddToCart=item=>{
    id++
    var {cart} = this.state
    cart.push({item:item,key:id})
    this.setState({cart})
  }
  checkOut=()=>this.setState({view:'checkout'})
  removeFromCart=item=>{
    const {cart} = this.state
    const newCart = cart.slice(0,item-1).concat(cart.slice(item))
    this.setState({cart:newCart})
  }
  toggleCartVisible=()=>{
    if(this.state.view=='cart'){
      this.container.style.transitionProperty='none'
      this.setState({view:'productList'})
    }else{
      this.container.style.opacity=0
      this.setState({view:'cart'})
      window.setTimeout(()=>{
        this.container.style.transitionProperty='opacity'
        this.container.style.opacity=1},100
      )
    }
  }
}

class CartIcon extends Component {
  constructor(){
    super()
    this.state={
      cart:[]
    }
  }
  render(){
    return(
      <div 
        className='Cart-icon'
        onClick={this.onClick}
      >{this.state.cart.length}</div>
    )
  }
  onClick=()=>this.props.toggleCartVisible()
  onClickAddToCart=item=>{
    id++
    var {cart} = this.state
    cart.push({item:item,key:id})
    this.setState({cart})
  }
  getCart=()=>this.state.cart
  removeFromCart=item=>this.setState({
    cart:this.state.cart.slice(0,item-1)
    .concat(this.state.cart.slice(item))}
  )
}

const fields = ['Name','Street Address','City', 'ZIP code / Postal Code', 'Country']

class Checkout extends Component {
  constructor(props){
    super(props)
    this.state={
      name:'',
      email:'',
      message:''
    }
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
        alert(`We are in business, ${data.email}`);
        this.handleSubmit()
      });
    });
  }
  render(){
    const { name, email, message } = this.state;
    return(
      <div className='container'>
        <form ref={i=>this.infoForm=i}>
          <p>
            <label>
              Your Name: <input type="text" name="name" value={name} onChange={this.handleChange} />
            </label>
          </p>
          <p>
            <label>
              Your Email: <input type="email" name="email" value={email} onChange={this.handleChange} />
            </label>
          </p>
          <p>
            <label>
              Message: <textarea name="message" value={message} onChange={this.handleChange} />
            </label>
          </p>
        {fields.map((field,index)=>{
          return (<Field key={index} name={field} value={this.state[field] || ''} onChange={this.handleChange}/>)
        }
        )}
        </form>

        <StripeCheckout
          token={this.onToken}
          stripeKey={PUBLIC_KEY}
        />      
      </div>
    )
  }
  encode = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
  }
  submit = () => {
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: this.encode({ "form-name": "purchase", ...this.state })
    })
      .then(() => alert("Success!"))
      .catch(error => alert(error));
  };
  handleChange = e => this.setState({ [e.target.name]: e.target.value });
}

const Field = props =>{
  const {name,value,onChange}=props
  return(
    <p>
      <label>
        {name} <textarea name={name} value={value} onChange={onChange} />
      </label>
    </p>
  )
}
  // handleChange=(event)=>{
  //   this.props.onChange({name:this.props.name,value:event.target.value})
  // }

// }

const Contents = ({products, onClickAddToCart}) => 
  products.map((product)=>
    <Product
     key={id++}
     onClickAddToCart={()=>onClickAddToCart(product)}
     data={product}/>
  )


class Cart extends PureComponent {
  componentDidMount(){window.setTimeout(()=>this.cartContainer.style.opacity=1,100)}
  render(){
    const cart = this.props.getCart()
    return(
      <div className='Cart-container' ref={i=>this.cartContainer=i}>
        <div className='Items-container'>
          {cart.map((item,index)=>{
            return (
              <div className='Cart-line' key={id++}>
                <img className='Cart-item-image' src={images[item.item.image.text]}/>
                <div className='Cart-item-name'>{item.item.name.text}</div>
                <div className='Cart-item-price'>${item.item.price.text}</div>
                <div className='Cart-remove-x' onClick={()=>{this.props.removeFromCart(index+1);this.forceUpdate()}}>x</div>
              </div>
            )
          })}
        </div>
        <div className='Cart-footer'>
          <span className='Cart-footer-total'>TOTAL : ${this.getTotal()}</span>
          <span className='Cart-footer-checkout' onClick={()=>this.props.checkOut(this.getTotal())}>checkout</span>
        </div>
      </div>
    )
  }
  getTotal=()=>this.props.getCart().reduce((acc,item)=>acc+Number(item.item.price.text),0)
};


export default App;