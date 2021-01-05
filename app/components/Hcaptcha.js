import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default class HCaptchaWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isMounted: false, ...props };
  }

  componentDidMount() { this.setState({ isMounted: true }); }

  render() {
    if (!this.state.isMounted) return '';
    return React.createElement(HCaptcha, this.state);
  }
}
