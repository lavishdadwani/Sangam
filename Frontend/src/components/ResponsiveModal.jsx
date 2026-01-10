import React from 'react'
import classNames from "classnames"
import {Modal} from "react-responsive-modal"
const ResponsiveModal = ({children,open,close,className,width= "100%", ...rest}) => {

    const maxWidthStyle = {
        modal:{
            position:"relative",
            maxWidth: width,
            borderRadius: "5px",
            background: "#f4f4f4"
        }
    }

    const style ={ 
        modal:{
            position:"relative",
            maxWidth: width  || "50%",
            borderRadius: "5px",
            background: "#f4f4f4"
        }
    }
  return (
    <Modal center={true} open={open} showCloseIcon={false} onClose={close} classNames={classNames("mx-6", className)} styles={rest.maxWidth ? maxWidthStyle : style} {...rest} >
      {children}
    </Modal>
  )
}

export default ResponsiveModal
