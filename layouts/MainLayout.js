import React, { memo } from "react";
import PropTypes from "prop-types";

const MainLayout = memo(({ children }) => {
    return <div className="container mx-auto">{children}</div>;
});

MainLayout.propTypes = {
    children: PropTypes.any,
};

MainLayout.defaultProps = {};

export default MainLayout;
