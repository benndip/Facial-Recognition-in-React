import React from 'react';
import ReactDOM from 'react-dom';


const Login = () => {
    return(
        <div>
            <form method="post">
                <p>Register</p>
                Name: <input />
                Email: <input />
                Password: <input />
                <button type="submit">Submit</button>
                <p>Already have an account? SIGN IN</p>
            </form>
        </div>
    )

}
export default Login;