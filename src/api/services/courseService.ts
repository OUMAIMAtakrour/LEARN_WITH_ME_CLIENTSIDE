import { Course } from "../../types/auth";
import { apolloClient } from "../apollo";
import { CREATE_COURSE, UPDATE_COURSE } from "../graphql/mutation";
import {
  GET_ALL_COURSES,
  GET_COURSE_DETAILS,
  GET_TEACHER_COURSES,
} from "../graphql/queries";
import { gql } from "@apollo/client";

export const coursesService = {
  // Function specifically for getting courses without teacher data
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

  // Add stubs for other methods referenced in your store
  async createCourse(courseInput, courseImage) {
    // Implementation depends on your mutation
    console.log("Create course called with:", courseInput, courseImage);
    throw new Error("Not implemented");
  },

  async updateCourse(courseId, updateInput) {
    // Implementation depends on your mutation
    console.log("Update course called with:", courseId, updateInput);
    throw new Error("Not implemented");
  },
};
