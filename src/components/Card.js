import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
  Easing,
  PanResponder,
  ScrollView,
  Platform
} from 'react-native';
import { Constants } from 'expo';

import Pagination from './Pagination';
import Header from './Header';

import { icons } from '../constants';
const { width, height } = Dimensions.get('window');

const isIOS = Platform.OS === 'ios';

const isFullScreen = Constants.platform.ios.model.includes('iPhone 5');

export const horizontalMargin = isFullScreen ? 30 : 10;
export const itemWidth = isFullScreen ? width - 60 : width - 100;
export const sliderWidth = width;

const cardItemWidth = isFullScreen ? width - 60 : itemWidth;

const slideWidth = isFullScreen ? width - horizontalMargin * 2 : itemWidth - horizontalMargin * 2;
const itemHeight = isFullScreen ? height * 0.6 : height / 2;
const cardBaseWidth = isFullScreen ? width * 0.8 : width * 0.7;
const borderRadius = 8;
const top = isFullScreen ? height / 10 : height / 7;

const backCardWidth = isFullScreen ? (cardItemWidth + horizontalMargin) : (cardItemWidth + horizontalMargin * 2);
const backCardLeft = isFullScreen ? (horizontalMargin / 2) : (cardItemWidth / 2 - horizontalMargin);

export const values = {
  closed: {
    marginTop: top + 60,
    top: -itemHeight,
    cardHeight: itemHeight
  },
  open: {
    marginTop: top,
    paddingTop: itemHeight - top,
    top: -itemHeight + top,
    infoHeight: isFullScreen ? itemHeight + 60 : itemHeight + 30,
    cardHeight: itemHeight
  },
  full: {
    cardHeight: height * .3,
  },
  borderRadius
};

export const CARD_STATUS = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  FULL: 'FULL'
};

export const treshholds = [-200, -100, 0];

export default class Card extends Component {
  static defaultProps = {
    frontCardColor: '#fffeff',
    backCardColor: '#fffeff',
    cardBorder: 8,
    cardPadding: 4,
    onOpenCard: () => { },
    onCloseCard: () => { },
    renderFrontCard: () => null,
    renderBackCard: () => null
  };

  constructor(props) {
    super(props);

    this.state = {
      status: CARD_STATUS.CLOSED,
      isReady: !!props.renderFrontCard,
      scrolled: false,
    };
  }

  componentWillMount() {
    const { animatedValue } = this.props;
    const { status } = this.state;

    if (isIOS) {
      this._panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
          const draggedDown = dy > 30;
          const draggedUp = dy < -30;
          const draggedLeft = dx < -30;
          const draggedRight = dx > 30;

          return draggedDown || draggedUp || draggedLeft || draggedRight;
        },
        onPanResponderRelease: this.handleRelease,
        onPanResponderTerminate: this.handleRelease
      });
    } else {
      this._panResponder = PanResponder.create({
        onPanResponderTerminationRequest: () => true,
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onShouldBlockNativeResponder: (evt, gestureState) => false,
        onPanResponderRelease: this.handleRelease,
        onPanResponderTerminate: this.handleRelease
      });
    }
  }

  handleRelease = (evt, { dx, dy }) => {
    const { animatedValue, index, enableScroll } = this.props;
    const isCardFull = this.state.status === CARD_STATUS.FULL;

    if (!isCardFull && dy >= 40) {
      animatedValue.flattenOffset();
      this.setState({ status: CARD_STATUS.CLOSED });
      this.closeCard();
      enableScroll();
      return;
    }

    if (!isIOS && dx >= -2 && dx <= 2 && dy >= -2 && dy <= 2) {
      this.handlePress(index);
      enableScroll();
    }

  }

  handlePress(index) {
    const { status } = this.state;
    const { paginationIndex } = this.props;

    if (index !== paginationIndex) {
      return;
    }

    if (status === CARD_STATUS.CLOSED) {
      this.openCard(index);
    }

    if (status === CARD_STATUS.OPEN) {
      this.openCardFull(index);
    }
  }


  openCard(index) {
    const { animatedValue, onOpenCard } = this.props;

    onOpenCard();
    Animated.spring(animatedValue, {
      toValue: -100, friction: 10, velocity: 3
    }).start(() => {
      this.setState({ status: CARD_STATUS.OPEN })
    });
  }

  closeCard() {
    const { animatedValue, onCloseCard } = this.props;

    onCloseCard();
    Animated.spring(animatedValue, {
      toValue: 0, friction: 10, velocity: 3
    }).start(() => {
      this.setState({ status: CARD_STATUS.CLOSED })
    });
  }

  openCardFull(index) {
    const { animatedValue } = this.props;
    const { onOpenToFull, additionalAnimationOnOpen, paginationLength, opacityValues } = this.props;

    onOpenToFull();

    const animations = [];
    if (index - 1 >= 0) {
      animations.push(Animated.spring(opacityValues[index - 1], {
        toValue: 1, friction: 10, velocity: 3
      }));
    }

    if (index + 1 < paginationLength) {
      animations.push(Animated.spring(opacityValues[index + 1], {
        toValue: 1, friction: 10, velocity: 3
      }));
    }

    this.setState({ scrolled: true });

    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: -200, friction: 10, velocity: 3
      }),
      ...animations
    ]).start(() => {
      this.setState({ status: CARD_STATUS.FULL });
    });
  }

  hideCardFullWithoutAnimation() {
    const { animatedValue } = this.props;
    const { onFullToOpen, paginationLength, opacityValues } = this.props;
    const { status } = this.state;
    onFullToOpen();

    if (status === CARD_STATUS.FULL) {
      this.setState({ scrolled: false });
      animatedValue.setValue(-100);
      this.setState({ status: CARD_STATUS.OPEN });
    }
  }

  hideCardFull(index) {
    const { animatedValue } = this.props;
    const { onFullToOpen, paginationLength, opacityValues } = this.props;

    onFullToOpen();

    const animations = [];
    if (index - 1 >= 0) {
      animations.push(Animated.spring(opacityValues[index - 1], {
        toValue: 0, friction: 10, velocity: 3
      }));
    }

    if (index + 1 < paginationLength) {
      animations.push(Animated.spring(opacityValues[index + 1], {
        toValue: 0, friction: 10, velocity: 3
      }));
    }

    this.setState({ scrolled: false });

    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: -100, friction: 10, velocity: 3
      }),
      ...animations
    ]).start(() => {
      this.setState({ status: CARD_STATUS.OPEN });
    });
  }

  renderFront = (data, y, index) => {
    const { renderFrontCard } = this.props;

    if (isIOS) {
      return (
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => this.handlePress(index)}
        >
          {renderFrontCard(data, y, index)}
        </TouchableOpacity>
      );
    }

    return renderFrontCard(data, y, index);
  }

  renderBack = (data, y, index) => {
    return (
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => this.handlePress(index)}
      >
        {this.props.renderBackCard(data, y, index)}
      </TouchableOpacity>
    );
  }

  render() {
    const { status, isReady, scrolled } = this.state;
    const { data, index, paginationIndex } = this.props;
    const y = this.props.animatedValue;

    return (
      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: 1 * (+isReady),
          width: y.interpolate({
            inputRange: treshholds,
            outputRange: [width, isFullScreen ? width : itemWidth + (horizontalMargin * 2), itemWidth + (horizontalMargin * 2)]
          })
        }}
        scrollEnabled={scrolled}
      >
        <Animated.View
          {...this._panResponder.panHandlers}
          style={this.frontCardStyle(y, index === paginationIndex)}
        >
          {this.renderFront(data, y, index)}
        </Animated.View>
        <Animated.View style={this.backCardStyle(y)}>
          {this.renderBack(data, y, index)}
        </Animated.View>
      </Animated.ScrollView>
    );
  }

  frontCardStyle = (y, isActive) => ({
    zIndex: 1,
    left: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, horizontalMargin, horizontalMargin]
    }),
    width: y.interpolate({
      inputRange: treshholds,
      outputRange: [width, cardItemWidth, cardItemWidth]
    }),
    height: y.interpolate({
      inputRange: treshholds,
      outputRange: [values.full.cardHeight, itemHeight, itemHeight],
    }),
    marginTop: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, values.open.marginTop, values.closed.marginTop]
    }),
    borderRadius: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, this.props.cardBorder, this.props.cardBorder]
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: y.interpolate({
      inputRange: treshholds,
      outputRange: [0.0, 0.4, 0.4]
    }),
    elevation: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 0, isActive ? 10 : 0]
    }),
    backgroundColor: this.props.frontCardColor
  })

  backCardStyle = y => ({
    height: y.interpolate({
      inputRange: [-200, -199, -150, -101, -100, -99, -1, 0, 1],
      outputRange: [undefined, undefined, itemHeight / 2, values.open.infoHeight, values.open.infoHeight, values.open.infoHeight, 0, 0, 0],
    }),
    width: y.interpolate({
      inputRange: [...treshholds, 1],
      outputRange: [width, backCardWidth, 0, 0]
    }),
    left: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, isFullScreen ? backCardLeft : 0, isFullScreen ? width / 2 : backCardLeft],
    }),
    top: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, values.open.top, values.closed.top],
    }),
    paddingTop: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, values.open.paddingTop, 0],
    }),
    backgroundColor: this.props.backCardColor,
    overflow: 'hidden',
    borderRadius: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, this.props.cardBorder, 0]
    }),
    padding: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, this.props.cardPadding, 0]
    })
  })
}
