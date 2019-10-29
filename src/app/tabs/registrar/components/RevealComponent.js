import React, { Component } from 'react';
import { multilanguage } from 'redux-multilanguage';
import propTypes from 'prop-types';
import { ProgressBar, Button, Spinner } from 'react-bootstrap';

class RevealComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      seconds: 3,
      lastCheck: 0,
    };

    this.progressBarInterval = 3; // seconds
    this.progressBarMax = 60; // seconds
    this.progressBarMin = 0; // seconds
    this.amountIntervalsToCheck = 3;
  }

  componentDidMount() {
    this.canReveal();
  }

  canReveal() {
    const { canReveal } = this.props;

    if (!canReveal) {
      setTimeout(() => {
        const { waiting, checkCanReveal } = this.props;

        if (waiting) {
          const { seconds, lastCheck } = this.state;

          if ((seconds - lastCheck) >= (this.progressBarInterval * this.amountIntervalsToCheck)) {
            // time to check if canReveal
            checkCanReveal();

            return this.setState(
              {
                seconds: seconds + (this.progressBarInterval),
                lastCheck: seconds,
              },
              this.canReveal(),
            );
          }

          if (seconds >= this.progressBarMax - (2 * this.progressBarInterval)) {
            // if there are less than two intervals to complete the progress bar =>
            // return to the middle of the bar
            return this.setState(
              {
                seconds: this.progressBarMax / 2,
                lastCheck: (this.progressBarMax / 2) - (2 * this.progressBarInterval),
              },
              this.canReveal(),
            );
          }

          return this.setState(
            {
              seconds: seconds + (this.progressBarInterval),
              lastCheck,
            },
            this.canReveal(),
          );
        }

        return this.canReveal();
      }, this.progressBarInterval * 1000);
    }
  }

  render() {
    const {
      waiting, strings, revealCommit, committed, revealing, revealed,
    } = this.props;

    if (!committed) {
      return '';
    }

    if (waiting) {
      const { seconds } = this.state;

      return (
        <div>
          <ProgressBar animated now={seconds} min={this.progressBarMin} max={this.progressBarMax} />
          <p>
            {strings.process_step_2_explanation}
          </p>
        </div>
      );
    }

    if (revealing) {
      return <Spinner animation="grow" variant="primary" />;
    }

    return (
      <div>
        <Button disabled={revealed} onClick={revealCommit}>{strings.process_step_3}</Button>
        <p>
          {strings.process_step_3_explanation}
        </p>
      </div>
    );
  }
}

RevealComponent.propTypes = {
  strings: propTypes.shape({
    process_step_3: propTypes.string.isRequired,
    process_step_3_explanation: propTypes.string.isRequired,
    process_step_2_explanation: propTypes.string.isRequired,
  }).isRequired,
  revealCommit: propTypes.func.isRequired,
  checkCanReveal: propTypes.func.isRequired,
  waiting: propTypes.bool.isRequired,
  canReveal: propTypes.bool.isRequired,
  revealing: propTypes.bool.isRequired,
  revealed: propTypes.bool.isRequired,
  committed: propTypes.bool.isRequired,
};

export default multilanguage(RevealComponent);
