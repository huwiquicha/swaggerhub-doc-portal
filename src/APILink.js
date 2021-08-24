
import React from 'react';

const APILink = props => {
    let name = props.apiLinkData.name
    let apiData = props.apiLinkData
    
    function handleClick() {
      console.log(apiData)
      props.updateDefinitionLink(apiData)
    }

  return (  
    <div className="api-link" onClick={() => handleClick()}>
      {name}
    </div>
  )
}

export default APILink;