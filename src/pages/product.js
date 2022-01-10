import React, { Component }  from 'react'

function Product() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '250px', height: '300px', backgroundColor: 'red' }}></div>
      </div>
      <div>
        <p>
          The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, 
          as opposed to using 'Content here, content here', making it look like readable English. 
          Many desktop publishing packages and web page editors now use Lorem Ipsum as their default 
          model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
        </p>
      </div>
    </div>
  );
}

export default Product;
