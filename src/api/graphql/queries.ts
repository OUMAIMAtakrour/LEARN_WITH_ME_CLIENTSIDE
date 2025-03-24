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

      courseVideos {
        title
        description
      }
      courseDocuments {
        title
        description
      }

      teacher {
        _id
        name
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

export const GET_COURSE_PROGRESS = gql`
  query GetUserCourseProgress($courseId: String!) {
    getUserCourseProgress(courseId: $courseId) {
      _id
      userId
      courseId
      completed
      completedAt
      videosProgress {
        videoId
        watchedSeconds
        completed
      }
      createdAt
      updatedAt
    }
  }
`;
