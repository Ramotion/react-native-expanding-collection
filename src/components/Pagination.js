import React, { Component } from 'react';
import {
  Text,
  Animated,
  StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';

class Pagination extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    animatedValue: PropTypes.object.isRequired
  };

  static defaultProps = {
    color: '#cbd2db'
  };

  render() {
    const { index, length, animatedValue, color } = this.props;

    return (
      <Animated.View
        style={[styles.container, {
          alignItems: 'center',
          height: animatedValue.interpolate({
            inputRange: [-200, -100, 0],
            outputRange: [0, 30, 30]
          }),
          opacity: animatedValue.interpolate({
            inputRange: [-200, -101, -100, 0],
            outputRange: [0, 0, 1, 1]
          })
        }]}
      >
        <Text style={[styles.text, { color }]}>
          {`${index}/${length}`}
        </Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 0
  },
  text: {
    fontSize: 16,
    fontWeight: '400'
  }
});

export default Pagination;