import React from 'react';
import MyButton from '../utils/button';
import Login from './login';

const RegisterLogin = () => {
    return (
        <div className="page_wrapper">
            <div className="container">
                <div className="register_login_container">
                    <div className="left">
                        <h1>New Customers</h1>
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. 
                            Quia nisi reiciendis ipsa illum aspernatur atque doloribus,
                            animi ratione consequatur cumque natus.
                            Numquam deleniti excepturi dolorem harum commodi,
                             similique ipsa itaque!</p>
                        <MyButton 
                            type="default"
                            title="Create an account"
                            linkTo="/register"
                            addStyles={{
                                margin:'10px 0 0 0'
                            }}
                        />
                    </div>
                    <div className="right">
                        <h2>Registred customers</h2>
                        <p>If you have account please login</p>
                        <Login />
                        {/* <MyButton 
                            type="default"
                            title="Login"
                            linkTo="/login"
                            addStyles={{
                                margin:'10px 0 0 0'
                            }}
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterLogin;