import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Swiper from "react-native-swiper";
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const Banner = () => {
  const colors = useTheme();
  const { width, ws } = useResponsive();
  const bannerHeight = width * 0.52;

  const bannerData = [
    require('../assets/1.png'),
    require('../assets/2.png'),
    require('../assets/3.png'),
    require('../assets/4.png'),
    require('../assets/5.png'),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.swiper, { width: width }]}> 
        <Swiper
          style={{ height: bannerHeight }}
          showButtons={false}
          loop={true}
          autoplay={true}
          autoplayTimeout={3}
          autoplayDirection={true}
          dotStyle={[styles.dot, { backgroundColor: colors.textSecondary }]}
          activeDotStyle={[styles.activeDot, { backgroundColor: colors.primary }]}
          paginationStyle={{ bottom: ws(6) }}
        >
          {bannerData.map((item, index) => {
            return (
              <Image
                key={`banner-${index}`}
                style={[styles.imageBanner, {
                  height: bannerHeight,
                  width: width - ws(24),
                  marginHorizontal: ws(12),
                  borderRadius: ws(14),
                  borderColor: colors.border,
                }]}
                resizeMode="cover"
                source={item}
              />
            );
          })}
        </Swiper>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  imageBanner: {
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    opacity: 0.45,
  },
  activeDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

export default Banner;