import React from 'react';
import APILink from './APILink.js'

const Sidebar = props => {
    let organizationConfig = props.organizationConfig
    let apiLinks = []

    if (props.definitionList === null) {
        props.getOrganizationData(organizationConfig.orgName)
    } else {
        console.log(props.definitionList)
        for (const [k, v] of props.definitionList.entries()) {
            if (v.published) {
                apiLinks.push(
                    <APILink 
                        key={k}
                        apiLinkData={v}
                        updateDefinitionLink={props.updateDefinitionLink}
                    />
                )
            }
        }
    }

  return (
    <div className="side-bar">
        <div className="side-bar-header">
            <img src={organizationConfig.displayImage} alt="logo"/>
            <h1>{organizationConfig.displayName}</h1>
            <h3>{organizationConfig.displayTag}</h3>
        </div>
        <div className="side-bar-body">
            <h3>API DOCS</h3>
            {apiLinks}
        </div>
    </div>
  )
}

export default Sidebar;