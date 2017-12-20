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
} from 'react-native';
import { BasicInfo, Stars, Users, Reviews, Review, ReviewsHeader } from './CardComponent'

import Pagination from './Pagination';
import Header from './Header';
import AnimatedBackground from './AnimatedBackground';

import { icons } from '../constants';
const { width, height } = Dimensions.get('window');

export const horizontalMargin = 10;
export const itemWidth = width - 100;
export const sliderWidth = width;
const slideWidth = itemWidth - horizontalMargin * 2;
const itemHeight = height / 2;
const cardBaseWidth = width * 0.7;
const borderRadius = 8;
const top = height / 7;

const values = {
  closed: {
    marginTop: top + 60,
    top: -itemHeight
  },
  open: {
    marginTop: top,
    paddingTop: itemHeight - top,
    top: -itemHeight + top,
    infoHeight: itemHeight + 20,
  },
  full: {
    cardHeight: height * .3,
  },
};

export const CARD_STATUS = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  FULL: 'FULL'
};

export const treshholds = [-200, -100, 0];

export default class Card extends Component {

  constructor(props) {
    super(props);

    this.state = {
      status: CARD_STATUS.CLOSED,
      isReady: false,
      scrolled: false,
    };
  }

  componentWillMount() {
    const { animatedValue } = this.props;

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => {
        return this.state.status === CARD_STATUS.OPEN;
      },
      onPanResponderGrant: (e, gestureState) => {
        this.props.disableScroll();
      },
      onPanResponderMove: (evt, gestureState) => {
      },
      onPanResponderRelease: this.handleRelease,
      onPanResponderTerminate: this.handleRelease
    });
  }

  handleRelease = (evt, { dx, dy }) => {
    const { animatedValue, index, enableScroll } = this.props;

    if (dy >= 40) {
      animatedValue.flattenOffset();
      this.closeCard();
    }

    if (dx >= -20 && dx <= 20 && dy >= -20 && dy <= 20) {
      this.handlePress(index);
    }

    enableScroll();
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
    const { animatedValue } = this.props;

    Animated.spring(animatedValue, {
      toValue: -100, friction: 10, velocity: 3
    }).start(() => {
      this.setState({ status: CARD_STATUS.OPEN })
    });
  }

  closeCard() {
    const { animatedValue } = this.props;

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
      this.setState({ status: CARD_STATUS.FULL});
    });
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

  render() {
    const { status, isReady, scrolled } = this.state;
    const { data, index, paginationIndex } = this.props;
    const y = this.props.animatedValue;
    const [firstCoord, firstName, secondCoord, secondName] = data.coordinates;
    const { blob, rating, reviews, id } = data;

    return (
      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: 1 * (+isReady),
          width: y.interpolate({
            inputRange: treshholds,
            outputRange: [width, itemWidth + (horizontalMargin * 2), itemWidth + (horizontalMargin * 2)]
          })
        }}
        scrollEnabled={scrolled}
      >
        <Animated.View
          {...this._panResponder.panHandlers}
          style={this.frontCardStyle(y, index === paginationIndex)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => this.handlePress(index)}
          >
            <AnimatedBackground
              source={{ uri: data.img }}
              style={{
                height: y.interpolate({
                  inputRange: treshholds,
                  outputRange: [values.full.cardHeight, itemHeight, itemHeight],
                }),
                padding: 4,
                borderRadius: y.interpolate({
                  inputRange: treshholds,
                  outputRange: [0, borderRadius, borderRadius]
                })
              }}
              imageStyle={{
                borderRadius: y.interpolate({
                  inputRange: treshholds,
                  outputRange: [0, borderRadius, borderRadius]
                })
              }}
              onLoadEnd={() => this.setState({ isReady: true })}
            >
              <View style={styles.cardFront}>
                <Animated.Text
                  style={[styles.fontCardTitle, {
                    opacity: y.interpolate({
                      inputRange: treshholds,
                      outputRange: [0, 1, 1]
                    })
                  }]}
                >
                  {data.name}
                </Animated.Text>
                <View style={styles.cardCoordinatesWrapper}>
                  <Text numberOfLines={1} style={styles.fontCardCoordinates}>
                    {`${firstName.toUpperCase()} LAT ${Math.floor(firstCoord)}`}
                  </Text>
                  <Image
                    source={{ uri: icons.locationIconFull }}
                    style={styles.locationIconFull}
                  />
                  <Text numberOfLines={1} style={[styles.fontCardCoordinates, { textAlign: 'right' }]}>
                    {`${secondName.toUpperCase()} LNG ${Math.floor(secondCoord)}`}
                  </Text>
                </View>
              </View>
            </AnimatedBackground>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={this.backCardStyle(y)}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => this.handlePress(index)}
          >
            <BasicInfo
              y={y}
              blob={blob}
              latitude={firstCoord}
              longitude={secondCoord}
            />
            <ReviewsHeader
              y={y}
              blob={blob}
              id={id}
              rating={rating}
              latitude={firstCoord}
              longitude={secondCoord}
            />
            <Stars
              y={y}
              rating={rating}
              id={id}
            />
            <Users
              y={y}
              reviews={reviews}
            />
            <Reviews
              y={y}
              reviews={reviews}
            />
          </TouchableOpacity>
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
      outputRange: [width, itemWidth, itemWidth]
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
      outputRange: [0, borderRadius, borderRadius]
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
    })
  })

  backCardStyle = y => ({
    height: y.interpolate({
      inputRange: [-200, -199, -150, -101, -100, -99, -1, 0, 1],
      outputRange: [undefined, undefined, itemHeight / 2, values.open.infoHeight, values.open.infoHeight, values.open.infoHeight, 0, 0, 0],
    }),
    width: y.interpolate({
      inputRange: [...treshholds, 1],
      outputRange: [width, itemWidth + horizontalMargin * 2, 0, 0]
    }),
    left: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 0, itemWidth / 2 - horizontalMargin],
    }),
    top: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, values.open.top, values.closed.top],
    }),
    paddingTop: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, values.open.paddingTop, 0],
    }),
    backgroundColor: '#fffeff',
    overflow: 'hidden',
    borderRadius: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, borderRadius, 0]
    }),
    padding: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 4, 0]
    })
  })
}

const styles = StyleSheet.create({
  cardCoordinatesWrapper: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10
  },
  locationIconFull: {
    width: 15, height: 15, resizeMode: 'contain', tintColor: 'white'
  },
  fontCardTitle: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    letterSpacing: 2,
    textShadowOffset: { width: 3, height: 3 },
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4
  },
  fontCardCoordinates: {
    color: 'white',
    fontSize: 11,
    letterSpacing: 1,
    textShadowOffset: { width: 2, height: 2 },
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
    width: cardBaseWidth / 2 - 20
  },
  cardFront: {
    backgroundColor: 'transparent',
    paddingVertical: borderRadius,
    flex: 1,
    justifyContent: 'space-between'
  }
});
