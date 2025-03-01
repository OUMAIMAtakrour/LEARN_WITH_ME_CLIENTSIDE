import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Text, Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CourseDetail: { id: string };
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const formHeight = useRef(new Animated.Value(330)).current;

  useEffect(() => {
    Animated.timing(formHeight, {
      toValue: isLogin ? 330 : 460,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isLogin]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    Animated.spring(slideAnim, {
      toValue: isLogin ? 1 : 0,
      useNativeDriver: true,
      tension: 45,
      friction: 8,
    }).start();
  };



  const handleSuccess = () => {
    navigation.navigate("Home");
  };

  return (
    <LinearGradient colors={["#F8F9FF", "#EEF1FF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{
            uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-16SAiIIQYp7OmgZtZ9EKgGMOYn8GAl.png",
          }}
          style={styles.illustration}
        />

        <Surface style={styles.contentCard}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.subtitle}>Education App</Text>

          <Animated.View style={[styles.formContainer, { height: formHeight }]}>
            <Text style={styles.formTitle}>
              {isLogin ? "Login" : "Register"}
            </Text>

            {isLogin ? (
              <LoginForm onToggleForm={toggleForm} onSuccess={handleSuccess} />
            ) : (
              <RegisterForm
                onToggleForm={toggleForm}
                onSuccess={handleSuccess}
              />
            )}
          </Animated.View>
        </Surface>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: "#6C63FF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginTop: 5,
  },
  formContainer: {
    marginTop: 32,
    overflow: "hidden",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
});

export default LoginScreen;
