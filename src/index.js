import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import Carousel from './components/Carousel';
import {
  itemWidth,
  sliderWidth,
  horizontalMargin,
} from './components/Card';

export default class ExpandingCollection extends Component {
  static get propTypes() {
    return {
      data: PropTypes.array.isRequired
    };
  }

  constructor(props) {
    super(props);
    StatusBar.setHidden(true);
  }

  render() {
    const { data } = this.props;

    return (
      <Carousel
        sliderWidth={sliderWidth}
        itemWidth={itemWidth + (horizontalMargin * 2)}
        enableSnap
        enableMomentum
        decelerationRate="fast"
        inactiveSlideOpacity={0.4}
        data={data}
      />
    );
  }
}
