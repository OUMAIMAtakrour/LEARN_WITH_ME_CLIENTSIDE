import { create } from "zustand";
import { coursesService } from "../api/services/courseService";
import { ApolloError } from "@apollo/client";
import { Alert } from "react-native";
import { CourseProgress, VideoProgress } from "../types/auth";
import { ApolloClient } from "@apollo/client";
import { UPDATE_VIDEO_PROGRESS } from "../api/graphql/mutation";
import { apolloClient } from "../api/apollo";


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

  enrollInCourse: (courseId: string) => Promise<CourseProgress | null>;
  fetchCourseProgress: (courseId: string) => Promise<CourseProgress | null>;
  updateVideoProgress: (
    courseId: string,
    videoId: string,
    watchedSeconds: number,
    completed?: boolean
  ) => Promise<VideoProgress | null>;
  calculateOverallProgress: (courseId: string) => number;
  markCourseAsCompleted: (courseId: string) => Promise<CourseProgress | null>;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const data = await coursesService.getAllCoursesWithoutTeacherName();

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

      const is400Error =
        error.message?.includes("400") ||
        error.networkError?.statusCode === 400;

      const { retryCount } = get();
      const shouldAutoRetry = !is400Error && retryCount < MAX_RETRIES;

      if (shouldAutoRetry) {
        set((state) => ({ retryCount: state.retryCount + 1 }));

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

  fetchCourseDetails: async (courseId) => {
    if (!courseId) {
      set({ error: "Invalid course ID" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.getCourseDetails(courseId);
      set({ courseDetails: data, isLoading: false });

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

  createCourse: async (courseInput, courseImage) => {
    if (!courseInput) {
      set({ error: "Course data is required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.createCourse(courseInput, courseImage);

      get().fetchAllCourses();

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

  updateCourse: async (courseId, updateInput) => {
    if (!courseId || !updateInput) {
      set({ error: "Course ID and update data are required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.updateCourse(courseId, updateInput);

      const { courseDetails } = get();
      if (courseDetails?._id === courseId) {
        get().fetchCourseDetails(courseId);
      }

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

  setActiveCategory: (category) => {
    set({ activeCategory: category });
    get().filterCoursesByCategory(category);
  },

  filterCoursesByCategory: (category) => {
    const { courses } = get();

    if (category === "All") {
      set({ filteredCourses: courses });
    } else {
      const filtered = courses.filter((course) => course.category === category);
      set({ filteredCourses: filtered });
    }
  },

  resetError: () => set({ error: null }),



  fetchCourseProgress: async (courseId) => {
    if (!courseId) {
      set({ error: "Course ID is required" });
      return null;
    }

    set({ error: null });

    try {
      const data = await coursesService.getCourseProgress(courseId);

      if (data) {
        set({ currentProgress: data });

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
        set({ currentProgress: null });
        return null;
      }
    } catch (err) {
      console.error("Error fetching course progress:", err);

      const error = err as ApolloError;

      const isEnrollmentError =
        error.message?.includes("not enrolled") ||
        error.message?.includes("not found") ||
        error.networkError?.statusCode === 400;

      if (isEnrollmentError) {
        set({ currentProgress: null });
        return null;
      }

      set({
        error: "Failed to fetch course progress. Please try again.",
        currentProgress: null,
      });
      return null;
    }
  },

  enrollInCourse: async (courseId) => {
    if (!courseId) {
      set({ error: "Course ID is required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.enrollInCourse(courseId);

      if (data) {
        if (data.alreadyEnrolled) {
          await get().fetchCourseProgress(courseId);
        } else {
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

      await get().fetchCourseProgress(courseId);

      return data.updateVideoProgress;
    } catch (err) {
      console.error("Error updating video progress:", err);

      set({ error: "Failed to update video progress" });
      return null;
    }
  },

  calculateOverallProgress: (courseId) => {
    const { currentProgress, courseDetails } = get();

    if (!currentProgress || !courseDetails || courseDetails._id !== courseId) {
      return 0;
    }

    if (
      !courseDetails.courseVideos ||
      courseDetails.courseVideos.length === 0
    ) {
      return currentProgress.completed ? 100 : 0;
    }

    const totalVideos = courseDetails.courseVideos.length;
    const completedVideos = currentProgress.videosProgress.filter(
      (progress) => progress.completed
    ).length;

    return Math.round((completedVideos / totalVideos) * 100);
  },
  markCourseAsCompleted: async (courseId) => {
    if (!courseId) {
      set({ error: "Course ID is required" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await coursesService.markCourseAsCompleted(courseId);

      if (data) {
        set({
          currentProgress: data,
          isLoading: false,
        });

        Alert.alert("Congratulations!", "You've completed this course!");

        return data;
      } else {
        set({
          error: "Failed to mark course as completed. Please try again.",
          isLoading: false,
        });
        return null;
      }
    } catch (err) {
      console.error("Error marking course as completed:", err);
      let errorMsg = "Failed to complete course";

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
}));
