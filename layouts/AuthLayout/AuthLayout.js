import React, { memo } from "react";
import classNames from "classnames/bind";
import PropTypes from "prop-types";
import styles from "./AuthLayout.module.css";

const cx = classNames.bind(styles);

const AuthLayout = memo(({ children }) => {
    return <div className={cx("auth-layout")}>{children}</div>;
});

AuthLayout.propTypes = {
    children: PropTypes.any,
};

AuthLayout.defaultProps = {};

export default AuthLayout;
