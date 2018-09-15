import React, { Component, PureComponent } from 'react';
import {BrowserRouter as Router,Route,Switch,Link} from 'react-router-dom'
import StripeCheckout from "react-stripe-checkout"
import './App.css';
import {data} from './store.js';
import uuid from 'uuid/v4'
// import {PUBLIC_KEY} from './PUBLIC_KEY.js'

const PUBLIC_KEY = 345657

const {storeName,products} = JSON.parse(data)
const images = {}
products.forEach(product=>{
  var imageName = product.image.text
  images[imageName]=require('./images/'+imageName)  
})

const u = name => name.replace(/\s/g, '');

class App extends Component {
  constructor(props){
    super(props)
    this.state={cart:[]}
  }

  get home(){return(
      <div>
        <div className='Top-bar'>
          <div className='Store-title'>
            {storeName}
          </div>
          <Link to='/cart'>
            <div className='Cart-icon'>
              {this.state.cart.reduce((acc,cur)=>acc+cur.quantity,0)}
            </div>
          </Link>
        </div>
        {products.map(({name,image})=>
          <div className="Product">
            <Link to={'/'+u(name.text)}>
              <img  className="Product-image"  src={images[image.text]}/>
            </Link>
            <div className="Product-bar">
              <div className="Product-name">{name.text}</div>
            </div>
          </div>
        )}
      </div>)}
  
  get productPages(){return(
    products.map(({description,price,name,image},i)=>
    ({
      path:
        name.text,
      html:
        <div className="Product">
          <img className="Product-image"  src={images[image.text]}/>
          <div className="Product-bar">
            <div className="Product-name">{name.text}</div>
            <div className="Product-price">${price.text}</div>
          </div>
          <Link to='/cart'><div className="Add-to-cart" onClick={()=>{this.ATC(products[i])}}>
              add to cart
          </div></Link>
          <div className="Product-description">{description.text}</div>
        </div>
    })
  ))}

  get cart(){return(
    <div className='Cart-container'>
      <Link to='/'><div className='Cart-back' >continue shopping</div></Link>
      <div className='Items-container'>
      {this.state.cart.map(({name,price,image,quantity},i) => 
          <div className='Cart-line'>
            <img className='Cart-item-image' src={images[image.text]}/>
            <div className='Cart-item-name'>{name.text}</div>
            <div className='Cart-remove-x' onClick={()=>{this.modCart(i,quantity+1)}}>+</div>
            <div>quantity : {quantity} </div>
            <div className='Cart-remove-x' onClick={()=>{quantity>1&&this.modCart(i,quantity-1)}}>-</div>
            <div className='Cart-item-price'>${price.text}</div>
            <div className='Cart-remove-x' onClick={()=>{this.RFC(i)}}>x</div>
          </div>
      )}
      </div>
      <div className='Cart-footer'>
        <span className='Cart-footer-total'>TOTAL : ${this.getTotal()}</span>
        <Link to='/checkout'><span className='Cart-footer-checkout'>checkout</span></Link>
      </div>
  </div>
  )}

  get checkOut(){return(
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
  </div>
  )}

  render() {
    return (
      <Router>
        <div className="App">
          <div className="Container">
            <Switch>
              <Route exact path='/'                render={_=> this.home} />
              <Route       path='/cart'            render={_=> this.cart} />
              <Route       path='/checkout'        render={_=> this.checkOut} />
              {/* <Route       path='/checkout'        render={p=> <Checkout {...p} />} /> */}
              {this.productPages.map(page=>
              <Route       path={'/'+u(page.path)} render={_=> page.html} /> )}
              <Route                               render={_=> this.home} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
  ATC=item=>{
    // console.log(item)
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

const fields = ['Name','Street Address','City', 'ZIP code / Postal Code', 'Country']

const Field = ({label,name,value,onChange}) =>
  <p>
    <label>
      {label} <input type={'text'} name={name} value={value} onChange={onChange} />
    </label>
  </p>


// class Checkout extends Component {
//   constructor(props){
//     super(props)
//     this.state={}
//   }
//   encodeData=token=>{
//     const names = Object.keys(this.state)
//     const userDataStrings = names.map(name=>`${name} : ${this.state[name]}`)
//     const userData = userDataStrings.join('\n')
//     const tokenString = JSON.stringify(token,null,3).replace(/[^\w\s:_@.-]/g,'')
//     return`
//   ${userData}
//   stripe payment meta-data:${tokenString}`
//   }
//   onToken = token => {
//     const data = {
//       token:token,
//       amount : 111,
//       idempotency_key:uuid(),
//     }
//     console.log(token)
//     fetch("/.netlify/functions/purchase", {
//       method: "POST",
//       body: JSON.stringify(data)
//     }).then(response => {
//       response.json().then(data => {
//         console.log(data)
//         if(data.status=='succeeded'){
//           alert(`payment was successful`);
//           this.submit(this.encodeData(token))
//         }
//       });
//     });
//   }
//   render(){
//     return(
//       <div className='container'>
//         <form ref={i=>this.infoForm=i}>
//           {fields.map((field,index)=>{
//             const stateName = field.split(' ').join('').toLowerCase()
//             return(
//               <Field 
//                 key={index}
//                 label={field}
//                 name={stateName} 
//                 value={this.state[stateName] || ''} 
//                 onChange={this.handleChange}/>
//           )})}
//         </form>
//         <StripeCheckout token={this.onToken} stripeKey={PUBLIC_KEY}/>      
//       </div>
//     )
//   }
//   encode = (data) => {
//     return Object.keys(data)
//         .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
//         .join("&");
//   }
//   submit = (data) => {
//     fetch("/", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: this.encode({ "form-name": "purchase", "data":data })
//     })
//       .then(() => alert("Success!"))
//       .catch(error => alert(error));
//   };
//   handleChange = e => this.setState({ [e.target.name]: e.target.value });
// }

export default App;