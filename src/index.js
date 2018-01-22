import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import Carousel from './components/Carousel';
import {
  itemWidth,
  sliderWidth,
  horizontalMargin
} from './components/Card';

export default class ExpandingCollection extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    renderFrontCard: PropTypes.any,
    renderBackCard: PropTypes.any,
    headerCloseIconUrl: PropTypes.string,
    headerDefaultIconUrl: PropTypes.string
  }

  static defaultProps = {
    headerCloseIconUrl: 'https://www.materialui.co/materialIcons/navigation/close_black_2048x2048.png',
    headerDefaultIconUrl: 'https://cdn2.iconfinder.com/data/icons/lightly-icons/30/crosshairs-480.png'
  }

  constructor(props) {
    super(props);
    StatusBar.setHidden(true);
  }

  render() {
    const {
      data,
      renderFrontCard,
      renderBackCard,
      headerCloseIconUrl,
      headerDefaultIconUrl,
      frontCardColor,
      backCardColor,
      paginationColor,
      cardBorder,
      cardPadding
    } = this.props;

    return (
      <Carousel
        sliderWidth={sliderWidth}
        cardWidth={itemWidth}
        itemWidth={itemWidth + (horizontalMargin * 2)}
        enableMomentum
        decelerationRate="fast"
        inactiveSlideOpacity={0.4}
        data={data}
        renderFrontCard={renderFrontCard}
        renderBackCard={renderBackCard}
        headerCloseIconUrl={headerCloseIconUrl}
        headerDefaultIconUrl={headerDefaultIconUrl}
        frontCardColor={frontCardColor}
        backCardColor={backCardColor}
        cardBorder={cardBorder}
        cardPadding={cardPadding}
        paginationColor={paginationColor}
      />
    );
  }
}

export { treshholds } from './components/Card';
