// CourseProgress.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
} from "lucide-react-native";
import { useCoursesStore } from "../store/courseStore";
import { getImageUrl, getVideoUrl } from "../utils/mediaUtils";

const CourseProgress = ({ route, navigation }) => {
  const { courseId } = route.params;
  const {
    courseDetails,
    currentProgress,
    isLoading,
    error,
    fetchCourseDetails,
    fetchCourseProgress,
    calculateOverallProgress,
    enrollInCourse,
  } = useCoursesStore();

  const [isEnrolled, setIsEnrolled] = useState(true); // Assume enrolled initially
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      if (courseId) {
        // First load course details
        await fetchCourseDetails(courseId);

        // Then try to get progress to check enrollment
        try {
          const progress = await fetchCourseProgress(courseId);
          setIsEnrolled(!!progress);
        } catch (err) {
          console.log(
            "Error fetching progress, user might not be enrolled:",
            err
          );
          setIsEnrolled(false);
        }
      }
    };

    loadCourseData();
  }, [courseId]);

  // Watching for changes to currentProgress
  useEffect(() => {
    setIsEnrolled(!!currentProgress);
  }, [currentProgress]);

  const handlePlayVideo = (video) => {
    if (!isEnrolled) {
      Alert.alert(
        "Not Enrolled",
        "You need to enroll in this course to watch videos.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Enroll Now", onPress: handleEnrollment },
        ]
      );
      return;
    }

    // Save the video ID either from _id or key property
    const videoId = video._id || video.key;

    // Get the proper video URL from MinIO
    const videoUrl = getVideoUrl(video.url, video.key);

    navigation.navigate("VideoPlayer", {
      videoUrl,
      videoId,
      courseId,
      videoTitle: video.title,
      videoDuration: video.duration,
    });
  };

  const handleEnrollment = async () => {
    setEnrollmentLoading(true);
    try {
      const result = await enrollInCourse(courseId);
      if (result) {
        setIsEnrolled(true);
        Alert.alert("Success", "You've been enrolled in this course!");
      } else {
        Alert.alert(
          "Error",
          "Failed to enroll in this course. Please try again."
        );
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setEnrollmentLoading(false);
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            fetchCourseDetails(courseId);
            fetchCourseProgress(courseId);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getVideoProgress = (videoId) => {
    if (!currentProgress || !currentProgress.videosProgress) return null;
    return currentProgress.videosProgress.find((vp) => vp.videoId === videoId);
  };

  const overallProgress = isEnrolled ? calculateOverallProgress(courseId) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Progress</Text>
        <View style={styles.placeholder} />
      </View>

      {courseDetails && (
        <View style={styles.progressContainer}>
          <Text style={styles.courseTitle}>{courseDetails.title}</Text>

          {/* Course image if available */}
          {(courseDetails.courseImageUrl || courseDetails.courseImageKey) && (
            <Image
              source={{
                uri: getImageUrl(
                  courseDetails.courseImageUrl,
                  courseDetails.courseImageKey
                ),
              }}
              style={styles.courseImage}
              resizeMode="cover"
            />
          )}

          {isEnrolled ? (
            <>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${overallProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {overallProgress}% Complete
              </Text>
            </>
          ) : (
            <View style={styles.enrollContainer}>
              <Text style={styles.enrollText}>
                You are not enrolled in this course yet.
              </Text>
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={handleEnrollment}
                disabled={enrollmentLoading}
              >
                {enrollmentLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <BookOpen
                      size={16}
                      color="#FFFFFF"
                      style={styles.enrollIcon}
                    />
                    <Text style={styles.enrollButtonText}>Enroll Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={courseDetails?.courseVideos || []}
        keyExtractor={(item) => item._id || item.key}
        renderItem={({ item, index }) => {
          const videoId = item._id || item.key;
          const videoProgress = getVideoProgress(videoId);
          const isCompleted = videoProgress?.completed;

          // Apply different style for non-enrolled users
          const itemStyle = [
            styles.videoItem,
            !isEnrolled && styles.videoItemDisabled,
          ];

          return (
            <TouchableOpacity
              style={itemStyle}
              onPress={() => handlePlayVideo(item)}
            >
              <View style={styles.videoNumber}>
                <Text style={styles.videoNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.videoContent}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.videoDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.videoMeta}>
                  <View style={styles.videoDuration}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.videoDurationText}>
                      {Math.round(item.duration || 0)} min
                    </Text>
                  </View>
                  {isCompleted ? (
                    <View style={styles.videoCompleted}>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={styles.videoCompletedText}>Completed</Text>
                    </View>
                  ) : videoProgress ? (
                    <View style={styles.videoProgress}>
                      <Clock size={14} color="#6366F1" />
                      <Text style={styles.videoProgressText}>
                        {Math.round(videoProgress.watchedSeconds / 60)} min
                        watched
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.videoAction}>
                <Play size={20} color={isEnrolled ? "#6366F1" : "#A5A6F6"} />
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  courseImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  safeArea: {
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  enrollContainer: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  enrollText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    textAlign: "center",
  },
  enrollButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  enrollIcon: {
    marginRight: 6,
  },
  listContent: {
    padding: 16,
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  videoItemDisabled: {
    opacity: 0.7,
  },
  videoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  videoNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  videoContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoDuration: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  videoDurationText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  videoCompleted: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoCompletedText: {
    fontSize: 12,
    color: "#10B981",
    marginLeft: 4,
  },
  videoProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoProgressText: {
    fontSize: 12,
    color: "#6366F1",
    marginLeft: 4,
  },
  videoAction: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default CourseProgress;
