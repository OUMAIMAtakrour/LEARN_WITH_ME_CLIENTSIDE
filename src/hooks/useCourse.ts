import { useState, useEffect, useCallback } from "react";
import { coursesService } from "../api/services/courseService";
import { Alert } from "react-native";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; 

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchAllCourses = useCallback(
    async (manualRetry = false) => {
      if (manualRetry) {
        setRetryCount(0); 
      }

      setLoading(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const data = await coursesService.getAllCourses();
        setCourses(data || []);
        setRetryCount(0); 
        return data;
      } catch (err) {
        console.error("Error fetching courses:", err);

        const is400Error =
          err.message?.includes("400") || err.networkError?.statusCode === 400;

        const shouldAutoRetry = !is400Error && retryCount < MAX_RETRIES;

        if (shouldAutoRetry) {
          setRetryCount((prev) => prev + 1);

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
          setLoading(false); 
        }
      }
    },
    [retryCount]
  );

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

        fetchAllCourses();

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

        if (courseDetails?._id === courseId) {
          fetchCourseDetails(courseId);
        }

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
