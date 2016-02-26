'use strict';

import React, {
  Component,
  View,
  PanResponder
} from 'react-native';

const rotatable = (BaseComponent) => {
  return class extends Component {
    isRotating = false;
    deg0 = 0.0;

    componentWillMount() {
      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => true,
        onPanResponderGrant: this._onPanResponderGrant.bind(this),
        onPanResponderMove: this._onPanResponderMove.bind(this),
        onPanResponderRelease: this._onPanResponderEnd.bind(this),
        onPanResponderTerminate: this._onPanResponderEnd.bind(this),
      })
    }

    componentDidMount() {
      this.childPanHandlers = this.refs.child && this.refs.child.panResponder &&
        this.refs.child.panResponder.panHandlers;
    }

    angle(a, b) {
      const { pageX : x1, pageY : y1 } = a;
      const { pageX : x2, pageY : y2 } = b;

      return Math.atan2(x2-x1,y2-y1)*180/Math.PI;
    }

    _onPanResponderGrant(e, s) {
      this.childPanHandlers && this.childPanHandlers.onResponderGrant(e, s);
    }

    _onPanResponderMove(e, s) {
      const { touches } = e.nativeEvent;
      if (!this.isRotating && s.numberActiveTouches === 2) {
        const { onRotateStart } = this.props;
        this.isRotating = true;
        this.deg0 = this.angle(touches[0], touches[1]);
        onRotateStart && onRotateStart();
      }
      else if (this.isRotating && s.numberActiveTouches < 2) {
        this.isRotating = false;
      }

      if (this.isRotating) {
        const { onRotate } = this.props;
        const deg = this.angle(touches[0], touches[1]);
        const diff = (deg - this.deg0 + 360) % 360;
        onRotate && onRotate(diff);
      }

      this.childPanHandlers && this.childPanHandlers.onResponderMove(e, s);
    }

    _onPanResponderEnd(e, s) {
      const { onRotateEnd } = this.props;
      this.isRotating = false;

      onRotateEnd && onRotateEnd();

      this.childPanHandlers && this.childPanHandlers.onResponderRelease(e, s);
    }

    render() {
      return (
        <View {...this.panResponder.panHandlers}>
          <BaseComponent ref='child' {...this.props} />
        </View>
      );
    }
  }
}

export default rotatable;
