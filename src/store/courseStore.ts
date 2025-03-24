import { create } from "zustand";
import { coursesService } from "../api/services/courseService";
import { ApolloError } from "@apollo/client";
import { Alert } from "react-native";
import { CourseProgress, VideoProgress } from "../types/auth";
import { ApolloClient } from "@apollo/client";
import { UPDATE_VIDEO_PROGRESS } from "../api/graphql/mutation";
import { apolloClient } from "../api/apollo";

// Define types for better TypeScript support
// In your store file:
type Course = {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  level?: string;
  rating?: number;
  students?: number;
  courseImageUrl?: string;
  courseImageKey?: string;
  progress?: number;
  userProgress?: number;
  teacher?: {
    _id: string;
    name?: string;
    profileImageUrl?: string;
  };
  courseVideos?: Array<{
    _id?: string;
    title: string;
    description?: string;
    url?: string;
    key?: string;
    duration?: number;
    order?: number;
  }>;
  courseDocuments?: Array<{
    _id?: string;
    title: string;
    description?: string;
    url?: string;
    key?: string;
    order?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

type CourseState = {
  courses: Course[];
  filteredCourses: Course[];
  courseDetails: Course | null;
  categories: string[];
  activeCategory: string;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  currentProgress: CourseProgress | null;

  fetchAllCourses: (manualRetry?: boolean) => Promise<Course[]>;
  fetchCourseDetails: (courseId: string) => Promise<Course | null>;
  fetchTeacherCourses: (teacherId: string) => Promise<Course[]>;
  createCourse: (courseInput: any, courseImage?: any) => Promise<Course | null>;
  updateCourse: (courseId: string, updateInput: any) => Promise<Course | null>;
  setActiveCategory: (category: string) => void;
  filterCoursesByCategory: (category: string) => void;
  resetError: () => void;

  // Course Progress Actions
  enrollInCourse: (courseId: string) => Promise<CourseProgress | null>;
  fetchCourseProgress: (courseId: string) => Promise<CourseProgress | null>;
  updateVideoProgress: (
    courseId: string,
    videoId: string,
    watchedSeconds: number,
    completed?: boolean
  ) => Promise<VideoProgress | null>;
  calculateOverallProgress: (courseId: string) => number;
};

// Maximum number of automatic retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

export const useCoursesStore = create<CourseState>((set, get) => ({
  courses: [],
  filteredCourses: [],
  courseDetails: null,
  categories: ["All"],
  activeCategory: "All",
  isLoading: false,
  error: null,
  retryCount: 0,
  currentProgress: null,

  fetchAllCourses: async (manualRetry = false) => {
    if (manualRetry) {
      set({ retryCount: 0 });
    }

    set({ isLoading: true, error: null });

    try {
      // Add a small timeout to prevent rapid successive calls
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Modify your query to only request fields that are definitely available
      const data = await coursesService.getAllCoursesWithoutTeacherName();

      // Extract unique categories
      const uniqueCategories = ["All"];
      data.forEach((course: Course) => {
        if (course.category && !uniqueCategories.includes(course.category)) {
          uniqueCategories.push(course.category);
        }
      });

      set({
        courses: data || [],
        filteredCourses: data || [],
        categories: uniqueCategories,
        retryCount: 0,
        isLoading: false,
      });

      return data;
    } catch (err) {
      console.error("Error fetching courses:", err);

      const error = err as ApolloError;

      // Check if it's a 400 error (likely backend validation issue)
      const is400Error =
        error.message?.includes("400") ||
        error.networkError?.statusCode === 400;

      // Determine if we should retry automatically
      const { retryCount } = get();
      const shouldAutoRetry = !is400Error && retryCount < MAX_RETRIES;

      if (shouldAutoRetry) {
        set((state) => ({ retryCount: state.retryCount + 1 }));

        // Schedule a retry after delay
        setTimeout(() => {
          console.log(
            `Auto-retrying fetch (${get().retryCount}/${MAX_RETRIES})...`
          );
          get().fetchAllCourses();
        }, RETRY_DELAY);

        set({
          error: `Network issue detected. Retrying... (${
            get().retryCount
          }/${MAX_RETRIES})`,
        });
      } else {
        // Format a more user-friendly error message
        let errorMsg = "Unable to load courses";

        if (is400Error) {
          errorMsg = "Invalid request. Please check your inputs.";
        } else if (error.networkError) {
          errorMsg =
            "Network connection issue. Please check your internet connection.";
        } else if (error.graphQLErrors?.length) {
          errorMsg =
            error.graphQLErrors[0].message || "Server validation error";
        }

        set({ error: errorMsg, isLoading: false });
      }

      return [];
    }
  },

  // Fetch course details
  fetchCourseDetails: async (courseId) => {
    if (!courseId) {
      set({ error: "Invalid course ID" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.getCourseDetails(courseId);
      set({ courseDetails: data, isLoading: false });

      // Fetch course progress after loading course details
      try {
        await get().fetchCourseProgress(courseId);
      } catch (progressErr) {
        console.log(
          "Failed to load progress, but course details loaded successfully"
        );
      }

      return data;
    } catch (err) {
      console.error(`Error fetching course ${courseId}:`, err);

      // Format user-friendly error
      let errorMsg = `Couldn't load course details`;

      const error = err as ApolloError;
      if (error.networkError) {
        errorMsg =
          "Network connection issue. Please check your internet connection.";
      } else if (error.graphQLErrors?.length) {
        errorMsg = error.graphQLErrors[0].message || "Server error";
      }

      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  // Fetch teacher courses
  fetchTeacherCourses: async (teacherId) => {
    if (!teacherId) {
      set({ error: "Invalid teacher ID" });
      return [];
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.getTeacherCourses(teacherId);
      set({
        courses: data || [],
        filteredCourses: data || [],
        isLoading: false,
      });
      return data;
    } catch (err) {
      console.error(`Error fetching teacher ${teacherId} courses:`, err);
      set({ error: "Failed to load teacher courses", isLoading: false });
      return [];
    }
  },

  // Create new course
  createCourse: async (courseInput, courseImage) => {
    if (!courseInput) {
      set({ error: "Course data is required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.createCourse(courseInput, courseImage);

      // Refresh the courses list on success
      get().fetchAllCourses();

      // Show success message
      Alert.alert("Success", "Course created successfully");

      set({ isLoading: false });
      return data;
    } catch (err) {
      console.error("Error creating course:", err);

      let errorMsg = "Failed to create course";

      const error = err as ApolloError;
      if (error.graphQLErrors?.length) {
        errorMsg = error.graphQLErrors[0].message || "Validation error";
      }

      set({ error: errorMsg, isLoading: false });
      Alert.alert("Error", errorMsg);
      return null;
    }
  },

  // Update existing course
  updateCourse: async (courseId, updateInput) => {
    if (!courseId || !updateInput) {
      set({ error: "Course ID and update data are required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.updateCourse(courseId, updateInput);

      // Refresh course details if we're viewing this course
      const { courseDetails } = get();
      if (courseDetails?._id === courseId) {
        get().fetchCourseDetails(courseId);
      }

      // Show success message
      Alert.alert("Success", "Course updated successfully");

      set({ isLoading: false });
      return data;
    } catch (err) {
      console.error(`Error updating course ${courseId}:`, err);

      let errorMsg = "Failed to update course";

      const error = err as ApolloError;
      if (error.graphQLErrors?.length) {
        errorMsg = error.graphQLErrors[0].message || "Validation error";
      }

      set({ error: errorMsg, isLoading: false });
      Alert.alert("Error", errorMsg);
      return null;
    }
  },

  // Set active category
  setActiveCategory: (category) => {
    set({ activeCategory: category });
    get().filterCoursesByCategory(category);
  },

  // Filter courses by category
  filterCoursesByCategory: (category) => {
    const { courses } = get();

    if (category === "All") {
      set({ filteredCourses: courses });
    } else {
      const filtered = courses.filter((course) => course.category === category);
      set({ filteredCourses: filtered });
    }
  },

  // Reset error state
  resetError: () => set({ error: null }),

  // ---------- COURSE PROGRESS METHODS ----------

  // Enroll in a course

  fetchCourseProgress: async (courseId) => {
    if (!courseId) {
      set({ error: "Course ID is required" });
      return null;
    }

    // Don't set isLoading to avoid UI flickering when called alongside other methods
    set({ error: null });

    try {
      // Use coursesService to check if user is enrolled
      const data = await coursesService.getCourseProgress(courseId);

      // If we got data, update the state
      if (data) {
        set({ currentProgress: data });

        // Calculate and update overall progress for courseDetails
        const { courseDetails } = get();
        if (courseDetails && courseDetails._id === courseId) {
          const progressPercentage = get().calculateOverallProgress(courseId);
          set({
            courseDetails: {
              ...courseDetails,
              userProgress: progressPercentage,
            },
          });
        }

        return data;
      } else {
        // If no data but no error thrown, user is likely not enrolled
        set({ currentProgress: null });
        return null;
      }
    } catch (err) {
      console.error("Error fetching course progress:", err);

      // Only set error for non-enrollment related issues
      const error = err as ApolloError;

      // Check if this is an enrollment-related error
      const isEnrollmentError =
        error.message?.includes("not enrolled") ||
        error.message?.includes("not found") ||
        error.networkError?.statusCode === 400;

      if (isEnrollmentError) {
        // Don't display error message for enrollment issues
        set({ currentProgress: null });
        return null;
      }

      // For other errors, update the error state
      set({
        error: "Failed to fetch course progress. Please try again.",
        currentProgress: null,
      });
      return null;
    }
  },

  // In courseStore.js (in the useCoursesStore)
  enrollInCourse: async (courseId) => {
    if (!courseId) {
      set({ error: "Course ID is required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      // Use coursesService to enroll
      const data = await coursesService.enrollInCourse(courseId);

      // After successful enrollment, immediately set currentProgress to reflect enrollment
      if (data) {
        // If we got back an actual progress object or an "already enrolled" indicator
        if (data.alreadyEnrolled) {
          // If already enrolled, fetch the actual progress
          await get().fetchCourseProgress(courseId);
        } else {
          // If newly enrolled, set the progress from the response
          set({ currentProgress: data });
        }

        set({ isLoading: false });
        return data;
      } else {
        set({
          error: "Enrollment failed. Please try again.",
          isLoading: false,
        });
        return null;
      }
    } catch (err) {
      console.error("Error enrolling in course:", err);
      let errorMsg = "Failed to enroll in course";

      const error = err as ApolloError;
      if (error.graphQLErrors?.length) {
        errorMsg = error.graphQLErrors[0].message || "Server error";
      } else if (error.networkError) {
        errorMsg = "Network error. Please check your connection.";
      }

      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  // Update video progress
  updateVideoProgress: async (
    courseId,
    videoId,
    watchedSeconds,
    completed = false
  ) => {
    if (!courseId || !videoId) {
      set({ error: "Course ID and Video ID are required" });
      return null;
    }

    // Don't set isLoading to avoid UI flickering during video playback
    set({ error: null });

    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_VIDEO_PROGRESS,
        variables: {
          input: {
            courseId,
            videoId,
            watchedSeconds,
            completed,
          },
        },
      });

      // Refresh course progress after update
      await get().fetchCourseProgress(courseId);

      return data.updateVideoProgress;
    } catch (err) {
      console.error("Error updating video progress:", err);

      // Don't show error alerts for progress updates to avoid disrupting playback
      set({ error: "Failed to update video progress" });
      return null;
    }
  },

  // Calculate overall course progress
  calculateOverallProgress: (courseId) => {
    const { currentProgress, courseDetails } = get();

    if (!currentProgress || !courseDetails || courseDetails._id !== courseId) {
      return 0;
    }

    // If no videos, return 0 or 100 based on completion status
    if (
      !courseDetails.courseVideos ||
      courseDetails.courseVideos.length === 0
    ) {
      return currentProgress.completed ? 100 : 0;
    }

    // Count completed videos
    const totalVideos = courseDetails.courseVideos.length;
    const completedVideos = currentProgress.videosProgress.filter(
      (progress) => progress.completed
    ).length;

    return Math.round((completedVideos / totalVideos) * 100);
  },
}));
