# React Native Expanding Collection

## Installation

`npm install --save @ramotion/react-native-expanding-collection`

## Usage

Look it in folder `./example`

```javascript
import React, { Component } from 'react';
import ExpandingCollection from '@ramotion/react-native-expanding-collection';

class Example extends Component {
    items = [
      {
        id: '654831654',
        name: 'New York',
        img: 'https://media-cdn.tripadvisor.com/media/photo-s/0e/9a/e3/1d/freedom-tower.jpg',
        blob: 'New York is a beautiful',
        rating: 4,
        reviews: [
          {
            userName: 'Ebbe Ugwu',
            userAvatar: 'https://randomuser.me/api/portraits/men/83.jpg',
            review: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis...',
            date: 'FEB 14th',
          }, {
            userName: 'Jakob Merquier',
            userAvatar: 'https://randomuser.me/api/portraits/men/46.jpg',
            review: ' aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            date: 'JUL 8th'
          },
        ],
        coordinates: [40.785091, 'North', -73.968285, 'West']
      },
      {
       id: '32164893',
        name: 'London',
        img: 'https://i.ytimg.com/vi/7BymziTFM2E/maxresdefault.jpg',
        blob: 'The buzzing heart of Great Britain',
        rating: 5,
        reviews: [
          {
            userName: 'Monique Shultz',
            userAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
            review: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis...',
            date: 'APR 15th'
          }
        ],
        coordinates: [51.509865, 'North', -0.118092, 'West']
      }
    ];
    
    render() {
    	return (
        <ExpandingCollection
          data={this.items}
        />
      );
    }
}


```

## Props
| Name | Description | Type | Required | Default Value |
| :--- | :----- | :--- | :---: | :---: |
| data | Information about cards | Array | + |  |
| frontCardColor | Color for front card | String |   | '#fffeff' |
| backCardColor | Color for back card | String |   | '#fffeff' |
| paginationColor | Color for pagination card | String |   | '#cbd2db' |
| cardBorder | Card border prop | Number |   | 8 |
| cardPadding | Card padding prop | Number |   | 4 |
| renderFrontCard | Render front card | Component |   |  |
| renderBackCard | Render back card | Component |   |  |
| headerCloseIconUrl | Close icon Url for header | String |   | 'https://www.materialui.co/materialIcons/navigation/close_black_2048x2048.png' |
| headerDefaultIconUrl | Default icon Url for header | String |   | 'https://cdn2.iconfinder.com/data/icons/lightly-icons/30/crosshairs-480.png' |

## Licence

Expanding is released under the MIT license.
See [LICENSE](./LICENSE) for details.
<br>

# Get the Showroom App for iOS to give it a try
Try this UI component and more like this in our mobile app. Contact us if interested.

<a href="https://play.google.com/store/apps/details?id=com.ramotion.showroom" >
<img src="https://raw.githubusercontent.com/Ramotion/react-native-circle-menu/master/google_play@2x.png" width="104" height="34"></a>
<a href="https://itunes.apple.com/app/apple-store/id1182360240?pt=550053&ct=react-native-circle-menu&mt=8" >
<img src="https://github.com/ramotion/gliding-collection/raw/master/app_store@2x.png" width="117" height="34"></a>
<a href="https://www.ramotion.com/agency/app-development?utm_source=gthb&utm_medium=repo&utm_campaign=react-native-expanding-collection">
<img src="https://github.com/ramotion/gliding-collection/raw/master/contact_our_team@2x.png" width="187" height="34"></a>
<br>
<br>

Follow us for the latest updates<br>
<a href="https://goo.gl/rPFpid" >
<img src="https://i.imgur.com/ziSqeSo.png/" width="156" height="28"></a>
