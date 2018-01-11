import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
} from 'react-native';

import type { NativeMethodsMixinType } from 'ReactNativeTypes';

class AnimatedBackground extends Component {
  setNativeProps(props) {
    const viewRef = this._viewRef;
    if (viewRef) {
      viewRef.setNativeProps(props);
    }
  }

  _viewRef = null;

  _captureRef = ref => {
    this._viewRef = ref;
  };

  render() {
    const { children, panHandlers, style, imageStyle, imageRef, ...props } = this.props;

    return (
      <Animated.View style={style} ref={this._captureRef} {...panHandlers}>
        <Animated.Image
          {...props}
          style={[
            StyleSheet.absoluteFill,
            {
              width: style.width,
              height: style.height,
            },
            imageStyle,
          ]}
          ref={imageRef}
        />
        {children}
      </Animated.View>
    );
  }
}

export default AnimatedBackground;
