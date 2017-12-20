import React from 'react';
import {
  Animated, Dimensions, Image,
  View, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import { MapView } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import { icons } from '../constants';
import { treshholds } from './Card';

const { width } = Dimensions.get('window');

const BasicInfo = ({
  blob, y, latitude, longitude
}) => (
  <Animated.View style={[styles.contentBase, {
    height: y.interpolate({
      inputRange: [-200, -199, -100, 0],
      outputRange: [0, 0, 40, 0]
    }),
    opacity: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 1, 0]
    }),
    overflow: 'hidden'
  }]}>
    <Text numberOfLines={1} style={styles.fontCityBlob}>
      {blob}
    </Text>
  </Animated.View>
);
BasicInfo.propTypes = {
  blob: PropTypes.string.isRequired,
  y: PropTypes.object.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired
};

const Stars = ({ rating, id, y }) => {
  const getStarsStyle = y => ({
    height: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 20, 0]
    }),
    opacity: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 1, 0]
    })
  });

  return (
    <Animated.View style={[styles.starsContainer, getStarsStyle(y)]}>
      <Text style={{ color: '#736e74', fontSize: 12 }}>
        {`NO. ${id}`}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((item, idx) => (
          <Ionicons
            key={`rating_star_${idx}`}
            name="md-star"
            size={20}
            style={{ paddingLeft: 2 }}
            color={item <= rating ? '#838cdf' : '#c3c3c8'}
          />
        ))}
      </View>
    </Animated.View>
  );
};
Stars.propTypes = {
  rating: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  y: PropTypes.object.isRequired
};

const Review = ({ review, y }) => (
  <Animated.View style={[styles.reviewWrapper, {
    height: y.interpolate({
      inputRange: [-200, -150, -101, -100, 0],
      outputRange: [undefined, 0, 0, 0, 0]
    }),
    opacity: y.interpolate({
      inputRange: [-200, -150, -100, 0],
      outputRange: [1, 0, 0, 0]
    })
  }]}>
    <View style={styles.reviewHeaderWrapper}>
      <View style={styles.reviewAvatarWrapper}>
        <Image
          source={{ uri: review.userAvatar }}
          style={styles.reviewAvatar}
        />
      </View>
      <Text style={styles.fontReviewTextName}>
        {review.userName}
      </Text>
      <Text style={styles.fontReviewTextDate}>
        {review.date}
      </Text>
      <TouchableOpacity>
        <Image source={{ uri: icons.thumbUpIcon }} style={styles.likeIcon} />
      </TouchableOpacity>
    </View>
    <Text style={styles.fontReviewText} numberOfLines={3} >
      {review.review}
    </Text>
  </Animated.View>
);
Review.propTypes = {
  y: PropTypes.object.isRequired,
  review: PropTypes.object.isRequired
};

const Reviews = ({ y, reviews }) => reviews.map((review, idx) => (
  <Review key={`review_${idx}`} review={review} y={y} />
));
Reviews.propTypes = {
  y: PropTypes.object.isRequired,
  reviews: PropTypes.arrayOf(Review.propTypes.review).isRequired
};

const ReviewsHeader = ({ id, rating, blob, y, latitude, longitude }) => {
  const getHeaderStyle = y => ({
    height: y.interpolate({
      inputRange: treshholds,
      outputRange: [100, 0, 0],
      extrapolate: 'clamp'
    }),
    width: y.interpolate({
      inputRange: treshholds,
      outputRange: [width, 0, 0],
      extrapolate: 'clamp'
    }),
    opacity: y.interpolate({
      inputRange: treshholds,
      outputRange: [1, 0, 0]
    })
  });

  return (
    <Animated.View style={getHeaderStyle(y)}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
        scrollEnabled={false}
        rotateEnabled={false}
        zoomEnabled={false}
      />
      <Text
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          backgroundColor: 'transparent'
        }}
        numberOfLines={1}
      >
        {blob}
      </Text>
      <Text style={{
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 40,
        left: 20,
        color: '#736e74',
        fontSize: 12
      }}>
        {`NO. ${id}`}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          position: 'absolute',
          backgroundColor: 'transparent',
          top: 65,
          left: 20
        }}
      >
        {[1, 2, 3, 4, 5].map((item, idx) => (
          <Ionicons
            key={`rating_star_${idx}`}
            name="md-star"
            size={20}
            style={{ paddingLeft: 2 }}
            color={item <= rating ? '#838cdf' : '#c3c3c8'}
          />
        ))}
      </View>
    </Animated.View>
  );
};
ReviewsHeader.propTypes = {
  id: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  blob: PropTypes.string.isRequired,
  y: PropTypes.object.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired
};


const Users = ({ reviews, y }) => {
  const getUsersStyle = y => ({
    height: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 42, 0],
      extrapolate: 'clamp'
    }),
    opacity: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp'
    }),
    marginVertical: y.interpolate({
      inputRange: treshholds,
      outputRange: [0, 20, 0],
      extrapolate: 'clamp'
    })
  });

  return (
    <Animated.View style={{
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 10,
      alignItems: 'center',
      justifyContent: 'space-between',
      height: y.interpolate({
        inputRange: treshholds,
        outputRange: [0, 40, 0]
      }),
      opacity: y.interpolate({
        inputRange: treshholds,
        outputRange: [0, 1, 0]
      })
    }}>
      <Animated.View
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          paddingBottom: 4
        }, getUsersStyle(y)]}
      >
        {
          reviews.map((review, idx) => (
            <Image
              key={`avatar_${idx}`}
              source={{ uri: review.userAvatar }}
              style={[{ transform: [{ translateX: -6 * idx }] }, styles.avatarStyle]}
            />
          ))
        }
      </Animated.View>
      <Ionicons
        name="md-more"
        color="#dad9da"
        size={30}
      />
    </Animated.View>
  );
};
Users.propTypes = {
  y: PropTypes.object.isRequired,
  reviews: Reviews.propTypes.reviews
};

const styles = StyleSheet.create({
  avatarStyle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    resizeMode: 'cover'
  },
  contentBase: {
    height: 40,
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  fontCityBlob: {
    backgroundColor: 'transparent',
    textAlign: 'center',
    color: '#736e74',
    fontSize: 14
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 20
  },
  reviewWrapper: {
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 15
  },
  reviewHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 5
  },
  reviewAvatarWrapper: {
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    borderRadius: 17
  },
  fontReviewTextName: {
    fontSize: 16,
    color: '#564f51'
  },
  fontReviewTextDate: {
    fontSize: 12,
    color: '#d2c4bf'
  },
  fontReviewText: {
    fontSize: 14,
    color: 'darkslategrey'
  },
  likeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#c8c8c8'
  }
});

export {
  BasicInfo, Stars, Users, Reviews, Review, ReviewsHeader
};