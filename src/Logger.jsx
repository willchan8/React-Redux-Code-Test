import React from 'react';
import { connect } from 'react-redux';

class Logger extends React.Component {
  componentDidUpdate(prevProps) {
    const { log } = this.props;
    // Keep logger scrollbar at bottom as messages are added
    if (log.length !== prevProps.log.length) {
      let element = document.getElementById("logger");
      element.scroll(0, element.scrollHeight);
    }
  }

  render() {
    const { log } = this.props;
    return (
      <div className="drawer" id="logger">
        <div className="msg-container">
          {log.slice(-20).map((message, index) => <div className="log-row text" key={index}>{message}</div>)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  log: state.log,
});

export default connect(mapStateToProps)(Logger);