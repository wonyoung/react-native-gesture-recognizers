'use strict';

import React, {
  Component,
  PanResponder,
  View
} from 'react-native';

const scalable = (BaseComponent) => {
  return class extends Component {
    isScaling = false;
    dist0 = 0.0;

    componentWillMount() {
      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => true,
        onPanResponderGrant: this._onPanResponderGrant.bind(this),
        onPanResponderMove: this._onPanResponderMove.bind(this),
        onPanResponderRelease: this._onPanResponderEnd.bind(this),
        onPanResponderTerminate: this._onPanResponderEnd.bind(this),
      });
    }

    componentDidMount() {
      this.childPanHandlers = this.refs.child && this.refs.child.panResponder &&
        this.refs.child.panResponder.panHandlers;
    }

    distance(a, b) {
      const { pageX : x1, pageY : y1 } = a;
      const { pageX : x2, pageY : y2 } = b;

      return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    }

    _onPanResponderGrant(e, s) {
      this.childPanHandlers && this.childPanHandlers.onResponderGrant(e, s);
    }

    _onPanResponderMove(e, s) {
      const { touches } = e.nativeEvent;
      if (!this.isScaling && s.numberActiveTouches === 2) {
        const { onScaleStart } = this.props;
        this.isScaling = true;
        this.dist0 = this.distance(touches[0], touches[1]);
        onScaleStart && onScaleStart();
      }
      else if (this.isScaling && s.numberActiveTouches !== 2) {
        this.isScaling = false;
      }

      if (this.isScaling) {
        const { onScale } = this.props;
        const dist = this.distance(touches[0], touches[1]);
        const scale = dist / this.dist0;

        onScale && onScale(scale);
      }

      this.childPanHandlers && this.childPanHandlers.onResponderMove(e, s);
    }

    _onPanResponderEnd(e, s) {
      const { onScaleEnd } = this.props;
      this.isScaling = false;

      onScaleEnd && onScaleEnd();

      this.childPanHandlers && this.childPanHandlers.onResponderRelease(e, s);
    }

    render() {
      return (
        <View {...this.panResponder.panHandlers}>
          <BaseComponent ref='child' {...this.props} />
        </View>
      );
    }
  };
};

export default scalable;
