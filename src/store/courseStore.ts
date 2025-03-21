import { create } from "zustand";
import { coursesService } from "../api/services/courseService";
import { ApolloError } from "@apollo/client";
import { Alert } from "react-native";

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

  // Actions
  fetchAllCourses: (manualRetry?: boolean) => Promise<Course[]>;
  fetchCourseDetails: (courseId: string) => Promise<Course | null>;
  fetchTeacherCourses: (teacherId: string) => Promise<Course[]>;
  createCourse: (courseInput: any, courseImage?: any) => Promise<Course | null>;
  updateCourse: (courseId: string, updateInput: any) => Promise<Course | null>;
  setActiveCategory: (category: string) => void;
  filterCoursesByCategory: (category: string) => void;
  resetError: () => void;
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
}));
