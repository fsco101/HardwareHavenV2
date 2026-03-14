Screens/Product
ProductContainer.js
import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'

const ProductContainer = () => {

    return (
        <View>
            <Text>Product container</Text>
        </View>
    )
}

export default ProductContainer;

app
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ProductContainer from './Screens/Products/ProductContainer';
export default function App() {
  return (
    <View style={styles.container}>
      <ProductContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

assets/data
products.json
[{
  "_id": {
    "$oid": "5f15d8852a025143f9593a7c"
  },
  "image": "https://www.freepngimg.com/thumb/fifa/11-2-fifa-png-images.png",
  "brand": "PS3",
  "price": 250,
  "rating": 1,
  "numReviews": 0,
  "isFeatured": true,
  "name": "FIFA 20",
  "description": "The most hard FIFA ever",
  "category": {
    "$oid": "5f15d5cdcb4a6642bddc0fe9"
  },
  "countInStock": 25,
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d92ee520d44421ed8e9b"
  },
  "image": "",
  "brand": "IKEA",
  "price": 350.9,
  "rating": 5,
  "numReviews": 0,
  "isFeatured": true,
  "name": "Garden Chair",
  "description": "beautiful chair for garden",
  "category": {
    "$oid": "5f15d5b7cb4a6642bddc0fe8"
  },
  "countInStock": 10,
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d964e520d44421ed8e9c"
  },
  "image": "",
  "brand": "OBI",
  "price": 1350.9,
  "rating": 5,
  "numReviews": 0,
  "isFeatured": true,
  "name": "Swimming Pool",
  "description": "beautiful Swimming Pool for garden",
  "category": {
    "$oid": "5f15d5b7cb4a6642bddc0fe8"
  },
  "countInStock": 10,
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d9b3e520d44421ed8e9d"
  },
  "image": "https://static1.squarespace.com/static/5a51022ff43b55247f47ccfc/5a567854f9619a96fd6233bb/5b74446c40ec9afbc633e555/1534346950637/Husqvarna+545FR+%282%29.png?format=1500w",
  "brand": "OBI",
  "price": 490.9,
  "rating": 5,
  "numReviews": 0,
  "isFeatured": true,
  "name": "Grass Cut Machine",
  "description": "Grass Cut Machine for garden",
  "category": {
    "$oid": "5f15d5b7cb4a6642bddc0fe8"
  },
  "countInStock": 5,
  "__v": 0
},{
  "_id": {
    "$oid": "5f15da13e520d44421ed8e9e"
  },
  "image": "https://lh3.googleusercontent.com/proxy/XRK6WCBqL7Yzk4Nfxm_d-cnRM4VzWCPMIL_B7rgDLPet9EGxjtCaUlE2odE5RavcduJDBngkiTi6YwGbI-t7mX_pdx1ZjdjKkRlcukoyPOb-pw",
  "brand": "Mobilix",
  "price": 1000,
  "rating": 5,
  "numReviews": null,
  "isFeatured": true,
  "name": "Sofa",
  "description": "Big Sofa for living room",
  "category": {
    "$oid": "5f15d5b2cb4a6642bddc0fe7"
  },
  "countInStock": 2,
  "__v": 0
}]
productcontainer
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } 
const data =require('../../assets/data/products.json')

const [products, setProducts] = useState([])

    useEffect(() => {
        setProducts(data);

        return () => {
            setProducts([])
        }
    }, [])

    <View>
            <Text>Product Container</Text>
            <View style={{ marginTop: 200}} >
                <FlatList 
                    horizontal
                    data={products}
                    renderItem={({item}) => <Text>{item.brand}</Text>}
                    keyExtractor={item => item.name}
                />
            </View>
        </View> 


ProductList
import React from "react";
import { TouchableOpacity, View, Dimensions } from "react-native";

var {width} = Dimensions.get("window")

const ProductList = (props) => {

    return (
        <TouchableOpacity style={{ width: '50%' }}>
            <View style={{ width: width/2, backgroundColor:'gainsboro'}}>

            </View>
        </TouchableOpacity>
    )
}
export default ProductList;

ProductContainer
import ProductList from './ProductList'
 renderItem={({item}) => <ProductList key={item.id}/>}

 ProductCard
 import React from 'react'
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    Text,
    Button
} from 'react-native'

var { width } = Dimensions.get("window");

const ProductCard = (props) => {
    const { name, price, image, countInStock } = props;

    return (
        <View style={styles.container}>
            <Image 
            style={styles.image}
            resizeMode="contain"
            source={{uri: image ? 
                image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'}}
            />
            <View style={styles.card}/>
            <Text style={styles.title}>
                {name.length > 15 ? name.substring(0, 15 - 3)
                    + '...' : name
                }
            </Text>
            <Text style={styles.price}>${price}</Text>

            { countInStock > 0 ? (
                <View style={{ marginBottom: 60 }}>
                    <Button title={'Add'} color={'green'}> </Button>
                </View>
            ) : <Text style={{ marginTop: 20 }}>Currently Unavailable</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: width / 2 - 20,
        height: width / 1.7,
        padding: 10,
        borderRadius: 10,
        marginTop: 55,
        marginBottom: 5,
        marginLeft: 10,
        alignItems: 'center',
        elevation: 8,
        backgroundColor: 'white'
    },
    image: {
        width: width / 2 - 20 - 10,
        height: width / 2 - 20 - 30,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: -45
    },
    card: {
        marginBottom: 10,
        height: width / 2 - 20 - 90,
        backgroundColor: 'transparent',
        width: width / 2 - 20 - 10
    },
    title: {
        fontWeight: "bold",
        fontSize: 14,
        textAlign: 'center'
    },
    price: {
        fontSize: 20,
        color: 'orange',
        marginTop: 10
    }
})

export default ProductCard;

ProductList
import ProductCard from "./ProductCard";
const ProductList = (props) => {
    const {item} = props;
   
    return (
        <TouchableOpacity style={{ width: '50%' }}>
            <View style={{ width: width / 2, backgroundColor:'gainsboro'}}>
            <ProductCard {...item}/>
            </View>
        </TouchableOpacity>
    )
}

productcontainer
<FlatList 
                //    horizontal
                   columnWrapperStyle={{justifyContent: 'space-between'}}
                   numColumns={2}
                    data={products}
                    // renderItem={({item}) => <Text>{item.brand}</Text>}
                    renderItem={({item}) => <ProductList key={item.id} item={item}/>}
                    keyExtractor={item => item.name}
                />

const styles = StyleSheet.create({
    container: {
      flexWrap: "wrap",
      backgroundColor: "gainsboro",
    },
    listContainer: {
      height: height,
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
      backgroundColor: "gainsboro",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
  });

Shared/Header.js
import React from "react"
import { StyleSheet, Image, SafeAreaView, View } from "react-native"

const Header = () => {
    return(
         //<View style={styles.header}>
        <SafeAreaView style={styles.header}>
       
            <Image
                source={require("../assets/Logo.png")}
                resizeMode="contain"
                style={{ height: 50 }}
            />
        
         </SafeAreaView>
         //</View>
    )
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: 'row',
        alignContent: "center",
        justifyContent: "center",
        padding: 20,
        marginTop: 80,
    }
})

export default Header;

app
<View style={styles.container}>
      <Header />
      <ProductContainer />
    </View>

npm install native-base react-native-svg@12.1.1 react-native-safe-area-context@3.3.2
Productcontainer
import { Container, Header, Icon, Item, Input, Text } from "native-base";
remove text from react-native
 import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native'
import { Container, VStack, Input, Heading, Text, Icon, NativeBaseProvider, extendTheme } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import ProductList from './ProductList'

const data = require('../../assets/data/products.json')
var { height } = Dimensions.get('window')

const newColorTheme = {
    brand: {
      900: "#8287af",
      800: "#7c83db",
      700: "#b3bef6",
    },
  };
const theme = extendTheme({ colors: newColorTheme });
const ProductContainer = () => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        setProducts(data);

        return () => {
            setProducts([])
        }
    }, [])

    return (
        <NativeBaseProvider theme={theme}>
             <Container>
            {/* <Header searchbar rounded >
                <Item>
                    <SearchIcon />
                    <Input placeholder="search" />
                </Item>
            </Header> */}
            <VStack w="100%" space={5} alignSelf="center">
                <Heading fontSize="lg">Search</Heading>
                <Input placeholder="Search" variant="filled" width="100%" borderRadius="10" py="1" px="2" InputLeftElement={<Icon ml="2" size="4" color="gray.400" as={<Ionicons name="ios-search" />} />} />
            </VStack>
            <View>
                <Text>Product Container</Text>
                <View style={styles.listContainer} >
                    <FlatList 
                    //    horizontal
                    columnWrapperStyle={{justifyContent: 'space-between'}}
                    numColumns={2}
                        data={products}
                        // renderItem={({item}) => <Text>{item.brand}</Text>}
                        renderItem={({item}) => <ProductList key={item.id} item={item}/>}
                        keyExtractor={item => item.name}
                    />
                </View>
            </View>
        </Container>
        </NativeBaseProvider>
    )
}
const styles = StyleSheet.create({
    container: {
      flexWrap: "wrap",
      backgroundColor: "gainsboro",
    },
    listContainer: {
      height: height,
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
      backgroundColor: "gainsboro",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
  });

export default ProductContainer;

SearchedProduct.js

import React from 'react';
import { View, StyleSheet, Dimensions} from 'react-native'
import { Container, 
    VStack, 
    Input, 
    Heading, 
    Text, 
    Icon, 
    HStack,
    Box,
    Avatar,
    Spacer,
     } from "native-base";
import { FlatList } from 'react-native';

var { width } = Dimensions.get("window")

const SearchedProduct = (props) => {
    const { productsFiltered } = props;
    return(
        
            <Container style={{ width: width }}>
                {productsFiltered.length > 0 ? (
                    // productsFiltered.map((item) => (
                    //      console.log(item)
                        
                       
                    // ))
        <Box width={80}>
            <Heading fontSize="xl" p="4" pb="3">
                Inbox
            </Heading>
            <FlatList data={productsFiltered} renderItem={({item}) => 
                <Box borderBottomWidth="1" _dark={{
                    borderColor: "muted.50"
                    }} borderColor="muted.800" pl={["0", "4"]} pr={["0", "5"]} py="2">
                            <HStack space={[2, 3]} justifyContent="space-between">
                            <Avatar size="48px" source={{
                        uri: item.image ? 
                        item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }} />
                            <VStack>
                                <Text _dark={{
                            color: "warmGray.50"
                        }} color="coolGray.800" bold>
                                {item.name}
                                </Text>
                                <Text color="coolGray.600" _dark={{
                            color: "warmGray.200"
                        }}>
                                {item.description}
                                </Text>
                            </VStack>
                            <Spacer />
                            <Text fontSize="xs" _dark={{
                                color: "warmGray.50"
                                }} color="coolGray.800" alignSelf="flex-start">
                                        {item.price}
                            </Text>
                            </HStack>
                        </Box>} keyExtractor={item => item._id} />
        </Box>
                ) : (
                    <View style={styles.center}>
                        <Text style={{ alignSelf:  'center' }}>
                            No products match the selected criteria
                        </Text>
                    </View>
                )}
            </Container>
       
    );
};


const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100
    },
    listContainer: {
        // height: height,
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
        backgroundColor: "gainsboro",
      },
})

export default SearchedProduct;

productcontainer
import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native'
import { Container, VStack, Input, Heading, Text, Icon, NativeBaseProvider, extendTheme } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import ProductList from './ProductList'
import SearchedProduct from "./SearchedProduct";

const data = require('../../assets/data/products.json')
var { height } = Dimensions.get('window')

const newColorTheme = {
    brand: {
      900: "#8287af",
      800: "#7c83db",
      700: "#b3bef6",
    },
  };
const theme = extendTheme({ colors: newColorTheme });
const ProductContainer = () => {
    const [products, setProducts] = useState([]);
    const [productsFiltered, setProductsFiltered] = useState([]);
    const [focus, setFocus] = useState();

    useEffect(() => {
        setProducts(data);
        setProductsFiltered(data);
        setFocus(false);
        return () => {
            setProducts([])
            setProductsFiltered([]);
            setFocus();
        }
    }, [])

    const searchProduct = (text) => {
        setProductsFiltered(
            products.filter((i) => i.name.toLowerCase().includes(text.toLowerCase()))
        )
    }
    const openList = () => {
        setFocus(true);
    }

    const onBlur = () => {
        setFocus(false);
    }
    return (
        <NativeBaseProvider theme={theme}>
             <Container>
            {/* <Header searchbar rounded >
                <Item>
                    <SearchIcon />
                    <Input placeholder="search" />
                </Item>
            </Header> */}
            <VStack w="100%" space={5} alignSelf="center">
                <Heading fontSize="lg">SearcH</Heading>
                <Input 
                    onFocus={openList}
                    onChangeText={(text) => searchProduct(text)}
                    placeholder="Search" 
                    variant="filled" 
                    width="100%" 
                    borderRadius="10" 
                    py="1" 
                    px="2" 
                    InputLeftElement={<Icon ml="2" size="4" color="gray.400" as={<Ionicons name="ios-search" />} />} 
                  InputRightElement={focus == true ? <SmallCloseIcon  onPress={onBlur} />  : null}
                />
            </VStack>
            {focus === true ? (
                <SearchedProduct 
                    productsFiltered = {productsFiltered}
                />
            ) : (
                <View style={styles.container}>
                    <Text>Product Container</Text>
                    <View style={styles.listContainer} >
                        <FlatList 
                        //    horizontal
                        columnWrapperStyle={{justifyContent: 'space-between'}}
                        numColumns={2}
                        data={products}
                        // renderItem={({item}) => <Text>{item.brand}</Text>}
                        renderItem={({item}) => <ProductList key={item.brnad} item={item}/>}
                        keyExtractor={item => item.name}
                        />
                    </View>
                </View>
            )}
            
        </Container>
        </NativeBaseProvider>
    )
}
const styles = StyleSheet.create({
    container: {
      flexWrap: "wrap",
      backgroundColor: "gainsboro",
    },
    listContainer: {
      height: height,
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
      backgroundColor: "gainsboro",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
  });

export default ProductContainer;

shared/banner.js
import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Dimensions, View, ScrollView } from "react-native";
import Swiper from "react-native-swiper";

var { width } = Dimensions.get("window");

const Banner = () => {
  const [bannerData, setBannerData] = useState([]);

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
      <View style={styles.container}>
        <View style={styles.swiper}>
          <Swiper
            style={{ height: width / 2 }}
            showButtons={false}
            autoplay={true}
            autoplayTimeout={2}
          >
            {bannerData.map((item) => {
              return (
                <Image
                  key={item}
                  style={styles.imageBanner}
                  resizeMode="contain"
                  source={{ uri: item }}
                />
              );
            })}
          </Swiper>
          <View style={{ height: 20 }}></View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gainsboro",
  },
  swiper: {
    width: width,
    alignItems: "center",
    marginTop: 10,
  },
  imageBanner: {
    height: width / 2,
    width: width - 40,
    borderRadius: 10,
    marginHorizontal: 20,
  },
});

export default Banner;


ProductContainer
               <View style={styles.container}>
                        
                        <VStack space={5} alignItems="center">
                            <Banner />
                            <FlatList
                                columnWrapperStyle={{ justifyContent: 'space-between' }}
                                numColumns={2}
                                data={products}
                                renderItem={({ item }) => <ProductList key={item._id.$oid} item={item} />}
                                keyExtractor={item => item._id.$oid}
                            />
                        </VStack>

                    </View>
                    
assets/date/categories.json
[{
  "_id": {
    "$oid": "5f15d5cdcb4a6642bddc0fe9e"
  },
  "name": "Electronics",
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d545f3a046427a1c26e2"
  },
  "name": "Beauty",
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d54cf3a046427a1c26e3"
  },
  "name": "Computers",
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d5b2cb4a6642bddc0fe7"
  },
  "name": "Home",
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d5b7cb4a6642bddc0fe8"
  },
  "name": "Garden",
  "__v": 0
},{
  "_id": {
    "$oid": "5f15d5cdcb4a6642bddc0fe9"
  },
  "name": "Games",
  "__v": 0
}]

productcontainer
const productCategories = require('../../assets/data/categories.json')

 const [categories, setCategories] = useState([]);
    const [active, setActive] = useState([]);
    const [initialState, setInitialState] = useState([])
    setCategories(productCategories)
        setActive(-1)
        setInitialState(data);
return () => {
            setProducts([])
            setProductsFiltered([]);
            setFocus();
            setCategories([])
            setActive()
            setInitialState();
        }
    }, [])


/screens/product
categoryFilter
import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, FlatList, View } from 'react-native';
import { Badge, Text, VStack, Divider, HStack } from 'native-base';


const CategoryFilter = (props) => {

    return(
        
            <ScrollView
                bounces={true}
                horizontal={true}
                style={{ backgroundColor: "#f2f2f2" }}
            >
                <VStack space={4} divider={<Divider />} w="100%">
                    <HStack justifyContent="space-between">
                        <TouchableOpacity key={1} >
                            <Badge style={[styles.center, {margin: 4}]}>
                                <Text style={{ color: 'black'}}>name</Text>
                            </Badge>
                            
                        </TouchableOpacity>
                    </HStack>
                </VStack>
                     {/* <FlatList style={{ margin: 0, padding: 0, borderRadius: 0 }} nestedScrollEnabled={true} horizontal={true}> 
                        <TouchableOpacity key={1} >
                            <Badge style={[styles.center, {margin: 5}]}>
                                <Text style={{ color: 'red'}}>name</Text>
                            </Badge>
                        </TouchableOpacity>
                     </FlatList>  */}
                
                {/* <Badge style={[styles.center, {margin: 5}]}>
                                <Text style={{ color: 'white'}}>name</Text>
                            </Badge> */}
            </ScrollView>
            
               
    )
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    active: {
        backgroundColor: '#03bafc'
    },
    inactive: {
        backgroundColor: '#a0e1eb'
    }
})

export default CategoryFilter;

productcontainer
<ScrollView>
                    <View > 
                        <View >
                            <View>
                                <Banner />
                            </View>
                            <View >
                                <CategoryFilter />
                            </View>
                            <View style={styles.listContainer} >
                                <FlatList 
                                //    horizontal
                                columnWrapperStyle={{justifyContent: 'space-between'}}
                                numColumns={2}
                                data={products}
                                // renderItem={({item}) => <Text>{item.brand}</Text>}
                                renderItem={({item}) => <ProductList key={item._id} item={item}/>}
                                keyExtractor={item => item._id}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
                
               
            )}

ProductContainer
const [productsCtg, setProductsCtg] = useState([])

const changeCtg = (ctg) => {
        {
          ctg === "all"
            ? [setProductsCtg(initialState), setActive(true)]
            : [
                setProductsCtg(
                  products.filter((i) => i.category.$oid === ctg),
                  setActive(true)
                ),
              ];
        }
    };

<CategoryFilter categories={categories}
                                    categoryFilter={changeCtg}
                                    productsCtg={productsCtg}
                                    active={active}
                                    setActive={setActive}
                                />

categoryFilter
<TouchableOpacity 
                        key={1}
                            onPress={() => {
                                props.categoryFilter('all'), props.setActive(-1)
                            }}
                        >
</TouchableOpacity>
                        {props.categories.map((item) => (
                            <TouchableOpacity
                                key={item.$oid}
                                onPress={() => {
                                    props.categoryFilter(item.$oid), 
                                    props.setActive(props.categories.indexOf(item))
                                }}
                            >
                                <Badge
                                    style={[styles.center, 
                                        {margin: 5},
                                        props.active == props.categories.indexOf(item) ? styles.active : styles.inactive
                                    ]}
                                >
                                    <Text style={{ color: 'white' }}>{item.name}</Text>
                                </Badge>
                            </TouchableOpacity>
                        ))}

ProductContainer
const changeCtg = (ctg) => {
        console.log(ctg)
        {
          ctg === "all"
            ? [setProductsCtg(initialState), setActive(true)]
            : [
                setProductsCtg(
                  products.filter((i) => i.category._id.$oid === ctg),
                  setActive(true)
                ),
              ];
        }
    };

  {productsCtg.length > 0 ? (
                                <View style={styles.listContainer}>
                                    {productsCtg.map((item) => {
                                        return(
                                            <ProductList
                                                // navigation={props.navigation}
                                                key={item._id.$oid}
                                                item={item}
                                            />
                                        )
                                    })}
                                </View>
                                ) : (
                                    <View style={[styles.center, { height: height / 2}]}>
                                        <Text>No products found</Text>
                                    </View>
                                )}

navigation
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
npm i @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack

navigators/Main.js
import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const Tab = createBottomTabNavigator();

const Main = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={ {
                tabBarHideOnKeyboard: true,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#e91e63'
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({color}) => {
                        return <Icon
                            name="home"
                            style={{position: "relative"}}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />

            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({color}) => {
                        return <Icon
                            name="shopping-cart"
                            style={{position: "relative"}}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />

            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({color}) => {
                        return <Icon
                            name="cog"
                            style={{position: "relative"}}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />
            <Tab.Screen
                name="User"
                component={Home}
                options={{
                    tabBarIcon: ({color}) => {
                        return <Icon
                            name="user"
                            style={{position: "relative"}}
                            color={color}
                            size={30}

                        />
                    }
                }}
            />
        </Tab.Navigator>
    )
}
export default Main

app.js

import { NavigationContainer } from '@react-navigation/native'
import Main from './Navigators/Main'

return (
    <NavigationContainer>
      <NativeBaseProvider theme={theme}>
        <View style={styles.container}>
        <Header />
        <ProductContainer />
        </View>
      </NativeBaseProvider>
    </NavigationContainer>
  );

  navigators/HomeNavigator.js
  import React from 'react'
import { createStackNavigator } from "@react-navigation/stack"

import ProductContainer from "../Screens/Products/ProductContainer";

const Stack = createStackNavigator()
function MyStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name='Home'
                component={ProductContainer}
                options={{
                    headerShown: false,
                }}
            />
           
        </Stack.Navigator>
    )
}

export default function HomeNavigator() {
    return <MyStack />;
}

main.js
<Tab.Screen
    name="Home"
    component={HomeNavigator}

app.js    <NavigationContainer>
      <NativeBaseProvider theme={theme}>
        {/* <View style={styles.container}> */}
        <Header />
        <Main />
        {/* </View> */}
      </NativeBaseProvider>
    </NavigationContainer>
  );
}

HomeNavigator
<Stack.Screen 
                name='Product Detail'
                component={SingleProduct}
                options={{
                    headerShown: false,
                }}
            />

product/SingleProduct.js

import React, {useState, useEffect} from "react";
import { Image, View, StyleSheet, Text, ScrollView, Button } from "react-native";
import {Left, Right, Container, H1} from 'native-base'

const SingleProduct = (props) => {
    const [item, setItem] = useState(props.route.params.item);
    const [availability, setAvailability] = useState('')

    return (
        <Container style={styles.container}>
            <ScrollView style={{marginBottom: 80, padding: 5}}>
                <View>
                    <Image 
                        source={{
                            uri: item.image ? item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }}
                        resizeMode="contain"
                        style={styles.image}
                    />
                        
                </View>
            </ScrollView>
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: '100%'
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 0,
        margin: 0
    },
    image: {
        width: '100%',
        height: 250
    },
    contentContainer: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentHeader: {
        fontWeight: 'bold',
        marginBottom: 20
    },
    contentText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white'
    },
    price: {
        fontSize: 24,
        margin: 20,
        color: 'red'
    },
    availabilityContainer: {
        marginBottom: 20,
        alignItems: "center"
    },
    availability: {
        flexDirection: 'row',
        marginBottom: 10,
    }
})

export default SingleProduct

ProductList
<TouchableOpacity 
                style={{ width: '50%' }}
                 onPress={() => navigation.navigate("Product Detail", { item: item })
            }
            >
            <View style={{ width: width / 2, backgroundColor:'gainsboro'}}>
            <ProductCard {...item}/>
            </View>
        </TouchableOpacity>

Productcontainer

return(
    <ProductList
        navigation={props.navigation}
        key={item._id.$oid}
        item={item}
    />
)

SearchedProduct
<TouchableOpacity onPress={() => {
                                props.navigation.navigate("Product Detail", {item: item})
                    }}>
                    <Box borderBottomWidth="1" _dark={{
...
         </Box > 
                </TouchableOpacity>}
                
                 keyExtractor={item => item._id}  
                 
            />  

SingleProduct
import React, {useState, useEffect} from "react";
import { Image, View, StyleSheet, Text, ScrollView } from "react-native";
import {Box, HStack, Container, H1, Center, Heading, Button} from 'native-base'

const SingleProduct = (props) => {
    const [item, setItem] = useState(props.route.params.item);
    const [availability, setAvailability] = useState('')
   
    return (
        
        <Center flexGrow={1}>
            <ScrollView style={{marginBottom: 80, padding: 5}}>
                <View>
                    <Image 
                        source={{
                            uri: item.image ? item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }}
                        resizeMode="contain"
                        style={styles.image}
                    />
                </View>
                
                <View style={styles.contentContainer}>
                    <Heading style={styles.contentHeader} size='xl'>{item.name}</Heading>
                    <Text style={styles.contentText}>{item.brand}</Text>
                </View>
                {/* <View style={styles.availabilityContainer}>
                    <View style={styles.availability}>
                        <Text style={{ marginRight: 10 }}>
                            Availability: {availabilityText}
                        </Text>
                        {availability}
                    </View>
                    <Text>{item.description}</Text>
                </View> */}
            </ScrollView>
            <View style={styles.bottomContainer}>
                <HStack space={3} justifyContent="center">
                    <Text style={styles.price}>${item.price}</Text>
                    <Button size="sm" >Add</Button>
                </HStack>
                {/* <HStack alignSelf="right">
                    <Button size="sm" >Add</Button>
                </HStack> */}
               
                {/* <Right>
                   <EasyButton 
                   primary
                   medium
                   onPress={() => {props.addItemToCart(item.id),
                        Toast.show({
                            topOffset: 60,
                            type: "success",
                            text1: `${item.name} added to Cart`,
                            text2: "Go to your cart to complete order"
                        })
                }}
                   >
                       <Text style={{ color: 'white'}}>Add</Text>
                   </EasyButton>
                   <Button>Add</Button>
                </Right>  */}
            </View>
        </Center>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: '100%',
        // 
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 0,
        margin: 0
    },
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1
    },
    contentContainer: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentHeader: {
        fontWeight: 'bold',
        marginBottom: 20
    },
    contentText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white'
    },
    price: {
        fontSize: 24,
        margin: 20,
        color: 'red'
    },
    availabilityContainer: {
        marginBottom: 20,
        alignItems: "center"
    },
    availability: {
        flexDirection: 'row',
        marginBottom: 10,
    }
})

export default SingleProduct

npm i redux react-redux redux-devtools-extension redux-logger redux-thunk @reduxjs/toolkit

redux/store.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
// import { configureStore } from '@reduxjs/toolkit'
// import cartItems from './Reducers/cartItem'

const reducers = combineReducers({
    //cartItems: cartItems
})

const store = createStore(
    reducers,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
)

export default store;

redux/constants.js
export const ADD_TO_CART = "ADD_TO_CART";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const CLEAR_CART = "CLEAR_CART";

redux/reducers/cartitem.js
import {
    ADD_TO_CART,
    REMOVE_FROM_CART,
    CLEAR_CART
} from '../constants';

const cartItems = (state = [], action) => {
    switch (action.type) {
        case ADD_TO_CART:
            return [...state, action.payload]
        case REMOVE_FROM_CART:
            return state.filter(cartItem => cartItem !== action.payload)
        case CLEAR_CART:
            return state = []
    }
    return state;
}

export default cartItems;

store import cartItems from './Reducers/cartitem'

const reducers = combineReducers({
    cartItems: cartItems
})
app.js
import { Provider } from "react-redux";
import store from "./Redux/Store";
<Provider store={store}>
        <NativeBaseProvider theme={theme}>
          <NavigationContainer>
            <Header />
            <Main />
           
          </NavigationContainer>
        </NativeBaseProvider>
      </Provider>

screens/cart/cart.js
import React from 'react'
import {Text} from 'react-native'

const Cart =() => {
    return (
        <Text>It works</Text>
    )
}

export default Cart


navigators/main
<Tab.Screen
                name="Cart"
                component={Cart}
                options={{
                    tabBarIcon: ({color}) => {
                        return <Icon

Cart/cart
const mapStateToProps = (state) => {
  const { cartItems } = state;
  return {
    cartItems: cartItems,
  };
};

redux/actions/cartActions
import {
    ADD_TO_CART,
    REMOVE_FROM_CART,
    CLEAR_CART
} from '../constants';

export const addToCart = (payload) => {
    return {
        type: ADD_TO_CART,
        payload
    }
}

export const removeFromCart = (payload) => {
    return {
        type: REMOVE_FROM_CART,
        payload
    }
}

export const clearCart = () => {
    return {
        type: CLEAR_CART
    }
}

ProductCard
import { connect } from 'react-redux'
import * as actions from '../../Redux/Actions/cartActions'

const mapDispatchToProps = (dispatch) => {
    return {
        addItemToCart: (product) => 
            dispatch(actions.addToCart({quantity: 1, product}))
    }
}

 { countInStock > 0 ? (
                <View style={{ marginBottom: 60 }}>
                    <Button 
                        title={'Add'} 
                        color={'green'}
                        onPress={() => {
                            props.addItemToCart(props)
                        }} 
                    /> 
                </View>


cart.js
import React from 'react'
import {Text, View} from 'react-native'

import {connect} from 'react-redux'
import { useSelector, useDispatch } from 'react-redux'
const Cart =(props) => {
    return (
        <View style={{flex:1}}>
          {props.cartItems.map(x => {
            return(
              <Text>{x.product.name}</Text>
            )
          })}
        </View>

    )
}
const mapStateToProps = (state) => {
    const { cartItems } = state;
    return {
      cartItems: cartItems,
    };
  };

export default connect(mapStateToProps,null) (Cart)

cart/cart
import React from 'react'
import { View, Dimensions, FlatList, StyleSheet} from 'react-native'
import {
  Container,
  Text,
  Box,
  HStack,
  Avatar,
  VStack,
  Spacer,
  Center
} from "native-base";

import {connect} from 'react-redux'
import cartItems from '../../Redux/Reducers/cartItem';

var { height, width } = Dimensions.get("window");

const Cart =(props) => {
  // const { product } = props.cartItems.product;
  console.log(props.cartItems)
  
    // return (
    //     <View style={{flex:1}}>
    //       {props.cartItems.map(x => {
    //         return(
    //           <Text>{x.product.name}</Text>
    //         )
    //       })}
    //     </View>

    // )
    return(
        
      <Container style={{ width: width }}>
        {props.cartItems.length > 0 ? (
          
          <Box width={80}>
            <FlatList data={props.cartItems} renderItem={({item}) => 

                    <Box borderBottomWidth="1" _dark={{
                        borderColor: "muted.50"
                        }} borderColor="muted.800" pl={["0", "4"]} pr={["0", "5"]} py="2">
                        
                                <HStack space={[2, 3]} justifyContent="space-between">
                                <Avatar size="48px" source={{
                                    uri: item.product.image ? 
                                    item.product.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                                    }} 
                                />
                                <VStack>
                                    <Text _dark={{
                                    color: "warmGray.50"
                                }} color="coolGray.800" bold>
                                    {item.product.name}
                                    </Text>
                                    <Text color="coolGray.600" _dark={{
                                color: "warmGray.200"
                                }}>
                                    {item.product.description}
                                    </Text>
                                </VStack>
                                <Spacer />
                                <Text fontSize="xs" _dark={{
                                    color: "warmGray.50"
                                    }} color="coolGray.800" alignSelf="flex-start">
                                            {item.product.price}
                                </Text>
                                </HStack>
                    </Box > 
                }
                keyExtractor={item => item.product._id}  
            />
        </Box>
          ) : (
              <Box style={styles.emptyContainer}>
                  <Text >No items in cart
                  </Text>
              </Box>
          )}
      </Container>
 
  );
}
const mapStateToProps = (state) => {
    const { cartItems } = state;
    return {
      cartItems: cartItems,
    };
  };
  const styles = StyleSheet.create({
    emptyContainer: {
      height: height,
      alignItems: "center",
      // justifyContent: "center",
      // flex: 1
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white',
        elevation: 20
    },
    price: {
        fontSize: 18,
        margin: 20,
        color: 'red'
    },
    hiddenContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      flexDirection: 'row'
    },
    hiddenButton: {
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingRight: 25,
      height: 70,
      width: width / 1.2
    }
  });
export default connect(mapStateToProps,null) (Cart)

cart
<VStack   style={styles.bottomContainer} w='100%' justifyContent='space-between' >
              <HStack justifyContent="space-between">
                <Text style={styles.price}>$ {total}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Button  alignItems="center"> Clear</Button>
              </HStack>
              <HStack justifyContent="space-between">
                <Button  alignItems="center"  colorScheme="primary">Check Out</Button>
              </HStack>
            </VStack>
        </Box>
       
          ) : (
              <Box style={styles.emptyContainer}>
                  <Text >No items in cart
                  </Text>

shared/CartIcon.js
import React from "react";
import { StyleSheet } from "react-native";
import { Badge, Text } from "native-base";

import { connect } from "react-redux";

const CartIcon = (props) => {
  return (
    <>
      {props.cartItems.length ? (
        <Badge style={styles.badge}>
          <Text style={styles.text}>{props.cartItems.length}</Text>
        </Badge>
      ) : null}
    </>
  );
};

const mapStateToProps = (state) => {
  const { cartItems } = state;
//   console.log(cartItems)
  return {
    cartItems: cartItems,
  };
};

const styles = StyleSheet.create({
  badge: {
    width: 25,
    position: "absolute",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    top: -4,
    right: -15,
  },
  text: {
    fontSize: 12,
    width: 100,
    fontWeight: "bold",
    color: "red"
    
  },
});

export default connect(mapStateToProps)(CartIcon);

main.js
 <CartIcon />


cart
const mapDispatchToProps = (dispatch) => {
  return {
    clearCart : () => dispatch(actions.clearCart())
  }
}

 <HStack justifyContent="space-between">
                    <Button alignItems="center" onPress={() => dispatch(actions.clearCart())}> Clear</Button>
                </HStack>
export default Cart

npm i react-native-swipe-list-view@2.0.0+
cart/CartItem

npm install deprecated-react-native-prop-types
"scripts": {
+  "postinstall": "patch-package"
 }
 npm i patch-package
react-native/index.js return require("deprecated-react-native-prop-types").ViewPropTypes
npx patch-package react-native

cart.js
 return (
    <>
      {props.cartItems.length > 0 ? (
        <Container>
          <Heading size="lg">Cart</Heading>
           <SwipeListView data={props.cartItems} renderItem={(data) => (
            <CartItem item={data} />
           
          )} 
          />
        </Container>
      ) : (
        <Box style={styles.emptyContainer}>
          <Text >No items in cart
          </Text>
        </Box>
        //   )
      )}
    </>
  );

  cart/cartitem.js
  import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Text, Box, HStack, Avatar, Thumbnail, Body } from "native-base";

const CartItem = (props) => {
    
    const data = props.item.item;
    console.log(data)
    return (

        <Box>
            <HStack width="100%" px={4}>
                <HStack space={2} alignItems="center">
                    <Avatar color="white" bg={'secondary.700'} size="48px" source={{
                        uri: data.product.image ?
                            data.product.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                    }} >
                    </Avatar>
                   <Text>{data.product.name}</Text>
                   <Text>$ {data.product.price}</Text>
                </HStack>
            </HStack>
        </Box>
       
    );
};

const styles = StyleSheet.create({
    listItem: {
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    body: {
        margin: 10,
        alignItems: 'center',
        flexDirection: 'row'
    }
})

export default CartItem;

cart.js
import React from 'react'
import { View, Dimensions, FlatList, StyleSheet, TouchableOpacity, TouchableHighlight, Pressable } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../../Redux/Actions/cartActions'
import {
    Container,
    Text,
    Box,
    HStack,
    Avatar,
    VStack,
    Spacer,
    Divider,
    Center,
    Button,
    Heading,

} from "native-base";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from "react-native-vector-icons/FontAwesome";


var { height, width } = Dimensions.get("window");

const Cart = (props) => {
    var total = 0;
    const cartItems = useSelector(state => state.cartItems)
    cartItems.forEach(cart => {
        return (total += cart.price)
    });
    dispatch = useDispatch()
    const renderItem = ({ item, index }) =>
        <TouchableHighlight onPress={() => console.log('You touched me')} _dark={{
            bg: 'coolGray.800'
        }} _light={{
            bg: 'white'
        }}
        >
            <Box pl="4" pr="5" py="2" bg="white">
                <HStack alignItems="center" space={3}>
                    <Avatar size="48px" source={{
                        uri: item.image ?
                            item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                    }} />
                    <VStack>
                        <Text color="coolGray.800" _dark={{
                            color: 'warmGray.50'
                        }} bold>
                            {item.name}
                        </Text>
                    </VStack>
                    <Spacer />
                    <Text fontSize="xs" color="coolGray.800" _dark={{
                        color: 'warmGray.50'
                    }} alignSelf="flex-start">
                        $ {item.price}
                    </Text>
                </HStack>
            </Box>
        </TouchableHighlight>;
   

    const renderHiddenItem = (cartItems) => 
        <TouchableOpacity
            onPress={() => dispatch(actions.removeFromCart(cartItems.item))}
        >
            {/* <View style={styles.hiddenContainer}  > */}
                {/* <Center style={styles.hiddenContainer}> */}
                    <VStack alignItems="center" style={styles.hiddenButton} >
                        <View >
                            <Icon name="trash" color={"white"} size={30} bg="red" />
                            <Text color="white" fontSize="xs" fontWeight="medium">
                                Delete
                            </Text>
                        </View>
                    </VStack>
                {/* </Center> */}
            {/* </View> */}
        </TouchableOpacity>;

    // console.log(cartItems)

    return (

        <>
            {cartItems.length > 0 ? (
                <Box bg="white" safeArea flex="1" width="100%" >
                    <SwipeListView
                        data={cartItems}
                        renderItem={renderItem}
                        renderHiddenItem={renderHiddenItem}
                        disableRightSwipe={true}
                        leftOpenValue={75}
                        rightOpenValue={-150}
                        previewOpenValue={-100}
                        previewOpenDelay={3000}
                    />
                </Box>
            ) : (
                <Box style={styles.emptyContainer}>
                    <Text >No items in cart
                    </Text>
                </Box>
            )}
            <VStack style={styles.bottomContainer} w='100%' justifyContent='space-between'
            >
                <HStack justifyContent="space-between">
                    <Text style={styles.price}>$ {total.toFixed(2)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                    <Button alignItems="center" onPress={() => dispatch(actions.clearCart())} > Clear</Button>
                </HStack>
                <HStack justifyContent="space-between">
                    <Button alignItems="center" colorScheme="primary">Check Out</Button>
                </HStack>
            </VStack>
        </>

    );
}
const styles = StyleSheet.create({
    emptyContainer: {
        height: height,
        alignItems: "center",
        justifyContent: "center",
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white',
        elevation: 20
    },
    price: {
        fontSize: 18,
        margin: 20,
        color: 'red'
    },
    hiddenContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        // width: 'lg'
    },
    hiddenButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 25,
        height: 70,
        width: width / 1.2
    }
});

export default Cart

npm i @react-navigation/material-top-tabs react-native-tab-view 

Navigators/CheckoutNavigator.js
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

// Screens
import Checkout from '../Screens/Cart/Checkout/Checkout'
import Payment from '../Screens/Cart/Checkout/Payment'
import Confirm from '../Screens/Cart/Checkout/Confirm';

const Tab = createMaterialTopTabNavigator();

function MyTabs() {
    return(
        <Tab.Navigator>
            <Tab.Screen name="Shipping" component={Checkout} />
            <Tab.Screen name="Payment" component={Payment} />
            <Tab.Screen name="Confirm" component={Confirm} />
        </Tab.Navigator>
    );
}

export default function CheckoutNavigator() {
    return <MyTabs />
}

screens/cart/Payment
import React from 'react'
import { View, Text } from 'react-native'

const Payment = () => {
    return (
        <View>
            <Text> Payment</Text>
        </View>
    )
}
export default Payment;

Confirm
import React from 'react'
import { View, Text } from 'react-native'

const Confirm = () => {
    return (
        <View>
            <Text> confirm</Text>
        </View>
    )
}
export default Confirm;

checkout.js
import React from 'react'
import { View, Text } from 'react-native'

const Checkout = () => {
    return (
        <View>
            <Text> Payment</Text>
        </View>
    )
}
export default Checkout;


Navigators/CartNavigator 
import React from 'react'
import { createStackNavigator } from "@react-navigation/stack"

import Cart from '../Screens/Cart/Cart';
import CheckoutNavigator from './CheckoutNavigator';

const Stack = createStackNavigator();

function MyStack() {
    return(
        <Stack.Navigator>
            <Stack.Screen 
                name="Cart"
                component={Cart}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen 
                name="Checkout"
                component={CheckoutNavigator}
                options={{
                    title: 'Checkout'
                }}
            />
        </Stack.Navigator>
    )
}

export default function CartNavigator() {
    return <MyStack />
}

navigator/main.js
 <Tab.Screen
                name="Cart"
                // component={Cart}
                component={CartNavigator}
                options={{
                    tabBarIcon: ({color}) => {
                        return ( 
                        <>


screens/cart.js
<HStack justifyContent="space-between">
                     <Button alignItems="center" colorScheme="primary" onPress={() => navigation.navigate('Checkout')}>Check Out</Button>
                </HStack>

shared/Form/FormContainer.js
import React from 'react';
import { ScrollView, Dimensions, StyleSheet, Text } from 'react-native';

var { width } = Dimensions.get('window');

const FormContainer = (props) => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{props.title}</Text>
            {props.children}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginBottom: 400,
        width: width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
    }
})

export default FormContainer;


shared/form/Input.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native'

const Input = (props) => {
    return (
        <TextInput
        style={styles.input}
        placeholder={props.placeholder}
        name={props.name}
        id={props.id}
        value={props.value}
        autoCorrect={props.autoCorrect}
        onChangeText={props.onChangeText}
        onFocus={props.onFocus}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        >
        </TextInput>
    );
}

const styles = StyleSheet.create({
    input: {
        width: '80%',
        height: 60,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 20,
        padding: 10,
        borderWidth: 2,
        borderColor: 'orange'
    },
});

export default Input;

npm i react-native-keyboard-aware-scroll-view
screens/cart/checkout


import React, { useEffect, useState, useContext } from 'react'
import { Text, View, Button } from 'react-native'
import { Select, Item, Picker, Toast } from 'native-base'
import Icon from 'react-native-vector-icons/FontAwesome'
import FormContainer from '../../../Shared/Form/FormContainer'
import Input from '../../../Shared/Form/Input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native';

const countries = require("../../../assets/countries.json");

const Checkout = (props) => {
    const [orderItems, setOrderItems] = useState([])
    const [address, setAddress] = useState('')
    const [address2, setAddress2] = useState('')
    const [city, setCity] = useState('')
    const [zip, setZip] = useState('')
    const [country, setCountry] = useState('')
    const [phone, setPhone] = useState('')

    const navigation = useNavigation()
    const cartItems = useSelector(state => state.cartItems)

    useEffect(() => {
        setOrderItems(cartItems)
        return () => {
            setOrderItems();
        }
    }, [])

    const checkOut = () => {
        console.log("orders", orderItems)
        let order = {
            city,
            country,
            dateOrdered: Date.now(),
            orderItems,
            phone,
            shippingAddress1: address,
            shippingAddress2: address2,
            status: "3",
            // user,
            zip,
        }
        console.log("ship", order)
        navigation.navigate("Payment", { order: order })
    }

    return (
        <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            extraHeight={200}
            enableOnAndroid={true}
        >
            <FormContainer title={"Shipping Address"}>
                <Input
                    placeholder={"Phone"}
                    name={"phone"}
                    value={phone}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setPhone(text)}
                />
                <Input
                    placeholder={"Shipping Address 1"}
                    name={"ShippingAddress1"}
                    value={address}
                    onChangeText={(text) => setAddress(text)}
                />
                <Input
                    placeholder={"Shipping Address 2"}
                    name={"ShippingAddress2"}
                    value={address2}
                    onChangeText={(text) => setAddress2(text)}
                />
                <Input
                    placeholder={"City"}
                    name={"city"}
                    value={city}
                    onChangeText={(text) => setCity(text)}
                />
                <Input
                    placeholder={"Zip Code"}
                    name={"zip"}
                    value={zip}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setZip(text)}
                />
                <Select
                    width="80%"
                    iosIcon={<Icon name="arrow-down" color={"#007aff"} />}
                    style={{ width: undefined }}
                    selectedValue={country}
                    placeholder="Select your country"
                    placeholderStyle={{ color: '#007aff' }}
                    placeholderIconColor="#007aff"
                    onValueChange={(e) => setCountry(e)}
                >
                    {countries.map((c) => {
                        return <Select.Item
                            key={c.code}
                            label={c.name}
                            value={c.name}
                        />
                    })}
                </Select>

                <View style={{ width: '80%', alignItems: "center" }}>
                    <Button title="Confirm" onPress={() => checkOut()} />
                </View>
            </FormContainer>
        </KeyboardAwareScrollView>
    )
}
export default Checkout;

payment.js
import React, { useState } from 'react'
import { View, Button, Pressable, FlatList, TouchableOpacity, Dimensions,  } from 'react-native'


import {
    Container,
    Text,
    Radio,
    Right,
    Left,
    Picker,
    Box,
    HStack,
    VStack,
    Heading,
    Divider,
    CheckCircleIcon,
    Select,
    CheckIcon,

} from 'native-base';

import { useNavigation } from '@react-navigation/native';

const methods = [
    { name: 'Cash on Delivery', value: 1 },
    { name: 'Bank Transfer', value: 2 },
    { name: 'Card Payment', value: 3 }
]

const paymentCards = [
    { name: 'Wallet', value: 1 },
    { name: 'Visa', value: 2 },
    { name: 'MasterCard', value: 3 },
    { name: 'Other', value: 4 }
]

const Payment = (props) => {

    // const order = props.route.params.order;
    // console.log("order", order)

    const [selected, setSelected] = useState('');
    const [card, setCard] = useState('');
    const navigation = useNavigation()
    return (
        <Container flex="1" >
            <Heading>
                <Text>Choose your payment method</Text>
            </Heading>

            <HStack bg="red.200" width="100%"  >
                <Radio.Group
                    name="myRadioGroup"
                    value={selected}
                    onChange={(value) => {
                        setSelected(value);
                    }}

                >
                    {console.log(selected)}
                    {methods.map((item, index) => {
                        return (
                            <Radio
                                key={index}
                                value={item.value} my="1"
                                colorScheme="green"
                                size="22"
                                style={{ float: 'right' }}
                                icon={<CheckCircleIcon size="22" mt="0.5" color="emerald.500" />}

                            >
                                {item.name}
                            </Radio>
                        )
                    })
                    }
                </Radio.Group>
            </HStack>
            {selected === 3 ? (
                <Box>
                    <Select
                        minWidth="100%"
                        placeholder="Choose Service"
                        selectedValue={card}
                        onValueChange={(x) => setCard(x)}
                        _selectedItem={{
                            bg: "teal.600",
                            endIcon: <CheckIcon size="5" />
                          }}
                    >
                        {console.log(card)}
                        {paymentCards.map((c, index) => {
                            return (
                                <Select.Item
                                    key={c.name}
                                    label={c.name}
                                    value={c.name} />
                            )
                        })}

                    </Select>
                </Box>
            ) : null}
            <View style={{ marginTop: 60, alignSelf: 'center' }}>
                <Button
                    title={"Confirm"}
                    onPress={() => navigation.navigate("Confirm", { order })} />
            </View>
        </Container>
    )
}
export default Payment;
            
confirm
import React, {useState} from 'react'

import { View, StyleSheet, Dimensions, ScrollView, Button } from "react-native";
import { Text, HStack, VStack, Avatar, Spacer, Center } from "native-base";

import * as actions from "../../../Redux/Actions/cartActions";
import Icon from 'react-native-vector-icons/FontAwesome'





var { width, height } = Dimensions.get("window");

const Confirm = (props) => {
const confirm = props.route.params;
console.log(confirm.order.order.orderItems)
    return (
        <Center width={"90%"}>
        <Text style={styles.title}>items</Text>
              
              {confirm.order.order.orderItems.map((item) => {
                return (
                    // console.log(x)
                    <HStack space={[2, 3]} justifyContent="space-between">
                    <Avatar size="48px" source={{
                        uri: item.image ? 
                        item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }} 
                    />
                    <VStack>
                        <Text _dark={{
                        color: "warmGray.50"
                    }} color="coolGray.800" bold>
                        {item.name}
                        </Text>
                        <Text color="coolGray.600" _dark={{
                    color: "warmGray.200"
                    }}>
                        {item.description}
                        </Text>
                    </VStack>
                    <Spacer />
                    <Text fontSize="xs" _dark={{
                        color: "warmGray.50"
                        }} color="coolGray.800" alignSelf="flex-start">
                                {item.price}
                    </Text>
                    </HStack>
                )
              })}           
            </Center>

    )
}

const styles = StyleSheet.create({
    container: {
      height: height,
      padding: 8,
      alignContent: "center",
      backgroundColor: "white",
    },
    titleContainer: {
      justifyContent: "center",
      alignItems: "center",
      margin: 8,
    },
    title: {
      alignSelf: "center",
      margin: 8,
      fontSize: 16,
      fontWeight: "bold",
    },
    listItem: {
      alignItems: "center",
      backgroundColor: "white",
      justifyContent: "center",
      width: width / 1.2,
    },
    body: {
      margin: 10,
      alignItems: "center",
      flexDirection: "row",
    },
  });
export default Confirm;

assets/common/baseurl.js

import { Platform } from 'react-native'


let baseURL = '';

{Platform.OS == 'android'
? baseURL = 'http://10.0.2.2:3000/api/v1/'
: baseURL = 'http://localhost:3000/api/v1/'
}

export default baseURL;

npm i axios

productcontainer
import baseURL from "../../assets/common/baseUrl"
import axios from 'axios'


 useEffect(() => {
    setFocus(false);
    setActive(-1)
    axios
      .get(`${baseURL}products`)
      .then((res) => {
        console.log(res.data)
        setProducts(res.data);
        setProductsFiltered(res.data);
        setProductsCtg(res.data);
        setInitialState(res.data);
        setProductsCtg(res.data)
        // setLoading(false)
      })
      .catch((error) => {
        console.log(error)
      })

    axios
      .get(`${baseURL}categories`)
      .then((res) => {
        setCategories(res.data)
      })
      .catch((error) => {
        console.log('Api call error')
      })

    return () => {
      setProducts([]);
      setProductsFiltered([]);
      setFocus();
      setCategories([]);
      setActive();
      setInitialState();
    };

  }, [])
        
        // setProducts(data);
        // setProductsFiltered(data);
        setFocus(false);
        // setCategories(productCategories)
        // setProductsCtg(data)
        setActive(-1)
        // setInitialState(data);
        
        axios
          .get(`${baseURL}products`)
          .then((res) => {
            console.log(res.data)
            setProducts(res.data);
            setProductsFiltered(res.data);
            setProductsCtg(res.data);
            setInitialState(res.data);
            setProductsCtg(res.data)
            // setLoading(false)
          })
          .catch((error) => {
            console.log(error)
          })

          axios
          .get(`${baseURL}categories`)
          .then((res) => {
            setCategories(res.data)
          })
          .catch((error) => {
            console.log('Api call error')
          })
    
        return () => {
          setProducts([]);
          setProductsFiltered([]);
          setFocus();
          setCategories([]);
          setActive();
          setInitialState();
        };
        
    }, [])

const changeCtg = (ctg) => {
        
        {
            console.log(ctg)
          ctg === "all"
            ? [setProductsCtg(initialState), setActive(true)]
            : [
                setProductsCtg(
                  products.filter((i) => i.category._id === ctg),
                  setActive(true)
                ),
              ];
        }
    };

categoryFilter
onPress={() => {
props.categoryFilter(item._id), 
props.setActive(props.categories.indexOf(item))
}}

import to mongodb categories
[{ "name": "Electronics" }, 
{ "name": "Beauty" },
{ "name": "Computers"
 }, {
  "name": "Home"
  }, {
  "name": "Garden"
  }, {
  "name": "Games"
  }]


useCallback usefocuseffect function

productcontainer

import React, { useState, useEffect, useCallback } from "react"
ative'
import { useFocusEffect } from "@react-navigation/native";

  const [initialState, setInitialState] = useState([])
    const [loading, setLoading] = useState(true)
 useFocusEffect((
        useCallback(
            () => {
                setFocus(false);
                setActive(-1);

                // Products
                axios
                    .get(`${baseURL}products`)
                    .then((res) => {
                        setProducts(res.data);
                        setProductsFiltered(res.data);
                        setProductsCtg(res.data);
                        setInitialState(res.data);
                        setLoading(false)
                    })
                    .catch((error) => {
                        console.log('Api call error')
                    })

                // Categories
                axios
                    .get(`${baseURL}categories`)
                    .then((res) => {
                        setCategories(res.data)
                    })
                    .catch((error) => {
                        console.log('Api call error')
                    })

                return () => {
                    setProducts([]);
                    setProductsFiltered([]);
                    setFocus();
                    setCategories([]);
                    setActive();
                    setInitialState();
                };
            },
            [],
        )
    ))

  ActivityIndicator
   return (
        <>
        {loading === false ? (
             <Center flex={1}>
             ...

     </Center>
        ) : (
            <Container style={[styles.center, { backgroundColor: "#f2f2f2" }]}>
            <ActivityIndicator size="large" color="red" />
          </Container>
        ) }
        </>

use screens
screens/user

UserProfile,js
import React from "react";
import {View, Text } from 'react-native'

const UserProfile (props) => {
    return (
        <View>
            <Text>Login</Text>
        </View>
    )
}

export default UserProfile;

Register.js
import React from "react";
import {View, Text } from 'react-native'

const Register = (props) => {
    return (
        <View>
            <Text>Login</Text>
        </View>
    )
}

export default Register;

Login.js
import React from "react";
import {View, Text } from 'react-native'

const Login = (props) => {
    return (
        <View>
            <Text>Login</Text>
        </View>
    )
}

export default Login;


UserNavigator.js
import React from "react";
import { createStackNavigator } from '@react-navigation/stack'

import Login from "../Screens/User/Login";
import Register from "../Screens/User/Register";
import UserProfile from "../Screens/User/UserProfile";

const Stack = createStackNavigator();

const UserNavigator = (props) => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                component={Login}
                options={{
                    headerShown: false
                }}
            />

            <Stack.Screen
                name="Register"
                component={Register}
                options={{
                    headerShown: false
                }}
            />

            <Stack.Screen
                name="User Profile"
                component={UserProfile}
                options={{
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    )

}


export default UserNavigator;

Login
import Input from "../../Shared/Form/Input";
import React, {useState} from "react";
import {View, Text, StyleSheet } from 'react-native'
import FormContainer from "../../Shared/Form/FormContainer";
import { Button } from "native-base";

const Login = (props) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
       <FormContainer>
            <Input 
                placeholder={"Enter email"}
                name={"email"}
                id={"email"}
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
            />
            <Input 
                placeholder={"Enter Password"}
                name={"password"}
                id={"password"}
                secureTextEntry={true}
                value={password}
                onChangeText={(text)=> setPassword(text)}
            />
            <View style={styles.buttonGroup}>
                <Button variant={"ghost"}>Login</Button>
            </View>
            <View style={[{marginTop:40} ,styles.buttonGroup]}>
                <Text style={styles.middleText}>Dont' Have an Account yet?</Text>
                <Button  variant={"ghost"} onPress={() => props.navigation.navigate("Register")} > Register</Button>
            </View>
       </FormContainer>
    )
}
const styles = StyleSheet.create({
    buttonGroup: {
      width: "80%",
      alignItems: "center",
    },
    middleText: {
      marginBottom: 20,
      alignSelf: "center",
    },
  });
export default Login;

Login.js submit handler
const [error, setError] = useState("")
const handleSubmit = () => {
        const user = {
          email,
          password,
        };
    
        if (email === "" || password === "") {
          setError("Please fill in your credentials");
        } else {
        //   loginUser(user, context.dispatch);
        console.log("error")
        }
      };

Shared/Error.js
import React from "react"
import { StyleSheet, View, Text } from 'react-native'

const Error = (props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{props.message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        margin: 10
    },
    text: {
        color: 'red'
    }
})

export default Error;

loginUser
import Error  from '../../Shared/Error'
<View style={styles.buttonGroup}>
                {error ? <Error message={error} /> : null}
                <Button variant={"ghost"} onPress={() => handleSubmit() } >Login</Button>
            </View>

register.js
npm i react-native-keyboard-aware-scroll-view

import React, { useState } from "react";
import { View, Text, StyleSheet,  } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from '@react-navigation/native';
import { Button } from "native-base";
import FormContainer from "../../Shared/Form/FormContainer";
import Input from "../../Shared/Form/Input";
import Error from "../../Shared/Error";

const Register = (props) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation()

    const register = () => {
        if (email === "" || name === "" || phone === "" || password === "") {
            setError("Please fill in the form correctly");
        }
    }

    return (
        <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            extraHeight={200}
            enableOnAndroid={true}
        >
            <FormContainer title={"Register"}>
                <Input
                    placeholder={"Email"}
                    name={"email"}
                    id={"email"}
                    onChangeText={(text) => setEmail(text.toLowerCase())}
                />
                <Input
                    placeholder={"Name"}
                    name={"name"}
                    id={"name"}
                    onChangeText={(text) => setName(text)}
                />
                <Input
                    placeholder={"Phone Number"}
                    name={"phone"}
                    id={"phone"}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setPhone(text)}
                />
                <Input
                    placeholder={"Password"}
                    name={"password"}
                    id={"password"}
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                />
                <View style={styles.buttonGroup}>
                    {error ? <Error message={error} /> : null}
                </View>
                <View>
                    <Button variant={"ghost"} onPress={() => register()}>
                        <Text style={{ color: "blue" }}>Register</Text>
                    </Button>
                </View>
                <View>
                    <Button variant={"ghost"}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={{ color: "blue" }}>Back to Login</Text>
                    </Button>
                </View>
            </FormContainer>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    buttonGroup: {
        width: "80%",
        margin: 10,
        alignItems: "center",
    },
});

export default Register;




register.js axios
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import Toast from "react-native-toast-message";

let user = {
        name: name,
        email: email,
        password: password,
        phone: phone,
        isAdmin: false,
      };
      axios
        .post(`${baseURL}users/register`, user)
        .then((res) => {
          if (res.status == 200) {
            Toast.show({
              topOffset: 60,
              type: "success",
              text1: "Registration Succeeded",
              text2: "Please Login into your account",
            });
            setTimeout(() => {
              props.navigation.navigate("Login");
            }, 500);
          }
        })
        .catch((error) => {
          Toast.show({
            position: 'bottom',
            bottomOffset: 20,
            type: "error",
            text1: "Something went wrong",
            text2: "Please try again",
          });
        });

app.js
import Toast from "react-native-toast-message";
   <NavigationContainer>
          <Header />
          <Main />
          <Toast  />
        </NavigationContainer>


productcard toast
 onPress={() => {
    props.addItemToCart(props),
    Toast.show({
        topOffset: 60,
        type: "success",
        text1: `${name} added to Cart`,
        text2: "Go to your cart to complete order"
    })
}} 

singleproduct toast
import Toast from 'react-native-toast-message';
import * as actions from '../../Redux/Actions/cartActions';
import { useSelector, useDispatch } from 'react-redux'
const dispatch = useDispatch()
<Button size="sm" onPress={() => {
    dispatch(actions.addToCart({...props, quantity: 1, })),
    Toast.show({
        topOffset: 60,
        type: "success",
        text1: `${item.name} added to Cart`,
        text2: "Go to your cart to complete order"
    }) }}>Add</Button>
</HStack>



context
yarn add jwt-decode @react-native-async-storage/async-storage
context/actions context/reducers context/store

context/actions/Auth.actions.js
import jwt_decode from "jwt-decode"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import baseURL from "../../assets/common/baseUrl"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => res.json())
    .then((data) => {
        if (data) {
            const token = data.token;
            AsyncStorage.setItem("jwt", token)
            const decoded = jwt_decode(token)
            dispatch(setCurrentUser(decoded, user))
        } else {
           logoutUser(dispatch)
        }
    })
    .catch((err) => {
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "Please provide correct credentials",
            text2: ""
        });
        logoutUser(dispatch)
    });
};

export const getUserProfile = (id) => {
    fetch(`${baseURL}users/${id}`, {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((data) => console.log(data));
}

export const logoutUser = (dispatch) => {
    AsyncStorage.removeItem("jwt");
    dispatch(setCurrentUser({}))
}

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    }
}

common is-empty.js
const isEmpty = value =>
    value === undefined || 
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0);

export default isEmpty;

context/reducers/Auth.reducer.js
import { SET_CURRENT_USER } from "../Actions/Auth.actions"
import isEmpty from "../../assets/common/is-empty"

export default function (state, action) {
    switch (action.type) {
        case SET_CURRENT_USER: 
        return {
            ...state,
            isAuthenticated: !isEmpty(action.payload),
            user: action.payload,
            userProfile: action.userProfile
        };
        default:
            return state;
    }
}

context/store/Auth.js
import React, { useEffect, useReducer, userEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage'

import authReducer from "../Reducers/Auth.reducer";
import { setCurrentUser } from "../Actions/Auth.actions";
import AuthGlobal from './AuthGlobal'

const Auth = props => {
    console.log(props.children)
    const [stateUser, dispatch] = useReducer(authReducer, {
        isAuthenticated: null,
        user: {}
    });
    const [showChild, setShowChild] = useState(false);

    useEffect(() => {
        setShowChild(true);
        if (AsyncStorage.jwt) {
            const decoded = AsyncStorage.jwt ? AsyncStorage.jwt : "";
            if (setShowChild) {
                dispatch(setCurrentUser(jwt_decode(decoded)))
            }
        }
        return () => setShowChild(false);
    }, [])


    if (!showChild) {
        return null;
    } else {
        return (
            <AuthGlobal.Provider
                value={{
                    stateUser,
                    dispatch
                }}
            >
                {props.children}
            </AuthGlobal.Provider>
        )
    }
};

export default Auth

context/store/AuthGlobal
import React from "react";

export default React.createContext();


app.js
import Auth from "./Context/store/Auth";
<Auth>
      <Provider store={store}>
...
</Auth>

adding context to login
screens.user/login.js
import AuthGlobal from '../../Context/store/AuthGlobal'
import { loginUser } from '../../Context/actions/Auth.actions'
import React, {useState, useContext} from "react";

const context = useContext(AuthGlobal)

useEffect(() => {
      if (context.stateUser.isAuthenticated === true) {
        props.navigation.navigate("User Profile")
      }
    }, [context.stateUser.isAuthenticated])

const handleSubmit = () => {
        const user = {
          email,
          password,
        };
    
        if (email === "" || password === "") {
          setError("Please fill in your credentials");
          
        } else {
          loginUser(user, context.dispatch);
            // console.log("error")
        }
}

AsyncStorage is null fix


userprofile
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { Container } from "native-base"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

import AsyncStorage from '@react-native-async-storage/async-storage'

import axios from "axios"
import baseURL from "../../config/api"

import AuthGlobal from "../../Context/store/AuthGlobal"
import { logoutUser } from "../../Context/Actions/Auth.actions"


const UserProfile = (props) => {
    const context = useContext(AuthGlobal)
    const [userProfile, setUserProfile] = useState('')
    const [orders, setOrders] = useState([])
    const navigation = useNavigation()

    useFocusEffect(
        useCallback(() => {
            if (
                context.stateUser.isAuthenticated === false ||
                context.stateUser.isAuthenticated === null
            ) {
                navigation.navigate("Login")
            }
            console.log(context.stateUser.user)
            AsyncStorage.getItem("jwt")
                .then((res) => {
                    axios
                        .get(`${baseURL}users/${context.stateUser.user.userId}`, {
                            headers: { Authorization: `Bearer ${res}` },
                        })
                        .then((user) => setUserProfile(user.data))
                })
                .catch((error) => console.log(error))
            return () => {
                setUserProfile();
            }

        }, [context.stateUser.isAuthenticated]))

    return (
        <Container style={styles.container}>
            <ScrollView contentContainerStyle={styles.subContainer}>
                <Text style={{ fontSize: 30 }}>
                    {userProfile ? userProfile.name : ""}
                </Text>
                <View style={{ marginTop: 20 }}>
                    <Text style={{ margin: 10 }}>
                        Email: {userProfile ? userProfile.email : ""}
                    </Text>
                    <Text style={{ margin: 10 }}>
                        Phone: {userProfile ? userProfile.phone : ""}
                    </Text>
                </View>
                <View style={{ marginTop: 80 }}>
                    <Button title={"Sign Out"} onPress={() => [
                        AsyncStorage.removeItem("jwt"),
                        logoutUser(context.dispatch)
                    ]} />
                </View>

            </ScrollView>
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },
    subContainer: {
        alignItems: "center",
        marginTop: 60
    },
    order: {
        marginTop: 20,
        alignItems: "center",
        marginBottom: 60
    }
})

export default UserProfile;


screens/Admin folder

Categories.js
import React from "react";
import {View, Text} from 'react-native'

const Categories = (props) => {
    return (
        <View>
            <Text>categories</Text>
        </View>
    )
} 

export default Categories;

Products.js
import React from "react";
import {View, Text} from 'react-native'

const Products = (props) => {
    return (
        <View>
            <Text>Products</Text>
        </View>
    )
} 

export default Products;

Orders.js
import React from "react";
import {View, Text} from 'react-native'

const Orders = (props) => {
    return (
        <View>
            <Text>Orders</Text>
        </View>
    )
} 

export default Orders;

ProductForm.js
import React from "react";
import {View, Text} from 'react-native'

const ProductForm = (props) => {
    return (
        <View>
            <Text>ProductForm</Text>
        </View>
    )
} 

export default ProductForm;

Navigators/AdminNavigator.js
import React from "react"
import { createStackNavigator } from "@react-navigation/stack"

import Orders from "../Screens/Admin/Order"
import Products from "../Screens/Admin/Products"
import ProductForm from "../Screens/Admin/ProductForm"
import Categories from "../Screens/Admin/Categories"

const Stack = createStackNavigator();

function MyStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Products"
                component={Products}
                options={{
                    title: "Products"
                }}
            />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="Orders" component={Orders} />
            <Stack.Screen name="ProductForm" component={ProductForm} />
        </Stack.Navigator>
    )
}
export default function AdminNavigator() {
    return <MyStack />
}


navigator/main
import AdminNavigator from "./AdminNavigator";
import AuthGlobal from "../Context/Store/AuthGlobal";

const context = useContext(AuthGlobal)

<Tab.Screen
                name="Admin"
                component={AdminNavigator}


admin/Products.js
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Container,
   
    Button
} from "react-native";
import { Input, VStack, Heading,Box } from "native-base"
import Icon from "react-native-vector-icons/FontAwesome"
import { useFocusEffect } from "@react-navigation/native"
import { Searchbar } from 'react-native-paper';
// import ListItem from "./ListItem"

import axios from "axios"
import baseURL from "../../assets/common/baseUrl"
import AsyncStorage from '@react-native-async-storage/async-storage'
  

var { height, width } = Dimensions.get("window")



const Products = (props) => {

    const [productList, setProductList] = useState();
    const [productFilter, setProductFilter] = useState();
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState();

    useFocusEffect(
        useCallback(
            () => {
                // Get Token
                AsyncStorage.getItem("jwt")
                    .then((res) => {
                        setToken(res)
                       
                    })
                    .catch((error) => console.log(error))

                axios
                    .get(`${baseURL}products`)
                    .then((res) => {
                        // console.log(res.data)
                        setProductList(res.data);
                        setProductFilter(res.data);
                        setLoading(false);
                    })

                return () => {
                    setProductList();
                    setProductFilter();
                    setLoading(true);
                }
            },
            [],
        )
    )



    return (
       <Box flex={1}>
        <Searchbar width="80%"
            placeholder="Search"
        //   onChangeText={onChangeSearch}
        //   value={searchQuery}
        />
        <FlatList 
            data={productFilter}
            
            renderItem={({ item, index }) => (
                
                <Text>{item.name}</Text>
            )}
            keyExtractor={(item) => item.id}
          />
       </Box>     
    );
}

const styles = StyleSheet.create({
    listHeader: {
        flexDirection: 'row',
        padding: 5,
        backgroundColor: 'gainsboro'
    },
    headerItem: {
        margin: 3,
        width: width / 6
    },
    spinner: {
        height: height / 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        marginBottom: 160,
        backgroundColor: 'white'
    },
    buttonContainer: {
        margin: 20,
        alignSelf: 'center',
        flexDirection: 'row'
    },
    buttonText: {
        marginLeft: 4,
        color: 'white'
    }
})

export default Products;



admin/ListItem.js
import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableHighLight,
    TouchableOpacity,
    Dimensions,
    Button,
    Modal
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"


var { width } = Dimensions.get("window");

const ListItem = (props) => {
    return(
        <View>

            <TouchableOpacity
               
                style={[styles.container, {
                    backgroundColor: props.index % 2 == 0 ? "white" : "gainsboro"
                }]}
            >
                <Image 
                    source={{
                        uri: props.image
                        ? props.image
                        : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                    }}
                    resizeMode="contain"
                    style={styles.image}
                />
                <Text style={styles.item}>{props.brand}</Text>
                <Text style={styles.item} numberOfLines={1} ellipsizeMode="tail">{props.name}</Text>
                <Text style={styles.item} numberOfLines={1} ellipsizeMode="tail">{props.category.name}</Text>
                <Text style={styles.item}>$ {props.price}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 5,
        width: width
    },
    image: {
        borderRadius: 50,
        width: width / 6,
        height: 20,
        margin: 2
    },
    item: {
        flexWrap: "wrap",
        margin: 3,
        width: width / 6
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    textStyle: {
        color: "white",
        fontWeight: "bold"
    }
})

export default ListItem;

admin/product
import ListItem from "./ListItem"

<FlatList 
            data={productFilter}
            
            renderItem={({ item, index }) => (
                <ListItem 
                    {...item}
                    navigation={props.navigation}
                    index={index}
                   
                />
                
            )} 

ListHeader
admin/products 


const ListHeader = () => {
    return(
        <View
            elevation={1}
            style={styles.listHeader}
        >
            <View style={styles.headerItem}></View>
            <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600'}}>Brand</Text>
            </View>
            <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600'}}>Name</Text>
            </View>
            <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600'}}>Category</Text>
            </View>
            <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600'}}>Price</Text>
            </View>
        </View>
    )
}

<Box flex={1}>
        <Searchbar width="80%"
            placeholder="Search"
        
        />
{loading ? (
          <View style={styles.spinner}> 
              <ActivityIndicator size="large" color="red" />
          </View>
      ) : ( 
        <FlatList 
            data={productFilter}
            ListHeaderComponent={ListHeader}
            renderItem={({ item, index }) => (
                <ListItem 
                    {...item}
                    navigation={props.navigation}
                    index={index}
                   
                />
                
            )}
            keyExtractor={(item) => item.id}
          />
      )}

search filter
admin/Products
const searchProduct = (text) => {
        if (text === "") {
            setProductFilter(productList)
        }
        setProductFilter(
            productList.filter((i) => 
                i.name.toLowerCase().includes(text.toLowerCase())
            )
        )
    }

 <Searchbar 
            placeholder="Search"
            containerStyle={{backgroundColor: 'white', borderWidth: 1, borderRadius: 5}}
            onChangeText={(text) => searchProduct(text)}


Modal
admin/listItem
const [modalVisible, setModalVisible] = useState(false)

<View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            underlayColor="#E8E8E8"
                            onPress={() => {
                                setModalVisible(false)
                            }}
                            style={{ 
                                alignSelf: "flex-end",
                                position: "absolute",
                                top: 5,
                                right: 10
                            }}
                        >
                            <Icon name="close" size={20} />
                        </TouchableOpacity>
                        
                        <Button 
                            onPress={() => [ navigation.navigate("ProductForm", {item}),
                            setModalVisible(false)
                        ]}
                            title="Edit"
                        >
                            <Text style={styles.textStyle}>Edit</Text>
                        </Button>
                        
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate("Product Detail", { item })
                }}
                onLongPress={() => setModalVisible(true)}
                style={[styles.container, {
                    backgroundColor: props.index % 2 == 0 ? "white" : "gainsboro"
                }]}
            >


styled Components
yarn add styled-components

Shared/StyledComponents/EasyButton.js
import styled, { css } from "styled-components";

const EasyButton = styled.TouchableOpacity`
    flex-direction: row;
    border-radius: 3px;
    padding: 10px;
    margin: 5px;
    justify-content: center;
    background: transparent;

    ${(props) =>
        props.primary &&
        css`
            background: #5cb85c;
        `
    }

    ${(props) =>
        props.secondary &&
        css`
            background: #62b1f6;
        `
    }

    ${(props) => 
        props.danger &&
        css`
            background: #f40105;
        `
    }

    ${(props) => 
        props.large &&
        css`
            width: 135px;
        `
    }

    ${(props) => 
        props.medium &&
        css`
            width: 100px;
        `
    }

    ${(props) => 
        props.small &&
        css`
            width: 40px;
        `
    }
`;

export default EasyButton;



easybutton modalView
ListItem
<EasyButton
    medium
    secondary
    onPress={() => [navigation.navigate("ProductForm", { item }),
    setModalVisible(false)
    ]}
    title="Edit"
>
    <Text style={styles.textStyle}>Edit</Text>
</EasyButton>
<EasyButton
    medium 
    danger
    onPress={() => [props.delete(props._id), setModalVisible(false)]}
    title="delete"
>
    <Text style={styles.textStyle}>Delete</Text>
</EasyButton>

prpductcard singleproduct
import EasyButton from "../../Shared/StyledComponents/EasyButton"
<EasyButton 
    primary
    medium

 <Text style={{ color: "white"}}> Add</Text>
</EasyButton> 

cart/cart.js
import EasyButton from "../../Shared/StyledComponents/EasyButton"
<EasyButton
    danger
    medium
    alignItems="center" 
    onPress={() => props.clearCart()} 
>
    <Text style={{ color: 'white' }}>Clear</Text>
</EasyButton>

<EasyButton
    secondary
    medium
<Text style={{ color: 'white' }}>Checkout</Text>
</EasyButton>

user/Login

<EasyButton 
    large 
    primary
    onPress={() => handleSubmit()}
><Text style={{ color: "white" }}>Login</Text>
</EasyButton>

<EasyButton
large
secondary 
onPress={() => navigation.navigate("Register")}
>
<Text style={{ color: "white" }}>Register</Text>
</EasyButton>

register
import EasyButton from "../../Shared/StyledComponents/EasyButton";

<EasyButton large primary onPress={() => register()}>
            <Text style={{ color: "white" }}>Register</Text>
          </EasyButton>

          <EasyButton
            large
            secondary
            onPress={() => props.navigation.navigate("Login")}
          >
            <Text style={{ color: "white" }}>Back to Login</Text>
          </EasyButton>

StyledComponents/TrafficLight.js
import styled, { css } from "styled-components/native";

const TrafficLight = styled.View`
  border-radius: 50px;
  width: 10px;
  height: 10px;
  padding: 10px;

  ${(props) =>
    props.available &&
    css`
      background: #afec1a;
    `}

  ${(props) =>
    props.limited &&
    css`
      background: #ffe033;
    `}

    ${(props) =>
    props.unavailable &&
    css`
      background: #ec241a;
    `}
`;

export default TrafficLight;

singleproduct
import TrafficLight from '../../Shared/StyledComponents/TrafficLight'

 const [availability, setAvailability] = useState(null)
    const [availabilityText, setAvailabilityText] = useState("")

    useEffect(() => {
        if (props.route.params.item.countInStock == 0) {
            setAvailability(<TrafficLight unavailable></TrafficLight>);
            setAvailabilityText("Unvailable")
        } else if (props.route.params.item.countInStock <= 5) {
            setAvailability(<TrafficLight limited></TrafficLight>);
            setAvailabilityText("Limited Stock")
        } else {
            setAvailability(<TrafficLight available></TrafficLight>);
            setAvailabilityText("Available")
        }

        return () => {
            setAvailability(null);
            setAvailabilityText("");
        }
    }, [])


 <View style={styles.contentContainer}>
                    <Heading style={styles.contentHeader} size='xl'>{item.name}</Heading>
                    <Text style={styles.contentText}>{item.brand}</Text>
                </View>
                <View style={styles.availabilityContainer}>
                    <View style={styles.availability}>
                        <Text style={{ marginRight: 10 }}>
                            Availability: {availabilityText}
                        </Text>
                        {availability}
                    </View>
                    <Text>{item.description}</Text>
                </View>
            </ScrollView>


delete product
admin/product

 const deleteProduct = (id) => {
        axios
            .delete(`${baseURL}products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const products = productFilter.filter((item) => item.id !== id)
                setProductFilter(products)
            })
            .catch((error) => console.log(error));
    }


     <ListItem
                            item={item}
                            //  {...item}
                            index={index}
                            deleteProduct={deleteProduct}
                            
                        />
    
/>

//admin/products 
const [refreshing, setRefreshing] = useState(false);
const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            axios
                    .get(`${baseURL}products`)
                    .then((res) => {
                        // console.log(res.data)
                        setProductList(res.data);
                        setProductFilter(res.data);
                        setLoading(false);
                    })
          setRefreshing(false);
        }, 2000);
      }, []);
      <FlatList
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                    data={productFilter}


admin/listItem
<EasyButton
    medium 
    danger
    onPress={() => [props.delete(props._id), setModalVisible(false)]}
    title="delete"
>


button container
admin/Products
import EasyButton from "../../Shared/StyledComponents/EasyButton";

<View style={styles.buttonContainer}>
            <EasyButton
                secondary
                medium
                onPress={() => props.navigation.navigate("Orders")}
            >
                <Icon name="shopping-bag" size={18} color="white" />
                <Text style={styles.buttonText}>Orders</Text>
            </EasyButton>
            <EasyButton
                secondary
                medium
                onPress={() => props.navigation.navigate("ProductForm")}
            >
                <Icon name="plus" size={18} color="white" />
                <Text style={styles.buttonText}>Products</Text>
            </EasyButton>
            <EasyButton
                secondary
                medium
                onPress={() => props.navigation.navigate("Categories")}
            >
                <Icon name="plus" size={18} color="white" />
                <Text style={styles.buttonText}>Categories</Text>
            </EasyButton>
        </View>
    <Searchbar 


ProductForm
import React, { useState, useEffect } from "react"
import { 
    View, 
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform
} from "react-native"
import { Item, Picker } from "native-base"
import FormContainer from "../../Shared/Form/FormContainer"
import Input from "../../Shared/Form/Input"
import EasyButton from "../../Shared/StyledComponents/EasyButton"

import Icon from "react-native-vector-icons/FontAwesome"
import Toast from "react-native-toast-message"
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from "../../config/api" 
import axios from "axios"


const ProductForm = (props) => {
    
    const [pickerValue, setPickerValue] = useState();
    const [brand, setBrand] = useState();
    const [name, setName] = useState();
    const [price, setPrice] = useState();
    const [description, setDescription] = useState();
    const [image, setImage] = useState();
    const [mainImage, setMainImage] = useState();
    const [category, setCategory] = useState();
    const [categories, setCategories] = useState([]);
    const [token, setToken] = useState();
    const [err, setError] = useState();
    const [countInStock, setCountInStock] = useState();
    const [rating, setRating] = useState(0);
    const [isFeatured, setIsFeature] = useState(false);
    const [richDescription, setRichDescription] = useState();
    const [numReviews, setNumReviews] = useState(0);
    const [item, setItem] = useState(null);
    
    return (
       <FormContainer title="Add Product">
           <View style={styles.imageContainer}>
               <Image style={styles.image} source={{uri: mainImage}}/>
             
           </View>
           <View style={styles.label}>
               <Text style={{ textDecorationLine: "underline"}}>Brand</Text>
           </View>
           <Input 
            placeholder="Brand"
            name="brand"
            id="brand"
            value={brand}
            onChangeText={(text) => setBrand(text)}
           />
           <View style={styles.label}>
               <Text style={{ textDecorationLine: "underline"}}>Name</Text>
           </View>
           <Input 
            placeholder="Name"
            name="name"
            id="name"
            value={name}
            onChangeText={(text) => setName(text)}
           />
            <View style={styles.label}>
               <Text style={{ textDecorationLine: "underline"}}>Price</Text>
           </View>
           <Input 
            placeholder="Price"
            name="price"
            id="price"
            value={price}
            keyboardType={"numeric"}
            onChangeText={(text) => setPrice(text)}
           />
            <View style={styles.label}>
               <Text style={{ textDecorationLine: "underline"}}>Count in Stock</Text>
           </View>
           <Input 
            placeholder="Stock"
            name="stock"
            id="stock"
            value={countInStock}
            keyboardType={"numeric"}
            onChangeText={(text) => setCountInStock(text)}
           />
            <View style={styles.label}>
               <Text style={{ textDecorationLine: "underline"}}>Description</Text>
           </View>
           <Input 
            placeholder="Description"
            name="description"
            id="description"
            value={description}
            onChangeText={(text) => setDescription(text)}
           />
           
           
           <View style={styles.buttonContainer}>
               <EasyButton
                large
                primary
                onPress={() => addProduct()}               
               ><Text style={styles.buttonText}>Confirm</Text>
               </EasyButton>
           </View>
       </FormContainer>
    )
}

const styles = StyleSheet.create({
    label: {
        width: "80%",
        marginTop: 10
    },
    buttonContainer: {
        width: "80%",
        marginBottom: 80,
        marginTop: 20,
        alignItems: "center"
    },
    buttonText: {
        color: "white"
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderStyle: "solid",
        borderWidth: 8,
        padding: 0,
        justifyContent: "center",
        borderRadius: 100,
        borderColor: "#E0E0E0",
        elevation: 10
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 100
    },
    imagePicker: {
        position: "absolute",
        right: 5,
        bottom: 5,
        backgroundColor: "grey",
        padding: 8,
        borderRadius: 100,
        elevation: 20
    }
})

export default ProductForm;

category dropdown
import { Select } from "native-base"

 useEffect(() => {
 AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res)
            })
            .catch((error) => console.log(error))

 axios
            .get(`${baseURL}categories`)
            .then((res) => setCategories(res.data))
            .catch((error) => alert("Error to load categories"));
 return () => {
            setCategories([])
        }
    }, [])

<...description
<Box>
    <Select
        minWidth="90%" placeholder="Select your Category"
        selectedValue={pickerValue}
        onValueChange={(e) => [setPickerValue(e), setCategory(e)]}
    >
        {categories.map((c, index) => {
            return (
                <Select.Item
                    key={c.id}
                    label={c.name}
                    value={c.id} />
            )
        })}

    </Select>
    </Box>

error text
import Error from "../../Shared/Error"
 {err ? <Error message={err} /> : null}
            <View style={styles.buttonContainer}>

photo library
npx expo install expo-image-picker
import * as ImagePicker from "expo-image-picker"
<View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: mainImage }} />
                <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imagePicker}>
                    <Icon style={{ color: "white" }} name="camera" />
                </TouchableOpacity>
            </View>

// Image Picker Immediately invoked function expression
(async () => {
            if (Platform.OS !== "web") {
                const {
                    status,
                } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!")
                }
            }
        })();
const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.canceled) {
            setMainImage(result.uri);
            setImage(result.uri);
        }
    };

 <TouchableOpacity 
                    onPress={pickImage} 
                    style={styles.imagePicker}>
                   <Icon style={{ color: "white"}} name="camera"/>
               </TouchableOpacity>


add product
const addProduct = () => {
        if (
            name == "" ||
            brand == "" ||
            price == "" ||
            description == "" ||
            category == "" ||
            countInStock == ""
        ) {
            setError("Please fill in the form correctly")
        }

        let formData = new FormData();

       
        formData.append("name", name);
        formData.append("brand", brand);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("countInStock", countInStock);
        formData.append("richDescription", richDescription);
        formData.append("rating", rating);
        formData.append("numReviews", numReviews);
        formData.append("isFeatured", isFeatured);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`
            }
        }
axios
            .post(`${baseURL}products`, formData, config)
            .then((res) => {
                if (res.status == 200 || res.status == 201) {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "New Product added",
                        text2: ""
                    });
                    setTimeout(() => {
                        props.navigation.navigate("Products");
                    }, 500)
                }
            })
            .catch((error) => {
                console.log(error)
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "Something went wrong",
                    text2: "Please try again"
                })
            })

 <View style={styles.buttonContainer}>
    <EasyButton
        large
        primary
    onPress={() => addProduct()}


upload image
npm i mime
 let formData = new FormData();
const newImageUri = "file:///" + image.split("file:/").join("");
        // console.log("new", newImageUri)

        formData.append("image", {
            uri: newImageUri,
            type: mime.getType(newImageUri),
            name: newImageUri.split("/").pop()
        });

update product

setCategory(props.route.params.item.category._id);
            setPickerValue(props.route.params.item.category._id);

useEffect(() => {

        if(!props.route.params) {
            setItem(null);
        } else {
            setItem(props.route.params.item);
            setBrand(props.route.params.item.brand);
            setName(props.route.params.item.name);
            setPrice(props.route.params.item.price.toString());
            setDescription(props.route.params.item.description);
            setMainImage(props.route.params.item.image);
            setImage(props.route.params.item.image);
            setCategory(props.route.params.item.category._id);
            setCountInStock(props.route.params.item.countInStock.toString());
        }
    //addProduct
 const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`
            }
        }
 if(item !== null) {
            axios
            .put(`${baseURL}products/${item.id}`, formData, config)
            .then((res) => {
                if(res.status == 200 || res.status == 201) {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "Product successfuly updated",
                        text2: ""
                    });
                    setTimeout(() => {
                        props.navigation.navigate("Products");
                    }, 500)
                }
            })
            .catch((error) => {
                Toast.show({
                    topOffset: 60,
                        type: "error",
                        text1: "Something went wrong",
                        text2: "Please try again"
                })
            })
        } else {
            axios
            .post(`${baseURL}products`, formData, config)

confirm order
cart/checkout/confirm

import Toast from "react-native-toast-message";
import axios from "axios";
import baseURL from "../../../assets/common/baseUrl";
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux'
const finalOrder = props.route.params;
const dispatch = useDispatch()
  let navigation = useNavigation()

const confirmOrder = () => {
    const order = finalOrder.order.order;
    const [token, setToken] = useState();
    AsyncStorage.getItem("jwt")
      .then((res) => {
        setToken(res)

      })
      .catch((error) => console.log(error))
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    axios
      .post(`${baseURL}orders`, order, config)
      .then((res) => {
        if (res.status == 200 || res.status == 201) {
          Toast.show({
            topOffset: 60,
            type: "success",
            text1: "Order Completed",
            text2: "",
          });
          setTimeout(() => {
            dispatch(actions.clearCart());
            navigation.navigate("Cart");
          }, 500);
        }
      })
      .catch((error) => {
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "Something went wrong",
          text2: "Please try again",
        });
      });
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Center width={"90%"}>
          <Text style={styles.title}>items</Text>

          {confirm ? finalOrder.order.order.orderItems.map((item) => {
            return (
              // console.log(x)
              <HStack space={[2, 3]} justifyContent="space-between">
                <Avatar size="48px" source={{
                  uri: item.image ?
                    item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                }}
                />
                <VStack>
                  <Text _dark={{
                    color: "warmGray.50"
                  }} color="coolGray.800" bold>
                    {item.name}
                  </Text>
                  <Text color="coolGray.600" _dark={{
                    color: "warmGray.200"
                  }}>
                    {item.description}
                  </Text>
                </VStack>
                <Spacer />
                <Text fontSize="xs" _dark={{
                  color: "warmGray.50"
                }} color="coolGray.800" alignSelf="flex-start">
                  {item.price}
                </Text>
              </HStack>
            )
          }) : null}
          <View style={{ alignItems: "center", margin: 20 }}>
            <Button title={"Place order"} onPress={confirmOrder} />
          </View>
        </Center>
      </ScrollView>
    )
  }

replace confirm with finalOrder

backend/models/order
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);



/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */

 router.post('/', async (req,res)=>{
    console.log(req.body)
    const orderItemsIds = req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    })
   console.log(orderItemsIds)
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
     order = await order.save();

    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
})

 const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        console.log(req.body)
        // const orderItemsIds = req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            })

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        })
    )
        console.log(orderItemsIds)
        const orderItemsIdsResolved =  await orderItemsIds;

screens/admin/order.js
import React, { useCallback, useState } from "react";
import {View, Text, FlatList} from 'react-native'
import axios from 'axios'
import baseURL from "../../assets/common/baseUrl";
import { useFocusEffect } from '@react-navigation/native'
const Orders = (props) => {
    const [orderList, setOrderList] = useState()

    useFocusEffect(
        useCallback(
            () => {
                    getOrders();
                return () => {
                    setOrderList()
                }
            },[],
        )
    )
    console.log(`${baseURL}orders`)
    const getOrders = () => {
        axios.get(`${baseURL}orders`)
        .then((x) => {
            
            setOrderList(x.data)
        })
        .catch((error) => console.log(error))
    }
    console.log(orderList)
    return (
        
        <View>
            <FlatList 
                data={orderList}
                renderItem={({item}) => ( 
                   
                    <Text>{item.shippingAddress1}</Text>
                    )
                }
                keyExtractor={(item) => item.id}    
            />
        </View>
    )
} 

export default Orders;

shared/OrderCard.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import TrafficLight from "./StyledComponents/TrafficLight";
import EasyButton from "./StyledComponents/EasyButton";
import Toast from "react-native-toast-message";

import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from "axios";
import baseURL from "../config/api";

const OrderCard = ({item}) => {
    const [orderStatus, setOrderStatus] = useState();
    const [statusText, setStatusText] = useState();
    const [statusChange, setStatusChange] = useState();
    const [token, setToken] = useState();
    const [cardColor, setCardColor] = useState();
  
    useEffect(() => {
      if (item.status == "3") {
        setOrderStatus(<TrafficLight unavailable></TrafficLight>);
        setStatusText("pending");
        setCardColor("#E74C3C");
      } else if (item.status == "2") {
        setOrderStatus(<TrafficLight limited></TrafficLight>);
        setStatusText("shipped");
        setCardColor("#F1C40F");
      } else {
        setOrderStatus(<TrafficLight available></TrafficLight>);
        setStatusText("delivered");
        setCardColor("#2ECC71");
      }
  
      return () => {
        setOrderStatus();
        setStatusText();
        setCardColor();
      };
    }, []);

    return (
        <View style={[{ backgroundColor: cardColor }, styles.container]}>
          <View style={styles.container}>
            <Text>Order Number: #{item.id}</Text>
          </View>
        </View>
       
      );
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
      margin: 10,
      borderRadius: 10,
    },
    title: {
      backgroundColor: "#62B1F6",
      padding: 5,
    },
    priceContainer: {
      marginTop: 10,
      alignSelf: "flex-end",
      flexDirection: "row",
    },
    price: {
      color: "white",
      fontWeight: "bold",
    },
  });
  
  export default OrderCard;

  screens/admin/order
  renderItem={({item}) => ( 
                   
    <OrderCard navigation={props.navigation} {...item} />
    )
}

screens/cart/checkout/checkout.js
useEffect(() => {
        setOrderItems(cartItems)
if(context.stateUser.isAuthenticated) {
            setUser(context.stateUser.user.userId)
        } else {
            props.navigation.navigate("Cart");
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Please Login to Checkout",
                text2: ""
            });
        }
 shippingAddress2: address2,
            status: "3",
            user,

OrderCard
const codes = [
  { name: "pending", code: "3" },
  { name: "shipped", code: "2" },
  { name: "delivered", code: "1" },
];

 <View style={[{ backgroundColor: cardColor }, styles.container]}>
      <View style={styles.container}>
        <Text>Order Number: #{item.id}</Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <Text>
          Status: {statusText} {orderStatus}
        </Text>
        <Text>
          Address: {item.shippingAddress1} {item.shippingAddress2}
        </Text>
        <Text>City: {item.city}</Text>
        <Text>Country: {item.country}</Text>
        <Text>Date Ordered: {item.dateOrdered.split("T")[0]}</Text>
        <View style={styles.priceContainer}>
          <Text>Price: </Text>
          <Text style={styles.price}>$ {item.totalPrice}</Text>
        </View>
        {/* {item.editMode ? ( */}
        <View>

          <Select
            width="80%"
            iosIcon={<Icon name="arrow-down" color={"#007aff"} />}
            style={{ width: undefined }}
            selectedValue={statusChange}
            color="white"
            placeholder="Change Status"
            placeholderTextColor="white"
            placeholderStyle={{ color: '#FFFFFF' }}
            placeholderIconColor="#007aff"
            onValueChange={(e) => setStatusChange(e)}
          >
            {codes.map((c) => {
              return <Select.Item
                key={c.code}
                label={c.name}
                value={c.code}
              />
            })}
          </Select>

          <EasyButton
            secondary
            large
          // onPress={() => updateOrder()}
          >
            <Text style={{ color: "white" }}>Update</Text>
          </EasyButton>
        </View>
        {/* //   ) : null} */}
      </View>
    </View>
screens/cart/cart
import AuthGlobal from "../../Context/store/AuthGlobal"
const context = useContext(AuthGlobal);

 <Text style={{ color: 'white' }}>Clear</Text>
                    </EasyButton>
                </HStack>
{context.stateUser.isAuthenticated ? (
                <EasyButton
                  primary
                  medium
                  onPress={() => props.navigation.navigate('Checkout')}
                >
                <Text style={{ color: 'white' }}>Checkout</Text>
                </EasyButton>
              ) : (
                <EasyButton
                        secondary
                        medium
                        onPress={() => navigation.navigate('User', {screen:'Login'})}
                    >
              )}

shared/OrderCard
const updateOrder = () => {
    AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res);
            })
            .catch((error) => console.log(error));
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const order = {
            city: props.city,
            country: props.country,
            dateOrdered: props.dateOrdered,
            id: props.id,
            orderItems: props.orderItems,
            phone: props.phone,
            shippingAddress1: props.shippingAddress1,
            shippingAddress2: props.shippingAddress2,
            status: statusChange,
            totalPrice: props.totalPrice,
            user: props.user,
            zip: props.zip,
          };
          axios
      .put(`${baseURL}orders/${props.id}`, order, config)
      .then((res) => {
        if (res.status == 200 || res.status == 201) {
          Toast.show({
            topOffset: 60,
            type: "success",
            text1: "Order Edited",
            text2: "",
          });
          setTimeout(() => {
            props.navigation.navigate("Products");
          }, 500);
        }
      })
      .catch((error) => {
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "Something went wrong",
          text2: "Please try again",
        });
      });
    }




useEffect(() => {

        AsyncStorage.getItem("jwt")
        .then((res) => {
          setToken(res);
        })
        .catch((error) => console.log(error));

<EasyButton
        secondary
        large
        onPress={() => updateOrder()}
    >
        <Text style={{ color: "white" }}>Update</Text>
    </EasyButton>

sreens/user/userprofile

AsyncStorage.getItem("jwt")
            .then((res) => {
                axios
                    .get(`${baseURL}users/${context.stateUser.user.userId}`, {
                        headers: { Authorization: `Bearer ${res}` },
                    })
                    .then((user) => setUserProfile(user.data))
            })
            .catch((error) => console.log(error))
axios
        .get(`${baseURL}orders`)
        .then((x) => {
            const data = x.data;
            console.log(data)
            const userOrders = data.filter(
                (order) => order.user._id === context.stateUser.user.sub
            );
            setOrders(userOrders);
        })
        .catch((error) => console.log(error))
         return () => {
            setUserProfile();
            setOrders();
        }

after signout
<View style={styles.order}>
                   <Text style={{ fontSize: 20 }}>My Orders</Text>
                   <View>
                       {orders ? (
                           orders.map((x) => {
                               return <OrderCard key={x.id} {...x} />;
                           })
                       ) : (
                           <View style={styles.order}>
                               <Text>You have no orders</Text>
                           </View>
                       )}
                   </View>
               </View>

checkout
if(context.stateUser.isAuthenticated) {
            setUser(context.stateUser.user.userId)
        } else {
            navigation.navigate("Cart");
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Please Login to Checkout",
                text2: ""
            });
        }

admin/screens/categories
import React, { useEffect, useState } from "react"
import { 
    View, 
    Text,
    FlatList,
    Dimensions,
    TextInput,
    StyleSheet 
} from "react-native"
import EasyButton from "../../Shared/StyledComponents/EasyButton"
import baseURL from "../../assets/common/baseUrl";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'
// import { add } from "react-native-reanimated";

var { width } = Dimensions.get("window")

const Item = (props) => {
    return (
        <View style={styles.item}>
            <Text>{props.item.name}</Text>
            <EasyButton
                danger
                medium
                onPress={() => props.delete(props.item._id)}
            >
                <Text style={{ color: "white", fontWeight: "bold"}}>Delete</Text>
            </EasyButton>
        </View>
    )
}

const Categories = (props) => {

    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState();
    const [token, setToken] = useState();

    useEffect(() => {
        AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res);
            })
            .catch((error) => console.log(error));

        axios
        .get(`${baseURL}categories`)
        .then((res) => setCategories(res.data))
        .catch((error) => alert("Error to load categories"))

        return () => {
            setCategories();
            setToken();
        }
    }, [])

    const addCategory = () => {
        const category = {
            name: categoryName
        };

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        axios
        .post(`${baseURL}categories`, category, config)
        .then((res) => setCategories([...categories, res.data]))
        .catch((error) => alert("Error to load categories"));

        setCategoryName("");
    }

    const deleteCategory = (id) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        axios
        .delete(`${baseURL}categories/${id}`, config)
        .then((res) => {
            const newCategories = categories.filter((item) => item.id !== id);
            setCategories(newCategories);
        })
        .catch((error) => alert("Error to load categories"));
    }

    return (
        <View style={{ position: "relative", height: "100%"}}>
            <View style={{ marginBottom: 60 }}>
                <FlatList 
                    data={categories}
                    renderItem={({ item, index }) => (
                        <Item item={item} index={index} delete={deleteCategory} />
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>
            <View style={styles.bottomBar}>
                <View>
                    <Text>Add Category</Text>
                </View>
                <View style={{ width: width / 2.5 }}>
                    <TextInput 
                        value={categoryName}
                        style={styles.input}
                        onChangeText={(text) => setCategoryName(text)}
                    />
                </View>
                <View>
                    <EasyButton
                        medium
                        primary
                        onPress={() => addCategory()}
                    >
                        <Text style={{ color: "white", fontWeight: "bold"}}>Submit</Text>
                    </EasyButton>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bottomBar: {
        backgroundColor: "white",
        width: width,
        height: 60,
        padding: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 0,
        left: 0
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1
    },
    item: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
        padding: 5,
        margin: 5,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 5
    }
})

export default Categories;