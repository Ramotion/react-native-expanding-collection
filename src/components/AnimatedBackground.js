// @flow
import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
} from 'react-native';
import ensureComponentIsNative from 'ensureComponentIsNative';

import type { NativeMethodsMixinType } from 'ReactNativeTypes';

class AnimatedBackground extends Component {
  setNativeProps(props: Object) {
    const viewRef = this._viewRef;
    if (viewRef) {
      ensureComponentIsNative(viewRef);
      viewRef.setNativeProps(props);
    }
  }

  _viewRef: ?NativeMethodsMixinType = null;

  _captureRef = ref => {
    this._viewRef = ref;
  };

  render() {
    const { children, style, imageStyle, imageRef, ...props } = this.props;

    return (
      <Animated.View style={style} ref={this._captureRef}>
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
