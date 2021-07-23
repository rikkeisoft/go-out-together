import React, { memo } from "react";
import PropTypes from "prop-types";

const Label = memo(({htmlFor, children}) => {
    return <label htmlFor={htmlFor} className="mb-1">{children}</label>;
});

Label.propTypes = {
    htmlFor: PropTypes.string,
    children: PropTypes.any,
};

Label.defaultProps = {
    htmlFor: "",
};

export default Label;
