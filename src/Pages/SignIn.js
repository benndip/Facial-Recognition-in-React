import React from "react"
import ReactDom from "react-dom"

const SignIn = () => {
    return(
        <div>
            <form method="post">
                <p>Register</p>
                Email: <input />
                Password: <input />
                <button type="submit">Submit</button>
                <p>Dont Yet have an  account? SIGN UP</p>
            </form>
        </div>
    )
}
export default SignIn