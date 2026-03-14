import React, { useState, useEffect } from "react";
import { Image, StyleSheet, View, ScrollView } from "react-native";
import Swiper from "react-native-swiper";
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const Banner = () => {
  const colors = useTheme();
  const [bannerData, setBannerData] = useState([]);
  const { width, ws, spacing } = useResponsive();

  useEffect(() => {
    setBannerData([
      "https://images.vexels.com/media/users/3/126443/preview2/ff9af1e1edfa2c4a46c43b0c2040ce52-macbook-pro-touch-bar-banner.jpg",
      "https://pbs.twimg.com/media/D7P_yLdX4AAvJWO.jpg",
      "https://www.yardproduct.com/blog/wp-content/uploads/2016/01/gardening-banner.jpg",
    ]);

    return () => {
      setBannerData([]);
    };
  }, []);

  return (
    <ScrollView>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.swiper, { width: width }]}>
          <Swiper
            style={{ height: width / 2 }}
            showButtons={false}
            autoplay={true}
            autoplayTimeout={2}
            dotColor={colors.textSecondary}
            activeDotColor={colors.primary}
          >
            {bannerData.map((item) => {
              return (
                <Image
                  key={item}
                  style={[styles.imageBanner, {
                    height: width / 2,
                    width: width - ws(40),
                    marginHorizontal: ws(20),
                    borderRadius: ws(10),
                    borderColor: colors.border,
                  }]}
                  resizeMode="contain"
                  source={{ uri: item }}
                />
              );
            })}
          </Swiper>
          <View style={{ height: ws(20) }}></View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiper: {
    alignItems: "center",
    marginTop: 10,
  },
  imageBanner: {
    borderWidth: 1,
  },
});

export default Banner;