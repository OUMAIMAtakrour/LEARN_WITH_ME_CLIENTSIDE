// VideoPlayer.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCoursesStore } from "../store/courseStore";
import { ArrowLeft } from "lucide-react-native";
import Video from "react-native-video"; // Or whatever video library you're using

const VideoPlayer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { videoUrl, videoId, courseId, videoTitle, videoDuration } =
    route.params;
  const { updateVideoProgress, currentProgress } = useCoursesStore();
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [paused, setPaused] = useState(false);

  // Find this video's progress
  const initialProgress = currentProgress?.videosProgress?.find(
    (vp) => vp.videoId === videoId
  );

  // Track progress at regular intervals
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!paused && currentTime > 0) {
        updateVideoProgress(
          courseId,
          videoId,
          currentTime,
          currentTime / videoDuration >= 0.9 // Mark as completed if watched 90%
        );
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(progressInterval);
  }, [currentTime, paused, courseId, videoId]);

  // Save progress when leaving the screen
  useEffect(() => {
    return () => {
      if (currentTime > 0) {
        updateVideoProgress(
          courseId,
          videoId,
          currentTime,
          currentTime / videoDuration >= 0.9
        );
      }
    };
  }, [currentTime, courseId, videoId]);

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleEnd = () => {
    // Mark as completed when video ends
    updateVideoProgress(courseId, videoId, videoDuration, true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {videoTitle}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="contain"
          onProgress={handleProgress}
          onEnd={handleEnd}
          paused={paused}
          // Start from previous position if available
          initialTime={initialProgress?.watchedSeconds || 0}
          controls={true}
          // Other video props as needed
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  placeholder: {
    width: 24,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: 300,
  },
});

export default VideoPlayer;
