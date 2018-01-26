import React from 'react';
import { StyleSheet, Animated, Text, View, Image } from 'react-native';
import { AppLoading, Asset, LinearGradient } from 'expo';

import ExpandingCollection, { treshholds, values } from '@ramotion/react-native-expanding-collection';

import { cities } from './constants';
import * as CardComponent from './CardComponent';
import AnimatedBackground from './AnimatedBackground';

const cacheImages = images => {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  })
}

export default class App extends React.Component {

  state = {
    isReady: false,
  };

  componentWillMount() {
    this.loadAssetsAsync();
  }

  async loadAssetsAsync() {
    const imageAssets = cacheImages(cities.map(city => city.img));
    await Promise.all(imageAssets);
  }

  renderFrontCard = (data, y) => {
    const [firstCoord, firstName, secondCoord, secondName] = data.coordinates;

    return (
      <AnimatedBackground
        source={{ uri: data.img }}
        style={{
          height: y.interpolate({
            inputRange: treshholds,
            outputRange: [values.full.cardHeight, values.open.cardHeight, values.closed.cardHeight],
          }),
          padding: 4,
          borderRadius: y.interpolate({
            inputRange: treshholds,
            outputRange: [0, values.borderRadius, values.borderRadius]
          })
        }}
        imageStyle={{
          borderRadius: y.interpolate({
            inputRange: treshholds,
            outputRange: [0, values.borderRadius, values.borderRadius]
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
              source={{ uri: 'https://cdn3.iconfinder.com/data/icons/pyconic-icons-1-2/512/location-pin-512.png' }}
              style={styles.locationIconFull}
            />
            <Text numberOfLines={1} style={[styles.fontCardCoordinates, { textAlign: 'right' }]}>
              {`${secondName.toUpperCase()} LNG ${Math.floor(secondCoord)}`}
            </Text>
          </View>
        </View>
      </AnimatedBackground>
    );
  }

  renderBackCard = (data, y) => {
    const [firstCoord, firstName, secondCoord, secondName] = data.coordinates;
    const { blob, rating, reviews, id } = data;

    return (
      <View style={{ flex: 1 }}>
        <CardComponent.BasicInfo
          y={y}
          blob={blob}
          latitude={firstCoord}
          longitude={secondCoord}
          treshholds={treshholds}
        />
        <CardComponent.ReviewsHeader
          y={y}
          blob={blob}
          id={id}
          rating={rating}
          latitude={firstCoord}
          longitude={secondCoord}
          treshholds={treshholds}
        />
        <CardComponent.Stars
          y={y}
          rating={rating}
          id={id}
          treshholds={treshholds}
        />
        <CardComponent.Users
          y={y}
          reviews={reviews}
          treshholds={treshholds}
        />
        <CardComponent.Reviews
          y={y}
          reviews={reviews}
          treshholds={treshholds}
        />
      </View>
    );
  }

  render() {
    const { isReady } = this.state;

    if (!isReady) return (
      <AppLoading
        startAsync={this.loadAssetsAsync}
        onFinish={() => this.setState({ isReady: true })}
      />
    );

    return (
      <LinearGradient
        colors={['#c7d0d9', '#a1acbe', '#91a2b6']}
        style={{ flex: 1 }}
      >
        <ExpandingCollection
          data={cities}
          renderFrontCard={this.renderFrontCard}
          renderBackCard={this.renderBackCard}
        />
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  cardCoordinatesWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10
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
    textShadowRadius: 4
  },
  cardFront: {
    backgroundColor: 'transparent',
    paddingVertical: values.borderRadius,
    flex: 1,
    justifyContent: 'space-between'
  }
});
