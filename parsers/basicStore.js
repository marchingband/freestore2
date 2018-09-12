const fs = require('fs')
// const data = fs.readFileSync('./templates/store.txt')
// const requireDir = require('require-dir')

const parser = (data) => {
  const lines = String(data)
  .split('\n')
  .filter(Boolean)
  .map((line,i)=>({lineNumber:i+1,text:line}))
  .map((line,i)=>i<5
    ?({lineNumber:line.lineNumber,text:line.text.split(':')[1]})
    :line)
  .map(l=>l.text.includes('/')?({lineNumber:l.lineNumber,text:l.text.split('/')[l.text.split('/').length-1]}):l)

  const [name,banner,logo,favicon,currency,email,...productList] = lines

  toGroupsOf= x=> data=> data.length>=x
    ? [data.slice(0,x),...toGroupsOf(x)(data.slice(x))]
    : []

  const products = toGroupsOf(4)(productList).map(x=>(
    {name:x[0],
    price:x[1],
    description:x[2],
    image:x[3]
    }
  ))

  const output = `const data =  \`` + 
    JSON.stringify({
      name,
      banner,
      logo,
      favicon,
      currency,
      products,
    }) + 
    `\`` + 
    "\nmodule.exports={data}"
  return output
}

module.exports={parser}
// fs.writeFileSync('./src/store.js',output)