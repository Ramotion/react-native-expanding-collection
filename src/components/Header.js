import React, { Component } from 'react';
import {
  Text,
  View,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';

import { icons } from '../constants';

const { width } = Dimensions.get('window');

class Header extends Component {
  static get propTypes() {
    return {
      title: PropTypes.string.isRequired,
      animatedValue: PropTypes.object.isRequired,
      isCardFull: PropTypes.bool,
      onLocationPress: PropTypes.func
    };
  }

  static get defaultProps() {
    return {
      isCardFull: false,
      onLocationPress: () => {}
    };
  }

  render() {
    const {
      title,
      animatedValue,
      isCardFull,
      onLocationPress
    } = this.props;

    return (
      <View style={styles.sceneHeader}>
        <Image
          source={{ uri: icons.magifyIcon }}
          style={styles.headerIcon}
        />
        <Text style={styles.fontHeader}>
          { title }
        </Text>
        <TouchableOpacity onPress={() => onLocationPress()}>
          <Animated.Image
            source={{ uri: isCardFull ? icons.closeIcon : icons.crosshairIcon }}
            style={[styles.headerIcon, {
              transform: [{
                rotate: animatedValue.interpolate({
                  inputRange: [-200, -100, 0],
                  outputRange: ['360deg', '0deg', '0deg'],
                  extrapolate: 'clamp'
                })
              }]
            }]}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sceneHeader: {
    position: 'absolute',
    top: 0,
    width,
    height: 30,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10
  },
  fontHeader: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    flex: 6
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: 'white'
  }
});

export default Header;