import React, { useEffect } from 'react';
import { connect } from 'react-redux';

function Logger(props) {
  const { log } = props;

  useEffect(() => {
    let element = document.getElementById("logger");
    element.scroll(0, element.scrollHeight);
  }, [log.length])

  return (
    <div className="drawer" id="logger">
      <div className="msg-container">
        {log.slice(-20).map((message, index) => <div className="text" key={index}>{message}</div>)}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  log: state.log,
});

export default connect(mapStateToProps)(Logger);