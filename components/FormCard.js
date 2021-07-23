import React, { memo } from "react";
import PropTypes from "prop-types";

const FormCard = memo(({ children }) => {
    return <div className="p-5">{children}</div>;
});

FormCard.propTypes = {
    children: PropTypes.any,
};

FormCard.defaultProps = {};

export default FormCard;
