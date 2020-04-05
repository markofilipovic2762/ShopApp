import React, { Component } from 'react';

import FormField from '../utils/Form/FormField';
import { connect } from 'react-redux';

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
            
        } else {
            this.setState({
                formError: true
            })
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={event => this.submitForm(event)}>
                    <FormField
                        id={'name'}
                        formdata={this.state.formData.name}
                        change={(element) => {
                            this.updateForm(element);
                        }}
                    />
                    <tr></tr>
                    <tr></tr>
                    <tr></tr>
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

export default connect(mapStateToProps) (UpdateSiteNfo);