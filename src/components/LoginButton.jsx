import React from 'react'

const style = 
`
button {
  font: inherit;
  background-color: #f0f0f0;
  border: 0;
  color: #242424;
  border-radius: 0.4em;

  font-size: 0.95rem;        
  padding: 0.25em 0.75em;    

  font-weight: 600;
  text-shadow: 0 0.05em 0 #fff;

  box-shadow:
    inset 0 0.05em 0 0 #f4f4f4,
    0 0.05em 0 0 #efefef,
    0 0.1em 0 0 #ececec,
    0 0.2em 0 0 #e0e0e0,
    0 0.25em 0 0 #dedede,
    0 0.3em 0 0 #dcdcdc,
    0 0.325em 0 0 #cacaca,
    0 0.325em 0.4em 0 #cecece;

  transition: 0.15s ease;
  cursor: pointer;
}

button:active {
  translate: 0 0.15em;
}

`;

const LoginButton = () => {
  return (
    <>
    <style> {style} </style>
    <button className='login'>Login</button>
    </>
  )
}

export default LoginButton