import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useCoursesStore } from "../store/courseStore";
import { MINIO_BASE_URL, MINIO_BUCKET_NAME } from "../config";
import { ArrowLeft, BookOpen, Clock, Star, Users } from "lucide-react-native";
import { coursesService } from "../api/services/courseService";
import { ApolloClient } from "@apollo/client";
import { Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
const CourseDetails = ({}) => {
  const {
    courseDetails,
    isLoading,
    error,
    fetchCourseDetails,
    currentProgress,
    fetchCourseProgress,
    enrollInCourse,
  } = useCoursesStore();
  const [enrolling, setEnrolling] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params;

  const isEnrolled = !!currentProgress;

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);

      fetchCourseProgress(courseId);
    }
  }, [courseId]);

 
  const handleEnroll = async () => {
    if (isEnrolled) {
      navigation.navigate("Progress", { courseId });
      return;
    }

    try {
      setEnrolling(true);
      const result = await enrollInCourse(courseId);

      if (result && result.alreadyEnrolled) {
        Alert.alert(
          "Already Enrolled",
          "You are already enrolled in this course.",
          [
            {
              text: "Continue Learning",
              onPress: () => navigation.navigate("Progress", { courseId }),
            },
          ]
        );
        return;
      }

      await fetchCourseProgress(courseId);

      Alert.alert(
        "Enrollment Successful",
        "You are now enrolled in this course!",
        [
          {
            text: "Start Learning",
            onPress: () => navigation.navigate("Progress", { courseId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Enrollment Failed", error.message || "Something went wrong");
    } finally {
      setEnrolling(false);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!courseDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No course details available.</Text>
      </View>
    );
  }

  const getImageUrl = (imageUrl?: string, imageKey?: string): string | null => {
    if (imageUrl && imageUrl.startsWith("http")) return imageUrl;
    if (imageKey)
      return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/course-images/${imageKey}`;
    if (imageUrl)
      return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/course-images/${imageUrl}`;
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>

          {courseDetails.courseImageUrl && (
            <Image
              source={{
                uri: courseDetails.courseImageUrl.replace(
                  "localhost",
                  "192.168.9.93"
                ),
              }}
              style={styles.courseImage}
            />
          )}
          <View style={styles.imageOverlay} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{courseDetails.category}</Text>
          </View>

          <Text style={styles.title}>{courseDetails.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Star size={16} color="#FBBF24" />
              <Text style={styles.statText}>{courseDetails.rating}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users size={16} color="#6366F1" />
              <Text style={styles.statText}>
                {courseDetails.students} students
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={16} color="#6366F1" />
              <Text style={styles.statText}>10 hours</Text>
            </View>
          </View>

          {courseDetails.teacher && (
            <View style={styles.teacherContainer}>
              <Image
                source={{ uri: courseDetails.teacher.profileImageUrl }}
                style={styles.teacherImage}
              />
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherLabel}>Instructor</Text>
                <Text style={styles.teacherName}>
                  {courseDetails.teacher.name}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this course</Text>
            <Text style={styles.description}>{courseDetails.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you'll learn</Text>
            <View style={styles.learningPoints}>
              <View style={styles.learningPoint}>
                <BookOpen size={16} color="#6366F1" />
                <Text style={styles.learningPointText}>
                  Comprehensive curriculum
                </Text>
              </View>
              <View style={styles.learningPoint}>
                <BookOpen size={16} color="#6366F1" />
                <Text style={styles.learningPointText}>Hands-on projects</Text>
              </View>
              <View style={styles.learningPoint}>
                <BookOpen size={16} color="#6366F1" />
                <Text style={styles.learningPointText}>Expert instruction</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>${courseDetails.price}</Text>
        </View>
        {isEnrolled ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate("Progress", { courseId })}
          >
            <Text style={styles.buttonText}>Continue Learning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.enrollButton, enrolling && styles.enrollingButton]}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enroll Now</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    position: "relative",
    height: 280,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  courseImage: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  contentContainer: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  categoryPill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    lineHeight: 32,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 4,
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  teacherContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  teacherImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#fff",
  },
  teacherInfo: {
    flex: 1,
  },
  teacherLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },
  learningPoints: {
    gap: 12,
  },
  learningPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  learningPointText: {
    fontSize: 15,
    color: "#4B5563",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  enrollButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  enrollButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  enrollingButton: {
    backgroundColor: "#4F46E5", 
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CourseDetails;
