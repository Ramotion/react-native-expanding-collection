import React, { Component } from 'react';
import { ViewPagerAndroid, Dimensions, View, ScrollView, Animated, Platform, Easing, I18nManager, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import _debounce from 'lodash.debounce';
import { LinearGradient } from 'expo';

const IS_RTL = I18nManager.isRTL;
const { width, height } = Dimensions.get('window');

import Card from './Card';
import Pagination from './Pagination';
import Header from './Header';

export default class Carousel extends Component {

  static get propTypes() {
    return {
      ...ScrollView.propTypes,
      itemWidth: PropTypes.number,
      itemHeight: PropTypes.number,
      sliderWidth: PropTypes.number,
      sliderHeight: PropTypes.number,
      activeSlideOffset: PropTypes.number,
      animationFunc: PropTypes.string,
      animationOptions: PropTypes.object,
      carouselHorizontalPadding: PropTypes.number,
      carouselVerticalPadding: PropTypes.number,
      containerCustomStyle: ViewPropTypes ? ViewPropTypes.style : View.propTypes.style,
      contentContainerCustomStyle: ViewPropTypes ? ViewPropTypes.style : View.propTypes.style,
      enableMomentum: PropTypes.bool,
      enableSnap: PropTypes.bool,
      firstItem: PropTypes.number,
      inactiveSlideOpacity: PropTypes.number,
      inactiveSlideScale: PropTypes.number,
      scrollEndDragDebounceValue: PropTypes.number,
      slideStyle: Animated.View.propTypes.style,
      shouldOptimizeUpdates: PropTypes.bool,
      snapOnAndroid: PropTypes.bool,
      onScrollViewScroll: PropTypes.func,
      onSnapToItem: PropTypes.func
    };
  };

  static get defaultProps() {
    return {
      activeSlideOffset: 25,
      animationFunc: 'timing',
      animationOptions: {
        duration: 600,
        easing: Easing.elastic(1)
      },
      carouselHorizontalPadding: null,
      carouselVerticalPadding: null,
      containerCustomStyle: {},
      contentContainerCustomStyle: {},
      enableMomentum: false,
      enableSnap: true,
      firstItem: 0,
      inactiveSlideOpacity: 1,
      inactiveSlideScale: 0.9,
      scrollEndDragDebounceValue: Platform.OS === 'ios' ? 50 : 150,
      slideStyle: {},
      shouldOptimizeUpdates: true,
      snapOnAndroid: true,
      swipeThreshold: 80
    };
  }

  constructor(props) {
    super(props);

    const initialActiveItem = this._getFirstItem(props.firstItem);
    this.state = {
      activeItem: initialActiveItem,
      previousActiveItem: initialActiveItem,
      previousFirstItem: initialActiveItem,
      interpolators: [],
      animatedValues: [],
      opacityValues: [],
      dragEnabled: true,
    };

    this.cards = [];
    this._positions = [];
    this._currentContentOffset = 0;
    this._hasFiredEdgeItemCallback = false;
    this._canFireCallback = false;
    this._isShortSnapping = false;
    this._initInterpolators = this._initInterpolators.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onScrollBeginDrag = this._snapEnabled ? this._onScrollBeginDrag.bind(this) : null;
    this._onScrollEnd = this._snapEnabled ? this._onScrollEnd.bind(this) : null;
    this._onScrollEndDrag = !props.enableMomentum ? this._onScrollEndDrag.bind(this) : null;
    this._onMomentumScrollEnd = props.enableMomentum ? this._onMomentumScrollEnd.bind(this) : null;
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchRelease = this._onTouchRelease.bind(this);
    this._onLayout = this._onLayout.bind(this);
    this._onSnap = this._onSnap.bind(this);

    this._onScrollEndDragDebounced = !props.scrollEndDragDebounceValue ?
      this._onScrollEndDragDebounced.bind(this) :
      _debounce(
        this._onScrollEndDragDebounced,
        props.scrollEndDragDebounceValue,
        { leading: false, trailing: true }
      ).bind(this);

    this._ignoreNextMomentum = false;

    if (props.onScrollViewScroll) {
      console.warn('react-native-snap-carousel: Prop `onScrollViewScroll` is deprecated. Please use `onScroll` instead');
    }
  }

  componentWillMount() {
    const animatedValues = [], opacityValues = [];

    this.props.data.forEach(() => {
      animatedValues.push(new Animated.Value(0));
      opacityValues.push(new Animated.Value(0));
    });

    this.setState({ opacityValues, animatedValues });
  }

  componentDidMount() {
    const { firstItem } = this.props;
    const _firstItem = this._getFirstItem(firstItem);

    this._initInterpolators(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.shouldOptimizeUpdates === false) {
      return true;
    } else {
      return shallowCompare(this, nextProps, nextState);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { activeItem, interpolators, previousFirstItem } = this.state;
    const { firstItem, sliderWidth, sliderHeight, itemWidth, itemHeight } = nextProps;

    const childrenLength = React.Children.count(nextProps.children);
    const nextFirstItem = this._getFirstItem(firstItem, nextProps);
    const nextActiveItem = activeItem || activeItem === 0 ? activeItem : nextFirstItem;

    const hasNewSliderWidth = sliderWidth && sliderWidth !== this.props.sliderWidth;
    const hasNewSliderHeight = sliderHeight && sliderHeight !== this.props.sliderHeight;
    const hasNewItemWidth = itemWidth && itemWidth !== this.props.itemWidth;
    const hasNewItemHeight = itemHeight && itemHeight !== this.props.itemHeight;

    if ((childrenLength && interpolators.length !== childrenLength) ||
      hasNewSliderWidth || hasNewSliderHeight || hasNewItemWidth || hasNewItemHeight) {
      this._positions = [];
      this._calcCardPositions(nextProps);
      this._initInterpolators(nextProps);

      if (hasNewSliderWidth || hasNewSliderHeight || hasNewItemWidth || hasNewItemHeight ||
        (IS_RTL && !nextProps.vertical)) {
        this.snapToItem(nextActiveItem, true, false);
      }
      this.setState({ activeItem: nextActiveItem });
    } else if (nextFirstItem !== previousFirstItem && nextFirstItem !== activeItem) {
      this.snapToItem(nextFirstItem);
      this.setState({
        previousFirstItem: nextFirstItem,
        activeItem: nextFirstItem
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this._snapNoMomentumTimeout);
    clearTimeout(this._scrollToTimeout);
  }

  get _snapEnabled() {
    const { enableSnap, snapOnAndroid } = this.props;

    return enableSnap && (Platform.OS === 'ios' || snapOnAndroid);
  }

  get currentIndex() {
    return this.state.activeItem;
  }

  get currentScrollPosition() {
    return this._currentContentOffset;
  }

  _getCustomIndex(index, props = this.props) {
    const childrenLength = this._children(props).length;

    if (!childrenLength || (!index && index !== 0)) {
      return 0;
    }

    return IS_RTL && !props.vertical ?
      childrenLength - index - 1 :
      index;
  }

  _getFirstItem(index, props = this.props) {
    const childrenLength = this._children(props).length;

    if (!childrenLength || index > childrenLength - 1 || index < 0) {
      return 0;
    }

    return index;
  }

  _calcCardPositions(props = this.props) {
    const { itemWidth, itemHeight } = props;

    const sizeRef = itemWidth;

    this._children(props).map((item, index) => {
      const _index = this._getCustomIndex(index, props);

      this._positions[index] = {
        start: _index * sizeRef,
        end: _index * sizeRef + sizeRef
      };
    });
  }

  _initInterpolators(props = this.props) {
    const { firstItem } = props;
    const _firstItem = this._getFirstItem(firstItem, props);
    let interpolators = [];

    this._children(props).map((item, index) => {
      const value = index === _firstItem ? 1 : 0;
      interpolators.push({
        opacity: new Animated.Value(value),
        scale: new Animated.Value(value)
      });
    });
    this.setState({ interpolators });
  }

  _getScrollOffset(event) {
    return (event && event.nativeEvent && event.nativeEvent.contentOffset &&
      event.nativeEvent.contentOffset['x']) || 0;
  }

  _getActiveItem(offset) {
    const { activeSlideOffset } = this.props;

    const center = this._getCenter(offset);

    for (let i = 0; i < this._positions.length; i++) {
      const { start, end } = this._positions[i];
      if (center + activeSlideOffset >= start && center - activeSlideOffset <= end) {
        return i;
      }
    }
    return 0;
  }

  _getCenter(offset) {
    const { sliderWidth, sliderHeight, itemWidth, itemHeight } = this.props;

    const containerMargin = (sliderWidth - itemWidth) / 2;

    return offset - containerMargin + (sliderWidth / 2);
  }

  _getSlideAnimation(index, toValue) {
    const { animationFunc, animationOptions } = this.props;

    const animationCommonOptions = {
      isInteraction: false,
      useNativeDriver: true,
      ...animationOptions,
      toValue: toValue
    };

    return Animated.parallel([
      Animated['timing'](
        this.state.interpolators[index].opacity,
        { ...animationCommonOptions, easing: Easing.linear }
      ),
      Animated[animationFunc](
        this.state.interpolators[index].scale,
        { ...animationCommonOptions }
      )
    ]);
  }

  _onScroll(event) {
    const { enableMomentum, onScroll, onScrollViewScroll } = this.props;
    const { activeItem } = this.state;

    const scrollOffset = this._getScrollOffset(event);
    const newActiveItem = this._getActiveItem(scrollOffset);
    const itemsLength = this._positions.length;
    let animations = [];
    this._currentContentOffset = scrollOffset;

    if (enableMomentum) {
      clearTimeout(this._snapNoMomentumTimeout);
    }

    if (activeItem !== newActiveItem) {
      this.setState({ activeItem: newActiveItem }, () => {
        if (!enableMomentum && this._canFireCallback && this._isShortSnapping) {
          this._isShortSnapping = false;
          this._onSnap(newActiveItem);
        }
      });

      if (this.state.interpolators[activeItem]) {
        animations.push(this._getSlideAnimation(activeItem, 0));
      }
      if (this.state.interpolators[newActiveItem]) {
        animations.push(this._getSlideAnimation(newActiveItem, 1));
      }
      Animated.parallel(animations, { stopTogether: false }).start();

      if (activeItem === 0 || activeItem === itemsLength - 1) {
        this._hasFiredEdgeItemCallback = false;
      }
    }

    if (!enableMomentum && this._canFireCallback && !this._isShortSnapping &&
      (this._scrollStartActive !== newActiveItem || !this._hasFiredEdgeItemCallback) &&
      this._itemToSnapTo === newActiveItem) {
      this.setState({ activeItem: newActiveItem }, () => {
        this._onSnap(newActiveItem);
      });
    }

    if (onScroll) {
      onScroll(event);
    }

    if (onScrollViewScroll) {
      onScrollViewScroll(event);
    }
  }

  _onTouchStart() {
  }

  _onScrollBeginDrag(event) {
    this.setState({
      changeIndexEnabled: false
    });
    this._scrollStartOffset = this._getScrollOffset(event);
    this._scrollStartActive = this._getActiveItem(this._scrollStartOffset);
    this._ignoreNextMomentum = false;
    this._canFireCallback = false;
  }

  _onScrollEndDrag(event) {
    this._onScrollEndDragDebounced();
  }

  _onScrollEndDragDebounced(event) {
    if (this._scrollview && this._onScrollEnd) {
      this._onScrollEnd();
    }
  }

  _onMomentumScrollEnd(event) {
    if (this._scrollview && this._onScrollEnd) {
      this._onScrollEnd();
    }
  }

  _onScrollEnd(event) {
    this.setState({
      changeIndexEnabled: true
    })
    if (this._ignoreNextMomentum) {
      this._ignoreNextMomentum = false;
      return;
    }

    this._scrollEndOffset = this._currentContentOffset;
    this._scrollEndActive = this._getActiveItem(this._scrollEndOffset);

    if (this._snapEnabled) {
      const delta = this._scrollEndOffset - this._scrollStartOffset;
      this._snapScroll(delta);
    }
  }

  _onTouchRelease(event) {
    if (this.props.enableMomentum && Platform.OS === 'ios') {
      clearTimeout(this._snapNoMomentumTimeout);
      this._snapNoMomentumTimeout = setTimeout(() => {
        this.snapToItem(this.currentIndex);
      }, 100);
    }
  }

  _onLayout(event) {
    const { onLayout } = this.props;

    this._calcCardPositions();
    this.snapToItem(this.currentIndex, false, false);

    if (onLayout) {
      onLayout(event);
    }
  }

  _snapScroll(delta) {
    const { swipeThreshold } = this.props;

    if (!this._scrollEndActive && this._scrollEndActive !== 0 && Platform.OS === 'ios') {
      this._scrollEndActive = this._scrollStartActive;
    }

    if (this._scrollStartActive !== this._scrollEndActive) {
      this._isShortSnapping = false;

      this.snapToItem(this._scrollEndActive);
    } else {
      this._isShortSnapping = true;

      if (delta > 0) {
        if (delta > swipeThreshold) {
          this.snapToItem(this._scrollEndActive + 1);
        } else {
          this.snapToItem(this._scrollEndActive);
        }
      } else if (delta < 0) {
        if (delta < -swipeThreshold) {
          this.snapToItem(this._scrollStartActive - 1);
        } else {
          this.snapToItem(this._scrollEndActive);
        }
      }
    }
  }

  _onSnap(index) {
    const { enableMomentum } = this.props;
    let closeIndex = this.state.previousActiveItem;

    if (this.state.changeIndexEnabled) {
      // this.onSnapToItem(index);
    }
    // this.onSnapToItem(index);

    const itemsLength = this._positions.length;

    if (this._scrollview) {
      if (enableMomentum) {
        // this.onSnapToItem(index);
      } else if (this._canFireCallback) {
        this._canFireCallback = false;

        if (index === 0 || index === itemsLength - 1) {
          this._hasFiredEdgeItemCallback = true;
        }

        // this.onSnapToItem(index);
      }
    }

    this.cards[closeIndex].closeCard();
  }

  snapToItem(index, animated = true, fireCallback = true, initial = false) {
    const { previousActiveItem } = this.state;
    const { enableMomentum, scrollEndDragDebounceValue } = this.props;

    const itemsLength = this._positions.length;
    let closeIndex = previousActiveItem;

    if (!index) {
      index = 0;
    }

    if (itemsLength > 0 && index >= itemsLength) {
      index = itemsLength - 1;
      if (this._scrollStartActive === itemsLength - 1 && this._hasFiredEdgeItemCallback) {
        fireCallback = false;
      }
    } else if (index < 0) {
      index = 0;
      if (this._scrollStartActive === 0 && this._hasFiredEdgeItemCallback) {
        fireCallback = false;
      }
    } else if (enableMomentum && index === previousActiveItem) {
      fireCallback = false;
    }

    if (this._scrollview) {
      const snapTo = itemsLength && this._positions[index].start;

      if (enableMomentum) {
        this.setState({ previousActiveItem: index });
        if (fireCallback) {
          this._onSnap(index);
        }
      } else {
        this._itemToSnapTo = index;

        this._canFireCallback = this.props.onSnapToItem && fireCallback;

        const scrollPosition = this._currentContentOffset;
        clearTimeout(this._scrollToTimeout);
        this._scrollToTimeout = setTimeout(() => {
          if (scrollPosition === this._currentContentOffset && this._canFireCallback) {
            this._onSnap(index);
          }
        }, Math.max(200, scrollEndDragDebounceValue + 50));
      }

      this._scrollview.scrollTo({
        x: snapTo,
        y: 0,
        animated
      });

      if (!initial && Platform.OS === 'ios') {
        this._ignoreNextMomentum = true;
      }
    }

    // this.cards[closeIndex].closeCard();
  }

  snapToNext(animated = true) {
    const itemsLength = this._positions.length;

    let newIndex = this.currentIndex + 1;
    if (newIndex > itemsLength - 1) {
      newIndex = 0;
    }
    this.snapToItem(newIndex, animated);
  }

  snapToPrev(animated = true) {
    const itemsLength = this._positions.length;

    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = itemsLength - 1;
    }
    this.snapToItem(newIndex, animated);
  }

  _children(props = this.props) {
    return props.data;
  }

  _childSlides() {
    const { slideStyle, inactiveSlideScale, inactiveSlideOpacity, inactiveOpacityInterpolation } = this.props;
    const { activeItem } = this.state;
    const { opacityValues, animatedValues } = this.state;
    const { data } = this.props;

    if (!this.state.interpolators || !this.state.interpolators.length) {
      return false;
    };

    return this._children().map((child, index) => {
      const animatedValue = this.state.interpolators[index];

      if (!animatedValue || !animatedValue.opacity || !animatedValue.scale) {
        return false;
      }

      return (
        <Animated.View
          key={`carousel-item-${index}`}
          style={[
            slideStyle,
            {
              opacity: animatedValue.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [inactiveSlideOpacity, 1]
              }),
              transform: [{
                scale: animatedValue.scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [inactiveSlideScale, 1]
                })
              }]
            }
          ]}>
          <Card
            ref={ref => { this.cards[index] = ref; }}
            key={child.id}
            index={index}
            paginationIndex={activeItem}
            paginationLength={data.length}
            animatedValue={animatedValues[index]}
            opacityValues={opacityValues}
            data={child}
            onOpenToFull={() => { this.setState({ dragEnabled: false }); }}
            onFullToOpen={() => { this.setState({ dragEnabled: true }); }}
            enableScroll={() =>  this.enableScroll()}
            disableScroll={() =>  this.disableScroll()}
          />
        </Animated.View>
      );
    });
  }

  disableScroll = () => {
    this._scrollview.setNativeProps({ scrollEnabled: false });
  }

  enableScroll = () => {
    this._scrollview.setNativeProps({ scrollEnabled: true });
  }

  render() {
    const {
      sliderHeight,
      itemWidth,
      itemHeight,
      containerCustomStyle,
      contentContainerCustomStyle,
      enableMomentum,
      carouselHorizontalPadding,
      carouselVerticalPadding,

      sliderWidth,
      animatedValue,
      data
    } = this.props;

    const { 
      interpolators,
      activeItem,
      animatedValues,
      dragEnabled,
    } = this.state;


    if (interpolators.length <= 0) {
      return null;
    }

    const horizontalMargin = carouselHorizontalPadding || carouselHorizontalPadding === 0 ?
      carouselHorizontalPadding :
      (sliderWidth - itemWidth) / 2;

    const style = [
      containerCustomStyle || {},
      {
        flexDirection: 'row',
        paddingHorizontal: animatedValues[activeItem].interpolate({
          inputRange: [-200, -100, 0],
          outputRange: [0, horizontalMargin, horizontalMargin]
        })
      }
    ];

    const absoluteWidth =
      (data.length * itemWidth) +
      (data.length * horizontalMargin) -
      horizontalMargin;

    const contentContainerStyle = [
      contentContainerCustomStyle || {},
      {
        width: absoluteWidth
      }
    ];

    return (
      <LinearGradient
        colors={['#c7d0d9', '#a1acbe', '#91a2b6']}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          decelerationRate={0.9}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          {...this.props}
          ref={(ref) => { if (ref) { this._scrollview = ref._component; } }}
          style={style}
          contentContainerStyle={contentContainerStyle}
          horizontal
          alwaysBounceHorizontal
          removeClippedSubviews={false}
          scrollEnabled={dragEnabled}
          onScroll={this._onScroll}
          onScrollBeginDrag={this._onScrollBeginDrag}
          onScrollEndDrag={this._onScrollEndDrag}
          onMomentumScrollEnd={this._onMomentumScrollEnd}
          onResponderRelease={this._onTouchRelease}
          onTouchStart={this._onTouchStart}
          onLayout={this._onLayout}
        >
          {this._childSlides()}
        </Animated.ScrollView>
        <Header
          title="TOFIND"
          animatedValue={animatedValues[activeItem]}
          isCardFull={!dragEnabled}
          onLocationPress={() => this.cards[activeItem].hideCardFull(activeItem)}
          onClosePress={() => this.cards[activeItem].hideCardFull(activeItem)}
        />
        <Pagination
          index={activeItem + 1}
          length={data.length}
          animatedValue={animatedValues[activeItem]}
        />
      </LinearGradient>
    );
  }
}
