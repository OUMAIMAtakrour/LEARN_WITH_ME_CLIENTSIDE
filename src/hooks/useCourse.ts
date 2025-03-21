import { useState, useEffect, useCallback } from "react";
import { coursesService } from "../api/services/courseService";
import { Alert } from "react-native";

// Maximum number of automatic retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Improved fetch with retry logic
  const fetchAllCourses = useCallback(
    async (manualRetry = false) => {
      if (manualRetry) {
        setRetryCount(0); // Reset retry count on manual retry
      }

      setLoading(true);
      setError(null);

      try {
        // Add a small timeout to prevent rapid successive calls
        await new Promise((resolve) => setTimeout(resolve, 500));

        const data = await coursesService.getAllCourses();
        setCourses(data || []);
        setRetryCount(0); // Reset retry count on success
        return data;
      } catch (err) {
        console.error("Error fetching courses:", err);

        // Check if it's a 400 error (likely backend validation issue)
        const is400Error =
          err.message?.includes("400") || err.networkError?.statusCode === 400;

        // Determine if we should retry automatically
        const shouldAutoRetry = !is400Error && retryCount < MAX_RETRIES;

        if (shouldAutoRetry) {
          setRetryCount((prev) => prev + 1);

          // Schedule a retry after delay
          setTimeout(() => {
            console.log(
              `Auto-retrying fetch (${retryCount + 1}/${MAX_RETRIES})...`
            );
            fetchAllCourses();
          }, RETRY_DELAY);

          setError(
            `Network issue detected. Retrying... (${
              retryCount + 1
            }/${MAX_RETRIES})`
          );
        } else {
          // Format a more user-friendly error message
          let errorMsg = "Unable to load courses";

          if (is400Error) {
            errorMsg = "Invalid request. Please check your inputs.";
          } else if (err.networkError) {
            errorMsg =
              "Network connection issue. Please check your internet connection.";
          } else if (err.graphQLErrors?.length) {
            errorMsg =
              err.graphQLErrors[0].message || "Server validation error";
          }

          setError(errorMsg);
        }

        return [];
      } finally {
        if (retryCount === 0) {
          setLoading(false); // Only set loading to false if not in retry mode
        }
      }
    },
    [retryCount]
  );

  // Fetch course details with improved error handling
  const fetchCourseDetails = useCallback(async (courseId) => {
    if (!courseId) {
      setError("Invalid course ID");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await coursesService.getCourseDetails(courseId);
      setCourseDetails(data);
      return data;
    } catch (err) {
      console.error(`Error fetching course ${courseId}:`, err);

      // Format user-friendly error
      let errorMsg = `Couldn't load course details`;

      if (err.networkError) {
        errorMsg =
          "Network connection issue. Please check your internet connection.";
      } else if (err.graphQLErrors?.length) {
        errorMsg = err.graphQLErrors[0].message || "Server error";
      }

      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Other methods remain the same but with better error handling
  const fetchTeacherCourses = useCallback(async (teacherId) => {
    if (!teacherId) {
      setError("Invalid teacher ID");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await coursesService.getTeacherCourses(teacherId);
      setCourses(data || []);
      return data;
    } catch (err) {
      console.error(`Error fetching teacher ${teacherId} courses:`, err);
      setError("Failed to load teacher courses");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(
    async (courseInput, courseImage) => {
      if (!courseInput) {
        setError("Course data is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await coursesService.createCourse(
          courseInput,
          courseImage
        );

        // Refresh the courses list on success
        fetchAllCourses();

        // Show success message
        Alert.alert("Success", "Course created successfully");

        return data;
      } catch (err) {
        console.error("Error creating course:", err);

        let errorMsg = "Failed to create course";

        if (err.graphQLErrors?.length) {
          errorMsg = err.graphQLErrors[0].message || "Validation error";
        }

        setError(errorMsg);
        Alert.alert("Error", errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllCourses]
  );

  const updateCourse = useCallback(
    async (courseId, updateInput) => {
      if (!courseId || !updateInput) {
        setError("Course ID and update data are required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await coursesService.updateCourse(courseId, updateInput);

        // Refresh course details if we're viewing this course
        if (courseDetails?._id === courseId) {
          fetchCourseDetails(courseId);
        }

        // Show success message
        Alert.alert("Success", "Course updated successfully");

        return data;
      } catch (err) {
        console.error(`Error updating course ${courseId}:`, err);

        let errorMsg = "Failed to update course";

        if (err.graphQLErrors?.length) {
          errorMsg = err.graphQLErrors[0].message || "Validation error";
        }

        setError(errorMsg);
        Alert.alert("Error", errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [courseDetails, fetchCourseDetails]
  );

  // Load courses on mount with a small delay to prevent immediate loading on navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchAllCourses]);

  return {
    courses,
    courseDetails,
    loading,
    error,
    retryCount,
    fetchAllCourses,
    fetchCourseDetails,
    fetchTeacherCourses,
    createCourse,
    updateCourse,
  };
};
