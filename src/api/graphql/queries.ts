import { apolloClient } from "../apollo";
import { gql } from "@apollo/client";

export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    courses {
      _id
      title
      description
      certified
      courseImageUrl
      courseImageKey
      createdAt
      updatedAt
      # Only include fields that exist in your GraphQL schema
      # If these nested fields work, keep them:
      courseVideos {
        title
        description
      }
      courseDocuments {
        title
        description
      }
      # Only include teacher if it works in your schema
      teacher {
        _id
      }
    }
  }
`;

export const GET_COURSE_DETAILS = gql`
  query GetCourseDetails($id: String!) {
    course(id: $id) {
      _id
      title
      description
      courseImageUrl
      courseImageKey
      category
      price
      rating
      students
      teacher {
        _id
        name
        profileImageUrl
      }
    }
  }
`;

export const GET_TEACHER_COURSES = gql`
  query GetTeacherCourses($teacherId: String!) {
    coursesByTeacher(teacherId: $teacherId) {
      _id
      title
      description
      courseImageUrl
      courseImageKey
      category
      price
      rating
      students
    }
  }
`;
