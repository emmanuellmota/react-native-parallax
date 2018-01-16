/* @flow */

import React from 'react'
import PropTypes from 'prop-types'
import {
	View,
	Image,
	Animated,
	StyleSheet,
	Dimensions,
	TouchableHighlight,
	ViewPropTypes
} from 'react-native'
import { isEqual } from 'lodash'

const WINDOW_HEIGHT = Dimensions.get('window').height

class ParallaxImage extends React.Component {
	static propTypes = {
		onPress: PropTypes.func,
		scrollY: PropTypes.object,
		parallaxFactor: PropTypes.number,
		imageStyle: ViewPropTypes.style,
    overlayStyle: ViewPropTypes.style,
    autoHeight: PropTypes.bool
	}

  static defaultProps = {
    parallaxFactor: 0.2,
  };

	constructor(props) {
		super(props)
		this.state = {
			isLayoutStale: true,
			offset: 0,
			height: 0,
			width: 0
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(nextProps, this.props)) {
			this.setState({ isLayoutStale: true })
		}
	}

	// Measure again since onLayout event won't pass the offset
	handleLayout = (event) => {
		if (this.state.isLayoutStale) {
			;(this._touchable || this._container).measure(this.handleMeasure)
		}
	}

	handleMeasure = (ox, oy, width, height, px, py) => {
		this.setState({
			offset: py,
			height,
			width,
			isLayoutStale: false
		})
	}

	render() {
		const { offset, width, height } = this.state
		const {
			onPress,
			scrollY,
			parallaxFactor,
			style,
			imageStyle,
			overlayStyle,
      children,
      autoHeight,
			...props
		} = this.props
		const parallaxPadding = height * parallaxFactor

		const parallaxStyle = {
			height: autoHeight ? height + parallaxPadding : height + parallaxPadding * 2,
			width: width
		}

		if (scrollY) {
			parallaxStyle.transform = [
				{
					translateY: scrollY.interpolate({
						inputRange: [offset - height, offset + WINDOW_HEIGHT + height],
						outputRange: [-parallaxPadding, parallaxPadding]
					})
				}
			]
		} else {
			parallaxStyle.transform = [{ translateY: -parallaxPadding }]
		}

		var content = (
			<View
				ref={component => (this._container = component)}
				style={[style, styles.container]}
				onLayout={this.handleLayout}
			>
        <Animated.Image
          {...props}
          style={autoHeight ? [imageStyle, styles.overlay, parallaxStyle] : [imageStyle, parallaxStyle]}
          pointerEvents="none"
        />
        <View style={autoHeight ? [overlayStyle] : [styles.overlay, { flex: 1 } , overlayStyle]}>{children}</View>
			</View>
    )

		// Since we can't allow nested Parallax.Images, we supply this shorthand to wrap a touchable
		// around the element
		if (onPress) {
			return (
				<TouchableHighlight
					ref={component => (this._touchable = component)}
					onPress={onPress}
				>
					{content}
				</TouchableHighlight>
			)
		}
		return content
	}
}

var styles = StyleSheet.create({
	container: {
		overflow: 'hidden',
		position: 'relative'
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	}
})

module.exports = ParallaxImage

