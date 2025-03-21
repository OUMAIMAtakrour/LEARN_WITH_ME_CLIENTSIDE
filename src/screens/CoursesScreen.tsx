import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useEffect } from "react";
import { useCoursesStore } from "../store/courseStore";
import { MINIO_BASE_URL, MINIO_BUCKET_NAME } from "../config"; // Add this import
import { Teacher } from "../types/auth";
import { Course } from "../types/auth";
export default function CoursesScreen({ navigation }) {
  const theme = useTheme();

  // Use your Zustand store
  const { courses, filteredCourses, isLoading, error, fetchAllCourses } =
    useCoursesStore();

  useEffect(() => {
    // Fetch courses when component mounts
    fetchAllCourses();
  }, []);
  // console.log("MINIO_BASE_URL:", MINIO_BASE_URL);
  // console.log("MINIO_BUCKET_NAME:", MINIO_BUCKET_NAME);
  // Helper function to get proper image URL from Minio
  const getImageUrl = (imageUrl?: string, imageKey?: string): string | null => {
    // First priority: use full URL if available
    if (imageUrl && imageUrl.startsWith("http")) {
      return imageUrl;
    }

    // Second priority: construct URL from key if available
    if (imageKey) {
      return `course-images/${imageKey}`;
    }

    // Third priority: if imageUrl is just a path, construct full URL
    if (imageUrl) {

      return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/course-images/${imageUrl}`;
    }

    // Fallback to placeholder
    return null;
  };

  const renderContent = () => {
    // Use filteredCourses from your store as it already accounts for any filtering
    const coursesToDisplay = filteredCourses;

    if (isLoading && !coursesToDisplay.length) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.text }}>
            Loading courses...
          </Text>
        </View>
      );
    }

    if (error && !coursesToDisplay.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={{ color: theme.colors.error, marginBottom: 16 }}>
            {error}
          </Text>
          <Button
            mode="contained"
            onPress={() => fetchAllCourses(true)} // Call store's retry function
            style={{ backgroundColor: theme.colors.primary }}
          >
            Retry
          </Button>
        </View>
      );
    }

    if (!coursesToDisplay.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={{ color: theme.colors.text }}>
            No courses available at the moment.
          </Text>
        </View>
      );
    }

    return coursesToDisplay.map((course, index) => {
      // Get proper image URL using both URL and key fields
      const courseImageSrc =
        getImageUrl(
          course.courseImageUrl?.replace("localhost", "192.168.9.93"),
          course.courseImageKey
        ) || `https://picsum.photos/seed/${index + 1}/300`;

      // Handle potentially null teacher
      const teacherName = course.teacher?.name || "Instructor";
      const teacherImage =
        course.teacher?.profileImageUrl ||
        `https://picsum.photos/seed/${index + 10}/100`;

      return (
        <Animated.View
          key={course._id || index}
          entering={FadeInUp.delay(200 + index * 100)}
        >
          <Card
            style={[
              styles.courseCard,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() =>
              navigation.navigate("CourseDetail", { courseId: course._id })
            }
          >
            <Card.Cover
              source={{ uri: courseImageSrc }}
              style={styles.courseImage}
            />
            <Card.Content>
              <Text style={[styles.courseTitle, { color: theme.colors.text }]}>
                {course.title}
              </Text>
              <Text
                style={[
                  styles.courseLevel,
                  { color: theme.colors.placeholder },
                ]}
              >
                {course.level || "Beginner"}
              </Text>
              <Text
                style={[styles.courseDescription, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {course.description || "No description available"}
              </Text>

              <View style={styles.teacherSection}>
                <Image
                  source={{ uri: teacherImage }}
                  style={styles.teacherImage}
                />
                <View style={styles.teacherInfo}>
                  <Text
                    style={[styles.teacherName, { color: theme.colors.text }]}
                  >
                    {teacherName}
                  </Text>
                  <Text
                    style={[
                      styles.teacherSubject,
                      { color: theme.colors.placeholder },
                    ]}
                  >
                    {course.category || "General"}
                  </Text>
                </View>
              </View>

              {/* Display progress if available */}
              {(course.progress !== undefined || course.userProgress) && (
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: theme.colors.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            course.progress || course.userProgress || 0
                          }%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: theme.colors.placeholder },
                    ]}
                  >
                    {course.progress || course.userProgress || 0}%
                  </Text>
                </View>
              )}
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() =>
                  navigation.navigate("CourseDetail", { courseId: course._id })
                }
                style={[
                  styles.viewButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                View Course
              </Button>
            </Card.Actions>
          </Card>
        </Animated.View>
      );
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          All Courses
        </Text>
        {isLoading && filteredCourses.length > 0 && (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginLeft: 16 }}
          />
        )}
      </View>

      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  centerContent: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  courseCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
  },
  courseImage: {
    height: 160,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  courseLevel: {
    fontSize: 14,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  teacherSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  teacherImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  teacherSubject: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  viewButton: {
    borderRadius: 20,
    marginTop: 8,
  },
});
