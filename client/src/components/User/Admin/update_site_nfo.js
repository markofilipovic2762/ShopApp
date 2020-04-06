import React, { Component } from 'react';

import FormField from '../utils/Form/FormField';
import { connect } from 'react-redux';
import { getSiteData, updateSiteData } from '../../../actions/site_actions';

import { update, generateData, isFormValid, populateFields } from '../../utils/Form/FormActions';

class UpdateSiteNfo extends Component {

    state = {
        formError: false,
        formSuccess: false,
        formData: {
            address: {
                element: 'input',
                value: '',
                config: {
                    name: 'adress_input',
                    type: 'text',
                    placeholder: 'Enter the site adress'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            hours: {
                element: 'input',
                value: '',
                config: {
                    label: 'Working hours',
                    name: 'hours_input',
                    type: 'text',
                    placeholder: 'Enter the site working hours'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            phone: {
                element: 'input',
                value: '',
                config: {
                    label: 'Phone nubmer',
                    name: 'hours_input',
                    type: 'text',
                    placeholder: 'Enter the phone number'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            email: {
                element: 'input',
                value: '',
                config: {
                    label: 'Shop email',
                    name: 'email_input',
                    type: 'email',
                    placeholder: 'Enter the email of website'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            }
        }
    }

    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'site_info');
        this.setState({
            formError: false,
            formData: newFormdata
        })
    }

    submitForm = (event) => {
        event.preventDefault();

        let dataToSubmit = generateData(this.state.formData, 'site_info');
        let formIsValid = isFormValid(this.state.formData, 'site_info');

        if (formIsValid) {
            this.props.dispatch(updateSiteData(dataToSubmit)).then(()=>{
                this.setState({
                    formSuccess: true
                },()=>{
                    setTimeout(() => {
                        this.setState({
                            formSuccess: false
                        }, 2000)
                    })
                })
            });
        } else {
            this.setState({
                formError: true
            })
        }
    }

    componentDidMount() {
        this.props.dispatch(getSiteData()).then(()=>{
            const newFormdata = populateFields(this.state.formData,this.props.site.siteData[0]);
            this.setState({
                formData: newFormdata
            })
        })
    }
    

    render() {
        return (
            <div>
                <form onSubmit={event => this.submitForm(event)}>
                    <h1>Site info</h1>
                    <FormField
                        id={'adress'}
                        formdata={this.state.formData.address}
                        change={(element) => {
                            this.updateForm(element);
                        }}
                    />
                    <FormField
                        id={'hours'}
                        formdata={this.state.formData.hours}
                        change={(element) => {
                            this.updateForm(element);
                        }}
                    />
                    <FormField
                        id={'phone'}
                        formdata={this.state.formData.phone}
                        change={(element) => {
                            this.updateForm(element);
                        }}
                    />
                    <FormField
                        id={'email'}
                        formdata={this.state.formData.email}
                        change={(element) => {
                            this.updateForm(element);
                        }}
                    />

                    <div>
                        {
                            this.state.formSuccess ?
                                <div className="form_success">
                                    Success
                                </div>
                            : null
                        }
                        {this.state.formError ?
                            <div className="error_label">
                                Please check your data
                            </div>
                        : null
                        }
                        <button onClick={event => this.submitForm(event)}>
                            Update
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        site: state.site
    }
}

export default connect(mapStateToProps)(UpdateSiteNfo);