import { useAuthStore } from "../../store";
import { Course } from "../../types/auth";
import { apolloClient } from "../apollo";
import {
  CREATE_COURSE,
  ENROLL_IN_COURSE,
  MARK_COURSE_COMPLETE,
  UPDATE_COURSE,
} from "../graphql/mutation";
import {
  GET_ALL_COURSES,
  GET_COURSE_DETAILS,
  GET_COURSE_PROGRESS,
  GET_TEACHER_COURSES,
} from "../graphql/queries";
import { ApolloError, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const coursesService = {
  async getAllCoursesWithoutTeacherName() {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_COURSES,
        fetchPolicy: "network-only",
      });
      return data.courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  async getAllCourses() {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_COURSES,
        fetchPolicy: "network-only",
      });
      return data.courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  async getCourseDetails(courseId) {
    try {
      const { data } = await apolloClient.query({
        query: GET_COURSE_DETAILS,
        variables: { id: courseId },
        fetchPolicy: "network-only",
      });
      return data.course;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },

  async getTeacherCourses(teacherId) {
    try {
      const { data } = await apolloClient.query({
        query: GET_TEACHER_COURSES,
        variables: { teacherId },
        fetchPolicy: "network-only",
      });
      return data.coursesByTeacher;
    } catch (error) {
      console.error(`Error fetching courses for teacher ${teacherId}:`, error);
      throw error;
    }
  },

  async createCourse(courseInput, courseImage) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_COURSE,
        variables: {
          input: courseInput,
          file: courseImage,
        },
      });
      return data.createCourse;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  async updateCourse(courseId, updateInput) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_COURSE,
        variables: {
          id: courseId,
          input: updateInput,
        },
      });
      return data.updateCourse;
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  },

  async enrollInCourse(courseId) {
    try {
      const isEnrolled = await this.checkEnrollmentStatus(courseId);

      if (isEnrolled) {
        console.log("User is already enrolled in this course");
        return {
          alreadyEnrolled: true,
          _id: "existing",
          courseId,
          userId: jwtDecode(useAuthStore.getState().access_token).userId,
          completed: false,
        };
      }

      const { data } = await apolloClient.mutate({
        mutation: ENROLL_IN_COURSE,
        variables: {
          input: {
            courseId,
            userId: jwtDecode(useAuthStore.getState().access_token).userId,
          },
        },
        context: {
          headers: {
            authorization: `Bearer ${useAuthStore.getState().access_token}`,
          },
        },
      });


      return data.createCourseProgress;
    } catch (error) {
      console.error("Error enrolling in course:", error);

      if (
        error.message?.includes("already enrolled") ||
        error.message?.includes("duplicate key") ||
        error.message?.includes("duplicate entry")
      ) {
        return {
          alreadyEnrolled: true,
          _id: "existing",
          courseId,
          userId: jwtDecode(useAuthStore.getState().access_token).userId,
          completed: false,
        };
      }

      throw error;
    }
  },

  async checkEnrollmentStatus(courseId) {
    if (!courseId) return false;

    try {
      const { access_token } = useAuthStore.getState();
      if (!access_token) return false;

      const userId = jwtDecode(access_token).userId;

      const { data } = await apolloClient.query({
        query: gql`
          query IsEnrolled($courseId: String!) {
            isEnrolledInCourse(courseId: $courseId)
          }
        `,
        variables: { courseId },
        fetchPolicy: "network-only",
        context: {
          headers: { authorization: `Bearer ${access_token}` },
        },
      });

      return !!data.isEnrolledInCourse;
    } catch (error) {
      console.error("Error checking enrollment status:", error);

      if (error.message?.includes("already enrolled")) {
        return true;
      }

      return false;
    }
  },

  async getCourseProgress(courseId) {
    if (!courseId) {
      console.warn("No courseId provided to getCourseProgress");
      throw new Error("Course ID is required");
    }

    try {
      const { access_token } = useAuthStore.getState();

      const { data } = await apolloClient.query({
        query: GET_COURSE_PROGRESS,
        variables: { courseId }, 
        fetchPolicy: "network-only",
        context: {
          headers: { authorization: `Bearer ${access_token}` },
        },
      });

      return data.getUserCourseProgress; 
    } catch (error) {
      console.error("Error in getCourseProgress:", error);

      if (
        error.message?.includes("not enrolled") ||
        error.message?.includes("not found")
      ) {
        return null; 
      }

      throw error;
    }
  },
  async markCourseAsCompleted(courseId: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: MARK_COURSE_COMPLETE,
        variables: { courseId },
        context: {
          headers: {
            authorization: `Bearer ${useAuthStore.getState().access_token}`,
          },
        },
      });

      return data.markCourseAsCompleted;
    } catch (error) {
      console.error("Error marking course as completed:", error);
      throw error;
    }
  },
};
