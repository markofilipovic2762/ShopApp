import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCompass} from '@fortawesome/fontawesome-free-solid';
import {faPhone} from '@fortawesome/fontawesome-free-solid';
import {faClock} from '@fortawesome/fontawesome-free-solid';
import {faEnvelope} from '@fortawesome/fontawesome-free-solid';

const Footer = () => {
    return (
        <footer className="bck_b_dark">
            <div className="container">
                <div className="logo">
                    Waves
                </div>
                <div className="wrapper">
                    <div className="left">
                        <h2>Contact information</h2>
                        <div className="business_nfo">
                            <div className="tag">
                                <FontAwesomeIcon
                                    icon={faCompass}
                                    className="icon" 
                                />
                                <div className="nfo">
                                    <div>Adress</div>
                                    <div>Kramer 234</div>
                                </div>
                            </div>
                            <div className="tag">
                                <FontAwesomeIcon
                                    icon={faPhone}
                                    className="icon" 
                                />
                                <div className="nfo">
                                    <div>Phone</div>
                                    <div>05-3134-355</div>
                                </div>
                            </div>
                            <div className="tag">
                                <FontAwesomeIcon
                                    icon={faClock}
                                    className="icon" 
                                />
                                <div className="nfo">
                                    <div>Working hours</div>
                                    <div>Mon-Sun 9-20h</div>
                                </div>
                            </div>
                            <div className="tag">
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="icon" 
                                />
                                <div className="nfo">
                                    <div>Email</div>
                                    <div>markofilipovicsd@gmail.com</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="left">
                        <h2>Be the first to know</h2>
                        <div>
                            <div>Get all information on events,sales and offers </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;