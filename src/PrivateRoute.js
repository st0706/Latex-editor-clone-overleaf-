import React from 'react';
import { Route, Navigate  } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const token = localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Element {...props} />
        ) : (
          <Navigate to="/login" replace/>
        )
      }
    />
  );
};

export default PrivateRoute;
