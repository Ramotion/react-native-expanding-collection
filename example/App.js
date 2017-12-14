import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { AppLoading, Asset } from 'expo';

import ExpandingCollection from '@ramotion/react-native-expanding-collection';

import { cities } from './constants';

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
    this.loadAssetsAsync()
  }

  async loadAssetsAsync() {
    const imageAssets = cacheImages(
      cities.map(city => city.img)
    );
    
    await Promise.all([...imageAssets]);
    
    this.setState({ isReady: true })
  }

  render() {
    const { isReady } = this.state;

    if (!isReady) return <AppLoading />;

    return (
      <ExpandingCollection
        data={cities}
      />
    );
  }
}
